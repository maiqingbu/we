import type { Theme } from './types'

function cssPropsToString(props: Record<string, unknown>): string {
  return Object.entries(props)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `  ${cssKey}: ${value};`
    })
    .join('\n')
}

export function themeToCss(theme: Theme): string {
  const s = theme.styles
  return `/* 容器 */
.wx-root {
${cssPropsToString(s.container)}
}

/* 正文 */
.wx-root p {
${cssPropsToString(s.p)}
}

/* 一级标题 */
.wx-root h1 {
${cssPropsToString(s.h1)}
}

/* 二级标题 */
.wx-root h2 {
${cssPropsToString(s.h2)}
}

/* 三级标题 */
.wx-root h3 {
${cssPropsToString(s.h3)}
}

/* 四级标题 */
.wx-root h4 {
${cssPropsToString(s.h4)}
}

/* 加粗 */
.wx-root strong {
${cssPropsToString(s.strong)}
}

/* 斜体 */
.wx-root em {
${cssPropsToString(s.em)}
}

/* 下划线 */
.wx-root u {
${cssPropsToString(s.u)}
}

/* 删除线 */
.wx-root s {
${cssPropsToString(s.s)}
}

/* 链接 */
.wx-root a {
${cssPropsToString(s.a)}
}

/* 无序列表 */
.wx-root ul {
${cssPropsToString(s.ul)}
}

/* 有序列表 */
.wx-root ol {
${cssPropsToString(s.ol)}
}

/* 列表项 */
.wx-root li {
${cssPropsToString(s.li)}
}

/* 引用 */
.wx-root blockquote {
${cssPropsToString(s.blockquote)}
}

/* 行内代码 */
.wx-root code {
${cssPropsToString(s.code)}
}

/* 代码块 */
.wx-root pre {
${cssPropsToString(s.pre)}
}

.wx-root pre code {
${cssPropsToString(s.preCode)}
}

/* 分割线 */
.wx-root hr {
${cssPropsToString(s.hr)}
}

/* 图片 */
.wx-root img {
${cssPropsToString(s.img)}
}

/* 表格 */
.wx-root table {
${cssPropsToString(s.table)}
}

.wx-root th {
${cssPropsToString(s.th)}
}

.wx-root td {
${cssPropsToString(s.td)}
}

/* 任务列表 */
.wx-root ul[data-type="taskList"] {
${cssPropsToString(s.taskList)}
}

.wx-root ul[data-type="taskList"] li {
${cssPropsToString(s.taskItem)}
}
`
}
