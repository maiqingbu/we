import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'http'
import { getDb } from '../db'

let server: Server | null = null
let serverPort = 0

function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildFullHtml(html: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      max-width: 720px;
      margin: 20px auto;
      padding: 0 16px;
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
      color: #333;
      line-height: 1.75;
    }
    @media (max-width: 480px) {
      body { margin: 10px auto; padding: 0 12px; }
    }
    img { max-width: 100%; height: auto; }
    pre { overflow-x: auto; }
  </style>
</head>
<body>${html}</body>
</html>`
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  // Only handle /p/{id} routes
  const urlPath = req.url || '/'
  const match = urlPath.match(/^\/p\/([A-Za-z0-9]+)(\?|$)/)

  if (!match) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>404 - 页面不存在</h1>')
    return
  }

  const id = match[1]
  const db = getDb()
  const row = db.prepare('SELECT html, title FROM previews WHERE id = ?').get(id) as { html: string; title: string } | undefined

  if (!row) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>预览不存在或已过期</h1>')
    return
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(buildFullHtml(row.html, row.title))
}

export function startPreviewServer(): void {
  if (server) return

  server = createServer(handleRequest)
  server.listen(0, '127.0.0.1', () => {
    const addr = server?.address()
    if (addr && typeof addr === 'object') {
      serverPort = addr.port
      console.log(`[preview-server] listening on http://127.0.0.1:${serverPort}`)
    }
  })
}

export function getServerPort(): number {
  return serverPort
}

export function createPreview(html: string, title: string): { id: string; url: string } {
  const id = generateId()
  const db = getDb()

  // Enforce max 50 previews
  const count = (db.prepare('SELECT COUNT(*) as cnt FROM previews').get() as { cnt: number }).cnt
  if (count >= 50) {
    db.prepare('DELETE FROM previews WHERE id IN (SELECT id FROM previews ORDER BY created_at ASC LIMIT 1)').run()
  }

  db.prepare('INSERT INTO previews (id, html, title, created_at) VALUES (?, ?, ?, unixepoch())').run(id, html, title)

  return {
    id,
    url: `http://127.0.0.1:${serverPort}/p/${id}`,
  }
}

export function listPreviews(): Array<{ id: string; title: string; created_at: number; url: string }> {
  const db = getDb()
  const rows = db.prepare('SELECT id, title, created_at FROM previews ORDER BY created_at DESC LIMIT 50').all() as Array<{ id: string; title: string; created_at: number }>
  return rows.map((r) => ({
    ...r,
    url: `http://127.0.0.1:${serverPort}/p/${r.id}`,
  }))
}

export function deletePreview(id: string): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM previews WHERE id = ?').run(id)
  return result.changes > 0
}

export function stopPreviewServer(): void {
  if (server) {
    server.close()
    server = null
    serverPort = 0
  }
}
