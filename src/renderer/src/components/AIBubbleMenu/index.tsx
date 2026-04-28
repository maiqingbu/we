import { useState, useCallback, useRef, useEffect } from 'react'
import { create } from 'zustand'
import { Sparkles, Shrink, Expand, Palette, Globe, Keyboard, Loader2, Check, Copy, RotateCcw, X, ChevronRight, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { createAIComplete } from '@/lib/ai'
import { PROMPTS, RESTYLE_OPTIONS, TRANSLATE_OPTIONS } from '@/lib/ai/prompts'
import type { Editor } from '@tiptap/react'

// ── Shared state between trigger and output panel ──

type AIAction =
  | { type: 'polish' }
  | { type: 'shorten' }
  | { type: 'expand' }
  | { type: 'restyle'; style: string }
  | { type: 'translate'; lang: string }
  | { type: 'custom'; instruction: string }

interface AIState {
  status: 'idle' | 'loading' | 'streaming' | 'done' | 'error'
  text: string
  error: string
  lastAction: AIAction | null
  selectionRange: { from: number; to: number } | null
  customOpen: boolean
  customHistory: string[]
  providerId: string
  configured: Array<{ provider_id: string }>
  setStatus: (s: AIState['status']) => void
  setText: (t: string) => void
  appendText: (chunk: string) => void
  setError: (e: string) => void
  setLastAction: (a: AIAction | null) => void
  setSelectionRange: (r: { from: number; to: number } | null) => void
  setCustomOpen: (o: boolean) => void
  addCustomHistory: (h: string) => void
  setProviderId: (id: string) => void
  setConfigured: (c: Array<{ provider_id: string }>) => void
  reset: () => void
}

const useAIStore = create<AIState>((set) => ({
  status: 'idle',
  text: '',
  error: '',
  lastAction: null,
  selectionRange: null,
  customOpen: false,
  customHistory: [],
  providerId: 'deepseek',
  configured: [],
  setStatus: (s) => set({ status: s }),
  setText: (t) => set({ text: t }),
  appendText: (chunk) => set((state) => ({ text: state.text + chunk })),
  setError: (e) => set({ error: e }),
  setLastAction: (a) => set({ lastAction: a }),
  setSelectionRange: (r) => set({ selectionRange: r }),
  setCustomOpen: (o) => set({ customOpen: o }),
  addCustomHistory: (h) => set((state) => ({ customHistory: [h, ...state.customHistory.filter((x) => x !== h)].slice(0, 10) })),
  setProviderId: (id) => set({ providerId: id }),
  setConfigured: (c) => set({ configured: c }),
  reset: () => set({ status: 'idle', text: '', error: '' }),
}))

// ── AI Action Button (goes inside BubbleMenu) ──

interface AIActionButtonProps {
  editor: Editor
}

function AIActionButton({ editor }: AIActionButtonProps): React.JSX.Element {
  const {
    providerId, configured, customOpen, customHistory,
    setProviderId, setConfigured, setCustomOpen, addCustomHistory,
  } = useAIStore()
  const { toast } = useToast()
  const aiComplete = createAIComplete()
  const aiTextRef = useRef('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    window.api?.aiListConfigured?.().then((list) => {
      setConfigured(list || [])
      if (list && list.length > 0) {
        setProviderId(list[0].provider_id)
      }
    })
  }, [setConfigured, setProviderId])

  const getSelectedText = useCallback((): string => {
    const { from, to, empty } = editor.state.selection
    if (empty) return ''
    return editor.state.doc.textBetween(from, to, '')
  }, [editor])

  const executeAction = useCallback(async (action: AIAction) => {
    const text = getSelectedText()
    if (!text || text.length < 5) return

    const { from, to } = editor.state.selection
    const store = useAIStore.getState()
    store.setSelectionRange({ from, to })
    store.setLastAction(action)
    store.setStatus('loading')
    store.setText('')
    aiTextRef.current = ''
    store.setError('')

    let systemPrompt = ''
    let userMessage = ''

    switch (action.type) {
      case 'polish':
        systemPrompt = PROMPTS.polish.system
        userMessage = PROMPTS.polish.buildUser(text)
        break
      case 'shorten':
        systemPrompt = PROMPTS.shorten.system
        userMessage = PROMPTS.shorten.buildUser(text)
        break
      case 'expand':
        systemPrompt = PROMPTS.expand.system
        userMessage = PROMPTS.expand.buildUser(text)
        break
      case 'restyle':
        systemPrompt = PROMPTS.restyle.system(action.style)
        userMessage = PROMPTS.restyle.buildUser(text)
        break
      case 'translate':
        systemPrompt = PROMPTS.translate.system(action.lang)
        userMessage = PROMPTS.translate.buildUser(text)
        break
      case 'custom':
        systemPrompt = PROMPTS.custom.system
        userMessage = PROMPTS.custom.buildUser(action.instruction, text)
        useAIStore.getState().addCustomHistory(action.instruction)
        break
    }

    const controller = new AbortController()
    abortRef.current = controller

    const timeout = setTimeout(() => {
      controller.abort()
      if (aiTextRef.current) {
        useAIStore.getState().setStatus('done')
      } else {
        useAIStore.getState().setStatus('error')
        useAIStore.getState().setError('请求超时（60秒），请重试')
      }
    }, 60000)

    try {
      useAIStore.getState().setStatus('streaming')
      await aiComplete(
        useAIStore.getState().providerId,
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          maxTokens: 2000,
          stream: true,
        },
        (chunk) => {
          aiTextRef.current += chunk
          useAIStore.getState().appendText(chunk)
        }
      )
      useAIStore.getState().setStatus('done')
    } catch (e: unknown) {
      const err = e as Error
      if (err.message === 'PROVIDER_NOT_CONFIGURED') {
        useAIStore.getState().setError('请先在设置中配置 AI')
        useAIStore.getState().setStatus('error')
      } else if (err.name === 'AbortError') {
        if (aiTextRef.current) useAIStore.getState().setStatus('done')
        else { useAIStore.getState().setStatus('error'); useAIStore.getState().setError('已取消') }
      } else {
        useAIStore.getState().setStatus('error')
        useAIStore.getState().setError(err.message || '请求失败')
      }
    } finally {
      clearTimeout(timeout)
      abortRef.current = null
    }
  }, [editor, getSelectedText, aiComplete])

  return (
    <div className="flex items-center gap-1">
      {configured.length > 1 && (
        <select
          className="h-7 rounded border border-border bg-background px-1 text-xs"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
        >
          {configured.map((p) => (
            <option key={p.provider_id} value={p.provider_id}>{p.provider_id}</option>
          ))}
        </select>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex h-7 items-center gap-1 rounded-md bg-purple-600 px-2 text-xs font-medium text-white hover:bg-purple-700 transition-colors cursor-pointer">
            <Sparkles className="h-3.5 w-3.5" />
            AI
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom" className="w-44">
          <DropdownMenuItem onClick={() => executeAction({ type: 'polish' })}>
            <Sparkles className="mr-2 h-4 w-4" /> 润色
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => executeAction({ type: 'shorten' })}>
            <Shrink className="mr-2 h-4 w-4" /> 缩写
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => executeAction({ type: 'expand' })}>
            <Expand className="mr-2 h-4 w-4" /> 扩写
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" /> 改风格
              <ChevronRight className="ml-auto h-3 w-3" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {RESTYLE_OPTIONS.map((opt) => (
                <DropdownMenuItem key={opt.id} onClick={() => executeAction({ type: 'restyle', style: opt.label })}>
                  {opt.label}
                </DropdownMenuItem>
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
                <DropdownMenuItem key={opt.id} onClick={() => executeAction({ type: 'translate', lang: opt.lang })}>
                  {opt.label}
                </DropdownMenuItem>
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
            <CustomInstructionForm onSubmit={(instruction) => { setCustomOpen(false); executeAction({ type: 'custom', instruction }) }} history={customHistory} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Custom Instruction Form ──

function CustomInstructionForm({ onSubmit, history }: { onSubmit: (instruction: string) => void; history: string[] }): React.JSX.Element {
  const [value, setValue] = useState('')
  return (
    <div className="space-y-2">
      <input
        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
        placeholder="例如：把这段改成更口语化的表达"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) onSubmit(value.trim()) }}
        autoFocus
      />
      {history.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">历史指令</div>
          {history.slice(0, 5).map((h, i) => (
            <button
              key={i}
              type="button"
              className="block w-full truncate rounded px-2 py-1 text-left text-xs text-muted-foreground hover:bg-accent cursor-pointer"
              onClick={() => onSubmit(h)}
            >
              {h}
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onSubmit(value.trim())} disabled={!value.trim()}>执行</Button>
      </div>
    </div>
  )
}

// ── AI Output Panel (rendered outside BubbleMenu, in Editor) ──

interface AIOutputPanelProps {
  editor: Editor
}

function AIOutputPanel({ editor }: AIOutputPanelProps): React.JSX.Element {
  const { status, text, error, lastAction, selectionRange } = useAIStore()
  const { toast } = useToast()
  const aiComplete = createAIComplete()
  const aiTextRef = useRef('')

  const handleCancel = useCallback(() => {
    // The abort is handled inside executeAction via AbortController
    // We just need to signal cancel - but since we don't have direct access,
    // we'll use the store status
    useAIStore.getState().setStatus('done')
  }, [])

  const handleReplace = useCallback(() => {
    const store = useAIStore.getState()
    if (!store.selectionRange || !store.text) return
    editor.chain().focus().insertContentAt(store.selectionRange, store.text).run()
    store.reset()
  }, [editor])

  const handleCopy = useCallback(async () => {
    const storeText = useAIStore.getState().text
    await navigator.clipboard.writeText(storeText)
    toast({ title: '已复制' })
  }, [toast])

  const handleRetry = useCallback(async () => {
    const store = useAIStore.getState()
    if (!store.lastAction) return
    // Re-execute by dispatching a custom event
    window.dispatchEvent(new CustomEvent('ai-retry'))
  }, [])

  const handleClose = useCallback(() => {
    useAIStore.getState().reset()
  }, [])

  if (status === 'idle') return <></>

  return (
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
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleCancel}>取消</Button>
          )}
        </div>
        <div className="mb-3 min-h-[60px] max-h-[200px] overflow-y-auto rounded-md bg-muted/50 p-2 text-sm whitespace-pre-wrap">
          {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {error && <span className="text-red-500">{error}</span>}
          {error === '请先在设置中配置 AI' && (
            <div className="mt-2">
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => {
                handleClose()
                window.dispatchEvent(new CustomEvent('open-settings'))
              }}>
                <Settings className="h-3 w-3" /> 打开设置
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
                <Button size="sm" className="h-7 gap-1 text-xs" onClick={handleReplace}>
                  <Check className="h-3 w-3" /> 替换原文
                </Button>
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleCopy}>
                  <Copy className="h-3 w-3" /> 复制
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleRetry}>
              <RotateCcw className="h-3 w-3" /> 重试
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs ml-auto" onClick={handleClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export { AIActionButton, AIOutputPanel, useAIStore }
export type { AIAction }
