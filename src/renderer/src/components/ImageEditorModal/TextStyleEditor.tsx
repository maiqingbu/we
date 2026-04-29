import React, { useEffect, useState } from 'react'
import { Shadow } from 'fabric'
import { FONT_FAMILIES, FONT_SIZES, COLOR_PRESETS } from '@/lib/imageEditor'

interface TextStyleEditorProps {
  canvas: any
  activeObject: any
}

const TextStyleEditor: React.FC<TextStyleEditorProps> = ({ canvas, activeObject }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'textbox')) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [activeObject])

  if (!visible || !activeObject || !canvas) return null

  const updateProp = (props: Record<string, any>) => {
    activeObject.set(props)
    canvas.renderAll()
    // 强制刷新
    setVisible(false)
    setTimeout(() => setVisible(true), 0)
  }

  const toggleBold = () => {
    const isBold = activeObject.fontWeight === 'bold'
    updateProp({ fontWeight: isBold ? 'normal' : 'bold' })
  }

  const toggleItalic = () => {
    const isItalic = activeObject.fontStyle === 'italic'
    updateProp({ fontStyle: isItalic ? 'normal' : 'italic' })
  }

  const toggleUnderline = () => {
    updateProp({ underline: !activeObject.underline })
  }

  const toggleLinethrough = () => {
    updateProp({ linethrough: !activeObject.linethrough })
  }

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateProp({ fontFamily: e.target.value })
  }

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateProp({ fontSize: Number(e.target.value) })
  }

  const handleColorChange = (color: string) => {
    updateProp({ fill: color })
  }

  const handleAlignChange = (align: string) => {
    updateProp({ textAlign: align })
  }

  const handleStroke = () => {
    const hasStroke = activeObject.stroke && activeObject.stroke !== ''
    updateProp({
      stroke: hasStroke ? '' : '#000000',
      strokeWidth: hasStroke ? 0 : 2,
    })
  }

  const handleShadow = () => {
    const hasShadow = !!activeObject.shadow
    updateProp({
      shadow: hasShadow
        ? null
        : new Shadow({ color: 'rgba(0,0,0,0.5)', blur: 4, offsetX: 2, offsetY: 2 }),
    })
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-[#2a2a2a] border border-gray-600 rounded-lg shadow-lg">
      {/* 字体选择 */}
      <select
        value={activeObject.fontFamily || ''}
        onChange={handleFontChange}
        className="h-7 px-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded focus:outline-none"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.id} value={f.value}>
            {f.name}
          </option>
        ))}
      </select>

      {/* 字号选择 */}
      <select
        value={activeObject.fontSize || 24}
        onChange={handleSizeChange}
        className="h-7 w-16 px-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded focus:outline-none"
      >
        {FONT_SIZES.filter((s) => s <= 120).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="w-px h-5 bg-gray-600" />

      {/* B / I / U / S */}
      <button
        onClick={toggleBold}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold ${
          activeObject.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
        title="加粗"
      >
        B
      </button>
      <button
        onClick={toggleItalic}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs italic ${
          activeObject.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
        title="斜体"
      >
        I
      </button>
      <button
        onClick={toggleUnderline}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs underline ${
          activeObject.underline ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
        title="下划线"
      >
        U
      </button>
      <button
        onClick={toggleLinethrough}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs line-through ${
          activeObject.linethrough ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
        title="删除线"
      >
        S
      </button>

      <div className="w-px h-5 bg-gray-600" />

      {/* 颜色选择 */}
      <div className="relative">
        <input
          type="color"
          value={activeObject.fill || '#ffffff'}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-gray-600 bg-transparent"
          title="文字颜色"
        />
      </div>

      <div className="w-px h-5 bg-gray-600" />

      {/* 描边 */}
      <button
        onClick={handleStroke}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs ${
          activeObject.stroke ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
        title="描边"
      >
        描
      </button>

      {/* 阴影 */}
      <button
        onClick={handleShadow}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs ${
          activeObject.shadow ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}
        title="阴影"
      >
        影
      </button>

      <div className="w-px h-5 bg-gray-600" />

      {/* 对齐 */}
      {(['left', 'center', 'right'] as const).map((align) => (
        <button
          key={align}
          onClick={() => handleAlignChange(align)}
          className={`w-7 h-7 flex items-center justify-center rounded text-xs ${
            activeObject.textAlign === align ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
          title={align === 'left' ? '左对齐' : align === 'center' ? '居中' : '右对齐'}
        >
          {align === 'left' ? '≡' : align === 'center' ? '☰' : '≡'}
        </button>
      ))}
    </div>
  )
}

export default TextStyleEditor
