import { Node, mergeAttributes } from '@tiptap/core'
import type { Editor } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    templateBlock: {
      insertTemplateBlock: (materialId: string, html: string) => ReturnType
    }
  }
}

export const TemplateBlock = Node.create({
  name: 'templateBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      html: {
        default: '',
        rendered: false, // 不渲染到 DOM 属性上，仅存储在 ProseMirror 节点中
      },
      materialId: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'section[data-template-id]',
        getAttrs: (dom) => {
          const el = dom as HTMLElement
          return {
            materialId: el.getAttribute('data-template-id') || '',
            html: el.innerHTML || '',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    // atom 叶节点不能有 content hole（0），否则序列化会抛出
    // "Content hole not allowed in a leaf node spec"
    // html 内容存储在 attrs 中，序列化时通过 getEditorHtml 展开
    return [
      'section',
      mergeAttributes(HTMLAttributes, {
        'data-template-id': node.attrs.materialId || '',
        'data-material-id': node.attrs.materialId || '',
      }),
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const container = document.createElement('section')
      container.setAttribute('data-template-id', node.attrs.materialId || '')
      container.setAttribute('data-material-id', node.attrs.materialId || '')
      container.innerHTML = node.attrs.html

      let isEditing = false

      container.contentEditable = 'false'
      container.style.cursor = 'default'
      container.style.position = 'relative'

      container.addEventListener('mouseenter', () => {
        if (!isEditing) {
          container.style.outline = '2px dashed rgba(59, 130, 246, 0.3)'
          container.style.outlineOffset = '2px'
          container.style.borderRadius = '4px'
        }
      })
      container.addEventListener('mouseleave', () => {
        if (!isEditing) {
          container.style.outline = 'none'
        }
      })

      container.addEventListener('dblclick', (e) => {
        e.preventDefault()
        e.stopPropagation()
        isEditing = true
        container.contentEditable = 'true'
        container.style.outline = '2px solid rgba(59, 130, 246, 0.6)'
        container.style.outlineOffset = '2px'
        container.style.borderRadius = '4px'
        container.style.cursor = 'text'

        // 让所有子元素可编辑
        container.querySelectorAll('[data-editable]').forEach((el) => {
          ;(el as HTMLElement).contentEditable = 'true'
        })

        const firstEditable = container.querySelector('[data-editable]')
        if (firstEditable) {
          ;(firstEditable as HTMLElement).focus()
        } else {
          container.focus()
        }
      })

      const handleDocClick = (e: MouseEvent) => {
        if (!container.contains(e.target as globalThis.Node)) {
          isEditing = false
          container.contentEditable = 'false'
          container.style.outline = 'none'
          container.style.cursor = 'default'
          container.querySelectorAll('[data-editable]').forEach((el) => {
            ;(el as HTMLElement).contentEditable = 'false'
          })
        }
      }
      document.addEventListener('click', handleDocClick)

      return {
        dom: container,
        stopEvent(event) {
          // 当处于编辑模式时，阻止 ProseMirror 拦截键盘和输入事件
          if (isEditing && (event.type === 'input' || event.type === 'keydown' || event.type === 'keyup' || event.type === 'keypress')) {
            return true
          }
          return false
        },
        update(updatedNode) {
          if (
            updatedNode.attrs.html !== node.attrs.html ||
            updatedNode.attrs.materialId !== node.attrs.materialId
          ) {
            container.innerHTML = updatedNode.attrs.html
            container.setAttribute('data-material-id', updatedNode.attrs.materialId || '')
            container.setAttribute('data-template-id', updatedNode.attrs.materialId || '')
          }
          return true
        },
        destroy() {
          document.removeEventListener('click', handleDocClick)
        },
      }
    }
  },

  addCommands() {
    return {
      insertTemplateBlock:
        (materialId, html) =>
        ({ tr, state, dispatch }) => {
          const node = state.schema.nodes.templateBlock.create({ html, materialId })
          if (dispatch) {
            tr.replaceSelectionWith(node)
          }
          return true
        },
    }
  },
})

/**
 * 获取编辑器完整 HTML，将 templateBlock 节点的 html attr 展开为实际内容。
 *
 * 原理：atom 节点的 renderHTML 返回空 section 标签，
 * 所以 editor.getHTML() 只会输出 <section data-template-id="xxx"></section>。
 * 这个函数在序列化后，遍历所有 templateBlock 节点，用 node.attrs.html 填充对应 section。
 */
export function getEditorHtml(editor: Editor): string {
  const { doc } = editor.state

  // 收集所有 templateBlock 节点的 materialId → html 映射
  const htmlMap = new Map<string, string>()
  doc.descendants((node) => {
    if (node.type.name === 'templateBlock' && node.attrs.materialId) {
      htmlMap.set(node.attrs.materialId, node.attrs.html || '')
    }
    return true
  })

  // 如果没有 templateBlock，直接返回原始 HTML
  if (htmlMap.size === 0) {
    return editor.getHTML()
  }

  // 用正则替换空的 section 标签为包含实际内容的 section
  let html = editor.getHTML()
  htmlMap.forEach((htmlContent, materialId) => {
    // 匹配 <section data-template-id="xxx"></section> 或 <section data-template-id="xxx" data-material-id="xxx"></section>
    const escapedId = materialId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(
      `<section([^>]*data-template-id="${escapedId}"[^>]*)>\\s*</section>`,
      'g'
    )
    html = html.replace(regex, `<section$1>${htmlContent}</section>`)
  })

  return html
}
