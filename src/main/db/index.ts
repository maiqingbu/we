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

  // ── Custom Materials ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      keywords TEXT,
      thumbnail TEXT NOT NULL,
      html TEXT NOT NULL,
      group_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      use_count INTEGER DEFAULT 0
    )
  `)
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_material_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_custom_materials_group ON custom_materials(group_id)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_custom_materials_use ON custom_materials(use_count DESC)`)

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

// ── Custom Materials ──

export interface CustomMaterial {
  id: string
  name: string
  kind: string
  keywords: string // JSON array
  thumbnail: string
  html: string
  group_id: string | null
  created_at: number
  updated_at: number
  use_count: number
}

export interface CustomMaterialGroup {
  id: string
  name: string
  sort_order: number
  created_at: number
}

export function listCustomMaterials(): CustomMaterial[] {
  return getDb().prepare('SELECT * FROM custom_materials ORDER BY use_count DESC, updated_at DESC').all() as CustomMaterial[]
}

export function getCustomMaterial(id: string): CustomMaterial | null {
  return (getDb().prepare('SELECT * FROM custom_materials WHERE id = ?').get(id) as CustomMaterial | undefined) ?? null
}

export function saveCustomMaterial(m: {
  id?: string
  name: string
  kind: string
  keywords: string[]
  thumbnail: string
  html: string
  group_id?: string | null
}): { id: string } {
  const db = getDb()
  const id = m.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const now = Math.floor(Date.now() / 1000)
  const keywordsJson = JSON.stringify(m.keywords)

  db.prepare(`
    INSERT INTO custom_materials (id, name, kind, keywords, thumbnail, html, group_id, created_at, updated_at, use_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      kind = excluded.kind,
      keywords = excluded.keywords,
      thumbnail = excluded.thumbnail,
      html = excluded.html,
      group_id = excluded.group_id,
      updated_at = excluded.updated_at
  `).run(id, m.name, m.kind, keywordsJson, m.thumbnail, m.html, m.group_id ?? null, now, now)

  return { id }
}

export function deleteCustomMaterial(id: string): boolean {
  return getDb().prepare('DELETE FROM custom_materials WHERE id = ?').run(id).changes > 0
}

export function incrementMaterialUse(id: string): void {
  getDb().prepare('UPDATE custom_materials SET use_count = use_count + 1 WHERE id = ?').run(id)
}

export function updateCustomMaterialMeta(id: string, data: { name?: string; keywords?: string[]; group_id?: string | null }): boolean {
  const existing = getCustomMaterial(id)
  if (!existing) return false
  const db = getDb()
  const now = Math.floor(Date.now() / 1000)
  const name = data.name ?? existing.name
  const keywords = data.keywords !== undefined ? JSON.stringify(data.keywords) : existing.keywords
  const groupId = data.group_id !== undefined ? data.group_id : existing.group_id
  db.prepare('UPDATE custom_materials SET name = ?, keywords = ?, group_id = ?, updated_at = ? WHERE id = ?').run(name, keywords, groupId, now, id)
  return true
}

export function updateCustomMaterialHtml(id: string, html: string, thumbnail: string): boolean {
  const now = Math.floor(Date.now() / 1000)
  return getDb().prepare('UPDATE custom_materials SET html = ?, thumbnail = ?, updated_at = ? WHERE id = ?').run(html, thumbnail, now, id).changes > 0
}

export function duplicateCustomMaterial(sourceId: string): { id: string } | null {
  const source = getCustomMaterial(sourceId)
  if (!source) return null
  return saveCustomMaterial({
    name: source.name + '（副本）',
    kind: source.kind,
    keywords: JSON.parse(source.keywords || '[]'),
    thumbnail: source.thumbnail,
    html: source.html,
    group_id: source.group_id,
  })
}

// ── Custom Material Groups ──

export function listCustomMaterialGroups(): CustomMaterialGroup[] {
  return getDb().prepare('SELECT * FROM custom_material_groups ORDER BY sort_order ASC, created_at ASC').all() as CustomMaterialGroup[]
}

export function createCustomMaterialGroup(name: string): CustomMaterialGroup {
  const id = `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const now = Math.floor(Date.now() / 1000)
  // 获取最大 sort_order
  const maxRow = getDb().prepare('SELECT MAX(sort_order) as max_sort FROM custom_material_groups').get() as { max_sort: number | null }
  const sortOrder = (maxRow?.max_sort ?? -1) + 1
  return getDb().prepare('INSERT INTO custom_material_groups (id, name, sort_order, created_at) VALUES (?, ?, ?, ?) RETURNING *').get(id, name, sortOrder, now) as CustomMaterialGroup
}

export function renameCustomMaterialGroup(id: string, newName: string): boolean {
  return getDb().prepare('UPDATE custom_material_groups SET name = ? WHERE id = ?').run(newName, id).changes > 0
}

export function deleteCustomMaterialGroup(id: string, alsoDeleteMaterials: boolean): void {
  if (alsoDeleteMaterials) {
    getDb().prepare('DELETE FROM custom_materials WHERE group_id = ?').run(id)
  } else {
    // 将组内素材移到未分组
    getDb().prepare('UPDATE custom_materials SET group_id = NULL WHERE group_id = ?').run(id)
  }
  getDb().prepare('DELETE FROM custom_material_groups WHERE id = ?').run(id)
}

export function reorderCustomMaterialGroups(ids: string[]): void {
  const db = getDb()
  const stmt = db.prepare('UPDATE custom_material_groups SET sort_order = ? WHERE id = ?')
  const transaction = db.transaction((items: string[]) => {
    for (let i = 0; i < items.length; i++) {
      stmt.run(i, items[i])
    }
  })
  transaction(ids)
}

export function moveMaterialToGroup(materialId: string, groupId: string | null): boolean {
  const now = Math.floor(Date.now() / 1000)
  return getDb().prepare('UPDATE custom_materials SET group_id = ?, updated_at = ? WHERE id = ?').run(groupId, now, materialId).changes > 0
}
