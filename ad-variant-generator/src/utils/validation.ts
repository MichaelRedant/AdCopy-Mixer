import { AdVariant, Platform } from '../types';

const PLATFORM_LIMITS: Record<Platform, Partial<Record<'headline' | 'primaryText' | 'description', number>>> = {
  meta: { primaryText: 125, headline: 40, description: 30 },
  google: { headline: 30, description: 90 },
  linkedin: { primaryText: 150, headline: 70 },
  x: { primaryText: 280 },
  instagram: { primaryText: 125, headline: 40 },
};

const LABELS: Record<Platform, string> = {
  meta: 'Meta',
  google: 'Google Ads',
  linkedin: 'LinkedIn',
  x: 'X',
  instagram: 'Instagram',
};

const characters = (value: string) => value.trim().length;

export const getLengthWarnings = (variant: AdVariant): string[] => {
  const limits = PLATFORM_LIMITS[variant.platform];
  if (!limits) return [];

  const warnings: string[] = [];
  if (limits.primaryText !== undefined && characters(variant.primaryText) > limits.primaryText) {
    warnings.push(`${LABELS[variant.platform]}: primary text > ${limits.primaryText} tekens.`);
  }

  const headlines = Array.isArray(variant.headline) ? variant.headline : [variant.headline];
  if (limits.headline !== undefined) {
    headlines.forEach((headline, index) => {
      if (characters(headline) > limits.headline!) {
        const label = Array.isArray(variant.headline) ? `headline ${index + 1}` : 'headline';
        warnings.push(`${LABELS[variant.platform]}: ${label} > ${limits.headline} tekens.`);
      }
    });
  }

  if (limits.description !== undefined && characters(variant.description) > limits.description) {
    warnings.push(`${LABELS[variant.platform]}: description > ${limits.description} tekens.`);
  }

  return warnings;
};
