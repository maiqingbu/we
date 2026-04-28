import type { AICompletionOptions } from './types'

let requestIdCounter = 0

interface AIRequest {
  requestId: string
  promise: Promise<string>
  cancel: () => void
}

export function createAIComplete(): (providerId: string, opts: AICompletionOptions, onChunk?: (text: string) => void) => AIRequest {
  return (providerId, opts, onChunk) => {
    const requestId = `ai-${++requestIdCounter}-${Date.now()}`
    let cancelled = false

    const promise = (async () => {
      const result = await window.api?.aiComplete(providerId, requestId, opts)
      if (!result) throw new Error('AI 功能不可用')

      return new Promise<string>((resolve, reject) => {
        let settled = false

        const chunkHandler = (_event: Electron.IpcRendererEvent, data: { requestId: string; text: string }) => {
          if (data.requestId !== requestId) return
          onChunk?.(data.text)
        }
        const doneHandler = (_event: Electron.IpcRendererEvent, data: { requestId: string; fullText: string }) => {
          if (data.requestId !== requestId) return
          if (settled) return
          settled = true
          cleanup()
          resolve(data.fullText)
        }
        const errorHandler = (_event: Electron.IpcRendererEvent, data: { requestId: string; error: string }) => {
          if (data.requestId !== requestId) return
          if (settled) return
          settled = true
          cleanup()
          reject(new Error(data.error))
        }

        window.api.onAiChunk(chunkHandler)
        window.api.onAiDone(doneHandler)
        window.api.onAiError(errorHandler)

        function cleanup() {
          window.api.offAiChunk(chunkHandler)
          window.api.offAiDone(doneHandler)
          window.api.offAiError(errorHandler)
        }
      })
    })()

    const cancel = () => {
      if (cancelled) return
      cancelled = true
      window.api?.aiCancel?.(requestId)
    }

    return { requestId, promise, cancel }
  }
}
