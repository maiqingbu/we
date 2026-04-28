import type { Theme } from '../types'

export const wellnessTheme: Theme = {
  id: 'wellness',
  name: '养生暖阳',
  description: '温暖赤陶色调，适合中医养生、健康科普',
  previewImage: '/theme-previews/wellness.jpg',
  headerImage: '/theme-headers/wellness.jpg',
  headerText: { title: '养生暖阳', subtitle: '温润身心 · 食疗养生', color: '#5D4037', align: 'center', position: 'bottom' },
  styles: {
    container: {
      width: '100%',
      padding: '0',
      fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      color: '#3E2723',
      lineHeight: '2.0',
      fontSize: '15px',
      background: '#FFF8F0',
    },
    p: { margin: '1.2em 0', letterSpacing: '0.02em' },
    h1: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#5D4037',
      textAlign: 'center',
      margin: '1.5em 0 1em',
      paddingBottom: '10px',
      borderBottom: '2px solid #D4A017',
    },
    h2: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#4E342E',
      borderLeft: '4px solid #7BA05B',
      paddingLeft: '14px',
      margin: '1.5em 0 0.8em',
    },
    h3: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#7BA05B',
      margin: '1.2em 0 0.6em',
    },
    h4: { fontSize: '15px', fontWeight: '600', color: '#5D4037' },
    strong: { color: '#8B4513', fontWeight: '700' },
    em: { fontStyle: 'italic', color: '#6D4C41' },
    u: { textDecoration: 'underline', textDecorationColor: '#D4A017' },
    s: { textDecoration: 'line-through' },
    a: { color: '#7BA05B', textDecoration: 'none', borderBottom: '1px solid #7BA05B' },
    ul: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'disc' },
    ol: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'decimal' },
    li: { margin: '0.5em 0', lineHeight: '1.8' },
    blockquote: {
      borderLeft: '4px solid #7BA05B',
      background: '#F0F7EC',
      padding: '12px 18px',
      color: '#5D4037',
      margin: '1.2em 0',
      borderRadius: '0 6px 6px 0',
    },
    code: {
      background: '#FDF5E6',
      color: '#8B4513',
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '0.9em',
      fontFamily: '"SF Mono", Consolas, Monaco, monospace',
    },
    pre: {
      background: '#3E2723',
      color: '#F5E6D3',
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
      background: 'linear-gradient(90deg, transparent, #D4A017, transparent)',
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
      background: '#F0F7EC',
      fontWeight: '700',
      padding: '10px 12px',
      border: '1px solid #C8E6C9',
      color: '#3E2723',
    },
    td: { padding: '10px 12px', border: '1px solid #C8E6C9' },
    taskList: { listStyleType: 'none', paddingLeft: '0' },
    taskItem: { display: 'flex', alignItems: 'flex-start', gap: '6px' },
  },
  customCss: `
/* 养生暖阳 - 装饰增强 */
.wx-root h1::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #7BA05B, #D4A017);
  margin: 8px auto 0;
  border-radius: 2px;
}
.wx-root h2::before {
  content: '🌿';
  margin-right: 6px;
  font-size: 0.8em;
}
.wx-root blockquote::before {
  content: '❝';
  font-size: 1.4em;
  color: #7BA05B;
  position: absolute;
  top: -5px;
  left: 8px;
  opacity: 0.5;
}
.wx-root blockquote {
  position: relative;
}
.wx-root ul > li::marker {
  color: #7BA05B;
}
.wx-root ol > li::marker {
  color: #D4A017;
  font-weight: 700;
}
`,
}
