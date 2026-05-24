# K&W — Plan d'exécution : v0.4 RC « Table jouable en réseau »

> **Statut : en co-rédaction (sparring).** Ce document **opérationnalise** les jalons de [`ROADMAP.md`](./ROADMAP.md) :
> **v0.3.1 (Canonical Product Truth)** + **v0.4.0 (Assistant Joueur/MJ Canonique)**, **plus la table en réseau** (élément de périmètre nouveau, absent de la roadmap actuelle).
> Le **MJ-LLM reste différé à v0.6.0** — hors RC.
>
> **Audience :** pilote (`decarvalhoe`) + la fleet d'agents (tickets dispatchables). Registre d'issues : [`ISSUE-LIST.md`](./ISSUE-LIST.md).
> **Horizon :** **trimestres** — décision principielle : **complétude canonique totale d'abord**, puis le jouable+réseau. Pas un sprint.
>
> **Décision (sparring) :** le gate strict est VERT (PR #116 : sample.ts purgé + artefacts à jour). Mais on tient une barre **plus haute que le gate** : aucune RC jouable tant que le canon n'est pas couvert à fond (sur **7 461** unités : **1 152** covered, **5 848** partial, **461** n/a). La RC se joue sur un monde **entièrement sourcé**, pas à moitié.

## 0. Cap & principes

- **North star :** une **table jouable en réseau** — un MJ + des joueurs sur machines distinctes, synchronisés, sur **données canoniques réelles**, **sans IA**.
- **Profondeur avant largeur :** câbler au réel les surfaces existantes ; ne pas en ajouter.
- **P0 d'abord :** purge des `sample.ts` inventés, **gate canonique strict vert** (#35, jalon v0.3.1) — rien ne se construit sur des données fausses.
- **Invariants K&W :** la surface ne calcule jamais dés/dégâts/DT/niveaux (outils typés rules-core/API) ; **le MJ est l'autorité** (`human_gm > player > llm > auto`) ; les ambiguïtés sont des données explicites.
- **Périmètre nouveau à arbitrer :** le « réseau temps-réel » n'est pas dans `ROADMAP.md`. À décider : l'intégrer dans v0.4.0, ou créer un fil « Table réseau » distinct.

## 1. Definition of Done — v0.4 RC

La RC est « faite » quand, sur **données réelles** et **en réseau**, ce parcours tourne de bout en bout :

- **A. Création** — un joueur crée un personnage canonique via le wizard (catalogues réels races/orientations/classes/compétences/sorts ; budgets de points validés par rules-core), **persisté en DB**.
- **B. Fiche** — la fiche charge **depuis DB/API** (zéro sample data) : aptitudes effectives, arbre de compétences, niveau, inventaire, énergie ; jets d'aptitude/compétence via rules-core (échec critique **D100** inclus).
- **C. Combat** — le MJ mène un combat : combattants issus de personnages/PNJ réels, timeline **DT**, attaque/défense/dégâts/états via rules-core.
- **D. Session** — le MJ ouvre une session, assigne le(s) joueur(s) ; le **journal** consigne jets/combat/décisions ; persisté + rechargeable.
- **E. Rôles** — vues distinctes **MJ vs joueur** (le MJ voit/contrôle plus ; le joueur voit sa fiche + ce que le MJ partage).
- **F. Réseau** — MJ et joueurs sur **machines distinctes**, **synchronisés en temps réel** : l'état de session (timeline combat, journal, jets) se propage en direct ; le MJ reste l'autorité.
- **G. Canon propre** — **zéro `sample.ts`** dans le code produit ; **gate canonique strict VERT** (#35 fermé) ; catalogues assez profonds pour une vraie partie.
- **H. Qualité** — `pnpm validate` vert, incluant un **E2E Playwright qui joue la boucle** (création → fiche → combat → session, multi-client) ; **a11y AA** sur les surfaces du parcours.

**Hors RC (explicitement) :** MJ-LLM / RAG (#58–60, v0.6), CMS (#56, v0.5), gouvernance des ambiguïtés (#57), cartes vectorisées, offline/CRDT, rééquilibrage de règles.

## 2. Phase 1 — Campagne de complétude canonique (gating RC)

> **Le bloc dominant.** Gate strict déjà vert (PR #116) ; ici on vise la **couverture canonique réelle** : faire passer les **5 848 unités `partial` → `covered`** (ou `not_applicable` justifié, ou ambiguïté tracée #57). C'est ce qui détermine l'horizon (trimestres).

**Définition « résolu » par unité (le travail unitaire) :**

- `covered` — ≥ 1 **source firsthand** citée (corpus `data/legacy` papier/web) + mapping YAML.
- `not_applicable` — raison explicite (donnée legacy d'exemple, méta-unité…).
- **ambiguïté tracée** (#57) — aucune source : logguée comme doute à trancher, **jamais inventée**.

Objectif : **0 `partial`** (sur 5 848 actuels).

**Stratégie en 3 temps (décidée en sparring) :**

1. **Bulk / outillage (~3 400)** — `asset` (2 406 : images/cartes/blasons) = passe métadonnées + lien source via `images.yaml` ; `source_ref` / plumbing catalogues (~966) = relink outillé. _Pas_ 2 406 sourcings manuels.
2. **Legacy hors canon (~270)** — sessions/personnages legacy → `not_applicable` justifié (données d'exemple, hors canon vivant).
3. **Contenu de jeu (~2 000)** — règles (447), compétences (368), sorts (324), villes (342), armes/armures (166), races (141), classes (91), divinités (80), religions (95), équipement (220), créatures (31)… → **sourcés en vagues fleet par domaine** depuis le corpus.

**Mesure :** burndown `coverage-report` (`partial` → 0) ; le gate strict reste **vert** à chaque vague (`canonical:write` + `nomos:export` + commit en fin de vague).

## 3. La boucle jouable (réel + réseau)

_Phase 2 — démarre une fois le canon **résolu à 0 partial**._

- **A–E (boucle, données réelles)** — câbler les surfaces **déjà scaffoldées** (création / fiche / combat / session) sur **DB/API (devlab Postgres)** ; vues **MJ vs joueur** distinctes. On branche, on n'ajoute pas de surface.
- **F (réseau temps-réel)** — transport **WebSocket** sur l'API Fastify ; join de session par les joueurs ; **état de session partagé** (timeline combat, journal, jets) propagé en direct ; **MJ = autorité** (pas de CRDT/offline pour la RC).
  - **Contrat minimal (à figer avant Phase 2) :** serveur WS hébergé par l'API ; join par `sessionId` + rôle ; sync = **broadcast d'état de session** (pas de deltas/CRDT).
- Invariant : la surface ne calcule jamais — tout jet/dégât/DT/niveau passe par rules-core/API.

## 4. Vagues de sprint (tickets fleet)

**Phase 1 — Complétude (gating) :**

- **V0 (outillage)** — EPIC complétude : ticket « passe assets (métadonnées + source-link `images.yaml`) » + ticket « relink `source_ref` ». **Livrable :** chaque unité asset/`source_ref` → `covered` (lien source dans `images.yaml` / matrice) ou `n/a` justifié ; PR montrant le delta `coverage-report` + gate strict vert.
- **V-Legacy** — ticket « marquer unités legacy `not_applicable` justifié ».
- **V-domaine ×N** (contenu de jeu, 1 EPIC/ticket par domaine) — D1-résolution, D2-attributs, D5-compétences, D8-magie (sorts), D9-combat, D10-équipement, D3-races, D4-classes, D12-monde (villes/religions/géo/orgs), D6/D7/D11/D13. Chaque vague : sourcer les `partial` du domaine → covered | n/a | ambiguïté ; régénérer ; gate vert.

**Phase 2 — Jouable + réseau** (après 0 partial) :

- Tickets : câblage DB/API de la boucle (A–E) ; couche réseau WebSocket (F) ; **E2E multi-client** (H) ; a11y AA.

**Dispatch :** orch role (pilote) + codex workers, par vagues — même schéma que la vague F4 (worktree/ticket → branche → PR → gate vert ; agents CI-follow). Réconcilier les EPIC avec [`ISSUE-LIST.md`](./ISSUE-LIST.md).

## 5. Gates & contrôles DoD

- **Gate fin Phase 1 :** `coverage-report` → **0 `partial`** ; `pnpm canonical:check:strict` vert ; tout `not_applicable` porte une raison ; ambiguïtés loggées (#57).
- **Gate fin Phase 2 (RC) :** `pnpm validate` vert (canonical, strict, lint, typecheck, test, **E2E multi-client** de la boucle, devlab) ; **a11y AA** sur les surfaces de la boucle.
- **À chaque PR :** CI verte (Validate + NOMOS + Strict) ; les agents **suivent leur propre CI** jusqu'au vert.

## 6. Différé (post-RC)

Pointe vers [`ROADMAP.md`](./ROADMAP.md) :

- **v0.5 — CMS Règles Vivantes** (#56) : édition Payload, import/export, préservation des métadonnées source.
- **v0.6 — MJ-LLM & Automation** (#58–60) : GM tool-calling, RAG cité, mémoire épisodique. _Le LLM ne calcule jamais les règles._
- **Gouvernance des ambiguïtés** (#57) : workflow de décision, alimenté par les ambiguïtés loggées en Phase 1.
- **Cartes vectorisées** (au-delà de la métadonnée assets) ; **multi-arbitrage IA** ; **offline / CRDT** réseau.

## 7. Référence & définitions

**Précédence :** ce document **opérationnalise** [`ROADMAP.md`](./ROADMAP.md). En cas de conflit stratégie/version, **`ROADMAP.md` fait foi**.

**#35 (purge `sample.ts`) : FAIT** — gate strict **vert** (PR #116 ; `sample.ts` déjà retiré, 0 import produit). La **complétude** (§2) est une barre **au-delà** de #35, choisie en sparring — pas une exigence du gate.

**« Source firsthand » / `covered` :** une unité est `covered` quand ≥ 1 source du corpus `data/legacy/` (PHP legacy, web scrapé) ou un document règle/catalogue est **citée dans la matrice** (`path` + `ref` + `sha256`). Sans source : `not_applicable` justifié, ou ambiguïté (#57) — **jamais** une source fabriquée.

**Décompte des 5 848 `partial`** _(indicatif — le burndown `coverage-report` fait foi)_ :

| Bucket                               | ~ unités        | Traitement               |
| ------------------------------------ | --------------- | ------------------------ |
| assets (images / cartes / blasons)   | 2 406           | bulk outillage (V0)      |
| plumbing (`source_ref` + cross-réfs) | ~960 + reliquat | bulk relink (V0)         |
| legacy (sessions / persos)           | ~270            | `n/a` justifié           |
| contenu de jeu                       | ~2 000          | vagues fleet par domaine |

**Domaines canoniques (D1–D13) — `partial` par domaine :**

| Domaine           | partial | Domaine                                        | partial |
| ----------------- | ------- | ---------------------------------------------- | ------- |
| D1 résolution     | 41      | D8 magie                                       | 44      |
| D2 attributs      | 33      | D9 combat                                      | 67      |
| D3 races          | 141     | D10 équipement                                 | 267     |
| D4 classes        | 13      | D11 contrôle-PNJ                               | 44      |
| D5 compétences    | 24      | D12 monde (villes/religions/géo/orgs)          | 539     |
| D6 création-perso | 31      | D13 rôles-passation                            | 32      |
| D7 progression    | 35      | _(assets, catalogs, legacy : hors ce tableau)_ |         |

> **Domaine ≠ type.** Les comptes par **domaine** (D1–D13, par aire de règle) diffèrent des comptes par **type** (sort 324, compétence 368, arme 107… — répartis sur plusieurs domaines). Pour le dispatch : **une vague = un type de contenu _ou_ un domaine**, selon le lot le plus net.
