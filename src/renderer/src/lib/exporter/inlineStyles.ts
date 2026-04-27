import juice from 'juice'

/**
 * Use juice to inline CSS styles into HTML elements.
 * Wraps HTML in a .wx-root div with a <style> block, then runs juice.
 */
export function inlineStyles(html: string, css: string): string {
  const wrapped = `<div class="wx-root"><style>${css}</style>${html}</div>`
  const result = juice(wrapped, {
    inlinePseudoElements: false,
    preserveImportant: false,
    applyStyleTags: true,
    removeStyleTags: true,
    applyAttributesTableElements: true,
  })
  return result
}
