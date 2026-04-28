import type { Material } from '../../types';

export const HighlightTemplate: Material = {
  id: 'template-highlight',
  kind: 'template', category: 'template-highlight',
  name: '高亮重点', keywords: ['高亮', '重点'],
  thumbnail: '<div style="background:#fef08a;padding:4px 6px;border-radius:4px;font-size:9px;font-weight:bold;">重点内容</div>',
  html: `<section data-template-id="highlight" style="background:#fef9c3;color:#713f12;padding:12px 18px;margin:1em 0;border-radius:6px;font-weight:600;font-size:15px;line-height:1.6;" data-editable="content">这是一行需要重点突出的内容。</section>`,
};
