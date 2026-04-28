import type { Material } from '../../types';

export const QuoteCardTemplate: Material = {
  id: 'template-quote-card',
  kind: 'template', category: 'template-quote',
  name: '引用卡', keywords: ['引用', '卡片'],
  thumbnail: '<div style="background:#f3f4f6;padding:6px;font-size:9px;border-radius:4px;">"内容..."<br><div style="text-align:right;">— 作者</div></div>',
  html: `<section data-template-id="quote-card" style="background:#f9fafb;border-radius:8px;padding:24px 28px;margin:1.5em 0;position:relative;">
    <section style="font-size:48px;line-height:1;color:#d1d5db;font-family:Georgia,serif;margin-bottom:-8px;">"</section>
    <section style="color:#1f2937;font-size:15px;line-height:1.8;font-style:italic;" data-editable="content">这里是引文内容，写一段你想突出的话...</section>
    <section style="text-align:right;color:#6b7280;font-size:14px;margin-top:12px;" data-editable="author">—— 作者名</section>
  </section>`,
};
