export { SVG_DECORATIONS } from './decorations'
export { SVG_ICONS } from './icons'
export { SVG_BADGES } from './badges'

/**
 * 将 SVG 字符串转为 <img> 标签（data:image/svg+xml;base64）。
 * 微信不支持内联 SVG，所以素材以 base64 图片形式插入。
 */
export function svgToImg(svg: string, width: number, alt?: string): string {
  const base64 = btoa(unescape(encodeURIComponent(svg)))
  const altAttr = alt ? ` alt="${alt}"` : ''
  return `<p style="text-align:center"><img src="data:image/svg+xml;base64,${base64}" style="width:${width}px;max-width:100%;height:auto;"${altAttr} /></p>`
}

/** 缩略图用小尺寸版本 */
export function svgToThumb(svg: string, size = 48): string {
  const base64 = btoa(unescape(encodeURIComponent(svg)))
  return `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;padding:8px;"><img src="data:image/svg+xml;base64,${base64}" style="width:${size}px;height:${size}px;object-fit:contain;" /></div>`
}
