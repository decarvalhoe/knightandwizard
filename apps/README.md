# `apps/` — Applications Knight and Wizard

Monorepo : chaque sous-dossier est une app indépendante avec son propre `package.json`.

## Apps actives

### [`interactive-map/`](interactive-map/) — Carte web interactive (Phase 2B en cours)

Frontend Leaflet pour visualiser le monde K&W :
- 29 nations cliquables
- ~280 villes des cartes régionales
- Recherche, popups, layers
- Branchée sur `data/catalogs/` pour les descriptions

**Stack** : Vite + Leaflet.js + js-yaml + Python (génération GeoJSON)

```bash
cd apps/interactive-map
npm install
npm run dev   # http://localhost:5173
```

### [`legacy-php-site/`](legacy-php-site/) — Site PHP existant (référence)

Site web original — code PHP pour référence uniquement. **Pas une app maintenue activement** dans ce monorepo. Sert de :
- Référence pour la mécanique legacy
- Source des images (cartes, blasons, portraits)
- Backup historique

## Apps prévues (Phase 2C+)

| App | Phase | Description |
|---|---|---|
| `cms/` | 2D | Éditeur web pour règles vivantes (admin/MJ peut modifier les catalogues) |
| `game-engine/` | 2C | Moteur RPG multi-arbitre (humain/LLM/auto) |
| `companion-app/` | 3 | App joueur (fiche perso, sorts, inventaire) |
| `gm-tools/` | 3 | Outils MJ (timeline DT, génération PNJ, etc.) |

## Conventions

- Chaque app a son **propre `package.json`** (npm workspaces géré au niveau racine).
- Données partagées via `data/catalogs/` (lecture seule pour les apps).
- Documentation des règles dans `docs/rules/` (référence canonique).
