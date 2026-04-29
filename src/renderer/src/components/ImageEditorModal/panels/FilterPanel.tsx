import React, { useEffect, useRef, useState } from 'react'
import { FILTER_PRESETS } from '@/lib/imageEditor'

interface FilterPanelProps {
  canvas: any
  mainImage: any
}

const FilterPanel: React.FC<FilterPanelProps> = ({ canvas, mainImage }) => {
  const [activeFilter, setActiveFilter] = useState('none')
  const thumbRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())

  // 渲染滤镜缩略图
  useEffect(() => {
    if (!mainImage) return

    const imgEl = (mainImage as any).getElement?.()
    if (!imgEl) return

    FILTER_PRESETS.forEach((preset) => {
      const thumbCanvas = thumbRefs.current.get(preset.id)
      if (!thumbCanvas) return

      const ctx = thumbCanvas.getContext('2d')
      if (!ctx) return

      const size = 60
      thumbCanvas.width = size
      thumbCanvas.height = size

      // 绘制缩略图
      const imgAspect = imgEl.width / imgEl.height
      let sx = 0, sy = 0, sw = imgEl.width, sh = imgEl.height
      if (imgAspect > 1) {
        sx = (imgEl.width - imgEl.height) / 2
        sw = imgEl.height
      } else {
        sy = (imgEl.height - imgEl.width) / 2
        sh = imgEl.width
      }

      ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, size, size)

      // 应用滤镜预览（使用 CSS filter 模拟）
      if (preset.id !== 'none') {
        const filterMap: Record<string, string> = {
          'mono': 'grayscale(100%)',
          'warm': 'saturate(130%) hue-rotate(10deg)',
          'cool': 'hue-rotate(-15deg)',
          'fade': 'saturate(60%) brightness(105%)',
          'sharpen': 'contrast(110%)',
          'sepia': 'sepia(100%)',
          'vignette': 'saturate(70%) brightness(90%)',
          'highKey': 'brightness(115%) contrast(90%)',
          'lowKey': 'brightness(85%) contrast(120%)',
        }
        ctx.filter = filterMap[preset.id] || 'none'
        ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, size, size)
        ctx.filter = 'none'
      }
    })
  }, [mainImage])

  const applyFilter = (presetId: string) => {
    if (!mainImage || !canvas) return

    const preset = FILTER_PRESETS.find((p) => p.id === presetId)
    if (!preset) return

    const filterArr = preset.createFilters()
    mainImage.set({ filters: filterArr })
    mainImage.applyFilters()
    canvas.renderAll()
    setActiveFilter(presetId)
  }

  return (
    <div className="p-3 space-y-3">
      <div className="text-sm font-medium text-gray-200">滤镜效果</div>
      <div className="grid grid-cols-5 gap-2">
        {FILTER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyFilter(preset.id)}
            className={`flex flex-col items-center gap-1 p-1 rounded transition-colors ${
              activeFilter === preset.id
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <canvas
              ref={(el) => {
                if (el) thumbRefs.current.set(preset.id, el)
              }}
              className="w-[60px] h-[60px] rounded"
            />
            <span className="text-xs text-gray-300">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default FilterPanel
