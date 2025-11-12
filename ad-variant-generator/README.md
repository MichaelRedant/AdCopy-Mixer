# AdCopy Mixer

AdCopy Mixer is a lightweight web app for marketers to generate, remix and score 3–6 advertentievarianten per run. Vul product, doelgroep, platform en vibe in, druk op "Genereer" en vergelijk het resultaat naast elkaar. Weak lines kun je direct remixen, favorieten bewaar je lokaal en alle platform-limieten worden automatisch bewaakt.

## Hoogtepunten

- **Slim formulier** – Product, doelgroep, USP's, differentiator, bezwaren, tone-of-voice en verplichte claims in één overzicht.
- **Toolbar met presets** – Kies taal, aantal varianten (3–6) en vibe-preset (playful, urgent, luxe, betrouwbaar, rebels, minimal, warm, no-nonsense, premium).
- **Multi-variant output** – 3–6 blokken met headline(s), primary text, description, CTA, notes en lengte-waarschuwingen per platform.
- **Remix & scoring** – Remix varianten per doel (scherper, korter, krachtiger, informeler, meer premium) en herbereken AI-score op duidelijkheid, emotie, onderscheidend vermogen en CTA-sterkte.
- **Favorieten & export** – Bewaar varianten met campagnetags in localStorage, filter in de zijlade en exporteer naar CSV of JSON.
- **Runtime API key** – Je OpenAI-sleutel wordt enkel in `sessionStorage` opgeslagen en kan op elk moment gewijzigd worden.

## Belangrijkste bestanden

```text
ad-variant-generator
├── index.html                # Vite entry point
├── src
│   ├── main.tsx              # React bootstrap
│   ├── App.tsx               # Hoofdapplicatie met state management
│   ├── components            # UI-componenten (FormPanel, VariantCard, FavoritesDrawer, Toolbar, Toasts, ApiKeyModal)
│   ├── hooks/useToasts.ts    # Eenvoudig toast-management
│   ├── services/chatgpt.ts   # OpenAI Chat Completions wrappers
│   ├── styles/globals.css    # Styling (CSS Grid, kaarten, modals)
│   ├── types                 # TypeScript-interfaces voor formulieren, varianten en localStorage
│   └── utils                 # Prompt builders, opslaghelpers, exports, validatie
├── public/                   # Statics (leeg na herstructurering)
├── package.json              # npm scripts en dependencies
└── vite.config.ts            # Vite-configuratie
```

## Installatie

1. Installeer dependencies:
   ```bash
   npm install
   ```

2. Start de ontwikkelserver:
   ```bash
   npm run dev
   ```

3. Open de app op [http://localhost:3000](http://localhost:3000) en vul je OpenAI API-sleutel in het modaal.

## Gebruik

1. Stel taal, variant-aantal en vibe in via de toolbar.
2. Vul het formulier met productinformatie en klik op **Genereer varianten**.
3. Vergelijk de varianten in de grid, remix waar nodig en bereken scores opnieuw.
4. Bewaar favoriete varianten met een campagnetag; gebruik de favorietenlade om te filteren of exporteren.
5. Gebruik de knop **Opnieuw formatteren** wanneer het model onverhoopt geen geldig JSON terugstuurt.

## Privacy & sleutelbeheer

- De OpenAI-sleutel blijft in `sessionStorage` en wordt niet persistent opgeslagen.
- Advertentievarianten, favorieten en historie worden lokaal in `localStorage` bewaard volgens het schema in `src/utils/storage.ts`.

## Build

Voor een productie-build:
```bash
npm run build
```
De output komt terecht in `dist/`.

## Licentie

MIT
