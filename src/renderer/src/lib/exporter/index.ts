import type { Theme } from '@/themes/types'
import { buildStylesheet } from './buildStylesheet'
import { processCodeBlocks } from './codeBlockProcess'
import { inlineStyles } from './inlineStyles'
import { postProcess } from './postProcess'

/**
 * Export HTML with theme styles inlined for WeChat.
 *
 * Flow:
 * 1. Sanitize HTML (basic cleanup)
 * 2. Process code blocks (hljs colors + section wrapping)
 * 3. Build CSS from theme
 * 4. Inline CSS with juice
 * 5. Post-process for WeChat compatibility
 */
export function exportForWechat(html: string, theme: Theme): string {
  if (!html || html.trim() === '' || html.trim() === '<p></p>' || html.trim() === '<p><br></p>') {
    return ''
  }

  // Step 1: Process code blocks (hljs colors + line wrapping)
  let processed = processCodeBlocks(html)

  // Step 2: Build CSS from theme
  const css = buildStylesheet(theme)

  // Step 3: Inline styles with juice
  const inlined = inlineStyles(processed, css)

  // Step 4: Post-process for WeChat
  const result = postProcess(inlined)

  return result
}

/**
 * Convert HTML to plain text (simple tag stripping, preserve line breaks)
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/(h[1-6]|li|div|blockquote|tr)>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    .replace(/<section[^>]*>/gi, '')
    .replace(/<\/section>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
