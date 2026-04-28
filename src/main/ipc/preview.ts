import { ipcMain, shell } from 'electron'
import { createPreview, listPreviews, deletePreview, getServerPort } from '../services/previewServer'

export function registerPreviewHandlers(): void {
  ipcMain.handle('preview:create', (_event, html: string, title: string) => {
    return createPreview(html, title)
  })

  ipcMain.handle('preview:list', () => {
    return listPreviews()
  })

  ipcMain.handle('preview:delete', (_event, id: string) => {
    return deletePreview(id)
  })

  ipcMain.handle('preview:open-in-browser', (_event, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('preview:get-port', () => {
    return getServerPort()
  })
}
