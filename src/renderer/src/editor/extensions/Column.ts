/**
 * Column 节点扩展
 *
 * 表示分栏布局中的单个列，是 columnsContainer 的子节点。
 * 每列有独立的宽度属性，内容为 block+（段落、图片、标题等）。
 */
import { Node, mergeAttributes } from '@tiptap/core'

export const Column = Node.create({
  name: 'column',
  group: 'block',
  content: 'block+',
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      /** 列宽百分比 */
      width: {
        default: 50,
        parseHTML: (el) => parseFloat(el.getAttribute('data-width') || '50'),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'section[data-column]' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'section',
      mergeAttributes(HTMLAttributes, {
        'data-column': '',
        'data-width': node.attrs.width,
        style: `flex: 0 0 ${node.attrs.width}%; min-width: 0; overflow: visible;`,
      }),
      0,
    ]
  },
})
