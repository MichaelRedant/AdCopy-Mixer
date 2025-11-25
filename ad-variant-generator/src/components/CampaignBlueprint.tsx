import React from 'react';
import { CampaignBlueprint } from '../types';

interface CampaignBlueprintProps {
  blueprint: CampaignBlueprint;
  onImportMeta: () => void;
  onImportGoogle: () => void;
  isImporting?: boolean;
}

const CampaignBlueprintPanel: React.FC<CampaignBlueprintProps> = ({
  blueprint,
  onImportMeta,
  onImportGoogle,
  isImporting,
}) => {
  return (
    <section className="glass-panel blueprint-panel" aria-label="Campaign Blueprint">
      <header className="blueprint-header">
        <div>
          <p className="eyebrow">Campaign Blueprint</p>
          <h3>Meta & Google pakketten</h3>
          <p className="section-subtitle">Automatisch gegenereerde assets; importeer met één klik.</p>
        </div>
        <div className="blueprint-actions">
          <button type="button" className="secondary small" onClick={onImportMeta} disabled={isImporting}>
            {isImporting ? 'Importeren...' : 'Importeer Meta'}
          </button>
          <button type="button" className="secondary small" onClick={onImportGoogle} disabled={isImporting}>
            {isImporting ? 'Importeren...' : 'Importeer Google'}
          </button>
        </div>
      </header>

      <div className="blueprint-grid">
        <div className="blueprint-card">
          <h4>Meta</h4>
          <p className="eyebrow">Primary texts</p>
          <ul>{blueprint.meta.primaryTexts.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="eyebrow">Headlines</p>
          <ul>{blueprint.meta.headlines.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="eyebrow">Descriptions</p>
          <ul>{blueprint.meta.descriptions.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="eyebrow">Retargeting variant</p>
          <small>{blueprint.meta.retargeting.primaryText}</small>
          <p className="eyebrow">Conversion variant</p>
          <small>{blueprint.meta.conversion.primaryText}</small>
        </div>
        <div className="blueprint-card">
          <h4>Google RSA</h4>
          <p className="eyebrow">Headlines (10)</p>
          <ul>{blueprint.google.headlines.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="eyebrow">Descriptions (4)</p>
          <ul>{blueprint.google.descriptions.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="eyebrow">Callouts</p>
          <ul>{blueprint.google.callouts.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="eyebrow">Sitelinks</p>
          <ul>{blueprint.google.sitelinks.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="eyebrow">Call extension</p>
          <small>{blueprint.google.callExtension}</small>
        </div>
      </div>
    </section>
  );
};

export default CampaignBlueprintPanel;
