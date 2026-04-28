import type { Material } from '../../types';

export const DECORATION_DIVIDERS: Material[] = [
  { id: 'divider-deco-wave', kind: 'divider', category: 'divider-decoration',
    name: '波浪', keywords: ['波浪'],
    thumbnail: '<div style="text-align:center;color:#999;">～～～</div>',
    html: '<section style="text-align:center;color:#9ca3af;font-size:18px;letter-spacing:0.3em;margin:2em 0;line-height:1;">～～～～～</section>' },
  { id: 'divider-deco-double-thin', kind: 'divider', category: 'divider-decoration',
    name: '细双线', keywords: ['双线'],
    thumbnail: '<div><div style="border-top:1px solid #999;"></div><div style="border-top:1px solid #999;margin-top:3px;"></div></div>',
    html: '<section style="margin:2em 0;"><div style="border-top:1px solid #d1d5db;"></div><div style="border-top:1px solid #d1d5db;margin-top:4px;"></div></section>' },
  { id: 'divider-deco-line-dot', kind: 'divider', category: 'divider-decoration',
    name: '带圆点横线', keywords: ['圆点', '横线'],
    thumbnail: '<div style="display:flex;align-items:center;justify-content:center;"><div style="flex:1;border-top:1px solid #999;"></div><div style="width:6px;height:6px;background:#999;border-radius:50%;margin:0 8px;"></div><div style="flex:1;border-top:1px solid #999;"></div></div>',
    html: '<section style="display:flex;align-items:center;justify-content:center;margin:2em 0;"><div style="flex:1;border-top:1px solid #9ca3af;"></div><div style="width:8px;height:8px;background:#9ca3af;border-radius:50%;margin:0 12px;"></div><div style="flex:1;border-top:1px solid #9ca3af;"></div></section>' },
  { id: 'divider-deco-up-down', kind: 'divider', category: 'divider-decoration',
    name: '上下细线', keywords: ['上下', '细线'],
    thumbnail: '<div style="height:6px;border-top:1px solid #999;border-bottom:1px solid #999;"></div>',
    html: '<section style="height:8px;border-top:1px solid #9ca3af;border-bottom:1px solid #9ca3af;margin:2em 0;"></section>' },
  { id: 'divider-deco-zigzag', kind: 'divider', category: 'divider-decoration',
    name: '锯齿状', keywords: ['锯齿'],
    thumbnail: '<div style="text-align:center;color:#999;letter-spacing:-2px;">∧∧∧</div>',
    html: '<section style="text-align:center;color:#9ca3af;font-size:14px;letter-spacing:-2px;margin:2em 0;line-height:1;">∧∧∧∧∧∧∧∧∧∧∧</section>' },
];
