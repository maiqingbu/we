import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (font: string) => ReturnType
      unsetFontFamily: () => ReturnType
    }
  }
}

export const FontFamily = Extension.create({
  name: 'fontFamily',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily?.replace(/['"]+/g, '') || null,
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {}
              return { style: `font-family: ${attributes.fontFamily}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily: string) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontFamily }).run()
        },
      unsetFontFamily:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run()
        },
    }
  },
})
