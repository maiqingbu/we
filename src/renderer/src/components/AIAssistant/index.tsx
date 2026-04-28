import { useState, useRef, useCallback, useEffect } from 'react'
import { Sparkles, Loader2, RefreshCw, Check, Copy, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { createAIComplete } from '@/lib/ai'
import { PROMPTS, TITLE_TYPES, splitForLongArticle } from '@/lib/ai/prompts'
import { useAppStore } from '@/store/useAppStore'
import type { Editor } from '@tiptap/react'

interface AIAssistantProps {
  editor: Editor
}

type DialogType = 'title' | 'summary' | 'proofread' | null

function AIAssistant({ editor }: AIAssistantProps): React.JSX.Element {
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    window.api?.aiListConfigured?.().then((list) => {
      setConfigured(list && list.length > 0)
    })
  }, [])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={!configured}>
            <Sparkles className="h-4 w-4" />
            AI 助手
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setDialogType('title')}>
            <Sparkles className="mr-2 h-4 w-4" /> 起标题
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogType('summary')}>
            <Sparkles className="mr-2 h-4 w-4" /> 写摘要
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogType('proofread')}>
            <Sparkles className="mr-2 h-4 w-4" /> 错别字检测（AI）
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {!configured && (
        <span className="text-xs text-muted-foreground">请先配置 AI</span>
      )}

      <TitleDialog editor={editor} open={dialogType === 'title'} onOpenChange={(open) => { if (!open) setDialogType(null) }} />
      <SummaryDialog editor={editor} open={dialogType === 'summary'} onOpenChange={(open) => { if (!open) setDialogType(null) }} />
      <ProofreadDialog editor={editor} open={dialogType === 'proofread'} onOpenChange={(open) => { if (!open) setDialogType(null) }} />
    </>
  )
}

// ── Helper: extract plain text from editor ──
function getEditorPlainText(editor: Editor): string {
  const { state } = editor
  const { doc } = state
  const text = doc.textContent
  return text.replace(/\s+/g, ' ').trim()
}

// ── Title Dialog ──
interface TitleDialogProps {
  editor: Editor
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TitleDialog({ editor, open, onOpenChange }: TitleDialogProps): React.JSX.Element {
  const [titles, setTitles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cancelRef = useRef<(() => void) | null>(null)
  const aiComplete = createAIComplete()
  const { toast } = useToast()

  const generateTitles = useCallback(async () => {
    const text = getEditorPlainText(editor)
    if (!text) { toast({ title: '文章内容为空', variant: 'destructive' }); return }

    setLoading(true)
    setError('')
    setTitles([])

    const chunks = splitForLongArticle(text, 'title')
    const systemPrompt = PROMPTS.title.system
    const userMessage = PROMPTS.title.buildUser(chunks[0])

    const request = aiComplete(
      useAppStore.getState().configuredProviders?.[0]?.provider_id || 'deepseek',
      { messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }], temperature: 0.8, maxTokens: 1000, stream: false },
    )
    cancelRef.current = request.cancel

    try {
      const result = await request.promise
      const parsed = JSON.parse(result)
      if (parsed.titles && Array.isArray(parsed.titles)) {
        setTitles(parsed.titles.slice(0, 5))
      } else {
        setError('AI 返回格式异常，请重试')
      }
    } catch (e: unknown) {
      const err = e as Error
      if (err.message === 'ABORTED') { setError('已取消') }
      else if (err instanceof SyntaxError) { setError('AI 返回内容无法解析，请重试') }
      else { setError(err.message || '生成失败') }
    } finally {
      setLoading(false)
      cancelRef.current = null
    }
  }, [editor, aiComplete, toast])

