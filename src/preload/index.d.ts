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
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
