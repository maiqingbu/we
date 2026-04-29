import type { Material } from '../../types';

const nationalMeta = {
  name: '国庆节',
  month: 10,
  day: 1,
  color: '#dc2626',
  icon: '🇨🇳',
};

const bannerHtml = (title: string, subtitle: string) =>
  `<section style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:24px 20px;border-radius:8px;text-align:center;margin:1.5em 0;">
    <section style="font-size:28px;margin-bottom:8px;">🇨🇳🎉</section>
    <section style="color:#fff;font-size:20px;font-weight:700;margin-bottom:6px;" data-editable="title">${title}</section>
    <section style="color:rgba(255,255,255,0.85);font-size:14px;" data-editable="content">${subtitle}</section>
  </section>`;

const wishHtml = (wish: string) =>
  `<section style="background:#fef2f2;border:1px solid #fecaca;padding:16px 20px;border-radius:8px;margin:1em 0;">
    <section style="color:#dc2626;font-size:15px;font-weight:600;margin-bottom:6px;">🇨🇳 国庆祝福</section>
    <section style="color:#374151;line-height:1.7;font-size:14px;" data-editable="content">${wish}</section>
  </section>`;

export const NationalMaterials: Material[] = [
  {
    id: 'festival-national-banner',
    kind: 'festival',
    category: 'festival-national',
    name: '国庆横幅',
    keywords: ['国庆', '国庆节', '祖国', '十一', 'national day'],
    thumbnail: '<div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:6px;border-radius:4px;text-align:center;color:#fff;font-size:9px;">🇨🇳 国庆快乐</div>',
    html: bannerHtml('国庆快乐', '祝祖国繁荣昌盛，人民幸福安康'),
    festival: nationalMeta,
    tags: ['节日', '国庆'],
  },
  {
    id: 'festival-national-wish',
    kind: 'festival',
    category: 'festival-national',
    name: '国庆祝福卡',
    keywords: ['国庆', '祝福', '祖国', '十一'],
    thumbnail: '<div style="background:#fef2f2;border:1px solid #fecaca;padding:6px;border-radius:4px;font-size:9px;">🇨🇳 祝福语...</div>',
    html: wishHtml('盛世华诞，举国同庆。愿山河无恙，人间皆安！'),
    festival: nationalMeta,
    tags: ['节日', '国庆'],
  },
  {
    id: 'festival-national-divider',
    kind: 'festival',
    category: 'festival-national',
    name: '国庆分割线',
    keywords: ['国庆', '分割线', '祖国', '装饰'],
    thumbnail: '<div style="text-align:center;color:#dc2626;font-size:12px;padding:4px;">🇨🇳 🎉 🇨🇳</div>',
    html: `<section style="text-align:center;margin:1.5em 0;color:#dc2626;font-size:16px;letter-spacing:8px;">🇨🇳 🎉 🇨🇳</section>`,
    festival: nationalMeta,
    tags: ['节日', '国庆', '分割线'],
  },
];
