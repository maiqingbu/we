import type { Canvas as FabricCanvas, FabricImage, IText, Rect } from 'fabric'

/** 当前激活的工具 */
export type ToolType = 'select' | 'crop' | 'rotate' | 'filter' | 'text' | 'sticker' | 'watermark' | 'adjust'

/** 水印模式 */
export type WatermarkMode = 'text' | 'image' | 'wechat'

/** 文字预设 */
export interface TextPreset {
  id: string
  name: string
  fontSize: number
  fontWeight: string
  fontStyle?: string
}

/** 贴纸分类 */
export interface StickerCategory {
  id: string
  name: string
  items: string[]
}

/** 滤镜预设 */
export interface FilterPreset {
  id: string
  name: string
  createFilters: () => any[]
}

/** 裁剪比例 */
export interface CropRatio {
  id: string
  name: string
  ratio?: number // undefined = 自由
}

/** 图层项 */
export interface LayerItem {
  id: string
  name: string
  type: 'text' | 'sticker' | 'watermark' | 'image'
  visible: boolean
  locked: boolean
  object: any
}

/** 编辑器状态 */
export interface ImageEditorState {
  tool: ToolType
  watermarkMode: WatermarkMode
  brightness: number
  contrast: number
  saturation: number
  activeFilterId: string
  cropRatio: string
  layers: LayerItem[]
  hasUnsavedChanges: boolean
}

/** 导出结果 */
export interface ExportResult {
  dataUrl: string
  blob: Blob
  width: number
  height: number
}
