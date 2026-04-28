import type { Theme } from '@/themes/types'
import { buildStylesheet } from './buildStylesheet'
import { processCodeBlocks } from './codeBlockProcess'
import { inlineStyles } from './inlineStyles'
import { postProcess } from './postProcess'

/**
 * Convert local image paths to base64 data URLs so WeChat can display them.
 * Only converts paths starting with "/" (local assets).
 */
async function convertLocalImagesToBase64(html: string): Promise<string> {
  const imgRegex = /src="(\/[^"]+\.(jpg|jpeg|png|gif|webp|svg))"/gi
  const matches = [...html.matchAll(imgRegex)]

  if (matches.length === 0) return html

  let result = html
  for (const match of matches) {
    const src = match[1]
    try {
      const response = await fetch(src)
      if (!response.ok) continue
      const blob = await response.blob()
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
      result = result.replace(`src="${src}"`, `src="${base64}"`)
    } catch {
      // Skip failed conversions
    }
  }
  return result
}

/**
 * Export HTML with theme styles inlined for WeChat.
 *
 * Flow:
 * 1. Sanitize HTML (basic cleanup)
 * 2. Process code blocks (hljs colors + section wrapping)
 * 3. Convert local images to base64
 * 4. Build CSS from theme
 * 5. Inline CSS with juice
 * 6. Post-process for WeChat compatibility
 */
export async function exportForWechat(html: string, theme: Theme): Promise<string> {
  if (!html || html.trim() === '' || html.trim() === '<p></p>' || html.trim() === '<p><br></p>') {
    return ''
  }

  // Step 1: Process code blocks (hljs colors + line wrapping)
  let processed = processCodeBlocks(html)

  // Step 2: Convert local image paths to base64 data URLs
  processed = await convertLocalImagesToBase64(processed)

  // Step 3: Build CSS from theme
  const css = buildStylesheet(theme)

  // Step 4: Inline styles with juice
  const inlined = inlineStyles(processed, css)

  // Step 5: Post-process for WeChat
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
