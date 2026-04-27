import { useState, useEffect, useRef } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { HistoryGroup } from './groups/HistoryGroup'
import { ClearFormatGroup } from './groups/ClearFormatGroup'
import { HeadingGroup } from './groups/HeadingGroup'
import { FontSizeGroup } from './groups/FontSizeGroup'
import { FontFamilyGroup } from './groups/FontFamilyGroup'
import { FormatGroup } from './groups/FormatGroup'
import { ColorGroup } from './groups/ColorGroup'
import { AlignGroup } from './groups/AlignGroup'
import { ListGroup } from './groups/ListGroup'
import { BlockGroup } from './groups/BlockGroup'
import { InsertGroup } from './groups/InsertGroup'
import { TableGridSelector } from './groups/TableGridSelector'
import { MoreMenuGroup } from './groups/MoreMenuGroup'

interface ToolbarProps {
  editor: Editor | null
}

/**
 * 折叠优先级（从右到左）：more → table → insert → block → list → align → color
 * 始终保留：history, clearFormat, heading, fontSize, fontFamily, format
 */
const FOLDABLE = ['more', 'table', 'insert', 'block', 'list', 'align', 'color'] as const

function Toolbar({ editor }: ToolbarProps): React.JSX.Element {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [foldCount, setFoldCount] = useState(0)

  useEffect(() => {
    const el = toolbarRef.current
    if (!el) return

    const measure = (): void => {
      // 容器可见宽度
      const containerW = el.clientWidth
      // 内容实际需要的宽度（临时取消滚动限制来测量）
      el.style.overflow = 'visible'
      el.style.width = ''
      const contentW = el.scrollWidth
      el.style.overflow = ''
      el.style.width = ''

      if (contentW <= containerW) {
        setFoldCount(0)
        return
      }

      // 计算需要折叠多少个组
      // 预留"更多"按钮宽度
      const MORE_BTN = 50
      const deficit = contentW - containerW + MORE_BTN

      // 逐个累加被折叠组的宽度，直到弥补缺口
      let accumulated = 0
      let count = 0
      const groupEls = el.querySelectorAll<HTMLElement>('[data-foldable]')
      // groupEls 顺序是从左到右：color, align, list, block, insert, table, more
      // 折叠从右到左，即从数组末尾开始
      for (let i = groupEls.length - 1; i >= 0; i--) {
        if (accumulated >= deficit) break
        accumulated += groupEls[i].offsetWidth
        count++
      }
      setFoldCount(count)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    // 双 rAF 确保首次布局完成
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure))

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  // 根据 foldCount 计算哪些组被折叠
  // FOLDABLE 顺序：more, table, insert, block, list, align, color（从右到左优先）
  // DOM 中渲染顺序：color, align, list, block, insert, table, more（从左到右）
  // foldCount=1 → 折叠 more；foldCount=2 → 折叠 more+table；以此类推
  const foldedSet = new Set<string>()
  for (let i = 0; i < foldCount && i < FOLDABLE.length; i++) {
    foldedSet.add(FOLDABLE[i])
  }

  const isFolded = (name: string): boolean => foldedSet.has(name)
  const hasFolded = foldCount > 0

  return (
    <div className="shrink-0 border-b border-border bg-background">
      <div
        ref={toolbarRef}
        className="flex items-center gap-1 overflow-x-auto px-2 py-1 scrollbar-none"
      >
        {/* ===== 始终显示 ===== */}
        <HistoryGroup editor={editor} />
        <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
        <ClearFormatGroup editor={editor} />
        <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
        <HeadingGroup editor={editor} />
        <FontSizeGroup editor={editor} />
        <FontFamilyGroup editor={editor} />
        <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
        <FormatGroup editor={editor} />
        <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />

        {/* ===== 可折叠组（从左到右渲染） ===== */}

        {/* color */}
        {!isFolded('color') && (
          <span data-foldable className="contents">
            <ColorGroup editor={editor} />
            <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
          </span>
        )}

        {/* align */}
        {!isFolded('align') && (
          <span data-foldable className="contents">
            <AlignGroup editor={editor} />
            <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
          </span>
        )}

        {/* list */}
        {!isFolded('list') && (
          <span data-foldable className="contents">
            <ListGroup editor={editor} />
            <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
          </span>
        )}

        {/* block */}
        {!isFolded('block') && (
          <span data-foldable className="contents">
            <BlockGroup editor={editor} />
            <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
          </span>
        )}

        {/* insert */}
        {!isFolded('insert') && (
          <span data-foldable className="contents">
            <InsertGroup editor={editor} />
          </span>
        )}

        {/* table */}
        {!isFolded('table') && (
          <span data-foldable className="contents">
            <TableGridSelector editor={editor} />
          </span>
        )}

        {/* more（行高/段间距/缩进） */}
        {!isFolded('more') && (
          <span data-foldable className="contents">
            <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
            <MoreMenuGroup editor={editor} />
          </span>
        )}

        {/* ===== "更多"溢出按钮 ===== */}
        {hasFolded && (
          <>
            <Separator orientation="vertical" className="mx-1 h-6 shrink-0" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto">
                {isFolded('color') && (
                  <>
                    <div className="flex items-center gap-1 px-2 py-1">
                      <ColorGroup editor={editor} />
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                {isFolded('align') && (
                  <>
                    <div className="flex items-center gap-1 px-2 py-1">
                      <AlignGroup editor={editor} />
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                {isFolded('list') && (
                  <>
                    <div className="flex items-center gap-1 px-2 py-1">
                      <ListGroup editor={editor} />
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                {isFolded('block') && (
                  <>
                    <div className="flex items-center gap-1 px-2 py-1">
                      <BlockGroup editor={editor} />
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                {isFolded('insert') && (
                  <>
                    <div className="flex items-center gap-1 px-2 py-1">
                      <InsertGroup editor={editor} />
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                {isFolded('table') && (
                  <>
                    <div className="flex items-center gap-1 px-2 py-1">
                      <TableGridSelector editor={editor} />
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                {isFolded('more') && (
                  <div className="px-2 py-1">
                    <MoreMenuGroup editor={editor} />
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  )
}

export { Toolbar }
