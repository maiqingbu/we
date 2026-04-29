import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { ThemeProvider } from '@/themes/ThemeProvider'
import { PreviewRenderer } from '@/themes/PreviewRenderer'
import { themes, getThemeById } from '@/themes/presets'
import { CustomThemeEditor } from '@/components/CustomThemeEditor'
import type { Theme } from '@/themes/types'

function ThemeSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentTheme = useMemo(
    () => themes.find((t) => t.id === value) ?? themes[0],
    [value]
  )

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs hover:bg-accent cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {currentTheme.previewImage && (
          <img
            src={currentTheme.previewImage}
            alt=""
            className="h-4 w-4 rounded-sm object-cover"
          />
        )}
        <span className="max-w-[80px] truncate">{currentTheme.name}</span>
        <svg className="h-3 w-3 shrink-0 text-muted-foreground" viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[260px] rounded-lg border border-border bg-popover shadow-lg">
          <div className="max-h-[360px] overflow-y-auto p-1.5">
            {/* Built-in themes */}
            <div className="mb-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              预设主题
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                    t.id === value
                      ? 'bg-accent text-accent-foreground ring-1 ring-primary/20'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => {
                    onChange(t.id)
                    setOpen(false)
                  }}
                >
                  {t.previewImage ? (
                    <img
                      src={t.previewImage}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                      {t.name.slice(0, 1)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-medium">{t.name}</div>
                    <div className="truncate text-[10px] text-muted-foreground">
                      {t.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Divider + new custom theme */}
            <div className="my-1.5 border-t border-border" />
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-purple-600 hover:bg-accent/50 cursor-pointer"
              onClick={() => {
                onChange('__new__')
                setOpen(false)
              }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-dashed border-purple-300 text-sm">
                +
              </span>
              <span className="font-medium">新建自定义主题</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewPane(): React.JSX.Element {
  const editorContent = useAppStore((s) => s.editorContent)
  const currentThemeId = useAppStore((s) => s.currentThemeId)
  const setCurrentThemeId = useAppStore((s) => s.setCurrentThemeId)
  const [customThemes, setCustomThemes] = useState<Theme[]>([])
  const [editorOpen, setEditorOpen] = useState(false)

  const loadCustomThemes = useCallback(() => {
    window.api?.customThemeList?.().then((list) => {
      if (!list) return
      const originalTheme = getThemeById('original')
      setCustomThemes(list.map((ct) => ({
        id: ct.id,
        name: ct.name,
        description: '自定义主题',
        styles: originalTheme.styles,
        customCss: ct.css,
      })))
    })
  }, [])

  useEffect(() => {
    loadCustomThemes()
  }, [loadCustomThemes])

  // Reload custom themes when editor closes
  useEffect(() => {
    if (!editorOpen) loadCustomThemes()
  }, [editorOpen, loadCustomThemes])

  const theme = useMemo(() => {
    const custom = customThemes.find((t) => t.id === currentThemeId)
    if (custom) return custom
    return themes.find((t) => t.id === currentThemeId) ?? themes[0]
  }, [currentThemeId, customThemes])

  useEffect(() => {
    if (theme) useAppStore.getState().setCurrentTheme(theme)
  }, [theme])

  return (
    <div className="flex h-full min-w-[280px] flex-col bg-muted/50">
      {/* Header with theme selector */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <h2 className="whitespace-nowrap text-xs font-medium text-muted-foreground">
          预览
        </h2>
        <ThemeSelector
          value={currentThemeId}
          onChange={(v) => {
            if (v === '__new__') {
              setEditorOpen(true)
              return
            }
            setCurrentThemeId(v)
          }}
        />
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

      <CustomThemeEditor open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  )
}

export { PreviewPane }
