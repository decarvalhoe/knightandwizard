# ADR — Architecture du MVP temps réel (jeu en réseau)

> **Statut : Acté (2026-05-26).** Décision d'architecture **cible et durable**. Toute brique du MVP doit être **capitalisable — rien de jetable**. Fondée sur une recherche d'état de l'art 2025-2026 + l'analyse du code existant.

## Contexte

K&W vise un MVP **multijoueur temps réel** : plusieurs joueurs + un MJ partagent une **session vivante** (création, fiche, combat, journal, assistant MJ). Contrainte du propriétaire : tout doit **durer** et **rester sous notre contrôle** (pas de dépendance enfermante, pas de prototype jetable).

Déjà construit, **conservé tel quel** (c'est déjà la bonne base) :
- **`packages/rules-core`** — moteur déterministe complet (création, résolution dés/action, combat touche→dégâts→défense, effets/atouts). **Autoritaire, côté serveur.**
- **Journal de session événementiel** (`apps/server` `/sessions`) — événements typés ordonnés (`sequence` monotone, verrou `FOR UPDATE`, rollback pur via `revertSessionToSequence`).
- **`apps/game`** (Next.js 15 / React 19) — surfaces UI + design system (8 skins). Pas encore branché aux données ni au temps réel.

## Décision

**Principe directeur : le serveur (rules-core) + le journal d'événements = source unique de vérité. L'UI et le LLM ne calculent JAMAIS — ils appellent le moteur/serveur.** (Modèle confirmé indépendamment par Figma et Linear.)

1. **Temps réel** — `@fastify/websocket` dans le Fastify existant. **Une "room" par session.** Une action client passe par le **chemin transactionnel existant** (append événement → `rules-core` résout → commit), **puis** l'événement committé est **diffusé** à tous les clients de la room. Le client applique les événements **par `sequence`** et **resynchronise** sur trou (`GET /sessions/:slug`).
   - **MVP = une seule instance serveur** (suffisant). Le multi-instances est un ajout **additif** ultérieur via **Redis pub/sub** (seul le fan-out change, la logique reste) — **pas de réécriture**.
2. **Modèle de synchro** — **event-sourcing + diffusion de deltas ordonnés** (déjà en place : le `sequence` EST l'identifiant de synchro). **CRDT rejeté** (incompatible avec l'autorité serveur et l'invariant « le client ne calcule jamais »).
3. **API** — **tRPC** (contrat typé bout-en-bout, partage les types Zod de `rules-core` au client React, zéro codegen) pour queries/mutations. **REST conservé** pour la surface d'outils LLM (Mastra `/game-master`). Le flux temps réel reste un **broadcast WebSocket brut**.
4. **Front-end intégré** (Next.js 15 / App Router) :
   - Chargement initial **autoritaire** en **composant serveur (RSC)** : snapshot `GET /sessions/:slug`.
   - **Un `<SessionLiveProvider>` dans un layout de route-group** (WebSocket ouvert en `useEffect`, **persistant à travers la navigation** — pattern critique App Router).
   - **Store client (Zustand)** hydraté par le snapshot, **deltas appliqués par `sequence`** + resync sur trou. UI optimiste pour l'**intention** (« lancer… ») ; le **résultat autoritaire** arrive toujours en événement serveur.
5. **Auth / persistance / déploiement** — tokens de **capacité par session** (hook Fastify, même garde que REST). **Postgres = seule vérité** ; Redis (étape de scale) = **transport éphémère** (s'il tombe, les clients resync depuis Postgres). Le serveur Fastify+WS tourne en **process Node persistant** (devlab Docker) — **pas** de serverless.

## Alternatives rejetées

- **Colyseus 0.17** (MIT, actif) — excellent framework de serveur de jeu (rooms / tour-par-tour / reconnexion clés en main). **Fallback fort.** Rejeté par défaut car il veut **posséder l'état du jeu** → concurrence `rules-core` + journal (deux sources de vérité à réconcilier). À reconsidérer comme **coquille transport/présence** si rouler les rooms à la main devient coûteux. (Owlbear Rodeo 2.0 valide le modèle room-par-session.)
- **Socket.IO** — matûre (rooms/reconnexion) mais plus lourd ; on bâtit l'autorité soi-même de toute façon.
- **Convex / ElectricSQL / Liveblocks / PartyKit** — rejetés (lock-in / pente CRDT / remplaceraient le backend). PartyKit racheté par Cloudflare ; Convex veut remplacer le serveur.

## Conséquences — séquence de construction E (tout capitalisable)

- **E-B** : `rules-core` derrière l'API — **tRPC** (procédures de résolution dés/combat réutilisant les fonctions pures de `rules-tools.ts`) + **persistance perso** (table `characters`). REST gardé pour le LLM.
- **E-C** : brancher le **journal de session** (déjà là) — chaque résolution append un événement persisté.
- **E-N** : **fil en direct** `@fastify/websocket` (room / `sequence` / présence), broadcast des événements committés. Single-instance.
- **E-S** : brancher **toutes les surfaces** via RSC + `<SessionLiveProvider>` + store ; **retirer toutes les données bidon**.
- **E-G** : surfacer l'**assistant MJ** (LLM) — il commente / cite les rulings, **ne calcule jamais**.

## Invariant préservé

Le client / le LLM ne calcule **jamais** une règle. Le serveur (`rules-core`) **résout**, le journal **enregistre**, le fil en direct **diffuse**.

## Sources (état de l'art 2025-2026)

- Figma — *How Figma's multiplayer technology works* ; Linear — *Scaling the Linear Sync Engine* (modèle serveur-autoritaire, rejet du CRDT pur).
- Colyseus 0.17 (MIT) ; Owlbear Rodeo 2.0 (serveurs room-par-session) ; Foundry VTT (socket.io).
- `@fastify/websocket` v11 (Fastify 5) ; tRPC (contrat typé TS) ; mise à l'échelle WebSocket via Redis pub/sub.
