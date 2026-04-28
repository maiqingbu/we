import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import type { Theme } from './types'

function cssPropsToString(props: React.CSSProperties): string {
  return Object.entries(props)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${value}`
    })
    .join('; ')
}

function generateThemeCSS(theme: Theme): string {
  const s = theme.styles
  return `
.theme-${theme.id} { ${cssPropsToString(s.container)} }
.theme-${theme.id} p { ${cssPropsToString(s.p)} }
.theme-${theme.id} h1 { ${cssPropsToString(s.h1)} }
.theme-${theme.id} h2 { ${cssPropsToString(s.h2)} }
.theme-${theme.id} h3 { ${cssPropsToString(s.h3)} }
.theme-${theme.id} h4 { ${cssPropsToString(s.h4)} }
.theme-${theme.id} strong { ${cssPropsToString(s.strong)} }
.theme-${theme.id} em { ${cssPropsToString(s.em)} }
.theme-${theme.id} u { ${cssPropsToString(s.u)} }
.theme-${theme.id} s { ${cssPropsToString(s.s)} }
.theme-${theme.id} a { ${cssPropsToString(s.a)} }
.theme-${theme.id} ul { ${cssPropsToString(s.ul)} }
.theme-${theme.id} ol { ${cssPropsToString(s.ol)} }
.theme-${theme.id} li { ${cssPropsToString(s.li)} }
.theme-${theme.id} blockquote { ${cssPropsToString(s.blockquote)} }
.theme-${theme.id} code { ${cssPropsToString(s.code)} }
.theme-${theme.id} pre { ${cssPropsToString(s.pre)} }
.theme-${theme.id} pre code { ${cssPropsToString(s.preCode)} }
.theme-${theme.id} hr { ${cssPropsToString(s.hr)} }
.theme-${theme.id} img { ${cssPropsToString(s.img)} }
.theme-${theme.id} table { ${cssPropsToString(s.table)} }
.theme-${theme.id} th { ${cssPropsToString(s.th)} }
.theme-${theme.id} td { ${cssPropsToString(s.td)} }
.theme-${theme.id} ul[data-type="taskList"] { ${cssPropsToString(s.taskList)} }
.theme-${theme.id} ul[data-type="taskList"] li { ${cssPropsToString(s.taskItem)} }
.theme-${theme.id} ul[data-type="taskList"] li > label { display: none; }
.theme-${theme.id} ul[data-type="taskList"] li > div { flex: 1; }
.theme-${theme.id} .hljs { color: inherit; }
`
}

function processTaskListCheckboxes(html: string): string {
  return html
    .replace(
      /<li>(\s*<label[^>]*>\s*<input[^>]*type="checkbox"[^>]*data-checked="true"[^>]*\/?>\s*<\/label>)/g,
      '<li><span style="margin-right:6px">✓</span>$1'
    )
    .replace(
      /<li>(\s*<label[^>]*>\s*<input[^>]*type="checkbox"[^>]*\/?>\s*<\/label>)/g,
      '<li><span style="margin-right:6px">▢</span>$1'
    )
}

interface PreviewRendererProps {
  html: string
  theme: Theme
}

function PreviewRenderer({ html, theme }: PreviewRendererProps): React.JSX.Element {
  const cleanHtml = useMemo(() => {
    const sanitized = DOMPurify.sanitize(html, {
      ADD_ATTR: ['data-type', 'data-checked', 'class', 'data-template-id', 'data-material-id', 'data-editable', 'data-editable-img', 'data-html', 'contenteditable'],
      ADD_TAGS: ['span'],
    })
    return processTaskListCheckboxes(sanitized)
  }, [html])

  const themeCSS = useMemo(() => {
    if (theme.customCss && theme.customCss.includes('.wx-root {')) {
      // Custom theme with complete raw CSS
      return theme.customCss.replace(/\.wx-root/g, `.theme-${theme.id}`)
    }
    // Preset theme: base styles + optional custom CSS enhancements
    const base = generateThemeCSS(theme)
    if (theme.customCss) {
      const scoped = theme.customCss.replace(/\.wx-root/g, `.theme-${theme.id}`)
      return base + '\n' + scoped
    }
    return base
  }, [theme])

  const isEmpty = !cleanHtml || cleanHtml === '<p></p>' || cleanHtml === '<p><br></p>'

  if (isEmpty) {
    return (
      <div style={{ textAlign: 'center', color: '#bfbfbf', fontSize: '14px', padding: '60px 20px' }}>
        在左侧编辑器开始写作，预览会同步显示
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      <div
        className={`theme-${theme.id}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </>
  )
}

export { PreviewRenderer }
