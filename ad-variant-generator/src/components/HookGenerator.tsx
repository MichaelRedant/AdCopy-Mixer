import React, { useState } from 'react';
import { HOOK_CATEGORIES, HookCategory } from '../utils/hooks';

interface HookGeneratorProps {
  onGenerate: (category: HookCategory) => Promise<string[]>;
}

const HookGenerator: React.FC<HookGeneratorProps> = ({ onGenerate }) => {
  const [selected, setSelected] = useState<HookCategory>('shortPunch');
  const [hooks, setHooks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onGenerate(selected);
      setHooks(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Genereren mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="glass-panel hook-generator" aria-label="Auto-Hooks Generator">
      <div className="hook-header">
        <div>
          <p className="eyebrow">Auto-Hooks Generator</p>
          <h3>Hooks zonder brainstorm</h3>
          <p className="section-subtitle">Kies een categorie en krijg direct bruikbare hooks.</p>
        </div>
        <div className="hook-controls">
          <select value={selected} onChange={(e) => setSelected(e.target.value as HookCategory)}>
            {HOOK_CATEGORIES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="button" className="primary" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Even wachten...' : 'Genereer hooks'}
          </button>
        </div>
      </div>
      <div className="hook-tags">
        {HOOK_CATEGORIES.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`chip ${selected === item.key ? 'active' : ''}`}
            onClick={() => {
              setSelected(item.key);
              handleGenerate();
            }}
            disabled={isLoading}
            title={item.helper}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error && <p className="hint">{error}</p>}
      <div className="hook-list">
        {hooks.length === 0 ? (
          <p className="hint">Nog geen hooks. Klik op "Genereer hooks".</p>
        ) : (
          <ul>
            {hooks.map((hook) => (
              <li key={hook}>{hook}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default HookGenerator;
