import { ipcMain, clipboard, app } from 'electron'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import { listArticles, createArticle, getArticle, updateArticle, deleteArticle } from '../db'

export function registerIpcHandlers(): void {
  ipcMain.handle('ping', async (_event): Promise<string> => {
    return 'pong'
  })

  ipcMain.handle(
    'copy-to-wechat',
    async (_event, html: string, _plainText: string): Promise<{ success: boolean }> => {
      try {
        clipboard.write({ html, text: _plainText })
        return { success: true }
      } catch (err) {
        console.error('[copy-to-wechat] Failed:', err)
        return { success: false }
      }
    }
  )

  // Debug: save exported HTML to file (Ctrl/Cmd + Shift + E)
  ipcMain.handle(
    'debug-save-export',
    async (_event, html: string): Promise<{ filePath: string }> => {
      const filePath = join(app.getPath('userData'), 'last-export.html')
      await writeFile(filePath, html, 'utf-8')
      console.log(`[debug] Export saved to: ${filePath}`)
      return { filePath }
    }
  )

  // Article CRUD
  ipcMain.handle('article:list', async () => {
    return listArticles()
  })

  ipcMain.handle('article:create', async () => {
    return createArticle()
  })

  ipcMain.handle('article:get', async (_event, id: number) => {
    return getArticle(id)
  })

  ipcMain.handle('article:update', async (_event, id: number, data: { title?: string; content?: string; theme_id?: string }) => {
    return updateArticle(id, data)
  })

  ipcMain.handle('article:delete', async (_event, id: number) => {
    return deleteArticle(id)
  })
}
