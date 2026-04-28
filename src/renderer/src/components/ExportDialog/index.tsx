import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
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
import { exportLongImage } from '@/lib/exporter/longImage'
import { exportMarkdown } from '@/lib/exporter/markdown'
import { exportFullHtml } from '@/lib/exporter/html'
import { exportPdf } from '@/lib/exporter/pdf'

type ExportFormat = 'png' | 'pdf' | 'html' | 'md'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FORMATS: { value: ExportFormat; label: string; desc: string }[] = [
  { value: 'png', label: '长图 PNG', desc: '适合微博、朋友圈、小红书' },
  { value: 'pdf', label: 'PDF 文档', desc: '适合打印、归档' },
  { value: 'html', label: 'HTML 文件', desc: '带完整样式、可分享' },
  { value: 'md', label: 'Markdown', desc: '源文件、可二次编辑' },
]

const PNG_WIDTHS = [
  { value: 750, label: '750px（默认）' },
  { value: 1080, label: '1080px（高清）' },
  { value: 677, label: '677px（微信宽度）' },
]

const PDF_SIZES = [
  { value: 'A4', label: 'A4' },
  { value: 'A3', label: 'A3' },
  { value: 'wechat', label: '微信文章宽度' },
]

function sanitizeFilename(name: string): string {
  return (name || '未命名文章').replace(/[\\/:*?"<>|]/g, '_')
}

function ExportDialog({ open, onOpenChange }: ExportDialogProps): React.JSX.Element {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [pngWidth, setPngWidth] = useState(750)
  const [pdfSize, setPdfSize] = useState<string>('A4')
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    const editorContent = useAppStore.getState().editorContent
    if (!editorContent || editorContent.trim() === '<p></p>' || editorContent.trim() === '<p><br></p>') {
      toast({ title: '文章内容为空', description: '请先写点什么', variant: 'destructive' })
      return
    }

    const themeId = useAppStore.getState().currentThemeId
    const theme = themes.find((t) => t.id === themeId)
    if (!theme) {
      toast({ title: '主题未找到', variant: 'destructive' })
      return
    }

    // Get title from store or first heading
    const title = useAppStore.getState().currentArticleTitle || '未命名文章'
    const safeName = sanitizeFilename(title)

    setExporting(true)
    try {
      switch (format) {
        case 'png': {
          await exportLongImage(editorContent, theme, title, { width: pngWidth })
          toast({ title: '长图已保存' })
          break
        }
        case 'pdf': {
          await exportPdf(editorContent, theme, title, { pageSize: pdfSize as any })
          toast({ title: 'PDF 已保存' })
          break
        }
        case 'html': {
          const fullHtml = await exportFullHtml(editorContent, theme, title)
          const result = await window.api.saveFile(fullHtml, `${safeName}.html`)
          if (!result.canceled && result.path) {
            toast({ title: `已保存到 ${result.path}` })
          }
          break
        }
        case 'md': {
          const md = exportMarkdown(editorContent)
          const result = await window.api.saveFile(md, `${safeName}.md`)
          if (!result.canceled && result.path) {
            toast({ title: `已保存到 ${result.path}` })
          }
          break
        }
      }
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : '导出失败'
      toast({ title: '导出失败', description: message, variant: 'destructive' })
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>导出文章</DialogTitle>
        </DialogHeader>

        {/* Format selection */}
        <div className="space-y-2">
          {FORMATS.map((f) => (
            <label
              key={f.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                format === f.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
              }`}
            >
              <input
                type="radio"
                name="format"
                value={f.value}
                checked={format === f.value}
                onChange={() => setFormat(f.value)}
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-medium">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Dynamic options */}
        <div className="space-y-2">
          {format === 'png' && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground">图片宽度</div>
              <div className="flex gap-2">
                {PNG_WIDTHS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      pngWidth === w.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => setPngWidth(w.value)}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {format === 'pdf' && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground">页面尺寸</div>
              <div className="flex gap-2">
                {PDF_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      pdfSize === s.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => setPdfSize(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            取消
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                导出中…
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                导出
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ExportDialog }
