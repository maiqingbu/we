/**
 * ColumnsContainer 节点扩展
 *
 * 使用 ReactNodeViewRenderer 渲染交互式分栏容器：
 * - Flex/Grid 容器布局
 * - 列宽拖拽手柄（hover 变蓝，拖拽实时更新，双击恢复等分）
 * - 浮动工具栏（加列、删列、切换布局等）
 */
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ColumnsContainerView } from './ColumnsContainerView'
import type { ColumnContent, ColumnContentItem } from '@/lib/materials/columns'

// 声明命令类型扩展
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columnsContainer: {
      insertColumns: (
        layout: string,
        widths: number[],
        content: ColumnContent[]
      ) => ReturnType
      deleteColumnsContainer: () => ReturnType
    }
  }
}

export const ColumnsContainer = Node.create({
  name: 'columnsContainer',
  group: 'block',
  content: 'column+',
  isolating: true,
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      layout: { default: 'cols-2' },
      widths: {
        default: [50, 50],
        parseHTML: (el) => {
          try {
            const val = el.getAttribute('data-widths')
            return val ? JSON.parse(val) : [50, 50]
          } catch {
            return [50, 50]
          }
        },
      },
      gap: { default: 16 },
    }
  },

  parseHTML() {
    return [{ tag: 'section[data-columns-container]' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    const widths = node.attrs.widths as number[]
    const gap = node.attrs.gap as number
    const layout = node.attrs.layout as string
    const isGrid = layout.startsWith('grid')
    const gridCols = layout === 'grid-3x3' ? 3 : 2

    const style = isGrid
      ? `display:grid;grid-template-columns:repeat(${gridCols},1fr);gap:${gap}px;margin:1.5em 0;align-items:flex-start;`
      : `display:flex;gap:${gap}px;margin:1.5em 0;align-items:flex-start;`

    return [
      'section',
      mergeAttributes(HTMLAttributes, {
        'data-columns-container': '',
        'data-layout': layout,
        'data-widths': JSON.stringify(widths),
        style,
      }),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnsContainerView)
  },

  addCommands() {
    return {
      insertColumns:
        (layout, widths, content) =>
        ({ tr, state, dispatch }) => {
          try {
            const { schema } = state

            if (!schema.nodes.columnsContainer || !schema.nodes.column) {
              console.warn('[ColumnsContainer] Schema nodes not found')
              return false
            }

            const columnNodes = widths.map((width, index) => {
              const columnContent = content[index] || []
              const innerNodes: any[] = []

              for (const item of columnContent) {
                try {
                  switch (item.type) {
                    case 'paragraph':
                      innerNodes.push(
                        schema.nodes.paragraph.create(null, schema.text(item.text || ''))
                      )
                      break
                    case 'heading': {
                      const level = item.level || 3
                      innerNodes.push(
                        schema.nodes.heading.create({ level }, schema.text(item.text || ''))
                      )
                      break
                    }
                    case 'image':
                      innerNodes.push(
                        schema.nodes.image.create({ src: item.src || '', alt: item.text || '' })
                      )
                      break
                    default:
                      innerNodes.push(
                        schema.nodes.paragraph.create(null, schema.text(''))
                      )
                  }
                } catch (err) {
                  console.warn('[ColumnsContainer] Failed to create inner node:', item, err)
                  innerNodes.push(schema.nodes.paragraph.create(null, schema.text('')))
                }
              }

              if (innerNodes.length === 0) {
                innerNodes.push(schema.nodes.paragraph.create(null, schema.text('')))
              }

              return schema.nodes.column.create({ width }, innerNodes)
            })

            const containerNode = schema.nodes.columnsContainer.create(
              { layout, widths, gap: 16 },
              columnNodes
            )

            if (dispatch) {
              tr.replaceSelectionWith(containerNode)
            }
            return true
          } catch (err) {
            console.error('[ColumnsContainer] insertColumns error:', err)
            return false
          }
        },

      deleteColumnsContainer:
        () =>
        ({ tr, state, dispatch }) => {
          try {
            const { $from } = state.selection
            for (let d = $from.depth; d > 0; d--) {
              const node = $from.node(d)
              if (node.type.name === 'columnsContainer') {
                const pos = $from.before(d)
                if (dispatch) {
                  tr.delete(pos, pos + node.nodeSize)
                }
                return true
              }
            }
          } catch (err) {
            console.error('[ColumnsContainer] deleteColumnsContainer error:', err)
          }
          return false
        },
    }
  },
})
