# Contribuer à Knight and Wizard

## Comment contribuer

### Issues
Ouvrir une issue GitHub pour :
- Proposer une nouvelle règle ou un fix de règle existante
- Signaler un bug dans une app
- Suggérer une amélioration UI/UX

### Pull Requests
1. Fork le repo
2. Créer une branche feature (`feat/xxx`) ou fix (`fix/xxx`)
3. Respecter les conventions de nommage et structure (voir `docs/rules/` et `data/catalogs/README.md`)
4. Soumettre une PR avec description claire

## Conventions

### Règles canoniques (`docs/rules/`)
- Format Markdown structuré (`## R-X.Y — Titre`)
- Notation **R-X.Y** = règle, **Q-X.Y** = question/backlog
- **Statut** : 🟢 actée / 🟡 partielle / 🔴 trou / ⏸️ standby
- Ne pas modifier une règle actée sans concertation

### Catalogues YAML (`data/catalogs/`)
- Schéma respectant les méta-modèles définis dans `docs/rules/` (R-9.30, R-10.20, R-11.3, R-12.X)
- Champ `metadata.version` versionné incrémentalement
- Champ `inferred: true` pour les valeurs auto, à valider
- Fichiers `*-ambiguites.md` documentent les ambiguïtés détectées

### Code (apps/)
- **JavaScript** : ES Modules, arrow functions, async/await
- **Python** : 3.11+, PEP 8, type hints encouragés
- **Indentation** : 2 espaces (JS/HTML/CSS), 4 espaces (Python)
- **Commits** : format conventional `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`

### Tests
- Pas de tests automatisés actuellement (Phase 3+)
- Validation manuelle via `npm run dev` pour interactive-map

## Données legacy
Le dossier `data/legacy/` contient les sources brutes. **Ne pas modifier** — c'est une référence. Toute transposition se fait via les catalogues `data/catalogs/`.

## Code of conduct
Restons polis et constructifs.
