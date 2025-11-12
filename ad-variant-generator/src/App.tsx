import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import FormPanel from './components/FormPanel';
import ToastContainer from './components/ToastContainer';
import Toolbar from './components/Toolbar';
import VariantCard from './components/VariantCard';
import { useToasts } from './hooks/useToasts';
import { remixVariant, scoreVariant, generateVariants } from './services/chatgpt';
import {
  FavoriteVariant,
  FormValues,
  HistoryEntry,
  RemixIntent,
  VariantWithMeta,
} from './types';
import { DEFAULT_FORM_VALUES, VIBE_COLORS } from './utils/constants';
import { getLengthWarnings } from './utils/validation';
import {
  findHistoryMatch,
  loadFavorites,
  loadHistory,
  loadSettings,
  saveFavorites,
  saveHistory,
  saveSettings,
} from './utils/storage';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(DEFAULT_FORM_VALUES);
  const [variants, setVariants] = useState<VariantWithMeta[]>([]);
  const [favorites, setFavorites] = useState<FavoriteVariant[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [advice, setAdvice] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFavoritesOpen, setFavoritesOpen] = useState(false);
  const [needsReformat, setNeedsReformat] = useState(false);
  const [lastInputs, setLastInputs] = useState<FormValues | null>(null);

  const { toasts, pushToast, removeToast } = useToasts();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const settings = loadSettings();
    const favs = loadFavorites();
    const hist = loadHistory();
    setFormValues((values) => ({
      ...values,
      taal: settings.language,
      platform: settings.defaultPlatform,
      vibe: settings.defaultVibe,
      variantCount: settings.nVariants,
    }));
    setFavorites(favs);
    setHistory(hist);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveHistory(history);
  }, [history]);

  const accentColor = useMemo(() => VIBE_COLORS[formValues.vibe], [formValues.vibe]);

  const handleSettingsChange = (changes: Partial<FormValues>) => {
    setFormValues((prev) => {
      const next = { ...prev, ...changes } as FormValues;
      if (changes.variantCount !== undefined) {
        next.variantCount = Math.min(6, Math.max(3, Number(changes.variantCount)));
      }
      return next;
    });
  };

  const persistSettings = useCallback((changes: Partial<FormValues>) => {
    const settings = loadSettings();
    const merged = {
      language: changes.taal ?? settings.language,
      defaultPlatform: changes.platform ?? settings.defaultPlatform,
      defaultVibe: changes.vibe ?? settings.defaultVibe,
      nVariants: changes.variantCount ?? settings.nVariants,
    };
    saveSettings(merged);
  }, []);

  const handleGenerate = async (inputs: FormValues, extraInstruction?: string) => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI API-sleutel toe.');
      return;
    }

    setIsGenerating(true);
    setNeedsReformat(false);
    setAdvice(undefined);
    const snapshot: FormValues = { ...inputs };
    setLastInputs(snapshot);

    try {
      const cached = findHistoryMatch(history, snapshot);
      let result = cached?.result;
      if (!result) {
        result = await generateVariants(apiKey, snapshot, extraInstruction ? { extraInstruction } : undefined);
        const entry: HistoryEntry = {
          id: createId(),
          inputs: snapshot,
          result,
        };
        setHistory((prev) => [entry, ...prev].slice(0, 20));
      }

      if (!result.variants || result.variants.length === 0) {
        throw new Error('Model retourneerde geen varianten.');
      }

      const enriched = result.variants.map<VariantWithMeta>((variant) => {
        const withId = { ...variant, id: createId() };
        return {
          variant: withId,
          warnings: getLengthWarnings(withId),
          score: undefined,
          isScoring: false,
        };
      });
      setVariants(enriched);
      setAdvice(result.advice);
      await scoreVariants(enriched);
      pushToast('success', 'Advertentievarianten gegenereerd.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Onbekende fout bij genereren';
      pushToast('error', message);
      if (message.includes('geldig JSON')) {
        setNeedsReformat(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const scoreVariants = async (items: VariantWithMeta[]) => {
    if (!apiKey) return;
    for (const item of items) {
      setVariants((current) =>
        current.map((entry) =>
          entry.variant.id === item.variant.id ? { ...entry, isScoring: true } : entry,
        ),
      );
      try {
        const score = await scoreVariant(apiKey, item.variant);
        setVariants((current) =>
          current.map((entry) =>
            entry.variant.id === item.variant.id
              ? { ...entry, score, isScoring: false }
              : entry,
          ),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Scoring mislukt';
        pushToast('error', message);
        setVariants((current) =>
          current.map((entry) =>
            entry.variant.id === item.variant.id ? { ...entry, isScoring: false } : entry,
          ),
        );
      }
    }
  };

  const handleRemix = async (variantId: string, intent: RemixIntent) => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI API-sleutel toe.');
      return;
    }
    const target = variants.find((item) => item.variant.id === variantId);
    if (!target) return;
    try {
      const response = await remixVariant(apiKey, intent, target.variant);
      const remix = response.variants[0];
      const withId = { ...remix, id: createId() };
      const updated: VariantWithMeta = {
        variant: withId,
        warnings: getLengthWarnings(withId),
        score: undefined,
        isScoring: false,
      };
      setVariants((current) =>
        current.map((entry) => (entry.variant.id === variantId ? updated : entry)),
      );
      setAdvice(response.advice ?? advice);
      await scoreVariants([updated]);
      pushToast('success', 'Variant geremixt.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Remix mislukt';
      pushToast('error', message);
    }
  };

  const handleCopy = async (variantId: string) => {
    const variant = variants.find((item) => item.variant.id === variantId)?.variant;
    if (!variant) return;
    const text = formatVariantForClipboard(variant);
    try {
      await navigator.clipboard.writeText(text);
      pushToast('success', 'Variant gekopieerd.');
    } catch (error) {
      pushToast('error', 'Kopiëren mislukt.');
    }
  };

  const handleSave = (variantId: string) => {
    const item = variants.find((entry) => entry.variant.id === variantId);
    if (!item) return;
    const campaign = window.prompt('Campagne-tag toevoegen (bijv. Zomeractie 2025)');
    if (!campaign) return;
    const favorite: FavoriteVariant = {
      id: createId(),
      campaign,
      timestamp: Date.now(),
      platform: item.variant.platform,
      vibe: formValues.vibe,
      variant: item.variant,
    };
    setFavorites((prev) => [favorite, ...prev]);
    pushToast('success', 'Toegevoegd aan favorieten.');
  };

  const handleScore = (variantId: string) => {
    const item = variants.find((entry) => entry.variant.id === variantId);
    if (!item) return;
    scoreVariants([item]);
  };

  const handleFavoriteCopy = async (favorite: FavoriteVariant) => {
    try {
      await navigator.clipboard.writeText(formatVariantForClipboard(favorite.variant));
      pushToast('success', 'Favoriet gekopieerd.');
    } catch (error) {
      pushToast('error', 'Kopiëren mislukt.');
    }
  };

  const handleFavoriteDelete = (favoriteId: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== favoriteId));
    pushToast('info', 'Favoriet verwijderd.');
  };

  const handleApiKeyClose = (key: string | null) => {
    setApiKey(key);
  };

  const handleFormSubmit = () => {
    handleGenerate(formValues);
    persistSettings({
      taal: formValues.taal,
      platform: formValues.platform,
      vibe: formValues.vibe,
      variantCount: formValues.variantCount,
    });
  };

  const handleReformat = () => {
    if (!lastInputs) return;
    handleGenerate(lastInputs, 'Verzend enkel geldig JSON volgens schema.');
  };

  const handleToggleFavorites = () => setFavoritesOpen((open) => !open);

  return (
    <div className="app">
      <Toolbar
        language={formValues.taal}
        onLanguageChange={(value) => handleSettingsChange({ taal: value })}
        variantCount={formValues.variantCount}
        onVariantCountChange={(value) => handleSettingsChange({ variantCount: value })}
        selectedPreset={formValues.vibe}
        onPresetChange={(preset) => handleSettingsChange({ vibe: preset })}
        onToggleFavorites={handleToggleFavorites}
        advice={advice}
        isGenerating={isGenerating}
      >
        <ApiKeyModal onClose={handleApiKeyClose} />
      </Toolbar>

      <main className="layout">
        <section className="content">
          <FormPanel values={formValues} onChange={handleSettingsChange} onSubmit={handleFormSubmit} isGenerating={isGenerating} />
          {needsReformat && (
            <button type="button" className="secondary reformat" onClick={handleReformat}>
              Opnieuw formatteren
            </button>
          )}
          <section className="variants-grid" aria-live="polite">
            {variants.length === 0 ? (
              <p className="empty-state">Vul het formulier in en genereer 3-6 varianten op maat.</p>
            ) : (
              <div className="grid">
                {variants.map((item) => (
                  <VariantCard
                    key={item.variant.id}
                    item={item}
                    accentColor={accentColor}
                    onRemix={handleRemix}
                    onCopy={handleCopy}
                    onSave={handleSave}
                    onScore={handleScore}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
        <FavoritesDrawer
          favorites={favorites}
          isOpen={isFavoritesOpen}
          onClose={() => setFavoritesOpen(false)}
          onCopy={handleFavoriteCopy}
          onDelete={handleFavoriteDelete}
        />
      </main>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

const formatVariantForClipboard = (variant: VariantWithMeta['variant']) => {
  const headline = Array.isArray(variant.headline) ? variant.headline.join(' | ') : variant.headline;
  return `Headline: ${headline}\nPrimary: ${variant.primaryText}\nDescription: ${variant.description}\nCTA: ${variant.cta}`;
};

export default App;
