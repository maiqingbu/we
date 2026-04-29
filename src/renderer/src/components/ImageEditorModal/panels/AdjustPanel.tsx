import React, { useState, useCallback } from 'react'
import { filters } from 'fabric'

interface AdjustPanelProps {
  canvas: any
  mainImage: any
}

const AdjustPanel: React.FC<AdjustPanelProps> = ({ canvas, mainImage }) => {
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [saturation, setSaturation] = useState(0)

  const applyAdjustments = useCallback(() => {
    if (!mainImage || !canvas) return

    const filterArr: any[] = []

    if (brightness !== 0) {
      filterArr.push(new filters.Brightness({ brightness }))
    }
    if (contrast !== 0) {
      filterArr.push(new filters.Contrast({ contrast }))
    }
    if (saturation !== 0) {
      filterArr.push(new filters.Saturation({ saturation }))
    }

    mainImage.set({ filters: filterArr })
    mainImage.applyFilters()
    canvas.renderAll()
  }, [canvas, mainImage, brightness, contrast, saturation])

  // 实时预览：滑动时直接应用
  const handleBrightnessChange = (val: number) => {
    setBrightness(val)
  }

  const handleContrastChange = (val: number) => {
    setContrast(val)
  }

  const handleSaturationChange = (val: number) => {
    setSaturation(val)
  }

  // 使用 useEffect 实现实时预览
  React.useEffect(() => {
    applyAdjustments()
  }, [brightness, contrast, saturation, applyAdjustments])

  const resetAll = () => {
    setBrightness(0)
    setContrast(0)
    setSaturation(0)
  }

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-200">图像调整</div>
        <button
          onClick={resetAll}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          重置
        </button>
      </div>

      {/* 亮度 */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>亮度</span>
          <span>{brightness > 0 ? '+' : ''}{brightness.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          value={Math.round(brightness * 100)}
          onChange={(e) => handleBrightnessChange(Number(e.target.value) / 100)}
          className="w-full h-1.5 bg-gray-600 rounded appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* 对比度 */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>对比度</span>
          <span>{contrast > 0 ? '+' : ''}{contrast.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          value={Math.round(contrast * 100)}
          onChange={(e) => handleContrastChange(Number(e.target.value) / 100)}
          className="w-full h-1.5 bg-gray-600 rounded appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* 饱和度 */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>饱和度</span>
          <span>{saturation > 0 ? '+' : ''}{saturation.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          value={Math.round(saturation * 100)}
          onChange={(e) => handleSaturationChange(Number(e.target.value) / 100)}
          className="w-full h-1.5 bg-gray-600 rounded appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  )
}

export default AdjustPanel
