/**
 * ColumnsToolbar - 分栏容器选中时的浮动工具栏
 *
 * 功能按钮：
 * - [+加左列] [+加右列] [x删当前列] [重置列宽]
 * - [切换布局] [移动端预览] [删除整个分栏]
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Editor } from '@tiptap/core'
import {
  findColumnsContainer,
  getColumnCount,
  addColumn,
  removeColumn,
  resetColumnWidths,
} from './columnsHelpers'
import { COLUMN_PRESETS, type ColumnPreset } from '@/lib/materials/columns'

// ============================================================
// 类型定义
// ============================================================

interface ColumnsToolbarProps {
  editor: Editor
}

// ============================================================
// 工具栏按钮组件
// ============================================================

interface ToolbarButtonProps {
  title: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
  danger?: boolean
}

/** 工具栏按钮 */
function ToolbarButton({ title, disabled, onClick, children, danger }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: disabled ? 'transparent' : danger ? '#fef2f2' : 'transparent',
        color: disabled ? '#d1d5db' : danger ? '#dc2626' : '#374151',
        fontSize: '14px',
        transition: 'background-color 0.15s',
        padding: 0,
        lineHeight: 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = danger
            ? '#fee2e2'
            : '#f3f4f6'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = disabled
          ? 'transparent'
          : danger
            ? '#fef2f2'
            : 'transparent'
      }}
    >
      {children}
    </button>
  )
}

/** 分隔线 */
function ToolbarSeparator() {
  return (
    <div
      style={{
        width: '1px',
        height: '20px',
        backgroundColor: '#e5e7eb',
        margin: '0 4px',
        flexShrink: 0,
      }}
    />
  )
}

// ============================================================
// 布局切换下拉菜单
// ============================================================

interface LayoutSwitcherProps {
  currentLayout: string
  currentColCount: number
  onSwitch: (preset: ColumnPreset) => void
}

/** 布局切换下拉菜单 */
function LayoutSwitcher({ currentLayout, currentColCount, onSwitch }: LayoutSwitcherProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 获取同列数的其他预设
  const availablePresets = useMemo(() => {
    return COLUMN_PRESETS.filter((p) => {
      // 网格布局的列数由 widths 决定
      if (p.layout.startsWith('grid')) {
        return p.widths.length === currentColCount
      }
      return p.widths.length === currentColCount
    })
  }, [currentColCount])

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (availablePresets.length <= 1) return null

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <ToolbarButton
        title="切换布局"
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </ToolbarButton>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '4px',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '4px',
            minWidth: '160px',
            zIndex: 50,
          }}
        >
          {availablePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSwitch(preset)
                setOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 8px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor:
                  preset.layout === currentLayout ? '#eff6ff' : 'transparent',
                color: '#374151',
                fontSize: '13px',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (preset.layout !== currentLayout) {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb'
                }
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  preset.layout === currentLayout ? '#eff6ff' : 'transparent'
              }}
            >
              <span style={{ fontSize: '12px', width: '24px', textAlign: 'center' }}>
                {preset.icon}
              </span>
              <span>{preset.name}</span>
              {preset.layout === currentLayout && (
                <span
                  style={{
                    marginLeft: 'auto',
                    color: '#3b82f6',
                    fontSize: '11px',
                  }}
                >
                  当前
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// 移动端预览弹窗
// ============================================================

interface MobilePreviewProps {
  editor: Editor
  onClose: () => void
}

/** 移动端预览弹窗 */
function MobilePreview({ editor, onClose }: MobilePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewHtml, setPreviewHtml] = useState('')

  useEffect(() => {
    // 获取编辑器 HTML
    const html = editor.getHTML()
    setPreviewHtml(html)
  }, [editor])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '375px',
          maxHeight: '80vh',
          backgroundColor: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
            移动端预览 (375px)
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              fontSize: '18px',
              padding: '2px',
            }}
          >
            x
          </button>
        </div>

        {/* 预览内容 */}
        <div
          ref={previewRef}
          style={{
            padding: '16px',
            maxHeight: 'calc(80vh - 48px)',
            overflowY: 'auto',
            fontSize: '15px',
            lineHeight: 1.75,
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  )
}

// ============================================================
// 主工具栏组件
// ============================================================

