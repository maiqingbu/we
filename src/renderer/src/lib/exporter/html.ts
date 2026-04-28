import { exportForWechat } from './index'
import type { Theme } from '@/themes/types'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function exportFullHtml(html: string, theme: Theme, title: string): string {
  const inlined = exportForWechat(html, theme)
  if (!inlined) throw new Error('导出内容为空')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      max-width: 720px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
      line-height: 1.75;
      color: #333;
    }
  </style>
</head>
<body>
${inlined}
</body>
</html>`
}
