export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICompletionOptions {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
  signal?: AbortSignal
}

export interface AIProviderConfig {
  id: string
  name: string
  defaultModel: string
  models: { id: string; name: string }[]
  apiBase: string
  docsUrl: string
  keyHint: string
}

export interface AIProvider {
  readonly config: AIProviderConfig
  complete(apiKey: string, model: string, opts: AICompletionOptions): Promise<string>
  testConnection(apiKey: string): Promise<{ ok: boolean; error?: string }>
}
