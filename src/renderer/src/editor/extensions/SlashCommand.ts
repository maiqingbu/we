import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import Fuse from 'fuse.js'
import SlashCommandList from './SlashCommandList'
import { SLASH_COMMANDS } from '@/lib/slashCommands'
import type { SlashCommand } from '@/lib/slashCommands'

const fuse = new Fuse(SLASH_COMMANDS, {
  keys: ['title', 'subtitle', 'keywords'],
  threshold: 0.3,
})

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query }: { query: string }) => {
          if (!query) return SLASH_COMMANDS
          return fuse.search(query).map((r) => r.item).slice(0, 10)
        },
        render: () => {
          let component: ReactRenderer
          let popup: ReturnType<typeof tippy>

          return {
            onStart(props: SuggestionProps<SlashCommand>) {
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) return

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })
            },

            onUpdate(props: SuggestionProps<SlashCommand>) {
              component?.updateProps(props)
              if (props.clientRect) {
                popup?.[0].setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                })
              }
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === 'Escape') {
                popup?.[0].hide()
                return true
              }
              return (component?.ref as any)?.onKeyDown(props) ?? false
            },

            onExit() {
              popup?.[0].destroy()
              component?.destroy()
            },
          }
        },
        command: ({ editor, range, props }: { editor: any; range: any; props: SlashCommand }) => {
          // Check if AI command and not configured
          if (props.group === 'AI') {
            // Still allow execution - the action dispatches events that check config
          }
          editor.chain().focus().deleteRange(range).run()
          props.action(editor)
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
