import type { Material, MaterialCategory, MaterialKind } from './types';
import { MINIMAL_DIVIDERS } from './categories/dividers/minimal';
import { PATTERN_DIVIDERS } from './categories/dividers/pattern';
import { GRADIENT_DIVIDERS } from './categories/dividers/gradient';
import { DECORATION_DIVIDERS } from './categories/dividers/decoration';
import { InfoBoxTemplate } from './categories/templates/infoBox';
import { QuoteCardTemplate } from './categories/templates/quoteCard';
import { HighlightTemplate } from './categories/templates/highlight';
import { CtaTemplate } from './categories/templates/cta';
import { QrCodeTemplate } from './categories/templates/qrCode';
import { AuthorCardTemplate } from './categories/templates/authorCard';
import { FollowCtaTemplate } from './categories/templates/followCta';
import { ArticleEndTemplate } from './categories/templates/articleEnd';

const allDividers = [...MINIMAL_DIVIDERS, ...PATTERN_DIVIDERS, ...GRADIENT_DIVIDERS, ...DECORATION_DIVIDERS];
const allTemplates = [InfoBoxTemplate, QuoteCardTemplate, HighlightTemplate, CtaTemplate, QrCodeTemplate, AuthorCardTemplate, FollowCtaTemplate, ArticleEndTemplate];

export const allMaterials: Material[] = [...allDividers, ...allTemplates];

export function getMaterialsByCategory(category: MaterialCategory): Material[] {
  return allMaterials.filter((m) => m.category === category);
}

export function getMaterialsByKind(kind: MaterialKind): Material[] {
  return allMaterials.filter((m) => m.kind === kind);
}

export function searchMaterials(query: string): Material[] {
  if (!query.trim()) return allMaterials;
  const q = query.toLowerCase();
  return allMaterials.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.keywords.some((k) => k.toLowerCase().includes(q))
  );
}
