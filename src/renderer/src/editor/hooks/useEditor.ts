import { useEffect, useCallback, useRef } from 'react'
import { useEditor as useTipTapEditor } from '@tiptap/react'
import { getExtensions } from '../extensions'
import { useAppStore } from '@/store/useAppStore'
import { getEditorHtml } from '../extensions/TemplateBlock'

export function useEditor() {
  const setEditorContent = useAppStore((s) => s.setEditorContent)
  const debounceRef = { timer: null as ReturnType<typeof setTimeout> | null }
  const saveTimerRef = { timer: null as ReturnType<typeof setTimeout> | null }
  const isSettingContent = useRef(false)

  const editor = useTipTapEditor({
    extensions: getExtensions(),
    content: '',
    editorProps: {
      attributes: {
        class: 'editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      if (isSettingContent.current) return
      const html = getEditorHtml(editor)
      setEditorContent(html)

      // Auto-save to DB: 1 second debounce
      if (saveTimerRef.timer) clearTimeout(saveTimerRef.timer)
      saveTimerRef.timer = setTimeout(async () => {
        const articleId = useAppStore.getState().currentArticleId
        if (!articleId) return
        try {
          // Extract title from first H1/H2 or first 20 chars of text
          const title = extractTitle(editor)
          await window.api.articleUpdate(articleId, { content: html, title })
          // Notify sidebar to refresh
          window.dispatchEvent(new Event('articles-changed'))
        } catch (err) {
          console.error('[auto-save] Failed:', err)
        }
      }, 1000)
    },
    immediatelyRender: false,
  })

  // Load article content when switching articles
  const handleLoadArticle = useCallback(
    (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!editor || !detail) return
      isSettingContent.current = true
      if (detail.content !== undefined) {
        editor.commands.setContent(detail.content || '')
      }
      // Small delay to let ProseMirror process, then reset flag
      requestAnimationFrame(() => {
        isSettingContent.current = false
      })
    },
    [editor]
  )

  useEffect(() => {
    window.addEventListener('load-article', handleLoadArticle)
    return () => window.removeEventListener('load-article', handleLoadArticle)
  }, [handleLoadArticle])

  useEffect(() => {
    return () => {
      if (debounceRef.timer) clearTimeout(debounceRef.timer)
      if (saveTimerRef.timer) clearTimeout(saveTimerRef.timer)
    }
  }, [])

  useEffect(() => {
    if (editor) {
      editor.commands.focus()
    }
  }, [editor])

  return editor
}

/** Extract title from editor: first H1/H2 text, or first 20 chars of plain text */
function extractTitle(editor: { getText: () => string; state: { doc: { content: { firstChild: { type: { name: string }; firstChild: { text?: string } | null; content: { firstChild: { text?: string } | null } } | null } } } }): string {
  try {
    const doc = editor.state.doc
    const firstNode = doc.content.firstChild
    if (firstNode && (firstNode.type.name === 'heading')) {
      const textNode = firstNode.firstChild
      if (textNode?.text) return textNode.text.slice(0, 100)
    }
    // Fallback: first 20 chars of plain text
    const text = editor.getText().trim()
    if (text) return text.slice(0, 20) + (text.length > 20 ? '…' : '')
  } catch {
    // ignore
  }
  return ''
}
