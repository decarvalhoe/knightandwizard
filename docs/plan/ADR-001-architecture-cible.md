# ADR 001 : Architecture Cible et Stack Technologique

## Statut
Proposé

## Contexte
Le projet Knight & Wizard (K&W) passe d'un référentiel de règles statiques (Markdown/YAML) et d'un site PHP legacy à un moteur de jeu de rôle asynchrone complet. L'objectif est de fournir un assistant MJ/Joueur robuste, capable d'évoluer vers un Maître de Jeu (MJ) automatisé par LLM. Le code PHP existant contient une logique métier précieuse (jets de dés, combat DT) qu'il faut préserver et moderniser.

## Décision

Nous adoptons une architecture **Monorepo TypeScript** avec une séparation stricte des responsabilités, propulsée par un écosystème d'outils modernes et open-source.

### 1. Structure Monorepo (pnpm workspaces / Turborepo)
- **`packages/rules-core`** : Le cœur du système. Contient la logique métier pure (TypeScript strict). **Aucune dépendance** à l'UI, à la base de données ou au réseau. C'est la source de vérité absolue pour les calculs (dés, DT, dégâts).
- **`packages/catalogs`** : Définition des schémas de données (Zod) pour les catalogues (armes, bestiaire, etc.) et types partagés.
- **`apps/server`** : API backend (Node.js/FastAPI) gérant les sessions, la persistance et l'orchestration des agents IA.
- **`apps/game`** : Application cliente (React/Next.js) pour les joueurs et le MJ (fiche de personnage, tracker de combat).
- **`apps/cms`** : Outil d'administration pour les règles vivantes.

### 2. Gestion de Contenu (CMS)
- **Outil choisi** : **Payload CMS 3.0** (Next.js).
- **Justification** : Payload offre un versioning au niveau des champs (field-level versioning), crucial pour gérer les "règles vivantes" sans conflits. Il génère automatiquement les types TypeScript à partir des schémas, garantissant la synchronisation avec `rules-core`.

### 3. Base de Données et RAG
- **Outil choisi** : **PostgreSQL avec l'extension pgvector**.
- **Justification** : Permet de stocker les données relationnelles (sessions, personnages) et les embeddings vectoriels (pour la recherche sémantique des règles par le LLM) dans une seule base de données, simplifiant l'infrastructure locale (un seul conteneur Docker).

### 4. Orchestration IA et LLM
- **Framework Agentique** : **Mastra** (TypeScript). Permet d'intégrer l'agent MJ directement dans l'écosystème Node.js, facilitant l'appel aux fonctions du `rules-core` (Tool Calling).
- **Modèles LLM** : Privilégier les modèles open-weights performants en génération de JSON structuré (ex: **Qwen 2.5**, **DeepSeek R1**). Le LLM ne calcule jamais les règles ; il narre et appelle les outils typés du `rules-core`.

### 5. Stratégie de Migration (Legacy PHP)
- **Approche** : **Strangler Fig Pattern**.
- **Justification** : Éviter une réécriture "Big Bang". Extraire progressivement la logique des classes PHP (`_DiceManager.php`, `FightAssistantMan.php`) vers des modules TypeScript testés unitairement dans `rules-core`. Déployer la nouvelle API en parallèle du site PHP et rediriger les appels au fur et à mesure.

## Conséquences
- **Positives** : Architecture hautement testable, typage de bout en bout, séparation claire entre les règles (déterministes) et la narration (probabiliste), infrastructure locale simplifiée (Docker + PostgreSQL).
- **Négatives** : Courbe d'apprentissage pour la mise en place du monorepo et de Payload CMS. Nécessité d'écrire des tests unitaires exhaustifs pour le `rules-core` lors de la migration du PHP.
