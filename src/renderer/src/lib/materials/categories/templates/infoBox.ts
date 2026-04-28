import type { Material } from '../../types';

const infoBoxHtml = (icon: string, title: string, content: string, color: string, bg: string) =>
  `<section data-template-id="info-${icon}" style="background:${bg};border-left:4px solid ${color};padding:16px 20px;margin:1.5em 0;border-radius:0 6px 6px 0;">
    <section style="font-weight:600;color:${color};margin-bottom:8px;font-size:15px;">${icon} <span data-editable="title">${title}</span></section>
    <section style="color:#374151;line-height:1.7;" data-editable="content">${content}</section>
  </section>`;

export const InfoBoxTemplate: Material = {
  id: 'template-info-box',
  kind: 'template', category: 'template-info',
  name: '信息盒', keywords: ['信息', '提示', '注意', '重点'],
  thumbnail: '<div style="background:#dbeafe;border-left:3px solid #3b82f6;padding:6px;font-size:9px;">💡 提示<br>内容...</div>',
  html: infoBoxHtml('💡', '提示', '这里写提示内容...', '#3b82f6', '#eff6ff'),
  variants: [
    { id: 'tip', name: '💡 提示', html: infoBoxHtml('💡', '提示', '这里写提示内容...', '#3b82f6', '#eff6ff') },
    { id: 'warn', name: '⚠ 注意', html: infoBoxHtml('⚠', '注意', '这里写注意事项...', '#d97706', '#fef3c7') },
    { id: 'pin', name: '📌 重点', html: infoBoxHtml('📌', '重点', '这里写重点内容...', '#dc2626', '#fee2e2') },
  ],
};
