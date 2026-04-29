import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

export interface SearchMatch {
  from: number
  to: number
}

interface FindReplaceState {
  query: string
  caseSensitive: boolean
  regex: boolean
  wholeWord: boolean
  matches: SearchMatch[]
  currentIndex: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    findReplace: {
      find: (query: string, options?: { caseSensitive?: boolean; regex?: boolean; wholeWord?: boolean }) => ReturnType
      findNext: () => ReturnType
      findPrev: () => ReturnType
      replaceMatch: (replacement: string) => ReturnType
      replaceAll: (replacement: string) => ReturnType
      clearFind: () => ReturnType
      setFindIndex: (index: number) => ReturnType
    }
  }
}

const findReplaceKey = new PluginKey('findReplace')

/**
 * Build a posMap mapping plainText index → ProseMirror doc position.
 * Matches Tiptap getTextBetween semantics.
 */
function buildPosMap(doc: ProseMirrorNode): number[] {
  const posMap: number[] = []
  const blockSeparator = '\n\n'

  doc.nodesBetween(0, doc.content.size, (node: ProseMirrorNode, pos: number, _parent: any, _index: number) => {
    if (node.isBlock && pos > 0) {
      for (let i = 0; i < blockSeparator.length; i++) {
        posMap.push(-1)
      }
    }

    if (node.isText) {
      const text = node.text || ''
      for (let i = 0; i < text.length; i++) {
        posMap.push(pos + i)
      }
    }

    return true
  })

  return posMap
}

function resolvePos(posMap: number[], offset: number): number | null {
  if (offset < 0 || offset >= posMap.length) return null
  const pos = posMap[offset]
  return pos < 0 ? null : pos
}

/**
 * Find all matches in the document text.
 */
function findMatches(
  docText: string,
  query: string,
  caseSensitive: boolean,
  useRegex: boolean,
  wholeWord: boolean
): Array<{ start: number; end: number }> {
  if (!query) return []

  const results: Array<{ start: number; end: number }> = []

  if (useRegex) {
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      const re = new RegExp(query, flags)
      let m: RegExpExecArray | null
      while ((m = re.exec(docText)) !== null) {
        results.push({ start: m.index, end: m.index + m[0].length })
        if (m[0].length === 0) break // prevent infinite loop on zero-length match
      }
    } catch {
      // invalid regex — return empty
      return []
    }
  } else {
    const haystack = caseSensitive ? docText : docText.toLowerCase()
    const needle = caseSensitive ? query : query.toLowerCase()
    let idx = 0
    while ((idx = haystack.indexOf(needle, idx)) !== -1) {
      const end = idx + needle.length
      if (wholeWord) {
        const before = idx > 0 ? docText[idx - 1] : ' '
        const after = end < docText.length ? docText[end] : ' '
        const isWordChar = (c: string) => /\w/.test(c)
        if (isWordChar(before) || isWordChar(after)) {
          idx = end
          continue
        }
      }
      results.push({ start: idx, end })
      idx = end
    }
  }

  return results
}

