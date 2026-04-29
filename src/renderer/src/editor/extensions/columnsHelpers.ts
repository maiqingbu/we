/**
 * 图文混排辅助函数
 *
 * 提供嵌套深度检测、列数获取、列宽重置、添加/删除列等操作。
 */
import type { Editor } from '@tiptap/core'

// ============================================================
// 嵌套深度检测
// ============================================================

/**
 * 计算当前位置的 columnsContainer 嵌套深度
 * @param editor TipTap 编辑器实例
 * @param pos 当前文档位置
 * @returns 嵌套层数（0 表示不在任何 columnsContainer 内）
 */
export function getNestingDepth(editor: Editor, pos: number): number {
  if (pos == null || typeof pos !== 'number') return 0
  try {
    const { $pos } = editor.state.doc.resolve(pos)
    let depth = 0
    for (let d = $pos.depth; d > 0; d--) {
      const node = $pos.node(d)
      if (node.type.name === 'columnsContainer') {
        depth++
      }
    }
    return depth
  } catch {
    return 0
  }
}

// ============================================================
// 列数获取
// ============================================================

/**
 * 获取当前位置所在容器的列数
 * @param editor TipTap 编辑器实例
 * @param pos 当前文档位置
 * @returns 列数，如果不在容器内则返回 0
 */
export function getColumnCount(editor: Editor, pos: number): number {
  if (pos == null || typeof pos !== 'number') return 0
  try {
    const { $pos } = editor.state.doc.resolve(pos)
    for (let d = $pos.depth; d > 0; d--) {
      const node = $pos.node(d)
      if (node.type.name === 'columnsContainer') {
        return node.childCount
      }
    }
  } catch { /* ignore */ }
  return 0
}

// ============================================================
// 获取容器节点和位置
// ============================================================

/**
 * 查找当前位置所在的 columnsContainer 节点及其文档位置
 * @param editor TipTap 编辑器实例
 * @param pos 当前文档位置
 * @returns 容器节点和位置，如果不在容器内则返回 null
 */
export function findColumnsContainer(
  editor: Editor,
  pos: number
): { node: ReturnType<Editor['state']['doc']['nodeAt']> & { attrs: Record<string, any> }; containerPos: number } | null {
  if (pos == null || typeof pos !== 'number') return null
  try {
    const { $pos } = editor.state.doc.resolve(pos)
    for (let d = $pos.depth; d > 0; d--) {
      const node = $pos.node(d)
      if (node.type.name === 'columnsContainer') {
        const containerPos = $pos.before(d)
        const resolvedNode = editor.state.doc.nodeAt(containerPos)
        if (resolvedNode) {
          return { node: resolvedNode as any, containerPos }
        }
      }
    }
  } catch { /* ignore */ }
  return null
}

// ============================================================
// 重置列宽
// ============================================================

/**
 * 重置当前容器的列宽为等分
 * @param editor TipTap 编辑器实例
 * @param pos 当前文档位置
 */
export function resetColumnWidths(editor: Editor, pos: number): boolean {
  const container = findColumnsContainer(editor, pos)
  if (!container) return false

  const { node, containerPos } = container
  const count = node.childCount
  if (count === 0) return false

  // 等分宽度
  const equalWidth = Math.floor(100 / count)
  const widths = Array(count).fill(equalWidth) as number[]
  // 修正舍入误差，确保总和为 100
  widths[0] += 100 - widths.reduce((a, b) => a + b, 0)

  const tr = editor.state.tr
  tr.setNodeMarkup(containerPos, undefined, {
    ...node.attrs,
    widths,
  })

  // 同时更新每个 column 子节点的 width 属性
  let childPos = containerPos + 1
  for (let i = 0; i < count; i++) {
    const child = node.child(i)
    tr.setNodeMarkup(childPos, undefined, {
      ...child.attrs,
      width: widths[i],
    })
    childPos += child.nodeSize
  }

  editor.view.dispatch(tr)
  return true
}

// ============================================================
// 添加列
// ============================================================

/**
 * 在指定侧添加新列
 * @param editor TipTap 编辑器实例
 * @param pos 当前文档位置
 * @param side 添加方向：'left' 或 'right'
 */
