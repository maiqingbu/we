import type { Material } from '../../types';

export const QrCodeTemplate: Material = {
  id: 'template-qrcode',
  kind: 'template', category: 'template-qrcode',
  name: '二维码卡', keywords: ['二维码', '关注'],
  thumbnail: '<div style="background:white;border:1px solid #e5e7eb;padding:6px;text-align:center;font-size:8px;"><div style="background:#000;width:24px;height:24px;margin:0 auto;"></div>长按识别</div>',
  html: `<section data-template-id="qrcode" style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:20px;text-align:center;margin:1.5em 0;max-width:240px;margin-left:auto;margin-right:auto;">
    <img src="https://placehold.co/160x160/000/fff?text=QR" alt="二维码" data-editable-img style="width:160px;height:160px;display:block;margin:0 auto 12px;" />
    <section style="color:#374151;font-size:14px;font-weight:500;" data-editable="title">长按识别二维码</section>
    <section style="color:#9ca3af;font-size:12px;margin-top:4px;" data-editable="subtitle">关注我们获取更多内容</section>
  </section>`,
};
