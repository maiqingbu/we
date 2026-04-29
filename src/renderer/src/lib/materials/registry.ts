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
import { QaCardTemplate } from './categories/templates/qaCard';
import { ProsConsTemplate } from './categories/templates/prosCons';
import { StepsTemplate } from './categories/templates/steps';
import { StatsCardTemplate } from './categories/templates/statsCard';
import { KeyPointsTemplate } from './categories/templates/keyPoints';
import { WarningBoxTemplate } from './categories/templates/warningBox';
import { TestimonialTemplate } from './categories/templates/testimonial';
import { NumberedListTemplate } from './categories/templates/numberedList';
import { PullQuoteTemplate } from './categories/templates/pullQuote';
import { TocTemplate } from './categories/templates/toc';
import { SpringFestivalMaterials } from './categories/festivals/spring';
import { MidAutumnMaterials } from './categories/festivals/midAutumn';
import { ChristmasMaterials } from './categories/festivals/christmas';
import { QixiMaterials } from './categories/festivals/qixi';
import { NationalMaterials } from './categories/festivals/national';
import { SVG_DECORATIONS } from './categories/svg/decorations';
import { SVG_ICONS } from './categories/svg/icons';
import { SVG_BADGES } from './categories/svg/badges';

const allDividers = [...MINIMAL_DIVIDERS, ...PATTERN_DIVIDERS, ...GRADIENT_DIVIDERS, ...DECORATION_DIVIDERS];
const allTemplates = [InfoBoxTemplate, QuoteCardTemplate, HighlightTemplate, CtaTemplate, QrCodeTemplate, AuthorCardTemplate, FollowCtaTemplate, ArticleEndTemplate, QaCardTemplate, ProsConsTemplate, StepsTemplate, StatsCardTemplate, KeyPointsTemplate, WarningBoxTemplate, TestimonialTemplate, NumberedListTemplate, PullQuoteTemplate, TocTemplate];
const allFestivals = [...SpringFestivalMaterials, ...MidAutumnMaterials, ...ChristmasMaterials, ...QixiMaterials, ...NationalMaterials];
const allSvgs = [...SVG_DECORATIONS, ...SVG_ICONS, ...SVG_BADGES];

export const allMaterials: Material[] = [...allDividers, ...allTemplates, ...allFestivals, ...allSvgs];

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