export function addColumn(editor: Editor, pos: number, side: 'left' | 'right'): boolean {
  const container = findColumnsContainer(editor, pos)
  if (!container) return false

  const { node, containerPos } = container
  const count = node.childCount
  if (count >= 6) {
    // 最多支持 6 列
    return false
  }

  const newCount = count + 1
  const equalWidth = Math.floor(100 / newCount)
  const newWidths = Array(newCount).fill(equalWidth) as number[]
  newWidths[0] += 100 - newWidths.reduce((a, b) => a + b, 0)

  const { schema } = editor.state
  const newColumn = schema.nodes.column.create({
    width: equalWidth,
  })

  const tr = editor.state.tr

  if (side === 'left') {
    // 在第一个 column 之前插入
    const firstChildPos = containerPos + 1
    tr.insert(firstChildPos, newColumn)
  } else {
    // 在最后一个 column 之后插入
    let insertPos = containerPos + 1
    for (let i = 0; i < count; i++) {
      insertPos += node.child(i).nodeSize
    }
    tr.insert(insertPos, newColumn)
  }

  // 更新容器 widths 属性
  tr.setNodeMarkup(containerPos, undefined, {
    ...node.attrs,
    widths: newWidths,
  })

  // 更新所有 column 子节点的 width 属性（包括新列）
  let childPos = containerPos + 1
  for (let i = 0; i < newCount; i++) {
    const child = tr.doc.nodeAt(childPos)
    if (child) {
      tr.setNodeMarkup(childPos, undefined, {
        ...child.attrs,
        width: newWidths[i],
      })
    }
    childPos += (tr.doc.nodeAt(childPos)?.nodeSize || 1)
  }

  editor.view.dispatch(tr)
  return true
}

// ============================================================
// 删除列
// ============================================================

/**
 * 删除当前光标所在的列（至少保留 1 列）
 * @param editor TipTap 编辑器实例
 * @param pos 当前文档位置
 */
export function removeColumn(editor: Editor, pos: number): boolean {
  const { $pos } = editor.state.doc.resolve(pos)

  // 找到当前所在的 column 节点
  let columnPos = -1
  let columnDepth = -1

  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d)
    if (node.type.name === 'column') {
      columnPos = $pos.before(d)
      columnDepth = d
      break
    }
  }

  if (columnPos === -1) return false

  // 找到父级 columnsContainer
  const containerNode = $pos.node(columnDepth - 1)
  if (containerNode.type.name !== 'columnsContainer') return false

  // 至少保留 1 列
  if (containerNode.childCount <= 1) return false

  const containerPos = $pos.before(columnDepth - 1)
  const columnNode = editor.state.doc.nodeAt(columnPos)
  if (!columnNode) return false

  const tr = editor.state.tr

  // 删除当前列
  tr.delete(columnPos, columnPos + columnNode.nodeSize)

  // 重新计算宽度
  const newCount = containerNode.childCount - 1
  const equalWidth = Math.floor(100 / newCount)
  const newWidths = Array(newCount).fill(equalWidth) as number[]
  newWidths[0] += 100 - newWidths.reduce((a, b) => a + b, 0)

  // 更新容器 widths
  tr.setNodeMarkup(containerPos, undefined, {
    ...containerNode.attrs,
    widths: newWidths,
  })

  // 更新剩余 column 的 width
  let childPos = containerPos + 1
  for (let i = 0; i < newCount; i++) {
    const child = tr.doc.nodeAt(childPos)
    if (child) {
      tr.setNodeMarkup(childPos, undefined, {
        ...child.attrs,
        width: newWidths[i],
      })
    }
    childPos += (tr.doc.nodeAt(childPos)?.nodeSize || 1)
  }

  editor.view.dispatch(tr)
  return true
}

// ============================================================
// 更新列宽
// ============================================================

/**
 * 更新容器的列宽数组
 * @param editor TipTap 编辑器实例
 * @param containerPos 容器的文档位置
 * @param widths 新的宽度数组（总和必须为 100）
 */
export function updateColumnWidths(
  editor: Editor,
  containerPos: number,
  widths: number[]
): boolean {
  if (containerPos == null || typeof containerPos !== 'number') return false
  try {
    const node = editor.state.doc.nodeAt(containerPos)
    if (!node || node.type.name !== 'columnsContainer') return false
    if (widths.length !== node.childCount) return false

    const tr = editor.state.tr
    tr.setNodeMarkup(containerPos, undefined, {
      ...node.attrs,
      widths,
    })

    let childPos = containerPos + 1
    for (let i = 0; i < widths.length; i++) {
      const child = node.child(i)
      tr.setNodeMarkup(childPos, undefined, {
        ...child.attrs,
        width: widths[i],
      })
      childPos += child.nodeSize
    }

    editor.view.dispatch(tr)
  } catch { /* ignore */ }
  return true
}
