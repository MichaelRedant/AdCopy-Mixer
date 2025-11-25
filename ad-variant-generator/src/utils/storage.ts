import { FavoriteVariant, FormValues, HistoryEntry, Settings } from '../types';

const SETTINGS_KEY = 'acm_settings';
const FAVORITES_KEY = 'acm_favorites';
const HISTORY_KEY = 'acm_history';
const API_KEY_STORAGE = 'acm_runtime_key';
const PERFORMANCE_KEY = 'acm_performance';

export const loadSettings = (): Settings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    return {
      language: 'nl-BE',
      defaultPlatform: 'meta',
      defaultVibe: 'playful',
      nVariants: 4,
      defaultModel: 'gpt-4o-mini',
    };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<Settings>;
    return {
      language: parsed.language ?? 'nl-BE',
      defaultPlatform: parsed.defaultPlatform ?? 'meta',
      defaultVibe: parsed.defaultVibe ?? 'playful',
      nVariants: parsed.nVariants ?? 4,
      defaultModel: parsed.defaultModel ?? 'gpt-4o-mini',
    };
  } catch (error) {
    console.warn('Kon instellingen niet lezen, val terug op standaardwaarden.');
    return {
      language: 'nl-BE',
      defaultPlatform: 'meta',
      defaultVibe: 'playful',
      nVariants: 4,
      defaultModel: 'gpt-4o-mini',
    };
  }
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadFavorites = (): FavoriteVariant[] => {
  const stored = localStorage.getItem(FAVORITES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as FavoriteVariant[];
  } catch (error) {
    console.warn('Kon favorieten niet lezen.');
    return [];
  }
};

export const saveFavorites = (favorites: FavoriteVariant[]) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const loadHistory = (): HistoryEntry[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as HistoryEntry[];
  } catch (error) {
    console.warn('Kon geschiedenis niet lezen.');
    return [];
  }
};

export const saveHistory = (history: HistoryEntry[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const loadPerformanceMap = (): Record<string, import('../types').PerformanceMetrics> => {
  const stored = localStorage.getItem(PERFORMANCE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Record<string, import('../types').PerformanceMetrics>;
  } catch (error) {
    console.warn('Kon performance data niet lezen.');
    return {};
  }
};

export const savePerformanceMap = (performance: Record<string, import('../types').PerformanceMetrics>) => {
  localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(performance));
};

export const loadRuntimeKey = (): string | null => {
  return sessionStorage.getItem(API_KEY_STORAGE);
};

export const saveRuntimeKey = (key: string) => {
  sessionStorage.setItem(API_KEY_STORAGE, key);
};

export const clearRuntimeKey = () => {
  sessionStorage.removeItem(API_KEY_STORAGE);
};

export const findHistoryMatch = (history: HistoryEntry[], inputs: FormValues) => {
  return history.find(
    (entry) => JSON.stringify(entry.inputs) === JSON.stringify(inputs),
  );
};
