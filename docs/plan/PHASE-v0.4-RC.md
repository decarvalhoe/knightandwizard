# K&W — Plan d'exécution : v0.4 RC « Table jouable en réseau »

> **Statut : roadmap (synthèse de sparring).** Opérationnalise [`ROADMAP.md`](./ROADMAP.md) v0.3.1 + v0.4.0, **plus la table en réseau**. **MJ-LLM différé à v0.6** — hors RC.
> **Audience :** pilote (`decarvalhoe`) + fleet d'agents. Registre : [`ISSUE-LIST.md`](./ISSUE-LIST.md).
> **Horizon :** **trimestres** — barre principielle : **canon complet (0 `partial`) avant RC jouable**.
> **Découverte clé (ground-check) :** une unité est `partial` non par manque de source mais par **couches d'architecture manquantes** (`zod_schema`, `relational_db`). Donc **complétude = construire Zod + DB + API par domaine** — qui est _aussi_ la couche données jouable. **Les deux phases fusionnent en UNE campagne** ; le réseau est une surcouche finale.

## 0. Cap & principes

- **North star :** table jouable en réseau — MJ + joueurs sur machines distinctes, synchronisés, sur **canon réel**, **sans IA**.
- **Une campagne, pas deux phases :** chaque domaine câblé (Zod + DB + API) passe ses unités `covered` **ET** allume sa surface sur données réelles. La jouabilité **émerge** ; le réseau se pose à la fin.
- **Gate vs barre :** gate strict déjà **VERT** (PR #116) ; on tient une barre plus haute — **0 `partial`** (sur 5 848) avant RC.
- **Invariants K&W :** la surface ne calcule jamais (rules-core/API) ; **MJ = autorité** (`human_gm > player > llm > auto`) ; ambiguïtés = données explicites ; **zéro source inventée**.

## 1. Definition of Done — v0.4 RC

Sur **canon complet** (0 `partial`) et **en réseau**, la boucle tourne bout-en-bout :

- **A. Création** — perso canonique via wizard (catalogues réels), validé rules-core, **persisté DB**.
- **B. Fiche** — charge **DB/API** : aptitudes, compétences, niveau, inventaire, énergie ; jets via rules-core (échec critique **D100**).
- **C. Combat** — combattants réels (persos/PNJ), timeline **DT**, attaque/défense/dégâts/états via rules-core.
- **D. Session** — MJ ouvre/assigne ; **journal** persisté + rechargeable.
- **E. Rôles** — vues **MJ vs joueur** distinctes.
- **F. Réseau** — machines distinctes, **sync temps réel** (état session live) ; MJ autorité.
- **G. Canon complet** — **0 `partial`** (covered | n/a-justifié | ambiguïté #57) ; gate strict vert.
- **H. Qualité** — `pnpm validate` vert + **E2E multi-client** de la boucle ; **a11y AA**.

**Hors RC :** MJ-LLM/RAG (#58–60, v0.6), CMS (#56, v0.5), gouvernance ambiguïtés (#57), cartes vectorisées, offline/CRDT, rééquilibrage.

## 2. La campagne — tranches verticales par domaine (le cœur)

**Pourquoi.** `partial` = couches `zod_schema` + `relational_db` manquantes (le YAML est souvent couvert). **« Covered » = trace `source → YAML → Zod → DB → vector → API` câblée.** Donc **complétude = build de la couche données par domaine** = _exactement_ la couche jouable → **Phase 1 et données de Phase 2 fusionnées.**

**« Résolu » par unité :** `covered` (couches applicables Zod/DB/API câblées) | `not_applicable` justifié (couche non pertinente — image, donnée legacy) | ambiguïté #57 (aucune source). Objectif : **0 `partial`**.

**Forme = tranches verticales.** Pour un domaine : **Zod + table DB + import + API read-model + tests**, d'un coup → ses unités `covered` ET sa surface sur données réelles. **Ordre = besoin de la boucle** : création → combat → session → reste.

**Exécution = pattern-setter → fleet.** La **1re tranche (chaîne création** : races/orientations/classes/compétences) est faite/supervisée de près = **gabarit canonique** (schéma + migration + import + read-model + API + tests). Les domaines suivants = **vagues fleet** répliquant le patron (revue PR, gate vert).

**Allègements (sans build) :** `asset` (2 406) + plumbing `source_ref` → majoritairement `not_applicable` justifié (pas d'entité relationnelle) ; legacy (~270) → `n/a` justifié. ~2 700 partials dégonflés ainsi ; reste **~2 000 unités de contenu** à câbler.

**Mesure :** burndown `coverage-report` (`partial` → 0) ; gate strict **vert** à chaque tranche.

## 3. Réseau & RC (surcouche finale)

_La boucle (A–E) **émerge de §2** — chaque domaine câblé allume sa surface. Reste en propre :_

- **F. Réseau** — **WebSocket** sur l'API Fastify, posé **une fois assez de domaines live** ; join par `sessionId` + rôle ; **broadcast d'état de session** ; MJ autorité ; pas de CRDT/offline.
- **RC** = boucle complète sur canon **0 partial** + réseau + **E2E multi-client** + a11y AA.

## 4. Vagues (tickets fleet)

**Campagne (tranches verticales, ordre boucle) :**

- **V0 — gabarit** : tranche **chaîne création** (races/orientations/classes/compétences) — faite/supervisée de près = patron canonique. Allume création + fiche.
- **V1…N — vagues fleet par domaine** (réplique du patron) : combat (armes/armures/sorts/PNJ/créatures) → session → monde (villes/religions/divinités/géo) → reste. Chaque vague : tranche verticale → `covered` + surface live ; PR + gate vert.
- **Allègements** : tickets « assets → `n/a` justifié » + « legacy → `n/a` justifié » (≈ 2 700 partials sans build).

**Surcouche finale :** réseau WebSocket (F) → E2E multi-client (H) + a11y AA → **RC**.

**Dispatch :** orch role (pilote) + codex workers, schéma vague F4 (worktree/ticket → branche → PR → gate vert ; agents CI-follow). EPIC à créer + réconcilier avec [`ISSUE-LIST.md`](./ISSUE-LIST.md).

## 5. Gates & contrôles

- **Fin campagne :** `coverage-report` → **0 `partial`** ; `canonical:check:strict` vert ; chaque `not_applicable` justifié ; ambiguïtés loggées (#57).
- **RC :** `pnpm validate` vert (canonical, strict, lint, type, test, **E2E multi-client**, devlab) ; **a11y AA**.
- **Chaque PR :** CI verte (Validate + NOMOS + Strict) ; agents CI-follow jusqu'au vert.

## 6. Différé (post-RC) — cf. [`ROADMAP.md`](./ROADMAP.md)

- **v0.5 CMS Règles Vivantes** (#56) ; **v0.6 MJ-LLM & Automation** (#58–60, _le LLM ne calcule jamais_) ; **gouvernance ambiguïtés** (#57, alimentée par la campagne) ; **cartes vectorisées** ; **multi-arbitrage IA** ; **offline/CRDT**.

## 7. Référence

**Précédence :** opérationnalise [`ROADMAP.md`](./ROADMAP.md) ; en conflit, `ROADMAP.md` fait foi.
**#35 :** FAIT (gate strict vert, PR #116). La complétude est une barre **au-delà** du gate.
**`covered` :** couches applicables (`zod_schema`, `relational_db`, `api`, `vector_store`) câblées + source citée dans la matrice (`path` + `ref` + `sha256`). Sans source/couche pertinente : `not_applicable` justifié ou ambiguïté #57 — jamais fabriqué.

**Décompte 5 848 `partial`** _(indicatif ; burndown = source de vérité)_ :

| Bucket                         | ~unités | Traitement                       |
| ------------------------------ | ------- | -------------------------------- |
| assets (images/cartes/blasons) | 2 406   | `n/a` justifié (pas d'entité DB) |
| plumbing (`source_ref`)        | ~960    | `n/a` / relink                   |
| legacy (sessions/persos)       | ~270    | `n/a` justifié                   |
| contenu de jeu                 | ~2 000  | tranches verticales fleet        |

**Partials par domaine (D1–D13) :**

| Domaine           | partial | Domaine                                 | partial |
| ----------------- | ------- | --------------------------------------- | ------- |
| D1 résolution     | 41      | D8 magie                                | 44      |
| D2 attributs      | 33      | D9 combat                               | 67      |
| D3 races          | 141     | D10 équipement                          | 267     |
| D4 classes        | 13      | D11 contrôle-PNJ                        | 44      |
| D5 compétences    | 24      | D12 monde                               | 539     |
| D6 création-perso | 31      | D13 rôles-passation                     | 32      |
| D7 progression    | 35      | _(assets/catalogs/legacy hors tableau)_ |         |

> **Domaine ≠ type** : comptes par domaine (aire de règle) ≠ par type (sort 324, compétence 368, arme 107…). Une vague = un domaine OU un type, selon le lot le plus net.
