import type { Theme } from '../types'

export const foldingSpaceTheme: Theme = {
  id: 'folding-space',
  name: '折叠空间',
  description: '大胆渐变色，解构主义美学，适合建筑设计长文',
  previewImage: '/theme-previews/folding-space.jpg',
  headerImage: '/theme-headers/folding-space.jpg',
  headerText: { title: '折叠空间', subtitle: '当建筑遇见未来', color: '#FFFFFF', align: 'left', position: 'center' },
  styles: {
    container: {
      width: '100%',
      padding: '0',
      fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      color: '#1A1A2E',
      lineHeight: '2.0',
      fontSize: '15px',
      background: '#FFFFFF',
    },
    p: { margin: '1.2em 0' },
    h1: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#1A1A2E',
      textAlign: 'center',
      margin: '1.5em 0 0.5em',
      letterSpacing: '0.03em',
    },
    h2: {
      fontSize: '21px',
      fontWeight: '700',
      color: '#2D1B69',
      borderLeft: '4px solid transparent',
      borderImage: 'linear-gradient(to bottom, #2D1B69, #0066FF, #00D4FF) 1',
      paddingLeft: '14px',
      margin: '2em 0 0.8em',
    },
    h3: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#0066FF',
      margin: '1.2em 0 0.6em',
    },
    h4: { fontSize: '15px', fontWeight: '600', color: '#1A1A2E' },
    strong: { color: '#2D1B69', fontWeight: '700' },
    em: { fontStyle: 'italic', color: '#5B7B8A' },
    u: { textDecoration: 'none', borderBottom: '2px solid #0066FF', textUnderlineOffset: '3px' },
    s: { textDecoration: 'line-through' },
    a: { color: '#0066FF', textDecoration: 'none' },
    ul: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'disc' },
    ol: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'decimal' },
    li: { margin: '0.5em 0' },
    blockquote: {
      borderLeft: '4px solid transparent',
      borderImage: 'linear-gradient(to bottom, #2D1B69, #00D4FF) 1',
      background: '#F5F3FF',
      padding: '14px 20px',
      color: '#4A4A6A',
      fontStyle: 'italic',
      margin: '1.5em 0',
      borderRadius: '0 8px 8px 0',
    },
    code: {
      background: '#F5F3FF',
      color: '#2D1B69',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '0.9em',
      fontFamily: '"SF Mono", Consolas, Monaco, monospace',
    },
    pre: {
      background: '#1A1A2E',
      color: '#E0E0F0',
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
      height: '4px',
      background: 'linear-gradient(90deg, #2D1B69, #0066FF, #00D4FF)',
      margin: '2.5em 0',
      borderRadius: '2px',
    },
    img: { maxWidth: '100%', borderRadius: '8px', display: 'block', margin: '1em auto' },
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      fontSize: '14px',
      margin: '1em 0',
    },
    th: {
      background: 'linear-gradient(135deg, #2D1B69, #0066FF)',
      fontWeight: '700',
      padding: '10px 12px',
      border: 'none',
      color: '#FFFFFF',
    },
    td: { padding: '10px 12px', border: '1px solid #E8E4DF' },
    taskList: { listStyleType: 'none', paddingLeft: '0' },
    taskItem: { display: 'flex', alignItems: 'flex-start', gap: '6px' },
  },
  customCss: `
/* 折叠空间 - 渐变解构装饰 */
.wx-root h1 {
  position: relative;
  padding-bottom: 16px;
}
.wx-root h1::after {
  content: '';
  display: block;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #2D1B69, #0066FF, #00D4FF);
  margin-top: 12px;
  border-radius: 2px;
}
.wx-root h2 {
  position: relative;
}
.wx-root h2::after {
  content: '';
  display: block;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #2D1B69, #00D4FF);
  margin-top: 6px;
  border-radius: 2px;
}
.wx-root blockquote {
  position: relative;
}
.wx-root blockquote::before,
.wx-root blockquote::after {
  content: '';
  display: block;
  height: 2px;
  background: linear-gradient(90deg, #2D1B69, #0066FF, #00D4FF);
  border-radius: 1px;
}
.wx-root blockquote::before {
  margin-bottom: 10px;
  width: 40px;
}
.wx-root blockquote::after {
  margin-top: 10px;
  width: 100%;
}
.wx-root strong {
  background: linear-gradient(transparent 55%, rgba(45, 27, 105, 0.08) 55%);
  padding: 0 2px;
}
.wx-root table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E8E4DF;
}
.wx-root ol > li::marker {
  color: #2D1B69;
  font-weight: 700;
}
.wx-root ul > li::marker {
  color: #0066FF;
}
`,
}
