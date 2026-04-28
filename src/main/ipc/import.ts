import { ipcMain, dialog } from 'electron'
import { readFile } from 'fs/promises'
import { statSync } from 'fs'
import mammoth from 'mammoth'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

// pdf-parse 依赖 @napi-rs/canvas，需要 DOMMatrix polyfill
// 使用动态 import 避免启动时崩溃
async function getPdfParse() {
  if (typeof globalThis.DOMMatrix === 'undefined') {
    const { JSDOM: JSDOMPolyfill } = await import('jsdom')
    const virtualConsole = new JSDOMPolyfill('').window
    globalThis.DOMMatrix = virtualConsole.DOMMatrix as unknown as typeof globalThis.DOMMatrix
  }
  return import('pdf-parse')
}

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

interface ImportResult {
  html: string
  title: string
  warnings?: string[]
  meta?: Record<string, string>
}

function extractTitleFromHtml(html: string): string {
  const match = html.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i)
  if (match) {
    return match[1].replace(/<[^>]+>/g, '').trim().slice(0, 100)
  }
  const text = html.replace(/<[^>]+>/g, '').trim()
  return text.slice(0, 20) + (text.length > 20 ? '…' : '') || '无标题'
}

function extractTitleFromMarkdown(text: string): string {
  const lines = text.split('\n')
  for (const line of lines) {
    const match = line.match(/^#{1,4}\s+(.+)/)
    if (match) return match[1].trim().slice(0, 100)
  }
  return '无标题'
}

function textToHtml(text: string): string {
  const lines = text.split('\n')
  const paragraphs: string[] = []
  let current = ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '') {
      if (current) {
        // Check if it looks like a heading: short, no ending punctuation, surrounded by blank lines
        if (
          current.length < 30 &&
          !/[。，！？；：、,.!?;:]$/.test(current)
        ) {
          paragraphs.push(`<h2>${escapeHtml(current)}</h2>`)
        } else {
          paragraphs.push(`<p>${escapeHtml(current)}</p>`)
        }
        current = ''
      }
    } else {
      // Merge lines that look like they were broken mid-sentence
      if (current && /[，、,.]$/.test(current) === false && /^[A-Za-z0-9\u4e00-\u9fff]/.test(trimmed)) {
        current += trimmed
      } else {
        if (current) {
          paragraphs.push(`<p>${escapeHtml(current)}</p>`)
        }
        current = trimmed
      }
    }
  }
  if (current) {
    if (current.length < 30 && !/[。，！？；：、,.!?;:]$/.test(current)) {
      paragraphs.push(`<h2>${escapeHtml(current)}</h2>`)
    } else {
      paragraphs.push(`<p>${escapeHtml(current)}</p>`)
    }
  }

  return paragraphs.join('\n')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function importWord(filePath: string): Promise<ImportResult> {
  const result = await mammoth.convertToHtml(
    { path: filePath },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1",
        "p[style-name='Heading 2'] => h2",
        "p[style-name='Heading 3'] => h3",
        "p[style-name='Heading 4'] => h4",
        "p[style-name='Quote'] => blockquote",
      ],
      convertImage: mammoth.images.imgElement((image) => {
        return image.read('base64').then((imageBuffer) => ({
          src: `data:${image.contentType};base64,${imageBuffer}`,
        }))
      }),
    }
  )

  return {
    html: result.value,
    title: extractTitleFromHtml(result.value),
    warnings: result.messages.map((m) => `[${m.type}] ${m.message}`),
  }
}

async function importMarkdown(filePath: string): Promise<ImportResult> {
  const text = await readFile(filePath, 'utf-8')
  const { marked } = await import('marked')
  const html = await marked.parse(text, { gfm: true, breaks: false })
  return {
    html: html as string,
    title: extractTitleFromMarkdown(text),
  }
}

async function importPdf(filePath: string): Promise<ImportResult> {
  const buffer = await readFile(filePath)
  let data: { text: string; numpages: number; info?: { Title?: string } }

  try {
    const pdfModule = await getPdfParse()
    data = await pdfModule.default(buffer)
  } catch {
    throw new Error('PDF 没有可提取的文字（可能是扫描版），暂不支持')
  }

  if (!data.text || data.text.trim().length === 0) {
    throw new Error('PDF 没有可提取的文字（可能是扫描版），暂不支持')
  }

  const title =
    data.info?.Title ||
    filePath.split('/').pop()?.replace('.pdf', '') ||
    '无标题'

  return {
    html: textToHtml(data.text),
    title,
    meta: { pages: String(data.numpages) },
  }
}

function getHeadersForUrl(url: string): Record<string, string> {
  const baseHeaders: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  }
  if (url.includes('mp.weixin.qq.com')) {
    return {
      ...baseHeaders,
      Referer: 'https://mp.weixin.qq.com/',
    }
  }
  return baseHeaders
}

