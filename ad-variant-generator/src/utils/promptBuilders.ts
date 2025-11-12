import { AdVariant, FormValues, RemixIntent } from '../types';

export const SYSTEM_PROMPT = `Je bent een conversie-gedreven advertentie-copywriter.\nRegels:\n- Schrijf in de gevraagde taal en tone-of-vibe.\n- Houd platform-limieten aan (Google Ads: h≤30, d≤90; Meta: primary≤125, headline≤40; LinkedIn: intro≤150).\n- Gebruik natuurlijke zinnen: alleen het eerste woord en eigennamen krijgen hoofdletters.\n- Geen emoji's en geen streepjes '-' als opsomming; schrijf vloeiende zinnen.\n- Geef varianten kort, concreet, onderscheidend. Geen clichés.\n- Voeg 1 CTA per variant toe, afgestemd op doel (CTR / conversie / awareness).\n- Retourneer ALLEEN geldig JSON.\nJSON schema:\n{\n  "variants": [\n    {\n      "platform": "meta|google|linkedin|x|instagram",\n      "headline": "string or string[]",\n      "primaryText": "string",\n      "description": "string",\n      "cta": "string",\n      "notes": "string (optioneel)"\n    }\n  ],\n  "advice": "korte optimalisatie"\n}`;

export const buildUserPrompt = (values: FormValues): string => {
  return `Taak: Genereer ${values.variantCount} advertentievarianten.\nTaal: ${values.taal} (land/regio: ${values.regio}).\nPlatform: ${values.platform}.\nVibe: ${values.vibe}.\nDoel: ${values.doel}.\nContext:\n- Bedrijfsnaam: ${values.bedrijf}\n- Product/Aanbod: ${values.product}\n- Doelgroep: ${values.doelgroep}\n- Voordelen/USP: ${values.usp}\n- Differentiator t.o.v. concurrenten: ${values.diff}\n- Bezwaren die we moeten pareren: ${values.bezwaren}\n- Tone-of-voice: ${values.tone}\n- Verplichte woorden/claims: ${values.verplicht}\nSchrijf menselijk: natuurlijke zinnen, geen volledige woorden in hoofdletters. Houd je aan platform-limieten. Retourneer ALLEEN JSON volgens schema.`;
};

export const buildRemixPrompt = (intent: RemixIntent, variant: AdVariant): string => {
  return `Herschrijf onderstaande advertentievariant in dezelfde taal.\nDoel van remix: ${intent}, behoud boodschap.\nPlatform: ${variant.platform}. Respecteer limieten.\nVariant input (JSON):\n${JSON.stringify(variant, null, 2)}\nGeef ALLEEN JSON met hetzelfde schema.`;
};

export const buildScoringPrompt = (variant: AdVariant): string => {
  return `Beoordeel deze advertentievariant (1-10) op:\n- Duidelijkheid, Emotionele impact, Onderscheidend vermogen, CTA-sterkte.\nGeef voor elke dimensie een menselijk geformuleerde verbeteringstip (geen opsommingstekens of emoji's).\nSluit af met een korte samenvatting en één overkoepelende tip om de totaalscore te verhogen.\nGebruik natuurlijke zinnen met beperkte hoofdletters.\nGeef ALLEEN JSON:\n{\n  "clarity": { "score": 0-10, "tip": "..." },\n  "emotion": { "score": 0-10, "tip": "..." },\n  "distinctiveness": { "score": 0-10, "tip": "..." },\n  "ctaStrength": { "score": 0-10, "tip": "..." },\n  "total": 0-10,\n  "summary": "...",\n  "overallTip": "..."\n}\nInput:\n${JSON.stringify(variant, null, 2)}`;
};
