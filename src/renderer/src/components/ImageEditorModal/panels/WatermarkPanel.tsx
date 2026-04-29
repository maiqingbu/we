import React, { useState } from 'react'
import { IText, FabricImage, Rect, Textbox, Shadow } from 'fabric'
import type { WatermarkMode } from '@/lib/imageEditor'

interface WatermarkPanelProps {
  canvas: any
  mainImage: any
}

const WatermarkPanel: React.FC<WatermarkPanelProps> = ({ canvas, mainImage }) => {
  const [mode, setMode] = useState<WatermarkMode>('text')

  // 文字水印参数
  const [wmText, setWmText] = useState('公众号名称')
  const [wmFontSize, setWmFontSize] = useState(20)
  const [wmColor, setWmColor] = useState('#ffffff')
  const [wmAngle, setWmAngle] = useState(-30)
  const [wmSpacing, setWmSpacing] = useState(150)
  const [wmOpacity, setWmOpacity] = useState(0.3)

  if (!canvas || !mainImage) return null

  // 文字水印：生成斜向重复文字
  const applyTextWatermark = () => {
    if (!wmText.trim()) return

    const imgWidth = (mainImage.width || 0) * (mainImage.scaleX || 1)
    const imgHeight = (mainImage.height || 0) * (mainImage.scaleY || 1)
    const imgLeft = mainImage.left || 0
    const imgTop = mainImage.top || 0

    // 创建一个 Group 来包含所有水印文字
    const group: any[] = []
    const radians = (wmAngle * Math.PI) / 180
    const diagonal = Math.sqrt(imgWidth * imgWidth + imgHeight * imgHeight)

    for (let y = -diagonal; y < diagonal; y += wmSpacing) {
      for (let x = -diagonal; x < diagonal; x += wmSpacing * 2) {
        const text = new IText(wmText, {
          left: imgLeft + x,
          top: imgTop + y,
          fontSize: wmFontSize,
          fill: wmColor,
          opacity: wmOpacity,
          angle: wmAngle,
          selectable: false,
          evented: false,
        })
        ;(text as any).data = { type: 'watermark' }
        group.push(text)
      }
    }

    group.forEach((obj) => canvas.add(obj))
    canvas.renderAll()
  }

  // 图片水印：上传图片放到右下角
  const applyImageWatermark = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const url = URL.createObjectURL(file)
      try {
        const img = await FabricImage.fromURL(url)
        const imgWidth = (mainImage.width || 0) * (mainImage.scaleX || 1)
        const imgHeight = (mainImage.height || 0) * (mainImage.scaleY || 1)
        const wmSize = Math.min(imgWidth, imgHeight) * 0.2

        const scale = wmSize / (img.width || 1)
        img.set({
          left: (mainImage.left || 0) + imgWidth - wmSize - 20,
          top: (mainImage.top || 0) + imgHeight - wmSize - 20,
          scaleX: scale,
          scaleY: scale,
          opacity: 0.8,
        })
        ;(img as any).data = { type: 'watermark' }
        canvas.add(img)
        canvas.renderAll()
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    input.click()
  }

  // 公众号水印：公众号名 + 二维码图组合
  const applyWechatWatermark = () => {
    const imgWidth = (mainImage.width || 0) * (mainImage.scaleX || 1)
    const imgHeight = (mainImage.height || 0) * (mainImage.scaleY || 1)
    const imgLeft = mainImage.left || 0
    const imgTop = mainImage.top || 0

    const cardWidth = 180
    const cardHeight = 60
    const padding = 15

    // 背景卡片
    const bg = new Rect({
      left: imgLeft + imgWidth - cardWidth - 20,
      top: imgTop + imgHeight - cardHeight - 20,
      width: cardWidth,
      height: cardHeight,
      fill: 'rgba(0, 0, 0, 0.5)',
      rx: 8,
      ry: 8,
      selectable: false,
      evented: false,
    })
    ;(bg as any).data = { type: 'watermark' }

    // 公众号名
    const nameText = new Textbox(wmText || '公众号名称', {
      left: imgLeft + imgWidth - cardWidth - 20 + padding,
      top: imgTop + imgHeight - cardHeight - 20 + 10,
      width: cardWidth - padding * 2 - 40,
      fontSize: 14,
      fill: '#ffffff',
      selectable: false,
      evented: false,
    })
    ;(nameText as any).data = { type: 'watermark' }

    // 提示文字
    const hintText = new Textbox('扫码关注', {
      left: imgLeft + imgWidth - cardWidth - 20 + padding,
      top: imgTop + imgHeight - cardHeight - 20 + 32,
      width: cardWidth - padding * 2 - 40,
      fontSize: 10,
      fill: '#cccccc',
      selectable: false,
      evented: false,
    })
    ;(hintText as any).data = { type: 'watermark' }

    // 二维码占位
    const qrPlaceholder = new Rect({
      left: imgLeft + imgWidth - 55,
      top: imgTop + imgHeight - cardHeight - 20 + 8,
      width: 40,
      height: 40,
      fill: '#ffffff',
      rx: 4,
      ry: 4,
      selectable: false,
      evented: false,
    })
    ;(qrPlaceholder as any).data = { type: 'watermark' }

    const qrText = new Textbox('QR', {
      left: imgLeft + imgWidth - 55,
      top: imgTop + imgHeight - cardHeight - 20 + 18,
      width: 40,
      fontSize: 12,
      fill: '#333333',
      textAlign: 'center',
      selectable: false,
      evented: false,
    })
    ;(qrText as any).data = { type: 'watermark' }

    canvas.add(bg, nameText, hintText, qrPlaceholder, qrText)
    canvas.renderAll()
  }

  return (
    <div className="p-3 space-y-3">
      <div className="text-sm font-medium text-gray-200">水印</div>

      {/* 模式 Tab */}
      <div className="flex gap-1">
        {([
          { id: 'text', name: '文字水印' },
          { id: 'image', name: '图片水印' },
          { id: 'wechat', name: '公众号水印' },
        ] as const).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-1.5 rounded text-xs transition-colors ${
              mode === m.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* 文字水印 */}
      {mode === 'text' && (
        <div className="space-y-3">
          <input
            type="text"
            value={wmText}
            onChange={(e) => setWmText(e.target.value)}
            placeholder="水印文字"
            className="w-full px-2 py-1.5 rounded text-sm bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>字号: {wmFontSize}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={wmFontSize}
              onChange={(e) => setWmFontSize(Number(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-400">颜色</div>
            <input
              type="color"
              value={wmColor}
              onChange={(e) => setWmColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer bg-transparent"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>角度: {wmAngle}°</span>
            </div>
            <input
              type="range"
              min={-90}
              max={90}
              value={wmAngle}
              onChange={(e) => setWmAngle(Number(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>间距: {wmSpacing}px</span>
            </div>
            <input
              type="range"
              min={80}
              max={300}
              value={wmSpacing}
              onChange={(e) => setWmSpacing(Number(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>透明度: {Math.round(wmOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(wmOpacity * 100)}
              onChange={(e) => setWmOpacity(Number(e.target.value) / 100)}
              className="w-full h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <button
            onClick={applyTextWatermark}
            className="w-full py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            应用文字水印
          </button>
        </div>
      )}

      {/* 图片水印 */}
      {mode === 'image' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">上传图片作为水印，将放置在右下角</p>
          <button
            onClick={applyImageWatermark}
            className="w-full py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            上传水印图片
          </button>
        </div>
      )}

      {/* 公众号水印 */}
      {mode === 'wechat' && (
        <div className="space-y-3">
          <input
            type="text"
            value={wmText}
            onChange={(e) => setWmText(e.target.value)}
            placeholder="公众号名称"
            className="w-full px-2 py-1.5 rounded text-sm bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400">将在右下角生成公众号名片卡片（二维码为占位）</p>
          <button
            onClick={applyWechatWatermark}
            className="w-full py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            应用公众号水印
          </button>
        </div>
      )}
    </div>
  )
}

export default WatermarkPanel
