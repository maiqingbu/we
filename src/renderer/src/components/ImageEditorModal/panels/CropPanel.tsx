import React, { useState, useEffect, useCallback } from 'react'
import { Rect, FabricImage } from 'fabric'
import { CROP_RATIOS } from '@/lib/imageEditor'

interface CropPanelProps {
  canvas: any
  mainImage: any
  onApply: () => void
  onCancel: () => void
}

const CropPanel: React.FC<CropPanelProps> = ({ canvas, mainImage, onApply, onCancel }) => {
  const [selectedRatio, setSelectedRatio] = useState('free')
  const [cropRect, setCropRect] = useState<any>(null)

  // 创建裁剪框
  const createCropOverlay = useCallback(() => {
    if (!canvas || !mainImage) return

    // 移除已有裁剪框
    const existing = canvas.getObjects().find((o: any) => o.data?.type === 'cropRect')
    if (existing) {
      canvas.remove(existing)
    }

    const imgLeft = mainImage.left || 0
    const imgTop = mainImage.top || 0
    const imgWidth = (mainImage.width || 0) * (mainImage.scaleX || 1)
    const imgHeight = (mainImage.height || 0) * (mainImage.scaleY || 1)

    let rectWidth = imgWidth * 0.8
    let rectHeight = imgHeight * 0.8

    // 按比例约束
    const ratioObj = CROP_RATIOS.find((r) => r.id === selectedRatio)
    if (ratioObj?.ratio) {
      const ratio = ratioObj.ratio
      if (rectWidth / rectHeight > ratio) {
        rectWidth = rectHeight * ratio
      } else {
        rectHeight = rectWidth / ratio
      }
    }

    const rect = new Rect({
      left: imgLeft + (imgWidth - rectWidth) / 2,
      top: imgTop + (imgHeight - rectHeight) / 2,
      width: rectWidth,
      height: rectHeight,
      fill: 'rgba(0, 0, 0, 0.3)',
      stroke: '#fff',
      strokeWidth: 2,
      strokeDashArray: [6, 3],
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
    })

    ;(rect as any).data = { type: 'cropRect' }
    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
    setCropRect(rect)
  }, [canvas, mainImage, selectedRatio])

  useEffect(() => {
    createCropOverlay()
    return () => {
      if (canvas) {
        const existing = canvas.getObjects().find((o: any) => o.data?.type === 'cropRect')
        if (existing) canvas.remove(existing)
        canvas.renderAll()
      }
    }
  }, [selectedRatio]) // eslint-disable-line react-hooks/exhaustive-deps

  // 确认裁剪
  const handleApply = () => {
    if (!canvas || !mainImage || !cropRect) return

    const rect = cropRect
    const scaleX = mainImage.scaleX || 1
    const scaleY = mainImage.scaleY || 1

    // 计算裁剪区域在原图上的坐标
    const cropLeft = ((rect.left || 0) - (mainImage.left || 0)) / scaleX
    const cropTop = ((rect.top || 0) - (mainImage.top || 0)) / scaleY
    const cropWidth = (rect.width || 0) / scaleX
    const cropHeight = (rect.height || 0) / scaleY

    // 移除裁剪框
    canvas.remove(rect)

    // 导出裁剪区域
    const exportCanvas = canvas.toCanvasElement({
      left: mainImage.left,
      top: mainImage.top,
      width: (mainImage.width || 0) * scaleX,
      height: (mainImage.height || 0) * scaleY,
    })

    // 创建裁剪后的 canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = cropWidth
    tempCanvas.height = cropHeight
    const ctx = tempCanvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(
        exportCanvas,
        cropLeft * scaleX,
        cropTop * scaleY,
        cropWidth * scaleX,
        cropHeight * scaleY,
        0,
        0,
        cropWidth,
        cropHeight
      )
    }

    // 用裁剪后的图片替换主图
    const dataUrl = tempCanvas.toDataURL('image/png')
    FabricImage.fromURL(dataUrl).then((newImg) => {
      const containerWidth = canvas.getWidth()
      const containerHeight = canvas.getHeight()
      const newScaleX = (containerWidth * 0.9) / (newImg.width || 1)
      const newScaleY = (containerHeight * 0.9) / (newImg.height || 1)
      const scale = Math.min(newScaleX, newScaleY, 1)

      newImg.set({
        scaleX: scale,
        scaleY: scale,
        left: (containerWidth - (newImg.width || 0) * scale) / 2,
        top: (containerHeight - (newImg.height || 0) * scale) / 2,
        selectable: false,
        evented: false,
      })
      ;(newImg as any).data = { type: 'mainImage' }

      canvas.remove(mainImage)
      canvas.add(newImg)
      canvas.renderAll()

      // 更新 mainImageRef（通过 data 标记找到）
      onApply()
    })
  }

  // 旋转90度（旋转裁剪框）
  const handleRotateCrop = () => {
    if (!cropRect) return
    const w = cropRect.width
    const h = cropRect.height
    cropRect.set({ width: h, height: w })
    canvas?.renderAll()
  }

  return (
    <div className="p-3 space-y-3">
      <div className="text-sm font-medium text-gray-200 mb-2">裁剪比例</div>
      <div className="flex flex-wrap gap-1.5">
        {CROP_RATIOS.map((ratio) => (
          <button
            key={ratio.id + ratio.name}
            onClick={() => setSelectedRatio(ratio.id)}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${
              selectedRatio === ratio.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {ratio.name}
          </button>
        ))}
      </div>

      <button
        onClick={handleRotateCrop}
        className="w-full py-1.5 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
      >
        旋转裁剪框 90°
      </button>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleApply}
          className="flex-1 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          确认裁剪
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  )
}

export default CropPanel
