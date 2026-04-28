export type MaterialCategory =
  | 'divider-minimal' | 'divider-pattern' | 'divider-gradient' | 'divider-decoration'
  | 'template-info' | 'template-quote' | 'template-highlight'
  | 'template-cta' | 'template-qrcode' | 'template-author'
  | 'template-follow' | 'template-end';

export type MaterialKind = 'divider' | 'template';

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
}

export interface MaterialVariant {
  id: string;
  name: string;
  html: string;
}