async function importUrl(url: string): Promise<ImportResult> {
  console.log('[import-url] start', url)

  // 阶段 1：URL 校验
  try {
    new URL(url)
  } catch {
    throw new Error('URL_INVALID:URL 格式不正确，请检查是否以 http:// 或 https:// 开头')
  }

  // 阶段 2：网络请求
  let response: Response
  try {
    response = await fetch(url, {
      headers: getHeadersForUrl(url),
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    })
  } catch (e: unknown) {
    const err = e as Error & { name?: string }
    if (err.name === 'TimeoutError') {
      throw new Error('NETWORK_TIMEOUT:请求超时（15 秒），网络可能较慢或网站无响应')
    }
    throw new Error(`NETWORK_FAIL:无法访问该链接：${err.message}`)
  }

  console.log('[import-url] response status', response.status, response.headers.get('content-type'))

  // 阶段 3：响应状态
  if (!response.ok) {
    throw new Error(`HTTP_ERROR:网站返回错误（HTTP ${response.status}），可能是文章已删除或无访问权限`)
  }

  // 阶段 4：内容类型校验
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('html')) {
    throw new Error(`CONTENT_TYPE:返回内容不是网页（${contentType}），无法解析`)
  }

  const html = await response.text()
  console.log('[import-url] html length', html.length)

  // 阶段 5：公众号反爬 / 错误页面检测
  if (url.includes('mp.weixin.qq.com')) {
    // 微信常见的错误页面关键词
    const wechatErrorPatterns = [
      '环境异常',
      '完成验证以继续访问',
      '参数错误',
      '该公众号已被封禁',
      '此内容因违规无法查看',
      '该页面的链接已失效',
      '请确认输入的网址是否正确',
      '系统升级中',
      '访问受限',
    ]
    const matchedKeyword = wechatErrorPatterns.find((kw) => html.includes(kw))
    if (matchedKeyword) {
      // 尝试从页面提取具体错误信息
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
      const pageTitle = titleMatch ? titleMatch[1].replace(/&nbsp;/g, ' ').trim() : ''
      const detail = pageTitle && pageTitle !== '微信网页版' ? `（${pageTitle}）` : ''
      throw new Error(
        `WECHAT_BLOCKED:微信返回"${matchedKeyword}"${detail}，请用浏览器打开文章后复制正文粘贴到编辑器`
      )
    }
    if (html.length < 1000) {
      throw new Error('WECHAT_EMPTY:获取到的页面内容过短，可能是文章已被删除或需要登录查看')
    }
  }

  // 阶段 6：Readability 解析
  let article: { content: string; title: string; byline?: string; siteName?: string; excerpt?: string } | null
  try {
    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    article = reader.parse()
  } catch (e: unknown) {
    const err = e as Error
    throw new Error(`PARSE_FAIL:解析页面结构失败：${err.message}`)
  }

  console.log('[import-url] readability result', !!article, article?.content?.length)

  if (!article || !article.content) {
    throw new Error('NO_CONTENT:未能识别文章正文，该页面可能不是标准的文章页')
  }

  if (article.content.length < 200) {
    throw new Error('CONTENT_TOO_SHORT:抓取到的正文过短（少于 200 字），可能识别错误')
  }

  return {
    html: article.content,
    title: article.title || extractTitleFromHtml(article.content),
    meta: {
      byline: article.byline || '',
      siteName: article.siteName || '',
      excerpt: article.excerpt || '',
    },
  }
}

export function registerImportHandlers(): void {
  // Open file dialog (runs in main process for security)
  ipcMain.handle('import:open-file', async (_event, filters: { name: string; extensions: string[] }[]) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters,
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    const filePath = result.filePaths[0]
    // Check file size
    try {
      const stat = statSync(filePath)
      if (stat.size > MAX_FILE_SIZE) {
        throw new Error(`文件太大（>${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB），请压缩后再导入`)
      }
    } catch (err) {
      if (err instanceof Error) throw err
    }
    return filePath
  })

  // Import Word document
  ipcMain.handle('import:word', async (_event, filePath: string): Promise<ImportResult> => {
    if (!filePath.endsWith('.docx')) {
      throw new Error('Word 导入只接受 .docx 文件')
    }
    return importWord(filePath)
  })

  // Import Markdown file
  ipcMain.handle('import:markdown', async (_event, filePath: string): Promise<ImportResult> => {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.markdown')) {
      throw new Error('Markdown 导入只接受 .md 或 .markdown 文件')
    }
    return importMarkdown(filePath)
  })

  // Import PDF file
  ipcMain.handle('import:pdf', async (_event, filePath: string): Promise<ImportResult> => {
    if (!filePath.endsWith('.pdf')) {
      throw new Error('PDF 导入只接受 .pdf 文件')
    }
    return importPdf(filePath)
  })

  // Import from URL
  ipcMain.handle('import:url', async (_event, url: string): Promise<ImportResult> => {
    if (!url || !/^https?:\/\//i.test(url)) {
      throw new Error('请输入有效的 URL（以 http:// 或 https:// 开头）')
    }
    return importUrl(url)
  })
}
