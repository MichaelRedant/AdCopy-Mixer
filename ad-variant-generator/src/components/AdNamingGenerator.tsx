import React, { useState } from 'react';

interface AdNamingGeneratorProps {
  onGenerate: () => Promise<string[]>;
}

const AdNamingGenerator: React.FC<AdNamingGeneratorProps> = ({ onGenerate }) => {
  const [names, setNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onGenerate();
      setNames(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Naamgeneratie mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="glass-panel naming-panel" aria-label="Ad Naming Convention Generator">
      <div className="naming-header">
        <div>
          <p className="eyebrow">Ad Naming Convention Generator</p>
          <h3>Consistente campagnestructuur</h3>
          <p className="section-subtitle">Voorbeelden zoals META_CONV_HOOK-FEATURE_PROOF_OFFER20_v3.</p>
        </div>
        <button type="button" className="primary" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Bezig...' : 'Genereer namen'}
        </button>
      </div>
      {error && <p className="hint">{error}</p>}
      <ul className="naming-list">
        {names.length === 0 ? (
          <li className="hint">Nog geen suggesties. Klik op “Genereer namen”.</li>
        ) : (
          names.map((name) => <li key={name}>{name}</li>)
        )}
      </ul>
    </section>
  );
};

export default AdNamingGenerator;
