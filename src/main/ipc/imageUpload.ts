import { ipcMain, safeStorage } from 'electron'
import { getUploader } from '../../lib/imageUpload/providers'

function encryptConfig(config: Record<string, string>): Buffer {
  const json = JSON.stringify(config)
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(json)
  }
  return Buffer.from(json, 'utf-8')
}

function decryptConfig(encrypted: Buffer): Record<string, string> {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const json = safeStorage.decryptString(encrypted)
      return JSON.parse(json)
    }
    return JSON.parse(encrypted.toString('utf-8'))
  } catch {
    return {}
  }
}

export function registerImageUploadHandlers(db: any): void {
  // ── Image Host Config CRUD ──
  ipcMain.handle('image-host:save-config', (_e, providerId: string, config: Record<string, string>) => {
    const encrypted = encryptConfig(config)
    return db
      .prepare(
        'INSERT INTO image_host_configs (provider_id, encrypted_config, updated_at) VALUES (?, ?, unixepoch()) ON CONFLICT(provider_id) DO UPDATE SET encrypted_config = ?, updated_at = unixepoch()'
      )
      .run(providerId, encrypted, encrypted)
  })

  ipcMain.handle('image-host:get-config', (_e, providerId: string) => {
    const row = db
      .prepare('SELECT encrypted_config FROM image_host_configs WHERE provider_id = ?')
      .get(providerId) as { encrypted_config: Buffer } | undefined
    if (!row) return null
    return decryptConfig(row.encrypted_config)
  })

  ipcMain.handle('image-host:delete-config', (_e, providerId: string) => {
    return db.prepare('DELETE FROM image_host_configs WHERE provider_id = ?').run(providerId).changes > 0
  })

  ipcMain.handle('image-host:list-configured', () => {
    const rows = db.prepare('SELECT provider_id FROM image_host_configs').all() as { provider_id: string }[]
    return rows.map((r) => r.provider_id)
  })

  // ── Image Host Settings ──
  ipcMain.handle('image-host:get-setting', (_e, key: string) => {
    const row = db.prepare('SELECT value FROM image_host_settings WHERE key = ?').get(key) as { value: string } | undefined
    return row?.value ?? null
  })

  ipcMain.handle('image-host:set-setting', (_e, key: string, value: string) => {
    return db
      .prepare(
        'INSERT INTO image_host_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?'
      )
      .run(key, value, value)
  })

  // ── Upload (proxied through main process to bypass CORS) ──
  ipcMain.handle('image:upload', async (_e, providerId: string, fileData: { buffer: ArrayBuffer; name: string }, config: Record<string, string>) => {
    const provider = getUploader(providerId)
    try {
      const buffer = Buffer.from(fileData.buffer)
      const result = await provider.upload(buffer, fileData.name, config)
      return { success: true, data: result }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  // ── Test Connection ──
  ipcMain.handle('image:test-connection', async (_e, providerId: string, config: Record<string, string>) => {
    const provider = getUploader(providerId)
    return provider.testConnection(config)
  })
}
