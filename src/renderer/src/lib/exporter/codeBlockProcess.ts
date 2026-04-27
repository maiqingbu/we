/**
 * GitHub Dark style color map for highlight.js classes.
 * WeChat strips all class attributes, so we must convert these to inline styles.
 */
const HLJS_COLOR_MAP: Record<string, string> = {
  'hljs-keyword': '#ff7b72',
  'hljs-built_in': '#ffa657',
  'hljs-type': '#ffa657',
  'hljs-literal': '#79c0ff',
  'hljs-number': '#79c0ff',
  'hljs-regexp': '#7ee787',
  'hljs-string': '#a5d6ff',
  'hljs-subst': '#c9d1d9',
  'hljs-symbol': '#79c0ff',
  'hljs-class': '#ffa657',
  'hljs-function': '#d2a8ff',
  'hljs-title': '#d2a8ff',
  'hljs-params': '#c9d1d9',
  'hljs-comment': '#8b949e',
  'hljs-doctag': '#ff7b72',
  'hljs-meta': '#79c0ff',
  'hljs-section': '#1f6feb',
  'hljs-tag': '#7ee787',
  'hljs-name': '#7ee787',
  'hljs-attr': '#79c0ff',
  'hljs-attribute': '#79c0ff',
  'hljs-variable': '#ffa657',
  'hljs-bullet': '#f2cc60',
  'hljs-code': '#a5d6ff',
  'hljs-emphasis': '#c9d1d9',
  'hljs-strong': '#c9d1d9',
  'hljs-formula': '#79c0ff',
  'hljs-link': '#a5d6ff',
  'hljs-quote': '#8b949e',
  'hljs-selector-tag': '#7ee787',
  'hljs-selector-id': '#79c0ff',
  'hljs-selector-class': '#79c0ff',
  'hljs-selector-attr': '#79c0ff',
  'hljs-selector-pseudo': '#79c0ff',
  'hljs-template-tag': '#79c0ff',
  'hljs-template-variable': '#ffa657',
  'hljs-addition': '#aff5b4',
  'hljs-deletion': '#ffdcd7',
}

/**
 * Process code blocks in HTML:
 * 1. Convert hljs-* class spans to inline color styles
 * 2. Wrap each code line in <section> for proper line breaks in WeChat
 * 3. Add white-space: pre to <pre> elements
 */
export function processCodeBlocks(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')

  // Step 1: Convert hljs class spans to inline color
  doc.querySelectorAll('[class*="hljs-"]').forEach((el) => {
    const htmlEl = el as HTMLElement
    const classList = Array.from(htmlEl.classList)
    for (const cls of classList) {
      if (HLJS_COLOR_MAP[cls]) {
        htmlEl.style.color = HLJS_COLOR_MAP[cls]
      }
    }
  })

  // Step 2: Process <pre><code> blocks - wrap lines in <section>
  doc.querySelectorAll('pre').forEach((pre) => {
    const htmlPre = pre as HTMLElement
    htmlPre.style.whiteSpace = 'pre'
    htmlPre.style.overflowX = 'auto'
    htmlPre.style.setProperty('-webkit-font-smoothing', 'antialiased')

    const code = pre.querySelector('code')
    if (!code) return

    const text = code.innerHTML
    // Split by newlines, preserving any existing HTML tags within lines
    const lines = text.split('\n')
    // Remove trailing empty line (trailing newline)
    if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop()
    }

    code.innerHTML = lines
      .map((line) => `<section style="display:block;min-height:1em">${line || '<br>'}</section>`)
      .join('')
  })

  const serializer = new XMLSerializer()
  // Get the inner content of the wrapper div
  const wrapper = doc.querySelector('div')
  if (!wrapper) return html
  // Use innerHTML to avoid the wrapper div tag itself
  return wrapper.innerHTML
}