export function ColumnsToolbar({ editor }: ColumnsToolbarProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [containerInfo, setContainerInfo] = useState<{
    pos: number
    layout: string
    colCount: number
  } | null>(null)

  // 获取当前容器信息
  useEffect(() => {
    const updateInfo = () => {
      const { from } = editor.state.selection
      const container = findColumnsContainer(editor, from)
      if (container) {
        setContainerInfo({
          pos: container.containerPos,
          layout: container.node.attrs.layout,
          colCount: container.node.childCount,
        })
      } else {
        setContainerInfo(null)
      }
    }

    updateInfo()

    // 监听选区变化和事务
    editor.on('selectionUpdate', updateInfo)
    editor.on('transaction', updateInfo)

    return () => {
      editor.off('selectionUpdate', updateInfo)
      editor.off('transaction', updateInfo)
    }
  }, [editor])

  /** 获取当前选区位置 */
  const getCurrentPos = useCallback(() => {
    return editor.state.selection.from
  }, [editor])

  /** 添加左列 */
  const handleAddLeft = useCallback(() => {
    addColumn(editor, getCurrentPos(), 'left')
  }, [editor, getCurrentPos])

  /** 添加右列 */
  const handleAddRight = useCallback(() => {
    addColumn(editor, getCurrentPos(), 'right')
  }, [editor, getCurrentPos])

  /** 删除当前列 */
  const handleRemoveColumn = useCallback(() => {
    removeColumn(editor, getCurrentPos())
  }, [editor, getCurrentPos])

  /** 重置列宽 */
  const handleResetWidths = useCallback(() => {
    resetColumnWidths(editor, getCurrentPos())
  }, [editor, getCurrentPos])

  /** 删除整个分栏 */
  const handleDeleteContainer = useCallback(() => {
    editor.commands.deleteColumnsContainer()
  }, [editor])

  /** 切换布局 */
  const handleSwitchLayout = useCallback(
    (preset: ColumnPreset) => {
      const pos = getCurrentPos()
      const container = findColumnsContainer(editor, pos)
      if (!container) return

      const { node, containerPos } = container
      const tr = editor.state.tr

      // 更新容器的 layout 和 widths
      tr.setNodeMarkup(containerPos, undefined, {
        ...node.attrs,
        layout: preset.layout,
        widths: preset.widths,
      })

      // 更新每个 column 的 width
      let childPos = containerPos + 1
      for (let i = 0; i < Math.min(preset.widths.length, node.childCount); i++) {
        const child = node.child(i)
        tr.setNodeMarkup(childPos, undefined, {
          ...child.attrs,
          width: preset.widths[i],
        })
        childPos += child.nodeSize
      }

      editor.view.dispatch(tr)
    },
    [editor, getCurrentPos]
  )

  // 如果不在 columnsContainer 内，不渲染
  if (!containerInfo) return null

  const { colCount } = containerInfo
  const canRemove = colCount > 1
  const canAdd = colCount < 6

  return (
    <>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
          padding: '4px 6px',
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* 添加左列 */}
        <ToolbarButton
          title="在左侧添加列"
          disabled={!canAdd}
          onClick={handleAddLeft}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="12" y2="12" />
          </svg>
        </ToolbarButton>

        {/* 添加右列 */}
        <ToolbarButton
          title="在右侧添加列"
          disabled={!canAdd}
          onClick={handleAddRight}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="12" y1="12" x2="16" y2="12" />
          </svg>
        </ToolbarButton>

        {/* 删除当前列 */}
        <ToolbarButton
          title="删除当前列"
          disabled={!canRemove}
          onClick={handleRemoveColumn}
          danger
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="8" y1="8" x2="16" y2="16" />
            <line x1="16" y1="8" x2="8" y2="16" />
          </svg>
        </ToolbarButton>

        {/* 重置列宽 */}
        <ToolbarButton title="重置为等分列宽" onClick={handleResetWidths}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </ToolbarButton>

        <ToolbarSeparator />

        {/* 切换布局 */}
        <LayoutSwitcher
          currentLayout={containerInfo.layout}
          currentColCount={colCount}
          onSwitch={handleSwitchLayout}
        />

        {/* 移动端预览 */}
        <ToolbarButton
          title="移动端预览 (375px)"
          onClick={() => setShowPreview(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </ToolbarButton>

        <ToolbarSeparator />

        {/* 删除整个分栏 */}
        <ToolbarButton
          title="删除整个分栏"
          onClick={handleDeleteContainer}
          danger
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </ToolbarButton>
      </div>

      {/* 移动端预览弹窗 */}
      {showPreview && (
        <MobilePreview editor={editor} onClose={() => setShowPreview(false)} />
      )}
    </>
  )
}

export default ColumnsToolbar
