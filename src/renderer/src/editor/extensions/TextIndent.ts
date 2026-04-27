import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textIndent: {
      indent: () => ReturnType
      outdent: () => ReturnType
    }
  }
}

export const TextIndent = Extension.create({
  name: 'textIndent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          textIndent: {
            default: null,
            parseHTML: (element) => element.style.textIndent || null,
            renderHTML: (attributes) => {
              if (!attributes.textIndent) return {}
              return { style: `text-indent: ${attributes.textIndent}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ commands }) => {
          return commands.updateAttributes('paragraph', { textIndent: '2em' })
        },
      outdent:
        () =>
        ({ commands }) => {
          return commands.resetAttributes('paragraph', 'textIndent')
        },
    }
  },
})
