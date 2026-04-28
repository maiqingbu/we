import type { AIProvider } from '../types'
import { openAICompatibleCompletion, testOpenAICompatible } from './base'

export const QwenProvider: AIProvider = {
  config: {
    id: 'qwen',
    name: '通义千问',
    defaultModel: 'qwen-plus',
    models: [
      { id: 'qwen-max', name: 'Qwen Max（最强）' },
      { id: 'qwen-plus', name: 'Qwen Plus（推荐）' },
      { id: 'qwen-turbo', name: 'Qwen Turbo（最快）' },
    ],
    apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    docsUrl: 'https://help.aliyun.com/zh/model-studio/get-api-key',
    keyHint: 'sk-...',
  },
  complete(apiKey, model, opts) {
    return openAICompatibleCompletion(this.config.apiBase, apiKey, model, opts)
  },
  testConnection(apiKey) {
    return testOpenAICompatible(this.config.apiBase, apiKey, this.config.defaultModel)
  },
}
