import { ElectronAPI } from '@electron-toolkit/preload'

interface Article {
  id: number
  title: string
  content: string
  theme_id: string | null
  created_at: number
  updated_at: number
}

interface ImportResult {
  html: string
  title: string
  warnings?: string[]
  meta?: Record<string, string>
}

interface LinkCheckResult {
  url: string
  ok: boolean
  status?: number
  error?: string
}

interface FileFilter {
  name: string
  extensions: string[]
}

interface Api {
  ping: () => Promise<string>
  copyToWechat: (html: string, plainText: string) => Promise<{ success: boolean }>
  debugSaveExport: (html: string) => Promise<{ filePath: string }>
  articleList: () => Promise<Article[]>
  articleCreate: () => Promise<Article>
  articleGet: (id: number) => Promise<Article | null>
  articleUpdate: (id: number, data: { title?: string; content?: string; theme_id?: string }) => Promise<Article>
  articleDelete: (id: number) => Promise<boolean>
  importOpenFile: (filters: FileFilter[]) => Promise<string | null>
  importWord: (filePath: string) => Promise<ImportResult>
  importMarkdown: (filePath: string) => Promise<ImportResult>
  importPdf: (filePath: string) => Promise<ImportResult>
  importUrl: (url: string) => Promise<ImportResult>
  checkLink: (url: string) => Promise<LinkCheckResult>
  exportPdf: (html: string, title: string, options: { pageSize: string }) => Promise<{ canceled?: boolean; path?: string }>
  captureLongImage: (html: string, title: string, width: number) => Promise<{ canceled?: boolean; path?: string }>
  saveFile: (data: Buffer | Uint8Array | string, defaultName: string) => Promise<{ canceled: boolean; path?: string }>
  previewCreate: (html: string, title: string) => Promise<{ id: string; url: string }>
  previewList: () => Promise<Array<{ id: string; title: string; created_at: number; url: string }>>
  previewDelete: (id: string) => Promise<boolean>
  previewOpenInBrowser: (url: string) => Promise<void>
  aiSaveKey: (providerId: string, apiKey: string, modelId: string) => Promise<{ success: boolean }>
  aiGetKey: (providerId: string) => Promise<{ apiKey: string; modelId: string } | null>
  aiDeleteKey: (providerId: string) => Promise<{ success: boolean }>
  aiListConfigured: () => Promise<Array<{ provider_id: string; model_id: string }>>
  aiComplete: (providerId: string, requestId: string, opts: any) => Promise<{ requestId: string }>
  aiCancel: (requestId: string) => Promise<{ success: boolean }>
  aiOpenExternal: (url: string) => Promise<void>
  aiTestConnection: (providerId: string, apiKey: string) => Promise<{ ok: boolean; error?: string }>
  onAiChunk: (callback: (event: Electron.IpcRendererEvent, data: { requestId: string; text: string }) => void) => void
  offAiChunk: (callback: (...args: any[]) => void) => void
  onAiDone: (callback: (event: Electron.IpcRendererEvent, data: { requestId: string; fullText: string }) => void) => void
  offAiDone: (callback: (...args: any[]) => void) => void
  onAiError: (callback: (event: Electron.IpcRendererEvent, data: { requestId: string; error: string }) => void) => void
  offAiError: (callback: (...args: any[]) => void) => void
  styleList: () => Promise<Array<{ id: number; name: string; styles: string; created_at: number }>>
  styleCreate: (name: string, styles: string) => Promise<{ id: number; name: string; styles: string; created_at: number }>
  styleUpdate: (id: number, name: string) => Promise<{ id: number; name: string; styles: string; created_at: number }>
  styleDelete: (id: number) => Promise<boolean>
  snapshotList: (articleId: number) => Promise<Array<{ id: number; article_id: number; content: string; word_count: number; created_at: number }>>
  snapshotCreate: (articleId: number, content: string, wordCount: number) => Promise<{ id: number }>
  snapshotGet: (id: number) => Promise<{ id: number; article_id: number; content: string; word_count: number; created_at: number } | null>
  snapshotLatestTime: (articleId: number) => Promise<number | null>
  customThemeList: () => Promise<Array<{ id: string; name: string; css: string; base_theme_id: string | null; created_at: number; updated_at: number }>>
  customThemeCreate: (id: string, name: string, css: string, baseThemeId: string | null) => Promise<{ id: string; name: string; css: string }>
  customThemeUpdate: (id: string, name: string, css: string) => Promise<{ id: string; name: string; css: string }>
  customThemeDelete: (id: string) => Promise<boolean>
  customThemeDuplicate: (sourceId: string, newName: string) => Promise<{ id: string; name: string; css: string }>
  // Image Host
  imageHostSaveConfig: (providerId: string, config: Record<string, string>) => Promise<void>
  imageHostGetConfig: (providerId: string) => Promise<Record<string, string> | null>
  imageHostDeleteConfig: (providerId: string) => Promise<boolean>
  imageHostListConfigured: () => Promise<string[]>
  imageHostGetSetting: (key: string) => Promise<string | null>
  imageHostSetSetting: (key: string, value: string) => Promise<void>
  imageUpload: (providerId: string, fileData: { buffer: ArrayBuffer; name: string }, config: Record<string, string>) => Promise<{ success: boolean; data?: { url: string }; error?: string }>
  imageTestConnection: (providerId: string, config: Record<string, string>) => Promise<{ ok: boolean; error?: string }>
  // Custom Materials
  cmList: () => Promise<{ materials: any[]; groups: any[] }>
  cmSave: (material: { id?: string; name: string; kind: string; keywords: string[]; thumbnail: string; html: string; group_id?: string | null }) => Promise<{ id: string }>
  cmDelete: (id: string) => Promise<boolean>
  cmIncrementUse: (id: string) => Promise<void>
  cmUpdateMeta: (id: string, data: { name?: string; keywords?: string[]; group_id?: string | null }) => Promise<boolean>
  cmUpdateHtml: (id: string, html: string, thumbnail: string) => Promise<boolean>
  cmDuplicate: (id: string) => Promise<{ id: string } | null>
  cmMoveToGroup: (materialId: string, groupId: string | null) => Promise<boolean>
  cmCreateGroup: (name: string) => Promise<any>
  cmRenameGroup: (id: string, newName: string) => Promise<boolean>
  cmDeleteGroup: (id: string, alsoDeleteMaterials: boolean) => Promise<void>
  cmReorderGroups: (ids: string[]) => Promise<void>
  cmExportAll: () => Promise<any>
  cmExportToFile: () => Promise<{ canceled: boolean; path?: string }>
  cmImportFromFile: () => Promise<{ canceled: boolean; data?: any; error?: string }>
  cmImport: (data: any, conflictStrategy: 'skip' | 'overwrite' | 'new') => Promise<{ added: number; skipped: number; overwritten: number }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
