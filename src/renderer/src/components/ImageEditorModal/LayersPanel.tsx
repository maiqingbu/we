import React, { useState, useEffect } from 'react'

interface LayersPanelProps {
  canvas: any
}

interface LayerInfo {
  id: string
  name: string
  visible: boolean
  locked: boolean
  object: any
}

const LayersPanel: React.FC<LayersPanelProps> = ({ canvas }) => {
  const [layers, setLayers] = useState<LayerInfo[]>([])

  const refreshLayers = () => {
    if (!canvas) return

    const objects = canvas.getObjects()
    const layerList: LayerInfo[] = []

    objects.forEach((obj: any, index: number) => {
      // 跳过主图
      if (obj.data?.type === 'mainImage') return

      let name = '未知对象'
      if (obj.data?.type === 'text') name = `文字 ${obj.text?.substring(0, 6) || ''}`
      else if (obj.data?.type === 'sticker') name = `贴纸 ${obj.text || ''}`
      else if (obj.data?.type === 'watermark') name = '水印'
      else if (obj.data?.type === 'cropRect') return // 跳过裁剪框
      else name = `图层 ${index}`

      layerList.push({
        id: String(index),
        name,
        visible: obj.visible !== false,
        locked: obj.selectable === false,
        object: obj,
      })
    })

    // 反转顺序，最上层在最前
    setLayers(layerList.reverse())
  }

  useEffect(() => {
    if (!canvas) return

    refreshLayers()

    const handler = () => refreshLayers()
    canvas.on('object:added', handler)
    canvas.on('object:removed', handler)
    canvas.on('object:modified', handler)

    return () => {
      canvas.off('object:added', handler)
      canvas.off('object:removed', handler)
      canvas.off('object:modified', handler)
    }
  }, [canvas]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleVisibility = (layer: LayerInfo) => {
    layer.object.set({ visible: !layer.visible })
    canvas.renderAll()
    refreshLayers()
  }

  const toggleLock = (layer: LayerInfo) => {
    const isLocked = !layer.locked
    layer.object.set({
      selectable: !isLocked,
      evented: !isLocked,
    })
    canvas.renderAll()
    refreshLayers()
  }

  const selectObject = (layer: LayerInfo) => {
    if (layer.locked) return
    canvas.setActiveObject(layer.object)
    canvas.renderAll()
  }

  const deleteObject = (layer: LayerInfo) => {
    canvas.remove(layer.object)
    canvas.renderAll()
    refreshLayers()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 text-sm font-medium text-gray-200 border-b border-gray-700">
        图层
      </div>
      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="px-3 py-4 text-xs text-gray-500 text-center">
            暂无图层
          </div>
        ) : (
          <div className="p-1">
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => selectObject(layer)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
                  canvas?.getActiveObject() === layer.object
                    ? 'bg-blue-600/30'
                    : 'hover:bg-gray-700'
                }`}
              >
                <span className="flex-1 text-xs text-gray-300 truncate">
                  {layer.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleVisibility(layer)
                  }}
                  className={`text-xs px-1 ${layer.visible ? 'text-gray-300' : 'text-gray-600'}`}
                  title={layer.visible ? '隐藏' : '显示'}
                >
                  {layer.visible ? '👁' : '🚫'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleLock(layer)
                  }}
                  className={`text-xs px-1 ${layer.locked ? 'text-yellow-400' : 'text-gray-300'}`}
                  title={layer.locked ? '解锁' : '锁定'}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteObject(layer)
                  }}
                  className="text-xs px-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LayersPanel
