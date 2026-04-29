# Knight and Wizard — Index

Index général du monorepo. Pour la vue d'ensemble, voir [`README.md`](../README.md) à la racine.

## Documentation

- [README racine](../README.md) — vue d'ensemble du projet
- [HANDOVER.md](HANDOVER.md) — état du projet, décisions structurantes
- [sources.md](sources.md) — inventaire des sources legacy
- [product/](product/) — vision K&W : assistant MJ/Joueur, moteur tabletop-first, architecture LLM
- [product/vision-assistant-mj-joueur.md](product/vision-assistant-mj-joueur.md) — vision produit K&W tabletop-first
- [product/synthese-comprehension.md](product/synthese-comprehension.md) — synthèse de compréhension du projet K&W
- [product/architecture-strategie-llm.md](product/architecture-strategie-llm.md) — stratégie technique K&W/LLM
- [rules/](rules/) — 13 domaines de règles canoniques (Phase 1)
- [game/](game/) — cadrage du projet séparé `knightandwizard-game`
- [game/knightandwizard-game-foundation.md](game/knightandwizard-game-foundation.md) — document fondateur K&W-game, avec décisions distinctes du dépôt K&W

## Données

- [data/catalogs/](../data/catalogs/) — 12 catalogues YAML (Phase 2A)
- [data/catalogs/README.md](../data/catalogs/README.md) — index détaillé des catalogues
- [data/legacy/](../data/legacy/) — sources brutes (paper + web-scraped)

## Applications

- [apps/interactive-map/](../apps/interactive-map/) — carte interactive Leaflet (Phase 2B)
- [apps/legacy-php-site/](../apps/legacy-php-site/) — site PHP existant (référence)

## Outils

- [tools/](../tools/) — scripts cross-projets
- [tools/parse.py](../tools/parse.py) — parser legacy (extraction sources)

## Légacy : web-scraped (référence)

Inventaire historique des pages web scrapées. Désormais dans [`data/legacy/web-scraped/`](../data/legacy/web-scraped/) et utilisé comme référence uniquement. Les données structurées sont dans [`data/catalogs/`](../data/catalogs/).

### Sections principales (web-scraped)

- [Armes](../data/legacy/web-scraped/documents/armes/index.md) → catalogue structuré : [data/catalogs/armes.yaml](../data/catalogs/armes.yaml)
- [Atouts](../data/legacy/web-scraped/documents/atouts/index.md)
- [Atouts de niveaux](../data/legacy/web-scraped/documents/atouts-niveaux/index.md)
- [Bestiaire](../data/legacy/web-scraped/documents/bestiaire/index.md) → [data/catalogs/bestiaire.yaml](../data/catalogs/bestiaire.yaml)
- [Classes](../data/legacy/web-scraped/documents/classes/index.md)
- [Compétences](../data/legacy/web-scraped/documents/competences/index.md)
- [Grand Grimoire](../data/legacy/web-scraped/documents/grimoire/index.md)
- [Potions](../data/legacy/web-scraped/documents/potions/index.md) → [data/catalogs/potions.yaml](../data/catalogs/potions.yaml)
- [Règles](../data/legacy/web-scraped/documents/regles/index.md) → [docs/rules/](rules/)
- [Cartes](../data/legacy/web-scraped/documents/cartes/index.md)
- [Carte du monde](../data/legacy/web-scraped/monde/carte-du-monde/index.md) → [data/catalogs/world-map.yaml](../data/catalogs/world-map.yaml)
- [Régions web](../data/legacy/web-scraped/monde/regions/) (5 fichiers `land-*.md`)
- [Villes web](../data/legacy/web-scraped/monde/villes/) (9 fichiers `city-*.md`)
- [Lieux web](../data/legacy/web-scraped/monde/lieux/) (17 fichiers `place-*.md`)

### Personnages user-generated

Les fiches PJ scrapées (~120 fichiers) sont dans [`data/legacy/web-scraped/personnages/`](../data/legacy/web-scraped/personnages/) — **hors canon** des règles, conservées pour traçabilité historique uniquement.
