import type { Material } from '../../types';

export const TestimonialTemplate: Material = {
  id: 'template-testimonial',
  kind: 'template', category: 'template-testimonial',
  name: '用户评价', keywords: ['评价', '用户', '口碑', '反馈'],
  thumbnail: '<div style="font-size:8px;background:#f9fafb;padding:4px;border-radius:4px;">⭐⭐⭐⭐⭐<div>"好评内容..."</div><div style="text-align:right;">— 用户</div></div>',
  html: `<section data-template-id="testimonial" style="background:#f9fafb;border-radius:10px;padding:20px 24px;margin:1.5em 0;border:1px solid #e5e7eb;">
    <section style="color:#f59e0b;font-size:16px;letter-spacing:2px;margin-bottom:10px;">⭐⭐⭐⭐⭐</section>
    <section style="color:#374151;font-size:15px;line-height:1.7;font-style:italic;" data-editable="content">"用户的真实评价内容，展示正面反馈..."</section>
    <section style="display:flex;align-items:center;margin-top:14px;">
      <section style="width:36px;height:36px;background:#e5e7eb;border-radius:50;text-align:center;line-height:36px;font-size:16px;">👤</section>
      <section style="margin-left:10px;">
        <section style="font-weight:600;color:#1f2937;font-size:14px;" data-editable="name">用户名</section>
        <section style="color:#9ca3af;font-size:12px;" data-editable="role">身份 / 职位</section>
      </section>
    </section>
  </section>`,
};
