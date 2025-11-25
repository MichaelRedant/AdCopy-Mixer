import React, { useMemo, useState } from 'react';

type PresetKey = 'meta' | 'google' | 'linkedin';

interface UTMBuilderProps {
  defaultCampaign?: string;
  platform?: PresetKey;
  onCopy?: (url: string) => void;
  onError?: (message: string) => void;
}

const PRESETS: Record<
  PresetKey,
  { label: string; source: string; medium: string; campaignTemplate: string }
> = {
  meta: { label: 'Meta', source: 'facebook', medium: 'paid_social', campaignTemplate: 'meta_campaign' },
  google: { label: 'Google', source: 'google', medium: 'cpc', campaignTemplate: 'gads_campaign' },
  linkedin: { label: 'LinkedIn', source: 'linkedin', medium: 'paid_social', campaignTemplate: 'li_campaign' },
};

const UTMBuilder: React.FC<UTMBuilderProps> = ({ defaultCampaign, platform, onCopy, onError }) => {
  const [baseUrl, setBaseUrl] = useState('');
  const [preset, setPreset] = useState<PresetKey>(platform ?? 'meta');
  const [campaign, setCampaign] = useState(defaultCampaign ?? '');
  const [content, setContent] = useState('');
  const [term, setTerm] = useState('');

  React.useEffect(() => {
    if (platform && platform !== preset) {
      setPreset(platform);
    }
  }, [platform, preset]);

  const presetConfig = PRESETS[preset];

  const url = useMemo(() => {
    if (!baseUrl.trim()) return '';
    const params = new URLSearchParams();
    params.set('utm_source', presetConfig.source);
    params.set('utm_medium', presetConfig.medium);
    params.set('utm_campaign', campaign || presetConfig.campaignTemplate);
    if (content.trim()) params.set('utm_content', content.trim());
    if (term.trim()) params.set('utm_term', term.trim());
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.toString()}`;
  }, [baseUrl, presetConfig, campaign, content, term]);

  const handleCopy = async () => {
    if (!url) {
      onError?.('Vul eerst een bestemming in.');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      onCopy?.(url);
    } catch (error) {
      onError?.('Kopiëren mislukt.');
    }
  };

  return (
    <section className="glass-panel utm-panel" aria-label="UTM-builder">
      <header className="utm-header">
        <div>
          <p className="eyebrow">UTM-helper</p>
          <h3>Kleine UTM-builder</h3>
          <p className="section-subtitle">Met presets voor Meta, Google en LinkedIn.</p>
        </div>
        <select value={preset} onChange={(e) => setPreset(e.target.value as PresetKey)}>
          {Object.entries(PRESETS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
      </header>
      <div className="utm-grid">
        <label>
          Bestemmings-URL
          <input
            type="text"
            placeholder="https://jouwdomein.com/landing"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </label>
        <label>
          Campaign
          <input
            type="text"
            placeholder={presetConfig.campaignTemplate}
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
          />
        </label>
        <label>
          Content
          <input
            type="text"
            placeholder="headline_a | hook_cijfer"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <label>
          Term
          <input
            type="text"
            placeholder="zoekwoord"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </label>
      </div>
      <div className="utm-actions">
        <div className="utm-preview">
          <p className="eyebrow">Voorbeeld</p>
          <code className="utm-url">{url || 'Vul velden om UTM-link te zien'}</code>
        </div>
        <button type="button" className="primary" onClick={handleCopy} disabled={!url}>
          Kopieer UTM-link
        </button>
      </div>
    </section>
  );
};

export default UTMBuilder;
