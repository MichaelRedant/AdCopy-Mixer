# Architectuuroverzicht

Dit document beschrijft de belangrijkste bouwstenen van AdCopy Mixer en geeft richtlijnen voor toekomstige uitbreidingen.

## Kernconcepten
- **Advertentievarianten** – Entiteiten met koppen, primary text, beschrijving, CTA en evaluatie-scores. Types gedefinieerd in `src/types/variants.ts`.
- **Promptbouw** – Functies in `src/utils/prompts.ts` genereren instructies voor de OpenAI Chat Completions API.
- **State management** – `App.tsx` gebruikt React state en context (indien aanwezig) om formulierdata, varianten en favorieten te beheren.
- **Persistente opslag** – `src/utils/storage.ts` koppelt `localStorage` en `sessionStorage` voor favorieten en API-sleutels.

## Flow
1. Gebruiker vult het formulier (`FormPanel` component) en triggert een generatie.
2. `src/services/chatgpt.ts` bouwt de requestpayload op basis van formulierdata en roept de OpenAI API aan.
3. Het antwoord wordt gevalideerd en gemapt naar interne types (`src/utils/validation.ts`).
4. Variants worden weergegeven in `VariantCard` componenten en kunnen worden geremixed via helpers in `src/utils/remix.ts`.
5. Favorieten worden opgeslagen met helpers uit `src/utils/storage.ts` en weergegeven in de `FavoritesDrawer`.

## Creatieve formats
- `FormPanel` laat gebruikers nu een `adFormat` kiezen (`text`, `image`, `carousel`, `video`).
- Niet-tekstuele formats vragen een `assetDescription` zodat prompts de daadwerkelijke visuals (beeld, slides of video-scenes) kunnen benoemen.
- `buildUserPrompt` voegt format-gebonden richtlijnen en notes-instructies toe, zodat het model weet wanneer het overlaytekst of slide-hooks moet leveren.

## Styling
- Globale layout staat in `src/styles/globals.css` (CSS Grid voor variant-overzicht, modals, etc.).
- Component-specifieke stijlen horen bij voorkeur in hetzelfde bestand als de component of in submappen onder `src/styles/`.
- Houd thema-variabelen gegroepeerd; overweeg toekomstige migratie naar CSS-variabelen.

## API-integratie
- `services/chatgpt.ts` bevat fetch-calls. Elke call hoort request/response-interfaces te exporteren.
- Beperk side-effects: services mogen geen state muteren, enkel data retourneren.
- Voeg retry/backoff toe in een aparte utility (`src/utils/retry.ts`) indien nodig.

## Teststrategie (toekomst)
- **Unit-tests** – Gebruik Vitest of Jest voor utils en hooks.
- **Component-tests** – React Testing Library voor formulier- en variantcomponenten.
- **E2E** – Playwright of Cypress om de volledige flow te valideren.

## Uitbreidingen
- **Internationale ondersteuning** – Voeg i18n-config toe (bijv. `react-intl`).
- **Workflow-automatisering** – Introduceer linting (`eslint`), formatting (`prettier`), en type checking (`tsc --noEmit`).
- **Serverlaag** – Overweeg een proxy-service voor OpenAI-sleutels om security te verbeteren.

Werk deze gids bij wanneer nieuwe modules worden toegevoegd of bestaande flows veranderen.
