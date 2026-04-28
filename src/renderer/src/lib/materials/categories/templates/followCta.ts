import type { Material } from '../../types';

export const FollowCtaTemplate: Material = {
  id: 'template-follow',
  kind: 'template', category: 'template-follow',
  name: '关注引导', keywords: ['关注', '引导', '点赞'],
  thumbnail: '<div style="text-align:center;font-size:8px;border-top:1px solid #999;padding-top:4px;">如果觉得有用<br>👍 ⭐ 📤</div>',
  html: `<section data-template-id="follow" style="margin:2em 0;padding-top:20px;border-top:1px dashed #d1d5db;text-align:center;">
    <section style="color:#6b7280;font-size:14px;margin-bottom:14px;" data-editable="content">如果这篇内容对你有用 👇</section>
    <section style="display:flex;justify-content:center;gap:32px;font-size:13px;color:#9ca3af;">
      <span>👍 点赞</span><span>⭐ 在看</span><span>📤 分享</span>
    </section>
  </section>`,
};
