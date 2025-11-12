import React from 'react';
import { GptModel, VibePreset } from '../types';
import { MODEL_OPTIONS, VIBE_COLORS } from '../utils/constants';

interface ToolbarProps {
  language: string;
  onLanguageChange: (value: string) => void;
  variantCount: number;
  onVariantCountChange: (value: number) => void;
  selectedPreset: VibePreset;
  onPresetChange: (preset: VibePreset) => void;
  onToggleFavorites: () => void;
  model: GptModel;
  onModelChange: (model: GptModel) => void;
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
  model,
  onModelChange,
  advice,
  isGenerating,
  children,
}) => {
  const selectedModel = MODEL_OPTIONS.find((option) => option.value === model);

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
        <p className="toolbar-help">Tip: 3-6 varianten geeft genoeg om te testen zonder te overladen.</p>
      </div>
      <div className="toolbar-group">
        <label htmlFor="model-select">GPT-model</label>
        <select
          id="model-select"
          value={model}
          onChange={(event) => onModelChange(event.target.value as GptModel)}
        >
          {MODEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} title={option.description}>
              {option.label}
            </option>
          ))}
        </select>
        {selectedModel && <p className="toolbar-help">{selectedModel.description}</p>}
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
