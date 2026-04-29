import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { uploadManager, generateId, validateImageFile } from '@/lib/imageUpload'

export interface ImageUploadOptions {
  maxConcurrent?: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      /** Replace a placeholder image's src with the final URL */
      replacePlaceholderImage: (placeholderId: string, url: string) => ReturnType
      /** Mark a placeholder image as failed */
      markImageFailed: (placeholderId: string, error: string) => ReturnType
      /** Remove an image node by placeholderId */
      removePlaceholderImage: (placeholderId: string) => ReturnType
    }
  }
}

const uploadKey = new PluginKey('imageUpload')

// Store files for retry capability
const fileStore = new Map<string, File>()

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function getUploadConfig(): Promise<{ providerId: string; config: Record<string, string> } | null> {
  try {
    const activeProvider = await window.api?.imageHostGetSetting('active_provider')
    if (!activeProvider || activeProvider === 'none') return null
    const config = await window.api?.imageHostGetConfig(activeProvider)
    if (!config) return null
    return { providerId: activeProvider, config }
  } catch {
    return null
  }
}

async function insertWithUpload(view: EditorView, file: File): Promise<void> {
  // Get max file size from DB settings
  let maxSizeMB = 5
  try {
    const stored = await window.api?.imageHostGetSetting('max_file_size')
    if (stored) maxSizeMB = parseInt(stored, 10) || 5
  } catch { /* use default */ }

  const validationError = validateImageFile(file, maxSizeMB)
  if (validationError) {
    // Dispatch a custom event for toast notification
    window.dispatchEvent(new CustomEvent('upload-error', { detail: validationError }))
    return
  }

  const uploadConfig = await getUploadConfig()
  const autoUpload = await window.api?.imageHostGetSetting('auto_upload')

  // Read file as base64 for placeholder
  const base64 = await fileToBase64(file)
  const placeholderId = generateId()

  // Insert placeholder image
  const { schema } = view.state
  const node = schema.nodes.image.create({
    src: base64,
    'data-uploading': 'true',
    'data-placeholder-id': placeholderId,
  })
  const tr = view.state.tr.replaceSelectionWith(node)
  view.dispatch(tr)

  // If no upload config or auto-upload disabled, keep as base64
  if (!uploadConfig || autoUpload === 'false') {
    // Remove uploading marker, keep base64
    const doc = view.state.doc
    let found = false
    doc.descendants((node: any, pos: number) => {
      if (found) return false
      if (
        node.type.name === 'image' &&
        node.attrs['data-placeholder-id'] === placeholderId
      ) {
        view.dispatch(
          view.state.tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            'data-uploading': null,
          })
        )
        found = true
        return false
      }
      return true
    })
    if (!uploadConfig) {
      window.dispatchEvent(
        new CustomEvent('upload-error', {
          detail: '未配置图床，图片以 base64 嵌入，建议配置图床',
        })
      )
    }
    return
  }

  // Store file for retry
  fileStore.set(placeholderId, file)

  // Upload in background
  try {
    const url = await uploadManager.upload(file, placeholderId, async (f) => {
      const arrayBuffer = await f.arrayBuffer()
      const result = await window.api!.imageUpload(uploadConfig.providerId, { buffer: arrayBuffer, name: f.name }, uploadConfig.config)
      if (!result.success) throw new Error(result.error)
      return result.data!.url
    })

    // Replace placeholder with final URL
    const doc = view.state.doc
    let found = false
    doc.descendants((node: any, pos: number) => {
      if (found) return false
      if (
        node.type.name === 'image' &&
        node.attrs['data-placeholder-id'] === placeholderId
      ) {
        view.dispatch(
          view.state.tr.setNodeMarkup(pos, undefined, {
            src: url,
            'data-uploading': null,
            'data-placeholder-id': null,
          })
        )
        found = true
        return false
      }
      return true
    })
    fileStore.delete(placeholderId)
  } catch (e: any) {
    // Mark as failed
    const doc = view.state.doc
    let found = false
    doc.descendants((node: any, pos: number) => {
      if (found) return false
      if (
        node.type.name === 'image' &&
        node.attrs['data-placeholder-id'] === placeholderId
      ) {
        view.dispatch(
          view.state.tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            'data-upload-failed': 'true',
            'data-upload-error': e.message,
            'data-uploading': null,
          })
        )
        found = true
        return false
      }
      return true
    })
  }
}

export const ImageUpload = Extension.create<ImageUploadOptions>({
  name: 'imageUpload',

  addCommands() {
    return {
      replacePlaceholderImage:
        (placeholderId: string, url: string) =>
        ({ tr, state }: any) => {
          let found = false
          state.doc.descendants((node: any, pos: number) => {
            if (found) return false
            if (
              node.type.name === 'image' &&
              node.attrs['data-placeholder-id'] === placeholderId
            ) {
              tr.setNodeMarkup(pos, undefined, {
                src: url,
                'data-uploading': null,
                'data-placeholder-id': null,
                'data-upload-failed': null,
                'data-upload-error': null,
              })
              found = true
              return false
            }
            return true
          })
          return true
        },
      markImageFailed:
        (placeholderId: string, error: string) =>
        ({ tr, state }: any) => {
          let found = false
          state.doc.descendants((node: any, pos: number) => {
            if (found) return false
            if (
              node.type.name === 'image' &&
              node.attrs['data-placeholder-id'] === placeholderId
            ) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                'data-upload-failed': 'true',
                'data-upload-error': error,
                'data-uploading': null,
              })
              found = true
              return false
            }
            return true
          })
          return true
        },
      removePlaceholderImage:
        (placeholderId: string) =>
        ({ tr, state }: any) => {
          let found = false
          state.doc.descendants((node: any, pos: number) => {
            if (found) return false
            if (
              node.type.name === 'image' &&
              node.attrs['data-placeholder-id'] === placeholderId
            ) {
              tr.delete(pos, pos + node.nodeSize)
              found = true
              return false
            }
            return true
          })
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: uploadKey,
        props: {
          handleDrop(view, event) {
            const files = Array.from(event.dataTransfer?.files || []).filter((f) =>
              f.type.startsWith('image/')
            )
            if (files.length > 0) {
              // Check for too many files (>10)
              if (files.length > 10) {
                const confirmed = window.confirm(
                  `你正在拖拽 ${files.length} 张图片，确定要全部上传吗？`
                )
                if (!confirmed) return true
              }
              event.preventDefault()
              files.forEach((file) => insertWithUpload(view, file))
              return true
            }

            // 没有 File 对象时，尝试从 dataTransfer 获取 URL（拖拽网页图片）
            const url = event.dataTransfer?.getData('text/uri-list')
              || event.dataTransfer?.getData('text/plain')
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
              event.preventDefault()
              const { schema } = view.state
              const node = schema.nodes.image.create({ src: url })
              const tr = view.state.tr.replaceSelectionWith(node)
              view.dispatch(tr)
              return true
            }

            return false
          },
          handlePaste(view, event) {
            const files = Array.from(event.clipboardData?.files || []).filter((f) =>
              f.type.startsWith('image/')
            )
            if (files.length === 0) return false
            event.preventDefault()
            files.forEach((file) => insertWithUpload(view, file))
            return true
          },
        },
      }),
    ]
  },
})

// Expose fileStore for retry functionality
export function getStoredFile(placeholderId: string): File | undefined {
  return fileStore.get(placeholderId)
}

export function deleteStoredFile(placeholderId: string): void {
  fileStore.delete(placeholderId)
}
