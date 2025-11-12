export type Platform = 'meta' | 'google' | 'linkedin' | 'x' | 'instagram';

export type VibePreset =
  | 'playful'
  | 'urgent'
  | 'luxe'
  | 'betrouwbaar'
  | 'rebels'
  | 'minimal'
  | 'warm-menselijk'
  | 'no-nonsense'
  | 'premium';

export type RemixIntent =
  | 'scherper'
  | 'korter'
  | 'krachtiger'
  | 'informeler'
  | 'meer premium';

export interface FormValues {
  product: string;
  doelgroep: string;
  usp: string;
  diff: string;
  bezwaren: string;
  tone: string;
  verplicht: string;
  platform: Platform;
  vibe: VibePreset;
  doel: 'CTR' | 'conversie' | 'awareness';
  taal: string;
  regio: string;
  variantCount: number;
}

export interface AdVariant {
  id: string;
  platform: Platform;
  headline: string | string[];
  primaryText: string;
  description: string;
  cta: string;
  notes?: string;
}

export interface VariantScore {
  clarity: number;
  emotion: number;
  distinctiveness: number;
  ctaStrength: number;
  total: number;
  tip: string;
  updatedAt: number;
}

export interface VariantWithMeta {
  variant: AdVariant;
  warnings: string[];
  score?: VariantScore;
  isScoring: boolean;
}

export interface FavoriteVariant {
  id: string;
  campaign: string;
  timestamp: number;
  platform: Platform;
  vibe: VibePreset;
  variant: AdVariant;
}

export interface HistoryEntry {
  id: string;
  inputs: FormValues;
  result: { variants: AdVariant[]; advice?: string };
}

export interface Settings {
  language: string;
  defaultPlatform: Platform;
  defaultVibe: VibePreset;
  nVariants: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
