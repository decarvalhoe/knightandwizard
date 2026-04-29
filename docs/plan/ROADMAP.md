# Roadmap d'Implémentation : Knight & Wizard (Phase 3+)

Ce document détaille le plan d'implémentation pour la digitalisation du jeu de rôle Knight & Wizard, passant du stade de référentiel de règles (Phases 1 et 2) à un véritable moteur de jeu asynchrone avec assistant MJ/Joueur (Phase 3) et MJ automatisé (Phase 4).

## Phase 3A : Fondations de l'Architecture Monorepo

L'objectif de cette phase est de mettre en place l'infrastructure technique robuste qui supportera l'ensemble de l'écosystème K&W.

1.  **Initialisation du Monorepo** : Configuration de pnpm workspaces ou Turborepo pour gérer les différents packages et applications.
2.  **Mise en place de l'environnement de développement local** : Création d'un `docker-compose.yml` incluant PostgreSQL (avec l'extension pgvector) pour fournir une base de données unifiée sans dépendance cloud.
3.  **Création du package `rules-core`** : Initialisation d'un package TypeScript pur, sans dépendance externe, destiné à contenir toute la logique métier du jeu.
4.  **Création du package `catalogs`** : Mise en place des schémas de validation (Zod) pour les catalogues YAML existants (armes, bestiaire, etc.).

## Phase 3B : Migration du Moteur de Règles (Strangler Fig)

Cette phase consiste à extraire la logique métier du code PHP legacy pour la réécrire en TypeScript strict dans le `rules-core`.

1.  **Migration du Moteur de Dés** : Traduction de la classe `_DiceManager.php` en TypeScript (`packages/rules-core/src/dice.ts`). Implémentation des règles spécifiques : relance des 10, gestion des difficultés supérieures à 10, et échecs critiques. Couverture par des tests unitaires exhaustifs.
2.  **Migration du Moteur de Combat (DT)** : Traduction de la classe `FightAssistantMan.php` en TypeScript (`packages/rules-core/src/combat.ts`). Gestion de la timeline des Divisions de Temps (DT), de l'initiative (`nextTurn`), et du calcul des malus liés à la vitalité.
3.  **Modélisation des Personnages** : Création des interfaces et classes TypeScript pour représenter les personnages joueurs (PJ) et non-joueurs (PNJ), en s'inspirant des classes `CharacterPlayer.php` et `Npc.php`.

## Phase 3C : Le CMS des Règles Vivantes

Mise en place de l'outil d'administration pour gérer les catalogues et les règles de manière collaborative et versionnée.

1.  **Déploiement de Payload CMS** : Installation et configuration de Payload CMS 3.0 (Next.js) dans `apps/cms`.
2.  **Modélisation des Collections** : Création des collections Payload basées sur les schémas Zod du package `catalogs` (Armes, Sorts, Bestiaire, etc.).
3.  **Configuration du Versioning** : Activation du versioning au niveau des champs (field-level versioning) pour permettre des modifications granulaires et des rollbacks précis.
4.  **Import des Données Initiales** : Création de scripts pour importer les données des fichiers YAML actuels vers la base de données PostgreSQL via l'API de Payload.

## Phase 3D : L'Assistant Joueur et MJ (Frontend)

Développement de l'interface utilisateur principale pour les sessions de jeu.

1.  **Initialisation de l'Application Game** : Création d'une application Next.js/React dans `apps/game`.
2.  **Fiche de Personnage Interactive** : Développement d'une fiche de personnage web responsive, connectée au `rules-core` pour le calcul automatique des scores, des jets de dés et de l'inventaire.
3.  **Tracker de Combat DT** : Création d'une interface visuelle pour le MJ permettant de gérer la timeline des DT, d'ajouter des PNJ et de suivre l'état du combat en temps réel.
4.  **Moteur de Session** : Implémentation d'un journal d'événements (event log) canonique pour enregistrer toutes les actions, jets de dés et décisions RP d'une session.

## Phase 4 : Le Maître de Jeu Automatisé (LLM)

Intégration de l'intelligence artificielle pour assister ou remplacer le MJ humain.

1.  **Mise en place du Framework Agentique** : Intégration de Mastra (framework TypeScript) dans `apps/server` pour orchestrer les workflows de l'agent MJ.
2.  **Configuration du RAG (Retrieval-Augmented Generation)** : Utilisation de pgvector pour indexer les règles Markdown et le lore, permettant au LLM de retrouver le contexte pertinent.
3.  **Implémentation du Tool Calling** : Création d'outils (tools) TypeScript exposant les fonctions du `rules-core` (ex: `rollDice`, `applyDamage`) au LLM, garantissant que l'IA ne calcule jamais les règles elle-même.
4.  **Mémoire Persistante et Graphe de Connaissances** : (Optionnel/Avancé) Intégration de Neo4j pour modéliser les relations complexes entre les entités du monde (PNJ, factions, lieux) et fournir une mémoire épisodique à long terme à l'agent MJ.
