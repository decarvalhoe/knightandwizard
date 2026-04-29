# Knight and Wizard

[![CI](https://github.com/decarvalhoe/knightandwizard/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/decarvalhoe/knightandwizard/actions/workflows/ci.yml)

> Transposition digitale du jeu de rôle papier **Knight and Wizard**.
> Monorepo Phase 1+2 — règles canonisées + catalogues structurés + applications.

## État du projet

| Phase | Statut | Description |
|---|---|---|
| **Phase 1** — Canonisation des règles | ✅ Complète | 13 domaines (D1→D13), ~230 règles, ~70 entrées backlog |
| **Phase 2A** — Imports catalogues | ✅ Complète | 13 catalogues YAML/CSV, ~1100 entrées, 29 fichiers images |
| **Phase 2B** — Carte interactive | 🔄 En cours | Frontend Leaflet, données placeholder en attente de QGIS |
| **Phase 2C** — Moteur de jeu | ⏳ À démarrer | Engine multi-arbitre (humain / LLM / auto) |
| **Phase 2D** — CMS règles | ⏳ À démarrer | Éditeur web pour règles vivantes |

Voir [`docs/HANDOVER.md`](docs/HANDOVER.md) pour le détail complet.

## Structure du monorepo

```
knightandwizard/
├── docs/                      # Documentation Phase 1 (règles canoniques)
│   ├── HANDOVER.md            # État global du projet
│   ├── INDEX.md               # Index général
│   ├── sources.md             # Inventaire des sources legacy
│   └── rules/                 # 13 domaines de règles (D1→D13)
│
├── data/                      # Données structurées
│   ├── catalogs/              # 13 catalogues YAML/CSV (Phase 2A)
│   │   ├── armes.yaml         # 107 armes
│   │   ├── protections.yaml   # 60 armures + boucliers
│   │   ├── potions.yaml       # 5 potions
│   │   ├── champignons.yaml   # 8 syndromes
│   │   ├── bestiaire.yaml     # 30 créatures
│   │   ├── nations.yaml       # 29 nations (paper + cartes)
│   │   ├── religions.yaml     # 9 religions / 70+ divinités
│   │   ├── organisations.yaml # 7 organisations
│   │   ├── world-map.yaml     # Carte du monde
│   │   ├── cities-from-maps.yaml # ~280 villes des cartes
│   │   ├── images.yaml        # 29 fichiers visuels
│   │   ├── lore-index.yaml    # Index lore narratif
│   │   ├── README.md
│   │   ├── armes-ambiguites.md
│   │   └── vectorisation-cartes.md # Guide outils vectorisation
│   └── legacy/                # Sources brutes
│       ├── paper/             # Règles papier originales
│       └── web-scraped/       # Site web scrapé (référence)
│
├── apps/                      # Applications du monorepo
│   ├── interactive-map/       # Carte web Leaflet (Phase 2B)
│   └── legacy-php-site/       # Site PHP existant (référence)
│
└── tools/                     # Scripts cross-projets
```

## Démarrage rapide

### Devlab local

Prérequis : Docker Engine ou Docker Desktop exposé dans WSL.

```bash
cp .env.example .env
pnpm install
pnpm devlab:up
pnpm db:migrate
pnpm db:seed
pnpm devlab:test
```

Services locaux :

- PostgreSQL + pgvector : `localhost:55432` vers `5432` dans le conteneur
- Adminer : `http://localhost:8080`
- API backend : `http://localhost:3002` via `pnpm dev:server`

Commandes utiles :

```bash
pnpm devlab:ps      # Liste les services Docker
pnpm devlab:test    # Vérifie PostgreSQL, pgvector et le schéma migré
pnpm devlab:reset   # Destructif : supprime les conteneurs et le volume PostgreSQL local
```

### Carte interactive (Phase 2B en cours)

```bash
pnpm install
pnpm yaml2geojson  # Génère les GeoJSON depuis les YAML
pnpm dev:map       # Lance le serveur Vite (http://localhost:5173)
```

### Lecture des règles (Phase 1)

Les 13 domaines de règles sont dans [`docs/rules/`](docs/rules/) au format Markdown :
- [D1 — Résolution](docs/rules/01-resolution.md)
- [D2 — Attributs](docs/rules/02-attributs.md)
- ...
- [D13 — Rôles & passation MJ↔PJ](docs/rules/13-roles-passation.md)

### Parcourir les catalogues

```bash
cat data/catalogs/README.md   # Index des 13 catalogues
```

## Méta-principes du projet

### Règles vivantes

**Toutes** les règles sont versionnables, modifiables, extensibles par admin/MJ. Aucun hard-code dans le moteur. Le résultat final est un **référentiel évolutif**, pas un système figé.

### Pattern mode arbitre (D9-D13 récurrent, formalisé R-13.15)

Tout système accepte 4 contrôleurs :
- `player` — joueur humain
- `human_gm` — MJ humain
- `llm` — agent LLM contextuel
- `auto` — script déterministe

Avec hiérarchie `human_gm > player > llm > auto` et fallback en cascade.

### Architecture cible (3 couches orthogonales)

- **Ruleset** — Legacy 1:1 / Digital adapté
- **Arbiter** — humain / LLM / auto
- **Pacing** — Async / Tour-par-tour / Temps réel

## Licence

Voir [`LICENSE`](LICENSE).
