import type { Material, MaterialCategory, MaterialKind, FestivalMeta } from './types';
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
import { SpringFestivalMaterials } from './categories/festivals/spring';
import { MidAutumnMaterials } from './categories/festivals/midAutumn';
import { ChristmasMaterials } from './categories/festivals/christmas';
import { QixiMaterials } from './categories/festivals/qixi';
import { NationalMaterials } from './categories/festivals/national';

const allDividers = [...MINIMAL_DIVIDERS, ...PATTERN_DIVIDERS, ...GRADIENT_DIVIDERS, ...DECORATION_DIVIDERS];
const allTemplates = [InfoBoxTemplate, QuoteCardTemplate, HighlightTemplate, CtaTemplate, QrCodeTemplate, AuthorCardTemplate, FollowCtaTemplate, ArticleEndTemplate];
const allFestivals = [...SpringFestivalMaterials, ...MidAutumnMaterials, ...ChristmasMaterials, ...QixiMaterials, ...NationalMaterials];

export const allMaterials: Material[] = [...allDividers, ...allTemplates, ...allFestivals];

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
      m.keywords.some((k) => k.toLowerCase().includes(q)) ||
      (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
  );
}

/** 获取所有节日素材的元数据（去重） */
export function getAllFestivals(): FestivalMeta[] {
  const map = new Map<string, FestivalMeta>();
  for (const m of allFestivals) {
    if (m.festival && !map.has(m.festival.name)) {
      map.set(m.festival.name, m.festival);
    }
  }
  return Array.from(map.values());
}
