export type Platform = 'meta' | 'google' | 'linkedin' | 'x' | 'instagram' | 'youtube';

export type AdFormat = 'text' | 'image' | 'carousel' | 'video';

export type GptModel =
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'gpt-4.1-mini'
  | 'gpt-5'
  | 'gpt-5.0'
  | 'gpt-5.1';

export interface MetricDetail {
  score: number;
  tip: string;
}

export interface PerformanceMetrics {
  ctr?: number;
  cvr?: number;
  cpa?: number;
  roas?: number;
}

export type ScoreMetricKey =
  | 'relevance'
  | 'clarity'
  | 'valueProposition'
  | 'emotionHook'
  | 'ctaPower'
  | 'platformFit'
  | 'originality';

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

export type CampaignGoal = 'awareness' | 'consideration' | 'conversion' | 'retention';
export type ActionGoal = 'click' | 'lead' | 'trial' | 'demo' | 'purchase';
export type AudienceTemperature = 'cold' | 'warm' | 'existing';

export interface FormValues {
  bedrijf: string;
  product: string;
  doelgroep: string;
  usp: string;
  diff: string;
  bezwaren: string;
  tone: string;
  persona: string;
  verplicht: string;
  campaignGoal: CampaignGoal;
  actionGoal: ActionGoal;
  audienceTemperature: AudienceTemperature;
  coreOffer: string;
  platform: Platform;
  adFormat: AdFormat;
  assetDescription: string;
  vibe: VibePreset;
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
  relevance: MetricDetail;
  clarity: MetricDetail;
  valueProposition: MetricDetail;
  emotionHook: MetricDetail;
  ctaPower: MetricDetail;
  platformFit: MetricDetail;
  originality: MetricDetail;
  total: number; // 0-100
  summary: string;
  overallTip: string;
  updatedAt: number;
}

export interface VariantWithMeta {
  variant: AdVariant;
  warnings: string[];
  score?: VariantScore;
  isScoring: boolean;
  performance?: PerformanceMetrics;
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
  result: { variants: AdVariant[]; advice?: string; architecture?: CampaignArchitecture };
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

export interface CampaignArchitecture {
  hooks: {
    problems: string[];
    dreams: string[];
    objections: string[];
    urgency: string[];
  };
  propositions: {
    usps: string[];
    rtbs: string[];
    socialProofs: string[];
  };
  angles: {
    painFirst: string[];
    dreamFirst: string[];
    proofFirst: string[];
    objectionFirst: string[];
  };
}

export interface CampaignBlueprint {
  meta: {
    primaryTexts: string[];
    headlines: string[];
    descriptions: string[];
    retargeting: AdVariant;
    conversion: AdVariant;
  };
  google: {
    headlines: string[];
    descriptions: string[];
    callouts: string[];
    sitelinks: string[];
    callExtension: string;
  };
}