export const FindReplace = Extension.create({
  name: 'findReplace',

  addCommands() {
    return {
      find:
        (query: string, options?: { caseSensitive?: boolean; regex?: boolean; wholeWord?: boolean }) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(findReplaceKey, {
              type: 'find',
              query,
              caseSensitive: options?.caseSensitive ?? false,
              regex: options?.regex ?? false,
              wholeWord: options?.wholeWord ?? false,
            })
          }
          return true
        },

      findNext:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(findReplaceKey, { type: 'next' })
          }
          return true
        },

      findPrev:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(findReplaceKey, { type: 'prev' })
          }
          return true
        },

      replaceMatch:
        (replacement: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(findReplaceKey, { type: 'replace', replacement })
          }
          return true
        },

      replaceAll:
        (replacement: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(findReplaceKey, { type: 'replaceAll', replacement })
          }
          return true
        },

      clearFind:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(findReplaceKey, { type: 'clear' })
          }
          return true
        },

      setFindIndex:
        (index: number) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(findReplaceKey, { type: 'setIndex', index })
          }
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    let state: FindReplaceState = {
      query: '',
      caseSensitive: false,
      regex: false,
      wholeWord: false,
      matches: [],
      currentIndex: -1,
    }

    // Expose state getter for the UI component
    const getState = () => state

    const plugin = new Plugin({
      key: findReplaceKey,

      state: {
        init: () => DecorationSet.empty,

        apply(tr, _oldDecorations, _oldState, newState) {
          const meta = tr.getMeta(findReplaceKey)

          if (meta) {
            switch (meta.type) {
              case 'find': {
                state = {
                  ...state,
                  query: meta.query,
                  caseSensitive: meta.caseSensitive,
                  regex: meta.regex,
                  wholeWord: meta.wholeWord,
                }
                const docText = newState.doc.textBetween(0, newState.doc.content.size, '\n\n')
                const rawMatches = findMatches(docText, state.query, state.caseSensitive, state.regex, state.wholeWord)
                const posMap = buildPosMap(newState.doc)
                state.matches = rawMatches
                  .map((m) => {
                    const from = resolvePos(posMap, m.start)
                    const to = resolvePos(posMap, m.end - 1)
                    if (from === null || to === null || from >= to) return null
                    return { from, to: to + 1 }
                  })
                  .filter(Boolean) as SearchMatch[]
                state.currentIndex = state.matches.length > 0 ? 0 : -1
                break
              }
              case 'next': {
                if (state.matches.length > 0) {
                  state.currentIndex = (state.currentIndex + 1) % state.matches.length
                }
                break
              }
              case 'prev': {
                if (state.matches.length > 0) {
                  state.currentIndex = (state.currentIndex - 1 + state.matches.length) % state.matches.length
                }
                break
              }
              case 'setIndex': {
                if (meta.index >= 0 && meta.index < state.matches.length) {
                  state.currentIndex = meta.index
                }
                break
              }
              case 'replace': {
                if (state.matches.length > 0 && state.currentIndex >= 0) {
                  const match = state.matches[state.currentIndex]
                  if (match) {
                    tr.replaceWith(match.from, match.to, newState.schema.text(meta.replacement))
                    // Recalculate matches after replace
                    const newDoc = tr.doc
                    const docText = newDoc.textBetween(0, newDoc.content.size, '\n\n')
                    const rawMatches = findMatches(docText, state.query, state.caseSensitive, state.regex, state.wholeWord)
                    const posMap = buildPosMap(newDoc)
                    state.matches = rawMatches
                      .map((m) => {
                        const from = resolvePos(posMap, m.start)
                        const to = resolvePos(posMap, m.end - 1)
                        if (from === null || to === null || from >= to) return null
                        return { from, to: to + 1 }
                      })
                      .filter(Boolean) as SearchMatch[]
                    // Keep currentIndex, but clamp
                    if (state.currentIndex >= state.matches.length) {
                      state.currentIndex = Math.max(0, state.matches.length - 1)
                    }
                  }
                }
                break
              }
              case 'replaceAll': {
                if (state.matches.length > 0) {
                  // Replace from back to front to preserve positions
                  const sorted = [...state.matches].sort((a, b) => b.from - a.from)
                  for (const match of sorted) {
                    tr.replaceWith(match.from, match.to, newState.schema.text(meta.replacement))
                  }
                  state.matches = []
                  state.currentIndex = -1
                }
                break
              }
              case 'clear': {
                state = {
                  query: '',
                  caseSensitive: false,
                  regex: false,
                  wholeWord: false,
                  matches: [],
                  currentIndex: -1,
                }
                break
              }
            }
          }

          // Build decorations from current state
          if (state.matches.length === 0 || !state.query) {
            return DecorationSet.empty
          }

          const decorations: Decoration[] = state.matches.map((match, i) => {
            const isCurrent = i === state.currentIndex
            return Decoration.inline(match.from, match.to, {
              class: isCurrent ? 'find-match-current' : 'find-match',
              style: isCurrent
                ? 'background-color: #22c55e; color: #fff; border-radius: 2px;'
                : 'background-color: #fef08a; border-radius: 2px;',
            })
          })

          return DecorationSet.create(tr.doc || newState.doc, decorations)
        },
      },

      props: {
        decorations(state) {
          return plugin.getState(state)
        },
      },
    })

    // Attach getState to the plugin for external access
    ;(plugin as any).findReplaceState = getState

    return [plugin]
  },
})

/**
 * Get the current find/replace state from the editor's plugin.
 */
export function getFindReplaceState(editor: any): FindReplaceState | null {
  const plugin = editor.state.plugins?.find((p: any) => p.key === findReplaceKey.key)
  if (!plugin) return null
  return (plugin as any).findReplaceState?.() ?? null
}
