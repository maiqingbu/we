import { Extension } from '@tiptap/core'
import { markInputRule } from '@tiptap/core'

/**
 * Custom extension to add [text](url) markdown input rule for links.
 * TipTap's built-in Link extension only supports autolink (detecting URLs),
 * not markdown-style link syntax.
 */
export const MarkdownLink = Extension.create({
  name: 'markdownLink',

  addInputRules() {
    return [
      markInputRule({
        // Match [text](url) at end of line
        find: /(?:^|\s)\[([^\]]+)\]\(([^)]+)\)$/,
        type: this.editor.schema.marks.link,
        getAttributes: (match) => ({
          href: match[2],
        }),
      }),
    ]
  },
})
