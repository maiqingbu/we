/**
 * 导出时将 <section data-columns-container> 转为 <table>
 *
 * 微信公众号不支持 flexbox/grid 布局，需要将分栏转为 table 结构。
 * 处理规则：
 * - 普通横向多栏 → 单行多列 table
 * - grid-2x2 → 2行2列 table
 * - grid-3x3 → 3行3列 table
 * - 嵌套分栏 → 嵌套 table
 * - 每个 td 的 width 用百分比
 * - 第一个 block 元素移除 margin-top（防止首行不齐）
 * - 列内 img 强制 max-width:100%; height:auto
 */

/**
 * 将 HTML 中的 columns-container 转为 table 结构
 * @param html 输入 HTML
 * @returns 转换后的 HTML
 */
export function convertColumnsToTable(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  // 查找所有 columns-container
  const containers = body.querySelectorAll('section[data-columns-container]')

  containers.forEach((container) => {
    const el = container as HTMLElement
    const layout = el.getAttribute('data-layout') || 'cols-2'
    const widthsAttr = el.getAttribute('data-widths') || '[]'
    let widths: number[]

    try {
      widths = JSON.parse(widthsAttr)
    } catch {
      widths = [50, 50]
    }

    // 获取所有 column 子节点
    const columns = el.querySelectorAll(':scope > section[data-column]')

    if (columns.length === 0) return

    // 创建 table
    const table = doc.createElement('table')
    table.setAttribute('width', '100%')
    table.setAttribute('cellspacing', '0')
    table.setAttribute('cellpadding', '0')
    table.style.borderCollapse = 'collapse'
    table.style.width = '100%'
    table.style.tableLayout = 'fixed'

    // 判断是否为网格布局
    const isGrid = layout.startsWith('grid')
    const gridCols = layout === 'grid-3x3' ? 3 : 2
    const gridRows = layout === 'grid-3x3' ? 3 : 2

    if (isGrid) {
      // 网格布局：按行列排列
      // 每个 column 内的 block 节点按顺序填入网格
      for (let row = 0; row < gridRows; row++) {
        const tr = doc.createElement('tr')

        for (let col = 0; col < gridCols; col++) {
          const td = doc.createElement('td')
          const colWidth = widths[col] || Math.floor(100 / gridCols)
          td.setAttribute('width', `${colWidth}%`)
          td.style.verticalAlign = 'top'
          td.style.padding = '0'
          td.style.border = 'none'

          // 找到对应的 column 和其中的第 row 个 block
          const columnEl = columns[col]
          if (columnEl) {
            const blocks = getBlockElements(columnEl)
            const block = blocks[row]
            if (block) {
              // 递归处理嵌套的 columns-container
              const processedBlock = processNestedColumns(block, doc)
              td.appendChild(processedBlock)

              // 移除第一个元素的 margin-top
              removeFirstMarginTop(td)
            }
          }

          tr.appendChild(td)
        }

        table.appendChild(tr)
      }
    } else {
      // 普通横向布局：单行多列
      const tr = doc.createElement('tr')

      columns.forEach((columnEl, index) => {
        const td = doc.createElement('td')
        const colWidth = widths[index] || Math.floor(100 / columns.length)
        td.setAttribute('width', `${colWidth}%`)
        td.style.verticalAlign = 'top'
        td.style.padding = '0'
        td.style.border = 'none'

        // 将 column 内的所有 block 元素移入 td
        const blocks = getBlockElements(columnEl)
        blocks.forEach((block) => {
          // 递归处理嵌套的 columns-container
          const processedBlock = processNestedColumns(block, doc)
          td.appendChild(processedBlock)
        })

        // 移除第一个元素的 margin-top
        removeFirstMarginTop(td)

        // 强制列内 img 自适应
        td.querySelectorAll('img').forEach((img) => {
          ;(img as HTMLImageElement).style.maxWidth = '100%'
          ;(img as HTMLImageElement).style.height = 'auto'
        })

        tr.appendChild(td)
      })

      table.appendChild(tr)
    }

    // 用 table 替换原来的 container
    el.parentNode?.replaceChild(table, el)
  })

  // 序列化回 HTML
  const serializer = new XMLSerializer()
  let result = serializer.serializeToString(body)
  result = result.replace(/^<body[^>]*>/, '').replace(/<\/body>$/, '')

  return result
}

