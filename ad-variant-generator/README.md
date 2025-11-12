# AdCopy Mixer

AdCopy Mixer is een Vite/React-applicatie waarmee marketeers razendsnel meerdere advertentievarianten kunnen genereren, remixen en beoordelen met hulp van de OpenAI ChatGPT API. De app bewaakt platformlimieten, maakt het eenvoudig om varianten te vergelijken en slaat favorieten lokaal op.

## Inhoudsopgave
- [Hoogtepunten](#hoogtepunten)
- [Architectuur in vogelvlucht](#architectuur-in-vogelvlucht)
- [Systeemvereisten](#systeemvereisten)
- [Installatie & eerste run](#installatie--eerste-run)
- [Ontwikkelworkflow](#ontwikkelworkflow)
- [Beschikbare scripts](#beschikbare-scripts)
- [Configuratie & geheimen](#configuratie--geheimen)
- [Directorystructuur](#directorystructuur)
- [Documentatie](#documentatie)
- [Contributie](#contributie)
- [Licentie](#licentie)

## Hoogtepunten
- **Slim formulier** – Verzamel product, doelgroep, USP's, differentiatoren, bezwaren, tone-of-voice en verplichte claims in één workflow.
- **Toolbar met presets** – Kies taal, aantal varianten (3–6) en vibe-preset (playful, urgent, luxe, betrouwbaar, rebels, minimal, warm, no-nonsense, premium).
- **Multi-variant output** – Toon 3–6 blokken met headline(s), primary text, description, CTA, notes en platform-waarschuwingen.
- **Remix & scoring** – Remix varianten per doel (scherper, korter, krachtiger, informeler, premium) en herbereken AI-score op duidelijkheid, emotie, onderscheidend vermogen en CTA-sterkte.
- **Favorieten & export** – Bewaar varianten in `localStorage`, filter in de zijlade en exporteer naar CSV of JSON.
- **Runtime API key** – OpenAI-sleutels blijven in `sessionStorage` en kunnen op elk moment worden gewijzigd.

## Architectuur in vogelvlucht
De frontend bestaat uit één Vite-project met React 18 en TypeScript. De kernonderdelen zijn:
- **`App.tsx`** – Houdt globale state en high-level layout bij.
- **Componenten** – UI-elementen, formulieren, kaarten, modals en toolbars in `src/components/`.
- **Hooks** – Herbruikbare logica (bijv. toastmanagement) in `src/hooks/`.
- **Services** – API-abstracties (OpenAI ChatGPT) in `src/services/`.
- **Utils** – Prompt-builders, opslaghelpers, exportfuncties en validatie in `src/utils/`.
- **Styles** – Globale CSS en component-specifieke stijlen in `src/styles/`.

Meer details en toekomstige uitbreidingsrichtingen vind je in [`docs/architecture.md`](docs/architecture.md).

## Systeemvereisten
- Node.js 18 of hoger (gebruik bij voorkeur de LTS-versie).
- npm 9+ of compatibele package manager.
- OpenAI API-sleutel met toegang tot het Chat Completions-endpoint.

## Installatie & eerste run
1. Installeer dependencies:
   ```bash
   npm install
   ```
2. Start de ontwikkelserver:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) (standaard Vite-poort) en voer je OpenAI API-sleutel in het modaal in.

## Ontwikkelworkflow
1. Creëer of koppel een feature branch.
2. Pas componenten/hooks/services aan met inachtneming van [`AGENTS.md`](AGENTS.md).
3. Run relevante scripts (`npm run build` voor integriteitscheck, eventueel `npm run test` zodra aanwezig).
4. Update documentatie (README, docs) wanneer gedrag of API's wijzigen.
5. Dien een PR in met duidelijke beschrijving en testresultaten.

## Beschikbare scripts
| Script          | Doel                                         |
|-----------------|----------------------------------------------|
| `npm run dev`   | Start Vite development server met HMR.       |
| `npm run build` | Maakt een geoptimaliseerde productie-build.  |
| `npm run serve` | Preview van de productie-build via Vite.     |

*(Er is nog geen testsuite; voeg `npm run test` toe wanneer unit-tests worden geïntroduceerd.)*

## Configuratie & geheimen
- De OpenAI API-sleutel wordt runtime gevraagd en in `sessionStorage` bewaard.
- Wil je lokale defaults configureren, maak dan `.env.local` aan en lees deze in via Vite (`import.meta.env`). Zorg dat je `.env*` niet commit.

## Directorystructuur
```text
ad-variant-generator
├── AGENTS.md                # Richtlijnen voor agents & contributors
├── README.md                # Overzicht en setup-instructies
├── CONTRIBUTING.md          # Richtlijnen voor bijdragen
├── docs/                    # Aanvullende documentatie
│   └── architecture.md      # Architectuuroverzicht en uitbreidingsnotities
├── index.html               # Vite entry point
├── src/
│   ├── main.tsx             # React bootstrap
│   ├── App.tsx              # Hoofdapplicatie en state management
│   ├── components/          # UI-componenten
│   ├── hooks/               # Custom React hooks
│   ├── services/            # OpenAI- en data-services
│   ├── styles/              # CSS-bestanden
│   ├── types/               # TypeScript-interfaces en types
│   └── utils/               # Helpers, export en validatie
├── public/                  # Statische assets (indien aanwezig)
├── package.json             # npm scripts en dependencies
├── tsconfig.json            # TypeScript-configuratie
└── vite.config.ts           # Vite-config
```

## Documentatie
- [`docs/architecture.md`](docs/architecture.md) – overzicht van projectstructuur, stateflow en uitbreidingsmogelijkheden.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) – praktische richtlijnen voor bijdragen en code reviews.

## Contributie
Zie [`CONTRIBUTING.md`](CONTRIBUTING.md) voor workflow, styleguide en checklist. Issues en feature requests zijn welkom.

## Licentie
[MIT](LICENSE)
