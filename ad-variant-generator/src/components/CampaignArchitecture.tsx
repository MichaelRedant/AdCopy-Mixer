import React from 'react';
import { CampaignArchitecture } from '../types';

interface CampaignArchitectureProps {
  architecture: CampaignArchitecture;
  accentColor: string;
}

const CampaignArchitecturePanel: React.FC<CampaignArchitectureProps> = ({ architecture, accentColor }) => {
  const { hooks, propositions, angles } = architecture;

  const renderList = (title: string, items: string[]) => (
    <div className="architecture-block">
      <p className="architecture-subtitle">{title}</p>
      {items.length === 0 ? (
        <p className="architecture-empty">Geen suggesties</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <section
      className="architecture-panel glass-panel"
      aria-label="Campagne architectuur"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      <header className="architecture-header" style={{ borderColor: accentColor }}>
        <div>
          <span className="architecture-badge" style={{ backgroundColor: accentColor }}>
            Campagne architect
          </span>
          <h3>Hooks, proposities en angles</h3>
          <p className="architecture-lead">
            Gebaseerd op de mini-briefing. Gebruik deze blokken als startpunt voor varianten en experimenten.
          </p>
        </div>
      </header>
      <div className="architecture-grid">
        <div className="architecture-card">
          <h4>Hooks</h4>
          <div className="architecture-columns">
            {renderList('Problems', hooks.problems)}
            {renderList('Dreams', hooks.dreams)}
            {renderList('Objections', hooks.objections)}
            {renderList('Urgency', hooks.urgency)}
          </div>
        </div>
        <div className="architecture-card">
          <h4>Proposities</h4>
          <div className="architecture-columns">
            {renderList('USPs', propositions.usps)}
            {renderList('RTBs', propositions.rtbs)}
            {renderList('Social proof', propositions.socialProofs)}
          </div>
        </div>
        <div className="architecture-card">
          <h4>Angles</h4>
          <div className="architecture-columns">
            {renderList('Pain-first', angles.painFirst)}
            {renderList('Dream-first', angles.dreamFirst)}
            {renderList('Proof-first', angles.proofFirst)}
            {renderList('Objection-first', angles.objectionFirst)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampaignArchitecturePanel;
