import { ElectronAPI } from '@electron-toolkit/preload'

interface Article {
  id: number
  title: string
  content: string
  theme_id: string | null
  created_at: number
  updated_at: number
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
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
