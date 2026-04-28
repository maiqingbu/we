import type { Theme } from '../types'

export const materiaMedicaTheme: Theme = {
  id: 'materia-medica',
  name: '本草',
  description: '水墨国风，印章点缀，传统中医美学',
  previewImage: '/theme-previews/materia-medica.jpg',
  headerImage: '/theme-headers/materia-medica.jpg',
  headerText: { title: '本草', subtitle: '药食同源 · 岐黄之道', color: '#1A1A1A', align: 'center', position: 'bottom' },
  styles: {
    container: {
      width: '100%',
      padding: '0',
      fontFamily: '"Songti SC", "Source Han Serif SC", "Noto Serif SC", Georgia, serif',
      color: '#1A1A1A',
      lineHeight: '2.0',
      fontSize: '16px',
      background: '#FDFBF7',
    },
    p: { margin: '1.2em 0', textIndent: '2em' },
    h1: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#1A1A1A',
      textAlign: 'center',
      margin: '1.5em 0 0.5em',
      letterSpacing: '0.1em',
    },
    h2: {
      fontSize: '21px',
      fontWeight: '700',
      color: '#3E2723',
      borderLeft: '3px solid #C23B22',
      paddingLeft: '14px',
      margin: '1.8em 0 0.8em',
      letterSpacing: '0.05em',
    },
    h3: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#6B8E6B',
      margin: '1.5em 0 0.6em',
    },
    h4: { fontSize: '16px', fontWeight: '600', color: '#3E2723' },
    strong: { color: '#C23B22', fontWeight: '700' },
    em: { fontStyle: 'italic', color: '#6B5B4F' },
    u: { textDecoration: 'none', borderBottom: '1px solid #6B5B4F' },
    s: { textDecoration: 'line-through' },
    a: { color: '#6B8E6B', textDecoration: 'none' },
    ul: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'circle' },
    ol: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'cjk-ideographic' },
    li: { margin: '0.5em 0', lineHeight: '1.9' },
    blockquote: {
      borderLeft: '3px solid #C23B22',
      background: '#F5F0E8',
      padding: '14px 20px',
      color: '#6B5B4F',
      fontStyle: 'italic',
      margin: '1.5em 0',
      borderRadius: '0 4px 4px 0',
    },
    code: {
      background: '#F5F0E8',
      color: '#8B4513',
      padding: '2px 6px',
      borderRadius: '2px',
      fontSize: '0.88em',
      fontFamily: '"SF Mono", Consolas, Monaco, monospace',
    },
    pre: {
      background: '#2C2416',
      color: '#E8DCC8',
      padding: '16px 20px',
      borderRadius: '4px',
      overflowX: 'auto',
      lineHeight: '1.6',
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
      background: '#D4CFC7',
      margin: '2em 10%',
    },
    img: {
      maxWidth: '100%',
      borderRadius: '4px',
      display: 'block',
      margin: '1.5em auto',
    },
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      fontSize: '14px',
      margin: '1em 0',
    },
    th: {
      background: '#F5F0E8',
      fontWeight: '700',
      padding: '10px 12px',
      border: '1px solid #D4CFC7',
      color: '#3E2723',
    },
    td: { padding: '10px 12px', border: '1px solid #D4CFC7' },
    taskList: { listStyleType: 'none', paddingLeft: '0' },
    taskItem: { display: 'flex', alignItems: 'flex-start', gap: '6px' },
  },
  customCss: `
/* 本草 - 水墨国风装饰 */
.wx-root h1 {
  position: relative;
}
.wx-root h1::after {
  content: '〔本草〕';
  display: block;
  font-size: 12px;
  color: #C23B22;
  letter-spacing: 0.3em;
  margin-top: 6px;
  font-weight: 400;
}
.wx-root h2 {
  position: relative;
}
.wx-root h2::after {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, #C23B22, transparent);
  margin-top: 6px;
  opacity: 0.3;
}
.wx-root blockquote {
  position: relative;
  border-radius: 2px;
}
.wx-root blockquote::before {
  content: '「';
  font-size: 2em;
  color: #C23B22;
  position: absolute;
  top: -10px;
  left: 10px;
  opacity: 0.4;
  line-height: 1;
}
.wx-root hr {
  position: relative;
}
.wx-root hr::after {
  content: '❖';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #FDFBF7;
  padding: 0 12px;
  color: #C23B22;
  font-size: 12px;
  opacity: 0.6;
}
.wx-root ul > li::marker {
  color: #6B8E6B;
}
`,
}
