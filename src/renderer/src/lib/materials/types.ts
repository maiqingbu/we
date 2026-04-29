export type MaterialCategory =
  | 'divider-minimal' | 'divider-pattern' | 'divider-gradient' | 'divider-decoration'
  | 'template-info' | 'template-quote' | 'template-highlight'
  | 'template-cta' | 'template-qrcode' | 'template-author'
  | 'template-follow' | 'template-end'
  | 'template-qa' | 'template-compare' | 'template-steps'
  | 'template-stats' | 'template-key-points' | 'template-warning'
  | 'template-testimonial' | 'template-list' | 'template-toc'
  | 'festival-spring' | 'festival-midautumn' | 'festival-christmas'
  | 'festival-qixi' | 'festival-national'
  | 'svg-decor' | 'svg-icon' | 'svg-badge';

export type MaterialKind = 'divider' | 'template' | 'festival' | 'snippet' | 'svg';

/** 自定义素材类型（snippet = 自由插入, template = 锁定样式, divider = 分割线, columns = 分栏布局） */
export type CustomMaterialKind = 'snippet' | 'template' | 'divider' | 'columns';

/** 节日信息 */
export interface FestivalMeta {
  /** 节日名称，如"春节"、"中秋节" */
  name: string;
  /** 公历月份（1-12），固定日期的节日 */
  month?: number;
  /** 公历日期，固定日期的节日 */
  day?: number;
  /** 农历月份（1-12），农历节日 */
  lunarMonth?: number;
  /** 农历日期，农历节日 */
  lunarDay?: number;
  /** 节日主题色 */
  color: string;
  /** 节日图标 */
  icon: string;
}

export interface Material {
  id: string;
  kind: MaterialKind;
  category: MaterialCategory;
  name: string;
  keywords: string[];
  thumbnail: string;
  html: string;
  variants?: MaterialVariant[];
  tags?: string[];
  /** 节日元数据，仅 kind='festival' 时有值 */
  festival?: FestivalMeta;
}

export interface MaterialVariant {
  id: string;
  name: string;
  html: string;
}
