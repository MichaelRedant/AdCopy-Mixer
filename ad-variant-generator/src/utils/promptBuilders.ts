import { AdVariant, AdFormat, FormValues, RemixIntent, ScoreMetricKey } from '../types';
import { AngleKey } from './angles';
import { HookCategory } from './hooks';
import { CampaignBlueprint } from '../types';

export const SYSTEM_PROMPT = `Je bent een campagne-architect en conversie-gedreven advertentiecopywriter.
Regels:
- Schrijf in de gevraagde taal en tone-of-vibe.
- Volg de opgegeven persona als die is meegegeven en houd de stem consistent.
- Houd platform-limieten aan (Google Ads: h<=30, d<=90; Meta: primary<=125, headline<=40; LinkedIn: intro<=150; YouTube: headline<=70, description<=90).
- Gebruik natuurlijke zinnen: alleen het eerste woord en eigennamen krijgen hoofdletters.
- Geen emoji's en geen streepjes '-' als opsomming; schrijf vloeiende zinnen.
- Geef varianten kort, concreet, onderscheidend. Geen cliches.
- Voeg 1 CTA per variant toe, afgestemd op de doelactie.
- Retourneer ALLEEN geldig JSON.
JSON schema:
{
  "architecture": { // optioneel, alleen wanneer gevraagd
    "hooks": { "problems": [], "dreams": [], "objections": [], "urgency": [] },
    "propositions": { "usps": [], "rtbs": [], "socialProofs": [] },
    "angles": { "painFirst": [], "dreamFirst": [], "proofFirst": [], "objectionFirst": [] }
  },
  "variants": [
    {
      "platform": "meta|google|linkedin|x|instagram|youtube",
      "headline": "string or string[]",
      "primaryText": "string",
      "description": "string",
      "cta": "string",
      "notes": "string (optioneel)"
    }
  ],
  "advice": "korte optimalisatie"
}`;

const formatGuidance: Record<AdFormat, string> = {
  text: 'Puur tekstadvertentie: richt je enkel op copy zonder visuals.',
  image:
    'Afbeeldingsadvertentie: vermeld in het veld "notes" welke overlaytekst of tagline op het beeld moet staan en zorg dat primary text en headline naar het beeld verwijzen.',
  carousel:
    'Carousel: gebruik "notes" om maximaal drie slides te beschrijven ("Slide 1:", "Slide 2:", enz.) met korte hooks die de visuals begeleiden.',
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

  const personaContext = values.persona.trim()
    ? `Persona: ${values.persona.trim()}. Hanteer deze rol in toon en woordkeuze.`
    : 'Persona: geen specifieke persona opgegeven; schrijf neutraal en merkconform.';

  const briefingBlock = `Mini-briefing:
- Campagnedoel (funnel): ${values.campaignGoal}
- Doelactie: ${values.actionGoal}
- Doelgroep-temperatuur: ${values.audienceTemperature}
- Kern-aanbod: ${values.coreOffer || 'niet opgegeven, kies een passend aanbod'}`
    ;

  return `Taak: Genereer eerst een compacte campagne-architectuur en daarna ${values.variantCount} advertentievarianten die erop aansluiten.
${briefingBlock}
Taal: ${values.taal} (land/regio: ${values.regio}).
Platform: ${values.platform}.
Vibe: ${values.vibe}.
Format: ${values.adFormat}.
Format instructies: ${formatGuidance[values.adFormat]}
${assetContext}
${personaContext}
Context:
- Bedrijfsnaam: ${values.bedrijf}
- Product/Aanbod: ${values.product}
- Doelgroep: ${values.doelgroep}
- Voordelen/USP: ${values.usp}
- Differentiator t.o.v. concurrenten: ${values.diff}
- Bezwaren die we moeten pareren: ${values.bezwaren}
- Tone-of-voice: ${values.tone}
- Verplichte woorden/claims: ${values.verplicht}
Lever JSON met twee delen:
1) "architecture": schrijf per onderdeel maximaal 3 bullets:
   - hooks: problems, dreams, objections, urgency hooks.
   - propositions: USPs, RTBs, social proofs.
   - angles: pain-first, dream-first, proof-first, objection-first.
2) "variants": advertentievarianten die de gekozen hooks/proposities/angles benutten.
Schrijf menselijk: natuurlijke zinnen, geen volledige woorden in hoofdletters. Houd je aan platform-limieten en stem copy af op het gekozen format. Retourneer ALLEEN JSON volgens schema.`;
};

