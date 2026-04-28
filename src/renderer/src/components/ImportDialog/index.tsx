import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import { Upload, FileText, Link, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: (html: string, title: string) => void
}

type ImportType = 'word' | 'markdown' | 'pdf' | 'url'

const TAB_CONFIG: { value: ImportType; label: string; accept: string; filterName: string; filterExts: string[] }[] = [
  { value: 'word', label: 'Word 文档', accept: '.docx', filterName: 'Word 文档', filterExts: ['docx'] },
  { value: 'markdown', label: 'Markdown', accept: '.md,.markdown', filterName: 'Markdown 文件', filterExts: ['md', 'markdown'] },
  { value: 'pdf', label: 'PDF', accept: '.pdf', filterName: 'PDF 文件', filterExts: ['pdf'] },
  { value: 'url', label: '网页文章', accept: '', filterName: '', filterExts: [] },
]

function ImportDialog({ open, onOpenChange, onImported }: ImportDialogProps): React.JSX.Element {
  const [tab, setTab] = useState<ImportType>('word')
  const [filePath, setFilePath] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const reset = useCallback(() => {
    setFilePath(null)
    setUrl('')
    setImporting(false)
    setProgress(0)
    setError(null)
    setDragOver(false)
  }, [])

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) reset()
      onOpenChange(v)
    },
    [onOpenChange, reset]
  )

  // Simulate progress during import
  const simulateProgress = useCallback((): NodeJS.Timeout => {
    setProgress(10)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 300)
    return interval
  }, [])

  const handleImport = useCallback(async () => {
    setError(null)

    if (tab === 'url') {
      if (!url.trim()) {
        setError('请输入 URL')
        return
      }
    } else if (!filePath) {
      setError('请先选择文件')
      return
    }

    setImporting(true)
    const timer = simulateProgress()

    try {
      let result: { html: string; title: string; warnings?: string[] }

      switch (tab) {
        case 'word':
          result = await window.api.importWord(filePath!)
          break
        case 'markdown':
          result = await window.api.importMarkdown(filePath!)
          break
        case 'pdf':
          result = await window.api.importPdf(filePath!)
          break
        case 'url':
          result = await window.api.importUrl(url.trim())
          break
      }

      clearInterval(timer)
      setProgress(100)

      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        console.warn('[import] Warnings:', result.warnings)
      }

      // PDF special toast
      if (tab === 'pdf') {
        toast({
          title: 'PDF 文本已导入',
          description: '原始格式（标题/列表/字号）可能需要手动调整',
        })
      }

      // Small delay to show 100%
      await new Promise((r) => setTimeout(r, 300))

      toast({
        title: `已导入《${result.title}》`,
      })

      onImported(result.html, result.title)
      handleOpenChange(false)
    } catch (err) {
      clearInterval(timer)
      const message = err instanceof Error ? err.message : '导入失败，请重试'

      // 解析错误码：格式为 "CODE:用户可见消息"
      const colonIdx = message.indexOf(':')
      const code = colonIdx > 0 ? message.slice(0, colonIdx) : ''
      const userMessage = colonIdx > 0 ? message.slice(colonIdx + 1) : message

      setError(userMessage)
      toast({
        title: '导入失败',
        description: userMessage,
        variant: 'destructive',
        duration: 6000,
      })

      // 公众号反爬/错误页面：额外给降级方案提示
      if (code === 'WECHAT_ANTI_BOT' || code === 'WECHAT_EMPTY' || code === 'WECHAT_BLOCKED') {
        setTimeout(() => {
          toast({
            title: '建议',
            description: '在浏览器打开文章 → 全选复制 → 粘贴到编辑器，效果一样好',
            duration: 8000,
          })
        }, 500)
      }
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }, [tab, filePath, url, onImported, handleOpenChange, simulateProgress, toast])

  const handleFileSelect = useCallback(async () => {
    const config = TAB_CONFIG.find((t) => t.value === tab)
    if (!config) return

    try {
      const selected = await window.api.importOpenFile([
        { name: config.filterName, extensions: config.filterExts },
      ])
      if (selected) {
        setFilePath(selected)
        setError(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '选择文件失败'
      setError(message)
    }
  }, [tab])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (!file) return

      // Electron: file.path is available
      const path = (file as File & { path: string }).path
      if (!path) {
        setError('拖拽文件失败，请使用文件选择按钮')
        return
      }

      // Validate extension
      const config = TAB_CONFIG.find((t) => t.value === tab)
      if (config) {
        const ext = path.split('.').pop()?.toLowerCase()
        if (!config.filterExts.includes(ext || '')) {
          setError(`${config.label}只接受 .${config.filterExts.join(' / .')} 文件`)
          return
        }
      }

      setFilePath(path)
      setError(null)
    },
    [tab]
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const path = (file as File & { path: string }).path
      if (path) {
        setFilePath(path)
        setError(null)
      }
    }
  }, [])

  const canImport =
    !importing &&
    (tab === 'url' ? url.trim().length > 0 : filePath !== null)

  const currentConfig = TAB_CONFIG.find((t) => t.value === tab)!

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>导入文档</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as ImportType); reset() }}>
          <TabsList className="grid w-full grid-cols-4">
            {TAB_CONFIG.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            {/* URL tab */}
            {tab === 'url' ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入文章 URL，如 https://zhuanlan.zhihu.com/p/..."
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleImport() }}
                    disabled={importing}
                  />
                </div>
              </div>
            ) : (
              /* File tabs (Word / Markdown / PDF) */
              <div>
                <div
                  className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : filePath
                        ? 'border-green-300 bg-green-50'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={handleFileSelect}
                >
                  {filePath ? (
                    <>
                      <FileText className="mb-2 h-8 w-8 text-green-600" />
                      <p className="text-sm text-green-700">
                        {filePath.split('/').pop()}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        点击重新选择
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        拖拽文件到这里，或点击选择
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        支持 .{currentConfig.filterExts.join(' / .')} 文件
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={currentConfig.accept}
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
        </Tabs>

        {/* Error */}
        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}

        {/* Progress overlay */}
        {importing && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              解析中…
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Action button */}
        <div className="mt-4 flex justify-end">
          <Button onClick={handleImport} disabled={!canImport || importing}>
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                导入中…
              </>
            ) : (
              '开始导入'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ImportDialog }
