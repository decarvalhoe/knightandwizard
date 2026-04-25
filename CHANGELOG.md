# Changelog

Toutes les versions notables sont documentées ici.

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
Versionnement : [SemVer](https://semver.org/lang/fr/).

## [Unreleased]

### À venir
- Phase 2B itération 2 : digitalisation QGIS effective des frontières
- Phase 2B itération 3 : recherche full-text dans les popups
- Phase 2C : moteur de jeu multi-arbitre (player / human_gm / llm / auto)

---

## [0.1.0] — 2026-04-25

Première version structurée du monorepo. Phase 1 (canonisation des règles) et Phase 2A (imports catalogues) terminées. Phase 2B (carte interactive) en cours.

### Ajouté

#### Phase 1 — 13 domaines de règles canoniques
- D1 — Résolution (dés, difficulté, succès, critiques)
- D2 — Attributs (9 aptitudes + dérivées)
- D3 — Races (33 races jouables)
- D4 — Orientations + Classes + Atouts
- D5 — Compétences & Spécialisations
- D6 — Création de personnage
- D7 — Progression / XP / niveaux
- D8 — Magie (11 écoles, sorts, énergie, TI)
- D9 — Combat (DT, actions, dégâts) — **44 règles**
- D10 — Équipement (armes, armures, potions, monnaie)
- D11 — Contrôle PNJ (joueur / MJ humain / LLM / auto)
- D12 — Géographie + social + économie
- D13 — Rôles & passation MJ↔PJ — formalise le pattern mode arbitre

Total : ~230 règles canoniques (R-X.Y), ~70 entrées backlog (Q-X.Y).

#### Phase 2A — 12 catalogues YAML structurés
- `armes.yaml` — 102 armes (mêlée, distance, jet, naturelles, munitions)
- `protections.yaml` — 49 armures + 11 boucliers + multiplicateurs raciaux
- `potions.yaml` — 5 potions (3 web + 2 paper)
- `champignons.yaml` — 8 syndromes toxicologiques
- `bestiaire.yaml` — 30 créatures complètes
- `nations.yaml` — 29 nations (18 paper + 11 ajouts via cartes)
- `religions.yaml` — 9 religions, 70+ divinités
- `organisations.yaml` — 7 organisations (5 maisons divinatoires + Sans Noms)
- `world-map.yaml` — carte du monde + lieux + anomalies
- `cities-from-maps.yaml` — ~280 villes extraites des 15 cartes régionales
- `images.yaml` — 29 fichiers visuels (16 cartes + 10 blasons + 3 web assets)
- `lore-index.yaml` — 6 entrées lore narratif

Total : ~700 entrées canoniques.

#### Phase 2B — Carte interactive (en cours)
- `apps/interactive-map/` — frontend Vite + Leaflet
- Stack : Vite 7, Leaflet 1.9, js-yaml 4
- Script Python `yaml_to_geojson.py` — convertit les YAML en GeoJSON
- 305 points villes + 29 polygones régions générés en placeholder
- UI : recherche, popups, layers, panel info, parchment style

#### Méta-principes
- **Règles vivantes** : tout est versionnable, modifiable, migrable
- **Pattern mode arbitre** : 4 contrôleurs canoniques avec hiérarchie de fallback
- **Architecture 3 couches** : ruleset / arbiter / pacing
- **Méta-modèle item-type-classes** (R-9.30) : extensible par admin/MJ

#### Outils
- Monorepo npm workspaces
- `.gitignore` complet (Node + Python + QGIS + build outputs)
- `tools/parse.py` — parser legacy paramétrique (`KW_BASE_URL` env var)
- `data/legacy/` — sources brutes paper + web-scraped (référence)

### Corrections post-validation

- Difficulté legacy `95` ≡ `10` (notation étendue D1 R-1.X : « 9 ET 5 minimum sur 2 dés »)
- Manoir Rossellini marqué `is_canon: false` (propriété de PJ, hors règles)
- 11 régions ajoutées à `nations.yaml` via lecture des cartes (Portes d'Azrak, Stazyliss, Royaume du Chaos, Onarit, Lounaxill, etc.)

### Documentation

- `README.md` — vue d'ensemble du monorepo
- `LICENSE` — œuvre dérivée non-commerciale (provisoire)
- `CONTRIBUTING.md` — guide de contribution
- `docs/HANDOVER.md` — état complet du projet
- `docs/INDEX.md` — index général
- `data/catalogs/README.md` — index des catalogues
- `data/catalogs/vectorisation-cartes.md` — guide outils QGIS+Leaflet
- READMEs dans chaque dossier principal

### Sources

- 13 fichiers PDF originaux (règles, bestiaire, nations, religions, etc.)
- ~120 pages web scrapées
- 16 cartes JPG haute résolution
- 10 blasons JPG

---

[Unreleased]: https://github.com/decarvalhoe/knightandwizard/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/decarvalhoe/knightandwizard/releases/tag/v0.1.0
