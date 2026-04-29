import type { Material } from '../../types';

export const NumberedListTemplate: Material = {
  id: 'template-numbered-list',
  kind: 'template', category: 'template-list',
  name: '编号列表', keywords: ['编号', '列表', '排行', '排名'],
  thumbnail: '<div style="font-size:8px;line-height:1.6;"><div><b style="color:#3b82f6;">1.</b> 列表项一</div><div><b style="color:#3b82f6;">2.</b> 列表项二</div></div>',
  html: `<section data-template-id="numbered-list" style="margin:1.5em 0;">
    <section style="display:flex;align-items:baseline;margin-bottom:12px;">
      <section style="width:24px;height:24px;background:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;flex-shrink:0;">1</section>
      <section style="margin-left:12px;color:#1f2937;font-size:15px;line-height:1.6;" data-editable="item1">第一个列表项内容</section>
    </section>
    <section style="display:flex;align-items:baseline;margin-bottom:12px;">
      <section style="width:24px;height:24px;background:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;flex-shrink:0;">2</section>
      <section style="margin-left:12px;color:#1f2937;font-size:15px;line-height:1.6;" data-editable="item2">第二个列表项内容</section>
    </section>
    <section style="display:flex;align-items:baseline;margin-bottom:12px;">
      <section style="width:24px;height:24px;background:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;flex-shrink:0;">3</section>
      <section style="margin-left:12px;color:#1f2937;font-size:15px;line-height:1.6;" data-editable="item3">第三个列表项内容</section>
    </section>
    <section style="display:flex;align-items:baseline;">
      <section style="width:24px;height:24px;background:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;flex-shrink:0;">4</section>
      <section style="margin-left:12px;color:#1f2937;font-size:15px;line-height:1.6;" data-editable="item4">第四个列表项内容</section>
    </section>
  </section>`,
};
