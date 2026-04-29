import type { Material } from '../../types';

export const QaCardTemplate: Material = {
  id: 'template-qa-card',
  kind: 'template', category: 'template-qa',
  name: '问答卡片', keywords: ['问答', 'Q&A', '问题', '解答'],
  thumbnail: '<div style="font-size:9px;line-height:1.4;"><div style="color:#3b82f6;font-weight:bold;">Q 问题</div><div style="color:#6b7280;">A 解答内容...</div></div>',
  html: `<section data-template-id="qa-card" style="margin:1.5em 0;">
    <section style="background:#eff6ff;border-radius:8px 8px 0 0;padding:14px 20px;">
      <section style="font-weight:700;color:#1d4ed8;font-size:15px;" data-editable="question">Q：这里写问题内容？</section>
    </section>
    <section style="background:#f9fafb;border-radius:0 0 8px 8px;padding:14px 20px;border-top:1px solid #e5e7eb;">
      <section style="color:#374151;font-size:15px;line-height:1.7;" data-editable="answer">A：这里写解答内容，可以详细说明。</section>
    </section>
  </section>`,
};
