export { uploadManager } from './uploadManager'
export { getUploader, getAllProviders, getProviderById } from './providers'
export {
  generateId,
  formatFileSize,
  getMaxFileSizeMB,
  isAutoUploadEnabled,
  getCompressQuality,
  countBase64Images,
  validateImageFile,
  getSchemaDefaults,
} from './providers/base'
export type {
  UploadResult,
  ImageUploader,
  ConfigField,
  UploadTask,
  ImageHostConfig,
  ImageHostSetting,
} from './types'
