import React from 'react';
import { FormValues, Platform } from '../types';
import { VIBE_OPTIONS } from '../utils/constants';

interface FormPanelProps {
  values: FormValues;
  onChange: (changes: Partial<FormValues>) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

const platformOptions: { value: Platform; label: string }[] = [
  { value: 'meta', label: 'Meta' },
  { value: 'google', label: 'Google Ads' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X / Twitter' },
  { value: 'instagram', label: 'Instagram' },
];

const FormPanel: React.FC<FormPanelProps> = ({ values, onChange, onSubmit, isGenerating }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    onChange({ [name]: value } as Partial<FormValues>);
  };

  return (
    <section className="form-panel" aria-label="Invoerformulier">
      <div className="form-row">
        <label htmlFor="product">Product / Aanbod</label>
        <textarea
          id="product"
          name="product"
          value={values.product}
          onChange={handleInputChange}
          maxLength={400}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="doelgroep">Doelgroep</label>
        <textarea
          id="doelgroep"
          name="doelgroep"
          value={values.doelgroep}
          onChange={handleInputChange}
          maxLength={400}
          required
        />
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="regio">Land / Regio</label>
          <input
            id="regio"
            name="regio"
            type="text"
            value={values.regio}
            onChange={handleInputChange}
            maxLength={80}
          />
        </div>
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="usp">Voordelen / USP</label>
          <textarea
            id="usp"
            name="usp"
            value={values.usp}
            onChange={handleInputChange}
            maxLength={400}
          />
        </div>
        <div className="form-row">
          <label htmlFor="diff">Differentiator</label>
          <textarea
            id="diff"
            name="diff"
            value={values.diff}
            onChange={handleInputChange}
            maxLength={400}
          />
        </div>
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="bezwaren">Bezwaren om te pareren</label>
          <textarea
            id="bezwaren"
            name="bezwaren"
            value={values.bezwaren}
            onChange={handleInputChange}
            maxLength={400}
          />
        </div>
        <div className="form-row">
          <label htmlFor="tone">Tone of voice</label>
          <textarea
            id="tone"
            name="tone"
            value={values.tone}
            onChange={handleInputChange}
            maxLength={400}
          />
        </div>
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="verplicht">Verplichte woorden / claims</label>
          <textarea
            id="verplicht"
            name="verplicht"
            value={values.verplicht}
            onChange={handleInputChange}
            maxLength={200}
          />
        </div>
        <div className="form-row select-row">
          <label htmlFor="platform">Platform</label>
          <select id="platform" name="platform" value={values.platform} onChange={handleInputChange}>
            {platformOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row select-row">
          <label htmlFor="vibe">Vibe</label>
          <select id="vibe" name="vibe" value={values.vibe} onChange={handleInputChange}>
            {VIBE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row select-row">
          <label htmlFor="doel">Doelstelling</label>
          <select id="doel" name="doel" value={values.doel} onChange={handleInputChange}>
            <option value="CTR">CTR</option>
            <option value="conversie">Conversie</option>
            <option value="awareness">Awareness</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="primary" onClick={onSubmit} disabled={isGenerating}>
          {isGenerating ? 'Genereren…' : 'Genereer varianten'}
        </button>
      </div>
    </section>
  );
};

export default FormPanel;
