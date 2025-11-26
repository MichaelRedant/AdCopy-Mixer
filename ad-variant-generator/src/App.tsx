import React, { useEffect, useMemo, useState } from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import FormPanel from './components/FormPanel';
import ToastContainer from './components/ToastContainer';
import Toolbar from './components/Toolbar';
import VariantCard from './components/VariantCard';
import CampaignArchitecturePanel from './components/CampaignArchitecture';
import PerformanceInsights from './components/PerformanceInsights';
import UTMBuilder from './components/UTMBuilder';
import PerformanceImport from './components/PerformanceImport';
import AngleExpander from './components/AngleExpander';
import HookGenerator from './components/HookGenerator';
import VariantChecklist from './components/VariantChecklist';
import CampaignBlueprintPanel from './components/CampaignBlueprint';
import AdNamingGenerator from './components/AdNamingGenerator';
import { useToasts } from './hooks/useToasts';
import {
  remixVariant,
  scoreVariant,
  generateVariants,
  remixScoreTip,
  applyScoreTip,
  expandAngle,
  generateHooks,
  generateBlueprint,
  generateNames,
} from './services/chatgpt';
import {
  AdVariant,
  CampaignArchitecture,
  CampaignBlueprint,
  FavoriteVariant,
  FormValues,
  HistoryEntry,
  RemixIntent,
  ScoreMetricKey,
  VariantWithMeta,
} from './types';
import { DEFAULT_FORM_VALUES, VIBE_COLORS } from './utils/constants';
import { getLengthWarnings } from './utils/validation';
import { computePerformanceInsights, getCtaDiversityHint, getPolicyWarnings } from './utils/insights';
import {
  findHistoryMatch,
  loadFavorites,
  loadHistory,
  loadPerformanceMap,
  loadSettings,
  saveFavorites,
  saveHistory,
  savePerformanceMap,
  saveSettings,
} from './utils/storage';

const createId = () => (crypto.randomUUID ? `var_${crypto.randomUUID()}` : `var_${Date.now().toString(36)}`);

type ModuleId = 'briefing' | 'performance' | 'angles' | 'blueprint' | 'variants';

const MODULES: { id: ModuleId; label: string; description: string }[] = [
  { id: 'briefing', label: 'Campagne briefing', description: 'Mini-briefing + persona + basis' },
  { id: 'performance', label: 'Performance & UTM', description: 'CSV/API import en UTM-helper' },
  { id: 'angles', label: 'Angles & hooks', description: 'Instant angles, hooks, architectuur' },
  { id: 'blueprint', label: 'Blueprint & namen', description: 'Meta/Google pakketten + naming' },
  { id: 'variants', label: 'Varianten', description: 'Score, tips en variaties' },
];

