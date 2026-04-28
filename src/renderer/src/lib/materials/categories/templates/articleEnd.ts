import type { Material } from '../../types';

export const ArticleEndTemplate: Material = {
  id: 'template-end',
  kind: 'template', category: 'template-end',
  name: '文章封底', keywords: ['封底', '结束'],
  thumbnail: '<div style="text-align:center;font-size:8px;color:#999;">— 全文完 —</div>',
  html: `<section data-template-id="end" style="text-align:center;margin:3em 0 1.5em;">
    <section style="color:#9ca3af;font-size:14px;letter-spacing:0.3em;">— 全文完 —</section>
    <section style="color:#d1d5db;font-size:18px;margin:8px 0;">❖</section>
    <section style="color:#9ca3af;font-size:12px;" data-editable="contact">📧 联系：example@email.com</section>
  </section>`,
};
