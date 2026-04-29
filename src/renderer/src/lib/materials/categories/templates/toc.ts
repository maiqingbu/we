import type { Material } from '../../types';

export const TocTemplate: Material = {
  id: 'template-toc',
  kind: 'template', category: 'template-toc',
  name: '目录', keywords: ['目录', '导航', '大纲', '索引'],
  thumbnail: '<div style="font-size:8px;background:#f9fafb;padding:4px;border-radius:4px;border-left:2px solid #3b82f6;"><b>📋 目录</b><div>1. 第一章</div><div>2. 第二章</div></div>',
  html: `<section data-template-id="toc" style="background:#f9fafb;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:18px 22px;margin:1.5em 0;">
    <section style="font-weight:700;color:#1e40af;font-size:16px;margin-bottom:14px;">📋 目录</section>
    <section style="color:#374151;font-size:14px;line-height:2.2;" data-editable="content">
      <section>一、第一章标题</section>
      <section>二、第二章标题</section>
      <section>三、第三章标题</section>
      <section>四、第四章标题</section>
    </section>
  </section>`,
};
