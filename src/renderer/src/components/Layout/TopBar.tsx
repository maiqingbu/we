import { useState, useCallback, useEffect } from 'react'
import { Copy, Download, Link2, Loader2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/useAppStore'
import { themes } from '@/themes/presets'
import { exportForWechat, htmlToText } from '@/lib/exporter'
import { ExportDialog } from '@/components/ExportDialog'
import { PreviewLinkDialog } from '@/components/PreviewLinkDialog'
import { SettingsDialog } from '@/components/Settings'

function TopBar(): React.JSX.Element {
  const [isExporting, setIsExporting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { toast } = useToast()

  const handleCopy = useCallback(async () => {
    if (isExporting) return

    const editorContent = useAppStore.getState().editorContent
    if (!editorContent || editorContent.trim() === '<p></p>' || editorContent.trim() === '<p><br></p>') {
      toast({ title: '编辑器内容为空', variant: 'destructive' })
      return
    }

    setIsExporting(true)
    try {
      const themeId = useAppStore.getState().currentThemeId
      const theme = themes.find((t) => t.id === themeId)
      if (!theme) {
        toast({ title: '主题未找到', variant: 'destructive' })
        return
      }

      const exported = exportForWechat(editorContent, theme)
      if (!exported) {
        toast({ title: '导出内容为空', variant: 'destructive' })
        return
      }

      const plainText = htmlToText(exported)

      // Debug: save to file on Ctrl+Shift+E
      if (window.api?.debugSaveExport) {
        window.api.debugSaveExport(exported).then(({ filePath }) => {
          console.log(`[debug] Export saved to: ${filePath}`)
        })
      }

      const result = await window.api?.copyToWechat(exported, plainText)
      if (result?.success) {
        toast({
          title: '已复制到剪贴板',
          description: '打开公众号后台粘贴即可',
        })
      } else {
        toast({ title: '复制失败', variant: 'destructive' })
      }
    } catch (err) {
      console.error('[copy-to-wechat] Error:', err)
      toast({ title: '复制失败', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }, [isExporting, toast])

  // Debug shortcut: Ctrl/Cmd + Shift + E
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        handleCopy()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleCopy])

  // Listen for open-settings event from other components
  useEffect(() => {
    const handler = () => setSettingsOpen(true)
    window.addEventListener('open-settings', handler)
    return () => window.removeEventListener('open-settings', handler)
  }, [])

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">微信公众号排版</span>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">设置</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setExportOpen(true)}
            >
              <Download className="h-4 w-4" />
              导出
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            导出为长图 / PDF / HTML / Markdown
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setPreviewOpen(true)}
            >
              <Link2 className="h-4 w-4" />
              预览链接
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            生成本地预览链接
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleCopy}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isExporting ? '导出中...' : '复制到公众号'}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            复制到公众号 ⌘⇧C
          </TooltipContent>
        </Tooltip>
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <PreviewLinkDialog open={previewOpen} onOpenChange={setPreviewOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}

export { TopBar }
