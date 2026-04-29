import type { Material } from '../../types';

const springMeta = {
  name: '春节',
  lunarMonth: 1,
  lunarDay: 1,
  color: '#dc2626',
  icon: '🧧',
};

const bannerHtml = (title: string, subtitle: string) =>
  `<section style="background:linear-gradient(135deg,#dc2626,#f97316);padding:24px 20px;border-radius:8px;text-align:center;margin:1.5em 0;">
    <section style="font-size:28px;margin-bottom:8px;">🧧🎆</section>
    <section style="color:#fff;font-size:20px;font-weight:700;margin-bottom:6px;" data-editable="title">${title}</section>
    <section style="color:rgba(255,255,255,0.85);font-size:14px;" data-editable="content">${subtitle}</section>
  </section>`;

const greetingHtml = (greeting: string) =>
  `<section style="background:#fef2f2;border:1px solid #fecaca;padding:16px 20px;border-radius:8px;margin:1em 0;">
    <section style="color:#dc2626;font-size:15px;font-weight:600;margin-bottom:6px;">🧧 新春祝福</section>
    <section style="color:#374151;line-height:1.7;font-size:14px;" data-editable="content">${greeting}</section>
  </section>`;

export const SpringFestivalMaterials: Material[] = [
  {
    id: 'festival-spring-banner',
    kind: 'festival',
    category: 'festival-spring',
    name: '春节横幅',
    keywords: ['春节', '新年', '新春', '过年', 'spring festival'],
    thumbnail: '<div style="background:linear-gradient(135deg,#dc2626,#f97316);padding:6px;border-radius:4px;text-align:center;color:#fff;font-size:9px;">🧧 新春快乐</div>',
    html: bannerHtml('新春快乐', '万事如意，阖家幸福'),
    festival: springMeta,
    tags: ['节日', '春节'],
  },
  {
    id: 'festival-spring-greeting',
    kind: 'festival',
    category: 'festival-spring',
    name: '春节祝福卡',
    keywords: ['春节', '祝福', '拜年', '新年好'],
    thumbnail: '<div style="background:#fef2f2;border:1px solid #fecaca;padding:6px;border-radius:4px;font-size:9px;">🧧 祝福语...</div>',
    html: greetingHtml('祝您新春快乐，龙年大吉，万事如意，阖家幸福安康！'),
    festival: springMeta,
    tags: ['节日', '春节'],
  },
  {
    id: 'festival-spring-divider',
    kind: 'festival',
    category: 'festival-spring',
    name: '春节分割线',
    keywords: ['春节', '分割线', '新年', '装饰'],
    thumbnail: '<div style="text-align:center;color:#dc2626;font-size:12px;padding:4px;">🧧 ✨ 🧧</div>',
    html: `<section style="text-align:center;margin:1.5em 0;color:#dc2626;font-size:16px;letter-spacing:8px;">🧧 ✨ 🧧</section>`,
    festival: springMeta,
    tags: ['节日', '春节', '分割线'],
  },
];
