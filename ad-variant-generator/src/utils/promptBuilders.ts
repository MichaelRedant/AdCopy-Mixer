import { AdVariant, AdFormat, FormValues, RemixIntent, ScoreMetricKey } from '../types';

export const SYSTEM_PROMPT = `Je bent een conversie-gedreven advertentie-copywriter.\nRegels:\n- Schrijf in de gevraagde taal en tone-of-vibe.\n- Houd platform-limieten aan (Google Ads: h≤30, d≤90; Meta: primary≤125, headline≤40; LinkedIn: intro≤150).\n- Gebruik natuurlijke zinnen: alleen het eerste woord en eigennamen krijgen hoofdletters.\n- Geen emoji's en geen streepjes '-' als opsomming; schrijf vloeiende zinnen.\n- Geef varianten kort, concreet, onderscheidend. Geen clichés.\n- Voeg 1 CTA per variant toe, afgestemd op doel (CTR / conversie / awareness).\n- Retourneer ALLEEN geldig JSON.\nJSON schema:\n{\n  "variants": [\n    {\n      "platform": "meta|google|linkedin|x|instagram",\n      "headline": "string or string[]",\n      "primaryText": "string",\n      "description": "string",\n      "cta": "string",\n      "notes": "string (optioneel)"\n    }\n  ],\n  "advice": "korte optimalisatie"\n}`;

const formatGuidance: Record<AdFormat, string> = {
  text: 'Puur tekstadvertentie: richt je enkel op copy zonder visuals.',
  image:
    'Afbeeldingsadvertentie: vermeld in het veld "notes" welke overlaytekst of tagline op het beeld moet staan en zorg dat primary text en headline naar het beeld verwijzen.',
  carousel:
    'Carousel: gebruik "notes" om maximaal drie slides te beschrijven ("Slide 1:", "Slide 2:", …) met korte hooks die de visuals begeleiden.',
  video:
    'Video: beschrijf in "notes" een openingshaak en eindframe overlaytekst die bij het script past.',
};

export const buildUserPrompt = (values: FormValues): string => {
  const assetContext =
    values.adFormat === 'text'
      ? 'Er is geen visueel asset; de copy moet zelfstandig werken zonder beeldbeschrijving.'
      : `Visueel asset type: ${values.adFormat}. Beschrijving van de beelden/slides/scenes: ${
          values.assetDescription || 'niet opgegeven, bedenk een logische insteek'
        }. Laat de copy en notes aansluiten op dit materiaal.`;

  return `Taak: Genereer ${values.variantCount} advertentievarianten.\nTaal: ${values.taal} (land/regio: ${values.regio}).\nPlatform: ${values.platform}.\nVibe: ${values.vibe}.\nDoel: ${values.doel}.\nFormat: ${values.adFormat}.\nFormat instructies: ${formatGuidance[values.adFormat]}\n${assetContext}\nContext:\n- Bedrijfsnaam: ${values.bedrijf}\n- Product/Aanbod: ${values.product}\n- Doelgroep: ${values.doelgroep}\n- Voordelen/USP: ${values.usp}\n- Differentiator t.o.v. concurrenten: ${values.diff}\n- Bezwaren die we moeten pareren: ${values.bezwaren}\n- Tone-of-voice: ${values.tone}\n- Verplichte woorden/claims: ${values.verplicht}\nSchrijf menselijk: natuurlijke zinnen, geen volledige woorden in hoofdletters. Houd je aan platform-limieten en stem copy af op het gekozen format. Retourneer ALLEEN JSON volgens schema.`;
};

export const buildRemixPrompt = (intent: RemixIntent, variant: AdVariant): string => {
  return `Herschrijf onderstaande advertentievariant in dezelfde taal.\nDoel van remix: ${intent}, behoud boodschap.\nPlatform: ${variant.platform}. Respecteer limieten.\nVariant input (JSON):\n${JSON.stringify(variant, null, 2)}\nGeef ALLEEN JSON met hetzelfde schema.`;
};

export const buildScoringPrompt = (variant: AdVariant): string => {
  return `Beoordeel deze advertentievariant (1-10) op:\n- Duidelijkheid, Emotionele impact, Onderscheidend vermogen, CTA-sterkte.\nGeef voor elke dimensie een menselijk geformuleerde verbeteringstip (geen opsommingstekens of emoji's).\nSluit af met een korte samenvatting en één overkoepelende tip om de totaalscore te verhogen.\nGebruik natuurlijke zinnen met beperkte hoofdletters.\nGeef ALLEEN JSON:\n{\n  "clarity": { "score": 0-10, "tip": "..." },\n  "emotion": { "score": 0-10, "tip": "..." },\n  "distinctiveness": { "score": 0-10, "tip": "..." },\n  "ctaStrength": { "score": 0-10, "tip": "..." },\n  "total": 0-10,\n  "summary": "...",\n  "overallTip": "..."\n}\nInput:\n${JSON.stringify(variant, null, 2)}`;
};

const metricLabels: Record<ScoreMetricKey, string> = {
  clarity: 'duidelijkheid',
  emotion: 'emotionele impact',
  distinctiveness: 'onderscheidend vermogen',
  ctaStrength: 'CTA-sterkte',
};

const metricFocusGuidance: Record<ScoreMetricKey, string> = {
  clarity:
    'Focus op headline en primary text. Splits lange zinnen, verwijder herhalingen en zorg dat de kernboodschap in de eerste zin duidelijk is. Pas de CTA alleen aan als de tip daar expliciet om vraagt.',
  emotion:
    'Gebruik krachtige benefit-first zinnen in primary text en description om gevoel op te wekken. Voeg 1 concrete emotionele trigger toe (bijv. een belofte of angst voor gemiste kans) maar behoud platformlimieten.',
  distinctiveness:
    'Leg meer nadruk op het unieke aanbod. Actualiseer headline, primary text en eventueel notes met een duidelijk differentiërend element dat niet in de huidige variant zit.',
  ctaStrength:
    "Pas in elk geval het veld 'cta' aan. Als de tip een specifieke CTA in quotes bevat, neem die letterlijk over. Voeg indien nodig één ondersteunende zin in primary text of description toe die de CTA logischer maakt.",
};

export const buildTipApplicationPrompt = (
  metric: ScoreMetricKey,
  currentTip: string,
  variant: AdVariant,
): string => {
  return `Je bent een performance copywriter die advertentievarianten direct verbetert.\nDoel:\n- Pas de copy zodanig aan dat het verbeterpunt voor "${metricLabels[metric]}" uit de tip volledig wordt toegepast.\n- Focus: ${metricFocusGuidance[metric]}\n- Als de tip letterlijke copy voorstelt, neem die tekst ongewijzigd over in het relevante veld.\n- Wijzig alleen de velden die echt nodig zijn om het advies te realiseren en behoud tone-of-voice en platformlimieten.\n- Lever enkel een nieuwe variant terug; de originele tip blijft zichtbaar in de scorekaart.\nGeef ALLEEN JSON volgens schema:\n{\n  "variant": {\n    "platform": "meta|google|linkedin|x|instagram",\n    "headline": "string of string[]",\n    "primaryText": "string",\n    "description": "string",\n    "cta": "string",\n    "notes": "optioneel"\n  }\n}\nOriginele advertentie:\n${JSON.stringify(variant, null, 2)}\nTip die moet worden toegepast:\n"${currentTip}"`;
};
