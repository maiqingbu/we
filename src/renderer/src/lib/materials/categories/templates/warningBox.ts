import type { Material } from '../../types';

export const WarningBoxTemplate: Material = {
  id: 'template-warning',
  kind: 'template', category: 'template-warning',
  name: '警告提示', keywords: ['警告', '危险', '注意', '提示'],
  thumbnail: '<div style="font-size:9px;background:#fef2f2;padding:4px;border-radius:4px;border-left:3px solid #ef4444;">⚠ 警告内容</div>',
  html: `<section data-template-id="warning" style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:16px 20px;margin:1.5em 0;">
    <section style="font-weight:700;color:#b91c1c;font-size:15px;margin-bottom:8px;">⚠️ 警告</section>
    <section style="color:#991b1b;font-size:14px;line-height:1.7;" data-editable="content">这里写警告内容，提醒读者需要注意的事项。</section>
  </section>`,
};
