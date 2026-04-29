import { useState, useEffect, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { getFindReplaceState } from '@/editor/extensions/FindReplace'
import { Search, ChevronUp, ChevronDown, Replace, X, CaseSensitive, Regex, WholeWord } from 'lucide-react'

interface FindReplacePanelProps {
  open: boolean
  replaceMode: boolean
  onClose: () => void
  editor: Editor | null
}

export function FindReplacePanel({ open, replaceMode, onClose, editor }: FindReplacePanelProps) {
  const [query, setQuery] = useState('')
  const [replacement, setReplacement] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(-1)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus search input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50)

      // If there's a selection, use it as the search query
      if (editor) {
        const { from, to } = editor.state.selection
        if (from !== to) {
          const selectedText = editor.state.doc.textBetween(from, to, '\n\n')
          if (selectedText.length > 0 && selectedText.length < 200) {
            setQuery(selectedText)
          }
        }
      }
    } else {
      // Clear highlights when closed
      editor?.commands.clearFind()
      setQuery('')
      setReplacement('')
      setMatchCount(0)
      setCurrentIndex(-1)
    }
  }, [open, editor])

  // Update search when query or options change (debounced)
  useEffect(() => {
    if (!editor || !open) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      if (!query) {
        editor.commands.clearFind()
        setMatchCount(0)
        setCurrentIndex(-1)
        return
      }
      editor.commands.find(query, { caseSensitive, regex: useRegex, wholeWord })
      // Read state after command
      requestAnimationFrame(() => {
        const state = getFindReplaceState(editor)
        if (state) {
          setMatchCount(state.matches.length)
          setCurrentIndex(state.currentIndex)
        }
      })
    }, 150)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, caseSensitive, useRegex, wholeWord, editor, open])

  // Sync state from plugin (for next/prev/replace)
  const syncState = useCallback(() => {
    if (!editor) return
    const state = getFindReplaceState(editor)
    if (state) {
      setMatchCount(state.matches.length)
      setCurrentIndex(state.currentIndex)
    }
  }, [editor])

  const handleFindNext = useCallback(() => {
    if (!editor) return
    editor.commands.findNext()
    syncState()
    // Scroll to match
    const state = getFindReplaceState(editor)
    if (state && state.currentIndex >= 0 && state.matches[state.currentIndex]) {
      const match = state.matches[state.currentIndex]
      editor.chain().setTextSelection({ from: match.from, to: match.to }).scrollIntoView().run()
    }
  }, [editor, syncState])

  const handleFindPrev = useCallback(() => {
    if (!editor) return
    editor.commands.findPrev()
    syncState()
    const state = getFindReplaceState(editor)
    if (state && state.currentIndex >= 0 && state.matches[state.currentIndex]) {
      const match = state.matches[state.currentIndex]
      editor.chain().setTextSelection({ from: match.from, to: match.to }).scrollIntoView().run()
    }
  }, [editor, syncState])

  const handleReplace = useCallback(() => {
    if (!editor || matchCount === 0) return
    editor.commands.replaceMatch(replacement)
    syncState()
    // Scroll to next match
    const state = getFindReplaceState(editor)
    if (state && state.currentIndex >= 0 && state.matches[state.currentIndex]) {
      const match = state.matches[state.currentIndex]
      editor.chain().setTextSelection({ from: match.from, to: match.to }).scrollIntoView().run()
    }
  }, [editor, replacement, matchCount, syncState])

  const handleReplaceAll = useCallback(() => {
    if (!editor || matchCount === 0) return
    const count = matchCount
    editor.commands.replaceAll(replacement)
    syncState()
    // Show feedback
    setMatchCount(0)
    setCurrentIndex(-1)
  }, [editor, replacement, matchCount, syncState])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (e.shiftKey) {
          handleFindPrev()
        } else {
          handleFindNext()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [handleFindNext, handleFindPrev, onClose]
  )

  if (!open) return null

  const OptionButton = ({
    active,
    onClick,
    title,
    children,
  }: {
    active: boolean
    onClick: () => void
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      className={`flex items-center justify-center w-7 h-7 rounded text-xs transition-colors cursor-pointer ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )

  return (
    <div className="border-b border-border bg-background px-3 py-2 flex flex-col gap-1.5 shrink-0 shadow-sm">
      {/* Row 1: Search */}
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="查找..."
          className="flex-1 h-7 rounded border border-border bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        <span className="text-xs text-muted-foreground min-w-[40px] text-center">
          {matchCount > 0 ? `${currentIndex + 1}/${matchCount}` : query ? '0/0' : ''}
        </span>
        <button
          type="button"
          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
          onClick={handleFindPrev}
          title="上一个 (Shift+Enter)"
          disabled={matchCount === 0}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
          onClick={handleFindNext}
          title="下一个 (Enter)"
          disabled={matchCount === 0}
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-0.5 ml-1">
          <OptionButton active={caseSensitive} onClick={() => setCaseSensitive(!caseSensitive)} title="区分大小写">
            <CaseSensitive className="w-4 h-4" />
          </OptionButton>
          <OptionButton active={useRegex} onClick={() => setUseRegex(!useRegex)} title="正则表达式">
            <Regex className="w-4 h-4" />
          </OptionButton>
          <OptionButton active={wholeWord} onClick={() => setWholeWord(!wholeWord)} title="全字匹配">
            <WholeWord className="w-4 h-4" />
          </OptionButton>
        </div>

        <button
          type="button"
          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
          onClick={onClose}
          title="关闭 (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Row 2: Replace */}
      {replaceMode && (
        <div className="flex items-center gap-2">
          <Replace className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="替换..."
            className="flex-1 h-7 rounded border border-border bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            className="h-7 px-2.5 rounded text-xs border border-border text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer disabled:opacity-50"
            onClick={handleReplace}
            disabled={matchCount === 0}
            title="替换当前"
          >
            替换
          </button>
          <button
            type="button"
            className="h-7 px-2.5 rounded text-xs border border-border text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer disabled:opacity-50"
            onClick={handleReplaceAll}
            disabled={matchCount === 0}
            title="全部替换"
          >
            全部替换
          </button>
        </div>
      )}
    </div>
  )
}
