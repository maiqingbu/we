import type { Material } from '../../types'
import { svgToImg, svgToThumb } from './index'

function wave(color1: string, color2: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 60" fill="none">
    <path d="M0 30 Q75 0 150 30 T300 30 T450 30 T600 30 V60 H0Z" fill="${color1}" opacity="0.5"/>
    <path d="M0 35 Q75 10 150 35 T300 35 T450 35 T600 35 V60 H0Z" fill="${color2}" opacity="0.3"/>
  </svg>`
}

function waveLine(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 30" fill="none">
    <path d="M0 15 Q50 0 100 15 T200 15 T300 15 T400 15 T500 15 T600 15" stroke="${color}" stroke-width="2" fill="none"/>
  </svg>`
}

function dotsLine(color: string): string {
  const dots = Array.from({ length: 20 }, (_, i) =>
    `<circle cx="${30 * i + 15}" cy="15" r="3" fill="${color}"/>`
  ).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 30">${dots}</svg>`
}

function flowerCorner(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
    <path d="M10 110 Q10 60 40 40 Q10 50 10 10" stroke="${color}" stroke-width="2" fill="none"/>
    <circle cx="40" cy="40" r="6" fill="${color}" opacity="0.6"/>
    <circle cx="25" cy="60" r="4" fill="${color}" opacity="0.4"/>
    <circle cx="55" cy="25" r="4" fill="${color}" opacity="0.4"/>
    <path d="M30 50 Q35 35 50 30" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.5"/>
    <path d="M15 80 Q20 60 35 55" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.5"/>
  </svg>`
}

function arrowRight(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none">
    <path d="M10 30 Q60 28 140 30" stroke="${color}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M130 18 L155 30 L130 42" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`
}

function arrowLeft(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none">
    <path d="M190 30 Q140 28 60 30" stroke="${color}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M70 18 L45 30 L70 42" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`
}

function starBurst(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="8" fill="${color}" opacity="0.8"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const r = (a * Math.PI) / 180
      const x1 = 50 + 14 * Math.cos(r)
      const y1 = 50 + 14 * Math.sin(r)
      const x2 = 50 + 22 * Math.cos(r)
      const y2 = 50 + 22 * Math.sin(r)
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`
    }).join('')}
  </svg>`
}

function cloud(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none">
    <path d="M50 90 Q20 90 20 65 Q20 45 40 40 Q38 20 60 15 Q80 10 95 25 Q105 10 125 15 Q150 20 150 45 Q170 45 172 65 Q175 85 155 90Z" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5" stroke-opacity="0.4"/>
  </svg>`
}

function frame(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
    <rect x="8" y="8" width="184" height="184" rx="6" stroke="${color}" stroke-width="2" stroke-opacity="0.5"/>
    <rect x="16" y="16" width="168" height="168" rx="4" stroke="${color}" stroke-width="1" stroke-opacity="0.3"/>
    <circle cx="8" cy="8" r="4" fill="${color}" opacity="0.6"/>
    <circle cx="192" cy="8" r="4" fill="${color}" opacity="0.6"/>
    <circle cx="8" cy="192" r="4" fill="${color}" opacity="0.6"/>
    <circle cx="192" cy="192" r="4" fill="${color}" opacity="0.6"/>
  </svg>`
}

function ribbon(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none">
    <path d="M0 10 L180 10 L200 30 L180 50 L0 50Z" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5" stroke-opacity="0.4"/>
    <path d="M180 10 L200 30 L180 50" fill="${color}" opacity="0.25"/>
  </svg>`
}

function zigzagLine(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 30" fill="none">
    <path d="M0 15 L20 5 L40 15 L60 5 L80 15 L100 5 L120 15 L140 5 L160 15 L180 5 L200 15 L220 5 L240 15 L260 5 L280 15 L300 5 L320 15 L340 5 L360 15 L380 5 L400 15 L420 5 L440 15 L460 5 L480 15 L500 5 L520 15 L540 5 L560 15 L580 5 L600 15" stroke="${color}" stroke-width="1.5" stroke-opacity="0.5" fill="none"/>
  </svg>`
}

function starLine(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 40" fill="none">
    <line x1="0" y1="20" x2="230" y2="20" stroke="${color}" stroke-width="1" opacity="0.3"/>
    <polygon points="280,8 284,18 295,18 286,24 289,34 280,28 271,34 274,24 265,18 276,18" fill="${color}" opacity="0.5"/>
    <polygon points="300,12 303,19 311,19 305,23 307,30 300,26 293,30 295,23 289,19 297,19" fill="${color}" opacity="0.35"/>
    <polygon points="320,8 324,18 335,18 326,24 329,34 320,28 311,34 314,24 305,18 316,18" fill="${color}" opacity="0.5"/>
    <line x1="370" y1="20" x2="600" y2="20" stroke="${color}" stroke-width="1" opacity="0.3"/>
  </svg>`
}

