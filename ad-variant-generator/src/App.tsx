import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import FormPanel from './components/FormPanel';
import ToastContainer from './components/ToastContainer';
import Toolbar from './components/Toolbar';
import VariantCard from './components/VariantCard';
import { useToasts } from './hooks/useToasts';
import { remixVariant, scoreVariant, generateVariants, remixScoreTip } from './services/chatgpt';
import {
  FavoriteVariant,
  FormValues,
  HistoryEntry,
  RemixIntent,
  ScoreMetricKey,
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
  const [tipProgress, setTipProgress] = useState<Record<string, Partial<Record<ScoreMetricKey, boolean>>>>({});

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
      model: settings.defaultModel,
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
      defaultModel: changes.model ?? settings.defaultModel,
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
        result = await generateVariants(
          apiKey,
          snapshot.model,
          snapshot,
          extraInstruction ? { extraInstruction } : undefined,
        );
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
      await scoreVariants(enriched, snapshot.model);
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

  const scoreVariants = async (items: VariantWithMeta[], model: FormValues['model']) => {
    if (!apiKey) return;
    for (const item of items) {
      setVariants((current) =>
        current.map((entry) =>
          entry.variant.id === item.variant.id ? { ...entry, isScoring: true } : entry,
        ),
      );
      try {
        const score = await scoreVariant(apiKey, model, item.variant);
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
      const response = await remixVariant(apiKey, formValues.model, intent, target.variant);
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
      await scoreVariants([updated], formValues.model);
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
    scoreVariants([item], formValues.model);
  };

  const setTipLoading = (variantId: string, metric: ScoreMetricKey, isLoading: boolean) => {
    setTipProgress((current) => {
      const next = { ...current };
      const entry = { ...(next[variantId] ?? {}) };
      if (isLoading) {
        entry[metric] = true;
        next[variantId] = entry;
        return next;
      }
      delete entry[metric];
      if (Object.keys(entry).length === 0) {
        delete next[variantId];
      } else {
        next[variantId] = entry;
      }
      return next;
    });
  };

  const handleRemixTip = async (variantId: string, metric: ScoreMetricKey) => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI API-sleutel toe.');
      return;
    }

    const target = variants.find((entry) => entry.variant.id === variantId);
    if (!target || !target.score) {
      pushToast('error', 'Tip kan pas opnieuw geschreven worden na een scoreberekening.');
      return;
    }

    const currentTip = target.score[metric]?.tip;
    if (!currentTip) {
      pushToast('error', 'Geen tip beschikbaar om te herschrijven.');
      return;
    }

    setTipLoading(variantId, metric, true);
    try {
      const tip = await remixScoreTip(apiKey, formValues.model, target.variant, metric, currentTip);
      setVariants((existing) =>
        existing.map((entry) => {
          if (entry.variant.id !== variantId || !entry.score) {
            return entry;
          }
          return {
            ...entry,
            score: {
              ...entry.score,
              updatedAt: Date.now(),
              [metric]: { ...entry.score[metric], tip },
            },
          };
        }),
      );
      pushToast('success', 'Nieuwe tip klaargestoomd.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tip remix mislukt';
      pushToast('error', message);
    } finally {
      setTipLoading(variantId, metric, false);
    }
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
      model: formValues.model,
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
        model={formValues.model}
        onModelChange={(value) => handleSettingsChange({ model: value })}
        advice={advice}
        isGenerating={isGenerating}
      >
        <ApiKeyModal onClose={handleApiKeyClose} />
      </Toolbar>

      <main className="layout">
        <section className="content">
          <div className="content-grid">
            <FormPanel
              values={formValues}
              onChange={handleSettingsChange}
              onSubmit={handleFormSubmit}
              isGenerating={isGenerating}
            />
            <section className="help-panel glass-panel" aria-label="Help en credits">
              <div className="help-header">
                <span className="help-badge">Xinudesign</span>
                <h2>Help & credits</h2>
              </div>
              <p className="help-intro">
                Deze interface is vormgegeven door <strong>Michaël Redant</strong>, het creatieve brein achter Xinudesign. Zijn
                focus op glasheldere flows en zachte micro-animaties vertaalt de Apple Liquid Glass stijl naar AdCopy Mixer.
              </p>
              <ul className="help-list">
                <li>Gebruik de preset-knoppen om razendsnel de juiste vibe te selecteren.</li>
                <li>Laat het model 3-6 varianten genereren en vergelijk de scores voor snelle experimenten.</li>
                <li>Bewaar favorieten en exporteer ze om direct met je marketingteam te delen.</li>
              </ul>
              <div className="promo-card">
                <h3>Extra hulp nodig?</h3>
                <p>
                  Voor branding, campagnes of een frisse UX-aanpak kun je terecht bij Xinudesign. Michaël denkt graag mee over
                  jouw volgende digitale ervaring.
                </p>
              </div>
              <div className="promo-card highlight">
                <h3>Tip uit eigen keuken</h3>
                <p>
                  Zin in tastbare prototypes of gepersonaliseerde merch? Bekijk de mogelijkheden bij{' '}
                  <a href="https://www.x3dprints.be" target="_blank" rel="noreferrer">
                    X3DPrints.be
                  </a>
                  , het 3D-printatelier van Michaël voor kmo's en particulieren.
                </p>
              </div>
            </section>
          </div>
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
                    onRemixTip={handleRemixTip}
                    remixingTips={tipProgress[item.variant.id]}
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
