import { useState, useEffect, useCallback, useRef } from 'react'
import { BubbleMenu } from '@tiptap/react/menus'
import { EditorContent as TipTapEditorContent } from '@tiptap/react'
import type { Editor as TipTapEditor } from '@tiptap/react'
import { DragHandle } from '@tiptap/extension-drag-handle-react'
import { TableBubbleMenuContent } from './toolbar/TableBubbleMenu'
// import { AIActionButton, AIOutputPanel } from '@/components/AIBubbleMenu'
import { Toolbar } from './toolbar/Toolbar'
import { StatusBar } from '@/components/StatusBar'
import { BlockMenu } from './extensions/BlockMenu'
import { checkTypos, checkSensitive, computeStats, type TypoIssue, type SensitiveIssue, type ArticleStats, type LinkCheckResult } from '@/lib/linter'
import { countBase64Images } from '@/lib/imageUpload'
import { getStoredFile, deleteStoredFile } from './extensions/ImageUpload'
import type { LintIssue } from './extensions/LintHighlight'
import { useAppStore } from '@/store/useAppStore'
import { UploadStatus } from '@/components/UploadStatus'

async function getUploadConfig(): Promise<{ providerId: string; config: Record<string, string> } | null> {
  try {
    const activeProvider = await window.api?.imageHostGetSetting('active_provider')
    if (!activeProvider || activeProvider === 'none') return null
    const config = await window.api?.imageHostGetConfig(activeProvider)
    if (!config) return null
    return { providerId: activeProvider, config }
  } catch {
    return null
  }
}

interface EditorProps {
  editor: TipTapEditor | null
}

