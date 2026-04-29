import React from 'react'

interface ToolbarProps {
  tool: string
  onToolChange: (tool: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onExport: () => void
  onReplace: () => void
  onClose: () => void
}

const tools = [
  { id: 'select', label: '选择', icon: '↖' },
  { id: 'crop', label: '裁剪', icon: '✂' },
  { id: 'rotate', label: '旋转', icon: '↻' },
  { id: 'filter', label: '滤镜', icon: '✨' },
  { id: 'text', label: '文字', icon: 'Aa' },
  { id: 'sticker', label: '贴纸', icon: '😀' },
  { id: 'watermark', label: '水印', icon: '💧' },
  { id: 'adjust', label: '调整', icon: '🎨' },
]

const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  onReplace,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-gray-700">
      {/* 左侧工具按钮 */}
      <div className="flex items-center gap-1">
        {tools.map((t) => (
          <button
            key={t.id}
            title={t.label}
            onClick={() => onToolChange(t.id)}
            className={`flex items-center justify-center w-9 h-9 rounded text-sm transition-colors ${
              tool === t.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="text-base leading-none">{t.icon}</span>
          </button>
        ))}
      </div>

      {/* 右侧操作按钮 */}
      <div className="flex items-center gap-1">
        <button
          title="撤销 (Ctrl+Z)"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center justify-center w-9 h-9 rounded text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-base leading-none">↩</span>
        </button>
        <button
          title="重做 (Ctrl+Shift+Z)"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center justify-center w-9 h-9 rounded text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-base leading-none">↪</span>
        </button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        <button
          title="替换图片"
          onClick={onReplace}
          className="flex items-center justify-center h-9 px-3 rounded bg-gray-600 text-white text-sm hover:bg-gray-500 transition-colors"
        >
          🔄 替换
        </button>

        <button
          title="完成导出"
          onClick={onExport}
          className="flex items-center justify-center h-9 px-4 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
        >
          ✓ 完成
        </button>
        <button
          title="关闭"
          onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <span className="text-base leading-none">✕</span>
        </button>
      </div>
    </div>
  )
}

export default Toolbar
