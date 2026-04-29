import type { Material } from '../../types';

export const StatsCardTemplate: Material = {
  id: 'template-stats',
  kind: 'template', category: 'template-stats',
  name: '数据统计卡', keywords: ['数据', '统计', '数字', '指标'],
  thumbnail: '<div style="font-size:8px;display:flex;gap:4px;text-align:center;"><div style="flex:1;background:#eff6ff;padding:3px;border-radius:3px;"><b>100</b><br>指标</div><div style="flex:1;background:#f0fdf4;padding:3px;border-radius:3px;"><b>99%</b><br>指标</div></div>',
  html: `<section data-template-id="stats" style="display:flex;gap:12px;margin:1.5em 0;text-align:center;">
    <section style="flex:1;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:10px;padding:18px 12px;">
      <section style="font-size:28px;font-weight:800;color:#2563eb;" data-editable="stat1-num">100+</section>
      <section style="font-size:13px;color:#6b7280;margin-top:6px;" data-editable="stat1-label">指标名称</section>
    </section>
    <section style="flex:1;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:10px;padding:18px 12px;">
      <section style="font-size:28px;font-weight:800;color:#16a34a;" data-editable="stat2-num">99%</section>
      <section style="font-size:13px;color:#6b7280;margin-top:6px;" data-editable="stat2-label">指标名称</section>
    </section>
    <section style="flex:1;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px;padding:18px 12px;">
      <section style="font-size:28px;font-weight:800;color:#d97706;" data-editable="stat3-num">No.1</section>
      <section style="font-size:13px;color:#6b7280;margin-top:6px;" data-editable="stat3-label">指标名称</section>
    </section>
  </section>`,
};
