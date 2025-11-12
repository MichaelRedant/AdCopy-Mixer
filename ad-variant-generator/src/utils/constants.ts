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
  verplicht: '',
  platform: 'meta',
  vibe: 'playful',
  doel: 'CTR',
  taal: 'nl-BE',
  regio: 'België',
  variantCount: 4,
  model: 'gpt-4o-mini',
};

export const MODEL_OPTIONS: { value: GptModel; label: string; description: string }[] = [
  {
    value: 'gpt-4o-mini',
    label: 'GPT-4o mini',
    description: 'Snel en voordelig – ideaal voor snelle iteraties en concepten.',
  },
  {
    value: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Sterker in nuance en kwaliteit – gebruik voor kritieke campagnes.',
  },
  {
    value: 'gpt-4.1-mini',
    label: 'GPT-4.1 mini',
    description: 'Biedt balans tussen snelheid en creativiteit met recente data.',
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