export const buildRemixPrompt = (intent: RemixIntent, variant: AdVariant, persona?: string): string => {
  const personaContext = persona?.trim()
    ? `Persona: ${persona.trim()}. Houd dezelfde rol en toon aan in de remix.`
    : 'Persona: geen specifieke persona opgegeven; behoud de stijl uit de inputvariant.';

  return `Herschrijf onderstaande advertentievariant in dezelfde taal.
Doel van remix: ${intent}, behoud boodschap.
Platform: ${variant.platform}. Respecteer limieten.
${personaContext}
Variant input (JSON):
${JSON.stringify(variant, null, 2)}
Geef ALLEEN JSON met hetzelfde schema.`;
};

export const buildAngleExpandPrompt = (
  angle: AngleKey,
  values: FormValues,
): string => {
  return `Genereer een mini-set voor angle "${angle}":
- 1 tot 3 hooks
- 1 primary tekst
- 1 headline
Gebruik de taal en tone-of-vibe uit de briefing. Houd het kort en direct bruikbaar.
Context:
- Bedrijfsnaam: ${values.bedrijf}
- Product/Aanbod: ${values.product}
- Doelgroep: ${values.doelgroep}
- USP's: ${values.usp}
- Differentiator: ${values.diff}
- Bezwaren: ${values.bezwaren}
- Tone-of-voice: ${values.tone}
- Platform: ${values.platform}
Geef ALLEEN geldig JSON:
{
  "hooks": ["..."],
  "primaryText": "...",
  "headline": "..."
}`;
};

export const buildScoringPrompt = (variant: AdVariant, performanceContext?: string): string => {
  const perfBlock = performanceContext
    ? `Historische performance hints: ${performanceContext}\nGebruik dit als richting bij je beoordeling en tips.`
    : 'Geen historische performance data beschikbaar; baseer je op best practices.';

  return `Beoordeel deze advertentievariant (0-100) op:
- Relevantie voor doelgroep
- Duidelijkheid & eenvoud
- Sterkte van value proposition
- Emotionele impact / hook
- CTA-kracht
- Platform-fit (past dit op het gekozen platform)
- Originaliteit / differentiatie
${perfBlock}
Geef voor elke dimensie een menselijk geformuleerde verbeteringstip (geen opsommingstekens of emoji's).
Sluit af met een korte samenvatting en een overkoepelende tip om de totaalscore te verhogen.
Gebruik natuurlijke zinnen met beperkte hoofdletters.
Geef ALLEEN JSON:
{
  "relevance": { "score": 0-100, "tip": "..." },
  "clarity": { "score": 0-100, "tip": "..." },
  "valueProposition": { "score": 0-100, "tip": "..." },
  "emotionHook": { "score": 0-100, "tip": "..." },
  "ctaPower": { "score": 0-100, "tip": "..." },
  "platformFit": { "score": 0-100, "tip": "..." },
  "originality": { "score": 0-100, "tip": "..." },
  "total": 0-100,
  "summary": "...",
  "overallTip": "..."
}
Input:
${JSON.stringify(variant, null, 2)}`;
};

const metricLabels: Record<ScoreMetricKey, string> = {
  relevance: 'relevantie voor doelgroep',
  clarity: 'duidelijkheid & eenvoud',
  valueProposition: 'sterkte value proposition',
  emotionHook: 'emotionele impact / hook',
  ctaPower: 'CTA-kracht',
  platformFit: 'platform-fit',
  originality: 'originaliteit / differentiatie',
};

export const buildTipRemixPrompt = (
  metric: ScoreMetricKey,
  currentTip: string,
  variant: AdVariant,
): string => {
  return `Herschrijf alleen de verbeteringstip voor de dimensie "${metricLabels[metric]}".
- Houd vast aan hetzelfde advies maar maak het concreter en actiegerichter.
- Gebruik maximaal twee korte zinnen, geen opsommingstekens of emoji's.
- Houd taal en tone-of-voice gelijk aan de advertentievariant.
Geef ALLEEN JSON:
{
  "tip": "..."
}
Advertentievariant:
${JSON.stringify(variant, null, 2)}
Huidige tip:
"${currentTip}"`;
};

