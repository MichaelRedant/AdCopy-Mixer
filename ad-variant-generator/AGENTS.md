# AdCopy Mixer – Agent Guidelines

Welkom! Deze richtlijnen gelden voor het volledige repository (`ad-variant-generator/`). Lees ze voordat je wijzigingen maakt.

## Werkwijze
- **Communicatie:** Houd gebruikersantwoorden feitelijk, onderbouwd met bestands- of terminalcitaten.
- **Lokale testen:** Run relevante `npm`-scripts (zie README) na codewijzigingen. Benoem uitgevoerde commando's in het eindrapport.
- **TypeScript:** Houd het project strikt type-safe. Voeg types toe in `src/types/` of dicht bij de implementatie.
- **React & Hooks:** Geef componenten en hooks beschrijvende namen. Deel logica op in kleine, herbruikbare hooks onder `src/hooks/`.
- **Styling:** Gebruik bestaande CSS-structuur binnen `src/styles/`. Nieuwe globale stijlen eerst toevoegen aan `globals.css` en documenteer utility-klassen in `docs/architecture.md`.
- **Services:** API-clients horen in `src/services/` met pure functies. Gebruik `fetch` met expliciete request/response-interfaces.
- **Utils:** Utility-functies in `src/utils/` moeten pure functies zijn, mét unit-testplan wanneer mogelijk.

## Codekwaliteit
- Houd functies <50 regels wanneer mogelijk; splits anders op.
- Voeg JSDoc/TSDoc-commentaar toe aan publieke functies, hooks en complexe utilities.
- Vermijd "magische" strings; definieer constanten in `src/utils/constants.ts` (maak het bestand indien nodig).
- Gebruik `eslint --fix` wanneer ooit een lint-config wordt toegevoegd; forceer geen try/catch rond imports.

## Repository-structuur
- Bewaar documentatie in `docs/`. Voeg bij nieuwe features een sectie toe in `docs/architecture.md`.
- Plaats assets in `public/` of `src/assets/`.
- Werk `README.md` en `CONTRIBUTING.md` bij wanneer workflows veranderen.

## Pull Requests & Commits
- Kies duidelijke commit- en PR-berichten: korte imperatieve titel + beschrijving van wijzigingen.
- Voeg in PR-beschrijving testresultaten en relevante links toe.

Veel succes en bedankt voor je bijdrage!
