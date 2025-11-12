import React, { useState } from 'react';
import { RemixIntent, VariantScore, VariantWithMeta, ScoreMetricKey } from '../types';

const METRIC_CONFIG: { key: ScoreMetricKey; label: string; description: string }[] = [
  {
    key: 'clarity',
    label: 'Duidelijkheid',
    description: 'Hoe helder en eenvoudig de boodschap overkomt.',
  },
  {
    key: 'emotion',
    label: 'Emotie',
    description: 'In welke mate de tekst gevoel en betrokkenheid oproept.',
  },
  {
    key: 'distinctiveness',
    label: 'Onderscheidend',
    description: 'Hoe uniek de boodschap is ten opzichte van concurrenten.',
  },
  {
    key: 'ctaStrength',
    label: 'CTA sterkte',
    description: 'Hoe overtuigend de oproep tot actie aanzet tot klikken.',
  },
] as const;

interface VariantCardProps {
  item: VariantWithMeta;
  accentColor: string;
  onRemix: (variantId: string, intent: RemixIntent) => void;
  onCopy: (variantId: string) => void;
  onSave: (variantId: string) => void;
  onScore: (variantId: string) => void;
  onRemixTip: (variantId: string, metric: ScoreMetricKey) => void;
  remixingTips?: Partial<Record<ScoreMetricKey, boolean>>;
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

const normaliseScore = (score: VariantWithMeta['score']): VariantScore | undefined => {
  if (!score) {
    return undefined;
  }

  if (typeof (score as VariantScore).summary === 'string') {
    return score as VariantScore;
  }

  const legacy = score as LegacyScore;
  return {
    clarity: { score: legacy.clarity, tip: legacy.tip },
    emotion: { score: legacy.emotion, tip: legacy.tip },
    distinctiveness: { score: legacy.distinctiveness, tip: legacy.tip },
    ctaStrength: { score: legacy.ctaStrength, tip: legacy.tip },
    total: legacy.total,
    summary: 'Samenvatting niet beschikbaar. Herbereken de score voor actuele inzichten.',
    overallTip: legacy.tip,
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
  remixingTips,
}) => {
  const [selectedRemix, setSelectedRemix] = useState<RemixIntent>('scherper');
  const { variant, warnings, score: rawScore, isScoring } = item;
  const headlines = Array.isArray(variant.headline) ? variant.headline : [variant.headline];
  const score = normaliseScore(rawScore);

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
      {warnings.length > 0 && (
        <ul className="warnings" aria-label="Lengte-waarschuwingen">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
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
          {isScoring ? 'Score berekenen…' : 'Score herberekenen'}
        </button>
      </div>
      {score && (
        <div className="scorecard">
          <div className="scorecard-header">
            <div>
              <h4>Scorekaart</h4>
              <p className="score-summary">{score.summary}</p>
            </div>
            <div className="score-total-chip" aria-label={`Totaalscore ${score.total} op 10`}>
              <span>Totaal</span>
              <strong>{score.total}/10</strong>
            </div>
          </div>
          <div className="score-grid">
            {METRIC_CONFIG.map((metric) => {
              const detail = score[metric.key];
              const isRemixingTip = remixingTips?.[metric.key];
              return (
                <div key={metric.key} className="score-metric">
                  <div className="score-metric-header">
                    <div>
                      <p className="score-metric-label">{metric.label}</p>
                      <p className="score-metric-description">{metric.description}</p>
                    </div>
                    <div className="score-metric-score">
                      <strong>{detail.score}</strong>
                      <span>/10</span>
                    </div>
                  </div>
                  <div className="score-metric-tipbox">
                    <span className="score-tip-label">Verbeterpunt</span>
                    <p className="score-metric-tip">{detail.tip}</p>
                    <button
                      type="button"
                      className="score-tip-button"
                      onClick={() => onRemixTip(variant.id, metric.key)}
                      disabled={isRemixingTip}
                    >
                      {isRemixingTip ? 'Tip genereren…' : 'Remix deze tip'}
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
