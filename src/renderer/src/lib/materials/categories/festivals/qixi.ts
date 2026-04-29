import type { Material } from '../../types';

const qixiMeta = {
  name: '七夕节',
  lunarMonth: 7,
  lunarDay: 7,
  color: '#e11d48',
  icon: '💕',
};

const bannerHtml = (title: string, subtitle: string) =>
  `<section style="background:linear-gradient(135deg,#881337,#be123c);padding:24px 20px;border-radius:8px;text-align:center;margin:1.5em 0;">
    <section style="font-size:28px;margin-bottom:8px;">💕🌟</section>
    <section style="color:#fecdd3;font-size:20px;font-weight:700;margin-bottom:6px;" data-editable="title">${title}</section>
    <section style="color:rgba(254,205,211,0.8);font-size:14px;" data-editable="content">${subtitle}</section>
  </section>`;

const poemHtml = (poem: string) =>
  `<section style="background:#fff1f2;border-left:4px solid #e11d48;padding:16px 20px;border-radius:0 6px 6px 0;margin:1em 0;">
    <section style="color:#e11d48;font-size:15px;font-weight:600;margin-bottom:6px;">💕 七夕诗词</section>
    <section style="color:#374151;line-height:1.8;font-size:14px;" data-editable="content">${poem}</section>
  </section>`;

export const QixiMaterials: Material[] = [
  {
    id: 'festival-qixi-banner',
    kind: 'festival',
    category: 'festival-qixi',
    name: '七夕横幅',
    keywords: ['七夕', '情人节', '爱情', '牛郎织女', 'qixi'],
    thumbnail: '<div style="background:linear-gradient(135deg,#881337,#be123c);padding:6px;border-radius:4px;text-align:center;color:#fecdd3;font-size:9px;">💕 七夕快乐</div>',
    html: bannerHtml('七夕快乐', '愿有岁月可回首，且以深情共白头'),
    festival: qixiMeta,
    tags: ['节日', '七夕'],
  },
  {
    id: 'festival-qixi-poem',
    kind: 'festival',
    category: 'festival-qixi',
    name: '七夕诗词卡',
    keywords: ['七夕', '诗词', '古诗', '爱情'],
    thumbnail: '<div style="background:#fff1f2;border-left:3px solid #e11d48;padding:6px;font-size:9px;">💕 迢迢牵牛星...</div>',
    html: poemHtml('迢迢牵牛星，皎皎河汉女。\n纤纤擢素手，札札弄机杼。'),
    festival: qixiMeta,
    tags: ['节日', '七夕'],
  },
  {
    id: 'festival-qixi-divider',
    kind: 'festival',
    category: 'festival-qixi',
    name: '七夕分割线',
    keywords: ['七夕', '分割线', '爱情', '装饰'],
    thumbnail: '<div style="text-align:center;color:#e11d48;font-size:12px;padding:4px;">💕 🌟 💕</div>',
    html: `<section style="text-align:center;margin:1.5em 0;color:#e11d48;font-size:16px;letter-spacing:8px;">💕 🌟 💕</section>`,
    festival: qixiMeta,
    tags: ['节日', '七夕', '分割线'],
  },
];
