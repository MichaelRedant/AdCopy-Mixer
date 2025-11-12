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

const adFormatOptions = [
  { value: 'text', label: 'Tekstadvertentie' },
  { value: 'image', label: 'Afbeelding' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'video', label: 'Video' },
];

const FormPanel: React.FC<FormPanelProps> = ({ values, onChange, onSubmit, isGenerating }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    onChange({ [name]: value } as Partial<FormValues>);
  };

  return (
    <section className="form-panel glass-panel" aria-label="Invoerformulier">
      <div className="form-row">
        <label htmlFor="bedrijf">Bedrijfsnaam</label>
        <p className="form-help">Vul de naam in zoals klanten je kennen. Dit helpt het model om consistente merkverwijzingen te gebruiken.</p>
        <input
          id="bedrijf"
          name="bedrijf"
          type="text"
          value={values.bedrijf}
          onChange={handleInputChange}
          maxLength={120}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="product">Product / Aanbod</label>
        <p className="form-help">Beschrijf in een paar zinnen wat je aanbiedt en waarom het relevant is.</p>
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
        <p className="form-help">Omschrijf wie je wilt aanspreken. Denk aan beroep, situatie of uitdaging.</p>
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
          <p className="form-help">Geef aan waar je campagne loopt zodat de toon en voorbeelden daarop aansluiten.</p>
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
          <p className="form-help">Som je belangrijkste troeven op. Hoe help je de klant concreet vooruit?</p>
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
          <p className="form-help">Leg uit waarin je afwijkt van concurrenten. Denk aan prijs, service of aanpak.</p>
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
          <p className="form-help">Welke twijfels hoor je vaak? Geef ze mee zodat het model ze kan neutraliseren.</p>
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
          <p className="form-help">Omschrijf hoe de advertentie moet klinken: speels, zakelijk, warm, …</p>
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
          <p className="form-help">Noteer wettelijke vermeldingen of merkslogans die zeker terug moeten komen.</p>
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
          <p className="form-help">Kies waar de advertentie verschijnt zodat het model de juiste lengte en stijl hanteert.</p>
          <select id="platform" name="platform" value={values.platform} onChange={handleInputChange}>
            {platformOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row select-row">
          <label htmlFor="adFormat">Advertentieformat</label>
          <p className="form-help">Bepaal of het om een tekstuele, beeld-, carousel- of videoadvertentie gaat.</p>
          <select id="adFormat" name="adFormat" value={values.adFormat} onChange={handleInputChange}>
            {adFormatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row select-row">
          <label htmlFor="vibe">Vibe</label>
          <p className="form-help">Selecteer de creatieve richting die bij je merk past.</p>
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
          <p className="form-help">Wat wil je bereiken met deze campagne: klikken, conversies of naamsbekendheid?</p>
          <select id="doel" name="doel" value={values.doel} onChange={handleInputChange}>
            <option value="CTR">CTR</option>
            <option value="conversie">Conversie</option>
            <option value="awareness">Awareness</option>
          </select>
        </div>
      </div>
      {values.adFormat !== 'text' && (
        <div className="form-row">
          <label htmlFor="assetDescription">Omschrijving van je visual / video</label>
          <p className="form-help">
            Beschrijf wat er op de afbeelding, carousel-slides of video te zien is. Zo kan de copy perfect inhaken op het beeld.
          </p>
          <textarea
            id="assetDescription"
            name="assetDescription"
            value={values.assetDescription}
            onChange={handleInputChange}
            maxLength={500}
            required={values.adFormat !== 'text'}
          />
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="primary" onClick={onSubmit} disabled={isGenerating}>
          {isGenerating ? 'Genereren…' : 'Genereer varianten'}
        </button>
      </div>
    </section>
  );
};

export default FormPanel;
