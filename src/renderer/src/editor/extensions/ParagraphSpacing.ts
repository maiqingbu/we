import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphSpacing: {
      setParagraphSpacing: (spacing: string) => ReturnType
      unsetParagraphSpacing: () => ReturnType
    }
  }
}

export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          paragraphSpacing: {
            default: null,
            parseHTML: (element) => element.style.marginBottom || null,
            renderHTML: (attributes) => {
              if (!attributes.paragraphSpacing) return {}
              return { style: `margin-bottom: ${attributes.paragraphSpacing}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setParagraphSpacing:
        (spacing: string) =>
        ({ commands }) => {
          return commands.updateAttributes('paragraph', { paragraphSpacing: spacing })
        },
      unsetParagraphSpacing:
        () =>
        ({ commands }) => {
          return commands.resetAttributes('paragraph', 'paragraphSpacing')
        },
    }
  },
})
