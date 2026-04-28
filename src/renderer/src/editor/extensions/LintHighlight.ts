import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

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
 * Build a mapping: plainTextOffset → docPosition.
 *
 * We reconstruct exactly what doc.getText() does:
 * - Walk text nodes in document order
 * - Insert virtual \n between consecutive block-level nodes
 * - Record each character's doc position
 *
 * This is O(n) in document size and only runs when issues update.
 */
function buildOffsetMap(doc: ProseMirrorNode): Int32Array {
  // getText() on a typical doc with 10k chars produces ~10k entries.
  // Pre-allocate generously.
  const map: number[] = []
  let hadContent = false

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.isText) {
      const text = node.text || ''
      for (let i = 0; i < text.length; i++) {
        map.push(pos + i)
      }
      hadContent = true
    } else if (node.isBlock && !node.isLeaf) {
      // getText() inserts \n between block siblings.
      // We detect this by checking if we've seen content before
      // this block node starts.
      if (hadContent) {
        map.push(-1) // virtual \n — no valid doc position
      }
    }
    // Leaf blocks (image, horizontalRule) produce nothing in getText()
    // but they are block nodes, so the next block will get a \n.
    // We don't need special handling since hadContent tracks text only.
    return true
  })

  return new Int32Array(map)
}

function resolvePos(map: Int32Array, offset: number): number | null {
  if (offset < 0 || offset >= map.length) return null
  const pos = map[offset]
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

        apply(tr, oldDecorations, _oldState, newState) {
          const meta = tr.getMeta(lintKey)
          if (meta && meta.issues !== undefined) {
            currentIssues = meta.issues
          }

          if (!tr.docChanged && !meta) return oldDecorations

          const offsetMap = buildOffsetMap(newState.doc)
          const decorations: Decoration[] = []

          for (const issue of currentIssues) {
            const from = resolvePos(offsetMap, issue.start)
            const to = resolvePos(offsetMap, issue.end)
            if (from === null || to === null) continue
            if (from >= to) continue

            const color = lintColor(issue.type)

            decorations.push(
              Decoration.inline(from, to, {
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
