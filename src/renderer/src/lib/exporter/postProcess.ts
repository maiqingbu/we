/**
 * Post-process inlined HTML for WeChat compatibility.
 * Handles: class removal, task list conversion, section wrapping, etc.
 */
export function postProcess(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  // 1. Remove all class attributes
  body.querySelectorAll('[class]').forEach((el) => {
    el.removeAttribute('class')
  })

  // 2. Remove all data-* attributes (except we handle taskList specially below)
  body.querySelectorAll('[data-type]').forEach((el) => {
    el.removeAttribute('data-type')
  })
  body.querySelectorAll('[data-checked]').forEach((el) => {
    el.removeAttribute('data-checked')
  })

  // 3. Convert task lists to plain text with ☑/☐ prefixes
  body.querySelectorAll('ul').forEach((ul) => {
    // Detect task list by checking if any li has a label>input[type="checkbox"]
    const hasCheckbox = ul.querySelector('input[type="checkbox"]')
    if (!hasCheckbox) return

    const items = Array.from(ul.querySelectorAll(':scope > li'))
    for (const li of items) {
      const checkbox = li.querySelector('input[type="checkbox"]')
      const div = li.querySelector('div')
      const isChecked = checkbox?.hasAttribute('checked') || checkbox?.getAttribute('data-checked') === 'true'
      const text = div ? div.textContent || '' : li.textContent || ''

      // Replace li content with prefix + text
      li.innerHTML = `<span>${isChecked ? '☑' : '☐'} ${escapeHtml(text.trim())}</span>`
    }
  })

  // 4. Ensure all <p> have base font styling
  body.querySelectorAll('p').forEach((p) => {
    const existing = p.getAttribute('style') || ''
    if (!existing.includes('font-size')) {
      p.style.fontSize = '15px'
    }
    if (!existing.includes('line-height')) {
      p.style.lineHeight = '1.75'
    }
  })

  // 5. Ensure all <img> have max-width
  body.querySelectorAll('img').forEach((img) => {
    const existing = img.getAttribute('style') || ''
    if (!existing.includes('max-width')) {
      img.style.maxWidth = '100%'
    }
    if (!existing.includes('display')) {
      img.style.display = 'block'
    }
    if (!existing.includes('margin')) {
      img.style.margin = '1em auto'
    }
  })

  // 6. Clean up whitespace between nodes
  const serializer = new XMLSerializer()
  let result = serializer.serializeToString(body)

  // Remove the wrapping <body> and </body> tags
  result = result.replace(/^<body[^>]*>/, '').replace(/<\/body>$/, '')

  // Collapse multiple newlines to single newline
  result = result.replace(/\n{3,}/g, '\n')

  return result.trim()
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
