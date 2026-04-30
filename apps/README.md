# `apps/` — Applications Knight and Wizard

Monorepo : chaque sous-dossier est une app indépendante avec son propre `package.json`.

## Apps actives

### [`game/`](game/) — Application joueur/MJ (Phase 3D)

Frontend principal Next.js pour le compagnon de table :

- Dashboard de session
- Fiche personnage
- Tracker de combat DT
- Journal de session
- Connexion à l'API backend via `/health`
- Configuration Payload Auth

**Stack** : Next.js 15 + React 19 + Tailwind CSS

```bash
pnpm install
pnpm run dev:server # http://127.0.0.1:3002
pnpm run dev:game   # http://localhost:3000
```

### [`cms/`](cms/) — Éditeur de catalogues et règles vivantes (Phase 3C)

Back-office Payload CMS pour administrer les règles, catalogues, lore et données importées.

**Stack** : Payload CMS 3 + Next.js + PostgreSQL

```bash
pnpm install
pnpm run dev:cms # http://localhost:3001/admin
```

### [`interactive-map/`](interactive-map/) — Carte web interactive (Phase 2B en cours)

Frontend Leaflet pour visualiser le monde K&W :

- 29 nations cliquables
- ~280 villes des cartes régionales
- Recherche, popups, layers
- Branchée sur `data/catalogs/` pour les descriptions

**Stack** : Vite + Leaflet.js + js-yaml + Python (génération GeoJSON)

```bash
pnpm install
pnpm run dev:map # http://localhost:5173
```

### [`legacy-php-site/`](legacy-php-site/) — Site PHP existant (référence)

Site web original — code PHP pour référence uniquement. **Pas une app maintenue activement** dans ce monorepo. Sert de :

- Référence pour la mécanique legacy
- Source des images (cartes, blasons, portraits)
- Backup historique

## Apps prévues (Phase 2C+)

| App            | Phase | Description                                |
| -------------- | ----- | ------------------------------------------ |
| `game-engine/` | 2C    | Moteur RPG multi-arbitre (humain/LLM/auto) |

## Conventions

- Chaque app a son **propre `package.json`** (`pnpm` workspaces géré au niveau racine).
- Données partagées via `data/catalogs/` (lecture seule pour les apps).
- Documentation des règles dans `docs/rules/` (référence canonique).
