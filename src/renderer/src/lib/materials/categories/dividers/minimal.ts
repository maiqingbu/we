import type { Material } from '../../types';

export const MINIMAL_DIVIDERS: Material[] = [
  {
    id: 'divider-minimal-solid',
    kind: 'divider', category: 'divider-minimal',
    name: '单实线', keywords: ['实线', '直线', 'solid'],
    thumbnail: '<div style="width:100%;height:1px;background:#999;"></div>',
    html: '<hr style="border:0;height:1px;background:#d1d5db;margin:2em 0;" />',
  },
  {
    id: 'divider-minimal-dashed',
    kind: 'divider', category: 'divider-minimal',
    name: '虚线', keywords: ['虚线', 'dashed'],
    thumbnail: '<div style="border-top:1px dashed #999;"></div>',
    html: '<hr style="border:0;border-top:1px dashed #9ca3af;height:0;margin:2em 0;" />',
  },
  {
    id: 'divider-minimal-dotted',
    kind: 'divider', category: 'divider-minimal',
    name: '点线', keywords: ['点线', 'dotted'],
    thumbnail: '<div style="border-top:2px dotted #999;"></div>',
    html: '<hr style="border:0;border-top:2px dotted #9ca3af;height:0;margin:2em 0;" />',
  },
  {
    id: 'divider-minimal-double',
    kind: 'divider', category: 'divider-minimal',
    name: '双实线', keywords: ['双线', 'double'],
    thumbnail: '<div style="border-top:1px solid #999;border-bottom:1px solid #999;height:3px;"></div>',
    html: '<hr style="border:0;border-top:1px solid #9ca3af;border-bottom:1px solid #9ca3af;height:3px;margin:2em 0;" />',
  },
];
