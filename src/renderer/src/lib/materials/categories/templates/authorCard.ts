import type { Material } from '../../types';

export const AuthorCardTemplate: Material = {
  id: 'template-author',
  kind: 'template', category: 'template-author',
  name: '作者信息卡', keywords: ['作者', '简介'],
  thumbnail: '<div style="background:#f9fafb;padding:6px;display:flex;align-items:center;font-size:8px;"><div style="width:16px;height:16px;background:#999;border-radius:50%;margin-right:4px;"></div><div>作者<br>简介</div></div>',
  html: `<section data-template-id="author" style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin:1.5em 0;display:flex;align-items:center;gap:14px;">
    <img src="https://placehold.co/64x64?text=头像" alt="头像" data-editable-img style="width:64px;height:64px;border-radius:50%;flex-shrink:0;" />
    <section style="flex:1;">
      <section style="font-weight:600;color:#1f2937;font-size:15px;" data-editable="name">作者名</section>
      <section style="color:#6b7280;font-size:13px;margin:4px 0;" data-editable="bio">一句话简介，介绍你是谁</section>
      <section style="color:#3b82f6;font-size:12px;" data-editable="account">公众号：账号名</section>
    </section>
  </section>`,
};
