# Knight & Wizard — Plan de développement refondu (MASTER-PLAN)

> Plan de dev **dérivé des surfaces** (`SURFACES.md`) et des **registres moteur** (`COMBAT-` / `MAGIC-` /
> `EFFECTS-` / `GOVERNANCE-IMPLEMENTATION.md` + `MJ-COCKPIT.md`). Méthode : la **surface comme sonde** des
> trous d'implémentation des règles (la « leçon combat » généralisée).
>
> **Remplace** le registre historique `ISSUE-LIST.md` (campagne v0.3.1, **close**). Le backlog vivant = les
> **issues GitHub**, miroir de ce plan.
>
> **État** : **v0.3.1 (vérité canonique) atteinte** (strict vert, `sample.ts` retiré) · **v0.4.0 (assistant
> Joueur/MJ canonique) en cours**.

## 1. Épics

### A. Moteurs (`rules-core` + registres dédiés)

| Épic                                    | Périmètre                                                                                                                  | Registre         | Milestone |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------- |
| **M1 — Combat MVP**                     | zones (#131), statuts R-9.27 (#132), action précise R-1.12, seuils par zone R-9.17, allonge R-9.45, action « consommer »   | `COMBAT`         | v0.4.0    |
| **M2 — Moteur Magie** 🆕                | lancement (R-8.5) + énergie (R-8.10) + TI/interruption (R-8.6/7/8) → intégration combat                                    | `MAGIC`          | v0.4.0    |
| **M3 — Moteur d'Effets**                | `target:'damage'` (#137), statuts (#132/#141), encodage pilote (#127), dimensions (#139), `uses_per_day` (#142)            | `EFFECTS` (#122) | v0.4.0    |
| **M4 — Inventaire / Équipement** 🆕     | `item_instance` 3 états, encombrement→FV, pont loadout→combat, décompte conso, monnaie (D10)                               | —                | v0.4.0    |
| **M5 — Gouvernance / Validation MJ** 🆕 | `change_request` jeu + canon, autorité R-13.1, audit, cycles ambiguïté/décision (#56/#57)                                  | `GOVERNANCE`     | v0.5.0    |
| **M6 — XP** 🆕                          | barème R-7.5 complet (attribut/facteurs/vita/énergie) + **gain** (horloge jeu effectif, award MJ, points de quête R-7.2/3) | —                | v0.4.0    |

### B. Surfaces (`apps/game`)

| Épic                          | Périmètre                                                                                              | Milestone       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- |
| **S1 — Fiche de personnage**  | boucle équipement→encombrement, état auto (vitalité/énergie), prédilection/cibles d'atout, champs RP   | v0.4.0          |
| **S2 — Création**             | sous-flow familier, finalize-lock orientation/classe, atouts auto appliqués (via M3)                   | v0.4.0          |
| **S3 — Forum (async)**        | players/scenes en API 1ʳᵉ classe, jet-dans-post, poster-en-tant-que (PJ/PNJ), pagination               | v0.4.0          |
| **S4 — Cockpit MJ** 🆕        | 7 panneaux (scénario/scène · PNJ+contrôle · fil · combat-commande · assistant LLM · mémoire/lore · XP) | v0.4.0 → v0.6.0 |
| **S5 — Browsers / référence** | Grimoire (browser), Lecteur de règles (+ query RAG), Équipement-catalogue                              | v0.4.0          |
| **S6 — Dés / Tripot**         | widget de résolution transverse + test de volonté **D20**                                              | v0.4.0          |

### C. Infra / transverse

| Épic                               | Périmètre                                                                      | Milestone   |
| ---------------------------------- | ------------------------------------------------------------------------------ | ----------- |
| **I1 — MJ LLM vivant** 🆕          | `agent.generate()` (#58), RAG cité (#59), mémoire épisodique vectorielle (#60) | v0.6.0      |
| **I2 — Auth & multi-joueur** 🆕    | auth minimale (`userId` en dur aujourd'hui), players/scenes                    | v0.4.0      |
| **I3 — Dette canonique & qualité** | déclarer l'évidence des partials, Zod sur catalogues secondaires, E2E élargi   | transversal |

## 2. Réconciliation des issues GitHub

### À fermer (implémenté — preuve par audit)

| Issue                                          | Preuve                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| #108 Bestiaire · #109 Atouts · #110 Cartulaire | surfaces bâties, API-driven (`apps/game/src/features/*`)                       |
| #123 schéma · #124 renderer · #125 effects.ts  | `effect-model.ts` (22 t.) · `effect-renderer.ts` (10 t.) · `effects.ts` (9 t.) |
| #128 dégâts P/E/C/T · #129 chaîne de défense   | `combat-damage.ts` (`computeAttackDamage`, `mitigateDamageComponents`, 14 t.)  |
| #130 catalogues armes/protections              | `armes.yaml` (107) + `protections.yaml` (59+12) + Zod                          |
| #140 prédilection (mécanisme)                  | `predilection.ts` (6 t.)                                                       |

### À recadrer sous épics (partiels, restent ouverts)

#122→M3 (EPIC) · #126→M3 · #131→M1 · #132→M1/M3 · #137→M3 · #139→M3/M5 · #141→M3 · #142→M3.

### À créer (épics manquants)

**M2 Magie · M4 Inventaire · M5 Gouvernance · M6 XP · S4 Cockpit MJ · I1 LLM vivant · I2 Auth** + issues
ciblées pour les gaps S1/S2/S3/S5/S6.

## 3. Séquencement vers une table jouable (v0.4)

1. **Socle perso** : M6 (XP) + M4 (inventaire→encombrement) + S1 (Fiche) + S2 (Création).
2. **Combat MVP** : M1 + M3 (damage/statuts) + pont loadout→combat.
3. **Jeu en réseau** : S3 (Forum) + I2 (auth).
4. **Magie** : M2 (moteur → combat).
5. **MJ** : S4 (Cockpit) + M5 (Gouvernance) + I1 (LLM vivant).
6. **Finitions** : S5 (browsers/règles) · S6 (Dés) · I3 (dette).

## 4. Invariants (rappel)

- **canonical-first** : `source → rule → YAML → Zod → DB → vector → rules-core → API → UI → tests`.
- **rules-core pur** ; le LLM et l'UI **ne calculent jamais** (tool-calling typé).
- **règles vivantes** : tout changement de canon est **validé via M5 (Gouvernance)** pour devenir canon.
- **4 gates CI** : Validate · Strict Canonical · NOMOS Binary · NOMOS Canonical.
- **2 modes de jeu** : Forum (async, sans combat) ↔ Live (synchrone = Combat).

## 5. Docs liés

`SURFACES.md` · `COMBAT-IMPLEMENTATION.md` · `MAGIC-IMPLEMENTATION.md` · `EFFECTS-IMPLEMENTATION.md` ·
`GOVERNANCE-IMPLEMENTATION.md` · `MJ-COCKPIT.md` · `ROADMAP.md` · `ADR-001-architecture-cible.md`.
