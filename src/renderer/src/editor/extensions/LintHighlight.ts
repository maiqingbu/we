import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/react'

export interface LintIssue {
  start: number
  end: number
  type: 'typo' | 'sensitive-high' | 'sensitive-medium' | 'sensitive-low'
  word: string
  suggestion: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lintHighlight: {
      setLintIssues: (issues: LintIssue[]) => ReturnType
      clearLintIssues: () => ReturnType
    }
  }
}

const lintKey = new PluginKey('lintHighlight')

/**
 * Build posMap that exactly matches Tiptap's getTextBetween output.
 *
 * getTextBetween uses:
 *   1. blockSeparator before every block where pos > from
 *   2. textSerializers (from schema renderText) for nodes that have them
 *   3. Plain text from text nodes
 *
 * We replicate this logic so each index in the resulting text maps to a
 * ProseMirror document position (or -1 for separator chars).
 */
function buildPosMap(doc: ProseMirrorNode, textSerializers: Record<string, (ctx: any) => string>): number[] {
  const posMap: number[] = []
  const from = 0
  const to = doc.content.size
  const blockSeparator = '\n\n'

  doc.nodesBetween(from, to, (node: ProseMirrorNode, pos: number, parent: any, index: number) => {
    // Separator before every block node (except the first)
    if (node.isBlock && pos > from) {
      for (let i = 0; i < blockSeparator.length; i++) {
        posMap.push(-1)
      }
    }

    // Check for text serializer (e.g. hardBreak → "\n")
    const serializer = textSerializers[node.type.name]
    if (serializer) {
      const rendered = serializer({ node, pos, parent, index })
      // Each rendered char maps to this node's position
      for (let i = 0; i < rendered.length; i++) {
        posMap.push(pos)
      }
      return false // Don't descend into children
    }

    // Plain text nodes
    if (node.isText) {
      const text = node.text || ''
      const start = Math.max(from, pos) - pos
      const end = Math.min(text.length, to - pos)
      for (let i = start; i < end; i++) {
        posMap.push(pos + i)
      }
    }

    return true
  })

  return posMap
}

/**
 * Get text serializers from the editor's schema (matches Tiptap's getTextSerializersFromSchema).
 */
function getTextSerializers(editor: Editor): Record<string, (ctx: any) => string> {
  const serializers: Record<string, (ctx: any) => string> = {}
  const schema = editor.schema
  for (const [name, nodeType] of Object.entries(schema.nodes)) {
    const spec = (nodeType as any).spec
    if (spec?.toText) {
      serializers[name] = spec.toText
    }
  }
  return serializers
}

/**
 * Find all occurrences of `word` in `text`.
 */
function findAllOccurrences(text: string, word: string): Array<{ from: number; to: number }> {
  const results: Array<{ from: number; to: number }> = []
  let idx = 0
  while ((idx = text.indexOf(word, idx)) !== -1) {
    results.push({ from: idx, to: idx + word.length })
    idx += word.length
  }
  return results
}

/**
 * Resolve a plainText offset to a ProseMirror document position.
 */
function resolvePos(posMap: number[], offset: number): number | null {
  if (offset < 0 || offset >= posMap.length) return null
  const pos = posMap[offset]
  return pos < 0 ? null : pos
}

function lintColor(type: LintIssue['type']): string {
  switch (type) {
    case 'typo':
      return 'red'
    case 'sensitive-high':
      return 'orange'
    case 'sensitive-medium':
      return '#eab308'
    case 'sensitive-low':
      return '#9ca3af'
  }
}

/**
 * Jump to a lint issue in the editor.
 */
export function jumpToLintIssue(editor: Editor, word: string, start: number, end: number): void {
  const text = editor.getText()
  const serializers = getTextSerializers(editor)
  const posMap = buildPosMap(editor.state.doc, serializers)

  // Verify the word matches at the expected position
  const actualWord = text.slice(start, end)
  let from: number | null = null
  let to: number | null = null

  if (actualWord === word) {
    from = resolvePos(posMap, start)
    to = resolvePos(posMap, end - 1)
  }

  // Fallback: search for the word in the text
  if (from === null || to === null || from >= to) {
    const occurrences = findAllOccurrences(text, word)
    if (occurrences.length > 0) {
      const best = occurrences.reduce((closest, occ) => {
        return Math.abs(occ.from - start) < Math.abs(closest.from - start) ? occ : closest
      })
      from = resolvePos(posMap, best.from)
      to = resolvePos(posMap, best.to - 1)
    }
  }

  if (from !== null && to !== null && from < to) {
    editor.chain().focus().setTextSelection({ from, to: to + 1 }).scrollIntoView().run()
  }
}

export const LintHighlight = Extension.create({
  name: 'lintHighlight',

  addCommands() {
    return {
      setLintIssues:
        (issues: LintIssue[]) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(lintKey, { issues })
          }
          return true
        },
      clearLintIssues:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(lintKey, { issues: [] })
          }
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    let currentIssues: LintIssue[] = []

    const plugin = new Plugin({
      key: lintKey,
      state: {
        init: () => DecorationSet.empty,

        apply(tr, _oldDecorations, _oldState, newState) {
          const meta = tr.getMeta(lintKey)
          if (meta && meta.issues !== undefined) {
            currentIssues = meta.issues
          }

          if (!tr.docChanged && !meta) return _oldDecorations

          // Get text serializers from schema
          const serializers: Record<string, (ctx: any) => string> = {}
          // We can't access editor directly in plugin, so build from newState's schema
          // The schema is available via newState.schema
          const schema = newState.schema
          for (const [name, nodeType] of Object.entries(schema.nodes)) {
            const spec = (nodeType as any).spec
            if (spec?.toText) {
              serializers[name] = spec.toText
            }
          }

          const posMap = buildPosMap(newState.doc, serializers)

          const decorations: Decoration[] = []
          for (const issue of currentIssues) {
            const decFrom = resolvePos(posMap, issue.start)
            const decTo = resolvePos(posMap, issue.end - 1)
            if (decFrom === null || decTo === null) continue
            if (decFrom >= decTo) continue

            const color = lintColor(issue.type)
            decorations.push(
              Decoration.inline(decFrom, decTo + 1, {
                class: 'lint-highlight',
                style: `text-decoration: underline wavy ${color}; text-decoration-skip-ink: none; cursor: help;`,
                'data-lint-word': issue.word,
                'data-lint-suggestion': issue.suggestion,
                'data-lint-type': issue.type,
              })
            )
          }

          return DecorationSet.create(newState.doc, decorations)
        },
      },
      props: {
        decorations(state) {
          return plugin.getState(state)
        },
      },
    })

    return [plugin]
  },
})
