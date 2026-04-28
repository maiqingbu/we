import type { AICompletionOptions } from '../types'

export async function openAICompatibleCompletion(
  apiBase: string,
  apiKey: string,
  model: string,
  opts: AICompletionOptions,
): Promise<string> {
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
    signal: opts.signal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI 调用失败 (${response.status}): ${error}`)
  }

  if (!opts.stream) {
    const data = await response.json()
    return data.choices[0].message.content
  }

  // SSE stream parsing
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
      if (data === '[DONE]') return fullText
      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices[0]?.delta?.content || ''
        if (delta) {
          fullText += delta
        }
      } catch {
        // ignore parse errors
      }
    }
  }
  return fullText
}

export async function testOpenAICompatible(
  apiBase: string,
  apiKey: string,
  model: string,
): Promise<{ ok: boolean; error?: string }> {
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
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) {
      const error = await response.text()
      return { ok: false, error: `HTTP ${response.status}: ${error.slice(0, 200)}` }
    }
    return { ok: true }
  } catch (e: unknown) {
    const err = e as Error
    return { ok: false, error: err.message }
  }
}
