import type { AIProvider } from '../types'
import { openAICompatibleCompletion, testOpenAICompatible } from './base'

export const DoubaoProvider: AIProvider = {
  config: {
    id: 'doubao',
    name: '豆包',
    defaultModel: 'doubao-pro-32k',
    models: [
      { id: 'doubao-pro-32k', name: 'Doubao Pro 32K（推荐）' },
      { id: 'doubao-lite-32k', name: 'Doubao Lite 32K' },
    ],
    apiBase: 'https://ark.cn-beijing.volces.com/api/v3',
    docsUrl: 'https://www.volcengine.com/docs/82379/1099455',
    keyHint: '请填写火山方舟 API Key',
  },
  complete(apiKey, model, opts) {
    return openAICompatibleCompletion(this.config.apiBase, apiKey, model, opts)
  },
  testConnection(apiKey) {
    return testOpenAICompatible(this.config.apiBase, apiKey, this.config.defaultModel)
  },
}
