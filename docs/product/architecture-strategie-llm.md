# Analyse Technique et Strategie d'Architecture : Knight & Wizard

Ce document presente une analyse approfondie des choix technologiques, des architectures recommandees et des strategies de migration pour la digitalisation du jeu de role Knight & Wizard (K&W). L'objectif est de construire un ecosysteme robuste, capable de supporter un moteur de regles strict, un assistant MJ/Joueur, et a terme, un Maitre de Jeu (MJ) automatise par LLM.

## 1. Architecture Cible et Stack Technologique

Pour repondre aux exigences d'un moteur de jeu de role asynchrone et multi-arbitre, une architecture modulaire et typee est indispensable. Le choix d'un monorepo TypeScript s'impose comme le standard de l'industrie en 2025-2026 pour ce type de projet [1].

### Le Monorepo TypeScript

L'utilisation d'un monorepo (via pnpm workspaces ou Turborepo) permet de partager le code metier entre le client, le serveur et les outils d'administration. La separation stricte des responsabilites est cruciale :

- `packages/rules-core` : Le moteur de regles pur, agnostique de toute interface utilisateur ou base de donnees. Il contient la logique de resolution des des, le calcul des DT (Divisions de Temps) et la validation des actions.
- `packages/catalogs` : Les schemas Zod ou Pydantic definissant la structure des donnees (classes, races, sorts).
- `apps/game` : L'application cliente pour les joueurs et le MJ.
- `apps/server` : L'API backend gerant les sessions, la persistance et l'orchestration des LLMs.

### Gestion de Contenu et Regles Vivantes (CMS)

Pour gerer les "regles vivantes" et les catalogues (plus de 1100 entrees), un CMS headless avec un typage fort et un versioning granulaire est necessaire.

**Payload CMS** se demarque particulierement pour ce cas d'usage. Contrairement aux CMS traditionnels qui versionnent au niveau du document entier, Payload 3.0 propose un versioning au niveau des champs (field-level versioning) [2]. Cela permet de modifier la description d'un sort sans risquer d'ecraser une modification simultanee sur ses degats. De plus, Payload genere automatiquement les types TypeScript a partir des schemas, garantissant une synchronisation avec le `rules-core`.

## 2. L'Ecosysteme LLM et la Memoire Persistante

L'integration d'un MJ automatise necessite une architecture IA avancee, depassant la simple generation de texte pour aller vers un controle d'etat et une memoire persistante.

### Frameworks pour Agents IA

**Mastra** est un framework TypeScript open-source concu pour la creation d'agents IA [3]. Il offre des primitives pour la gestion des workflows, la memoire (episodique et semantique), et l'integration d'outils (tool calling). L'utilisation d'un framework natif TypeScript comme Mastra permet d'integrer l'agent MJ directement dans l'ecosysteme Node.js du projet, facilitant l'appel aux fonctions du `rules-core`.

### Modeles LLM et Structured Output

Pour un moteur de jeu, la capacite du LLM a generer des sorties structurees (JSON) respectant un schema strict est plus importante que sa creativite litteraire pure. Les modeles open-weights comme **DeepSeek R1**, **Qwen 2.5/3**, et **Llama 3.3/4** dominent ce segment [4]. Qwen, en particulier, est repute pour sa capacite a suivre des instructions complexes et a produire des JSON valides, ce qui est essentiel pour interagir avec le moteur de combat DT.

### Base de Donnees Vectorielle et Knowledge Graph

Pour que le MJ automatise connaisse le lore et les regles, une architecture RAG (Retrieval-Augmented Generation) classique ne suffit pas. Le RAG est performant pour retrouver des paragraphes de texte, mais peine sur la logique relationnelle (ex: "Quels sont les PNJ affilies a la faction X presents dans la ville Y ?").

L'approche moderne combine :

1. **Base Vectorielle** : **pgvector** (extension PostgreSQL) est le choix pragmatique par excellence [5]. Il permet de stocker les embeddings (pour la recherche semantique des regles) dans la meme base de donnees que les donnees relationnelles (personnages, sessions), simplifiant l'architecture.
2. **Knowledge Graph** : Pour le lore complexe, une base orientee graphe comme **Neo4j** est recommandee. Des projets open-source comme *Project Lunar* demontrent l'efficacite de Neo4j pour modeliser les relations entre entites (PNJ, lieux, factions) et fournir un contexte riche au LLM [6].

