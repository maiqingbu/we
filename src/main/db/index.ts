import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

let db: Database.Database | null = null

export interface Article {
  id: number
  title: string
  content: string
  theme_id: string | null
  created_at: number
  updated_at: number
}

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'wx.db')
  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')

  // Run migrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      theme_id TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  return db
}

export function listArticles(): Article[] {
  const db = getDb()
  return db
    .prepare('SELECT id, title, content, theme_id, created_at, updated_at FROM articles ORDER BY updated_at DESC')
    .all() as Article[]
}

export function createArticle(): Article {
  const db = getDb()
  return db
    .prepare(
      'INSERT INTO articles (title, content) VALUES (\'\', \'\') RETURNING id, title, content, theme_id, created_at, updated_at'
    )
    .get() as Article
}

export function getArticle(id: number): Article | null {
  const db = getDb()
  return (
    db
      .prepare('SELECT id, title, content, theme_id, created_at, updated_at FROM articles WHERE id = ?')
      .get(id) as Article | undefined | null
  ) ?? null
}

export function updateArticle(
  id: number,
  data: { title?: string; content?: string; theme_id?: string }
): Article {
  const db = getDb()
  const existing = getArticle(id)
  if (!existing) {
    throw new Error(`Article ${id} not found`)
  }

  const title = data.title ?? existing.title
  const content = data.content ?? existing.content
  const theme_id = data.theme_id !== undefined ? data.theme_id : existing.theme_id

  return db
    .prepare(
      'UPDATE articles SET title = ?, content = ?, theme_id = ?, updated_at = unixepoch() WHERE id = ? RETURNING id, title, content, theme_id, created_at, updated_at'
    )
    .get(title, content, theme_id, id) as Article
}

export function deleteArticle(id: number): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM articles WHERE id = ?').run(id)
  return result.changes > 0
}
