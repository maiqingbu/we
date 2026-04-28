import { ipcMain, dialog, BrowserWindow, shell } from 'electron'
import { writeFile } from 'fs/promises'

export function registerExportPdfHandlers(): void {
  ipcMain.handle('export-pdf', async (_event, html: string, title: string, options: { pageSize: string }) => {
    // Create offscreen window for rendering
    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        offscreen: true,
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    try {
      // Load HTML content
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
      await win.loadURL(dataUrl)

      // Wait a bit for rendering
      await new Promise((r) => setTimeout(r, 500))

      // Generate PDF
      const pdfBuffer = await win.webContents.printToPDF({
        pageSize: options.pageSize === 'wechat' ? { width: 677000, height: 0 } : options.pageSize,
        printBackground: true,
        margins: { marginType: 'custom', top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
      })

      // Sanitize title for filename
      const safeTitle = (title || '未命名文章').replace(/[\\/:*?"<>|]/g, '_')

      // Show save dialog
      const saveResult = await dialog.showSaveDialog({
        defaultPath: `${safeTitle}.pdf`,
        filters: [{ name: 'PDF 文件', extensions: ['pdf'] }],
      })

      if (saveResult.canceled || !saveResult.filePath) {
        win.close()
        return { canceled: true }
      }

      await writeFile(saveResult.filePath, pdfBuffer)

      // Show file in folder
      shell.showItemInFolder(saveResult.filePath)

      win.close()
      return { path: saveResult.filePath }
    } catch (err) {
      win.close()
      throw err
    }
  })

  // Capture long image using Electron native webContents.capturePage()
  ipcMain.handle('capture-long-image', async (_event, html: string, title: string, width: number) => {
    const win = new BrowserWindow({
      show: false,
      width: width + 40, // extra padding
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    try {
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
      await win.loadURL(dataUrl)

      // Wait for images to load and rendering to complete
      await new Promise((r) => setTimeout(r, 1000))

      // Get actual content height
      const contentHeight = await win.webContents.executeJavaScript('document.body.scrollHeight')
      win.setSize(width + 40, contentHeight + 40)
      await new Promise((r) => setTimeout(r, 300))

      // Capture the page as PNG
      const image = await win.webContents.capturePage()
      const pngBuffer = image.toPNG()

      const safeTitle = (title || '未命名文章').replace(/[\\/:*?"<>|]/g, '_')

      const saveResult = await dialog.showSaveDialog({
        defaultPath: `${safeTitle}.png`,
        filters: [{ name: 'PNG 图片', extensions: ['png'] }],
      })

      if (saveResult.canceled || !saveResult.filePath) {
        win.close()
        return { canceled: true }
      }

      await writeFile(saveResult.filePath, pngBuffer)
      shell.showItemInFolder(saveResult.filePath)

      win.close()
      return { path: saveResult.filePath }
    } catch (err) {
      win.close()
      throw err
    }
  })

  // Save file (generic, used for HTML and Markdown export)
  ipcMain.handle('save-file', async (_event, data: Buffer | Uint8Array | string | Record<string, number>, defaultName: string) => {
    const saveResult = await dialog.showSaveDialog({
      defaultPath: defaultName,
    })

    if (saveResult.canceled || !saveResult.filePath) {
      return { canceled: true }
    }

    if (typeof data === 'string') {
      await writeFile(saveResult.filePath, data, 'utf-8')
    } else if (Buffer.isBuffer(data)) {
      await writeFile(saveResult.filePath, data)
    } else if (data instanceof Uint8Array) {
      await writeFile(saveResult.filePath, data)
    } else if (typeof data === 'object' && data !== null) {
      // IPC may deserialize Uint8Array as a plain object
      const arr = new Uint8Array(Object.values(data as Record<string, number>))
      await writeFile(saveResult.filePath, arr)
    }

    shell.showItemInFolder(saveResult.filePath)
    return { path: saveResult.filePath }
  })
}
