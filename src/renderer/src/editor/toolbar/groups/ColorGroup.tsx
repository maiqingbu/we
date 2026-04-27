import { useState, useEffect, useRef, useCallback } from 'react'
import { Palette, Highlighter } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ColorGroupProps {
  editor: Editor | null
}

interface ColorItem {
  label: string
  value: string
}

type ColorApplyFn = (color: string) => void

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'wx-recent-colors'
const MAX_RECENT = 6

const colorPalette: ColorItem[] = [
  { label: '黑', value: '#000000' },
  { label: '深灰', value: '#595959' },
  { label: '灰', value: '#999999' },
  { label: '白', value: '#FFFFFF' },
  { label: '红', value: '#E53935' },
  { label: '橙', value: '#FB8C00' },
  { label: '黄', value: '#FDD835' },
  { label: '绿', value: '#43A047' },
  { label: '青', value: '#00ACC1' },
  { label: '蓝', value: '#1E88E5' },
  { label: '紫', value: '#8E24AA' },
  { label: '粉', value: '#EC407A' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadRecentColors(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_RECENT)
    }
  } catch {
    // ignore
  }
  return []
}

function saveRecentColors(colors: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors.slice(0, MAX_RECENT)))
}

function pushRecent(colors: string[], value: string): string[] {
  const next = [value, ...colors.filter((c) => c !== value)]
  return next.slice(0, MAX_RECENT)
}

// ---------------------------------------------------------------------------
// ColorSwatch
// ---------------------------------------------------------------------------

function ColorSwatch({ color, label }: { color: string; label: string }) {
  const isWhite = color.toUpperCase() === '#FFFFFF'
  return (
    <button
      className="h-6 w-6 rounded border border-border"
      style={{
        backgroundColor: color,
        borderColor: isWhite ? '#d1d5db' : undefined,
      }}
      title={label}
    />
  )
}

// ---------------------------------------------------------------------------
// ColorPanel (reusable)
// ---------------------------------------------------------------------------

interface ColorPanelProps {
  recentColors: string[]
  onApply: ColorApplyFn
  onClear: () => void
}

function ColorPanel({ recentColors, onApply, onClear }: ColorPanelProps) {
  const customColorRef = useRef<HTMLInputElement>(null)

  const handleCustomClick = useCallback(() => {
    customColorRef.current?.click()
  }, [])

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value) onApply(value)
    },
    [onApply],
  )

  return (
    <div className="flex flex-col gap-2">
      {/* Preset colors – 6 columns */}
      <div className="grid grid-cols-6 gap-1">
        {colorPalette.map((c) => (
          <button
            key={c.value}
            className="h-6 w-6 rounded border border-border"
            style={{
              backgroundColor: c.value,
              borderColor:
                c.value.toUpperCase() === '#FFFFFF' ? '#d1d5db' : undefined,
            }}
            title={c.label}
            onClick={() => onApply(c.value)}
          />
        ))}
      </div>

      {/* Recent colors */}
      {recentColors.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">最近使用</span>
          <div className="grid grid-cols-6 gap-1">
            {recentColors.map((c) => (
              <ColorSwatch key={c} color={c} label={c} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom row: custom color + clear */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 flex-1 text-xs"
          onClick={handleCustomClick}
        >
          自定义颜色
        </Button>
        <input
          ref={customColorRef}
          type="color"
          className="sr-only"
          tabIndex={-1}
          onChange={handleCustomChange}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 flex-1 text-xs"
          onClick={onClear}
        >
          清除颜色
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ColorGroup
// ---------------------------------------------------------------------------

function ColorGroup({ editor }: ColorGroupProps): React.JSX.Element {
  const [recentColors, setRecentColors] = useState<string[]>(loadRecentColors)

  // Sync recent colors back to localStorage whenever they change
  useEffect(() => {
    saveRecentColors(recentColors)
  }, [recentColors])

  // ---- Text color callbacks ----
  const applyTextColor = useCallback(
    (color: string) => {
      editor?.chain().focus().setColor(color).run()
      setRecentColors((prev) => pushRecent(prev, color))
    },
    [editor],
  )

  const clearTextColor = useCallback(() => {
    editor?.chain().focus().unsetColor().run()
  }, [editor])

  // ---- Highlight callbacks ----
  const applyHighlightColor = useCallback(
    (color: string) => {
      editor?.chain().focus().toggleHighlight({ color }).run()
      setRecentColors((prev) => pushRecent(prev, color))
    },
    [editor],
  )

  const clearHighlightColor = useCallback(() => {
    editor?.chain().focus().unsetHighlight().run()
  }, [editor])

  // ---- Active state detection ----
  const activeTextColor = editor?.isActive('textStyle', { color: '' })
  const textColorActive =
    activeTextColor !== undefined
      ? true
      : !!editor?.getAttributes('textStyle')?.color

  const highlightActive = editor?.isActive('highlight')

  return (
    <div className="flex items-center gap-0.5">
      {/* Text Color */}
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Palette className="h-4 w-4" />
                {textColorActive && (
                  <span
                    className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                    style={{
                      backgroundColor:
                        editor?.getAttributes('textStyle')?.color ?? '#E53935',
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            文字颜色
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-auto p-2" align="start">
          <ColorPanel
            recentColors={recentColors}
            onApply={applyTextColor}
            onClear={clearTextColor}
          />
        </PopoverContent>
      </Popover>

      {/* Highlight Color */}
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Highlighter className="h-4 w-4" />
                {highlightActive && (
                  <span
                    className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-yellow-400"
                  />
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            高亮颜色
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-auto p-2" align="start">
          <ColorPanel
            recentColors={recentColors}
            onApply={applyHighlightColor}
            onClear={clearHighlightColor}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { ColorGroup }
