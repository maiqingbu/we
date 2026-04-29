/**
 * 图文混排预设数据
 *
 * 包含 18 种分栏布局预设，分为 5 个分组：
 * - 双栏（6 种）
 * - 三栏（4 种）
 * - 四栏（2 种）
 * - 网格（4 种）
 * - 特殊（2 种）
 */

// ============================================================
// 类型定义
// ============================================================

/** 列内默认内容项的类型 */
export type ColumnContentType = 'paragraph' | 'image' | 'heading'

/** 列内默认内容项 */
export interface ColumnContentItem {
  type: ColumnContentType
  /** 段落/标题文本 */
  text?: string
  /** 图片 src（仅 type='image' 时使用） */
  src?: string
  /** 标题级别（仅 type='heading' 时使用） */
  level?: 1 | 2 | 3 | 4
}

/** 一列的默认内容 */
export type ColumnContent = ColumnContentItem[]

/** 预设分组 */
export type ColumnPresetGroup = 'cols-2' | 'cols-3' | 'cols-4' | 'grid' | 'special'

/** 分栏预设 */
export interface ColumnPreset {
  /** 唯一标识 */
  id: string
  /** 预设名称 */
  name: string
  /** 图标（emoji） */
  icon: string
  /** 缩略图 HTML（用于面板展示） */
  thumbnail: string
  /** 搜索关键词 */
  keywords: string[]
  /** 布局标识 */
  layout: string
  /** 各列宽度百分比，总和必须为 100 */
  widths: number[]
  /** 每列的默认内容 */
  defaultContent: ColumnContent[]
  /** 所属分组 */
  group: ColumnPresetGroup
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 生成占位图片的 SVG data URI
 * 避免外部依赖，使用纯 SVG data URI 代替 placehold.co
 */
export function placeholderImage(
  width: number = 400,
  height: number = 300,
  label: string = '点击替换图片'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#f5f5f5" rx="8"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#d4d4d4" stroke-width="1.5" rx="8" stroke-dasharray="8,4"/>
  <g transform="translate(${width / 2}, ${height / 2 - 12})">
    <rect x="-24" y="-20" width="48" height="40" rx="4" fill="none" stroke="#9ca3af" stroke-width="1.5"/>
    <circle cx="-8" cy="-8" r="5" fill="none" stroke="#9ca3af" stroke-width="1.5"/>
    <polyline points="-20,14 -6,2 4,10 10,4 20,14" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linejoin="round"/>
  </g>
  <text x="${width / 2}" y="${height / 2 + 28}" font-family="system-ui,-apple-system,sans-serif" font-size="13" fill="#9ca3af" text-anchor="middle">${label}</text>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// ============================================================
// 18 种预设
// ============================================================

/** 双栏预设（6 种） */
const COLS_2_PRESETS: ColumnPreset[] = [
  // 1. 双栏等分
  {
    id: 'cols-2-equal',
    name: '双栏等分',
    icon: '⬛⬛',
    thumbnail: `<div style="display:flex;gap:4px;height:40px;">
      <div style="flex:1;background:#e0e7ff;border-radius:3px;"></div>
      <div style="flex:1;background:#e0e7ff;border-radius:3px;"></div>
    </div>`,
    keywords: ['双栏', '等分', '两栏', '50/50'],
    layout: 'cols-2',
    widths: [50, 50],
    defaultContent: [
      [
        { type: 'image', src: placeholderImage(400, 250, '点击替换图片') },
        { type: 'paragraph', text: '左侧内容区域，可以放置文字、图片等内容。' },
      ],
      [
        { type: 'image', src: placeholderImage(400, 250, '点击替换图片') },
        { type: 'paragraph', text: '右侧内容区域，可以放置文字、图片等内容。' },
      ],
    ],
    group: 'cols-2',
  },

  // 2. 左宽右窄
  {
    id: 'cols-2-wide-left',
    name: '左宽右窄',
    icon: '⬛▪',
    thumbnail: `<div style="display:flex;gap:4px;height:40px;">
      <div style="flex:2;background:#dbeafe;border-radius:3px;"></div>
      <div style="flex:1;background:#dbeafe;border-radius:3px;"></div>
    </div>`,
    keywords: ['双栏', '左宽', '主侧', '图文', '65/35'],
    layout: 'cols-2',
    widths: [65, 35],
    defaultContent: [
      [
        { type: 'paragraph', text: '这是主要的内容区域，占据更大的空间，适合放置详细的文字描述或大图片。' },
      ],
      [
        { type: 'image', src: placeholderImage(300, 200, '配图') },
      ],
    ],
    group: 'cols-2',
  },

  // 3. 左窄右宽
  {
    id: 'cols-2-wide-right',
    name: '左窄右宽',
    icon: '▪⬛',
    thumbnail: `<div style="display:flex;gap:4px;height:40px;">
      <div style="flex:1;background:#dbeafe;border-radius:3px;"></div>
      <div style="flex:2;background:#dbeafe;border-radius:3px;"></div>
    </div>`,
    keywords: ['双栏', '右宽', '侧边', '图文', '35/65'],
    layout: 'cols-2',
    widths: [35, 65],
    defaultContent: [
      [
        { type: 'image', src: placeholderImage(300, 200, '配图') },
      ],
      [
        { type: 'paragraph', text: '这是主要的内容区域，占据更大的空间，适合放置详细的文字描述或大图片。' },
      ],
    ],
    group: 'cols-2',
  },

  // 4. 左图右文
  {
    id: 'cols-2-image-text',
    name: '左图右文',
    icon: '🖼📝',
    thumbnail: `<div style="display:flex;gap:4px;height:40px;">
      <div style="flex:1;background:#d1fae5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">图</div>
      <div style="flex:1;background:#d1fae5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">文</div>
    </div>`,
    keywords: ['双栏', '图文', '左图右文', '图片文字'],
    layout: 'cols-2',
    widths: [50, 50],
    defaultContent: [
      [
        { type: 'image', src: placeholderImage(400, 300, '图片') },
      ],
      [
        { type: 'heading', text: '标题', level: 3 },
        { type: 'paragraph', text: '这里是对应图片的文字说明，可以是产品介绍、景点描述或任何需要图文配合的内容。' },
      ],
    ],
    group: 'cols-2',
  },

  // 5. 左文右图
  {
    id: 'cols-2-text-image',
    name: '左文右图',
    icon: '📝🖼',
    thumbnail: `<div style="display:flex;gap:4px;height:40px;">
      <div style="flex:1;background:#d1fae5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">文</div>
      <div style="flex:1;background:#d1fae5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">图</div>
    </div>`,
    keywords: ['双栏', '文图', '左文右图', '文字图片'],
    layout: 'cols-2',
    widths: [50, 50],
    defaultContent: [
      [
        { type: 'heading', text: '标题', level: 3 },
        { type: 'paragraph', text: '这里是对应图片的文字说明，可以是产品介绍、景点描述或任何需要图文配合的内容。' },
      ],
      [
        { type: 'image', src: placeholderImage(400, 300, '图片') },
      ],
    ],
    group: 'cols-2',
  },

  // 6. 主侧栏（主内容+侧边栏，侧栏嵌套两个图片）
  {
    id: 'cols-2-main-side',
    name: '主侧栏',
    icon: '📋📌',
    thumbnail: `<div style="display:flex;gap:4px;height:40px;">
      <div style="flex:2;background:#fef3c7;border-radius:3px;"></div>
      <div style="flex:1;background:#fef3c7;border-radius:3px;display:flex;flex-direction:column;gap:3px;padding:4px;">
        <div style="flex:1;background:#fde68a;border-radius:2px;"></div>
        <div style="flex:1;background:#fde68a;border-radius:2px;"></div>
      </div>
    </div>`,
    keywords: ['双栏', '主侧', '侧边栏', '嵌套'],
    layout: 'cols-2',
    widths: [65, 35],
    defaultContent: [
      [
        { type: 'heading', text: '主要内容', level: 2 },
        { type: 'paragraph', text: '这是主内容区域，适合放置文章主体、详细描述等。侧边栏可以放置辅助图片或引用信息。' },
        { type: 'paragraph', text: '侧边栏中嵌套了两张图片，形成紧凑的视觉效果。' },
      ],
      [
        { type: 'image', src: placeholderImage(300, 180, '图片 1') },
        { type: 'image', src: placeholderImage(300, 180, '图片 2') },
      ],
    ],
    group: 'cols-2',
  },
]

/** 三栏预设（4 种） */
const COLS_3_PRESETS: ColumnPreset[] = [
  // 7. 三栏等分
  {
    id: 'cols-3-equal',
    name: '三栏等分',
    icon: '▪▪▪',
    thumbnail: `<div style="display:flex;gap:3px;height:40px;">
      <div style="flex:1;background:#ede9fe;border-radius:3px;"></div>
      <div style="flex:1;background:#ede9fe;border-radius:3px;"></div>
      <div style="flex:1;background:#ede9fe;border-radius:3px;"></div>
    </div>`,
    keywords: ['三栏', '等分', '三列'],
    layout: 'cols-3',
    widths: [33.33, 33.34, 33.33],
    defaultContent: [
      [
        { type: 'image', src: placeholderImage(300, 200, '点击替换图片') },
        { type: 'paragraph', text: '第一栏内容' },
      ],
      [
        { type: 'image', src: placeholderImage(300, 200, '点击替换图片') },
        { type: 'paragraph', text: '第二栏内容' },
      ],
      [
        { type: 'image', src: placeholderImage(300, 200, '点击替换图片') },
        { type: 'paragraph', text: '第三栏内容' },
      ],
    ],
    group: 'cols-3',
  },

  // 8. 中宽两侧窄
  {
    id: 'cols-3-wide-center',
    name: '中宽两侧窄',
    icon: '▪⬛▪',
    thumbnail: `<div style="display:flex;gap:3px;height:40px;">
      <div style="flex:1;background:#e0e7ff;border-radius:3px;"></div>
      <div style="flex:2;background:#e0e7ff;border-radius:3px;"></div>
      <div style="flex:1;background:#e0e7ff;border-radius:3px;"></div>
    </div>`,
    keywords: ['三栏', '中宽', '突出中间'],
    layout: 'cols-3',
    widths: [25, 50, 25],
    defaultContent: [
      [{ type: 'paragraph', text: '左侧辅助信息' }],
      [
        { type: 'heading', text: '核心内容', level: 3 },
        { type: 'paragraph', text: '中间是主要内容区域，占据更大的空间。' },
      ],
      [{ type: 'paragraph', text: '右侧辅助信息' }],
    ],
    group: 'cols-3',
  },

  // 9. 三栏图文
  {
    id: 'cols-3-image-text',
    name: '三栏图文',
    icon: '🖼📝🖼',
    thumbnail: `<div style="display:flex;gap:3px;height:40px;">
      <div style="flex:1;background:#d1fae5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#666;">图</div>
      <div style="flex:1;background:#d1fae5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#666;">文</div>
      <div style="flex:1;background:#d1fae5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#666;">图</div>
    </div>`,
    keywords: ['三栏', '图文', '图片文字'],
    layout: 'cols-3',
    widths: [33.33, 33.34, 33.33],
    defaultContent: [
      [{ type: 'image', src: placeholderImage(300, 200, '图片 1') }],
      [
        { type: 'heading', text: '说明文字', level: 3 },
        { type: 'paragraph', text: '这里是中间的文字说明区域。' },
      ],
      [{ type: 'image', src: placeholderImage(300, 200, '图片 2') }],
    ],
    group: 'cols-3',
  },

  // 10. 步骤展示
  {
    id: 'cols-3-steps',
    name: '步骤展示',
    icon: '1️⃣2️⃣3️⃣',
    thumbnail: `<div style="display:flex;gap:3px;height:40px;">
      <div style="flex:1;background:#fce7f3;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">1</div>
      <div style="flex:1;background:#fce7f3;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">2</div>
      <div style="flex:1;background:#fce7f3;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#666;">3</div>
    </div>`,
    keywords: ['三栏', '步骤', '流程', '教程'],
    layout: 'cols-3',
    widths: [33.33, 33.34, 33.33],
    defaultContent: [
      [
        { type: 'heading', text: '步骤一', level: 3 },
        { type: 'paragraph', text: '描述第一步的操作内容。' },
      ],
      [
        { type: 'heading', text: '步骤二', level: 3 },
        { type: 'paragraph', text: '描述第二步的操作内容。' },
      ],
      [
        { type: 'heading', text: '步骤三', level: 3 },
        { type: 'paragraph', text: '描述第三步的操作内容。' },
      ],
    ],
    group: 'cols-3',
  },
]

/** 四栏预设（2 种） */
const COLS_4_PRESETS: ColumnPreset[] = [
  // 11. 四栏等分
  {
    id: 'cols-4-equal',
    name: '四栏等分',
    icon: '▪▪▪▪',
    thumbnail: `<div style="display:flex;gap:2px;height:40px;">
      <div style="flex:1;background:#fee2e2;border-radius:3px;"></div>
      <div style="flex:1;background:#fee2e2;border-radius:3px;"></div>
      <div style="flex:1;background:#fee2e2;border-radius:3px;"></div>
      <div style="flex:1;background:#fee2e2;border-radius:3px;"></div>
    </div>`,
    keywords: ['四栏', '等分', '四列'],
    layout: 'cols-4',
    widths: [25, 25, 25, 25],
    defaultContent: [
      [
        { type: 'image', src: placeholderImage(250, 180, '点击替换图片') },
        { type: 'paragraph', text: '第一栏' },
      ],
      [
        { type: 'image', src: placeholderImage(250, 180, '点击替换图片') },
        { type: 'paragraph', text: '第二栏' },
      ],
      [
        { type: 'image', src: placeholderImage(250, 180, '点击替换图片') },
        { type: 'paragraph', text: '第三栏' },
      ],
      [
        { type: 'image', src: placeholderImage(250, 180, '点击替换图片') },
        { type: 'paragraph', text: '第四栏' },
      ],
    ],
    group: 'cols-4',
  },

  // 12. 四栏卡片
  {
    id: 'cols-4-cards',
    name: '四栏卡片',
    icon: '🃏🃏🃏🃏',
    thumbnail: `<div style="display:flex;gap:2px;height:40px;">
      <div style="flex:1;background:#f0fdf4;border-radius:3px;border:1px solid #bbf7d0;"></div>
      <div style="flex:1;background:#f0fdf4;border-radius:3px;border:1px solid #bbf7d0;"></div>
      <div style="flex:1;background:#f0fdf4;border-radius:3px;border:1px solid #bbf7d0;"></div>
      <div style="flex:1;background:#f0fdf4;border-radius:3px;border:1px solid #bbf7d0;"></div>
    </div>`,
    keywords: ['四栏', '卡片', '特性', '功能'],
    layout: 'cols-4',
    widths: [25, 25, 25, 25],
    defaultContent: [
      [
        { type: 'heading', text: '特性一', level: 4 },
        { type: 'paragraph', text: '简要描述第一个特性。' },
      ],
      [
        { type: 'heading', text: '特性二', level: 4 },
        { type: 'paragraph', text: '简要描述第二个特性。' },
      ],
      [
        { type: 'heading', text: '特性三', level: 4 },
        { type: 'paragraph', text: '简要描述第三个特性。' },
      ],
      [
        { type: 'heading', text: '特性四', level: 4 },
        { type: 'paragraph', text: '简要描述第四个特性。' },
      ],
    ],
    group: 'cols-4',
  },
]

/** 网格预设（4 种） */
const GRID_PRESETS: ColumnPreset[] = [
  // 13. 2x2 网格
  {
    id: 'grid-2x2',
    name: '2x2 网格',
    icon: '⊞',
    thumbnail: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;height:40px;">
      <div style="background:#e0f2fe;border-radius:3px;"></div>
      <div style="background:#e0f2fe;border-radius:3px;"></div>
      <div style="background:#e0f2fe;border-radius:3px;"></div>
      <div style="background:#e0f2fe;border-radius:3px;"></div>
    </div>`,
    keywords: ['网格', '2x2', '四宫格', '图片墙'],
    layout: 'grid-2x2',
    widths: [50, 50],
    defaultContent: [
      [
        { type: 'image', src: placeholderImage(400, 300, '图片 1') },
        { type: 'image', src: placeholderImage(400, 300, '图片 2') },
      ],
      [
        { type: 'image', src: placeholderImage(400, 300, '图片 3') },
        { type: 'image', src: placeholderImage(400, 300, '图片 4') },
      ],
    ],
    group: 'grid',
  },

  // 14. 3x3 网格
  {
    id: 'grid-3x3',
    name: '3x3 网格',
    icon: '⊞⊞⊞',
    thumbnail: `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px;height:40px;">
      <div style="background:#f3e8ff;border-radius:2px;"></div>
      <div style="background:#f3e8ff;border-radius:2px;"></div>
      <div style="background:#f3e8ff;border-radius:2px;"></div>
      <div style="background:#f3e8ff;border-radius:2px;"></div>
      <div style="background:#f3e8ff;border-radius:2px;"></div>
      <div style="background:#f3e8ff;border-radius:2px;"></div>
      <div style="background:#f3e8ff;border-radius:2px;"></div>
      <div style="background:#f3e8ff;border-radius:2px;"></div>
      <div style="background:#f3e8ff;border-radius:2px;"></div>
    </div>`,
    keywords: ['网格', '3x3', '九宫格', '图片墙'],
    layout: 'grid-3x3',
    widths: [33.33, 33.34, 33.33],
    defaultContent: [
      [
        { type: 'image', src: placeholderImage(300, 300, '图 1') },
        { type: 'image', src: placeholderImage(300, 300, '图 2') },
        { type: 'image', src: placeholderImage(300, 300, '图 3') },
      ],
      [
        { type: 'image', src: placeholderImage(300, 300, '图 4') },
        { type: 'image', src: placeholderImage(300, 300, '图 5') },
        { type: 'image', src: placeholderImage(300, 300, '图 6') },
      ],
      [
        { type: 'image', src: placeholderImage(300, 300, '图 7') },
        { type: 'image', src: placeholderImage(300, 300, '图 8') },
        { type: 'image', src: placeholderImage(300, 300, '图 9') },
      ],
    ],
    group: 'grid',
  },

  // 15. 网格图文混排
  {
    id: 'grid-2x2-mixed',
    name: '网格图文',
    icon: '⊞📝',
    thumbnail: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;height:40px;">
      <div style="background:#ecfdf5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#666;">图</div>
      <div style="background:#ecfdf5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#666;">文</div>
      <div style="background:#ecfdf5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#666;">文</div>
      <div style="background:#ecfdf5;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#666;">图</div>
    </div>`,
    keywords: ['网格', '图文', '2x2', '混排'],
    layout: 'grid-2x2',
    widths: [50, 50],
    defaultContent: [
      [
        { type: 'image', src: placeholderImage(400, 300, '图片') },
        { type: 'heading', text: '标题文字', level: 4 },
        { type: 'paragraph', text: '图片下方的说明文字。' },
      ],
      [
        { type: 'heading', text: '标题文字', level: 4 },
        { type: 'paragraph', text: '说明文字区域。' },
        { type: 'image', src: placeholderImage(400, 300, '图片') },
      ],
    ],
    group: 'grid',
  },

  // 16. 不等宽网格
  {
    id: 'grid-2x2-uneven',
    name: '不等宽网格',
    icon: '⊞▪',
    thumbnail: `<div style="display:grid;grid-template-columns:2fr 1fr;gap:3px;height:40px;">
      <div style="background:#fff7ed;border-radius:3px;"></div>
      <div style="background:#fff7ed;border-radius:3px;"></div>
      <div style="background:#fff7ed;border-radius:3px;"></div>
      <div style="background:#fff7ed;border-radius:3px;"></div>
    </div>`,
    keywords: ['网格', '不等宽', '大图', '瀑布流'],
    layout: 'grid-2x2',
    widths: [66.67, 33.33],
    defaultContent: [
      [
        { type: 'image', src: placeholderImage(600, 300, '大图 1') },
        { type: 'image', src: placeholderImage(600, 300, '大图 2') },
      ],
      [
        { type: 'image', src: placeholderImage(300, 300, '小图 1') },
        { type: 'image', src: placeholderImage(300, 300, '小图 2') },
      ],
    ],
    group: 'grid',
  },
]

/** 特殊预设（2 种） */
const SPECIAL_PRESETS: ColumnPreset[] = [
  // 17. 时间线（两对交替的图文）
  {
    id: 'special-timeline',
    name: '时间线',
    icon: '📅',
    thumbnail: `<div style="display:flex;flex-direction:column;gap:3px;height:40px;">
      <div style="display:flex;gap:3px;">
        <div style="flex:1;background:#dbeafe;border-radius:3px;"></div>
        <div style="flex:1;background:#dbeafe;border-radius:3px;"></div>
      </div>
      <div style="display:flex;gap:3px;">
        <div style="flex:1;background:#dbeafe;border-radius:3px;"></div>
        <div style="flex:1;background:#dbeafe;border-radius:3px;"></div>
      </div>
    </div>`,
    keywords: ['时间线', '时间轴', '时间', '历程', '交替'],
    layout: 'cols-2',
    widths: [50, 50],
    defaultContent: [
      [
        { type: 'heading', text: '2024 年 1 月', level: 4 },
        { type: 'paragraph', text: '项目启动，完成需求调研和方案设计。' },
        { type: 'heading', text: '2024 年 6 月', level: 4 },
        { type: 'paragraph', text: '产品发布，获得用户积极反馈。' },
      ],
      [
        { type: 'image', src: placeholderImage(400, 250, '阶段一') },
        { type: 'image', src: placeholderImage(400, 250, '阶段二') },
      ],
    ],
    group: 'special',
  },

  // 18. VS 对比（两列各含标题+段落）
  {
    id: 'special-vs-compare',
    name: 'VS 对比',
    icon: '⚔️',
    thumbnail: `<div style="display:flex;gap:4px;height:40px;align-items:center;">
      <div style="flex:1;background:#fef2f2;border-radius:3px;"></div>
      <div style="width:16px;text-align:center;font-size:10px;color:#999;">VS</div>
      <div style="flex:1;background:#f0fdf4;border-radius:3px;"></div>
    </div>`,
    keywords: ['对比', 'VS', '比较', 'PK', '竞品'],
    layout: 'cols-2',
    widths: [50, 50],
    defaultContent: [
      [
        { type: 'heading', text: '方案 A', level: 3 },
        { type: 'paragraph', text: '方案 A 的详细描述，包括优势、特点等信息。可以多写几行来展示效果。' },
      ],
      [
        { type: 'heading', text: '方案 B', level: 3 },
        { type: 'paragraph', text: '方案 B 的详细描述，包括优势、特点等信息。可以多写几行来展示效果。' },
      ],
    ],
    group: 'special',
  },
]

// ============================================================
// 汇总导出
// ============================================================

/** 所有 18 种分栏预设 */
export const COLUMN_PRESETS: ColumnPreset[] = [
  ...COLS_2_PRESETS,
  ...COLS_3_PRESETS,
  ...COLS_4_PRESETS,
  ...GRID_PRESETS,
  ...SPECIAL_PRESETS,
]

/** 按 ID 获取预设 */
export function getPresetById(id: string): ColumnPreset | undefined {
  return COLUMN_PRESETS.find((p) => p.id === id)
}

/** 按分组获取预设 */
export function getPresetsByGroup(group: ColumnPresetGroup): ColumnPreset[] {
  return COLUMN_PRESETS.filter((p) => p.group === group)
}

/** 搜索预设 */
export function searchPresets(query: string): ColumnPreset[] {
  if (!query.trim()) return COLUMN_PRESETS
  const q = query.toLowerCase()
  return COLUMN_PRESETS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.toLowerCase().includes(q))
  )
}
