# Instructions pour les Agents IA (AGENTS.md)

Ce document définit les règles, le contexte et les conventions que tout agent IA doit respecter lorsqu'il travaille sur ce dépôt **Knight & Wizard**.

## 1. Périmètre du dépôt

Ce dépôt `knightandwizard` est le **socle K&W tabletop-first** :

- corpus source des règles canoniques ;
- catalogues YAML/CSV et données legacy ;
- carte interactive et pipeline QGIS ;
- assistant MJ/Joueur pour jeu de rôle sur table asynchrone ;
- moteur multi-arbitre `human_gm / player / llm / auto` ;
- architecture LLM/RAG et règles vivantes.

Ce dépôt n'est **pas** le produit CRPG tactique coop. Le projet **K&W-game** vit dans un dépôt séparé `knightandwizard-game`, avec ses propres décisions produit et techniques. Les documents `docs/game/` ne doivent pas piloter les choix de ce dépôt ; ils servent uniquement à garder la frontière entre les deux projets claire.

## 2. État actuel

- Branche de référence : `dev`.
- Environnement de travail de référence : WSL Ubuntu, chemin `/home/decarvalhoe/repos/knightandwizard`.
- Phase 1 : règles canoniques terminées (`docs/rules/01-*.md` à `13-*.md`).
- Phase 2A : catalogues importés et stabilisés, environ 1100 entrées en 13 catalogues YAML/CSV.
- Phase 2B : carte interactive existante, pipeline QGIS en cours.
- Phase 3A : fondations techniques à finaliser (`pnpm`, packages TypeScript, validation, CI).
- Devlab local : Docker Compose avec PostgreSQL + pgvector et Adminer.

Les dossiers cibles `packages/rules-core`, `packages/catalogs`, `apps/server`, `apps/game` et `apps/cms` sont des objectifs Phase 3A/3C/3D. Ne pas supposer qu'ils existent avant de les créer.

## 3. Règles Git

- Travailler sur la branche `dev`.
- Ne jamais committer directement sur `main`.
- Les fusions vers `main` passent par Pull Request.
- Utiliser des commits Conventional Commits : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Avant un commit : vérifier le diff, éviter les changements hors-scope, ne pas nettoyer des modifications utilisateur sans raison explicite.
- Continuer le développement depuis WSL. Le checkout Windows ne doit pas redevenir la source de vérité.

## 4. Architecture cible

Respecter la séparation stricte des responsabilités :

- `packages/rules-core` : moteur de règles pur TypeScript. Aucune dépendance UI, DB, réseau ou LLM. Tests unitaires obligatoires pour la logique métier.
- `packages/catalogs` : schémas Zod, loaders, validation et types partagés pour les catalogues.
- `apps/server` : API backend et orchestration serveur.
- `apps/game` : interface joueur/MJ tabletop-first.
- `apps/cms` : Payload CMS pour les règles vivantes.
- `apps/interactive-map` : carte Leaflet existante et pipeline QGIS.
- `apps/legacy-php-site` : référence legacy, pas une cible de refactor direct sauf demande explicite.

Le projet doit rester modulaire : la règle déterministe vit dans `rules-core`; la narration, les suggestions LLM et les interfaces appellent ce noyau au lieu de dupliquer les calculs.

## 5. Migration du legacy PHP

- Ne pas faire de big bang rewrite.
- Extraire progressivement la logique métier selon le Strangler Fig Pattern.
- Priorités connues :
  - `_DiceManager.php` vers `packages/rules-core/src/dice.ts` ;
  - `FightAssistantMan.php` vers `packages/rules-core/src/combat.ts` ;
  - modèles PJ/PNJ vers `packages/rules-core/src/character.ts`.
- Toute ambiguïté de règles découverte pendant la migration doit être documentée dans `data/catalogs/*-ambiguites.md` ou dans le backlog de règle approprié.

## 6. LLM et multi-arbitre

- Le LLM ne calcule jamais les jets de dés, dégâts, DT, niveaux ou effets mécaniques.
- Le LLM propose des intentions, du texte, des interprétations et des choix narratifs.
- Les calculs passent par des fonctions typées du `rules-core` via tool calling / structured output.
- L'orchestration agentique cible est Mastra côté TypeScript.
- Privilégier les modèles capables de JSON structuré fiable.
- Toujours préserver la hiérarchie d'autorité : `human_gm > player > llm > auto`.

## 7. Documentation de référence

Avant de modifier une règle, un catalogue ou une mécanique, lire les documents pertinents :

- `docs/HANDOVER.md` : état global et décisions structurantes.
- `docs/product/` : direction active K&W tabletop-first, assistant MJ/Joueur, LLM.
- `docs/plan/ROADMAP.md` et `docs/plan/ADR-001-architecture-cible.md` : cible Phase 3+.
- `docs/rules/*.md` : règles canoniques.
- `data/catalogs/README.md` : structure et statut des catalogues.
- `apps/interactive-map/qgis/README.md` : workflow QGIS si la carte est concernée.

Ne consulter `docs/game/` que pour comprendre la séparation avec `knightandwizard-game`. Les décisions K&W-game ne remplacent pas les décisions K&W.

## 8. Validations courantes

Depuis `/home/decarvalhoe/repos/knightandwizard` :

```bash
npm run test
npm run build:map
python3 apps/interactive-map/tools/validate_geojson.py
npm run devlab:ps
```

Pour le devlab :

```bash
cp .env.example .env
npm install
npm run devlab:up
```

Services locaux :

- PostgreSQL + pgvector : `localhost:55432`
- Adminer : `http://localhost:8080`

## 9. Garde-fous QGIS et carte

- Les fichiers `*.gpkg-shm`, `*.gpkg-wal`, rasters générés lourds et snapshots locaux ne doivent pas être commités.
- Ne pas committer un export GeoJSON public partiel ou invalide.
- Avant de modifier `apps/interactive-map/public/data/geojson/*.geojson`, exécuter `python3 apps/interactive-map/tools/validate_geojson.py`.
- Si la digitalisation est en cours mais le GeoJSON public ne valide pas, conserver la progression dans les `.gpkg` et garder les GeoJSON publics stables.

## 10. Conventions de code

- TypeScript strict.
- Tests unitaires Vitest/Jest pour toute logique métier dans `rules-core`.
- Prettier/ESLint dès que les packages TS sont initialisés.
- JSDoc uniquement pour les fonctions complexes ou les règles non triviales.
- Pas de secrets en dur.
- Ne pas introduire de dépendance UI/DB/LLM dans `rules-core`.

## 11. Workflow de résolution

1. Lire le contexte et le diff existant.
2. Vérifier les règles et catalogues concernés.
3. Identifier le plus petit changement cohérent avec l'architecture cible.
4. Implémenter sur `dev` depuis WSL.
5. Exécuter les validations pertinentes.
6. Résumer ce qui a changé, ce qui a été vérifié et ce qui reste ouvert.
