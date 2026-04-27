import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Slice } from '@tiptap/pm/model'
import { marked } from 'marked'

const markdownPasteKey = new PluginKey('markdownPaste')

/**
 * MarkdownPaste extension
 *
 * Intercepts paste events, detects Markdown content in plain text,
 * converts it to HTML via marked, and inserts the HTML into the editor.
 */
const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: markdownPasteKey,
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain')
            if (!text || !isMarkdown(text)) return false

            event.preventDefault()

            const html = markdownToHtml(text)
            if (!html.trim()) return false

            try {
              const fragmentJSON = htmlToFragmentJSON(html)
              const doc = view.state.schema.nodeFromJSON({
                type: 'doc',
                content: fragmentJSON,
              })

              if (!doc) return false

              const tr = view.state.tr.replaceSelection(
                new Slice(doc.content, 0, 0)
              )
              view.dispatch(tr)
              return true
            } catch (e) {
              // If parsing fails, fall back to default paste behavior
              console.warn('[MarkdownPaste] Failed to parse markdown:', e)
              return false
            }
          },
        },
      }),
    ]
  },
})

/**
 * Check if text contains Markdown syntax patterns
 */
function isMarkdown(text: string): boolean {
  const lines = text.split('\n')
  let mdCount = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (/^#{1,6}\s/.test(trimmed)) { mdCount++; continue }
    if (/^>\s/.test(trimmed)) { mdCount++; continue }
    if (/^[-*]\s/.test(trimmed)) { mdCount++; continue }
    if (/^\d+\.\s/.test(trimmed)) { mdCount++; continue }
    if (/^[-*_]{3,}$/.test(trimmed)) { mdCount++; continue }
    if (/\*\*[^*]+\*\*/.test(trimmed)) { mdCount++ }
    if (/\*[^*]+\*/.test(trimmed)) { mdCount++ }
    if (/`[^`]+`/.test(trimmed)) { mdCount++ }
    if (/\[.+?\]\(.+?\)/.test(trimmed)) { mdCount++ }
  }

  return mdCount >= 2
}

/**
 * Convert Markdown text to HTML using marked
 */
function markdownToHtml(text: string): string {
  const result = marked.parse(text, { gfm: true })
  return typeof result === 'string' ? result : ''
}

/**
 * Convert HTML string to a JSON structure compatible with ProseMirror's schema
 */
function htmlToFragmentJSON(html: string): object[] {
  const nodes: object[] = []

  const blocks = html
    .replace(/<\/p>\s*<p>/gi, '</p>\n<p>')
    .replace(/<\/(h[1-6]|blockquote|pre|ul|ol|li|div)>\s*<(h[1-6]|blockquote|pre|ul|ol|li|div|p)/gi, '</$1>\n<$2')
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean)

  for (const block of blocks) {
    const node = parseBlock(block)
    if (node) {
      nodes.push(node)
    }
  }

  return nodes
}

/**
 * Parse a single HTML block into a ProseMirror-compatible JSON node
 */
function parseBlock(block: string): object | null {
  // Heading
  const headingMatch = block.match(/^<h([1-4])>(.*?)<\/h[1-4]>$/is)
  if (headingMatch) {
    const level = parseInt(headingMatch[1])
    return {
      type: 'heading',
      attrs: { level },
      content: [{ type: 'text', text: cleanInlineHtml(headingMatch[2]) }],
    }
  }

  // Blockquote
  if (block.startsWith('<blockquote>')) {
    const inner = block.replace(/<\/?blockquote>/gi, '')
    const innerNodes = htmlToFragmentJSON(inner)
    return {
      type: 'blockquote',
      content: innerNodes.length > 0 ? innerNodes : [{ type: 'paragraph', content: [{ type: 'text', text: cleanInlineHtml(inner) }] }],
    }
  }

  // Unordered list
  if (block.startsWith('<ul>')) {
    const items = block.match(/<li>(.*?)<\/li>/gis)
    if (items) {
      return {
        type: 'bulletList',
        content: items.map((item) => ({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: cleanInlineHtml(item.replace(/<\/?li>/gi, '')) }],
          }],
        })),
      }
    }
  }

  // Ordered list
  if (block.startsWith('<ol>')) {
    const items = block.match(/<li>(.*?)<\/li>/gis)
    if (items) {
      return {
        type: 'orderedList',
        content: items.map((item) => ({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: cleanInlineHtml(item.replace(/<\/?li>/gi, '')) }],
          }],
        })),
      }
    }
  }

  // Code block
  const preMatch = block.match(/^<pre><code(?:\s+class="[^"]*")?>(.*?)<\/code><\/pre>$/is)
  if (preMatch) {
    return {
      type: 'codeBlock',
      content: [{ type: 'text', text: decodeHtmlEntities(preMatch[1]) }],
    }
  }

  // Horizontal rule
  if (block === '<hr>' || block === '<hr />' || block === '<hr/>') {
    return { type: 'horizontalRule' }
  }

  // Paragraph (default)
  const pMatch = block.match(/^<p>(.*?)<\/p>$/is)
  if (pMatch) {
    const inlineContent = parseInlineContent(cleanInlineHtml(pMatch[1]))
    return {
      type: 'paragraph',
      content: inlineContent.length > 0 ? inlineContent : [{ type: 'text', text: '' }],
    }
  }

  // Fallback: treat as plain text paragraph
  return {
    type: 'paragraph',
    content: [{ type: 'text', text: cleanInlineHtml(block) }],
  }
}

/**
 * Parse inline HTML content into ProseMirror text + marks JSON
 */
function parseInlineContent(text: string): object[] {
  const nodes: object[] = []

  const regex = /<(strong|em|code|a|s|u|b|i)(?:\s+[^>]*)?>(.*?)<\/\1>|([^<]+)/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match[3] !== undefined) {
      if (match[3]) {
        nodes.push({ type: 'text', text: match[3] })
      }
    } else if (match[1] && match[2] !== undefined) {
      const tag = match[1].toLowerCase()
      const innerText = match[2]

      if (tag === 'a') {
        const hrefMatch = match[0].match(/href="([^"]*)"/)
        const href = hrefMatch ? hrefMatch[1] : ''
        nodes.push({
          type: 'text',
          text: innerText,
          marks: [{ type: 'link', attrs: { href } }],
        })
      } else if (tag === 'strong' || tag === 'b') {
        nodes.push({ type: 'text', text: innerText, marks: [{ type: 'bold' }] })
      } else if (tag === 'em' || tag === 'i') {
        nodes.push({ type: 'text', text: innerText, marks: [{ type: 'italic' }] })
      } else if (tag === 'code') {
        nodes.push({ type: 'text', text: innerText, marks: [{ type: 'code' }] })
      } else if (tag === 's') {
        nodes.push({ type: 'text', text: innerText, marks: [{ type: 'strike' }] })
      } else if (tag === 'u') {
        nodes.push({ type: 'text', text: innerText, marks: [{ type: 'underline' }] })
      }
    }
  }

  return nodes
}

/**
 * Remove all remaining HTML tags from a string
 */
function cleanInlineHtml(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(?!\/?strong|\/?em|\/?code|\/?a|\/?s|\/?u|\/?b|\/?i)[^>]+>/gi, '')
    .replace(/<\/(?!strong|em|code|a|s|u|b|i)[^>]+>/gi, '')
    .trim()
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}

export { MarkdownPaste }
