# Suivi d'implémentation — Gouvernance / Validation MJ K&W

> **But** : registre de **la mécanique UNIQUE de Gouvernance / Validation MJ** — celle qui valide **toute
> demande de changement**, qu'elle porte sur **l'état de jeu** **OU** sur **le canon** (règle / contenu /
> lore). C'est le **socle commun** derrière **Greffe (S6)**, **CMS (S13)**, **Ambiguïtés (S14)** et les
> **changements de perso MJ-validés** (prédilection #140, cibles d'atout #139, reclassement de classe).
> Ces surfaces ne sont que des **portes d'entrée / vues** dessus — **on ne duplique pas la validation**.
>
> Fondement : « **règles vivantes** » (DA §15 / AGENTS.md) — \*une modif doit être **validée pour devenir
> canon\*** ; autorité multi-arbitre **R-13.1** (`human_gm > player > llm > auto`) ; audit **R-13.11** ;
> arbitrage de conflits **R-13.12** ; workflow CMS (`docs/product/cms-governance-workflow.md`, #57).

## Principe

Toute **demande de changement** suit le même pipeline :

```
demande → autorité (human_gm > player > llm > auto) → validation / arbitrage → application → audit
```

avec **deux classes de cible** :

- **A. État de jeu** (in-session) : requête d'action joueur, **rollback / cassation**, **changements de
  perso MJ-validés** (prédilection, cibles d'atout, reclassement de classe). → appliqué à l'état, audité.
- **B. Canon / contenu / lore** (règles vivantes) : édition **CMS** (nouvelle/modif de règle, sort, atout,
  lore), **résolution d'ambiguïté**. → **validé pour devenir canon**, **versionné**, **régénère les
  artefacts** (`canonical:write` + `nomos:export`).

## Décisions verrouillées

1. **Registre dédié** (décision propriétaire) — **une seule** mécanique, **plusieurs portes d'entrée**.
2. **Greffe / CMS / Ambiguïtés = vues** sur cette mécanique (aucune logique de validation dupliquée).
3. **Autorité** R-13.1 : `human_gm > player > llm > auto` (`human_gm` only au MVP, cohérent combat/session).
4. **Règle produit (CMS)** : aucune décision métier cachée dans le code — elle **référence une décision
   `catalog-decisions`** ou **reste bloquée en ambiguïté**.

## Cycles de vie — côté canon (`cms-governance-workflow.md`)

- **Ambiguïté** : `open → assigned → resolved | rejected` (resolved exige décision + régénération).
- **Décision** : `proposed → accepted → applied | superseded | rejected` (applied exige régénération + artefacts).
- **Contrat de régénération** : décision appliquée → `canonical:write` + `nomos:export` + artefacts tracés.

## Registre

| Brique                          | Objet                                                                   | Statut    | Emplacement / écart                                                                        |
| ------------------------------- | ----------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| Autorité multi-arbitre          | R-13.1 `human_gm>player>llm>auto`                                       | 🟡        | `arbiter.ts` (priorité) ; surfaçage partiel                                                |
| Décisions de jeu                | file + résolution (approuver/rejeter)                                   | 🟡        | API session (`session_decisions`) ; surface Greffe **stub**                                |
| Rollback / cassation            | annuler un événement (non destructif)                                   | ✅ (back) | API session rollback                                                                       |
| Audit                           | log permanent (R-13.11)                                                 | ✅ (back) | `audit_events`                                                                             |
| Arbitrage de conflits           | R-13.12 (table→MJ→règles→dés→admin) + recours (re-roll/retcon/escalade) | ❌        | non implémenté                                                                             |
| Changements de perso MJ-validés | prédilection #140 · cibles d'atout #139 · reclassement                  | ❌        | à **router** dans le pipeline A                                                            |
| Ambiguïtés (canon)              | cycle `open→resolved` (#57)                                             | ✅        | `governanceCollections.ts` (catalog-ambiguities) + **import G2** (#234, 13 chargées)       |
| Décisions canon                 | cycle `proposed→applied` (#57)                                          | ✅        | `governanceCollections.ts` (catalog-decisions) + hook lifecycle + tests                    |
| File de validation des sorts    | `effect_model` `pending`→`covered` (162)                                | ✅        | **G1** (#233) champs `effectModel*` filtrables ; doc `governance-validation-queue.md` (G4) |
| Régénération canon              | `canonical:write` + `nomos:export`                                      | ✅        | pipeline + helper **G3** `cms:governance:regenerate` (trace les artefacts)                 |
| CMS Payload                     | éditer les catalogues (règles vivantes)                                 | ✅        | Payload (#56) + collections gouvernance ; surface admin = file de validation (G1/G2/G4)    |

## Vues (surfaces) sur cette mécanique

- **Greffe (S6)** : vue « décisions de jeu + rollback + audit + arbitrage de conflits ».
- **CMS / Bibliothèque (S13)** : vue « édition de contenu/canon » → cycles ambiguïté/décision + régénération.
- **Ambiguïtés (S14)** : vue « conflits de sources » → cycle ambiguïté.
- **Fiche / Création** : **émettent** des changements MJ-validés (prédilection / cibles d'atout / reclassement)
  qui entrent dans le **pipeline A**.

## Plan de vagues

1. **Modèle commun** : un `change_request` (cible A/B, autorité, statut, audit) unifiant **décisions de jeu**
   - **changements de perso MJ-validés** + **décisions canon**.
2. **Côté jeu** : câbler la Greffe (S6) sur l'API session (décisions/rollback/audit) + arbitrage de conflits (R-13.12).
3. **Côté canon** : brancher Payload (#56) + cycles ambiguïté/décision (#57) + contrat de régénération.
4. **Router les changements de perso MJ-validés** (prédilection #140 / cibles d'atout #139 / reclassement).
5. **Surfacer l'autorité** R-13.1 (les 4 contrôleurs ; `human_gm` only au MVP).
