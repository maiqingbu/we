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
import type { LintIssue } from './extensions/LintHighlight'

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
  const lintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const brokenLinks = linkResults.filter((r) => !r.ok).length

  return (
    <div className="flex h-full flex-col">
      <Toolbar editor={editor} />
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
          updateDelay={100}
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
    </div>
  )
}

export { Editor }
