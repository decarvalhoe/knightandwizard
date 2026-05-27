# Suivi d'implémentation — Magie K&W (D8)

> **But** : registre **exhaustif** des règles de magie (R-8.x) pour **ne perdre aucune règle** pendant
> le build du **moteur Magie** — aujourd'hui **ABSENT** de `rules-core` (seules les **données** existent :
> `spells.yaml` 324 sorts, `magic-schools.yaml` 11 écoles). Même esprit que `COMBAT-IMPLEMENTATION.md`.
>
> Source d'autorité : `docs/rules/08-magie.md` (R-8.x, **10/10 tranché**) + D1 (jets) + D2 R-2.11 (énergie).
> Légende : ✅ couvert · 🟡 partiel · ❌ absent · 🆕 nouveau. Périmètre : **MVP** · **V2** · **backlog**.
>
> **État global : données ✅ · moteur ❌ (rien ne résout un sort).**

## Décisions verrouillées

1. **Grimoire = browser de référence** (consulter les sorts). **Apprendre/acheter** → sur la **Fiche** (XP, R-7.5 NA×10). **Lancer** → en **jeu**.
2. **Moteur Magie = build dédié**, tracé par ce registre (gated comme le combat).
3. **Cœur MVP indissociable** : **lancement (R-8.5) + énergie coût/récup (R-8.10) + TI/concentration/interruption (R-8.6/7/8)**. On **ne dissocie pas** le TI du lancement.
4. **Intégration du cast : Combat (live, TI dans la timeline DT) au MVP.** Le **Forum** (jet-dans-post) viendra avec le **combat asynchrone**.
5. **Variantes (R-8.11), développement (R-8.12), familier (R-8.13) → plus tard.**

## Périmètre MVP (cœur jouable)

- [ ] **Lancement** (R-8.5) : pool = **Intelligence + points dans le sort** vs difficulté convenue (>9 possible).
- [ ] **Énergie** (R-8.10) : coût au lancement, récupération (repos 8 h = plein).
- [ ] **TI** (R-8.6) : temps d'incantation en DT.
- [ ] **Réduction de TI** (R-8.8) : 2 énergie / DT en moins, plancher = FV du magicien.
- [ ] **Concentration / interruption** (R-8.7) : annulation + énergie **perdue** (réutilise R-9.4) ; action conservée = +1 difficulté / point de dégât subi pendant le TI.
- [ ] **Intégration Combat** : action de sort avec **TI dans la timeline DT** ; énergie décomptée au cast ; sync vitalité/énergie fiche.

## Registre exhaustif

### Lancement / résolution

| Règle  | Objet                                                             | Périmètre        | Statut | Emplacement / écart                                  |
| ------ | ----------------------------------------------------------------- | ---------------- | ------ | ---------------------------------------------------- |
| R-8.5  | Pool = Int + points de sort vs difficulté (pas de compétence)     | MVP              | ❌     | aucun moteur de cast                                 |
| R-8.1  | Définition de la magie                                            | —                | ✅     | doc                                                  |
| R-8.2  | Voie magique = engagement à vie                                   | MVP              | 🟡     | gate création (R-6.3) ; pas de moteur magie          |
| R-8.3  | 11 écoles (couleurs §14)                                          | MVP              | ✅     | `magic-schools.yaml`                                 |
| R-8.4  | Schéma de sort (énergie/TI/diff/portée/durée/`direct_magic`/type) | MVP              | ✅     | `spells.yaml` (324) — vérifier complétude des champs |
| R-8.15 | Résistance magique (tag `direct_magic`)                           | MVP-résolution\* | ❌     | jet de résistance non implémenté                     |
| R-8.19 | Jet d'aptitude brute (résistances)                                | MVP-résolution\* | ❌     | type de jet absent                                   |

### Énergie

| Règle  | Objet                                                          | Périmètre        | Statut | Emplacement / écart     |
| ------ | -------------------------------------------------------------- | ---------------- | ------ | ----------------------- |
| R-8.10 | Modèle d'énergie (coût / récup / plafond)                      | MVP (coût+récup) | ❌     | `energy` = simple champ |
| R-8.8  | Réduction de TI (2 énergie/DT, min = FV)                       | MVP              | ❌     | —                       |
| R-8.14 | Drain / don / captage / sacrifice / inversion énergie↔vitalité | V2               | ❌     | transferts d'énergie    |

