import { useState, useEffect, useCallback } from 'react'
import { Plus, Upload, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore, type Article } from '@/store/useAppStore'
import { ImportDialog } from '@/components/ImportDialog'
import { useToast } from '@/hooks/use-toast'

function Sidebar(): React.JSX.Element {
  const [articles, setArticles] = useState<Article[]>([])
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const currentArticleId = useAppStore((s) => s.currentArticleId)
  const setCurrentArticleId = useAppStore((s) => s.setCurrentArticleId)
  const setCurrentArticleTitle = useAppStore((s) => s.setCurrentArticleTitle)
  const setEditorContent = useAppStore((s) => s.setEditorContent)
  const { toast } = useToast()

  const loadArticles = useCallback(async () => {
    try {
      const list = await window.api.articleList()
      setArticles(list)
    } catch (err) {
      console.error('Failed to load articles:', err)
    }
  }, [])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  useEffect(() => {
    const handler = () => loadArticles()
    window.addEventListener('articles-changed', handler)
    return () => window.removeEventListener('articles-changed', handler)
  }, [loadArticles])

  const handleCreate = useCallback(async () => {
    try {
      const article = await window.api.articleCreate()
      setCurrentArticleId(article.id)
      setCurrentArticleTitle(article.title)
      setEditorContent('')
      window.dispatchEvent(new CustomEvent('load-article', { detail: { id: article.id, content: '' } }))
      await loadArticles()
    } catch (err) {
      console.error('Failed to create article:', err)
    }
  }, [loadArticles, setCurrentArticleId, setCurrentArticleTitle, setEditorContent])

  const handleSelect = useCallback(async (article: Article) => {
    setCurrentArticleId(article.id)
    setCurrentArticleTitle(article.title)
    setEditorContent(article.content)
    window.dispatchEvent(new CustomEvent('load-article', { detail: { id: article.id, content: article.content } }))
  }, [setCurrentArticleId, setCurrentArticleTitle, setEditorContent])

  const handleDelete = useCallback(async () => {
    if (deleteTarget === null) return
    try {
      await window.api.articleDelete(deleteTarget)
      if (currentArticleId === deleteTarget) {
        setCurrentArticleId(null)
        setEditorContent('')
        window.dispatchEvent(new CustomEvent('load-article', { detail: { id: null, content: '' } }))
      }
      setDeleteTarget(null)
      await loadArticles()
    } catch (err) {
      console.error('Failed to delete article:', err)
    }
  }, [deleteTarget, currentArticleId, loadArticles, setCurrentArticleId, setEditorContent])

  const handleImported = useCallback(async (html: string, title: string) => {
    try {
      // Create new article with imported content
      const article = await window.api.articleCreate()
      await window.api.articleUpdate(article.id, { title, content: html })
      setCurrentArticleId(article.id)
      setEditorContent(html)
      window.dispatchEvent(new CustomEvent('load-article', { detail: { id: article.id, content: html } }))
      await loadArticles()
    } catch (err) {
      console.error('Failed to save imported article:', err)
      toast({
        title: '保存失败',
        description: '文章已导入但保存失败，请重试',
        variant: 'destructive',
      })
    }
  }, [loadArticles, setCurrentArticleId, setEditorContent, toast])

  const formatTime = (timestamp: number): string => {
    const d = new Date(timestamp * 1000)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }

  return (
    <div className="relative flex h-full min-w-[200px] flex-col bg-muted/50">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="whitespace-nowrap text-xs font-medium text-muted-foreground">
            文章列表
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={handleCreate}>
              <Plus className="h-3.5 w-3.5" />
              新建
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setImportOpen(true)}>
              <Upload className="h-3.5 w-3.5" />
              导入
            </Button>
          </div>
        </div>
      </div>

      {/* Article List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {articles.length === 0 ? (
          <p className="mt-8 whitespace-nowrap text-center text-sm text-muted-foreground">
            暂无文章
          </p>
        ) : (
          <div className="space-y-1">
            {articles.map((article) => (
              <div
                key={article.id}
                className={`group relative cursor-pointer rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent/50 ${
                  currentArticleId === article.id ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => handleSelect(article)}
              >
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">
                      {article.title || '无标题文章'}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {formatTime(article.updated_at)}
                    </div>
                  </div>
                </div>
                <button
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(article.id)
                  }}
                  title="删除文章"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-80 rounded-lg bg-background p-4 shadow-lg">
            <h3 className="text-sm font-medium">确认删除</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              删除后无法恢复，确定要删除这篇文章吗？
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                取消
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                删除
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={handleImported}
      />
    </div>
  )
}

export { Sidebar }
