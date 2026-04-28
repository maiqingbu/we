import type { AIProvider } from '../types'
import { openAICompatibleCompletion, testOpenAICompatible } from './base'

export const DeepSeekProvider: AIProvider = {
  config: {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultModel: 'deepseek-v4-flash',
    models: [
      { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash（推荐）' },
      { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
    ],
    apiBase: 'https://api.deepseek.com',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    keyHint: 'sk-...',
  },
  complete(apiKey, model, opts) {
    return openAICompatibleCompletion(this.config.apiBase, apiKey, model, opts)
  },
  testConnection(apiKey) {
    return testOpenAICompatible(this.config.apiBase, apiKey, this.config.defaultModel)
  },
}
