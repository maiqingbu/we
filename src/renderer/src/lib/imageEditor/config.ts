import { filters } from 'fabric'
import type { FilterPreset, CropRatio, TextPreset, StickerCategory } from './types'

/** 滤镜预设 */
export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', name: '原图', createFilters: () => [] },
  { id: 'mono', name: '黑白', createFilters: () => [new filters.Grayscale()] },
  { id: 'warm', name: '暖色', createFilters: () => [
    new filters.Saturation({ saturation: 0.3 }),
    new filters.HueRotation({ rotation: 0.1 }),
  ]},
  { id: 'cool', name: '冷色', createFilters: () => [
    new filters.HueRotation({ rotation: -0.15 }),
  ]},
  { id: 'fade', name: '褪色', createFilters: () => [
    new filters.Saturation({ saturation: -0.4 }),
    new filters.Brightness({ brightness: 0.05 }),
  ]},
  { id: 'sharpen', name: '锐化', createFilters: () => [
    new filters.Convolute({ matrix: [0,-1,0,-1,5,-1,0,-1,0] }),
  ]},
  { id: 'sepia', name: '复古', createFilters: () => [new filters.Sepia()] },
  { id: 'vignette', name: '暗角', createFilters: () => [
    new filters.Vibrance({ vibrance: -0.3 }),
    new filters.Brightness({ brightness: -0.1 }),
  ]},
  { id: 'highKey', name: '高调', createFilters: () => [
    new filters.Brightness({ brightness: 0.15 }),
    new filters.Contrast({ contrast: -0.1 }),
  ]},
  { id: 'lowKey', name: '低调', createFilters: () => [
    new filters.Brightness({ brightness: -0.15 }),
    new filters.Contrast({ contrast: 0.2 }),
  ]},
]

/** 裁剪比例预设 */
export const CROP_RATIOS: CropRatio[] = [
  { id: 'free', name: '自由', ratio: undefined },
  { id: '1:1', name: '1:1', ratio: 1 },
  { id: '4:3', name: '4:3', ratio: 4/3 },
  { id: '16:9', name: '16:9', ratio: 16/9 },
  { id: '9:16', name: '9:16', ratio: 9/16 },
  { id: '2.35:1', name: '公众号封面', ratio: 2.35 },
  { id: '2.35:1', name: '微信首图', ratio: 2.35/1 },
]

/** 文字预设 */
export const TEXT_PRESETS: TextPreset[] = [
  { id: 'title', name: '标题', fontSize: 48, fontWeight: 'bold' },
  { id: 'subtitle', name: '副标题', fontSize: 28, fontWeight: 'normal' },
  { id: 'body', name: '正文', fontSize: 18, fontWeight: 'normal' },
  { id: 'tag', name: '标签', fontSize: 14, fontWeight: 'bold' },
  { id: 'quote', name: '引用', fontSize: 24, fontWeight: 'normal', fontStyle: 'italic' },
]

/** 贴纸分类 */
export const STICKER_CATEGORIES: StickerCategory[] = [
  { id: 'emoji-positive', name: '表情·正面', items: ['😀','😃','😄','😁','😆','😊','🥰','😎','🤩','🥳'] },
  { id: 'emoji-negative', name: '表情·负面', items: ['😢','😭','😡','🤔','😱','😨','😰','🥵','🥶','😴'] },
  { id: 'symbol-decoration', name: '装饰符号', items: ['⭐','🌟','✨','💫','🔥','💯','❤️','💖','💝','🎉'] },
  { id: 'symbol-arrow', name: '箭头指示', items: ['→','←','↑','↓','↗','➡️','⬆️','⬇️','👉','👆'] },
  { id: 'badge', name: '徽章', items: ['🏆','🥇','🥈','🥉','🎖️','🏅','👑','💎','🎯','🎁'] },
  { id: 'business', name: '工作', items: ['📌','📍','📎','🔖','📊','📈','📉','💼','📝','✅'] },
]

/** 可用字体 */
export const FONT_FAMILIES = [
  { id: 'system', name: '系统默认', value: 'system-ui, -apple-system, sans-serif' },
  { id: 'pingfang', name: '苹方', value: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  { id: 'heiti', name: '黑体', value: '"SimHei", "Heiti SC", sans-serif' },
  { id: 'songti', name: '宋体', value: '"Songti SC", "SimSun", serif' },
  { id: 'kaiti', name: '楷体', value: '"Kaiti SC", "KaiTi", serif' },
  { id: 'fangsong', name: '仿宋', value: '"FangSong", serif' },
  { id: 'mono', name: '等宽', value: '"Menlo", "Courier New", monospace' },
]

/** 常用字号 */
export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96, 120, 150, 200]

/** 颜色预设 */
export const COLOR_PRESETS = [
  '#000000', '#ffffff', '#dc2626', '#ea580c', '#d97706',
  '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777',
  '#6b7280', '#92400e', '#1e3a5f', '#064e3b', '#4a044e',
]
