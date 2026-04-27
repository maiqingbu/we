import { useState, useCallback, useEffect } from 'react'
import { Copy, Loader2 } from 'lucide-react'
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

function TopBar(): React.JSX.Element {
  const [isExporting, setIsExporting] = useState(false)
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

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">微信公众号排版</span>
      </div>
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
  )
}

export { TopBar }
