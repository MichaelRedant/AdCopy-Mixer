# Bijdragen aan AdCopy Mixer

Bedankt voor je interesse om bij te dragen! Dit document beschrijft de workflow, coding standards en reviewrichtlijnen voor het project.

## Workflow
1. **Issue kiezen** – Claim een open issue of maak een nieuwe aan met duidelijke beschrijving en acceptatiecriteria.
2. **Branch aanmaken** – Gebruik `feature/<onderwerp>`, `fix/<bug-id>` of `docs/<onderwerp>` als conventie.
3. **Ontwikkelen** – Volg de richtlijnen in [`AGENTS.md`](AGENTS.md). Houd commits klein en beschrijvend.
4. **Tests draaien** – Run in ieder geval `npm run build`. Voeg extra scripts toe als er nieuwe tooling bijkomt.
5. **Documentatie bijwerken** – Pas `README.md`, `docs/architecture.md` en relevante commentaar aan bij structurele wijzigingen.
6. **Pull request openen** – Beschrijf het waarom, wat en hoe; voeg testresultaten en screenshots toe waar relevant.

## Code style
- **TypeScript/React** – Volg functionele componentstijl met hooks. Gebruik `React.FC` alleen wanneer children verplicht zijn.
- **Imports** – Sorteer per groep: externe packages, absolute paden, relatieve paden. Laat één lege regel tussen groepen.
- **State management** – Houd lokale state dicht bij de component. Extracteer gedeelde state naar context/providers.
- **Error handling** – Toon gebruikersvriendelijke feedback via de toast-hook. Log technische details in de console tijdens development.

## Reviews
- Gebruik de PR-template (zie hieronder) als checklist.
- Controleer op accessibility: semantische HTML, aria-labels voor interactieve elementen.
- Test functionaliteit lokaal indien mogelijk.

### PR-template
```markdown
## Samenvatting
- <korte opsomming van wijzigingen>

## Testplan
- [ ] npm run build
- [ ] npm run test (indien beschikbaar)
- [ ] <andere checks>

## Screenshots
<voeg afbeeldingen toe indien UI is aangepast>
```

## Releases
- Houd `main` releasable. Gebruik tags `vMAJOR.MINOR.PATCH` wanneer er release notes beschikbaar zijn.
- Documenteer breaking changes in `docs/architecture.md` en in de release notes.

Veel plezier met bouwen! Neem contact op via issues voor vragen.
