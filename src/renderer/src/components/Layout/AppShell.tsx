import { useState, useCallback, useRef, useEffect } from 'react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { EditorPane } from './EditorPane'
import { PreviewPane } from './PreviewPane'

function AppShell(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftWidth, setLeftWidth] = useState(240)
  const [rightWidth, setRightWidth] = useState(420)
  const dragging = useRef<'left' | 'right' | null>(null)
  const startX = useRef(0)
  const startLeft = useRef(0)
  const startRight = useRef(0)

  const onMouseDown = useCallback(
    (handle: 'left' | 'right', e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = handle
      startX.current = e.clientX
      startLeft.current = leftWidth
      startRight.current = rightWidth
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [leftWidth, rightWidth]
  )

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - startX.current
      const container = containerRef.current
      if (!container) return
      const totalWidth = container.offsetWidth
      const minLeft = Math.max(totalWidth * 0.12, 150)
      const maxLeft = totalWidth * 0.35
      const minRight = Math.max(totalWidth * 0.15, 200)
      const maxRight = totalWidth * 0.45

      if (dragging.current === 'left') {
        const newLeft = Math.min(maxLeft, Math.max(minLeft, startLeft.current + dx))
        setLeftWidth(newLeft)
      } else if (dragging.current === 'right') {
        const newRight = Math.min(maxRight, Math.max(minRight, startRight.current - dx))
        setRightWidth(newRight)
      }
    }

    const onMouseUp = () => {
      if (dragging.current) {
        dragging.current = null
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <TopBar />
      <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="h-full shrink-0 overflow-hidden" style={{ width: leftWidth }}>
          <Sidebar />
        </div>

        {/* Left Resize Handle */}
        <div
          className="w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-blue-400/50 active:bg-blue-500/70"
          onMouseDown={(e) => onMouseDown('left', e)}
        />

        {/* Center Editor */}
        <div className="min-w-0 h-full flex-1 overflow-hidden">
          <EditorPane />
        </div>

        {/* Right Resize Handle */}
        <div
          className="w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-blue-400/50 active:bg-blue-500/70"
          onMouseDown={(e) => onMouseDown('right', e)}
        />

        {/* Right Preview */}
        <div className="h-full shrink-0 overflow-hidden" style={{ width: rightWidth }}>
          <PreviewPane />
        </div>
      </div>
    </div>
  )
}

export { AppShell }
