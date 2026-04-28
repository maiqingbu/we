import type { Material } from '../../types';

export const GRADIENT_DIVIDERS: Material[] = [
  { id: 'divider-gradient-lr', kind: 'divider', category: 'divider-gradient',
    name: '左右渐变', keywords: ['渐变', '左右'],
    thumbnail: '<div style="height:2px;background:linear-gradient(to right,transparent,#999,transparent);"></div>',
    html: '<hr style="border:0;height:2px;background:linear-gradient(to right,transparent,#9ca3af 50%,transparent);margin:2em 0;" />' },
  { id: 'divider-gradient-center', kind: 'divider', category: 'divider-gradient',
    name: '中心渐变', keywords: ['中心', '渐变'],
    thumbnail: '<div style="height:2px;background:radial-gradient(ellipse at center,#999,transparent 70%);"></div>',
    html: '<hr style="border:0;height:2px;background:radial-gradient(ellipse at center,#6b7280,transparent 70%);margin:2em 0;" />' },
  { id: 'divider-gradient-dual', kind: 'divider', category: 'divider-gradient',
    name: '双色渐变', keywords: ['双色', '蓝紫'],
    thumbnail: '<div style="height:2px;background:linear-gradient(to right,#3b82f6,#a855f7);"></div>',
    html: '<hr style="border:0;height:2px;background:linear-gradient(to right,#3b82f6,#a855f7);margin:2em 0;" />' },
  { id: 'divider-gradient-triple', kind: 'divider', category: 'divider-gradient',
    name: '三色渐变', keywords: ['三色', '彩虹'],
    thumbnail: '<div style="height:2px;background:linear-gradient(to right,#f59e0b,#ef4444,#8b5cf6);"></div>',
    html: '<hr style="border:0;height:2px;background:linear-gradient(to right,#f59e0b,#ef4444,#8b5cf6);margin:2em 0;" />' },
];
