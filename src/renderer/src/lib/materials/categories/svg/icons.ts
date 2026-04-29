import type { Material } from '../../types'
import { svgToImg, svgToThumb } from './index'

function iconSvg(paths: string, viewBox = '0 0 24 24', color = '#374151'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}

function filledIconSvg(paths: string, viewBox = '0 0 24 24', color = '#374151'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="${color}" stroke="none">${paths}</svg>`
}

// ── 通讯类 ──
const phone = iconSvg('<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>')

const mail = iconSvg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>')

const mapPin = iconSvg('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>')

const link = iconSvg('<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>')

// ── 情感类 ──
const star = filledIconSvg('<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>', '0 0 24 24', '#f59e0b')

const heart = filledIconSvg('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>', '0 0 24 24', '#ef4444')

const fire = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <path d="M12 23c-4.97 0-8-3.03-8-7 0-2.66 1.34-5.36 4-8 .4-.4.78-.78 1.14-1.14C10.5 5.5 11 4 11 2c0 0 2.5 2 3.5 4.5S17 10 17 12c0 1.5-.5 2.5-1.5 3.5S14 17 14 18.5c0 1 0 2.5 0 2.5 1.5-.5 2.5-2 2.5-4 0-1 .5-2 1-3 .5-1 1.5-2.5 1.5-4 0 3.5-1 7-4 9.5C13.8 21.8 13 23 12 23z" fill="#f97316" opacity="0.8"/>
  <path d="M12 23c-2 0-4-1.5-4-4 0-1.5 1-3 2-4.5.5-.75 1-1.5 1.5-2 .5.5 1 1.25 1.5 2 1 1.5 2 3 2 4.5 0 2.5-2 4-4 4z" fill="#fbbf24" opacity="0.9"/>
</svg>`

// ── 状态类 ──
const check = iconSvg('<polyline points="20 6 9 17 4 12"/>', '0 0 24 24', '#22c55e')

const cross = iconSvg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', '0 0 24 24', '#ef4444')

const alertCircle = iconSvg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', '0 0 24 24', '#f59e0b')

// ── 物品类 ──
const camera = iconSvg('<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>')

const music = iconSvg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')

const book = iconSvg('<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>')

const gift = iconSvg('<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>')

const clock = iconSvg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>')

// ── 自然类 ──
const sun = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`

const moon = filledIconSvg('<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>', '0 0 24 24', '#6366f1')

// ── 社交类 ──
const wechat = filledIconSvg('<path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.5c.88.32 1.84.5 2.84.5h.16c-.1-.49-.16-1-.16-1.5C9.34 10.36 13.03 7 17.5 7c.39 0 .77.03 1.14.08C17.63 5.26 14.86 4 11.67 4H9.5zM7 9a1 1 0 110-2 1 1 0 010 2zm5 0a1 1 0 110-2 1 1 0 010 2zm6 3c-3.31 0-6 2.24-6 5s2.69 5 6 5c.8 0 1.56-.13 2.25-.36L22 23l-.6-2.12C22.42 19.84 23 18.5 23 17c0-2.76-2.69-5-6-5zm-2 4a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z"/>', '0 0 24 24', '#07c160')

const share = iconSvg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>')

const search = iconSvg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>')

const edit = iconSvg('<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>')

const trash = iconSvg('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>')

const download = iconSvg('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>')

const upload = iconSvg('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>')

// ── 生活类 ──
const coffee = iconSvg('<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>')

const home = iconSvg('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>')

const user = iconSvg('<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>')

const users = iconSvg('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>')

const heartOutline = iconSvg('<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>')

const eye = iconSvg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>')

// ── 工具类 ──
const settings = iconSvg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>')

const image = iconSvg('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>')

const file = iconSvg('<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>')

const folder = iconSvg('<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>')

export const SVG_ICONS: Material[] = [
  {
    id: 'svg-icon-phone',
    kind: 'svg', category: 'svg-icon',
    name: '电话', keywords: ['电话', '手机', '联系', 'phone', 'call'],
    thumbnail: svgToThumb(phone, 32),
    html: svgToImg(phone, 36, '电话'),
  },
  {
    id: 'svg-icon-mail',
    kind: 'svg', category: 'svg-icon',
    name: '邮件', keywords: ['邮件', '邮箱', '信件', 'mail', 'email'],
    thumbnail: svgToThumb(mail, 32),
    html: svgToImg(mail, 36, '邮件'),
  },
  {
    id: 'svg-icon-map-pin',
    kind: 'svg', category: 'svg-icon',
    name: '定位', keywords: ['定位', '地址', '位置', 'map', 'location'],
    thumbnail: svgToThumb(mapPin, 32),
    html: svgToImg(mapPin, 36, '定位'),
  },
  {
    id: 'svg-icon-link',
    kind: 'svg', category: 'svg-icon',
    name: '链接', keywords: ['链接', '超链接', 'link'],
    thumbnail: svgToThumb(link, 32),
    html: svgToImg(link, 36, '链接'),
  },
  {
    id: 'svg-icon-star',
    kind: 'svg', category: 'svg-icon',
    name: '星星', keywords: ['星星', '五角星', '收藏', 'star'],
    thumbnail: svgToThumb(star, 32),
    html: svgToImg(star, 36, '星星'),
  },
  {
    id: 'svg-icon-heart',
    kind: 'svg', category: 'svg-icon',
    name: '爱心', keywords: ['爱心', '喜欢', '红心', 'heart', 'love'],
    thumbnail: svgToThumb(heart, 32),
    html: svgToImg(heart, 36, '爱心'),
  },
  {
    id: 'svg-icon-fire',
    kind: 'svg', category: 'svg-icon',
    name: '火焰', keywords: ['火焰', '热门', '火', 'fire', 'hot'],
    thumbnail: svgToThumb(fire, 32),
    html: svgToImg(fire, 36, '火焰'),
  },
  {
    id: 'svg-icon-check',
    kind: 'svg', category: 'svg-icon',
    name: '对勾', keywords: ['对勾', '正确', '完成', 'check'],
    thumbnail: svgToThumb(check, 32),
    html: svgToImg(check, 36, '对勾'),
  },
  {
    id: 'svg-icon-cross',
    kind: 'svg', category: 'svg-icon',
    name: '叉号', keywords: ['叉号', '错误', '关闭', 'cross'],
    thumbnail: svgToThumb(cross, 32),
    html: svgToImg(cross, 36, '叉号'),
  },
  {
    id: 'svg-icon-alert',
    kind: 'svg', category: 'svg-icon',
    name: '感叹号', keywords: ['感叹号', '注意', '警告', 'alert'],
    thumbnail: svgToThumb(alertCircle, 32),
    html: svgToImg(alertCircle, 36, '注意'),
  },
  {
    id: 'svg-icon-camera',
    kind: 'svg', category: 'svg-icon',
    name: '相机', keywords: ['相机', '拍照', '摄影', 'camera'],
    thumbnail: svgToThumb(camera, 32),
    html: svgToImg(camera, 36, '相机'),
  },
  {
    id: 'svg-icon-music',
    kind: 'svg', category: 'svg-icon',
    name: '音乐', keywords: ['音乐', '音符', '歌曲', 'music'],
    thumbnail: svgToThumb(music, 32),
    html: svgToImg(music, 36, '音乐'),
  },
  {
    id: 'svg-icon-book',
    kind: 'svg', category: 'svg-icon',
    name: '书本', keywords: ['书本', '阅读', '书籍', 'book', 'read'],
    thumbnail: svgToThumb(book, 32),
    html: svgToImg(book, 36, '书本'),
  },
  {
    id: 'svg-icon-gift',
    kind: 'svg', category: 'svg-icon',
    name: '礼物', keywords: ['礼物', '礼品', '送礼', 'gift'],
    thumbnail: svgToThumb(gift, 32),
    html: svgToImg(gift, 36, '礼物'),
  },
  {
    id: 'svg-icon-clock',
    kind: 'svg', category: 'svg-icon',
    name: '时钟', keywords: ['时钟', '时间', '钟表', 'clock', 'time'],
    thumbnail: svgToThumb(clock, 32),
    html: svgToImg(clock, 36, '时钟'),
  },
  {
    id: 'svg-icon-sun',
    kind: 'svg', category: 'svg-icon',
    name: '太阳', keywords: ['太阳', '晴天', '阳光', 'sun'],
    thumbnail: svgToThumb(sun, 32),
    html: svgToImg(sun, 36, '太阳'),
  },
  {
    id: 'svg-icon-moon',
    kind: 'svg', category: 'svg-icon',
    name: '月亮', keywords: ['月亮', '夜晚', '晚安', 'moon'],
    thumbnail: svgToThumb(moon, 32),
    html: svgToImg(moon, 36, '月亮'),
  },
  // ── 新增社交类 ──
  {
    id: 'svg-icon-wechat',
    kind: 'svg', category: 'svg-icon',
    name: '微信', keywords: ['微信', 'wechat', '聊天'],
    thumbnail: svgToThumb(wechat, 32),
    html: svgToImg(wechat, 36, '微信'),
  },
  {
    id: 'svg-icon-share',
    kind: 'svg', category: 'svg-icon',
    name: '分享', keywords: ['分享', '转发', 'share'],
    thumbnail: svgToThumb(share, 32),
    html: svgToImg(share, 36, '分享'),
  },
  {
    id: 'svg-icon-search',
    kind: 'svg', category: 'svg-icon',
    name: '搜索', keywords: ['搜索', '查找', 'search'],
    thumbnail: svgToThumb(search, 32),
    html: svgToImg(search, 36, '搜索'),
  },
  {
    id: 'svg-icon-edit',
    kind: 'svg', category: 'svg-icon',
    name: '编辑', keywords: ['编辑', '修改', '写字', 'edit'],
    thumbnail: svgToThumb(edit, 32),
    html: svgToImg(edit, 36, '编辑'),
  },
  {
    id: 'svg-icon-trash',
    kind: 'svg', category: 'svg-icon',
    name: '删除', keywords: ['删除', '垃圾桶', 'trash'],
    thumbnail: svgToThumb(trash, 32),
    html: svgToImg(trash, 36, '删除'),
  },
  {
    id: 'svg-icon-download',
    kind: 'svg', category: 'svg-icon',
    name: '下载', keywords: ['下载', 'download'],
    thumbnail: svgToThumb(download, 32),
    html: svgToImg(download, 36, '下载'),
  },
  {
    id: 'svg-icon-upload',
    kind: 'svg', category: 'svg-icon',
    name: '上传', keywords: ['上传', 'upload'],
    thumbnail: svgToThumb(upload, 32),
    html: svgToImg(upload, 36, '上传'),
  },
  // ── 新增生活类 ──
  {
    id: 'svg-icon-coffee',
    kind: 'svg', category: 'svg-icon',
    name: '咖啡', keywords: ['咖啡', '饮品', 'coffee'],
    thumbnail: svgToThumb(coffee, 32),
    html: svgToImg(coffee, 36, '咖啡'),
  },
  {
    id: 'svg-icon-home',
    kind: 'svg', category: 'svg-icon',
    name: '首页', keywords: ['首页', '主页', '家', 'home'],
    thumbnail: svgToThumb(home, 32),
    html: svgToImg(home, 36, '首页'),
  },
  {
    id: 'svg-icon-user',
    kind: 'svg', category: 'svg-icon',
    name: '用户', keywords: ['用户', '个人', '头像', 'user'],
    thumbnail: svgToThumb(user, 32),
    html: svgToImg(user, 36, '用户'),
  },
  {
    id: 'svg-icon-users',
    kind: 'svg', category: 'svg-icon',
    name: '团队', keywords: ['团队', '多人', '群组', 'users'],
    thumbnail: svgToThumb(users, 32),
    html: svgToImg(users, 36, '团队'),
  },
  {
    id: 'svg-icon-heart-outline',
    kind: 'svg', category: 'svg-icon',
    name: '爱心（线）', keywords: ['爱心', '空心', '点赞', 'heart'],
    thumbnail: svgToThumb(heartOutline, 32),
    html: svgToImg(heartOutline, 36, '爱心'),
  },
  {
    id: 'svg-icon-eye',
    kind: 'svg', category: 'svg-icon',
    name: '眼睛', keywords: ['眼睛', '查看', '阅读量', 'eye', 'view'],
    thumbnail: svgToThumb(eye, 32),
    html: svgToImg(eye, 36, '查看'),
  },
  // ── 新增工具类 ──
  {
    id: 'svg-icon-settings',
    kind: 'svg', category: 'svg-icon',
    name: '设置', keywords: ['设置', '齿轮', '配置', 'settings'],
    thumbnail: svgToThumb(settings, 32),
    html: svgToImg(settings, 36, '设置'),
  },
  {
    id: 'svg-icon-image',
    kind: 'svg', category: 'svg-icon',
    name: '图片', keywords: ['图片', '图像', '相册', 'image'],
    thumbnail: svgToThumb(image, 32),
    html: svgToImg(image, 36, '图片'),
  },
  {
    id: 'svg-icon-file',
    kind: 'svg', category: 'svg-icon',
    name: '文件', keywords: ['文件', '文档', 'file'],
    thumbnail: svgToThumb(file, 32),
    html: svgToImg(file, 36, '文件'),
  },
  {
    id: 'svg-icon-folder',
    kind: 'svg', category: 'svg-icon',
    name: '文件夹', keywords: ['文件夹', '目录', 'folder'],
    thumbnail: svgToThumb(folder, 32),
    html: svgToImg(folder, 36, '文件夹'),
  },
]
