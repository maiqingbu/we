import type { Theme } from '@/themes/types'

/**
 * Convert React.CSSProperties camelCase keys to kebab-case CSS property names
 * Numeric values (except lineHeight, fontWeight, opacity, zIndex) get 'px' appended
 */
function cssObjectToString(props: React.CSSProperties): string {
  const NO_PX_KEYS = new Set(['lineHeight', 'fontWeight', 'opacity', 'zIndex', 'flex', 'flexGrow', 'flexShrink', 'order', 'gridColumn', 'gridRow'])

  return Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      let cssValue = String(value)
      if (typeof value === 'number' && !NO_PX_KEYS.has(key)) {
        cssValue = `${value}px`
      }
      return `${cssKey}: ${cssValue}`
    })
    .join('; ')
}

/**
 * Build a complete CSS stylesheet string from a Theme object.
 * Uses .wx-root as the scope selector for juice to inline.
 */
export function buildStylesheet(theme: Theme): string {
  const s = theme.styles
  return `
    .wx-root { ${cssObjectToString(s.container)} }
    .wx-root p { ${cssObjectToString(s.p)} }
    .wx-root h1 { ${cssObjectToString(s.h1)} }
    .wx-root h2 { ${cssObjectToString(s.h2)} }
    .wx-root h3 { ${cssObjectToString(s.h3)} }
    .wx-root h4 { ${cssObjectToString(s.h4)} }
    .wx-root strong { ${cssObjectToString(s.strong)} }
    .wx-root em { ${cssObjectToString(s.em)} }
    .wx-root u { ${cssObjectToString(s.u)} }
    .wx-root s { ${cssObjectToString(s.s)} }
    .wx-root a { ${cssObjectToString(s.a)} }
    .wx-root ul { ${cssObjectToString(s.ul)} }
    .wx-root ol { ${cssObjectToString(s.ol)} }
    .wx-root li { ${cssObjectToString(s.li)} }
    .wx-root blockquote { ${cssObjectToString(s.blockquote)} }
    .wx-root code { ${cssObjectToString(s.code)} }
    .wx-root pre { ${cssObjectToString(s.pre)} }
    .wx-root pre code { ${cssObjectToString(s.preCode)} }
    .wx-root hr { ${cssObjectToString(s.hr)} }
    .wx-root img { ${cssObjectToString(s.img)} }
    .wx-root table { ${cssObjectToString(s.table)} }
    .wx-root th { ${cssObjectToString(s.th)} }
    .wx-root td { ${cssObjectToString(s.td)} }
    .wx-root ul[data-type="taskList"] { ${cssObjectToString(s.taskList)} }
    .wx-root ul[data-type="taskList"] li { ${cssObjectToString(s.taskItem)} }
  `
}
