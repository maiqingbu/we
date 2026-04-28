import type { ConfigField } from '../types'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getMaxFileSizeMB(): number {
  try {
    const stored = localStorage.getItem('wx-image-max-size')
    if (stored) {
      const val = parseInt(stored, 10)
      if (val > 0 && val <= 20) return val
    }
  } catch { /* ignore */ }
  return 5
}

export function isAutoUploadEnabled(): boolean {
  try {
    const stored = localStorage.getItem('wx-image-auto-upload')
    if (stored !== null) return stored === 'true'
  } catch { /* ignore */ }
  return true
}

export function getCompressQuality(): number | null {
  try {
    const stored = localStorage.getItem('wx-image-compress')
    if (stored === 'true') return 80
  } catch { /* ignore */ }
  return null
}

export function countBase64Images(html: string): number {
  const regex = /<img[^>]+src=["']data:image\/[^"']+["'][^>]*>/gi
  return (html.match(regex) || []).length
}

export function validateImageFile(file: File, maxSizeMB: number): string | null {
  if (!file.type.startsWith('image/')) {
    return '不支持的文件类型'
  }
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    return `文件大小 ${sizeMB.toFixed(1)}MB 超过限制 ${maxSizeMB}MB`
  }
  return null
}

export function getSchemaDefaults(schema: ConfigField[]): Record<string, string> {
  const defaults: Record<string, string> = {}
  for (const field of schema) {
    if (field.type === 'select' && field.options && field.options.length > 0) {
      defaults[field.key] = field.options[0].value
    }
  }
  return defaults
}
