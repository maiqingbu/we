import type { Material } from '../../types';

const midAutumnMeta = {
  name: '中秋节',
  lunarMonth: 8,
  lunarDay: 15,
  color: '#7c3aed',
  icon: '🌕',
};

const bannerHtml = (title: string, subtitle: string) =>
  `<section style="background:linear-gradient(135deg,#1e1b4b,#4c1d95);padding:24px 20px;border-radius:8px;text-align:center;margin:1.5em 0;">
    <section style="font-size:28px;margin-bottom:8px;">🌕🏮</section>
    <section style="color:#e9d5ff;font-size:20px;font-weight:700;margin-bottom:6px;" data-editable="title">${title}</section>
    <section style="color:rgba(233,213,255,0.8);font-size:14px;" data-editable="content">${subtitle}</section>
  </section>`;

const poemHtml = (poem: string) =>
  `<section style="background:#f5f3ff;border-left:4px solid #7c3aed;padding:16px 20px;border-radius:0 6px 6px 0;margin:1em 0;">
    <section style="color:#7c3aed;font-size:15px;font-weight:600;margin-bottom:6px;">🌕 中秋诗词</section>
    <section style="color:#374151;line-height:1.8;font-size:14px;" data-editable="content">${poem}</section>
  </section>`;

export const MidAutumnMaterials: Material[] = [
  {
    id: 'festival-midautumn-banner',
    kind: 'festival',
    category: 'festival-midautumn',
    name: '中秋横幅',
    keywords: ['中秋', '月亮', '团圆', '月饼', 'mid-autumn'],
    thumbnail: '<div style="background:linear-gradient(135deg,#1e1b4b,#4c1d95);padding:6px;border-radius:4px;text-align:center;color:#e9d5ff;font-size:9px;">🌕 中秋快乐</div>',
    html: bannerHtml('中秋快乐', '月圆人团圆，阖家幸福'),
    festival: midAutumnMeta,
    tags: ['节日', '中秋'],
  },
  {
    id: 'festival-midautumn-poem',
    kind: 'festival',
    category: 'festival-midautumn',
    name: '中秋诗词卡',
    keywords: ['中秋', '诗词', '古诗', '月亮'],
    thumbnail: '<div style="background:#f5f3ff;border-left:3px solid #7c3aed;padding:6px;font-size:9px;">🌕 但愿人长久...</div>',
    html: poemHtml('但愿人长久，千里共婵娟。\n\n—— 苏轼《水调歌头》'),
    festival: midAutumnMeta,
    tags: ['节日', '中秋'],
  },
  {
    id: 'festival-midautumn-divider',
    kind: 'festival',
    category: 'festival-midautumn',
    name: '中秋分割线',
    keywords: ['中秋', '分割线', '月亮', '装饰'],
    thumbnail: '<div style="text-align:center;color:#7c3aed;font-size:12px;padding:4px;">🌕 ✨ 🏮</div>',
    html: `<section style="text-align:center;margin:1.5em 0;color:#7c3aed;font-size:16px;letter-spacing:8px;">🌕 ✨ 🏮</section>`,
    festival: midAutumnMeta,
    tags: ['节日', '中秋', '分割线'],
  },
];
