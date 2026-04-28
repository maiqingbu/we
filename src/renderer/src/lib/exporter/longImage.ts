import { exportForWechat } from './index'
import type { Theme } from '@/themes/types'

interface LongImageOptions {
  width: number // 750 | 1080 | 677
}

export async function exportLongImage(
  html: string,
  theme: Theme,
  title: string,
  options: LongImageOptions
): Promise<void> {
  const inlinedHtml = exportForWechat(html, theme)
  if (!inlinedHtml) throw new Error('导出内容为空')

  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${options.width}px;
      padding: 20px;
      background: #ffffff;
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
    }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>${inlinedHtml}</body>
</html>`

  const result = await window.api.captureLongImage(fullHtml, title, options.width)
  if (result && !result.canceled) {
    return
  }
}
