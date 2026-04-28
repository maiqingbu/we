import { useState, useCallback, useEffect, useRef } from 'react'
import { Bookmark, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import type { Editor } from '@tiptap/react'

interface SavedStyle {
  id: number
  name: string
  styles: string
  created_at: number
}

interface StyleFavoritesProps {
  editor: Editor
}

function StyleFavorites({ editor }: StyleFavoritesProps): React.JSX.Element {
  const [styles, setStyles] = useState<SavedStyle[]>([])
  const [saveOpen, setSaveOpen] = useState(false)
  const [renameId, setRenameId] = useState<number | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const { toast } = useToast()

  const loadStyles = useCallback(async () => {
    const list = await window.api?.styleList?.()
    setStyles(list || [])
  }, [])

  useEffect(() => { loadStyles() }, [loadStyles])

  const extractStylesFromSelection = useCallback((): Record<string, string> | null => {
    const { from, to, empty } = editor.state.selection
    if (empty) return null

    const styles: Record<string, string> = {}
    const { doc } = editor.state

    doc.nodesBetween(from, to, (node) => {
      if (node.isText) {
        node.marks.forEach((mark) => {
          if (mark.type.name === 'textStyle') {
            Object.entries(mark.attrs).forEach(([key, val]) => {
              if (val) styles[key] = val as string
            })
          }
          if (mark.type.name === 'bold') styles.fontWeight = '700'
          if (mark.type.name === 'italic') styles.fontStyle = 'italic'
          if (mark.type.name === 'underline') styles.textDecoration = 'underline'
          if (mark.type.name === 'strike') styles.textDecoration = styles.textDecoration
            ? styles.textDecoration + ' line-through'
            : 'line-through'
          if (mark.type.name === 'highlight') {
            styles.backgroundColor = mark.attrs.color || '#FFFF00'
          }
          if (mark.type.name === 'link') {
            // Don't save links as part of style
          }
        })
      }
      // Check node-level styles
      if (node.type.name === 'heading') {
        styles.fontSize = node.attrs.level === 1 ? '24px' : node.attrs.level === 2 ? '20px' : '18px'
        styles.fontWeight = '700'
      }
    })

    return Object.keys(styles).length > 0 ? styles : null
  }, [editor])

  const handleSave = useCallback(async () => {
    const extracted = extractStylesFromSelection()
    if (!extracted) {
      toast({ title: '请先选中带格式的文本', variant: 'destructive' })
      return
    }

    setNameInput('')
    setSaveOpen(true)
  }, [extractStylesFromSelection, toast])

  const confirmSave = useCallback(async () => {
    if (!nameInput.trim()) return
    const extracted = extractStylesFromSelection()
    if (!extracted) return

    await window.api?.styleCreate?.(nameInput.trim(), JSON.stringify(extracted))
    setSaveOpen(false)
    setNameInput('')
    toast({ title: '样式已保存' })
    loadStyles()
  }, [nameInput, extractStylesFromSelection, loadStyles, toast])

  const handleApply = useCallback((style: SavedStyle) => {
    const { from, to, empty } = editor.state.selection
    if (empty) {
      toast({ title: '请先选中文本', variant: 'destructive' })
      return
    }

    try {
      const parsed = JSON.parse(style.styles) as Record<string, string>
      const chain = editor.chain().focus()

      // Apply textStyle marks
      const styleAttrs: Record<string, string> = {}
      Object.entries(parsed).forEach(([key, val]) => {
        if (['color', 'fontFamily', 'fontSize'].includes(key)) {
          styleAttrs[key] = val
        }
      })
      if (Object.keys(styleAttrs).length > 0) {
        chain.setMark('textStyle', styleAttrs)
      }

      // Apply bold/italic/underline/strike
      if (parsed.fontWeight === '700') chain.setBold()
      else chain.unsetBold()
      if (parsed.fontStyle === 'italic') chain.setItalic()
      else chain.unsetItalic()
      if (parsed.textDecoration?.includes('underline')) chain.setUnderline()
      else chain.unsetUnderline()
      if (parsed.textDecoration?.includes('line-through')) chain.setStrike()
      else chain.unsetStrike()

      chain.run()
      toast({ title: '已应用样式' })
    } catch {
      toast({ title: '样式格式错误', variant: 'destructive' })
    }
  }, [editor, toast])

  const handleRename = useCallback(async (id: number) => {
    if (!nameInput.trim()) return
    await window.api?.styleUpdate?.(id, nameInput.trim())
    setRenameId(null)
    setNameInput('')
    loadStyles()
    toast({ title: '已重命名' })
  }, [nameInput, loadStyles, toast])

  const handleDelete = useCallback(async (id: number) => {
    await window.api?.styleDelete?.(id)
    loadStyles()
    toast({ title: '已删除' })
  }, [loadStyles, toast])

  const styleDescription = (stylesJson: string): string => {
    try {
      const s = JSON.parse(stylesJson) as Record<string, string>
      const parts: string[] = []
      if (s.color) parts.push(`颜色 ${s.color}`)
      if (s.fontSize) parts.push(`字号 ${s.fontSize}`)
      if (s.fontWeight === '700') parts.push('加粗')
      if (s.fontStyle === 'italic') parts.push('斜体')
      if (s.fontFamily) parts.push(s.fontFamily)
      if (s.textDecoration?.includes('underline')) parts.push('下划线')
      if (s.textDecoration?.includes('line-through')) parts.push('删除线')
      return parts.join(' · ') || '自定义样式'
    } catch {
      return '自定义样式'
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="我的样式">
            <Bookmark className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {styles.length > 0 && styles.slice(0, 20).map((style) => (
            <div
              key={style.id}
              className="relative"
              onMouseEnter={() => setHoveredId(style.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <DropdownMenuItem onClick={() => handleApply(style)} className="py-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{style.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{styleDescription(style.styles)}</div>
                </div>
              </DropdownMenuItem>
              {hoveredId === style.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setNameInput(style.name); setRenameId(style.id) }}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    className="h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/20 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleDelete(style.id) }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {styles.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={handleSave}>
            <Plus className="mr-2 h-4 w-4" />
            保存当前样式...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>保存样式</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">名称</label>
              <input
                className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                placeholder="例如：蓝色重点"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
                autoFocus
              />
            </div>
            {extractStylesFromSelection() && (
              <div className="text-xs text-muted-foreground">
                将保存：{styleDescription(JSON.stringify(extractStylesFromSelection()!))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSaveOpen(false)}>取消</Button>
              <Button size="sm" onClick={confirmSave} disabled={!nameInput.trim()}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={renameId !== null} onOpenChange={() => setRenameId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>重命名样式</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && renameId && handleRename(renameId)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRenameId(null)}>取消</Button>
              <Button size="sm" onClick={() => renameId && handleRename(renameId)} disabled={!nameInput.trim()}>确定</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { StyleFavorites }