  useEffect(() => {
    if (open) generateTitles()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (title: string) => {
    // Check if there's an H1 at the start
    const { doc } = editor.state
    let h1Pos = -1
    doc.descendants((node, pos) => {
      if (node.type.name === 'heading' && node.attrs.level === 1 && h1Pos === -1) {
        h1Pos = pos
      }
    })

    if (h1Pos >= 0) {
      // Replace existing H1 text
      const node = doc.nodeAt(h1Pos)
      if (node) {
        editor.chain().focus()
          .deleteRange({ from: h1Pos, to: h1Pos + node.nodeSize })
          .insertContentAt(h1Pos, { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: title }] })
          .run()
      }
    } else {
      // Insert H1 at top
      editor.chain().focus()
        .insertContentAt(0, { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: title }] })
        .run()
    }

    // Update article title in store
    useAppStore.getState().setCurrentArticleTitle(title)

    // Also update article in DB
    const articleId = useAppStore.getState().currentArticleId
    if (articleId) {
      window.api?.articleUpdate?.(articleId, { title })
    }

    toast({ title: '已选用标题' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI 起标题
            {!loading && !error && (
              <Button variant="ghost" size="sm" className="ml-auto h-7 gap-1 text-xs" onClick={generateTitles}>
                <RefreshCw className="h-3 w-3" /> 刷新
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {loading && (
            <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">正在生成标题...</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => cancelRef.current?.()}>取消</Button>
            </div>
          )}
          {error && (
            <div className="py-4 text-center text-sm text-red-500">{error}</div>
          )}
          {!loading && !error && titles.length > 0 && titles.map((title, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border border-border p-2">
              <span className="shrink-0 text-xs text-muted-foreground w-12">{TITLE_TYPES[i] || ''}</span>
              <span className="flex-1 text-sm">{title}</span>
              <Button size="sm" className="h-7 text-xs shrink-0" onClick={() => handleSelect(title)}>选用</Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Summary Dialog ──
interface SummaryDialogProps {
  editor: Editor
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SummaryDialog({ editor, open, onOpenChange }: SummaryDialogProps): React.JSX.Element {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const cancelRef = useRef<(() => void) | null>(null)
  const aiComplete = createAIComplete()
  const { toast } = useToast()

  const generateSummary = useCallback(async () => {
    const text = getEditorPlainText(editor)
    if (!text) { toast({ title: '文章内容为空', variant: 'destructive' }); return }

    setLoading(true)
    setDone(false)
    setError('')
    setSummary('')

    const chunks = splitForLongArticle(text, 'summary')
    const request = aiComplete(
      useAppStore.getState().configuredProviders?.[0]?.provider_id || 'deepseek',
      {
        messages: [{ role: 'system', content: PROMPTS.summary.system }, { role: 'user', content: PROMPTS.summary.buildUser(chunks[0]) }],
        temperature: 0.7,
        maxTokens: 500,
        stream: true,
      },
      (chunk) => setSummary((prev) => prev + chunk),
    )
    cancelRef.current = request.cancel

    try {
      await request.promise
      setDone(true)
    } catch (e: unknown) {
      const err = e as Error
      if (err.message === 'ABORTED') { if (summary) setDone(true); else setError('已取消') }
      else { setError(err.message || '生成失败') }
    } finally {
      setLoading(false)
      cancelRef.current = null
    }
  }, [editor, aiComplete, toast, summary])

  useEffect(() => {
    if (open) generateSummary()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInsert = () => {
    if (!summary) return
    // Check if first block is blockquote
    const { doc } = editor.state
    const firstNode = doc.firstChild
    if (firstNode && firstNode.type.name === 'blockquote') {
      // Replace existing blockquote
      editor.chain().focus()
        .deleteRange({ from: 0, to: firstNode.nodeSize })
        .insertContentAt(0, { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: summary }] }] })
        .run()
    } else {
      // Find H1 position, insert after it
      let insertPos = 0
      doc.descendants((node, pos) => {
        if (node.type.name === 'heading' && node.attrs.level === 1) {
          insertPos = pos + node.nodeSize
          return false
        }
      })
      editor.chain().focus()
        .insertContentAt(insertPos, { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: summary }] }] })
        .run()
    }
    toast({ title: '已插入摘要' })
    onOpenChange(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary)
    toast({ title: '已复制' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI 写摘要
            {!loading && (
              <Button variant="ghost" size="sm" className="ml-auto h-7 gap-1 text-xs" onClick={generateSummary}>
                <RefreshCw className="h-3 w-3" /> 刷新
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-[120px] rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
          {loading && !summary && <div className="flex items-center gap-2 justify-center py-4 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> 生成中...</div>}
          {error && <span className="text-red-500">{error}</span>}
          {summary && <span>{summary}</span>}
          {loading && <span className="inline-block w-1.5 h-4 animate-pulse bg-foreground/50 ml-0.5" />}
        </div>
        {done && (
          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs" onClick={handleInsert}>插入到文章开头</Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleCopy}>
              <Copy className="h-3 w-3 mr-1" /> 复制
            </Button>
            {loading && <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => cancelRef.current?.()}>取消</Button>}
          </div>
        )}
        {loading && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => cancelRef.current?.()}>取消</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Proofread Dialog ──
interface ProofreadIssue {
  text: string
  suggestion: string
  reason: string
}

interface ProofreadDialogProps {
  editor: Editor
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ProofreadDialog({ editor, open, onOpenChange }: ProofreadDialogProps): React.JSX.Element {
  const [issues, setIssues] = useState<ProofreadIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')
  const cancelRef = useRef<(() => void) | null>(null)
  const aiComplete = createAIComplete()
  const { toast } = useToast()

  const runProofread = useCallback(async () => {
    const text = getEditorPlainText(editor)
    if (!text) { toast({ title: '文章内容为空', variant: 'destructive' }); return }

    setLoading(true)
    setError('')
    setIssues([])

    const chunks = splitForLongArticle(text, 'proofread')
    const allIssues: ProofreadIssue[] = []
    const providerId = useAppStore.getState().configuredProviders?.[0]?.provider_id || 'deepseek'

    for (let i = 0; i < chunks.length; i++) {
      setProgress(chunks.length > 1 ? `正在检查第 ${i + 1}/${chunks.length} 段...` : '正在检查...')

      const request = aiComplete(
        providerId,
        {
          messages: [{ role: 'system', content: PROMPTS.proofread.system }, { role: 'user', content: PROMPTS.proofread.buildUser(chunks[i]) }],
          temperature: 0.3,
          maxTokens: 2000,
          stream: false,
        },
      )
      cancelRef.current = request.cancel

      try {
        const result = await request.promise
        const parsed = JSON.parse(result)
        if (parsed.issues && Array.isArray(parsed.issues)) {
          allIssues.push(...parsed.issues.slice(0, 20))
        }
      } catch (e: unknown) {
        const err = e as Error
        if (err.message === 'ABORTED') { setError('已取消'); break }
        else if (err instanceof SyntaxError) { /* skip unparseable chunk */ }
        else { setError(err.message || '检查失败'); break }
      }
    }

    setIssues(allIssues.slice(0, 20))
    setLoading(false)
    setProgress('')
    cancelRef.current = null
  }, [editor, aiComplete, toast])

  useEffect(() => {
    if (open) runProofread()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleJump = (issue: ProofreadIssue) => {
    const { doc } = editor.state
    const plainText = doc.textContent
    const idx = plainText.indexOf(issue.text)
    if (idx >= 0) {
      // Find the actual position in the doc by walking nodes
      let currentPos = 0
      doc.descendants((node, pos) => {
        if (node.isText && node.text) {
          const nodeIdx = plainText.indexOf(issue.text, currentPos)
          if (nodeIdx >= 0 && nodeIdx < currentPos + node.text.length) {
            const localIdx = nodeIdx - currentPos
            editor.chain().focus()
              .setTextSelection({ from: pos + localIdx, to: pos + localIdx + issue.text.length })
              .run()
            return false
          }
          currentPos += node.text.length
        }
      })
    }
  }

  const handleFix = (issue: ProofreadIssue) => {
    const { doc } = editor.state
    const plainText = doc.textContent
    const idx = plainText.indexOf(issue.text)
    if (idx >= 0) {
      let currentPos = 0
      doc.descendants((node, pos) => {
        if (node.isText && node.text) {
          const nodeIdx = plainText.indexOf(issue.text, currentPos)
          if (nodeIdx >= 0 && nodeIdx < currentPos + node.text.length) {
            const localIdx = nodeIdx - currentPos
            editor.chain().focus()
              .insertContentAt(
                { from: pos + localIdx, to: pos + localIdx + issue.text.length },
                issue.suggestion,
              )
              .run()
            setIssues((prev) => prev.filter((it) => it !== issue))
            return false
          }
          currentPos += node.text.length
        }
      })
    }
  }

  const handleFixAll = () => {
    // Fix from end to start to preserve positions
    const reversed = [...issues].reverse()
    for (const issue of reversed) {
      const { doc } = editor.state
      const plainText = doc.textContent
      const idx = plainText.indexOf(issue.text)
      if (idx >= 0) {
        let currentPos = 0
        let found = false
        doc.descendants((node, pos) => {
          if (found) return
          if (node.isText && node.text) {
            const nodeIdx = plainText.indexOf(issue.text, currentPos)
            if (nodeIdx >= 0 && nodeIdx < currentPos + node.text.length) {
              const localIdx = nodeIdx - currentPos
              editor.chain()
                .insertContentAt(
                  { from: pos + localIdx, to: pos + localIdx + issue.text.length },
                  issue.suggestion,
                )
                .run()
              found = true
            }
            currentPos += node.text.length
          }
        })
      }
    }
    setIssues([])
    toast({ title: `已修复 ${reversed.length} 个问题` })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI 校对结果
            {!loading && issues.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">（找到 {issues.length} 个问题）</span>
            )}
            {!loading && (
              <Button variant="ghost" size="sm" className="ml-auto h-7 gap-1 text-xs" onClick={runProofread}>
                <RefreshCw className="h-3 w-3" /> 刷新
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{progress || '检查中...'}</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => cancelRef.current?.()}>取消</Button>
            </div>
          )}
          {error && <div className="py-4 text-center text-sm text-red-500">{error}</div>}
          {!loading && issues.length === 0 && !error && (
            <div className="py-4 text-center text-sm text-muted-foreground">未发现问题，文章质量很好！</div>
          )}
          {issues.map((issue, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="mb-1 text-sm font-medium text-red-600">"{issue.text}"</div>
              <div className="mb-1 text-sm">建议：<span className="text-green-600">{issue.suggestion}</span></div>
              <div className="text-xs text-muted-foreground">{issue.reason}</div>
              <div className="mt-2 flex justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleJump(issue)}>跳转</Button>
                <Button size="sm" className="h-6 text-xs" onClick={() => handleFix(issue)}>修复</Button>
              </div>
            </div>
          ))}
        </div>
        {!loading && issues.length > 0 && (
          <div className="flex justify-end pt-2">
            <Button size="sm" className="text-xs" onClick={handleFixAll}>全部修复</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { AIAssistant }