## 3. Inspirations Open Source

L'analyse de l'ecosysteme open-source revele plusieurs projets dont K&W peut s'inspirer :

- **Project Lunar** : Un moteur RPG interactif propulse par l'IA, utilisant Neo4j pour la memoire persistante et des esprits PNJ independants [6]. Son architecture separant le moteur de combat, le moteur narratif et le graphe de connaissances est un modele pertinent.
- **Chronicler** : Un outil de worldbuilding offline base sur des fichiers Markdown [7]. Bien que K&W vise une solution en ligne, l'approche de Chronicler pour la gestion des infoboxes et des liens bidirectionnels (wikilinks) est interessante pour la conception du CMS de regles.
- **Initiative Trackers (ex: Valforte)** : De nombreux projets TypeScript sur GitHub implementent des combat trackers pour D&D ou Pathfinder. Leur gestion de la timeline et des etats (buffs/debuffs) peut inspirer l'interface du combat DT de K&W.

## 4. Valorisation du Moteur PHP Legacy

Le code PHP existant (legacy) contient une mine de logique metier, notamment dans les classes `_DiceManager.php` et `FightAssistantMan.php`.

### Analyse du Code Existant

- **_DiceManager** : Implemente la logique complexe des jets de D10 de K&W (gestion des reussites, echecs critiques, relance des 10, et la regle specifique du "dernier de" pour les difficultes > 10).
- **FightAssistantMan** : Gere la timeline des Divisions de Temps (DT), l'ajout de PNJ, le calcul des malus lies a la vitalite (blessures), et la mise a jour de l'initiative (`nextTurn`).

### Strategie de Migration : Le Modele Strangler Fig

Il n'est pas recommande de faire une reecriture complete ("Big Bang rewrite") immediate. La strategie du **Strangler Fig Pattern** est la plus adaptee [8].

1. **Extraction de la Logique** : Traduire les classes PHP cles (`_DiceManager`, `FightAssistantMan`, `CharacterPlayer`) en modules TypeScript purs, fortement testes unitairement. Ces modules formeront la base du package `rules-core`.
2. **Coexistence** : Deployer la nouvelle API Node.js/TypeScript en parallele du site PHP. Les nouvelles fonctionnalites, comme l'assistant MJ LLM, utiliseront la nouvelle API.
3. **Remplacement Graduel** : Rediriger progressivement les appels du frontend (ex: la creation de personnage) vers la nouvelle API, jusqu'a ce que le backend PHP puisse etre eteint.

## Conclusion

La digitalisation de Knight & Wizard doit s'appuyer sur un socle TypeScript strict (`rules-core`) garantissant l'integrite des regles. L'utilisation de Payload CMS assurera la gestion evolutive des catalogues. Pour l'intelligence artificielle, la combinaison du framework Mastra, de modeles structures (Qwen/DeepSeek), et d'une architecture hybride pgvector/Neo4j permettra de creer un Maitre de Jeu automatise coherent, capable de raisonner sur les regles tout en maitrisant la narration. La migration du code PHP legacy devra se faire de maniere incrementale, en capitalisant sur la logique metier deja eprouvee.

## References

[1] "The State of TypeScript in 2025: Architectural Maturity", Medium.
[2] "How Payload CMS Solves the Content-Versioning Nightmare for Developers", RWIT Blog.
[3] "Mastra: TypeScript AI Agent Framework & Platform", Mastra.ai.
[4] "2025 Open Source AI Models Showdown: DeepSeek R1 vs Llama 4 vs Qwen 3", Youngju.dev.
[5] "pgvector Guide: Vector Search and RAG in PostgreSQL", Encore.dev.
[6] "Project Lunar: AI-powered interactive RPG engine", GitHub (horizonfps/project-lunar).
[7] "Chronicler: offline worldbuilding tool and local wiki", GitHub (mak-kirkland/chronicler).
[8] "Implementing the Strangler Fig Pattern with Node.js", Medium.
