import type { Theme } from '@/themes/types'
import { buildStylesheet } from './buildStylesheet'
import { processCodeBlocks } from './codeBlockProcess'
import { inlineStyles } from './inlineStyles'
import { postProcess } from './postProcess'
import { convertColumnsToTable } from './columnsToTable'

/**
 * 展开模板块：将 data-html 属性中的内容填入 section 内部，
 * 并根据 data-rotation 对图片应用旋转、文字应用反向旋转。
 */
function expandTemplateBlocks(html: string): string {
  return html.replace(
    /<section([^>]*data-template-id="[^"]*"[^>]*)\s*data-html="([^"]*)"[^>]*>\s*<\/section>/g,
    (_match, attrs, encodedHtml) => {
      const content = encodedHtml
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
      const rotMatch = attrs.match(/data-rotation="(-?\d+)"/)
      const rotation = rotMatch ? parseInt(rotMatch[1], 10) : 0
      if (rotation !== 0) {
        return `<section${attrs}>${applyRotationToHtml(content, rotation)}</section>`
      }
      return `<section${attrs}>${content}</section>`
    }
  )
}

function applyRotationToHtml(html: string, angle: number): string {
  const imgTransform = `transform:rotate(${angle}deg);transform-origin:center center;`
  const textTransform = `transform:rotate(${-angle}deg);`

  // 给 <img 标签注入旋转样式（合并到已有 style 或新增）
  let result = html.replace(/<img\b([^>]*?)\bstyle="([^"]*)"([^>]*)/gi, (_m, before, style, after) => {
    if (style.includes('transform')) return _m
    return `<img${before}style="${imgTransform}${style}"${after}`
  })
  result = result.replace(/<img(?![^>]*\bstyle=)(\s)/gi, (_m, sp) => {
    return `<img style="${imgTransform}"${sp}`
  })

  // 给纯文字标签注入反向旋转
  const textTags = ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'em', 'strong', 'b', 'i', 'u', 'label', 'a']
  for (const tag of textTags) {
    const reStyle = new RegExp(`<${tag}\\b([^>]*?)\\bstyle="([^"]*)"([^>]*)`, 'gi')
    result = result.replace(reStyle, (_m, before, style, after) => {
      if (style.includes('transform')) return _m
      return `<${tag}${before}style="${textTransform}${style}"${after}`
    })
    const reNoStyle = new RegExp(`<${tag}(?![^>]*\\bstyle=)(\\s|>)`, 'gi')
    result = result.replace(reNoStyle, (_m, after) => {
      return `<${tag} style="${textTransform}"${after}`
    })
  }
  return result
}

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

  // Step 2: Expand template blocks (data-html → real DOM content, with rotation)
  processed = expandTemplateBlocks(processed)

  // Step 3: Convert local image paths to base64 data URLs
  processed = await convertLocalImagesToBase64(processed)

  // Step 4: Build CSS from theme
  const css = buildStylesheet(theme)

  // Step 5: Inline styles with juice
  const inlined = inlineStyles(processed, css)

  // Step 6: Convert columns containers to tables for WeChat compatibility
  const withTables = convertColumnsToTable(inlined)

  // Step 7: Post-process for WeChat
  const result = postProcess(withTables)

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
