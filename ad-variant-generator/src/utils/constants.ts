import { FormValues, VibePreset } from '../types';

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
};

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
