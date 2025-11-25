import { AdVariant } from '../types';

const contains = (variant: AdVariant, pattern: RegExp) =>
  pattern.test(
    [variant.headline, variant.primaryText, variant.description, variant.notes].flat().filter(Boolean).join(' '),
  );

const SOCIAL_PROOF = /\b(\+?\d{2,}|\d+%|reviews?|beoordelingen|klanten|gebruikers|cases)\b/i;
const URGENCY = /\b(nu|vandaag|morgen|tijdelijk|laatste|slots?|deadline|op=op|beperkt)\b/i;
const CTA_VERB = /\b(koop|bestel|start|probeer|download|claim|boek|vraag|plan)\b/i;
const COMPETITOR = /\b(oude tool|alternatief|vs|beter dan|switch|overstappen)\b/i;
const EFFICIENCY = /\b(sneller|minder tijd|automatisch|efficiënt|efficiency|bespaar tijd)\b/i;

export interface ChecklistResult {
  hooks: number;
  socialProof: number;
  urgency: number;
  ctaVariants: number;
  angleSignals: number;
}

export const computeVariantChecklist = (variants: AdVariant[]): ChecklistResult => {
  const hooks = variants.reduce((sum, v) => {
    if (Array.isArray(v.headline)) return sum + v.headline.length;
    return sum + (v.headline ? 1 : 0);
  }, 0);

  const socialProof = variants.filter((v) => contains(v, SOCIAL_PROOF)).length;
  const urgency = variants.filter((v) => contains(v, URGENCY)).length;
  const ctaVariants = new Set(variants.map((v) => v.cta?.toLowerCase().trim()).filter(Boolean)).size;

  const angleSignals = new Set<string>();
  variants.forEach((v) => {
    if (contains(v, SOCIAL_PROOF)) angleSignals.add('socialProof');
    if (contains(v, COMPETITOR)) angleSignals.add('competitor');
    if (contains(v, URGENCY)) angleSignals.add('fomo');
    if (contains(v, EFFICIENCY)) angleSignals.add('efficiency');
  });

  return { hooks, socialProof, urgency, ctaVariants, angleSignals: angleSignals.size };
};
