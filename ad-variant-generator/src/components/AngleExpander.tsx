import React, { useState } from 'react';
import { ANGLE_OPTIONS, AngleKey } from '../utils/angles';

interface AngleExpanderProps {
  onExpand: (angle: AngleKey) => void;
  isLoading?: boolean;
}

const AngleExpander: React.FC<AngleExpanderProps> = ({ onExpand, isLoading }) => {
  const [selected, setSelected] = useState<AngleKey>('problemFirst');

  return (
    <section className="glass-panel angle-expander" aria-label="Instant angle expander">
      <div className="angle-header">
        <div>
          <p className="eyebrow">Instant Angle Expander</p>
          <h3>Direct nieuwe campagnehoeken</h3>
          <p className="section-subtitle">Kies een angle, krijg 1-3 hooks + primary + headline.</p>
        </div>
        <div className="angle-controls">
          <select value={selected} onChange={(e) => setSelected(e.target.value as AngleKey)}>
            {ANGLE_OPTIONS.map((angle) => (
              <option key={angle.key} value={angle.key}>
                {angle.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="primary"
            onClick={() => onExpand(selected)}
            disabled={isLoading}
          >
            {isLoading ? 'Even wachten...' : 'Genereer angle'}
          </button>
        </div>
      </div>
      <div className="angle-tags">
        {ANGLE_OPTIONS.map((angle) => (
          <button
            key={angle.key}
            type="button"
            className={`chip ${selected === angle.key ? 'active' : ''}`}
            onClick={() => {
              setSelected(angle.key);
              onExpand(angle.key);
            }}
            disabled={isLoading}
            title={angle.helper}
          >
            {angle.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default AngleExpander;
