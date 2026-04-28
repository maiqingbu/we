export interface ArticleStats {
  chineseChars: number
  englishWords: number
  totalChars: number
  paragraphs: number
  images: number
  links: number
  readingMinutes: number
}

function countChineseChars(text: string): number {
  const matches = text.match(/[\u4e00-\u9fff]/g)
  return matches ? matches.length : 0
}

function countEnglishWords(text: string): number {
  const matches = text.match(/[a-zA-Z]+/g)
  return matches ? matches.length : 0
}

/**
 * Count "top-level" paragraphs — only paragraph/heading nodes that are
 * direct children of the doc or of simple containers (blockquote, listItem,
 * tableCell, tableHeader). This avoids double-counting when a paragraph
 * lives inside a listItem (which is also a block node).
 */
function countParagraphs(doc: any): number {
  let count = 0
  // Only count nodes whose parent is one of these "content containers"
  const containerParents = new Set([
    'doc', 'blockquote', 'listItem', 'taskItem',
  ])
  doc.descendants((node: any, _pos: number, parent: any) => {
    if (!parent) return true
    const name = node.type.name
    const parentName = parent.type?.name
    if (
      (name === 'paragraph' || name === 'heading' || name === 'codeBlock') &&
      containerParents.has(parentName)
    ) {
      count++
    }
    return true
  })
  return count
}

export function computeStats(html: string, editor: { state: { doc: any } }): ArticleStats {
  // Extract plain text from HTML for char/word counting
  const plainText = html.replace(/<[^>]*>/g, '')

  const chineseChars = countChineseChars(plainText)
  const englishWords = countEnglishWords(plainText)
  const totalChars = plainText.replace(/\s/g, '').length

  // Walk ProseMirror doc tree for structural stats
  let images = 0
  const linkUrls = new Set<string>()

  const doc = editor.state.doc
  doc.descendants((node: any) => {
    const name = node.type.name

    // Count images
    if (name === 'image') {
      images++
    }

    // Count unique links from marks
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type.name === 'link' && mark.attrs.href) {
          linkUrls.add(mark.attrs.href)
        }
      }
    }
  })

  const links = linkUrls.size
  const paragraphs = countParagraphs(doc)

  // Reading time: chineseChars / 400 + englishWords / 200, round up, min 1
  const readingMinutes = Math.max(1, Math.ceil(chineseChars / 400 + englishWords / 200))

  return {
    chineseChars,
    englishWords,
    totalChars,
    paragraphs,
    images,
    links,
    readingMinutes,
  }
}
