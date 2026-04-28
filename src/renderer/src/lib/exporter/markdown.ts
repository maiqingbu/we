import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

export function exportMarkdown(html: string): string {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
  })

  // GFM plugin for tables, strikethrough, etc.
  td.use(gfm)

  // Custom rule: task lists
  td.addRule('taskList', {
    filter: (node) => {
      return (
        node.nodeName === 'LI' &&
        node.getAttribute('data-type') === 'taskItem'
      )
    },
    replacement: (_content, node) => {
      const checked = (node as Element).getAttribute('data-checked') === 'true'
      // Get text content from child paragraphs
      const text = node.textContent?.trim() || ''
      return `- [${checked ? 'x' : ' '}] ${text}\n`
    },
  })

  return td.turndown(html)
}