function Editor({ editor }: EditorProps): React.JSX.Element {
  const [stats, setStats] = useState<ArticleStats | null>(null)
  const [typos, setTypos] = useState<TypoIssue[]>([])
  const [sensitive, setSensitive] = useState<SensitiveIssue[]>([])
  const [ignoreList, setIgnoreList] = useState<Set<string>>(new Set())
  const [linkResults, setLinkResults] = useState<LinkCheckResult[]>([])
  const [linkChecking, setLinkChecking] = useState(false)
  const [base64Count, setBase64Count] = useState(0)
  const [uploadingBase64, setUploadingBase64] = useState(false)
  const lintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Save editor instance to store for AIAssistant access
  useEffect(() => {
    if (editor) useAppStore.getState().setEditorInstance(editor)
  }, [editor])

  // Run lint on content change (1s debounce)
  useEffect(() => {
    if (!editor) return

    const onUpdate = (): void => {
      if (lintTimerRef.current) clearTimeout(lintTimerRef.current)
      lintTimerRef.current = setTimeout(() => {
        if (!editor) return
        const plainText = editor.getText()
        const html = editor.getHTML()

        // Stats
        const newStats = computeStats(html, editor)
        setStats(newStats)

        // Count base64 images - 直接遍历 ProseMirror 文档节点，比 HTML 字符串匹配更可靠
        let b64Count = 0
        editor.state.doc.descendants((node) => {
          if (node.type.name === 'image' && typeof node.attrs.src === 'string' && node.attrs.src.startsWith('data:image/')) {
            b64Count++
          }
          return true
        })
        setBase64Count(b64Count)

        // Skip linting for code blocks and very short text
        if (plainText.length < 2) {
          setTypos([])
          setSensitive([])
          editor.commands.clearLintIssues()
          return
        }

        // Typo check
        const newTypos = checkTypos(plainText, ignoreList)
        setTypos(newTypos)

        // Sensitive check (async due to JSON import)
        checkSensitive(plainText, ignoreList).then((newSensitive) => {
          setSensitive(newSensitive)

          // Build LintHighlight issues
          const lintIssues: LintIssue[] = [
            ...newTypos.map((t) => ({
              start: t.start,
              end: t.end,
              type: 'typo' as const,
              word: t.word,
              suggestion: t.suggestion,
            })),
            ...newSensitive.map((s) => ({
              start: s.start,
              end: s.end,
              type: `sensitive-${s.level}` as LintIssue['type'],
              word: s.word,
              suggestion: s.suggestion || '',
            })),
          ]
          editor.commands.setLintIssues(lintIssues)
        })
      }, 1000)
    }

    editor.on('update', onUpdate)
    // Initial lint
    onUpdate()

    return () => {
      editor.off('update', onUpdate)
      if (lintTimerRef.current) clearTimeout(lintTimerRef.current)
    }
  }, [editor, ignoreList])

  // Listen for upload-retry events from UploadStatus component
  useEffect(() => {
    const handleRetry = async (e: Event) => {
      const { taskId: _taskId, placeholderId } = (e as CustomEvent).detail
      const file = getStoredFile(placeholderId)
      if (!file || !editor) return

      try {
        const uploadConfig = await getUploadConfig()
        if (!uploadConfig) return

        const arrayBuffer = await file.arrayBuffer()
        const result = await window.api!.imageUpload(uploadConfig.providerId, { buffer: arrayBuffer, name: file.name }, uploadConfig.config)
        if (result.success && result.data) {
          editor.commands.replacePlaceholderImage(placeholderId, result.data.url)
          deleteStoredFile(placeholderId)
        }
      } catch {
        editor.commands.markImageFailed(placeholderId, '重试失败')
      }
    }

    window.addEventListener('upload-retry', handleRetry)
    return () => window.removeEventListener('upload-retry', handleRetry)
  }, [editor])

  // Auto-snapshot (throttled)
  useEffect(() => {
    if (!editor) return
    let lastSnapshotTime = 0
    let lastWordCount = 0

    const update = () => {
      const articleId = useAppStore.getState().currentArticleId
      if (!articleId) return

      const content = editor.getHTML()
      const wordCount = editor.state.doc.textContent.length
      const now = Date.now() / 1000

      // Check throttling: skip if < 5min and < 100 words changed
      const timeDiff = now - lastSnapshotTime
      const wordDiff = Math.abs(wordCount - lastWordCount)

      if (timeDiff < 300 && wordDiff < 100) return

      lastSnapshotTime = now
      lastWordCount = wordCount

      window.api?.snapshotCreate?.(articleId, content, wordCount)
    }

    // Check latest snapshot time on mount
    const articleId = useAppStore.getState().currentArticleId
    if (articleId) {
      window.api?.snapshotLatestTime?.(articleId).then((time) => {
        if (time) lastSnapshotTime = time
      })
    }

    editor.on('update', update)
    return () => { editor.off('update', update) }
  }, [editor])

  // Link check (manual trigger)
  const handleLinkRefresh = useCallback(async () => {
    if (!editor) return
    setLinkChecking(true)
    try {
      const html = editor.getHTML()
      const urlRegex = /href=["']([^"']+)["']/g
      const urls: string[] = []
      let match: RegExpExecArray | null
      while ((match = urlRegex.exec(html)) !== null) {
        const url = match[1]
        if (url.startsWith('http://') || url.startsWith('https://')) {
          urls.push(url)
        }
      }

      // Deduplicate
      const uniqueUrls = [...new Set(urls)]
      // Limit concurrency to 5
      const results: LinkCheckResult[] = []
      const batchSize = 5
      for (let i = 0; i < uniqueUrls.length; i += batchSize) {
        const batch = uniqueUrls.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map((url) => window.api.checkLink(url))
        )
        results.push(...batchResults)
      }
      setLinkResults(results)
    } catch (err) {
      console.error('[link-check] Failed:', err)
    } finally {
      setLinkChecking(false)
    }
  }, [editor])

  // Jump to position
  const handleJump = useCallback(
    (start: number, end: number) => {
      if (!editor) return
      const plainText = editor.getText()
      // Convert plain text offset to doc position
      let textOffset = 0
      let docPos = 0
      let found = false
      editor.state.doc.nodesBetween(0, editor.state.doc.content.size, (node, pos) => {
        if (found) return false
        if (node.type.name === 'codeBlock' || node.type.name === 'image' || node.type.name === 'horizontalRule') {
          return true
        }
        if (node.isText) {
          const text = node.text || ''
          if (textOffset + text.length >= start) {
            const from = pos + (start - textOffset)
            const toPos = pos + (end - textOffset)
            editor.chain().focus().setTextSelection({ from, to: toPos }).run()
            found = true
            return false
          }
          textOffset += text.length
        } else if (node.isBlock && !node.isLeaf) {
          if (textOffset > 0) textOffset += 1
        }
        docPos = pos
        return true
      })
    },
    [editor]
  )

  // Ignore a word
  const handleIgnore = useCallback((word: string) => {
    setIgnoreList((prev) => new Set([...prev, word]))
  }, [])

  // Batch upload base64 images
  const handleUploadBase64Images = useCallback(async () => {
    if (!editor) return
    setUploadingBase64(true)
    try {
      const uploadConfig = await getUploadConfig()
      if (!uploadConfig) {
        return
      }

      // 收集所有 base64 图片的 src（不存 pos，因为异步上传期间文档可能变化）
      const base64Srcs: string[] = []
      const { doc } = editor.state
      doc.descendants((node) => {
        if (node.type.name === 'image' && typeof node.attrs.src === 'string' && node.attrs.src.startsWith('data:image/')) {
          base64Srcs.push(node.attrs.src)
        }
        return true
      })

      if (base64Srcs.length === 0) return

      // 逐个上传，每次上传成功后立即在当前文档中替换
      for (const oldSrc of base64Srcs) {
        try {
          const res = await fetch(oldSrc)
          const blob = await res.blob()
          const ext = blob.type.split('/')[1] || 'png'
          const file = new File([blob], `image-${Date.now()}.${ext}`, { type: blob.type })
          const buffer = await file.arrayBuffer()
          const result = await window.api!.imageUpload(uploadConfig.providerId, { buffer, name: file.name }, uploadConfig.config)
          if (result.success && result.data) {
            // 在当前最新文档状态中查找并替换
            const { tr, doc: currentDoc } = editor.state
            let replaced = false
            currentDoc.descendants((node, pos) => {
              if (replaced) return false
              if (node.type.name === 'image' && node.attrs.src === oldSrc) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: result.data.url })
                replaced = true
                return false
              }
              return true
            })
            if (replaced) {
              editor.view.dispatch(tr)
            }
          }
        } catch {
          // Skip failed individual uploads
        }
      }
    } finally {
      setUploadingBase64(false)
    }
  }, [editor])

  // Remove all base64 images
  const handleRemoveBase64Images = useCallback(() => {
    if (!editor) return
    const html = editor.getHTML()
    const newHtml = html.replace(/<img[^>]+src=["']data:image\/[^"']+["'][^>]*\/?>/gi, '')
    editor.commands.setContent(newHtml)
  }, [editor])

  const brokenLinks = linkResults.filter((r) => !r.ok).length

  return (
    <div className="flex h-full flex-col">
      <Toolbar editor={editor} />
      {/* Base64 images warning bar */}
      {base64Count > 0 && (
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-amber-50 px-4 py-1.5 text-xs text-amber-800">
          <span>⚠ 此文档包含 {base64Count} 张未上传图片</span>
          <button
            type="button"
            className="rounded bg-amber-600 px-2 py-0.5 text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
            onClick={handleUploadBase64Images}
            disabled={uploadingBase64}
          >
            {uploadingBase64 ? '上传中…' : '上传到图床'}
          </button>
          <button
            type="button"
            className="text-amber-600 hover:text-amber-800 cursor-pointer"
            onClick={handleRemoveBase64Images}
          >
            全部移除
          </button>
        </div>
      )}
      <TipTapEditorContent editor={editor} className="editor-wrapper" />
      {editor && (
        <DragHandle editor={editor} tippyOptions={{ duration: 150 }}>
          <BlockMenu editor={editor} />
        </DragHandle>
      )}
      {editor && (
        <BubbleMenu
          editor={editor}
          appendTo={() => document.body}
          shouldShow={({ editor }) => editor.isActive('table')}
          className="z-50"
        >
          <TableBubbleMenuContent editor={editor} />
        </BubbleMenu>
      )}
      <StatusBar
        stats={stats}
        typos={typos}
        sensitive={sensitive}
        onJump={handleJump}
        onIgnoreTypo={handleIgnore}
        onIgnoreSensitive={handleIgnore}
        onLinkRefresh={handleLinkRefresh}
        linkBrokenCount={brokenLinks}
        linkChecking={linkChecking}
        linkResults={linkResults}
      />
      <UploadStatus />
    </div>
  )
}

export { Editor }
