export interface UploadResult {
  url: string
  deleteHash?: string
  width?: number
  height?: number
}

export interface ImageUploader {
  readonly id: string
  readonly name: string
  readonly configSchema: ConfigField[]
  upload(file: Blob | Uint8Array, filename: string, config: Record<string, string>): Promise<UploadResult>
  testConnection(config: Record<string, string>): Promise<{ ok: boolean; error?: string }>
}

export interface ConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'select' | 'url'
  placeholder?: string
  required?: boolean
  helpUrl?: string
  options?: { value: string; label: string }[]
}

export interface UploadTask {
  id: string
  filename: string
  size: number
  status: 'queued' | 'uploading' | 'success' | 'failed'
  url?: string
  error?: string
  placeholderId: string
}

export interface ImageHostConfig {
  provider_id: string
  encrypted_config: Buffer
  updated_at: number
}

export interface ImageHostSetting {
  key: string
  value: string
}
