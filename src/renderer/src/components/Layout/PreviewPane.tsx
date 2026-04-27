import { useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/useAppStore'
import { ThemeProvider } from '@/themes/ThemeProvider'
import { PreviewRenderer } from '@/themes/PreviewRenderer'
import { themes } from '@/themes/presets'

function PreviewPane(): React.JSX.Element {
  const editorContent = useAppStore((s) => s.editorContent)
  const currentThemeId = useAppStore((s) => s.currentThemeId)
  const setCurrentThemeId = useAppStore((s) => s.setCurrentThemeId)

  const theme = useMemo(
    () => themes.find((t) => t.id === currentThemeId) ?? themes[0],
    [currentThemeId]
  )

  return (
    <div className="flex h-full min-w-[280px] flex-col bg-muted/50">
      {/* Header with theme selector */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <h2 className="whitespace-nowrap text-xs font-medium text-muted-foreground">
          预览
        </h2>
        <Select value={currentThemeId} onValueChange={setCurrentThemeId}>
          <SelectTrigger className="h-7 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {themes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview card */}
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div
          className="mx-auto w-full overflow-y-auto rounded-xl bg-white shadow-sm"
          style={{ maxWidth: '375px', minHeight: '600px' }}
        >
          <div className="p-5">
            <ThemeProvider themeId={currentThemeId}>
              <PreviewRenderer html={editorContent} theme={theme} />
            </ThemeProvider>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PreviewPane }
