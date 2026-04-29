/**
 * ColumnsContainer React NodeView 组件
 *
 * 这是最核心的视图组件，负责渲染分栏容器及其交互：
 * - Flex 容器布局，NodeViewContent 使用 display:contents 透明化
 * - 列分隔拖拽手柄（hover 变蓝，拖拽实时更新宽度，双击恢复等分）
 * - 网格布局特殊处理（CSS Grid）
 * - 嵌套深度检测（超过 2 层显示警告）
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { Editor } from '@tiptap/core'
import { getNestingDepth, updateColumnWidths, resetColumnWidths } from './columnsHelpers'

// ============================================================
// 类型定义
// ============================================================

interface ColumnsContainerViewProps {
  node: {
    attrs: {
      layout: string
      widths: number[]
      gap: number
    }
    childCount: number
  }
  updateAttributes: (attrs: Record<string, any>) => void
  editor: Editor
  getPos: () => number
  deleteNode: () => void
}

// ============================================================
// 常量
// ============================================================

/** 最小列宽百分比 */
const MIN_COLUMN_WIDTH = 10

/** 最大嵌套深度 */
const MAX_NESTING_DEPTH = 2

// ============================================================
// 拖拽手柄组件
// ============================================================

interface DragHandleProps {
  /** 手柄左侧列的索引 */
  leftIndex: number
  /** 当前宽度数组 */
  widths: number[]
  /** 容器位置 */
  containerPos: number
  /** 编辑器实例 */
  editor: Editor
  /** 容器 DOM 引用 */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** 宽度更新回调 */
  onWidthsChange: (widths: number[]) => void
  /** 手柄左边缘的百分比位置 */
  leftPercent: number
}

