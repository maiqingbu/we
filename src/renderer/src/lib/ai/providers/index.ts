import { DeepSeekProvider } from './deepseek'
import { QwenProvider } from './qwen'
import { DoubaoProvider } from './doubao'
import type { AIProvider } from '../types'

// Order matters for UI display - DeepSeek must be first
export const PROVIDERS: AIProvider[] = [
  DeepSeekProvider,
  QwenProvider,
  DoubaoProvider,
]

export const DEFAULT_PROVIDER_ID = 'deepseek'

export function getProvider(id: string): AIProvider {
  return PROVIDERS.find((p) => p.config.id === id) || PROVIDERS[0]
}
