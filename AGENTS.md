# Instructions pour les Agents IA (AGENTS.md)

Ce document définit les règles, le contexte et les conventions que tout agent IA (Manus, Claude, etc.) doit respecter lorsqu'il travaille sur le projet **Knight & Wizard**.

## 1. Contexte du Projet
Knight & Wizard (K&W) est la transposition digitale d'un jeu de rôle sur table (JdR) asynchrone. Le projet est actuellement en phase de développement du moteur de règles et de l'assistant MJ/Joueur.
- **Vision Produit** : Un "Compagnon de table digital" (VTT asynchrone) avec un moteur de règles strict, une gestion de session (timeline DT), et à terme, un Maître de Jeu (MJ) automatisé par LLM.
- **État Actuel** : Les règles canoniques (Markdown) et les catalogues (YAML) sont stabilisés. Le code legacy (PHP) contient la logique métier à migrer.
- **Architecture Cible** : Monorepo TypeScript (pnpm), Payload CMS (règles vivantes), API Node.js, Frontend React/Next.js, Base de données PostgreSQL (avec pgvector pour le RAG).

## 2. Règles de Développement (Agentic Workflow)

### 2.1. Gestion du Code Source (Git)
- **Branche de travail** : TOUT le développement doit se faire sur la branche `dev`. Ne jamais committer directement sur `main`.
- **Pull Requests** : Les fusions vers `main` doivent passer par une Pull Request (PR) pour revue.
- **Commits** : Utiliser le format Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).

### 2.2. Architecture Monorepo
- Respecter la séparation stricte des responsabilités :
  - `packages/rules-core` : Moteur de règles pur (TypeScript). **Aucune dépendance UI ou DB**. Doit être testable unitairement à 100%.
  - `packages/catalogs` : Schémas de données (Zod) et types partagés.
  - `apps/server` : API backend (Node.js/FastAPI).
  - `apps/game` : Frontend joueur/MJ (React/Next.js).
  - `apps/cms` : Payload CMS pour l'édition des règles.

### 2.3. Migration du Legacy PHP (Strangler Fig Pattern)
- Ne pas faire de "Big Bang rewrite".
- Extraire la logique métier des classes PHP (`_DiceManager.php`, `FightAssistantMan.php`) vers des modules TypeScript purs dans `packages/rules-core`.
- Documenter les ambiguïtés de règles découvertes lors de la migration dans `data/catalogs/*-ambiguites.md`.

### 2.4. Intelligence Artificielle et LLM
- Le LLM (Agent MJ) **ne calcule jamais** les jets de dés ou les dégâts. Il doit appeler les fonctions typées du `rules-core` (Tool Calling / Structured Output).
- Utiliser le framework **Mastra** pour l'orchestration des agents TypeScript.
- Privilégier les modèles open-weights (Qwen 2.5, DeepSeek R1) pour la génération de JSON structuré.

## 3. Conventions de Code
- **Langage** : TypeScript strict (`"strict": true` dans `tsconfig.json`).
- **Style** : Utiliser Prettier et ESLint.
- **Documentation** : Documenter les fonctions complexes avec JSDoc.
- **Tests** : Écrire des tests unitaires (Vitest/Jest) pour toute logique métier ajoutée à `rules-core`.

## 4. Documentation de Référence
Avant de modifier une règle ou d'implémenter une mécanique, l'agent DOIT consulter :
- `docs/HANDOVER.md` : État global du projet et décisions architecturales.
- `docs/game/knightandwizard-game-foundation.md` : Fondations du jeu.
- `docs/rules/*.md` : Les règles canoniques (ex: `01-resolution.md` pour les dés, `09-combat.md` pour les DT).
- `data/catalogs/README.md` : Structure des catalogues YAML.

## 5. Workflow de Résolution de Problèmes
1. **Analyser** : Lire les logs d'erreur et le code source pertinent.
2. **Vérifier les règles** : Consulter `docs/rules/` si le problème concerne la logique du jeu.
3. **Planifier** : Proposer une solution respectant l'architecture cible.
4. **Exécuter** : Implémenter la solution sur la branche `dev`.
5. **Tester** : Vérifier que la solution fonctionne et ne casse pas l'existant.
