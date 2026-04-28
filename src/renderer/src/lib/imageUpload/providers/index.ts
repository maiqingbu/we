import type { ImageUploader } from '../types'
import { SmmsUploader } from './smms'
import { GitHubUploader } from './github'
import { CustomUploader } from './custom'

const providers: ImageUploader[] = [SmmsUploader, GitHubUploader, CustomUploader]

const providerMap = new Map<string, ImageUploader>(providers.map((p) => [p.id, p]))

export function getUploader(id: string): ImageUploader {
  const p = providerMap.get(id)
  if (!p) throw new Error(`Unknown image uploader: ${id}`)
  return p
}

export function getAllProviders(): ImageUploader[] {
  return providers
}

export function getProviderById(id: string): ImageUploader | undefined {
  return providerMap.get(id)
}
