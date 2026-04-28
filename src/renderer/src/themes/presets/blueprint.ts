import type { Theme } from '../types'

export const blueprintTheme: Theme = {
  id: 'blueprint',
  name: '蓝图',
  description: '暗黑科技风，蓝图网格，适合工程基建长文',
  previewImage: '/theme-previews/blueprint.jpg',
  headerImage: '/theme-headers/blueprint.jpg',
  headerText: { title: '蓝图', subtitle: '智慧基建 · 未来城市', color: '#F0F4F8', align: 'left', position: 'bottom' },
  styles: {
    container: {
      width: '100%',
      padding: '0',
      fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
      color: '#E0E8F0',
      lineHeight: '1.9',
      fontSize: '15px',
      background: '#0A1628',
    },
    p: { margin: '1.2em 0', color: '#C8D6E5' },
    h1: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#F0F4F8',
      textAlign: 'center',
      margin: '1.5em 0 0.8em',
      letterSpacing: '0.05em',
    },
    h2: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#00D4FF',
      borderLeft: '4px solid #00D4FF',
      paddingLeft: '14px',
      margin: '1.8em 0 0.8em',
    },
    h3: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#00D4FF',
      margin: '1.2em 0 0.6em',
      opacity: '0.85',
    },
    h4: { fontSize: '15px', fontWeight: '600', color: '#8899AA' },
    strong: { color: '#00D4FF', fontWeight: '700' },
    em: { fontStyle: 'italic', color: '#8899AA' },
    u: { textDecoration: 'none', borderBottom: '1px solid #00D4FF' },
    s: { textDecoration: 'line-through', color: '#5D6D7E' },
    a: { color: '#00D4FF', textDecoration: 'none' },
    ul: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'disc' },
    ol: { paddingLeft: '24px', margin: '1em 0', listStyleType: 'decimal' },
    li: { margin: '0.5em 0', color: '#C8D6E5' },
    blockquote: {
      borderLeft: '3px solid #FF6B35',
      background: 'rgba(15, 39, 68, 0.8)',
      padding: '12px 18px',
      color: '#C8D6E5',
      margin: '1.2em 0',
      borderRadius: '0 6px 6px 0',
    },
    code: {
      background: 'rgba(0, 212, 255, 0.1)',
      color: '#00D4FF',
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '0.9em',
      fontFamily: '"SF Mono", Consolas, Monaco, monospace',
    },
    pre: {
      background: '#060E1A',
      color: '#C8D6E5',
      padding: '16px 20px',
      borderRadius: '6px',
      overflowX: 'auto',
      lineHeight: '1.5',
      fontSize: '13px',
      margin: '1em 0',
      border: '1px solid rgba(0, 212, 255, 0.15)',
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
      background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.4), transparent)',
      margin: '2em 0',
    },
    img: {
      maxWidth: '100%',
      borderRadius: '6px',
      display: 'block',
      margin: '1em auto',
      border: '1px solid rgba(0, 212, 255, 0.15)',
    },
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      fontSize: '14px',
      margin: '1em 0',
    },
    th: {
      background: '#0F2744',
      fontWeight: '700',
      padding: '10px 12px',
      border: '1px solid rgba(0, 212, 255, 0.15)',
      color: '#00D4FF',
    },
    td: {
      padding: '10px 12px',
      border: '1px solid rgba(0, 212, 255, 0.08)',
      color: '#C8D6E5',
    },
    taskList: { listStyleType: 'none', paddingLeft: '0' },
    taskItem: { display: 'flex', alignItems: 'flex-start', gap: '6px' },
  },
  customCss: `
/* 蓝图 - 暗黑科技装饰 */
.wx-root {
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}
.wx-root h1::after {
  content: '';
  display: block;
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00D4FF, transparent);
  margin: 10px auto 0;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
}
.wx-root h2 {
  position: relative;
}
.wx-root h2::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00D4FF;
  margin-right: 10px;
  vertical-align: middle;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
}
.wx-root blockquote {
  position: relative;
  backdrop-filter: blur(4px);
}
.wx-root strong {
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
}
.wx-root code {
  border: 1px solid rgba(0, 212, 255, 0.15);
}
.wx-root table {
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 6px;
  overflow: hidden;
}
.wx-root a:hover {
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
}
`,
}
