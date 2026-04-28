import type { Theme } from '../types'

export const foodLabTheme: Theme = {
  id: 'food-lab',
  name: '食验室',
  description: '科学实验室风，数据驱动，适合营养科普',
  previewImage: '/theme-previews/food-lab.jpg',
  headerImage: '/theme-headers/food-lab.jpg',
  headerText: { title: '食验室', subtitle: '数据驱动 · 科学营养', color: '#1E1E1E', align: 'left', position: 'bottom' },
  styles: {
    container: {
      width: '100%',
      padding: '0',
      fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      color: '#1E1E1E',
      lineHeight: '1.9',
      fontSize: '15px',
      background: '#FFFFFF',
    },
    p: { margin: '1em 0' },
    h1: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1E1E1E',
      textAlign: 'center',
      margin: '1.5em 0 1em',
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1E1E1E',
      borderLeft: '4px solid #2563EB',
      paddingLeft: '14px',
      margin: '1.5em 0 0.8em',
    },
    h3: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#2563EB',
      margin: '1.2em 0 0.6em',
    },
    h4: { fontSize: '15px', fontWeight: '600', color: '#1E1E1E' },
    strong: { color: '#2563EB', fontWeight: '700' },
    em: { fontStyle: 'italic' },
    u: { textDecoration: 'underline', textDecorationColor: '#2563EB', textUnderlineOffset: '3px' },
    s: { textDecoration: 'line-through' },
    a: { color: '#2563EB', textDecoration: 'none', borderBottom: '1px solid #2563EB' },
    ul: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'disc' },
    ol: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'decimal' },
    li: { margin: '0.5em 0' },
    blockquote: {
      borderLeft: '4px solid #2563EB',
      background: '#F8FAFC',
      padding: '12px 18px',
      color: '#374151',
      margin: '1.2em 0',
      borderRadius: '0 6px 6px 0',
    },
    code: {
      background: '#EFF6FF',
      color: '#1D4ED8',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '0.9em',
      fontFamily: '"SF Mono", Consolas, Monaco, monospace',
    },
    pre: {
      background: '#0F172A',
      color: '#E2E8F0',
      padding: '16px 20px',
      borderRadius: '8px',
      overflowX: 'auto',
      lineHeight: '1.5',
      fontSize: '13px',
      margin: '1em 0',
    },
    preCode: {
      background: 'transparent',
      color: 'inherit',
      padding: '0',
      borderRadius: '0',
      fontSize: 'inherit',
    },
    hr: {
      border: '0',
      height: '1px',
      background: '#E5E7EB',
      margin: '2em 0',
    },
    img: { maxWidth: '100%', borderRadius: '8px', display: 'block', margin: '1em auto' },
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      fontSize: '14px',
      margin: '1em 0',
    },
    th: {
      background: '#F1F5F9',
      fontWeight: '700',
      padding: '10px 12px',
      border: '1px solid #E2E8F0',
      color: '#1E293B',
    },
    td: { padding: '10px 12px', border: '1px solid #E2E8F0' },
    taskList: { listStyleType: 'none', paddingLeft: '0' },
    taskItem: { display: 'flex', alignItems: 'flex-start', gap: '6px' },
  },
  customCss: `
/* 食验室 - 科学实验室装饰 */
.wx-root h1 {
  position: relative;
}
.wx-root h1::before {
  content: '🔬';
  margin-right: 8px;
}
.wx-root h2 {
  position: relative;
}
.wx-root h2::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  margin-right: 8px;
  vertical-align: middle;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}
.wx-root blockquote {
  position: relative;
}
.wx-root blockquote::before {
  content: '💡 专家观点';
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #2563EB;
  margin-bottom: 6px;
  font-style: normal;
  letter-spacing: 0.05em;
}
.wx-root strong {
  background: linear-gradient(transparent 60%, #EFF6FF 60%);
  padding: 0 2px;
}
.wx-root table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E2E8F0;
}
.wx-root th:first-child {
  border-radius: 8px 0 0 0;
}
.wx-root th:last-child {
  border-radius: 0 8px 0 0;
}
.wx-root ol > li::marker {
  color: #2563EB;
  font-weight: 700;
}
`,
}
