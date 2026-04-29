import type { Material } from '../../types';

const christmasMeta = {
  name: '圣诞节',
  month: 12,
  day: 25,
  color: '#16a34a',
  icon: '🎄',
};

const bannerHtml = (title: string, subtitle: string) =>
  `<section style="background:linear-gradient(135deg,#14532d,#166534);padding:24px 20px;border-radius:8px;text-align:center;margin:1.5em 0;">
    <section style="font-size:28px;margin-bottom:8px;">🎄🎅</section>
    <section style="color:#bbf7d0;font-size:20px;font-weight:700;margin-bottom:6px;" data-editable="title">${title}</section>
    <section style="color:rgba(187,247,208,0.8);font-size:14px;" data-editable="content">${subtitle}</section>
  </section>`;

const wishHtml = (wish: string) =>
  `<section style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px 20px;border-radius:8px;margin:1em 0;">
    <section style="color:#16a34a;font-size:15px;font-weight:600;margin-bottom:6px;">🎄 圣诞祝福</section>
    <section style="color:#374151;line-height:1.7;font-size:14px;" data-editable="content">${wish}</section>
  </section>`;

export const ChristmasMaterials: Material[] = [
  {
    id: 'festival-christmas-banner',
    kind: 'festival',
    category: 'festival-christmas',
    name: '圣诞横幅',
    keywords: ['圣诞', '圣诞节', 'christmas', '新年'],
    thumbnail: '<div style="background:linear-gradient(135deg,#14532d,#166534);padding:6px;border-radius:4px;text-align:center;color:#bbf7d0;font-size:9px;">🎄 Merry Christmas</div>',
    html: bannerHtml('Merry Christmas', '圣诞快乐，新年如意'),
    festival: christmasMeta,
    tags: ['节日', '圣诞'],
  },
  {
    id: 'festival-christmas-wish',
    kind: 'festival',
    category: 'festival-christmas',
    name: '圣诞祝福卡',
    keywords: ['圣诞', '祝福', 'christmas', '礼物'],
    thumbnail: '<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:6px;border-radius:4px;font-size:9px;">🎄 祝福语...</div>',
    html: wishHtml('愿这个圣诞节，温暖与你相伴，幸福与你同行！'),
    festival: christmasMeta,
    tags: ['节日', '圣诞'],
  },
  {
    id: 'festival-christmas-divider',
    kind: 'festival',
    category: 'festival-christmas',
    name: '圣诞分割线',
    keywords: ['圣诞', '分割线', 'christmas', '装饰'],
    thumbnail: '<div style="text-align:center;color:#16a34a;font-size:12px;padding:4px;">🎄 ⭐ 🎁</div>',
    html: `<section style="text-align:center;margin:1.5em 0;color:#16a34a;font-size:16px;letter-spacing:8px;">🎄 ⭐ 🎁</section>`,
    festival: christmasMeta,
    tags: ['节日', '圣诞', '分割线'],
  },
];
