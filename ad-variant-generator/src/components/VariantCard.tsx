import React, { useState } from 'react';
import { RemixIntent, VariantScore, VariantWithMeta, ScoreMetricKey } from '../types';
import { buildCharInfo } from '../utils/insights';

const METRIC_CONFIG: { key: ScoreMetricKey; label: string; description: string }[] = [
  { key: 'relevance', label: 'Relevantie', description: 'Matcht met doelgroep en situatie.' },
  { key: 'clarity', label: 'Duidelijkheid', description: 'Helder en eenvoudig te begrijpen.' },
  { key: 'valueProposition', label: 'Value prop', description: 'Hoe sterk het aanbod/USP doorkomt.' },
  { key: 'emotionHook', label: 'Hook / emotie', description: 'Prikkelt en trekt aandacht snel.' },
  { key: 'ctaPower', label: 'CTA-kracht', description: 'Hoe duidelijk en verleidelijk de CTA is.' },
  { key: 'platformFit', label: 'Platform-fit', description: 'Past bij lengte/format van dit kanaal.' },
  { key: 'originality', label: 'Originaliteit', description: 'Onderscheidend t.o.v. concurrenten.' },
] as const;

interface VariantCardProps {
  item: VariantWithMeta;
  accentColor: string;
  onRemix: (variantId: string, intent: RemixIntent) => void;
  onCopy: (variantId: string) => void;
  onSave: (variantId: string) => void;
  onScore: (variantId: string) => void;
  onRemixTip: (variantId: string, metric: ScoreMetricKey) => void;
  onApplyTip: (variantId: string, metric: ScoreMetricKey) => void;
  onPerformanceSave: (variantId: string, metrics: { ctr?: number; cvr?: number; cpa?: number; roas?: number }) => void;
  remixingTips?: Partial<Record<ScoreMetricKey, boolean>>;
  applyingTips?: Partial<Record<ScoreMetricKey, boolean>>;
  ctaHint?: string;
  policyWarnings?: string[];
  performance?: { ctr?: number; cvr?: number; cpa?: number; roas?: number };
}

const remixOptions: RemixIntent[] = ['scherper', 'korter', 'krachtiger', 'informeler', 'meer premium'];

type LegacyScore = {
  clarity: number;
  emotion: number;
  distinctiveness: number;
  ctaStrength: number;
  total: number;
  tip: string;
  updatedAt: number;
};

const to100 = (value: number | undefined) => {
  if (value === undefined || Number.isNaN(value)) return 0;
  return value > 10 ? value : value * 10;
};

const normaliseScore = (score: VariantWithMeta['score']): VariantScore | undefined => {
  if (!score) return undefined;

  const candidate = score as VariantScore;
  const hasNewMetrics =
    candidate.relevance &&
    candidate.valueProposition &&
    candidate.emotionHook &&
    candidate.ctaPower &&
    candidate.platformFit &&
    candidate.originality;

  if (hasNewMetrics) {
    // Coerce totals to 0-100 if model still returns 0-10
    return {
      ...candidate,
      total: to100(candidate.total),
      relevance: { ...candidate.relevance, score: to100(candidate.relevance.score) },
      clarity: { ...candidate.clarity, score: to100(candidate.clarity.score) },
      valueProposition: { ...candidate.valueProposition, score: to100(candidate.valueProposition.score) },
      emotionHook: { ...candidate.emotionHook, score: to100(candidate.emotionHook.score) },
      ctaPower: { ...candidate.ctaPower, score: to100(candidate.ctaPower.score) },
      platformFit: { ...candidate.platformFit, score: to100(candidate.platformFit.score) },
      originality: { ...candidate.originality, score: to100(candidate.originality.score) },
    };
  }

  const legacy = score as LegacyScore;
  const fallbackTip =
    legacy.tip || 'Herbereken de score voor actuele inzichten en gedetailleerde verbeterpunten.';
  const legacyToMetric = (value?: number): MetricDetail => ({
    score: to100(value ?? legacy.total),
    tip: fallbackTip,
  });

  return {
    relevance: legacyToMetric(legacy.clarity),
    clarity: legacyToMetric(legacy.clarity),
    valueProposition: legacyToMetric(legacy.distinctiveness),
    emotionHook: legacyToMetric(legacy.emotion),
    ctaPower: legacyToMetric(legacy.ctaStrength),
    platformFit: legacyToMetric(legacy.clarity),
    originality: legacyToMetric(legacy.distinctiveness),
    total: to100(legacy.total),
    summary: 'Samenvatting niet beschikbaar. Herbereken de score voor actuele inzichten.',
    overallTip: fallbackTip,
    updatedAt: legacy.updatedAt,
  };
};