/**
 * 获取元素内的所有顶级 block 子元素
 */
function getBlockElements(el: Element): Element[] {
  const blocks: Element[] = []
  for (const child of Array.from(el.children)) {
    blocks.push(child)
  }
  return blocks
}

/**
 * 递归处理嵌套的 columns-container
 * 如果元素本身不是 columns-container，直接克隆返回
 */
function processNestedColumns(el: Element, doc: Document): Element {
  // 检查是否有嵌套的 columns-container
  const nestedContainers = el.querySelectorAll('section[data-columns-container]')

  if (nestedContainers.length === 0) {
    return el.cloneNode(true) as Element
  }

  // 克隆元素
  const cloned = el.cloneNode(true) as Element

  // 递归处理每个嵌套的 columns-container
  const nestedInClone = cloned.querySelectorAll('section[data-columns-container]')
  nestedInClone.forEach((nested) => {
    const nestedEl = nested as HTMLElement
    const nestedLayout = nestedEl.getAttribute('data-layout') || 'cols-2'
    const nestedWidthsAttr = nestedEl.getAttribute('data-widths') || '[]'
    let nestedWidths: number[]

    try {
      nestedWidths = JSON.parse(nestedWidthsAttr)
    } catch {
      nestedWidths = [50, 50]
    }

    const nestedColumns = nestedEl.querySelectorAll(':scope > section[data-column]')
    if (nestedColumns.length === 0) return

    const table = doc.createElement('table')
    table.setAttribute('width', '100%')
    table.setAttribute('cellspacing', '0')
    table.setAttribute('cellpadding', '0')
    table.style.borderCollapse = 'collapse'
    table.style.width = '100%'
    table.style.tableLayout = 'fixed'

    const isNestedGrid = nestedLayout.startsWith('grid')
    const nestedGridCols = nestedLayout === 'grid-3x3' ? 3 : 2
    const nestedGridRows = nestedLayout === 'grid-3x3' ? 3 : 2

    if (isNestedGrid) {
      for (let row = 0; row < nestedGridRows; row++) {
        const tr = doc.createElement('tr')
        for (let col = 0; col < nestedGridCols; col++) {
          const td = doc.createElement('td')
          const colWidth = nestedWidths[col] || Math.floor(100 / nestedGridCols)
          td.setAttribute('width', `${colWidth}%`)
          td.style.verticalAlign = 'top'
          td.style.padding = '0'
          td.style.border = 'none'

          const columnEl = nestedColumns[col]
          if (columnEl) {
            const blocks = getBlockElements(columnEl)
            const block = blocks[row]
            if (block) {
              td.appendChild(block.cloneNode(true))
              removeFirstMarginTop(td)
            }
          }
          tr.appendChild(td)
        }
        table.appendChild(tr)
      }
    } else {
      const tr = doc.createElement('tr')
      nestedColumns.forEach((columnEl, index) => {
        const td = doc.createElement('td')
        const colWidth = nestedWidths[index] || Math.floor(100 / nestedColumns.length)
        td.setAttribute('width', `${colWidth}%`)
        td.style.verticalAlign = 'top'
        td.style.padding = '0'
        td.style.border = 'none'

        const blocks = getBlockElements(columnEl)
        blocks.forEach((block) => {
          td.appendChild(block.cloneNode(true))
        })
        removeFirstMarginTop(td)

        td.querySelectorAll('img').forEach((img) => {
          ;(img as HTMLImageElement).style.maxWidth = '100%'
          ;(img as HTMLImageElement).style.height = 'auto'
        })

        tr.appendChild(td)
      })
      table.appendChild(tr)
    }

    nestedEl.parentNode?.replaceChild(table, nestedEl)
  })

  return cloned
}

/**
 * 移除 td 内第一个元素的 margin-top，防止首行不齐
 */
function removeFirstMarginTop(td: HTMLElement): void {
  const firstChild = td.firstElementChild as HTMLElement | null
  if (!firstChild) return

  const currentStyle = firstChild.getAttribute('style') || ''
  // 移除 margin-top 相关样式
  const newStyle = currentStyle
    .replace(/margin-top\s*:\s*[^;]+;?/gi, '')
    .replace(/margin\s*:\s*[^;]+;?/gi, '') // 也移除简写 margin

  firstChild.setAttribute('style', newStyle)
}
