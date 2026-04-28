import type { Material } from '../../types';

const patternBase = (chars: string, color: string, fontSize: string) =>
  `<section style="text-align:center;color:${color};font-size:${fontSize};letter-spacing:0.5em;margin:2em 0;line-height:1;">${chars}</section>`;

export const PATTERN_DIVIDERS: Material[] = [
  { id: 'divider-pattern-asterisk', kind: 'divider', category: 'divider-pattern',
    name: '星号', keywords: ['星号', '星星'],
    thumbnail: '<div style="text-align:center;color:#999;">✱ ✱ ✱</div>',
    html: patternBase('✱ ✱ ✱', '#9ca3af', '14px') },
  { id: 'divider-pattern-spade', kind: 'divider', category: 'divider-pattern',
    name: '黑桃', keywords: ['黑桃'],
    thumbnail: '<div style="text-align:center;color:#999;">❖</div>',
    html: patternBase('❖ ❖ ❖', '#6b7280', '14px') },
  { id: 'divider-pattern-triangle', kind: 'divider', category: 'divider-pattern',
    name: '三角', keywords: ['三角'],
    thumbnail: '<div style="text-align:center;color:#999;">▲ ▲ ▲</div>',
    html: patternBase('▲ ▲ ▲', '#9ca3af', '12px') },
  { id: 'divider-pattern-dots', kind: 'divider', category: 'divider-pattern',
    name: '圆点', keywords: ['圆点', '点'],
    thumbnail: '<div style="text-align:center;color:#999;">● ● ●</div>',
    html: patternBase('● ● ●', '#9ca3af', '8px') },
  { id: 'divider-pattern-flower', kind: 'divider', category: 'divider-pattern',
    name: '花朵', keywords: ['花', '花朵'],
    thumbnail: '<div style="text-align:center;color:#999;">✿</div>',
    html: patternBase('✿ ✿ ✿', '#d97706', '14px') },
  { id: 'divider-pattern-diamond', kind: 'divider', category: 'divider-pattern',
    name: '菱形', keywords: ['菱形'],
    thumbnail: '<div style="text-align:center;color:#999;">◆</div>',
    html: patternBase('◆ ◆ ◆', '#6b7280', '12px') },
];
