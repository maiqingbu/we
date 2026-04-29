import type { Material } from '../../types';

export const StepsTemplate: Material = {
  id: 'template-steps',
  kind: 'template', category: 'template-steps',
  name: '步骤引导', keywords: ['步骤', '引导', '流程', '教程'],
  thumbnail: '<div style="font-size:8px;line-height:1.6;"><div>① 步骤一</div><div>② 步骤二</div><div>③ 步骤三</div></div>',
  html: `<section data-template-id="steps" style="margin:1.5em 0;">
    <section style="display:flex;align-items:flex-start;margin-bottom:16px;">
      <section style="width:32px;height:32px;background:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;flex-shrink:0;">1</section>
      <section style="margin-left:14px;flex:1;">
        <section style="font-weight:600;color:#1f2937;font-size:15px;" data-editable="step1-title">第一步标题</section>
        <section style="color:#6b7280;font-size:14px;line-height:1.6;margin-top:4px;" data-editable="step1-desc">详细说明第一步需要做的事情。</section>
      </section>
    </section>
    <section style="display:flex;align-items:flex-start;margin-bottom:16px;">
      <section style="width:32px;height:32px;background:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;flex-shrink:0;">2</section>
      <section style="margin-left:14px;flex:1;">
        <section style="font-weight:600;color:#1f2937;font-size:15px;" data-editable="step2-title">第二步标题</section>
        <section style="color:#6b7280;font-size:14px;line-height:1.6;margin-top:4px;" data-editable="step2-desc">详细说明第二步需要做的事情。</section>
      </section>
    </section>
    <section style="display:flex;align-items:flex-start;">
      <section style="width:32px;height:32px;background:#3b82f6;color:#fff;border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;flex-shrink:0;">3</section>
      <section style="margin-left:14px;flex:1;">
        <section style="font-weight:600;color:#1f2937;font-size:15px;" data-editable="step3-title">第三步标题</section>
        <section style="color:#6b7280;font-size:14px;line-height:1.6;margin-top:4px;" data-editable="step3-desc">详细说明第三步需要做的事情。</section>
      </section>
    </section>
  </section>`,
};
