import type { Material } from '../../types';

export const PullQuoteTemplate: Material = {
  id: 'template-pull-quote',
  kind: 'template', category: 'template-quote',
  name: '突出引文', keywords: ['引文', '突出', '金句', '名言'],
  thumbnail: '<div style="font-size:9px;text-align:center;border-top:2px solid #3b82f6;border-bottom:2px solid #3b82f6;padding:4px 0;"><i>"金句内容"</i></div>',
  html: `<section data-template-id="pull-quote" style="text-align:center;padding:20px 30px;margin:1.5em 0;border-top:3px solid #3b82f6;border-bottom:3px solid #3b82f6;">
    <section style="font-size:18px;color:#1e40af;font-style:italic;line-height:1.8;font-family:Georgia,serif;" data-editable="content">"在这里写一段令人印象深刻的金句或名言。"</section>
    <section style="color:#6b7280;font-size:13px;margin-top:10px;" data-editable="author">—— 出处</section>
  </section>`,
};
