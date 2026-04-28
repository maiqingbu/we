import { safeStorage, ipcMain, shell } from 'electron'
import { getDb } from '../db'

// Active requests for cancellation
const activeRequests = new Map<string, AbortController>()

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function registerAiHandlers(): void {
  // Save encrypted API key
  ipcMain.handle('ai:save-key', async (_event, providerId: string, apiKey: string, modelId: string) => {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('当前系统不支持安全加密存储')
    }
    const encrypted = safeStorage.encryptString(apiKey)
    const db = getDb()
    db.prepare(`
      INSERT INTO ai_keys (provider_id, encrypted_key, model_id) VALUES (?, ?, ?)
      ON CONFLICT(provider_id) DO UPDATE SET encrypted_key = excluded.encrypted_key, model_id = excluded.model_id
    `).run(providerId, encrypted, modelId)
    return { success: true }
  })

  // Get decrypted API key
  ipcMain.handle('ai:get-key', async (_event, providerId: string) => {
    const row = getDb()
      .prepare('SELECT encrypted_key, model_id FROM ai_keys WHERE provider_id = ?')
      .get(providerId) as { encrypted_key: Buffer; model_id: string } | undefined
    if (!row) return null
    const apiKey = safeStorage.decryptString(row.encrypted_key)
    return { apiKey, modelId: row.model_id }
  })

  // Delete API key
  ipcMain.handle('ai:delete-key', async (_event, providerId: string) => {
    getDb().prepare('DELETE FROM ai_keys WHERE provider_id = ?').run(providerId)
    return { success: true }
  })

  // List configured providers
  ipcMain.handle('ai:list-configured', async () => {
    return getDb().prepare('SELECT provider_id, model_id FROM ai_keys').all() as Array<{
      provider_id: string
      model_id: string
    }>
  })

  // AI completion (proxied through main process)
  ipcMain.handle('ai:complete', async (event, providerId: string, requestId: string, opts: any) => {
    const keyData = getDb()
      .prepare('SELECT encrypted_key, model_id FROM ai_keys WHERE provider_id = ?')
      .get(providerId) as { encrypted_key: Buffer; model_id: string } | undefined

    if (!keyData) {
      event.sender.send('ai:error', { requestId, error: 'PROVIDER_NOT_CONFIGURED' })
      return { requestId }
    }

    const apiKey = safeStorage.decryptString(keyData.encrypted_key)
    const model = opts.model || keyData.model_id || 'deepseek-v4-flash'

    // Determine API base from provider
    const apiBases: Record<string, string> = {
      deepseek: 'https://api.deepseek.com',
      qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      doubao: 'https://ark.cn-beijing.volces.com/api/v3',
    }
    const apiBase = apiBases[providerId]
    if (!apiBase) {
      event.sender.send('ai:error', { requestId, error: `未知的 AI 服务商: ${providerId}` })
      return { requestId }
    }

    // Return immediately so renderer can register event listeners
    // Run the actual AI request asynchronously
    const controller = new AbortController()
    activeRequests.set(requestId, controller)

    ;(async () => {
      try {
        const response = await fetch(`${apiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: opts.messages,
            temperature: opts.temperature ?? 0.7,
            max_tokens: opts.maxTokens ?? 2000,
            stream: opts.stream ?? true,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const error = await response.text()
          event.sender.send('ai:error', { requestId, error: `请求失败 (${response.status}): ${error.slice(0, 300)}` })
          return
        }

        if (!opts.stream) {
          const data = await response.json()
          event.sender.send('ai:done', { requestId, fullText: data.choices[0].message.content })
          return
        }

        // SSE stream
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let fullText = ''
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              event.sender.send('ai:done', { requestId, fullText })
              return
            }
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices[0]?.delta?.content || ''
              if (delta) {
                fullText += delta
                event.sender.send('ai:chunk', { requestId, text: delta })
              }
            } catch {
              // ignore parse errors
            }
          }
        }
        event.sender.send('ai:done', { requestId, fullText })
      } catch (e: unknown) {
        const err = e as Error
        if (err.name !== 'AbortError') {
          event.sender.send('ai:error', { requestId, error: err.message || '请求失败' })
        } else {
          event.sender.send('ai:error', { requestId, error: 'ABORTED' })
        }
      } finally {
        activeRequests.delete(requestId)
      }
    })()

    return { requestId }
  })

  // Cancel AI request
  ipcMain.handle('ai:cancel', async (_event, requestId: string) => {
    const controller = activeRequests.get(requestId)
    if (controller) {
      controller.abort()
      activeRequests.delete(requestId)
    }
    return { success: true }
  })

  // Open external URL (for docs links)
  ipcMain.handle('ai:open-external', async (_event, url: string) => {
    shell.openExternal(url)
  })

  // Test connection (runs in main process to avoid CORS)
  ipcMain.handle('ai:test-connection', async (_event, providerId: string, apiKey: string) => {
    const apiBases: Record<string, string> = {
      deepseek: 'https://api.deepseek.com',
      qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      doubao: 'https://ark.cn-beijing.volces.com/api/v3',
    }
    const defaultModels: Record<string, string> = {
      deepseek: 'deepseek-v4-flash',
      qwen: 'qwen-plus',
      doubao: 'doubao-pro-32k',
    }
    const apiBase = apiBases[providerId]
    const model = defaultModels[providerId]
    if (!apiBase) return { ok: false, error: `未知的 AI 服务商: ${providerId}` }

    try {
      const response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5,
          stream: false,
        }),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        const error = await response.text()
        return { ok: false, error: `请求失败 (${response.status}): ${error.slice(0, 200)}` }
      }
      return { ok: true }
    } catch (e: unknown) {
      const err = e as Error
      return { ok: false, error: err.message || '网络连接失败' }
    }
  })
}
