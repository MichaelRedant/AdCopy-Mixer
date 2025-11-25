import { FormValues, GptModel, VibePreset } from '../types';

export const VIBE_COLORS: Record<VibePreset, string> = {
  playful: '#ff9b73',
  urgent: '#ff4d4f',
  luxe: '#c5a359',
  betrouwbaar: '#2f80ed',
  rebels: '#f55151',
  minimal: '#2d3436',
  'warm-menselijk': '#f2994a',
  'no-nonsense': '#6c5ce7',
  premium: '#b49bff',
};

export const DEFAULT_FORM_VALUES: FormValues = {
  bedrijf: '',
  product: '',
  doelgroep: '',
  usp: '',
  diff: '',
  bezwaren: '',
  tone: '',
  persona: '',
  verplicht: '',
  campaignGoal: 'awareness',
  actionGoal: 'click',
  audienceTemperature: 'cold',
  coreOffer: '',
  platform: 'meta',
  adFormat: 'text',
  assetDescription: '',
  vibe: 'playful',
  taal: 'nl-BE',
  regio: 'Belgie',
  variantCount: 4,
  model: 'gpt-4o-mini',
};

export const MODEL_OPTIONS: { value: GptModel; label: string; description: string }[] = [
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o mini',
    description: 'Snel en voordelig - ideaal voor snelle iteraties en concepten.',
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Sterker in nuance en kwaliteit - gebruik voor kritieke campagnes.',
  },
  {
    value: 'gpt-4.1-mini',
    label: 'GPT-4.1 mini',
    description: 'Biedt balans tussen snelheid en creativiteit met recente data.',
  },
  {
    value: 'gpt-5.0',
    label: 'GPT-5.0',
    description: 'Precisie en consistentie voor brand safety en strakkere tone-of-voice.',
  },
  {
    value: 'gpt-5.1',
    label: 'GPT-5.1',
    description: 'Meest recente generatie met sterkere reasoning voor campagne-optimalisatie.',
  },
  {
    value: 'gpt-5',
    label: 'GPT-5',
    description: 'Meest geavanceerde taalgevoel en nuance voor veeleisende campagnes.',
  },
];

export const VIBE_OPTIONS: { value: VibePreset; label: string }[] = [
  { value: 'playful', label: 'Playful' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'luxe', label: 'Premium Luxe' },
  { value: 'betrouwbaar', label: 'Betrouwbaar' },
  { value: 'rebels', label: 'Rebels' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'warm-menselijk', label: 'Warm & Menselijk' },
  { value: 'no-nonsense', label: 'No-nonsense' },
  { value: 'premium', label: 'Premium' },
];

export const CAMPAIGN_GOAL_OPTIONS = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'consideration', label: 'Consideration' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'retention', label: 'Retention' },
];

export const ACTION_GOAL_OPTIONS = [
  { value: 'click', label: 'Klik' },
  { value: 'lead', label: 'Lead' },
  { value: 'trial', label: 'Trial' },
  { value: 'demo', label: 'Demo' },
  { value: 'purchase', label: 'Purchase' },
];

export const AUDIENCE_TEMPERATURE_OPTIONS = [
  { value: 'cold', label: 'Koud' },
  { value: 'warm', label: 'Warm' },
  { value: 'existing', label: 'Bestaande klanten' },
];