function diamondLine(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 30" fill="none">
    <line x1="0" y1="15" x2="240" y2="15" stroke="${color}" stroke-width="1" opacity="0.4"/>
    <polygon points="300,3 312,15 300,27 288,15" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="1" stroke-opacity="0.5"/>
    <line x1="360" y1="15" x2="600" y2="15" stroke="${color}" stroke-width="1" opacity="0.4"/>
  </svg>`
}

function heartLine(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 40" fill="none">
    <line x1="0" y1="20" x2="240" y2="20" stroke="${color}" stroke-width="1" opacity="0.3"/>
    <path d="M300 8 C290 -2 270 0 270 12 C270 22 300 34 300 34 C300 34 330 22 330 12 C330 0 310 -2 300 8Z" fill="${color}" opacity="0.25" stroke="${color}" stroke-width="1" stroke-opacity="0.5"/>
    <line x1="360" y1="20" x2="600" y2="20" stroke="${color}" stroke-width="1" opacity="0.3"/>
  </svg>`
}

function leafBranch(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 50" fill="none">
    <path d="M100 25 Q200 23 300 25 Q400 27 500 25" stroke="${color}" stroke-width="1.5" opacity="0.5"/>
    <path d="M200 25 Q195 12 210 8 Q205 18 200 25Z" fill="${color}" opacity="0.3"/>
    <path d="M280 25 Q275 38 290 42 Q285 32 280 25Z" fill="${color}" opacity="0.3"/>
    <path d="M360 25 Q355 12 370 8 Q365 18 360 25Z" fill="${color}" opacity="0.3"/>
    <path d="M420 25 Q415 38 430 42 Q425 32 420 25Z" fill="${color}" opacity="0.3"/>
  </svg>`
}

export const SVG_DECORATIONS: Material[] = [
  // ── 波浪 ──
  {
    id: 'svg-decor-wave-blue',
    kind: 'svg', category: 'svg-decor',
    name: '波浪（蓝）', keywords: ['波浪', '分隔', '蓝色', 'wave'],
    thumbnail: svgToThumb(wave('#3b82f6', '#93c5fd')),
    html: svgToImg(wave('#3b82f6', '#93c5fd'), 400, '波浪装饰'),
  },
  {
    id: 'svg-decor-wave-coral',
    kind: 'svg', category: 'svg-decor',
    name: '波浪（珊瑚）', keywords: ['波浪', '分隔', '珊瑚', '粉色', 'wave'],
    thumbnail: svgToThumb(wave('#f87171', '#fca5a5')),
    html: svgToImg(wave('#f87171', '#fca5a5'), 400, '波浪装饰'),
  },
  {
    id: 'svg-decor-wave-green',
    kind: 'svg', category: 'svg-decor',
    name: '波浪（绿）', keywords: ['波浪', '分隔', '绿色', 'wave'],
    thumbnail: svgToThumb(wave('#4ade80', '#86efac')),
    html: svgToImg(wave('#4ade80', '#86efac'), 400, '波浪装饰'),
  },

  // ── 线条分隔 ──
  {
    id: 'svg-decor-wave-line',
    kind: 'svg', category: 'svg-decor',
    name: '波浪线', keywords: ['波浪线', '分隔', '曲线'],
    thumbnail: svgToThumb(waveLine('#6366f1')),
    html: svgToImg(waveLine('#6366f1'), 400, '波浪线'),
  },
  {
    id: 'svg-decor-dots',
    kind: 'svg', category: 'svg-decor',
    name: '圆点线', keywords: ['圆点', '分隔', '虚线', 'dots'],
    thumbnail: svgToThumb(dotsLine('#a78bfa')),
    html: svgToImg(dotsLine('#a78bfa'), 400, '圆点分隔线'),
  },
  {
    id: 'svg-decor-diamond',
    kind: 'svg', category: 'svg-decor',
    name: '菱形线', keywords: ['菱形', '分隔', '钻石', 'diamond'],
    thumbnail: svgToThumb(diamondLine('#f59e0b')),
    html: svgToImg(diamondLine('#f59e0b'), 400, '菱形分隔线'),
  },
  {
    id: 'svg-decor-heart-line',
    kind: 'svg', category: 'svg-decor',
    name: '爱心线', keywords: ['爱心', '分隔', '心形', 'heart'],
    thumbnail: svgToThumb(heartLine('#ec4899')),
    html: svgToImg(heartLine('#ec4899'), 400, '爱心分隔线'),
  },
  {
    id: 'svg-decor-leaf',
    kind: 'svg', category: 'svg-decor',
    name: '叶枝线', keywords: ['叶子', '分隔', '植物', '自然', 'leaf'],
    thumbnail: svgToThumb(leafBranch('#22c55e')),
    html: svgToImg(leafBranch('#22c55e'), 400, '叶枝装饰线'),
  },

  // ── 角标装饰 ──
  {
    id: 'svg-decor-flower-pink',
    kind: 'svg', category: 'svg-decor',
    name: '花角标（粉）', keywords: ['花朵', '角标', '装饰', '粉色', 'flower'],
    thumbnail: svgToThumb(flowerCorner('#ec4899'), 40),
    html: svgToImg(flowerCorner('#ec4899'), 100, '花朵角标'),
  },
  {
    id: 'svg-decor-flower-blue',
    kind: 'svg', category: 'svg-decor',
    name: '花角标（蓝）', keywords: ['花朵', '角标', '装饰', '蓝色', 'flower'],
    thumbnail: svgToThumb(flowerCorner('#3b82f6'), 40),
    html: svgToImg(flowerCorner('#3b82f6'), 100, '花朵角标'),
  },

  // ── 箭头 ──
  {
    id: 'svg-decor-arrow-right',
    kind: 'svg', category: 'svg-decor',
    name: '手绘箭头（右）', keywords: ['箭头', '指向', '手绘', 'arrow'],
    thumbnail: svgToThumb(arrowRight('#f97316'), 50),
    html: svgToImg(arrowRight('#f97316'), 160, '手绘箭头'),
  },
  {
    id: 'svg-decor-arrow-left',
    kind: 'svg', category: 'svg-decor',
    name: '手绘箭头（左）', keywords: ['箭头', '指向', '手绘', 'arrow'],
    thumbnail: svgToThumb(arrowLeft('#8b5cf6'), 50),
    html: svgToImg(arrowLeft('#8b5cf6'), 160, '手绘箭头'),
  },

  // ── 装饰图案 ──
  {
    id: 'svg-decor-star-burst',
    kind: 'svg', category: 'svg-decor',
    name: '星芒', keywords: ['星星', '闪光', '装饰', 'star'],
    thumbnail: svgToThumb(starBurst('#f59e0b'), 40),
    html: svgToImg(starBurst('#f59e0b'), 80, '星芒装饰'),
  },
  {
    id: 'svg-decor-cloud',
    kind: 'svg', category: 'svg-decor',
    name: '云朵', keywords: ['云', '装饰', '可爱', 'cloud'],
    thumbnail: svgToThumb(cloud('#60a5fa'), 44),
    html: svgToImg(cloud('#60a5fa'), 160, '云朵装饰'),
  },
  // ── 新增装饰 ──
  {
    id: 'svg-decor-frame-blue',
    kind: 'svg', category: 'svg-decor',
    name: '边框（蓝）', keywords: ['边框', '框架', '蓝色', 'frame'],
    thumbnail: svgToThumb(frame('#3b82f6'), 40),
    html: svgToImg(frame('#3b82f6'), 200, '装饰边框'),
  },
  {
    id: 'svg-decor-frame-gold',
    kind: 'svg', category: 'svg-decor',
    name: '边框（金）', keywords: ['边框', '框架', '金色', 'frame'],
    thumbnail: svgToThumb(frame('#f59e0b'), 40),
    html: svgToImg(frame('#f59e0b'), 200, '装饰边框'),
  },
  {
    id: 'svg-decor-ribbon-coral',
    kind: 'svg', category: 'svg-decor',
    name: '绶带（珊瑚）', keywords: ['绶带', '装饰', 'ribbon'],
    thumbnail: svgToThumb(ribbon('#f87171'), 44),
    html: svgToImg(ribbon('#f87171'), 300, '绶带装饰'),
  },
  {
    id: 'svg-decor-ribbon-blue',
    kind: 'svg', category: 'svg-decor',
    name: '绶带（蓝）', keywords: ['绶带', '装饰', '蓝色', 'ribbon'],
    thumbnail: svgToThumb(ribbon('#3b82f6'), 44),
    html: svgToImg(ribbon('#3b82f6'), 300, '绶带装饰'),
  },
  {
    id: 'svg-decor-zigzag',
    kind: 'svg', category: 'svg-decor',
    name: '锯齿线', keywords: ['锯齿', '分隔', 'zigzag'],
    thumbnail: svgToThumb(zigzagLine('#a78bfa')),
    html: svgToImg(zigzagLine('#a78bfa'), 400, '锯齿线'),
  },
  {
    id: 'svg-decor-star-line',
    kind: 'svg', category: 'svg-decor',
    name: '星星线', keywords: ['星星', '分隔', '装饰', 'star'],
    thumbnail: svgToThumb(starLine('#f59e0b')),
    html: svgToImg(starLine('#f59e0b'), 400, '星星装饰线'),
  },
]
