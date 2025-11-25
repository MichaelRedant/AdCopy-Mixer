import { AdVariant, Platform } from '../types';
import { PLATFORM_LIMITS } from './validation';
import { PerformanceMetrics } from '../types';

export type FieldCharInfo = {
  field: 'headline' | 'primaryText' | 'description';
  label: string;
  value: string;
  count: number;
  limit?: number;
  index?: number;
};

const POLICY_PATTERNS = {
  exaggeratedClaims: /\b(beste|gegarandeerd|nooit|altijd|altijd de beste|100%|perfect)\b/i,
  sensitiveCategories: /\b(gezondheid|medisch|therapie|verslaving|investering|crypto|aandelen|lening|schuld|inkomen|gewicht|afvallen|BMI|persoonlijk|religie|politiek)\b/i,
  caps: /[A-Z]{4,}/,
};

export const buildCharInfo = (variant: AdVariant): FieldCharInfo[] => {
  const limits = PLATFORM_LIMITS[variant.platform] || {};
  const result: FieldCharInfo[] = [];

  const primary = variant.primaryText || '';
  result.push({
    field: 'primaryText',
    label: 'Primary text',
    value: primary,
    count: primary.trim().length,
    limit: limits.primaryText,
  });

  const headlines = Array.isArray(variant.headline) ? variant.headline : [variant.headline];
  headlines.forEach((text, idx) => {
    result.push({
      field: 'headline',
      label: `Headline${headlines.length > 1 ? ` ${idx + 1}` : ''}`,
      value: text,
      count: text.trim().length,
      limit: limits.headline,
      index: idx,
    });
  });

  const desc = variant.description || '';
  result.push({
    field: 'description',
    label: 'Description',
    value: desc,
    count: desc.trim().length,
    limit: limits.description,
  });

  return result;
};

export const getCtaDiversityHint = (variants: AdVariant[]): string | undefined => {
  const unique = new Set(
    variants
      .map((v) => v.cta?.trim().toLowerCase())
      .filter((cta): cta is string => Boolean(cta)),
  );
  if (unique.size > 3) {
    return `Je gebruikt nu ${unique.size} verschillende CTA's; beperk tot 1-2 voor consistentie.`;
  }
  if (unique.size > 2) {
    return `Je gebruikt nu ${unique.size} CTA's; probeer maximaal 2 per set.`;
  }
  return undefined;
};

export const getPolicyWarnings = (variant: AdVariant): string[] => {
  const textBlob = [
    variant.headline,
    variant.primaryText,
    variant.description,
    variant.notes,
  ]
    .flat()
    .filter(Boolean)
    .join(' ');

  const warnings: string[] = [];
  if (POLICY_PATTERNS.exaggeratedClaims.test(textBlob)) {
    warnings.push('Let op claims: vermijd woorden als "beste", "gegarandeerd", "nooit", "altijd".');
  }
  if (POLICY_PATTERNS.sensitiveCategories.test(textBlob)) {
    warnings.push('Gevoelige categorie gedetecteerd (gezondheid/geld/persoonlijke kenmerken): hou copy voorzichtig en feitelijk.');
  }
  if (POLICY_PATTERNS.caps.test(textBlob)) {
    warnings.push('Caps lock waarschuwing: vermijd woorden in volledig hoofdletters.');
  }
  return warnings;
};

type FeatureCheck = (variant: AdVariant) => boolean;

const featureChecks: { key: string; label: string; check: FeatureCheck }[] = [
  { key: 'numbers', label: 'cijfer + concreet resultaat', check: (v) => /\d/.test([v.headline, v.primaryText].join(' ')) },
  {
    key: 'socialProof',
    label: 'social proof',
    check: (v) => /\b(klant|klanten|reviews|beoordelingen|\+[\d])/i.test([v.headline, v.primaryText, v.description].join(' ')),
  },
  {
    key: 'urgency',
    label: 'urgency',
    check: (v) => /\b(nu|vandaag|morgen|tijdelijk|laatste|slot|deadline)\b/i.test([v.headline, v.primaryText].join(' ')),
  },
  {
    key: 'actionVerb',
    label: 'sterke CTA werkwoorden',
    check: (v) => /\b(start|probeer|download|claim|boek|ontvang)\b/i.test([v.primaryText, v.description, v.cta].join(' ')),
  },
];

export const computePerformanceInsights = (
  variants: AdVariant[],
  performance: Record<string, PerformanceMetrics>,
): string[] => {
  const entries = variants
    .map((variant) => {
      const perf = performance[variant.id];
      return perf && (perf.ctr || perf.roas || perf.cvr || perf.cpa) ? { variant, perf } : null;
    })
    .filter((e): e is { variant: AdVariant; perf: PerformanceMetrics } => Boolean(e));

  if (entries.length < 2) return [];

  const insights: string[] = [];
  const overallCtr =
    entries.reduce((sum, { perf }) => sum + (perf.ctr ?? 0), 0) / entries.filter((e) => e.perf.ctr !== undefined).length || 0;

  featureChecks.forEach((feat) => {
    const withFeat = entries.filter(({ variant }) => feat.check(variant) && (variant.headline || variant.primaryText));
    const withoutFeat = entries.filter(({ variant }) => !feat.check(variant));
    if (withFeat.length >= 1 && withoutFeat.length >= 1) {
      const avgWith = withFeat.reduce((sum, { perf }) => sum + (perf.ctr ?? 0), 0) / withFeat.length;
      const avgWithout = withoutFeat.reduce((sum, { perf }) => sum + (perf.ctr ?? 0), 0) / withoutFeat.length;
      if (avgWith > 0 && avgWithout > 0) {
        const lift = ((avgWith - avgWithout) / avgWithout) * 100;
        if (lift >= 5) {
          insights.push(`Varianten met ${feat.label} scoren ~${lift.toFixed(1)}% hogere CTR (gem. ${avgWith.toFixed(2)}% vs ${avgWithout.toFixed(2)}%).`);
        }
      }
    }
  });

  if (overallCtr > 0) {
    const top = entries
      .filter(({ perf }) => perf.ctr !== undefined)
      .sort((a, b) => (b.perf.ctr ?? 0) - (a.perf.ctr ?? 0))[0];
    if (top) {
      insights.unshift(
        `Beste CTR: ${top.perf.ctr?.toFixed(2)}% - hook: "${Array.isArray(top.variant.headline) ? top.variant.headline[0] : top.variant.headline}".`,
      );
    }
  }

  return insights.slice(0, 4);
};
