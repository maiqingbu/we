import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

const api = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping'),
  copyToWechat: (html: string, plainText: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('copy-to-wechat', html, plainText),
  debugSaveExport: (html: string): Promise<{ filePath: string }> =>
    ipcRenderer.invoke('debug-save-export', html),
  articleList: (): Promise<Article[]> => ipcRenderer.invoke('article:list'),
  articleCreate: (): Promise<Article> => ipcRenderer.invoke('article:create'),
  articleGet: (id: number): Promise<Article | null> => ipcRenderer.invoke('article:get', id),
  articleUpdate: (id: number, data: { title?: string; content?: string; theme_id?: string }): Promise<Article> =>
    ipcRenderer.invoke('article:update', id, data),
  articleDelete: (id: number): Promise<boolean> => ipcRenderer.invoke('article:delete', id),
  // Import
  importOpenFile: (filters: FileFilter[]): Promise<string | null> =>
    ipcRenderer.invoke('import:open-file', filters),
  importWord: (filePath: string): Promise<ImportResult> =>
    ipcRenderer.invoke('import:word', filePath),
  importMarkdown: (filePath: string): Promise<ImportResult> =>
    ipcRenderer.invoke('import:markdown', filePath),
  importPdf: (filePath: string): Promise<ImportResult> =>
    ipcRenderer.invoke('import:pdf', filePath),
  importUrl: (url: string): Promise<ImportResult> =>
    ipcRenderer.invoke('import:url', url),
  // Link check
  checkLink: (url: string): Promise<LinkCheckResult> =>
    ipcRenderer.invoke('check-link', url),
  // Export
  exportPdf: (html: string, title: string, options: { pageSize: string }): Promise<{ canceled?: boolean; path?: string }> =>
    ipcRenderer.invoke('export-pdf', html, title, options),
  captureLongImage: (html: string, title: string, width: number): Promise<{ canceled?: boolean; path?: string }> =>
    ipcRenderer.invoke('capture-long-image', html, title, width),
  saveFile: (data: Buffer | Uint8Array | string, defaultName: string): Promise<{ canceled: boolean; path?: string }> =>
    ipcRenderer.invoke('save-file', data, defaultName),
  // Preview
  previewCreate: (html: string, title: string): Promise<{ id: string; url: string }> =>
    ipcRenderer.invoke('preview:create', html, title),
  previewList: (): Promise<Array<{ id: string; title: string; created_at: number; url: string }>> =>
    ipcRenderer.invoke('preview:list'),
  previewDelete: (id: string): Promise<boolean> =>
    ipcRenderer.invoke('preview:delete', id),
  previewOpenInBrowser: (url: string): Promise<void> =>
    ipcRenderer.invoke('preview:open-in-browser', url),
  // AI
  aiSaveKey: (providerId: string, apiKey: string, modelId: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('ai:save-key', providerId, apiKey, modelId),
  aiGetKey: (providerId: string): Promise<{ apiKey: string; modelId: string } | null> =>
    ipcRenderer.invoke('ai:get-key', providerId),
  aiDeleteKey: (providerId: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('ai:delete-key', providerId),
  aiListConfigured: (): Promise<Array<{ provider_id: string; model_id: string }>> =>
    ipcRenderer.invoke('ai:list-configured'),
  aiComplete: (providerId: string, requestId: string, opts: any): Promise<{ requestId: string }> =>
    ipcRenderer.invoke('ai:complete', providerId, requestId, opts),
  aiCancel: (requestId: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('ai:cancel', requestId),
  aiOpenExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('ai:open-external', url),
  aiTestConnection: (providerId: string, apiKey: string): Promise<{ ok: boolean; error?: string }> =>
    ipcRenderer.invoke('ai:test-connection', providerId, apiKey),
  // AI event listeners (streaming)
  onAiChunk: (callback: (event: Electron.IpcRendererEvent, data: { requestId: string; text: string }) => void) =>
    ipcRenderer.on('ai:chunk', callback),
  offAiChunk: (callback: (...args: any[]) => void) =>
    ipcRenderer.removeListener('ai:chunk', callback),
  onAiDone: (callback: (event: Electron.IpcRendererEvent, data: { requestId: string; fullText: string }) => void) =>
    ipcRenderer.on('ai:done', callback),
  offAiDone: (callback: (...args: any[]) => void) =>
    ipcRenderer.removeListener('ai:done', callback),
  onAiError: (callback: (event: Electron.IpcRendererEvent, data: { requestId: string; error: string }) => void) =>
    ipcRenderer.on('ai:error', callback),
  offAiError: (callback: (...args: any[]) => void) =>
    ipcRenderer.removeListener('ai:error', callback),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
