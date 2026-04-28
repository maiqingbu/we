import { ipcMain } from 'electron'

export function registerLinkCheckHandlers(): void {
  ipcMain.handle('check-link', async (_event, url: string) => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(8000),
        redirect: 'follow',
      })
      return { url, ok: response.ok, status: response.status }
    } catch (e: unknown) {
      const err = e as Error
      return { url, ok: false, error: err.message }
    }
  })
}
