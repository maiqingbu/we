import { exportForWechat } from './index'
import type { Theme } from '@/themes/types'

export interface PdfExportOptions {
  pageSize: 'A4' | 'A3' | 'wechat'
}

export async function exportPdf(
  html: string,
  theme: Theme,
  title: string,
  options: PdfExportOptions
): Promise<void> {
  const inlined = exportForWechat(html, theme)
  if (!inlined) throw new Error('导出内容为空')

  // Build full HTML document for PDF rendering
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 40px;
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
      line-height: 1.75;
      color: #333;
    }
    img { max-width: 100%; height: auto; }
    pre { overflow-x: auto; }
    code { font-family: "SF Mono", "Fira Code", monospace; }
  </style>
</head>
<body>${inlined}</body>
</html>`

  const pageSize = options.pageSize === 'wechat'
    ? { width: 677000, height: 0 }
    : options.pageSize

  const result = await window.api.exportPdf(fullHtml, title, { pageSize })
  if (result && result.canceled) return
  if (result && result.path) {
    return // Success, caller shows toast
  }
}
