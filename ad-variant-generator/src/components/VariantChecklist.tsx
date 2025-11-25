import React from 'react';
import { computeVariantChecklist } from '../utils/checklist';
import { AdVariant } from '../types';

interface VariantChecklistProps {
  variants: AdVariant[];
  onAddHooks: () => void;
  onAddSocialProof: () => void;
  onAddUrgency: () => void;
  onAddAngle: () => void;
}

const VariantChecklist: React.FC<VariantChecklistProps> = ({
  variants,
  onAddHooks,
  onAddSocialProof,
  onAddUrgency,
  onAddAngle,
}) => {
  const stats = computeVariantChecklist(variants);

  const items = [
    {
      label: `Hooks aanwezig: ${stats.hooks}`,
      missing: stats.hooks < 3,
      actionLabel: 'Voeg hooks toe',
      action: onAddHooks,
    },
    {
      label: `Social proof varianten: ${stats.socialProof}`,
      missing: stats.socialProof === 0,
      actionLabel: 'Voeg social proof toe',
      action: onAddSocialProof,
    },
    {
      label: `CTA variaties: ${stats.ctaVariants}`,
      missing: stats.ctaVariants < 1,
      actionLabel: 'Voeg CTA-variant toe',
      action: onAddHooks,
    },
    {
      label: `Urgency varianten: ${stats.urgency}`,
      missing: stats.urgency === 0,
      actionLabel: 'Voeg urgency toe',
      action: onAddUrgency,
    },
    {
      label: `Angle variatie: ${stats.angleSignals}`,
      missing: stats.angleSignals < 2,
      actionLabel: 'Breid angle uit',
      action: onAddAngle,
    },
  ];

  return (
    <section className="glass-panel checklist-panel" aria-label="Variant checklist">
      <header className="checklist-header">
        <div>
          <p className="eyebrow">Variant Checklist</p>
          <h3>Gaps en snelle aanvulling</h3>
          <p className="section-subtitle">Zie wat ontbreekt en vul met één klik.</p>
        </div>
      </header>
      <ul className="checklist-list">
        {items.map((item) => (
          <li key={item.label} className={item.missing ? 'missing' : 'ok'}>
            <div>
              <strong>{item.label}</strong>
              {item.missing && <span className="checklist-missing">Ontbreekt</span>}
            </div>
            {item.missing && (
              <button type="button" className="secondary small" onClick={item.action}>
                {item.actionLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default VariantChecklist;
