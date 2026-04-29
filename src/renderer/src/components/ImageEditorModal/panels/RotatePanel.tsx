import React, { useState, useRef } from 'react'

interface RotatePanelProps {
  canvas: any
  mainImage: any
}

const RotatePanel: React.FC<RotatePanelProps> = ({ canvas, mainImage }) => {
  const [angle, setAngle] = useState(0)
  const origCanvasSize = useRef<{ w: number; h: number } | null>(null)

  if (!canvas || !mainImage) return null

  // 根据旋转角度精确计算图片实际需要的画布尺寸
  const fitCanvasToImage = () => {
    if (!origCanvasSize.current) {
      origCanvasSize.current = { w: canvas.getWidth(), h: canvas.getHeight() }
    }

    const imgW = (mainImage.width || 0) * (mainImage.scaleX || 1)
    const imgH = (mainImage.height || 0) * (mainImage.scaleY || 1)
    const rad = ((mainImage.angle || 0) * Math.PI) / 180
    const cos = Math.abs(Math.cos(rad))
    const sin = Math.abs(Math.sin(rad))

    // 旋转后的包围盒尺寸
    const rotW = imgW * cos + imgH * sin
    const rotH = imgW * sin + imgH * cos

    const newW = Math.max(origCanvasSize.current.w, Math.ceil(rotW) + 40)
    const newH = Math.max(origCanvasSize.current.h, Math.ceil(rotH) + 40)

    canvas.setDimensions({ width: newW, height: newH })
    mainImage.set({ left: newW / 2, top: newH / 2 })
    canvas.renderAll()
  }

  const applyAngle = (newAngle: number) => {
    mainImage.set({
      originX: 'center',
      originY: 'center',
      angle: newAngle,
    })
    fitCanvasToImage()
    setAngle(newAngle)
  }

  const rotate = (deg: number) => {
    applyAngle(((mainImage.angle || 0) + deg) % 360)
  }

  const flipH = () => {
    mainImage.set({
      originX: 'center',
      originY: 'center',
      flipX: !mainImage.flipX,
    })
    fitCanvasToImage()
  }

  const flipV = () => {
    mainImage.set({
      originX: 'center',
      originY: 'center',
      flipY: !mainImage.flipY,
    })
    fitCanvasToImage()
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyAngle(parseInt(e.target.value, 10))
  }

  return (
    <div className="p-3 space-y-4">
      <div className="text-sm font-medium text-gray-200">旋转 / 翻转</div>

      {/* 旋转按钮 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => rotate(-90)}
          className="py-2 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          ↺ 逆时针 90°
        </button>
        <button
          onClick={() => rotate(90)}
          className="py-2 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          ↻ 顺时针 90°
        </button>
      </div>

      {/* 翻转按钮 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={flipH}
          className="py-2 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          ↔ 水平翻转
        </button>
        <button
          onClick={flipV}
          className="py-2 rounded text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          ↕ 垂直翻转
        </button>
      </div>

      {/* 任意角度滑动条 */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>任意角度</span>
          <span>{angle}°</span>
        </div>
        <input
          type="range"
          min={-180}
          max={180}
          value={angle}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>-180°</span>
          <span>+180°</span>
        </div>
      </div>
    </div>
  )
}

export default RotatePanel
