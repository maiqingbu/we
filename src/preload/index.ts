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