/** 列分隔拖拽手柄 */
function DragHandle({
  leftIndex,
  widths,
  containerPos,
  editor,
  containerRef,
  onWidthsChange,
  leftPercent,
}: DragHandleProps) {
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidths = useRef<number[]>([])
  const handleRef = useRef<HTMLDivElement>(null)

  /** 处理拖拽开始 */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()

      isDragging.current = true
      startX.current = e.clientX
      startWidths.current = [...widths]

      const handle = handleRef.current
      if (handle) {
        handle.setPointerCapture(e.pointerId)
      }

      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
    },
    [widths]
  )

  /** 处理拖拽移动 */
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const container = containerRef.current
      const containerWidth = container.offsetWidth
      if (containerWidth <= 0) return

      // 计算鼠标移动的像素差转换为百分比
      const deltaX = e.clientX - startX.current
      const deltaPercent = (deltaX / containerWidth) * 100

      const newWidths = [...startWidths.current]
      const leftIdx = leftIndex
      const rightIdx = leftIndex + 1

      // 计算新宽度，确保不低于最小值
      let newLeft = newWidths[leftIdx] + deltaPercent
      let newRight = newWidths[rightIdx] - deltaPercent

      // 限制最小宽度
      if (newLeft < MIN_COLUMN_WIDTH) {
        newRight -= MIN_COLUMN_WIDTH - newLeft
        newLeft = MIN_COLUMN_WIDTH
      }
      if (newRight < MIN_COLUMN_WIDTH) {
        newLeft -= MIN_COLUMN_WIDTH - newRight
        newRight = MIN_COLUMN_WIDTH
      }

      // 再次限制
      if (newLeft >= MIN_COLUMN_WIDTH && newRight >= MIN_COLUMN_WIDTH) {
        newWidths[leftIdx] = Math.round(newLeft * 100) / 100
        newWidths[rightIdx] = Math.round(newRight * 100) / 100

        // 确保总和为 100
        const sum = newWidths.reduce((a, b) => a + b, 0)
        newWidths[rightIdx] = Math.round((newWidths[rightIdx] + (100 - sum)) * 100) / 100

        onWidthsChange(newWidths)
      }
    },
    [leftIndex, containerRef, onWidthsChange]
  )

  /** 处理拖拽结束 */
  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)
  }, [handlePointerMove])

  /** 双击恢复等分 */
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      resetColumnWidths(editor, containerPos)
    },
    [editor, containerPos]
  )

  return (
    <div
      ref={handleRef}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      className="column-drag-handle"
      title="拖拽调整列宽，双击恢复等分"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${leftPercent}%`,
        transform: 'translateX(-50%)',
        width: '12px',
        cursor: 'col-resize',
        backgroundColor: 'transparent',
        transition: 'background-color 0.15s ease',
        zIndex: 10,
        borderRadius: '2px',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(59, 130, 246, 0.5)'
      }}
      onMouseLeave={(e) => {
        if (!isDragging.current) {
          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
        }
      }}
    />
  )
}

// ============================================================
// 主组件
// ============================================================

export function ColumnsContainerView({
  node,
  updateAttributes,
  editor,
  getPos,
  deleteNode,
}: ColumnsContainerViewProps) {
  const { layout, widths, gap } = node.attrs
  const containerRef = useRef<HTMLDivElement>(null)
  const [nestingDepth, setNestingDepth] = useState(0)
  const [showRatio, setShowRatio] = useState(false)

  // 计算嵌套深度
  useEffect(() => {
    const pos = getPos()
    if (pos !== undefined) {
      setNestingDepth(getNestingDepth(editor, pos))
    }
  }, [editor, getPos, node])

  /** 是否为网格布局 */
  const isGrid = layout.startsWith('grid')

  /** 网格列数 */
  const gridCols = isGrid
    ? layout === 'grid-3x3'
      ? 3
      : 2
    : 0

  /** 网格行数 */
  const gridRows = isGrid
    ? layout === 'grid-3x3'
      ? 3
      : 2
    : 0

  /** 宽度更新回调 */
  const handleWidthsChange = useCallback(
    (newWidths: number[]) => {
      const pos = getPos()
      if (pos !== undefined) {
        updateColumnWidths(editor, pos, newWidths)
      }
    },
    [editor, getPos]
  )

  /** 容器样式 */
  const containerStyle: React.CSSProperties = isGrid
    ? {
        display: 'grid',
        gridTemplateColumns: widths.map((w) => `${w}%`).join(' '),
        gap: `${gap}px`,
        margin: '1.5em 0',
        alignItems: 'flex-start',
      }
    : {
        display: 'flex',
        gap: `${gap}px`,
        margin: '1.5em 0',
        alignItems: 'flex-start',
      }

  /** 比例文本 */
  const ratioText = widths.map((w) => `${Math.round(w)}%`).join(' / ')

  return (
    <NodeViewWrapper className="columns-container-wrapper" style={{ position: 'relative' }}>
      {/* 嵌套深度警告 */}
      {nestingDepth > MAX_NESTING_DEPTH && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '8px',
          }}
        >
          分栏嵌套过深（当前 {nestingDepth} 层），建议不超过 {MAX_NESTING_DEPTH} 层，否则可能影响微信渲染效果。
        </div>
      )}

      {/* 拖拽时显示的比例提示 */}
      {showRatio && (
        <div
          style={{
            position: 'absolute',
            top: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1f2937',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {ratioText}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div
          ref={containerRef}
          className="columns-container"
          data-columns-container=""
          data-layout={layout}
          style={containerStyle}
          onMouseEnter={() => setShowRatio(true)}
          onMouseLeave={() => setShowRatio(false)}
        >
          {/* NodeViewContent 使用 display:contents，让 column 子节点直接成为 flex/grid item */}
          <NodeViewContent style={{ display: 'contents' }} />
        </div>

        {/* 拖拽手柄使用绝对定位，覆盖在容器上方，不参与 flex 布局 */}
        {!isGrid &&
          widths.length > 1 &&
          (() => {
            const gapHalf = gap / 2
            return Array.from({ length: widths.length - 1 }, (_, i) => {
              const left = widths.slice(0, i + 1).reduce((a, b) => a + b, 0) + gapHalf * (2 * i + 1)
              return (
                <DragHandle
                  key={`handle-${i}`}
                  leftIndex={i}
                  widths={widths}
                  containerPos={getPos()}
                  editor={editor}
                  containerRef={containerRef}
                  onWidthsChange={handleWidthsChange}
                  leftPercent={left}
                />
              )
            })
          })()}
      </div>
    </NodeViewWrapper>
  )
}

export default ColumnsContainerView
