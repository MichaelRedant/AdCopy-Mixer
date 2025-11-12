import React, { useState } from 'react';
import { RemixIntent, VariantWithMeta } from '../types';

interface VariantCardProps {
  item: VariantWithMeta;
  accentColor: string;
  onRemix: (variantId: string, intent: RemixIntent) => void;
  onCopy: (variantId: string) => void;
  onSave: (variantId: string) => void;
  onScore: (variantId: string) => void;
}

const remixOptions: RemixIntent[] = ['scherper', 'korter', 'krachtiger', 'informeler', 'meer premium'];

const VariantCard: React.FC<VariantCardProps> = ({ item, accentColor, onRemix, onCopy, onSave, onScore }) => {
  const [selectedRemix, setSelectedRemix] = useState<RemixIntent>('scherper');
  const { variant, warnings, score, isScoring } = item;
  const headlines = Array.isArray(variant.headline) ? variant.headline : [variant.headline];

  return (
    <article className="variant-card" style={{ borderTopColor: accentColor }}>
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
      {variant.notes && <p className="notes">💡 {variant.notes}</p>}
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
          <h4>Scorekaart</h4>
          <div className="score-grid">
            <div>
              <span>Duidelijkheid</span>
              <strong>{score.clarity}/10</strong>
            </div>
            <div>
              <span>Emotie</span>
              <strong>{score.emotion}/10</strong>
            </div>
            <div>
              <span>Onderscheidend</span>
              <strong>{score.distinctiveness}/10</strong>
            </div>
            <div>
              <span>CTA-sterkte</span>
              <strong>{score.ctaStrength}/10</strong>
            </div>
          </div>
          <p className="score-tip">{score.tip}</p>
          <p className="score-total">Totaal: {score.total}/10</p>
        </div>
      )}
    </article>
  );
};

export default VariantCard;
