import { useState, useEffect, useRef } from 'react'
import { MoreHorizontal, Sparkles, Shrink, Expand, Palette, Globe, Keyboard, ChevronRight } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { useAIStore } from '@/components/AIBubbleMenu'
import { PROMPTS, RESTYLE_OPTIONS, TRANSLATE_OPTIONS } from '@/lib/ai/prompts'
import { createAIComplete } from '@/lib/ai'

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
  const [hasSelection, setHasSelection] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null)

  // Track selection changes to show/hide AI button
  useEffect(() => {
    if (!editor) return
    const update = () => {
      const { empty, from, to } = editor.state.selection
      if (!empty) {
        const text = editor.state.doc.textBetween(from, to, '')
        setHasSelection(text.length >= 5)
        if (text.length >= 5) {
          setSelectedText(text)
          setSelectionRange({ from, to })
        }
      } else {
        setHasSelection(false)
      }
    }
    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

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

        {/* AI button - show when text is selected (>= 5 chars) */}
        {hasSelection && <AIToolbarButton editor={editor} selectedText={selectedText} selectionRange={selectionRange} />}

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

// ── AI Toolbar Button ──

function AIToolbarButton({ editor, selectedText, selectionRange }: { editor: Editor; selectedText: string; selectionRange: { from: number; to: number } | null }): React.JSX.Element {
  const aiComplete = createAIComplete()
  const aiTextRef = useRef('')
  const cancelRef = useRef<(() => void) | null>(null)
  const { status, text, error, setStatus, setText, appendText, setError, setSelectionRange: setStoreRange, setLastAction, reset } = useAIStore()
  const [customOpen, setCustomOpen] = useState(false)
  const [customInstruction, setCustomInstruction] = useState('')

  const executeAction = async (actionType: string, actionParam?: string) => {
    if (!selectedText || selectedText.length < 5) return
    if (!selectionRange) return

    setStoreRange(selectionRange)
    setLastAction({ type: actionType, style: actionParam, lang: actionParam, instruction: actionParam } as any)
    setStatus('loading')
    setText('')
    aiTextRef.current = ''
    setError('')

    let systemPrompt = ''
    let userMessage = ''

    switch (actionType) {
      case 'polish':
        systemPrompt = PROMPTS.polish.system
        userMessage = PROMPTS.polish.buildUser(selectedText)
        break
      case 'shorten':
        systemPrompt = PROMPTS.shorten.system
        userMessage = PROMPTS.shorten.buildUser(selectedText)
        break
      case 'expand':
        systemPrompt = PROMPTS.expand.system
        userMessage = PROMPTS.expand.buildUser(selectedText)
        break
      case 'restyle':
        systemPrompt = PROMPTS.restyle.system(actionParam!)
        userMessage = PROMPTS.restyle.buildUser(selectedText)
        break
      case 'translate':
        systemPrompt = PROMPTS.translate.system(actionParam!)
        userMessage = PROMPTS.translate.buildUser(selectedText)
        break
      case 'custom':
        systemPrompt = PROMPTS.custom.system
        userMessage = PROMPTS.custom.buildUser(actionParam!, selectedText)
        break
    }

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      cancelRef.current?.()
      if (aiTextRef.current) setStatus('done')
      else { setStatus('error'); setError('请求超时（60秒），请重试') }
    }, 60000)

    try {
      setStatus('streaming')
      const request = aiComplete(
        useAIStore.getState().providerId,
        { messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }], temperature: 0.7, maxTokens: 2000, stream: true, signal: controller.signal },
        (chunk) => { aiTextRef.current += chunk; appendText(chunk) }
      )
      cancelRef.current = request.cancel
      await request.promise
      setStatus('done')
    } catch (e: unknown) {
      const err = e as Error
      if (err.message === 'PROVIDER_NOT_CONFIGURED') { setError('请先在设置中配置 AI'); setStatus('error') }
      else if (err.message === 'ABORTED') { if (aiTextRef.current) setStatus('done'); else { setStatus('error'); setError('已取消') } }
      else if (err.name === 'AbortError') { if (aiTextRef.current) setStatus('done'); else { setStatus('error'); setError('已取消') } }
      else { setStatus('error'); setError(err.message || '请求失败') }
    } finally { clearTimeout(timeout) }
  }

  const handleReplace = () => {
    const store = useAIStore.getState()
    if (!store.selectionRange || !store.text) return
    editor.chain().focus().insertContentAt(store.selectionRange, store.text).run()
    reset()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(useAIStore.getState().text)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex h-8 items-center gap-1 rounded-md bg-purple-600 px-2 text-xs font-medium text-white hover:bg-purple-700 transition-colors shrink-0 cursor-pointer">
            <Sparkles className="h-3.5 w-3.5" />
            AI
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem onClick={() => executeAction('polish')}>
            <Sparkles className="mr-2 h-4 w-4" /> 润色
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => executeAction('shorten')}>
            <Shrink className="mr-2 h-4 w-4" /> 缩写
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => executeAction('expand')}>
            <Expand className="mr-2 h-4 w-4" /> 扩写
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" /> 改风格
              <ChevronRight className="ml-auto h-3 w-3" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {RESTYLE_OPTIONS.map((opt) => (
                <DropdownMenuItem key={opt.id} onClick={() => executeAction('restyle', opt.label)}>{opt.label}</DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Globe className="mr-2 h-4 w-4" /> 翻译
              <ChevronRight className="ml-auto h-3 w-3" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {TRANSLATE_OPTIONS.map((opt) => (
                <DropdownMenuItem key={opt.id} onClick={() => executeAction('translate', opt.lang)}>{opt.label}</DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCustomOpen(true)}>
            <Keyboard className="mr-2 h-4 w-4" /> 自定义指令...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom instruction dialog */}
      {customOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20" onClick={() => setCustomOpen(false)}>
          <div className="w-72 rounded-lg border border-border bg-background p-3 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 text-sm font-medium">自定义指令</div>
            <input className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm" placeholder="例如：把这段改成更口语化的表达" value={customInstruction} onChange={(e) => setCustomInstruction(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && customInstruction.trim()) { setCustomOpen(false); executeAction('custom', customInstruction.trim()) } }} autoFocus />
            <div className="mt-2 flex justify-end">
              <Button size="sm" className="h-7 text-xs" disabled={!customInstruction.trim()} onClick={() => { setCustomOpen(false); executeAction('custom', customInstruction.trim()) }}>执行</Button>
            </div>
          </div>
        </div>
      )}

      {/* AI output panel */}
      {status !== 'idle' && (
        <div className="fixed bottom-16 left-1/2 z-[999] -translate-x-1/2">
          <div className="w-80 rounded-lg border border-border bg-background shadow-lg p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                {status === 'loading' && '准备中...'}
                {status === 'streaming' && 'AI 生成中...'}
                {status === 'done' && '生成完成'}
                {status === 'error' && '生成失败'}
              </span>
              {(status === 'loading' || status === 'streaming') && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => cancelRef.current?.()}>取消</Button>
              )}
            </div>
            <div className="mb-3 min-h-[60px] max-h-[200px] overflow-y-auto rounded-md bg-muted/50 p-2 text-sm whitespace-pre-wrap">
              {status === 'loading' && <span className="text-muted-foreground">加载中...</span>}
              {error && <span className="text-red-500">{error}</span>}
              {error === '请先在设置中配置 AI' && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => { reset(); window.dispatchEvent(new CustomEvent('open-settings')) }}>
                    打开设置
                  </Button>
                </div>
              )}
              {text && <span>{text}</span>}
              {status === 'streaming' && <span className="inline-block w-1.5 h-4 animate-pulse bg-foreground/50 ml-0.5" />}
            </div>
            {(status === 'done' || status === 'error') && (
              <div className="flex items-center gap-1.5">
                {status === 'done' && (
                  <>
                    <Button size="sm" className="h-7 gap-1 text-xs" onClick={handleReplace}>替换原文</Button>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleCopy}>复制</Button>
                  </>
                )}
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => { const a = useAIStore.getState().lastAction; if (a) executeAction(a.type, a.style || a.lang || a.instruction) }}>重试</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={reset}>✕</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
