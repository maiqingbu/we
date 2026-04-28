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

  db.exec(`
    CREATE TABLE IF NOT EXISTS previews (
      id TEXT PRIMARY KEY,
      html TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_keys (
      provider_id TEXT PRIMARY KEY,
      encrypted_key BLOB NOT NULL,
      model_id TEXT NOT NULL DEFAULT ''
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_styles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      styles TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS article_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_snapshots_article ON article_snapshots(article_id, created_at DESC)`)

  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_themes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      css TEXT NOT NULL,
      base_theme_id TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS image_host_configs (
      provider_id TEXT PRIMARY KEY,
      encrypted_config BLOB NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS image_host_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
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

// ── Saved Styles ──

export interface SavedStyle {
  id: number
  name: string
  styles: string // JSON
  created_at: number
}

export function listSavedStyles(): SavedStyle[] {
  return getDb().prepare('SELECT id, name, styles, created_at FROM saved_styles ORDER BY created_at DESC').all() as SavedStyle[]
}

export function createSavedStyle(name: string, styles: string): SavedStyle {
  return getDb().prepare('INSERT INTO saved_styles (name, styles) VALUES (?, ?) RETURNING id, name, styles, created_at').get(name, styles) as SavedStyle
}

export function updateSavedStyle(id: number, name: string): SavedStyle {
  return getDb().prepare('UPDATE saved_styles SET name = ? WHERE id = ? RETURNING id, name, styles, created_at').get(name, id) as SavedStyle
}

export function deleteSavedStyle(id: number): boolean {
  return getDb().prepare('DELETE FROM saved_styles WHERE id = ?').run(id).changes > 0
}

// ── Article Snapshots ──

export interface ArticleSnapshot {
  id: number
  article_id: number
  content: string
  word_count: number
  created_at: number
}

export function listSnapshots(articleId: number): ArticleSnapshot[] {
  return getDb()
    .prepare('SELECT id, article_id, content, word_count, created_at FROM article_snapshots WHERE article_id = ? ORDER BY created_at DESC LIMIT 30')
    .all(articleId) as ArticleSnapshot[]
}

export function createSnapshot(articleId: number, content: string, wordCount: number): ArticleSnapshot {
  // Enforce 30 max per article - delete oldest beyond limit
  getDb().prepare(`
    DELETE FROM article_snapshots WHERE article_id = ? AND id NOT IN (
      SELECT id FROM article_snapshots WHERE article_id = ? ORDER BY created_at DESC LIMIT 30
    )
  `).run(articleId, articleId)

  return getDb()
    .prepare('INSERT INTO article_snapshots (article_id, content, word_count) VALUES (?, ?, ?) RETURNING id, article_id, content, word_count, created_at')
    .get(articleId, content, wordCount) as ArticleSnapshot
}

export function getSnapshot(id: number): ArticleSnapshot | null {
  return (getDb().prepare('SELECT id, article_id, content, word_count, created_at FROM article_snapshots WHERE id = ?').get(id) as ArticleSnapshot | undefined | null) ?? null
}

export function getLatestSnapshotTime(articleId: number): number | null {
  const row = getDb().prepare('SELECT created_at FROM article_snapshots WHERE article_id = ? ORDER BY created_at DESC LIMIT 1').get(articleId) as { created_at: number } | undefined
  return row?.created_at ?? null
}

// ── Custom Themes ──

export interface CustomTheme {
  id: string
  name: string
  css: string
  base_theme_id: string | null
  created_at: number
  updated_at: number
}

export function listCustomThemes(): CustomTheme[] {
  return getDb().prepare('SELECT id, name, css, base_theme_id, created_at, updated_at FROM custom_themes ORDER BY updated_at DESC').all() as CustomTheme[]
}

export function createCustomTheme(id: string, name: string, css: string, baseThemeId: string | null): CustomTheme {
  return getDb().prepare('INSERT INTO custom_themes (id, name, css, base_theme_id) VALUES (?, ?, ?, ?) RETURNING id, name, css, base_theme_id, created_at, updated_at').get(id, name, css, baseThemeId) as CustomTheme
}

export function updateCustomTheme(id: string, name: string, css: string): CustomTheme {
  return getDb().prepare('UPDATE custom_themes SET name = ?, css = ?, updated_at = unixepoch() WHERE id = ? RETURNING id, name, css, base_theme_id, created_at, updated_at').get(name, css, id) as CustomTheme
}

export function deleteCustomTheme(id: string): boolean {
  return getDb().prepare('DELETE FROM custom_themes WHERE id = ?').run(id).changes > 0
}

export function duplicateCustomTheme(sourceId: string, newName: string): CustomTheme {
  const source = getDb().prepare('SELECT css, base_theme_id FROM custom_themes WHERE id = ?').get(sourceId) as { css: string; base_theme_id: string } | undefined
  if (!source) throw new Error('Source theme not found')
  const newId = `custom-${Date.now()}`
  return createCustomTheme(newId, newName, source.css, source.base_theme_id)
}
