import { useState, useEffect, useCallback } from 'react'
import { Link2, Copy, ExternalLink, Trash2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/useAppStore'
import { themes } from '@/themes/presets'
import { exportForWechat } from '@/lib/exporter'

interface PreviewItem {
  id: string
  title: string
  created_at: number
  url: string
}

interface PreviewLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 172800) return '昨天'
  return new Date(timestamp * 1000).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

function PreviewLinkDialog({ open, onOpenChange }: PreviewLinkDialogProps): React.JSX.Element {
  const [currentUrl, setCurrentUrl] = useState('')
  const [currentId, setCurrentId] = useState('')
  const [history, setHistory] = useState<PreviewItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const { toast } = useToast()

  // Load history when dialog opens
  useEffect(() => {
    if (open) {
      loadHistory()
      generatePreview()
    }
  }, [open])

  const loadHistory = async () => {
    try {
      const list = await window.api.previewList()
      setHistory(list)
    } catch (err) {
      console.error('[preview] Failed to load history:', err)
    }
  }

  const generatePreview = async () => {
    const editorContent = useAppStore.getState().editorContent
    if (!editorContent || editorContent.trim() === '<p></p>' || editorContent.trim() === '<p><br></p>') {
      return
    }

    setLoading(true)
    try {
      const themeId = useAppStore.getState().currentThemeId
      const theme = themes.find((t) => t.id === themeId)
      if (!theme) return

      const inlinedHtml = await exportForWechat(editorContent, theme)
      if (!inlinedHtml) return

      const title = useAppStore.getState().currentArticleTitle || '未命名文章'
      const result = await window.api.previewCreate(inlinedHtml, title)
      setCurrentUrl(result.url)
      setCurrentId(result.id)
      await loadHistory()
    } catch (err) {
      console.error('[preview] Failed to generate:', err)
      toast({ title: '生成预览失败', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!currentUrl) return
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast({ title: '链接已复制' })
    } catch {
      toast({ title: '复制失败', variant: 'destructive' })
    }
  }

  const handleOpenBrowser = () => {
    if (currentUrl) {
      window.api.previewOpenInBrowser(currentUrl)
    }
  }

  const handleDelete = async (id: string) => {
    await window.api.previewDelete(id)
    if (id === currentId) {
      setCurrentUrl('')
      setCurrentId('')
    }
    await loadHistory()
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: '链接已复制' })
    } catch {
      toast({ title: '复制失败', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>预览链接</DialogTitle>
        </DialogHeader>

        {/* Current preview link */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">当前文章预览链接</div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              生成中…
            </div>
          ) : currentUrl ? (
            <>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1 rounded-md border bg-muted/50 px-3 py-2 text-xs font-mono truncate">
                  {currentUrl}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" />
                  复制
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleOpenBrowser}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  浏览器打开
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={generatePreview}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  重新生成
                </Button>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">文章内容为空</div>
          )}
        </div>

        {/* Warning */}
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
          ⚠ 此链接仅在本机可访问。要分享给他人，请使用导出 HTML 功能，或配合内网穿透工具。
        </div>

        {/* Expandable guide */}
        <button
          type="button"
          className="flex w-full items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          如何分享给他人？
        </button>
        {showGuide && (
          <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">方案 A：内网穿透</span>
              <p className="mt-1">安装 cpolar 或 ngrok，运行 cpolar http {currentUrl ? currentUrl.split(':')[2] : '端口'}，将得到的公网 URL + /p/xxx 分享给他人。</p>
            </div>
            <div>
              <span className="font-medium text-foreground">方案 B：导出 HTML</span>
              <p className="mt-1">使用「导出」功能生成 HTML 文件，上传到 GitHub Pages / Netlify / 自己的服务器。</p>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">历史预览（{history.length}）</div>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent/50">
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  <span className="shrink-0 text-muted-foreground">{formatTime(item.created_at)}</span>
                  <button
                    type="button"
                    className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => handleCopyUrl(item.url)}
                    title="复制链接"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    className="shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={() => handleDelete(item.id)}
                    title="删除"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { PreviewLinkDialog }
