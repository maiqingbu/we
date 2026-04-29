import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerIpcHandlers } from './ipc'
import { registerImportHandlers } from './ipc/import'
import { registerLinkCheckHandlers } from './ipc/linkCheck'
import { registerExportPdfHandlers } from './ipc/exportPdf'
import { registerPreviewHandlers } from './ipc/preview'
import { registerAiHandlers } from './ipc/ai'
import { registerImageUploadHandlers } from './ipc/imageUpload'
import { registerCustomMaterialHandlers } from './ipc/customMaterial'
import { startPreviewServer } from './services/previewServer'
import { getDb, listSavedStyles, createSavedStyle, updateSavedStyle, deleteSavedStyle, listSnapshots, createSnapshot, getSnapshot, getLatestSnapshotTime, listCustomThemes, createCustomTheme, updateCustomTheme, deleteCustomTheme, duplicateCustomTheme } from './db'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Developer tools toggle
  ipcMain.on('devtools:toggle', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (win) {
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools()
      } else {
        win.webContents.openDevTools({ mode: 'bottom' })
      }
    }
  })

  // Initialize database
  getDb()

  // Start preview server
  startPreviewServer()

  // Register IPC handlers
  registerIpcHandlers()
  registerImportHandlers()
  registerLinkCheckHandlers()
  registerExportPdfHandlers()
  registerPreviewHandlers()
  registerAiHandlers()
  registerImageUploadHandlers(getDb())
  registerCustomMaterialHandlers()

  // ── Saved Styles ──
  ipcMain.handle('style:list', () => {
    return listSavedStyles()
  })
  ipcMain.handle('style:create', (_e, name: string, styles: string) => {
    return createSavedStyle(name, styles)
  })
  ipcMain.handle('style:update', (_e, id: number, name: string) => {
    return updateSavedStyle(id, name)
  })
  ipcMain.handle('style:delete', (_e, id: number) => {
    return deleteSavedStyle(id)
  })

  // ── Article Snapshots ──
  ipcMain.handle('snapshot:list', (_e, articleId: number) => {
    return listSnapshots(articleId)
  })
  ipcMain.handle('snapshot:create', (_e, articleId: number, content: string, wordCount: number) => {
    return createSnapshot(articleId, content, wordCount)
  })
  ipcMain.handle('snapshot:get', (_e, id: number) => {
    return getSnapshot(id)
  })
  ipcMain.handle('snapshot:latest-time', (_e, articleId: number) => {
    return getLatestSnapshotTime(articleId)
  })

  // ── Custom Themes ──
  ipcMain.handle('custom-theme:list', () => listCustomThemes())
  ipcMain.handle('custom-theme:create', (_e, id: string, name: string, css: string, baseThemeId: string | null) => {
    return createCustomTheme(id, name, css, baseThemeId)
  })
  ipcMain.handle('custom-theme:update', (_e, id: string, name: string, css: string) => {
    return updateCustomTheme(id, name, css)
  })
  ipcMain.handle('custom-theme:delete', (_e, id: string) => {
    return deleteCustomTheme(id)
  })
  ipcMain.handle('custom-theme:duplicate', (_e, sourceId: string, newName: string) => {
    return duplicateCustomTheme(sourceId, newName)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
