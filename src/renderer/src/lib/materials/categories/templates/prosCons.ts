import type { Material } from '../../types';

export const ProsConsTemplate: Material = {
  id: 'template-pros-cons',
  kind: 'template', category: 'template-compare',
  name: '优劣对比', keywords: ['优劣', '对比', '优点', '缺点', '比较'],
  thumbnail: '<div style="font-size:8px;display:flex;gap:4px;"><div style="flex:1;background:#dcfce7;padding:3px;border-radius:3px;">✓ 优点</div><div style="flex:1;background:#fee2e2;padding:3px;border-radius:3px;">✗ 缺点</div></div>',
  html: `<section data-template-id="pros-cons" style="display:flex;gap:12px;margin:1.5em 0;">
    <section style="flex:1;background:#f0fdf4;border-radius:8px;padding:16px;">
      <section style="font-weight:700;color:#16a34a;font-size:15px;margin-bottom:10px;">✓ 优点</section>
      <section style="color:#374151;font-size:14px;line-height:1.8;" data-editable="pros">
        <section>• 优点一</section>
        <section>• 优点二</section>
        <section>• 优点三</section>
      </section>
    </section>
    <section style="flex:1;background:#fef2f2;border-radius:8px;padding:16px;">
      <section style="font-weight:700;color:#dc2626;font-size:15px;margin-bottom:10px;">✗ 缺点</section>
      <section style="color:#374151;font-size:14px;line-height:1.8;" data-editable="cons">
        <section>• 缺点一</section>
        <section>• 缺点二</section>
        <section>• 缺点三</section>
      </section>
    </section>
  </section>`,
};