const VariantCard: React.FC<VariantCardProps> = ({
  item,
  accentColor,
  onRemix,
  onCopy,
  onSave,
  onScore,
  onRemixTip,
  onApplyTip,
  onPerformanceSave,
  remixingTips,
  applyingTips,
  ctaHint,
  policyWarnings,
  performance,
}) => {
  const [selectedRemix, setSelectedRemix] = useState<RemixIntent>('scherper');
  const [perfDraft, setPerfDraft] = useState({
    ctr: performance?.ctr?.toString() ?? '',
    cvr: performance?.cvr?.toString() ?? '',
    cpa: performance?.cpa?.toString() ?? '',
    roas: performance?.roas?.toString() ?? '',
  });
  const { variant, warnings, score: rawScore, isScoring } = item;
  const headlines = Array.isArray(variant.headline) ? variant.headline : [variant.headline];
  const score = normaliseScore(rawScore);
  const charInfo = buildCharInfo(variant);

  return (
    <article className="variant-card glass-panel" style={{ borderTopColor: accentColor }}>
      <header>
        <span className="platform-tag">{variant.platform}</span>
        <div className="headline-group">
          {headlines.map((headline, index) => (
            <h3 key={index}>{headline}</h3>
          ))}
        </div>
      </header>
      <p className="primary-text">{variant.primaryText}</p>
      <p className="description">{variant.description}</p>
      <p className="cta">CTA: {variant.cta}</p>
      {variant.notes && <p className="notes">Tip: {variant.notes}</p>}
      <div className="char-counters">
        {charInfo.map((info) => (
          <span key={`${info.field}-${info.index ?? 0}`} className="char-counter">
            {info.label}: {info.count}
            {info.limit ? `/ ${info.limit}` : ''}
          </span>
        ))}
      </div>
      {policyWarnings && policyWarnings.length > 0 && (
        <ul className="warnings policy" aria-label="Policy waarschuwingen">
          {policyWarnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
      {ctaHint && <p className="hint">{ctaHint}</p>}
      {warnings.length > 0 && (
        <ul className="warnings" aria-label="Lengte-waarschuwingen">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
      <div className="performance-form">
        <p className="performance-label">Performance (optioneel, manueel invullen)</p>
        <div className="performance-grid">
          <label>
            CTR %
            <input
              type="number"
              step="0.01"
              value={perfDraft.ctr}
              onChange={(e) => setPerfDraft((p) => ({ ...p, ctr: e.target.value }))}
            />
          </label>
          <label>
            CVR %
            <input
              type="number"
              step="0.01"
              value={perfDraft.cvr}
              onChange={(e) => setPerfDraft((p) => ({ ...p, cvr: e.target.value }))}
            />
          </label>
          <label>
            CPA
            <input
              type="number"
              step="0.01"
              value={perfDraft.cpa}
              onChange={(e) => setPerfDraft((p) => ({ ...p, cpa: e.target.value }))}
            />
          </label>
          <label>
            ROAS
            <input
              type="number"
              step="0.01"
              value={perfDraft.roas}
              onChange={(e) => setPerfDraft((p) => ({ ...p, roas: e.target.value }))}
            />
          </label>
        </div>
        <button
          type="button"
          className="secondary small"
          onClick={() =>
            onPerformanceSave(variant.id, {
              ctr: perfDraft.ctr ? Number(perfDraft.ctr) : undefined,
              cvr: perfDraft.cvr ? Number(perfDraft.cvr) : undefined,
              cpa: perfDraft.cpa ? Number(perfDraft.cpa) : undefined,
              roas: perfDraft.roas ? Number(perfDraft.roas) : undefined,
            })
          }
        >
          Bewaar performance
        </button>
      </div>
      <div className="card-actions">
        <label>
          Remix-doel
          <select value={selectedRemix} onChange={(event) => setSelectedRemix(event.target.value as RemixIntent)}>
            {remixOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => onRemix(variant.id, selectedRemix)} className="secondary">
          Remix
        </button>
        <button type="button" onClick={() => onCopy(variant.id)} className="secondary">
          Kopieer
        </button>
        <button type="button" onClick={() => onSave(variant.id)} className="secondary">
          Bewaar
        </button>
        <button type="button" onClick={() => onScore(variant.id)} className="secondary" disabled={isScoring}>
          {isScoring ? 'Score berekenen...' : 'Score herberekenen'}
        </button>
      </div>
      {score && (
        <div className="scorecard">
          <div className="scorecard-header">
            <div>
              <h4>Scorekaart</h4>
              <p className="score-summary">{score.summary}</p>
            </div>
            <div className="score-total">
              <div className="score-total-label">
                <span>Totaal</span>
                <strong>{Math.round(score.total)}/100</strong>
              </div>
              <div className="score-meter">
                <div
                  className="score-meter-fill"
                  style={{ width: `${Math.min(100, Math.round(score.total))}%`, backgroundColor: accentColor }}
                  aria-hidden
                />
              </div>
            </div>
          </div>
          <div className="score-grid">
            {METRIC_CONFIG.map((metric) => {
              const detail = score[metric.key];
              const isRemixingTip = remixingTips?.[metric.key];
              const isApplyingTip = applyingTips?.[metric.key];
              return (
                <div key={metric.key} className="score-metric">
                  <div className="score-metric-header">
                    <div>
                      <p className="score-metric-label">{metric.label}</p>
                      <p className="score-metric-description">{metric.description}</p>
                    </div>
                    <div className="score-metric-score">
                      <strong>{Math.round(detail.score)}</strong>
                      <span>/100</span>
                    </div>
                  </div>
                  <div className="score-meter">
                    <div
                      className="score-meter-fill"
                      style={{ width: `${Math.min(100, Math.round(detail.score))}%`, backgroundColor: accentColor }}
                      aria-hidden
                    />
                  </div>
                  <div className="score-metric-tipbox">
                    <span className="score-tip-label">Verbeterpunt</span>
                    <p className="score-metric-tip">{detail.tip}</p>
                    <button
                      type="button"
                      className="score-tip-button primary"
                      onClick={() => onApplyTip(variant.id, metric.key)}
                      disabled={isApplyingTip}
                    >
                      {isApplyingTip ? 'Tip toepassen...' : 'Pas tip toe'}
                    </button>
                    <button
                      type="button"
                      className="score-tip-button"
                      onClick={() => onRemixTip(variant.id, metric.key)}
                      disabled={isRemixingTip}
                    >
                      {isRemixingTip ? 'Tip genereren...' : 'Remix deze tip'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="score-overall-panel">
            <p className="score-overall-label">Overkoepelende tip</p>
            <p className="score-overall-tip">{score.overallTip}</p>
          </div>
        </div>
      )}
    </article>
  );
};

export default VariantCard;
