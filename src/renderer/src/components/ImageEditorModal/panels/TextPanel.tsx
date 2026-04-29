import React, { useState } from 'react'
import { IText } from 'fabric'
import { TEXT_PRESETS, FONT_FAMILIES, FONT_SIZES } from '@/lib/imageEditor'

interface TextPanelProps {
  canvas: any
}

const TextPanel: React.FC<TextPanelProps> = ({ canvas }) => {
  const [selectedFont, setSelectedFont] = useState(FONT_FAMILIES[0].value)
  const [selectedSize, setSelectedSize] = useState(36)

  if (!canvas) return null

  const addText = (text: string, fontSize: number, fontWeight: string = 'normal', fontStyle: string = 'normal') => {
    const center = canvas.getCenterPoint()
    const itext = new IText(text, {
      left: center.x,
      top: center.y,
      fontSize,
      fontFamily: selectedFont,
      fontWeight,
      fontStyle,
      fill: '#ffffff',
      originX: 'center',
      originY: 'center',
    })
    ;(itext as any).data = { type: 'text' }
    canvas.add(itext)
    canvas.setActiveObject(itext)
    canvas.renderAll()
  }

  const handleAddText = () => {
    addText('双击编辑', selectedSize)
  }

  const handlePreset = (preset: typeof TEXT_PRESETS[0]) => {
    addText(preset.name, preset.fontSize, preset.fontWeight, preset.fontStyle || 'normal')
  }

  return (
    <div className="p-3 space-y-4">
      <div className="text-sm font-medium text-gray-200">文字工具</div>

      {/* 添加文字按钮 */}
      <button
        onClick={handleAddText}
        className="w-full py-2.5 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
      >
        + 添加文字
      </button>

      {/* 快速预设 */}
      <div className="space-y-1.5">
        <div className="text-xs text-gray-400">快速插入</div>
        <div className="flex flex-wrap gap-1.5">
          {TEXT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePreset(preset)}
              className="px-3 py-1.5 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 字体选择 */}
      <div className="space-y-1.5">
        <div className="text-xs text-gray-400">字体</div>
        <select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          className="w-full px-2 py-1.5 rounded text-sm bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.id} value={f.value}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* 字号选择 */}
      <div className="space-y-1.5">
        <div className="text-xs text-gray-400">字号: {selectedSize}px</div>
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(Number(e.target.value))}
          className="w-full px-2 py-1.5 rounded text-sm bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}px
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default TextPanel