### Temps d'incantation / concentration

| Règle | Objet                                                                                   | Périmètre | Statut | Emplacement / écart                                               |
| ----- | --------------------------------------------------------------------------------------- | --------- | ------ | ----------------------------------------------------------------- |
| R-8.6 | TI en DT (4 → 192 DT)                                                                   | MVP       | ❌     | —                                                                 |
| R-8.7 | Concentration / interruption (annule + énergie perdue ; action conservée +1 diff/dégât) | MVP       | 🟡     | `interruptCombatant` (R-9.4) existe — brancher la perte d'énergie |
| R-8.9 | Atouts TI/concentration (Anticipation, Incantation silencieuse/stoïque, Persistance)    | V2        | ❌     | catalogue                                                         |

### Variantes / développement / durées / cumul

| Règle  | Objet                                                         | Périmètre        | Statut | Emplacement / écart      |
| ------ | ------------------------------------------------------------- | ---------------- | ------ | ------------------------ |
| R-8.11 | Variantes (mineur / majeur / masse / distance)                | V2               | ❌     | sorts distincts (Q-D8.5) |
| R-8.12 | Développement de sort (atouts magicien)                       | V2               | ❌     | —                        |
| R-8.20 | Système de temps double (durées narratif + DT, instanciation) | MVP-durées\*     | ❌     | **transversal moteur**   |
| Q-D8.9 | Cumul par catégorie (max + refresh par défaut)                | MVP-résolution\* | ❌     | stacking d'effets        |

### Familier (sous-système)

| Règle        | Objet                                                                                          | Périmètre | Statut | Emplacement / écart        |
| ------------ | ---------------------------------------------------------------------------------------------- | --------- | ------ | -------------------------- |
| R-8.13 (a→g) | Familier : entité magique, budget `niveau × 100`, renaissance au niveau, atouts pseudo-raciaux | V2        | ❌     | fiche + budget de familier |

### Apprentissage / données

| Règle  | Objet                                                                                | Périmètre   | Statut | Emplacement / écart             |
| ------ | ------------------------------------------------------------------------------------ | ----------- | ------ | ------------------------------- |
| R-8.16 | Apprentissage des sorts (D5 R-5.6-bis)                                               | MVP (Fiche) | 🟡     | `progression.learnSpell` existe |
| R-8.17 | Atouts magiciens par niveau                                                          | V2          | ❌     | catalogue                       |
| R-8.18 | Modèle de données (spells + liaisons, `variant_of_id`, `is_canonical`, `cumul_type`) | MVP         | ✅     | `spells.yaml` + schéma          |

> \* **MVP-résolution / MVP-durées** = partie de la résolution complète d'un sort ; **à confirmer** dans le
> scope MVP. Le cœur explicitement acté = **lancement + énergie (coût/récup) + TI/interruption**.

## Plan de vagues (chaque vague : code → évidence → registre, gate canonique)

1. **Données** ✅ : `spells.yaml` (324) + `magic-schools.yaml` (11). → vérifier le schéma R-8.4 complet (`direct_magic`, `damage_type`, `range`, `duration`) et le Zod.
2. **Moteur — cœur** : lancement (R-8.5) + énergie coût/récup (R-8.10) + TI (R-8.6) + réduction (R-8.8) + interruption (R-8.7, via R-9.4).
3. **Intégration Combat** : action de sort + **TI dans la timeline DT** ; énergie ← cast ; sync vitalité/énergie fiche.
4. **Résolution complète** : résistance (R-8.15) + jet brut (R-8.19) + durées (R-8.20) + cumul (Q-D8.9).
5. **Grimoire (surface)** : browser 324 sorts × 11 écoles (couleurs), schéma, lien _apprendre→Fiche_.
6. **Forum** : cast asynchrone (jet-dans-post) — **avec** le combat asynchrone.
7. **V2** : variantes (R-8.11), développement (R-8.12), familier (R-8.13), transferts d'énergie (R-8.14), atouts magiciens (R-8.9/8.17).
