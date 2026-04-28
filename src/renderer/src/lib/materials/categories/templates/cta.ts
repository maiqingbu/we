import type { Material } from '../../types';

export const CtaTemplate: Material = {
  id: 'template-cta',
  kind: 'template', category: 'template-cta',
  name: 'CTA 按钮', keywords: ['按钮', 'cta', '点击'],
  thumbnail: '<div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:white;padding:6px 10px;border-radius:20px;font-size:9px;text-align:center;">点击</div>',
  html: `<section style="text-align:center;margin:1.5em 0;">
    <section data-template-id="cta" style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);color:white;padding:14px 36px;border-radius:30px;font-size:15px;font-weight:600;box-shadow:0 4px 14px rgba(59,130,246,0.3);" data-editable="content">点击阅读原文</section>
  </section>`,
};
