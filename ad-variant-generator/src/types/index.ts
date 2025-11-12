export type Platform = 'meta' | 'google' | 'linkedin' | 'x' | 'instagram';

export type GptModel = 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4.1-mini' | 'gpt-5';

export interface MetricDetail {
  score: number;
  tip: string;
}

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
  bedrijf: string;
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
  model: GptModel;
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
  clarity: MetricDetail;
  emotion: MetricDetail;
  distinctiveness: MetricDetail;
  ctaStrength: MetricDetail;
  total: number;
  summary: string;
  overallTip: string;
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
  defaultModel: GptModel;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
