import { useState, useCallback, useEffect, useRef } from 'react'
import { Clock, Eye, RotateCcw, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/hooks/use-toast'
import type { Editor } from '@tiptap/react'

interface Snapshot {
  id: number
  article_id: number
  content: string
  word_count: number
  created_at: number
}

interface VersionHistoryProps {
  editor: Editor
}

function formatTime(ts: number): string {
  const now = Date.now() / 1000
  const diff = now - ts
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  const d = new Date(ts * 1000)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function VersionHistory({ editor }: VersionHistoryProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [viewing, setViewing] = useState(false)
  const [savedContent, setSavedContent] = useState('')
  const { toast } = useToast()

  const articleId = useAppStore((s) => s.currentArticleId)

  const loadSnapshots = useCallback(async () => {
    if (!articleId) return
    const list = await window.api?.snapshotList?.(articleId)
    setSnapshots(list || [])
  }, [articleId])

  useEffect(() => {
    if (open) loadSnapshots()
  }, [open, loadSnapshots])

  const handleView = useCallback(async (snapshot: Snapshot) => {
    setSelectedId(snapshot.id)
    setSavedContent(editor.getHTML())
    editor.commands.setContent(snapshot.content)
    editor.setEditable(false)
    setViewing(true)
  }, [editor])

  const handleRestore = useCallback(async () => {
    if (!selectedId) return

    // Save current version as snapshot first
    const currentContent = savedContent || editor.getHTML()
    const wordCount = currentContent.replace(/<[^>]*>/g, '').length
    if (articleId) {
      await window.api?.snapshotCreate?.(articleId, currentContent, wordCount)
    }

    // Get selected snapshot content
    const snapshot = await window.api?.snapshotGet?.(selectedId)
    if (!snapshot) return

    editor.commands.setContent(snapshot.content)
    editor.setEditable(true)
    setViewing(false)
    setSelectedId(null)

    // Update store
    useAppStore.getState().setEditorContent(snapshot.content)

    // Save to DB
    if (articleId) {
      await window.api?.articleUpdate?.(articleId, { content: snapshot.content })
    }

    toast({ title: '已恢复到历史版本' })
    loadSnapshots()
  }, [selectedId, editor, articleId, savedContent, loadSnapshots, toast])

  const handleClose = useCallback(() => {
    if (viewing && savedContent) {
      editor.commands.setContent(savedContent)
      editor.setEditable(true)
    }
    setViewing(false)
    setSelectedId(null)
    setOpen(false)
  }, [editor, viewing, savedContent])

  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" title="历史版本" onClick={() => setOpen(true)}>
        <Clock className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/20" onClick={handleClose} />

          {/* Drawer */}
          <div className="w-80 bg-background border-l border-border flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <span className="text-sm font-semibold">历史版本</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {/* Current version */}
              <div className={`rounded-md p-2 mb-1 ${!selectedId ? 'bg-accent' : ''}`}>
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-medium">当前版本</span>
                </div>
                <div className="text-xs text-muted-foreground ml-4">
                  {editor.state.doc.textContent.length} 字 · 现在
                </div>
              </div>

              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className={`rounded-md p-2 mb-1 cursor-pointer hover:bg-accent/50 transition-colors ${selectedId === snapshot.id ? 'bg-accent' : ''}`}
                  onClick={() => handleView(snapshot)}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`h-2 w-2 rounded-full ${selectedId === snapshot.id ? 'bg-blue-500' : 'bg-muted-foreground/30'}`} />
                    <span>{formatTime(snapshot.created_at)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground ml-4">
                    {snapshot.word_count} 字
                  </div>
                </div>
              ))}

              {snapshots.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">暂无历史版本</div>
              )}
            </div>

            {/* Actions */}
            {viewing && (
              <div className="p-3 border-t border-border space-y-2">
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-md p-2">
                  <Lock className="h-3 w-3" />
                  正在查看历史版本（编辑器已锁定）
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 text-xs gap-1" onClick={handleRestore}>
                    <RotateCcw className="h-3 w-3" /> 恢复到此版本
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => {
                    editor.commands.setContent(savedContent)
                    editor.setEditable(true)
                    setViewing(false)
                    setSelectedId(null)
                  }}>
                    <Eye className="h-3 w-3" /> 返回当前
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export { VersionHistory }
