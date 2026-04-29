import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { uploadManager, getUploader } from '@/lib/imageUpload'
import EditorCanvas from './Canvas'
import Toolbar from './Toolbar'
import LayersPanel from './LayersPanel'
import TextStyleEditor from './TextStyleEditor'
import CropPanel from './panels/CropPanel'
import RotatePanel from './panels/RotatePanel'
import FilterPanel from './panels/FilterPanel'
import TextPanel from './panels/TextPanel'
import StickerPanel from './panels/StickerPanel'
import WatermarkPanel from './panels/WatermarkPanel'
import AdjustPanel from './panels/AdjustPanel'
import type { ToolType } from '@/lib/imageEditor'

interface ImageEditorModalProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  imagePos: number
}

const MAX_HISTORY = 50

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  open,
  onClose,
  imageUrl,
  imagePos,
}) => {
  const [tool, setTool] = useState<ToolType>('select')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [activeObject, setActiveObject] = useState<any>(null)

  const fabricRef = useRef<any>(null)
  const mainImageRef = useRef<any>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef<number>(-1)
  const isUndoRedoRef = useRef(false)

  const editorInstance = useAppStore((s) => s.editorInstance)
  const configuredProviders = useAppStore((s) => s.configuredProviders)

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  // 保存历史状态
  const saveHistory = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || isUndoRedoRef.current) return

    const json = JSON.stringify(canvas.toJSON())
    // 如果当前不在最新位置，截断后面的历史
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    }
    historyRef.current.push(json)
    // 限制历史长度
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    }
    historyIndexRef.current = historyRef.current.length - 1
    setHasUnsavedChanges(true)
  }, [])

  // 撤销
  const handleUndo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || historyIndexRef.current <= 0) return

    isUndoRedoRef.current = true
    historyIndexRef.current--
    const json = historyRef.current[historyIndexRef.current]
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.renderAll()
      isUndoRedoRef.current = false
      // 重新标记主图
      canvas.getObjects().forEach((obj: any) => {
        if (obj.data?.type === 'mainImage') {
          mainImageRef.current = obj
        }
      })
    })
  }, [])

  // 重做
  const handleRedo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return

    isUndoRedoRef.current = true
    historyIndexRef.current++
    const json = historyRef.current[historyIndexRef.current]
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.renderAll()
      isUndoRedoRef.current = false
      canvas.getObjects().forEach((obj: any) => {
        if (obj.data?.type === 'mainImage') {
          mainImageRef.current = obj
        }
      })
    })
  }, [])

  // 画布就绪回调
  const handleCanvasReady = useCallback(
    (canvas: any, _img: any) => {
      // 保存初始状态
      const json = JSON.stringify(canvas.toJSON())
      historyRef.current = [json]
      historyIndexRef.current = 0

      // 监听对象修改，自动保存历史
      canvas.on('object:modified', () => {
        saveHistory()
      })
      canvas.on('object:added', () => {
        // 延迟保存，避免频繁触发
        setTimeout(() => saveHistory(), 100)
      })
      canvas.on('object:removed', () => {
        setTimeout(() => saveHistory(), 100)
      })

      // 监听选中对象变化
      canvas.on('selection:created', (e: any) => {
        setActiveObject(e.selected?.[0] || null)
      })
      canvas.on('selection:updated', (e: any) => {
        setActiveObject(e.selected?.[0] || null)
      })
      canvas.on('selection:cleared', () => {
        setActiveObject(null)
      })
    },
    [saveHistory]
  )

  // 快捷键
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey

      // Cmd+Z 撤销
      if (isMeta && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      }
      // Cmd+Shift+Z 重做
      if (isMeta && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        handleRedo()
      }
      // Cmd+Y 重做（备用）
      if (isMeta && e.key === 'y') {
        e.preventDefault()
        handleRedo()
      }
      // Delete 删除选中对象
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvas = fabricRef.current
        const active = canvas?.getActiveObject()
        if (active && active.data?.type !== 'mainImage') {
          canvas.remove(active)
          canvas.renderAll()
        }
      }
      // Esc 关闭
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          setShowCloseConfirm(true)
        } else {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handleUndo, handleRedo, hasUnsavedChanges, onClose])

  // 替换编辑器中匹配的图片 src
  const replaceImageInEditor = useCallback(
    (newUrl: string) => {
      if (!editorInstance) return false
      const { tr, doc } = editorInstance.state

      // 优先按文档位置查找（ProseMirror image 节点）
      if (imagePos > 0 && imagePos < doc.content.size) {
        const node = doc.nodeAt(imagePos)
        if (node && node.type.name === 'image') {
          tr.setNodeMarkup(imagePos, undefined, { ...node.attrs, src: newUrl })
          editorInstance.view.dispatch(tr)
          return true
        }
      }

      // 降级1：按 src 匹配 ProseMirror image 节点
      let replaced = false
      doc.descendants((node, pos) => {
        if (replaced) return false
        if (node.type.name === 'image' && node.attrs.src === imageUrl) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: newUrl })
          replaced = true
          return false
        }
        return true
      })
      if (replaced) {
        editorInstance.view.dispatch(tr)
        return true
      }

      // 降级2：模板块内的图片 — 修改 templateBlock 的 html 属性
      doc.descendants((node, pos) => {
        if (replaced) return false
        if (node.type.name === 'templateBlock' && node.attrs.html && typeof node.attrs.html === 'string') {
          const html: string = node.attrs.html
          if (html.includes(imageUrl)) {
            const newHtml = html.replace(imageUrl, newUrl)
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, html: newHtml })
            replaced = true
            return false
          }
        }
        return true
      })
      if (replaced) {
        editorInstance.view.dispatch(tr)
        return true
      }

      return false
    },
    [editorInstance, imageUrl, imagePos]
  )

  // 导出
  const handleExport = useCallback(async () => {
    const canvas = fabricRef.current
    if (!canvas) return

    try {
      // 临时去掉画布背景，导出透明 PNG
      const origBg = canvas.backgroundColor
      canvas.backgroundColor = 'transparent'
      canvas.renderAll()

      const mainImg = mainImageRef.current
      let dataUrl: string
      if (mainImg) {
        const bound = mainImg.getBoundingRect()
        dataUrl = canvas.toDataURL({
          format: 'png',
          multiplier: 2,
          left: bound.left,
          top: bound.top,
          width: bound.width,
          height: bound.height,
        })
      } else {
        dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 })
      }

      // 恢复画布背景
      canvas.backgroundColor = origBg
      canvas.renderAll()

      // 直接解码 base64 data URL（CSP 会阻止 fetch(data:) ）
      const base64 = dataUrl.split(',')[1]
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'image/png' })
      const file = new File([blob], `edited-image-${Date.now()}.png`, { type: 'image/png' })

      // 上传到图床
      let finalUrl: string = dataUrl
      if (configuredProviders.length > 0) {
        const providerId = configuredProviders[0].provider_id
        const provider = getUploader(providerId)
        if (provider) {
          try {
            const config = (await window.api?.imageHostGetConfig(providerId)) || {}
            finalUrl = await uploadManager.upload(
              file,
              `edited-${Date.now()}`,
              (f) => provider.upload(f, f.name, config).then((r) => r.url)
            )
          } catch {
            // 上传失败时降级使用 data URL
          }
        }
      }

      // 替换编辑器中的图片
      const replaced = replaceImageInEditor(finalUrl)
      if (!replaced) {
        // 最终降级：直接用 data URL 再试一次
        replaceImageInEditor(dataUrl)
      }

      setHasUnsavedChanges(false)
      onClose()
    } catch (err) {
      console.error('[ImageEditor] 导出失败:', err)
    }
  }, [fabricRef, configuredProviders, replaceImageInEditor, onClose, editorInstance, imageUrl, imagePos])

  // 替换图片：打开文件选择器，直接替换编辑器中的图片
  const handleReplace = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const replaced = replaceImageInEditor(dataUrl)
        if (replaced) {
          setHasUnsavedChanges(false)
          onClose()
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [replaceImageInEditor, onClose])

  // 关闭确认
  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowCloseConfirm(true)
    } else {
      onClose()
    }
  }

  const confirmClose = () => {
    setShowCloseConfirm(false)
    onClose()
  }

  const cancelClose = () => {
    setShowCloseConfirm(false)
  }

  // 裁剪面板回调
  const handleCropApply = () => {
    // 裁剪完成后更新 mainImageRef
    const canvas = fabricRef.current
    if (canvas) {
      const mainImg = canvas.getObjects().find((o: any) => o.data?.type === 'mainImage')
      if (mainImg) mainImageRef.current = mainImg
    }
    setTool('select')
    saveHistory()
  }

  const handleCropCancel = () => {
    // 移除裁剪框
    const canvas = fabricRef.current
    if (canvas) {
      const cropRect = canvas.getObjects().find((o: any) => o.data?.type === 'cropRect')
      if (cropRect) {
        canvas.remove(cropRect)
        canvas.renderAll()
      }
    }
    setTool('select')
  }

  // 渲染底部工具面板
  const renderBottomPanel = () => {
    const canvas = fabricRef.current
    const mainImage = mainImageRef.current

    switch (tool) {
      case 'crop':
        return (
          <CropPanel
            canvas={canvas}
            mainImage={mainImage}
            onApply={handleCropApply}
            onCancel={handleCropCancel}
          />
        )
      case 'rotate':
        return <RotatePanel canvas={canvas} mainImage={mainImage} />
      case 'filter':
        return <FilterPanel canvas={canvas} mainImage={mainImage} />
      case 'text':
        return <TextPanel canvas={canvas} />
      case 'sticker':
        return <StickerPanel canvas={canvas} />
      case 'watermark':
        return <WatermarkPanel canvas={canvas} mainImage={mainImage} />
      case 'adjust':
        return <AdjustPanel canvas={canvas} mainImage={mainImage} />
      default:
        return (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            选择左侧工具开始编辑
          </div>
        )
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
      {/* 关闭确认弹窗 */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-sm mx-4 shadow-xl border border-gray-600">
            <h3 className="text-lg font-medium text-white mb-2">确认关闭</h3>
            <p className="text-sm text-gray-300 mb-4">
              当前有未保存的修改，确定要关闭吗？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelClose}
                className="px-4 py-2 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmClose}
                className="px-4 py-2 rounded text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                确认关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主编辑器 - 全屏 */}
      <div className="flex flex-col w-full h-full bg-[#1a1a1a] overflow-hidden">
        {/* 顶部工具栏 */}
        <Toolbar
          tool={tool}
          onToolChange={(t) => setTool(t as ToolType)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onExport={handleExport}
          onReplace={handleReplace}
          onClose={handleClose}
        />

        {/* 主体区域：画布 + 图层面板 */}
        <div className="flex flex-1 min-h-0">
          {/* 中间画布区域 */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 文字样式浮动工具栏 */}
            {activeObject && (
              <div className="flex justify-center py-1 bg-[#1a1a1a]">
                <TextStyleEditor canvas={fabricRef.current} activeObject={activeObject} />
              </div>
            )}

            {/* 画布 */}
            <div className="flex-1 relative overflow-hidden">
              <EditorCanvas
                imageUrl={imageUrl}
                fabricRef={fabricRef}
                mainImageRef={mainImageRef}
                onReady={handleCanvasReady}
              />
            </div>

            {/* 底部工具面板 */}
            <div className="h-[220px] border-t border-gray-700 bg-[#1e1e1e] overflow-y-auto">
              {renderBottomPanel()}
            </div>
          </div>

          {/* 右侧图层面板 */}
          <div className="w-[200px] border-l border-gray-700 bg-[#1e1e1e]">
            <LayersPanel canvas={fabricRef.current} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageEditorModal
