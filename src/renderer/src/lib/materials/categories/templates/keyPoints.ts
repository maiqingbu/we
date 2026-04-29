import type { Material } from '../../types';

export const KeyPointsTemplate: Material = {
  id: 'template-key-points',
  kind: 'template', category: 'template-key-points',
  name: '关键要点', keywords: ['要点', '关键', '总结', '核心'],
  thumbnail: '<div style="font-size:8px;background:#fef3c7;padding:4px;border-radius:4px;"><b>🔑 关键要点</b><div>• 要点一</div><div>• 要点二</div></div>',
  html: `<section data-template-id="key-points" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:18px 22px;margin:1.5em 0;">
    <section style="font-weight:700;color:#92400e;font-size:16px;margin-bottom:12px;">🔑 关键要点</section>
    <section style="color:#78350f;font-size:14px;line-height:2;" data-editable="points">
      <section>• 要点一：在这里写核心内容</section>
      <section>• 要点二：在这里写核心内容</section>
      <section>• 要点三：在这里写核心内容</section>
    </section>
  </section>`,
};
