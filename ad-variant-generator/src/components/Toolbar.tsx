import React from 'react';
import { VibePreset } from '../types';
import { VIBE_COLORS } from '../utils/constants';

interface ToolbarProps {
  language: string;
  onLanguageChange: (value: string) => void;
  variantCount: number;
  onVariantCountChange: (value: number) => void;
  selectedPreset: VibePreset;
  onPresetChange: (preset: VibePreset) => void;
  onToggleFavorites: () => void;
  advice?: string;
  isGenerating: boolean;
  children?: React.ReactNode;
}

const Toolbar: React.FC<ToolbarProps> = ({
  language,
  onLanguageChange,
  variantCount,
  onVariantCountChange,
  selectedPreset,
  onPresetChange,
  onToggleFavorites,
  advice,
  isGenerating,
  children,
}) => {
  return (
    <header className="toolbar" aria-label="Instellingen">
      <div className="toolbar-group">
        <label htmlFor="language-select">Taal</label>
        <select
          id="language-select"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
        >
          <option value="nl-NL">Nederlands (NL)</option>
          <option value="nl-BE">Nederlands (BE)</option>
          <option value="en-GB">English (UK)</option>
          <option value="en-US">English (US)</option>
          <option value="fr-FR">Français (FR)</option>
        </select>
      </div>
      <div className="toolbar-group">
        <label htmlFor="variant-count">Aantal varianten</label>
        <input
          id="variant-count"
          type="number"
          min={3}
          max={6}
          value={variantCount}
          onChange={(event) => onVariantCountChange(Number(event.target.value))}
        />
      </div>
      <div className="toolbar-group presets" role="group" aria-label="Vibe presets">
        {Object.entries(VIBE_COLORS).map(([preset, color]) => (
          <button
            key={preset}
            type="button"
            className={`preset ${selectedPreset === preset ? 'active' : ''}`}
            style={{
              borderColor: color,
              background: selectedPreset === preset ? color : 'transparent',
              color: selectedPreset === preset ? '#fff' : color,
            }}
            onClick={() => onPresetChange(preset as VibePreset)}
          >
            {preset}
          </button>
        ))}
      </div>
      <div className="toolbar-group actions">
        <button type="button" onClick={onToggleFavorites} className="toolbar-button">
          Favorieten
        </button>
        {children}
      </div>
      {advice && (
        <div className="toolbar-advice" aria-live="polite">
          <strong>Optimalisatie-tip:</strong> {advice}
        </div>
      )}
      {isGenerating && <div className="toolbar-status">Varianten worden geladen…</div>}
    </header>
  );
};

export default Toolbar;