const formatVariantForClipboard = (variant: AdVariant) => {
  const headlines = Array.isArray(variant.headline) ? variant.headline.join(' | ') : variant.headline;
  return [
    `Platform: ${variant.platform}`,
    `Headline: ${headlines}`,
    `Primary text: ${variant.primaryText}`,
    `Description: ${variant.description}`,
    `CTA: ${variant.cta}`,
    variant.notes ? `Notes: ${variant.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n');
};

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [activeModule, setActiveModule] = useState<ModuleId>('briefing');
  const [formValues, setFormValues] = useState<FormValues>(DEFAULT_FORM_VALUES);
  const [variants, setVariants] = useState<VariantWithMeta[]>([]);
  const [architecture, setArchitecture] = useState<CampaignArchitecture | undefined>();
  const [favorites, setFavorites] = useState<FavoriteVariant[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [advice, setAdvice] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [needsReformat, setNeedsReformat] = useState(false);
  const [lastInputs, setLastInputs] = useState<FormValues | undefined>();
  const [tipProgress, setTipProgress] = useState<Record<string, Partial<Record<ScoreMetricKey, boolean>>>>({});
  const [applyTipProgress, setApplyTipProgress] = useState<Record<string, Partial<Record<ScoreMetricKey, boolean>>>>({});
  const [performanceMap, setPerformanceMap] = useState<Record<string, import('./types').PerformanceMetrics>>({});
  const [isExpandingAngle, setIsExpandingAngle] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<string[]>([]);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [blueprint, setBlueprint] = useState<CampaignBlueprint | null>(null);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [namingSuggestions, setNamingSuggestions] = useState<string[]>([]);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [showAdvice, setShowAdvice] = useState(true);

  const { toasts, pushToast, removeToast } = useToasts();

  useEffect(() => {
    const settings = loadSettings();
    setFormValues((prev) => ({
      ...prev,
      taal: settings.language,
      platform: settings.defaultPlatform,
      vibe: settings.defaultVibe,
      variantCount: settings.nVariants,
      model: settings.defaultModel,
    }));
    setFavorites(loadFavorites());
    setHistory(loadHistory());
    setPerformanceMap(loadPerformanceMap());
  }, []);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    savePerformanceMap(performanceMap);
  }, [performanceMap]);

  useEffect(() => {
    const handleScroll = () => {
      setShowAdvice(window.scrollY < 180);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const persistSettings = (next: FormValues) => {
    saveSettings({
      language: next.taal,
      defaultPlatform: next.platform,
      defaultVibe: next.vibe,
      nVariants: next.variantCount,
      defaultModel: next.model,
    });
  };

  const handleSettingsChange = (changes: Partial<FormValues>) => {
    setFormValues((prev) => {
      const next = { ...prev, ...changes };
      persistSettings(next);
      return next;
    });
  };

  const handleFormChange = (changes: Partial<FormValues>) => {
    setFormValues((prev) => ({ ...prev, ...changes }));
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI-sleutel toe.');
      return;
    }

    setIsGenerating(true);
    setNeedsReformat(false);
    try {
      const cached = findHistoryMatch(history, formValues);
      const result = cached ? cached.result : await generateVariants(apiKey, formValues.model, formValues);

      if (!cached) {
        const entry: HistoryEntry = { id: createId(), inputs: formValues, result };
        setHistory((prev) => [entry, ...prev].slice(0, 10));
      }

      const mapped = result.variants.map((variant) => {
        const id = variant.id || createId();
        const warnings = [...getLengthWarnings(variant)];
        return {
          variant: { ...variant, id },
          warnings,
          score: undefined,
          isScoring: false,
          performance: performanceMap[id],
        } as VariantWithMeta;
      });

      setVariants(mapped);
      setArchitecture(result.architecture);
      setAdvice(result.advice);
      setLastInputs(formValues);
      pushToast('success', 'Varianten gegenereerd.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Genereren mislukt.';
      pushToast('error', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemix = async (variantId: string, intent: RemixIntent) => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI-sleutel toe.');
      return;
    }

    const item = variants.find((v) => v.variant.id === variantId);
    if (!item) return;

    try {
      const response = await remixVariant(apiKey, formValues.model, intent, item.variant, formValues.persona);
      const newItems = response.variants.map((variant) => {
        const id = variant.id || createId();
        return {
          variant: { ...variant, id },
          warnings: getLengthWarnings(variant),
          score: undefined,
          isScoring: false,
          performance: performanceMap[id],
        } as VariantWithMeta;
      });

      setVariants((prev) => [...newItems, ...prev]);
      if (response.advice) setAdvice(response.advice);
      pushToast('success', 'Remix toegevoegd.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Remix mislukt.';
      pushToast('error', message);
    }
  };

  const handleCopy = async (variantId: string) => {
    const variant = variants.find((v) => v.variant.id === variantId)?.variant;
    if (!variant) return;
    try {
      await navigator.clipboard.writeText(formatVariantForClipboard(variant));
      pushToast('success', 'Gekopieerd naar klembord.');
    } catch (error) {
      pushToast('error', 'Kopieren mislukt.');
    }
  };

  const handleSave = (variantId: string) => {
    const item = variants.find((v) => v.variant.id === variantId);
    if (!item) return;
    const favorite: FavoriteVariant = {
      id: createId(),
      campaign: formValues.product || 'Onbekend',
      timestamp: Date.now(),
      platform: item.variant.platform,
      vibe: formValues.vibe,
      variant: item.variant,
    };
    setFavorites((prev) => [favorite, ...prev]);
    pushToast('success', 'Toegevoegd aan favorieten.');
  };

  const handleScore = async (variantId: string) => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI-sleutel toe.');
      return;
    }

    const performanceContext = computePerformanceInsights(
      variants.map((v) => v.variant),
      performanceMap,
    ).join('\n');

    setVariants((prev) =>
      prev.map((item) => (item.variant.id === variantId ? { ...item, isScoring: true } : item)),
    );

    try {
      const target = variants.find((v) => v.variant.id === variantId);
      if (!target) return;
      const scored = await scoreVariant(apiKey, formValues.model, target.variant, performanceContext);
      setVariants((prev) =>
        prev.map((item) =>
          item.variant.id === variantId ? { ...item, score: scored, isScoring: false } : item,
        ),
      );
      pushToast('success', 'Score bijgewerkt.');
      setNeedsReformat(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Scoren mislukt.';
      pushToast('error', message);
      setVariants((prev) =>
        prev.map((item) => (item.variant.id === variantId ? { ...item, isScoring: false } : item)),
      );
    }
  };

  const handleRemixTip = async (variantId: string, metric: ScoreMetricKey) => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI-sleutel toe.');
      return;
    }
    setTipProgress((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [metric]: true },
    }));

    try {
      const target = variants.find((v) => v.variant.id === variantId);
      if (!target?.score) return;
      const newTip = await remixScoreTip(apiKey, formValues.model, target.variant, metric, target.score[metric].tip);
      setVariants((prev) =>
        prev.map((item) =>
          item.variant.id === variantId && item.score
            ? { ...item, score: { ...item.score, [metric]: { ...item.score[metric], tip: newTip } } }
            : item,
        ),
      );
      pushToast('success', 'Nieuwe tip gegenereerd.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tip genereren mislukt.';
      pushToast('error', message);
    } finally {
      setTipProgress((prev) => ({
        ...prev,
        [variantId]: { ...prev[variantId], [metric]: false },
      }));
    }
  };

  const handleApplyTip = async (variantId: string, metric: ScoreMetricKey) => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI-sleutel toe.');
      return;
    }
    setApplyTipProgress((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [metric]: true },
    }));

    try {
      const target = variants.find((v) => v.variant.id === variantId);
      if (!target?.score) return;
      const response = await applyScoreTip(
        apiKey,
        formValues.model,
        target.variant,
        metric,
        target.score[metric].tip,
        formValues.persona,
      );

      const updated = response.variants.map((variant) => {
        const id = variant.id || createId();
        return {
          variant: { ...variant, id },
          warnings: getLengthWarnings(variant),
          score: undefined,
          isScoring: false,
          performance: performanceMap[id],
        } as VariantWithMeta;
      });

      setVariants((prev) => {
        const withoutTarget = prev.filter((item) => item.variant.id !== variantId);
        return [...updated, ...withoutTarget];
      });

      if (response.advice) setAdvice(response.advice);
      pushToast('success', 'Tip toegepast, variant bijgewerkt.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tip toepassen mislukt.';
      pushToast('error', message);
    } finally {
      setApplyTipProgress((prev) => ({
        ...prev,
        [variantId]: { ...prev[variantId], [metric]: false },
      }));
    }
  };

  const handleFavoriteCopy = (favorite: FavoriteVariant) => {
    navigator.clipboard
      .writeText(formatVariantForClipboard(favorite.variant))
      .then(() => pushToast('success', 'Favoriet gekopieerd.'))
      .catch(() => pushToast('error', 'Kopieren mislukt.'));
  };

  const handleFavoriteDelete = (favoriteId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
  };

  const handleFormSubmit = () => {
    setNeedsReformat(false);
    handleGenerate();
  };

  const handleReformat = () => {
    if (!lastInputs) {
      handleGenerate();
      return;
    }
    setFormValues(lastInputs);
    handleGenerate();
  };

  const handleToggleFavorites = () => setIsFavoritesOpen((prev) => !prev);

  const handleAngleExpand = async (angle: import('./utils/angles').AngleKey) => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI-sleutel toe.');
      return;
    }
    setIsExpandingAngle(true);
    try {
      const result = await expandAngle(apiKey, formValues.model, angle, formValues);
      const variant: AdVariant = {
        id: createId(),
        platform: formValues.platform,
        primaryText: result.primaryText,
        headline: result.headline,
        description: '-',
        cta: 'Meer info',
        notes: 'Instant angle expander',
      };
      const mapped: VariantWithMeta = {
        variant,
        warnings: getLengthWarnings(variant),
        score: undefined,
        isScoring: false,
        performance: undefined,
      };
      setVariants((prev) => [mapped, ...prev]);
      setGeneratedHooks(result.hooks);
      pushToast('success', 'Nieuwe angle toegevoegd.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Angle genereren mislukt.';
      pushToast('error', message);
    } finally {
      setIsExpandingAngle(false);
    }
  };

  const handleHookGenerate = async (category: import('./utils/hooks').HookCategory) => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI-sleutel toe.');
      return [];
    }
    setIsGeneratingHooks(true);
    try {
      const response = await generateHooks(apiKey, formValues.model, category, formValues);
      setGeneratedHooks(response.hooks);
      pushToast('success', 'Hooks gegenereerd.');
      return response.hooks;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hooks genereren mislukt.';
      pushToast('error', message);
      return [];
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  const handleBlueprintGenerate = async () => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI-sleutel toe.');
      return;
    }
    setIsGeneratingBlueprint(true);
    try {
      const result = await generateBlueprint(apiKey, formValues.model, formValues);
      setBlueprint(result);
      pushToast('success', 'Blueprint klaar.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Blueprint genereren mislukt.';
      pushToast('error', message);
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const importMetaBlueprint = () => {
    if (!blueprint) return;
    const variantsToAdd: VariantWithMeta[] = [
      ...blueprint.meta.primaryTexts.map((text, idx) => {
        const variant: AdVariant = {
          id: createId(),
          platform: 'meta',
          primaryText: text,
          headline: blueprint.meta.headlines[idx] || blueprint.meta.headlines[0] || '',
          description: blueprint.meta.descriptions[idx] || blueprint.meta.descriptions[0] || '',
          cta: 'Meer info',
          notes: 'Blueprint: meta',
        };
        return {
          variant,
          warnings: getLengthWarnings(variant),
          score: undefined,
          isScoring: false,
          performance: performanceMap[variant.id],
        } as VariantWithMeta;
      }),
      {
        variant: { ...blueprint.meta.retargeting, id: createId() },
        warnings: getLengthWarnings(blueprint.meta.retargeting),
        score: undefined,
        isScoring: false,
        performance: performanceMap[blueprint.meta.retargeting.id],
      },
      {
        variant: { ...blueprint.meta.conversion, id: createId() },
        warnings: getLengthWarnings(blueprint.meta.conversion),
        score: undefined,
        isScoring: false,
        performance: performanceMap[blueprint.meta.conversion.id],
      },
    ];
    setVariants((prev) => [...variantsToAdd, ...prev]);
    pushToast('success', 'Meta-blauwdruk geimporteerd.');
  };

  const importGoogleBlueprint = () => {
    if (!blueprint) return;
    const variant: AdVariant = {
      id: createId(),
      platform: 'google',
      primaryText: blueprint.google.headlines.slice(0, 3).join(' | '),
      headline: blueprint.google.headlines,
      description: blueprint.google.descriptions.slice(0, 2).join(' | '),
      cta: 'Nu bekijken',
      notes: `Callouts: ${blueprint.google.callouts.join('; ')} | Sitelinks: ${blueprint.google.sitelinks.join('; ')} | Call: ${blueprint.google.callExtension}`,
    };
    const mapped: VariantWithMeta = {
      variant,
      warnings: getLengthWarnings(variant),
      score: undefined,
      isScoring: false,
      performance: performanceMap[variant.id],
    };
    setVariants((prev) => [mapped, ...prev]);
    pushToast('success', 'Google-blauwdruk geimporteerd.');
  };

  const handleNamingGenerate = async () => {
    if (!apiKey) {
      pushToast('error', 'Voeg eerst je OpenAI-sleutel toe.');
      return;
    }
    setIsGeneratingNames(true);
    try {
      const response = await generateNames(apiKey, formValues.model, formValues);
      setNamingSuggestions(response.names);
      pushToast('success', 'Naamconventies gegenereerd.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Namen genereren mislukt.';
      pushToast('error', message);
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const handlePerformanceSave = (variantId: string, metrics: { ctr?: number; cvr?: number; cpa?: number; roas?: number }) => {
    setPerformanceMap((prev) => ({ ...prev, [variantId]: metrics }));
    pushToast('success', 'Performance opgeslagen.');
  };

  const handlePerformanceImport = (data: Record<string, import('./types').PerformanceMetrics>) => {
    setPerformanceMap((prev) => ({ ...prev, ...data }));
    pushToast('success', 'Performance-data geimporteerd.');
  };

  const performanceInsights = useMemo(
    () => computePerformanceInsights(variants.map((v) => v.variant), performanceMap),
    [variants, performanceMap],
  );

  const ctaHint = useMemo(() => getCtaDiversityHint(variants.map((v) => v.variant)), [variants]);

  return (
    <div className="app">
      <Toolbar
        language={formValues.taal}
        onLanguageChange={(value) => handleSettingsChange({ taal: value })}
        variantCount={formValues.variantCount}
        onVariantCountChange={(value) => handleSettingsChange({ variantCount: value })}
        selectedPreset={formValues.vibe}
        onPresetChange={(value) => handleSettingsChange({ vibe: value })}
        onToggleFavorites={handleToggleFavorites}
        model={formValues.model}
        onModelChange={(value) => handleSettingsChange({ model: value })}
        advice={showAdvice ? advice : undefined}
        isGenerating={isGenerating}
      >
        <ApiKeyModal onClose={(key) => setApiKey(key ?? '')} />
      </Toolbar>

      <main className="layout">
        <aside className="module-rail glass-panel" aria-label="Modules">
          <div className="rail-header">
            <p className="eyebrow">Modules</p>
            <p className="section-subtitle">Kies wat je nodig hebt; alles blijft bewaard.</p>
          </div>
          <div className="rail-list">
            {MODULES.map((module, index) => (
              <button
                key={module.id}
                type="button"
                className={`rail-item ${activeModule === module.id ? 'active' : ''}`}
                onClick={() => setActiveModule(module.id)}
              >
                <span className="rail-step">{index + 1}</span>
                <span className="rail-meta">
                  <span className="rail-title">{module.label}</span>
                  <small>{module.description}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="content" aria-live="polite">
          <div className="content-stack">
            {activeModule === 'briefing' && (
              <>
                <div className="module-card glass-panel">
                  <div className="section-header">
                    <p className="eyebrow">Stap 1</p>
                    <div>
                      <h2>Campagne briefing & persona</h2>
                      <p className="section-subtitle">
                        Houd de briefing compact: doel, platform, doelgroep en kernaanbod. Voeg persona toe om generaties te sturen.
                      </p>
                    </div>
                  </div>
                </div>
                <FormPanel
                  values={formValues}
                  onChange={handleFormChange}
                  onSubmit={handleFormSubmit}
                  isGenerating={isGenerating}
                />
                <div className="glass-panel help-panel">
                  <div className="help-header">
                    <span className="help-badge">Tip</span>
                    <h3>Zo haal je het meeste uit deze module</h3>
                  </div>
                  <p className="help-intro">Werk met concrete taal en korte bullets. Sla tussendoor op met favorieten.</p>
                  <ul className="help-list">
                    <li>Brief enkel de essentials en laat de model-keuze en vibe het fine-tunen.</li>
                    <li>Persona: geef rol en voorkeuren; bv. “senior performance marketeer, houdt van data-first copy”.</li>
                    <li>Kies 3-4 vibes om te testen en stel het aantal varianten in op 3-6.</li>
                    <li>Gebruik “Re-run” na scoren of remixen om de layout consistent te houden.</li>
                  </ul>
                </div>
              </>
            )}

            {activeModule === 'performance' && (
              <>
                <div className="module-card glass-panel">
                  <div className="section-header">
                    <p className="eyebrow">Performance</p>
                    <div>
                      <h2>UTM & performance-import</h2>
                      <p className="section-subtitle">Kleine UTM-builder + CSV/API import voor CTR/CVR/CPA/ROAS.</p>
                    </div>
                  </div>
                </div>
                <UTMBuilder
                  platform={formValues.platform as 'meta' | 'google' | 'linkedin'}
                  onCopy={() => pushToast('success', 'UTM-link gekopieerd.')}
                  onError={(msg) => pushToast('error', msg)}
                />
                <PerformanceImport onImport={handlePerformanceImport} onError={(msg) => pushToast('error', msg)} />
                {performanceInsights.length > 0 && <PerformanceInsights insights={performanceInsights} />}
              </>
            )}

            {activeModule === 'angles' && (
              <>
                <div className="angles-shell glass-panel">
                  <div className="section-header">
                    <div>
                      <p className="eyebrow">Angles & hooks</p>
                      <h2>Instant ideeen</h2>
                      <p className="section-subtitle">Kies een categorie, breid een angle uit en stal hooks uit in één flow.</p>
                    </div>
                    <div className="angle-badges">
                      <span className="hint-pill">Beste voor snelle ideation</span>
                      <span className="hint-pill soft">Gebruik persona voor toon</span>
                    </div>
                  </div>

                  <div className="angles-grid">
                    <div className="angles-column">
                      <div className="panel-header">
                        <h3>Expand een angle</h3>
                        <p className="toolbar-help">Kies een preset en vul direct een nieuwe variant.</p>
                      </div>
                      <AngleExpander onExpand={handleAngleExpand} isLoading={isExpandingAngle} />
                    </div>

                    <div className="angles-column">
                      <div className="panel-header">
                        <h3>Genereer hooks</h3>
                        <p className="toolbar-help">Selecteer categorieën om meerdere hooks tegelijk te testen.</p>
                      </div>
                      <HookGenerator onGenerate={handleHookGenerate} />
                      {generatedHooks.length > 0 && (
                        <div className="glass-panel hook-list-panel nested">
                          <div className="panel-header">
                            <h4>Gegenereerde hooks</h4>
                            <p className="toolbar-help">{generatedHooks.length} klaar voor copy & paste.</p>
                          </div>
                          <ul>
                            {generatedHooks.map((hook) => (
                              <li key={hook}>{hook}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {architecture && (
                    <div className="glass-panel architecture-wrapper">
                      <div className="panel-header">
                        <h3>Campagne-architectuur</h3>
                        <p className="toolbar-help">Overzicht van proposities, hooks en varianten.</p>
                      </div>
                      <CampaignArchitecturePanel architecture={architecture} />
                    </div>
                  )}
                </div>
              </>
            )}

            {activeModule === 'blueprint' && (
              <>
                <div className="module-card glass-panel">
                  <div className="section-header">
                    <p className="eyebrow">Blueprint</p>
                    <div>
                      <h2>Campaign Blueprint & naming</h2>
                      <p className="section-subtitle">Complete pakketten voor Meta/Google + naamconventies.</p>
                    </div>
                  </div>
                </div>
                <div className="glass-panel blueprint-trigger">
                  <div>
                    <h3>Genereer blueprint</h3>
                    <p className="section-subtitle">3 primary texts, 5 headlines, retargeting/conversion + RSA pakket.</p>
                  </div>
                  <button type="button" className="primary" onClick={handleBlueprintGenerate} disabled={isGeneratingBlueprint}>
                    {isGeneratingBlueprint ? 'Bezig...' : 'Genereer blueprint'}
                  </button>
                </div>
                {blueprint && (
                  <CampaignBlueprintPanel
                    blueprint={blueprint}
                    onImportMeta={importMetaBlueprint}
                    onImportGoogle={importGoogleBlueprint}
                  />
                )}
                <AdNamingGenerator onGenerate={handleNamingGenerate} />
                {namingSuggestions.length > 0 && (
                  <div className="glass-panel naming-results">
                    <h3>Naam suggesties</h3>
                    <ul>
                      {namingSuggestions.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {activeModule === 'variants' && (
              <>
                <div className="module-card glass-panel">
                  <div className="section-header">
                    <p className="eyebrow">Varianten</p>
                    <div>
                      <h2>Score & optimaliseer</h2>
                      <p className="section-subtitle">Live tips toepassen en prestaties opslaan.</p>
                    </div>
                  </div>
                </div>
                <div className="variants-shell glass-panel">
                  <div className="variant-hero">
                    <div>
                      <h3>Test & verbeter</h3>
                      <p className="section-subtitle">Gebruik de checklist en tips om varianten consistent te houden.</p>
                      {ctaHint && <span className="hint-pill">{ctaHint}</span>}
                    </div>
                    <div className="variant-meta">
                      <span className="meta-dot" />
                      <p className="toolbar-help">
                        {performanceInsights.length > 0
                          ? `${performanceInsights.length} performance insights actief`
                          : 'Sla performance op om scoring te verrijken.'}
                      </p>
                    </div>
                  </div>
                  {variants.length > 0 && (
                    <VariantChecklist
                      variants={variants.map((v) => v.variant)}
                      onAddHooks={() => setActiveModule('angles')}
                      onAddSocialProof={() => setActiveModule('angles')}
                      onAddUrgency={() => setActiveModule('angles')}
                      onAddAngle={() => setActiveModule('angles')}
                    />
                  )}
                  {needsReformat && (
                    <div className="glass-panel warning-panel">
                      <div>
                        <p>Nieuwe scores beschikbaar. Pas toe met "Re-run" voor consistente layout.</p>
                        <small className="hint">We gebruiken dezelfde input; dit herstructureert enkel de kaarten.</small>
                      </div>
                      <button type="button" className="secondary" onClick={handleReformat}>
                        Re-run met huidige input
                      </button>
                    </div>
                  )}
                  <div className="variants-grid">
                    {variants.map((item) => (
                      <VariantCard
                        key={item.variant.id}
                        item={item}
                        accentColor={VIBE_COLORS[formValues.vibe]}
                        onRemix={handleRemix}
                        onCopy={handleCopy}
                        onSave={handleSave}
                        onScore={handleScore}
                        onRemixTip={handleRemixTip}
                        onApplyTip={handleApplyTip}
                        onPerformanceSave={handlePerformanceSave}
                        remixingTips={tipProgress[item.variant.id]}
                        applyingTips={applyTipProgress[item.variant.id]}
                        ctaHint={ctaHint}
                        policyWarnings={getPolicyWarnings(item.variant)}
                        performance={performanceMap[item.variant.id]}
                      />
                    ))}
                    {variants.length === 0 && (
                      <div className="glass-panel empty-state">
                        <h3>Nog geen varianten</h3>
                        <p>Genereer eerst via de briefingmodule.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <FavoritesDrawer
        favorites={favorites}
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onCopy={handleFavoriteCopy}
        onDelete={handleFavoriteDelete}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default App;
