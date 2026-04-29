import React, { useState } from 'react'
import { IText } from 'fabric'
import { STICKER_CATEGORIES } from '@/lib/imageEditor'

interface StickerPanelProps {
  canvas: any
}

const StickerPanel: React.FC<StickerPanelProps> = ({ canvas }) => {
  const [activeCategory, setActiveCategory] = useState(STICKER_CATEGORIES[0].id)

  if (!canvas) return null

  const currentCategory = STICKER_CATEGORIES.find((c) => c.id === activeCategory)

  const insertSticker = (emoji: string) => {
    const center = canvas.getCenterPoint()
    const text = new IText(emoji, {
      left: center.x,
      top: center.y,
      fontSize: 64,
      originX: 'center',
      originY: 'center',
    })
    ;(text as any).data = { type: 'sticker' }
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  return (
    <div className="p-3 space-y-3">
      <div className="text-sm font-medium text-gray-200">贴纸</div>

      {/* 分类 Tab */}
      <div className="flex flex-wrap gap-1">
        {STICKER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emoji 网格 */}
      {currentCategory && (
        <div className="grid grid-cols-5 gap-1.5">
          {currentCategory.items.map((emoji, i) => (
            <button
              key={i}
              onClick={() => insertSticker(emoji)}
              className="flex items-center justify-center w-10 h-10 rounded bg-gray-700 hover:bg-gray-600 transition-colors text-2xl"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default StickerPanel
