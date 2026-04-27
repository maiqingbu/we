import type { Theme } from '../types'

export const originalTheme: Theme = {
  id: 'original',
  name: '原始',
  description: '不做任何风格化覆盖，保留编辑器中的原始设置',
  styles: {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
      fontSize: '15px',
      lineHeight: '1.75',
      color: '#3f3f3f',
    },
    p: { margin: '1em 0', letterSpacing: '0.05em' },

    h1: { fontSize: '24px', fontWeight: '700', margin: '1.5em 0 1em', textAlign: 'center' },
    h2: { fontSize: '20px', fontWeight: '700', margin: '1.4em 0 0.8em' },
    h3: { fontSize: '17px', fontWeight: '700', margin: '1.2em 0 0.6em' },
    h4: { fontSize: '15px', fontWeight: '700', margin: '1em 0 0.5em' },

    strong: {},
    em: {},
    u: {},
    s: {},

    a: { color: '#576b95', textDecoration: 'none' },

    ul: { paddingLeft: '24px', margin: '1em 0' },
    ol: { paddingLeft: '24px', margin: '1em 0' },
    li: { margin: '0.4em 0' },

    blockquote: {
      borderLeft: '3px solid #dbdbdb',
      padding: '8px 16px',
      background: '#f7f7f7',
      margin: '1em 0',
      color: '#666',
    },

    code: {
      background: '#f4f5f7',
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '0.9em',
      fontFamily: '"SF Mono", Consolas, Monaco, monospace',
    },
    pre: {
      background: '#1e1e1e',
      color: '#d4d4d4',
      padding: '16px 20px',
      borderRadius: '6px',
      overflowX: 'auto',
      lineHeight: '1.5',
      fontSize: '13px',
      margin: '1em 0',
    },
    preCode: { background: 'transparent', color: 'inherit' },

    hr: { border: '0', height: '1px', background: '#e5e7eb', margin: '2em 0' },
    img: { maxWidth: '100%', display: 'block', margin: '1em auto', borderRadius: '4px' },

    table: { borderCollapse: 'collapse', width: '100%', fontSize: '14px', margin: '1em 0' },
    th: { background: '#f7f8fc', fontWeight: '700', padding: '8px 12px', border: '1px solid #e5e7eb' },
    td: { padding: '8px 12px', border: '1px solid #e5e7eb' },

    taskList: { listStyle: 'none', paddingLeft: '0' },
    taskItem: { margin: '0.4em 0' },
  },
}