export const buildTipApplicationPrompt = (
  metric: ScoreMetricKey,
  tip: string,
  variant: AdVariant,
  persona?: string,
): string => {
  const personaContext = persona?.trim()
    ? `Persona: ${persona.trim()}. Houd de toon en woordkeuze van deze rol aan.`
    : 'Persona: geen specifieke persona opgegeven; behoud de huidige tone-of-voice.';

  return `Pas onderstaande verbeteringstip toe op de advertentievariant. Herschrijf de variant zodat dit aspect merkbaar verbetert.
Focus: ${metricLabels[metric]}.
Tip: "${tip}"
${personaContext}
Platform: ${variant.platform}. Respecteer platform-limieten.
Geef ALLEEN JSON met exact hetzelfde schema als de inputvariant (platform, headline, primaryText, description, cta, notes).
Inputvariant (JSON):
${JSON.stringify(variant, null, 2)}`;
};

export const buildHookGeneratorPrompt = (category: HookCategory, values: FormValues): string => {
  const categoryLabel = {
    shortPunch: 'Short punch <40 tekens',
    questions: 'Questions',
    challenge: 'Challenge hooks',
    data: 'Data/number hooks',
    pain: 'Pain hooks',
    dream: 'Dream hooks',
    objection: 'Objection-busting hooks',
  }[category];

  return `Genereer 5 hooks in de categorie "${categoryLabel}".
- Schrijf in de taal en tone uit de briefing.
- Houd het kort, menselijk en zonder emoji's.
- Gebruik het product/aanbod, doelgroep en USP's.
Context:
- Bedrijfsnaam: ${values.bedrijf}
- Product/Aanbod: ${values.product}
- Doelgroep: ${values.doelgroep}
- USP's: ${values.usp}
- Differentiator: ${values.diff}
- Bezwaren: ${values.bezwaren}
- Tone-of-voice: ${values.tone}
- Platform: ${values.platform}
Geef ALLEEN JSON:
{
  "hooks": ["..."]
}`;
};

export const buildBlueprintPrompt = (values: FormValues): string => {
  return `Campagne Blueprint generator.
Lever een pakket zonder dat ik moet bijsturen.

META pakket:
- 3 primary texts
- 5 headlines
- 2 descriptions
- 1 retargeting variant (primary, headline, description, CTA passend bij warm publiek)
- 1 conversion variant (primary, headline, description, CTA sterk conversiegericht)

GOOGLE SEARCH (RSA) pakket:
- 10 headlines
- 4 descriptions
- 1 callout extension pakket (meerdere callouts)
- 1 sitelink-suggestie pakket (meerdere sitelinks)
- 1 call extension tekst

Context:
- Bedrijfsnaam: ${values.bedrijf}
- Product/Aanbod: ${values.product}
- Doelgroep: ${values.doelgroep}
- USP's: ${values.usp}
- Differentiator: ${values.diff}
- Bezwaren: ${values.bezwaren}
- Tone-of-voice: ${values.tone}
- Platform focus: ${values.platform}
- Vibe: ${values.vibe}

Schrijf kort, concrete CTA's, geen emoji's. Houd Meta velden binnen redelijke lengtes; RSA headlines <=30, descriptions <=90.
Geef ALLEEN JSON:
{
  "meta": {
    "primaryTexts": ["..."],
    "headlines": ["..."],
    "descriptions": ["..."],
    "retargeting": { "platform": "meta", "headline": "...", "primaryText": "...", "description": "...", "cta": "...", "notes": "" },
    "conversion": { "platform": "meta", "headline": "...", "primaryText": "...", "description": "...", "cta": "...", "notes": "" }
  },
  "google": {
    "headlines": ["..."],
    "descriptions": ["..."],
    "callouts": ["..."],
    "sitelinks": ["..."],
    "callExtension": "..."
  }
}`;
};

export const buildNamingPrompt = (values: FormValues): string => {
  return `Genereer 6 naamconventies voor advertentie assets. Gebruik duidelijke componenten:
- Platform (META/GOOGLE/LI)
- Funnel (AWARE/CONV/RET)
- Angle (HOOK/FEATURE/PROOF/OFFER/FOMO/etc.)
- Kern USP's of aanbod
- Versie (_v1, _v2)

Voorbeelden:
META_CONV_HOOK-FEATURE_PROOF_OFFER20_v3
GOOGLE_SEARCH_BRAND+USP1+USP2_TESTB_v1

Context:
- Bedrijf: ${values.bedrijf}
- Product: ${values.product}
- USP's: ${values.usp}
- Differentiator: ${values.diff}
- Doel: ${values.doel}
- Vibe: ${values.vibe}
Schrijf in uppercase, gebruik underscores en plusjes voor componenten. Geen emoji's. Geef ALLEEN JSON:
{
  "names": ["..."]
}`;
};
