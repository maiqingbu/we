import type { Material } from '../../types'
import { svgToImg, svgToThumb } from './index'

function numberBadge(n: number, bgColor: string, textColor = '#ffffff'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="16" fill="${bgColor}"/>
    <text x="18" y="18" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="${textColor}">${n}</text>
  </svg>`
}

function labelBadge(text: string, bgColor: string, textColor = '#ffffff'): string {
  const width = text.length * 14 + 24
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 32">
    <rect x="0" y="0" width="${width}" height="32" rx="16" fill="${bgColor}"/>
    <text x="${width / 2}" y="16" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="${textColor}">${text}</text>
  </svg>`
}

function tagBadge(text: string, bgColor: string, textColor = '#ffffff', borderColor?: string): string {
  const width = text.length * 14 + 28
  const border = borderColor ? `stroke="${borderColor}" stroke-width="1.5"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 28">
    <rect x="1" y="1" width="${width - 2}" height="26" rx="4" fill="${bgColor}" ${border}/>
    <text x="${width / 2}" y="14" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="13" font-weight="600" fill="${textColor}">${text}</text>
  </svg>`
}

function rankBadge(rank: number, label: string, bgColor: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
    <path d="M40 5 L55 30 L75 35 L60 55 L65 80 L40 68 L15 80 L20 55 L5 35 L25 30Z" fill="${bgColor}" opacity="0.9"/>
    <text x="40" y="38" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="22" font-weight="bold" fill="#ffffff">${rank}</text>
    <text x="40" y="60" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="10" fill="#ffffff" opacity="0.9">${label}</text>
  </svg>`
}

export const SVG_BADGES: Material[] = [
  // ── 序号标 ──
  {
    id: 'svg-badge-num-1',
    kind: 'svg', category: 'svg-badge',
    name: '序号 ①', keywords: ['序号', '第一', '编号', 'number'],
    thumbnail: svgToThumb(numberBadge(1, '#3b82f6'), 32),
    html: svgToImg(numberBadge(1, '#3b82f6'), 36, '①'),
  },
  {
    id: 'svg-badge-num-2',
    kind: 'svg', category: 'svg-badge',
    name: '序号 ②', keywords: ['序号', '第二', '编号', 'number'],
    thumbnail: svgToThumb(numberBadge(2, '#8b5cf6'), 32),
    html: svgToImg(numberBadge(2, '#8b5cf6'), 36, '②'),
  },
  {
    id: 'svg-badge-num-3',
    kind: 'svg', category: 'svg-badge',
    name: '序号 ③', keywords: ['序号', '第三', '编号', 'number'],
    thumbnail: svgToThumb(numberBadge(3, '#ec4899'), 32),
    html: svgToImg(numberBadge(3, '#ec4899'), 36, '③'),
  },
  {
    id: 'svg-badge-num-4',
    kind: 'svg', category: 'svg-badge',
    name: '序号 ④', keywords: ['序号', '第四', '编号', 'number'],
    thumbnail: svgToThumb(numberBadge(4, '#f97316'), 32),
    html: svgToImg(numberBadge(4, '#f97316'), 36, '④'),
  },
  {
    id: 'svg-badge-num-5',
    kind: 'svg', category: 'svg-badge',
    name: '序号 ⑤', keywords: ['序号', '第五', '编号', 'number'],
    thumbnail: svgToThumb(numberBadge(5, '#22c55e'), 32),
    html: svgToImg(numberBadge(5, '#22c55e'), 36, '⑤'),
  },

  // ── 标签 ──
  {
    id: 'svg-badge-hot',
    kind: 'svg', category: 'svg-badge',
    name: 'HOT', keywords: ['热门', 'HOT', '火', 'hot'],
    thumbnail: svgToThumb(labelBadge('HOT', '#ef4444'), 48),
    html: svgToImg(labelBadge('HOT', '#ef4444'), 72, 'HOT'),
  },
  {
    id: 'svg-badge-new',
    kind: 'svg', category: 'svg-badge',
    name: 'NEW', keywords: ['新品', 'NEW', '新', 'new'],
    thumbnail: svgToThumb(labelBadge('NEW', '#3b82f6'), 48),
    html: svgToImg(labelBadge('NEW', '#3b82f6'), 72, 'NEW'),
  },
  {
    id: 'svg-badge-recommend',
    kind: 'svg', category: 'svg-badge',
    name: '推荐', keywords: ['推荐', '精选', 'recommend'],
    thumbnail: svgToThumb(labelBadge('推荐', '#f59e0b'), 48),
    html: svgToImg(labelBadge('推荐', '#f59e0b'), 76, '推荐'),
  },
  {
    id: 'svg-badge-free',
    kind: 'svg', category: 'svg-badge',
    name: '免费', keywords: ['免费', 'free', '不要钱'],
    thumbnail: svgToThumb(labelBadge('免费', '#22c55e'), 48),
    html: svgToImg(labelBadge('免费', '#22c55e'), 76, '免费'),
  },
  {
    id: 'svg-badge-limited',
    kind: 'svg', category: 'svg-badge',
    name: '限时', keywords: ['限时', '限量', 'limited'],
    thumbnail: svgToThumb(labelBadge('限时', '#dc2626'), 48),
    html: svgToImg(labelBadge('限时', '#dc2626'), 76, '限时'),
  },

  // ── 标签样式 ──
  {
    id: 'svg-badge-tag-tip',
    kind: 'svg', category: 'svg-badge',
    name: '小贴士', keywords: ['小贴士', '提示', 'tip'],
    thumbnail: svgToThumb(tagBadge('小贴士', '#eff6ff', '#3b82f6', '#93c5fd'), 48),
    html: svgToImg(tagBadge('小贴士', '#eff6ff', '#3b82f6', '#93c5fd'), 80, '小贴士'),
  },
  {
    id: 'svg-badge-tag-warn',
    kind: 'svg', category: 'svg-badge',
    name: '注意', keywords: ['注意', '警告', 'warning'],
    thumbnail: svgToThumb(tagBadge('注意', '#fef3c7', '#d97706', '#fcd34d'), 48),
    html: svgToImg(tagBadge('注意', '#fef3c7', '#d97706', '#fcd34d'), 72, '注意'),
  },
  {
    id: 'svg-badge-tag-important',
    kind: 'svg', category: 'svg-badge',
    name: '重要', keywords: ['重要', 'important', '重点'],
    thumbnail: svgToThumb(tagBadge('重要', '#fef2f2', '#dc2626', '#fca5a5'), 48),
    html: svgToImg(tagBadge('重要', '#fef2f2', '#dc2626', '#fca5a5'), 72, '重要'),
  },

  // ── 排行榜 ──
  {
    id: 'svg-badge-rank-1',
    kind: 'svg', category: 'svg-badge',
    name: '冠军', keywords: ['冠军', '第一', '金牌', 'rank'],
    thumbnail: svgToThumb(rankBadge(1, 'TOP', '#f59e0b'), 36),
    html: svgToImg(rankBadge(1, 'TOP', '#f59e0b'), 60, '冠军'),
  },
  {
    id: 'svg-badge-rank-2',
    kind: 'svg', category: 'svg-badge',
    name: '亚军', keywords: ['亚军', '第二', '银牌', 'rank'],
    thumbnail: svgToThumb(rankBadge(2, 'TOP', '#94a3b8'), 36),
    html: svgToImg(rankBadge(2, 'TOP', '#94a3b8'), 60, '亚军'),
  },
  {
    id: 'svg-badge-rank-3',
    kind: 'svg', category: 'svg-badge',
    name: '季军', keywords: ['季军', '第三', '铜牌', 'rank'],
    thumbnail: svgToThumb(rankBadge(3, 'TOP', '#d97706'), 36),
    html: svgToImg(rankBadge(3, 'TOP', '#d97706'), 60, '季军'),
  },
  // ── 新增标签 ──
  {
    id: 'svg-badge-sale',
    kind: 'svg', category: 'svg-badge',
    name: '促销', keywords: ['促销', '打折', 'sale', '优惠'],
    thumbnail: svgToThumb(labelBadge('SALE', '#dc2626'), 48),
    html: svgToImg(labelBadge('SALE', '#dc2626'), 80, 'SALE'),
  },
  {
    id: 'svg-badge-vip',
    kind: 'svg', category: 'svg-badge',
    name: 'VIP', keywords: ['VIP', '会员', '尊享'],
    thumbnail: svgToThumb(labelBadge('VIP', '#7c3aed'), 48),
    html: svgToImg(labelBadge('VIP', '#7c3aed'), 68, 'VIP'),
  },
  {
    id: 'svg-badge-original',
    kind: 'svg', category: 'svg-badge',
    name: '原创', keywords: ['原创', '独家', 'original'],
    thumbnail: svgToThumb(labelBadge('原创', '#0891b2'), 48),
    html: svgToImg(labelBadge('原创', '#0891b2'), 76, '原创'),
  },
  {
    id: 'svg-badge-hot-new',
    kind: 'svg', category: 'svg-badge',
    name: '爆款', keywords: ['爆款', '热门', '火', 'hot'],
    thumbnail: svgToThumb(labelBadge('爆款', '#ea580c'), 48),
    html: svgToImg(labelBadge('爆款', '#ea580c'), 76, '爆款'),
  },
  {
    id: 'svg-badge-must-read',
    kind: 'svg', category: 'svg-badge',
    name: '必读', keywords: ['必读', '必看', '推荐'],
    thumbnail: svgToThumb(tagBadge('必读', '#fef2f2', '#dc2626', '#fca5a5'), 48),
    html: svgToImg(tagBadge('必读', '#fef2f2', '#dc2626', '#fca5a5'), 72, '必读'),
  },
  {
    id: 'svg-badge-daily',
    kind: 'svg', category: 'svg-badge',
    name: '每日', keywords: ['每日', '日常', 'daily'],
    thumbnail: svgToThumb(tagBadge('每日', '#f0fdf4', '#16a34a', '#86efac'), 48),
    html: svgToImg(tagBadge('每日', '#f0fdf4', '#16a34a', '#86efac'), 72, '每日'),
  },
  {
    id: 'svg-badge-num-6',
    kind: 'svg', category: 'svg-badge',
    name: '序号 ⑥', keywords: ['序号', '第六', '编号', 'number'],
    thumbnail: svgToThumb(numberBadge(6, '#0891b2'), 32),
    html: svgToImg(numberBadge(6, '#0891b2'), 36, '⑥'),
  },
  {
    id: 'svg-badge-num-7',
    kind: 'svg', category: 'svg-badge',
    name: '序号 ⑦', keywords: ['序号', '第七', '编号', 'number'],
    thumbnail: svgToThumb(numberBadge(7, '#7c3aed'), 32),
    html: svgToImg(numberBadge(7, '#7c3aed'), 36, '⑦'),
  },
  {
    id: 'svg-badge-num-8',
    kind: 'svg', category: 'svg-badge',
    name: '序号 ⑧', keywords: ['序号', '第八', '编号', 'number'],
    thumbnail: svgToThumb(numberBadge(8, '#be185d'), 32),
    html: svgToImg(numberBadge(8, '#be185d'), 36, '⑧'),
  },
  {
    id: 'svg-badge-num-9',
    kind: 'svg', category: 'svg-badge',
    name: '序号 ⑨', keywords: ['序号', '第九', '编号', 'number'],
    thumbnail: svgToThumb(numberBadge(9, '#0d9488'), 32),
    html: svgToImg(numberBadge(9, '#0d9488'), 36, '⑨'),
  },
]
