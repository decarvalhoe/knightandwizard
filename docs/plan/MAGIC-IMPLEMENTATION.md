# Suivi d'implémentation — Magie K&W (D8)

> **But** : registre **exhaustif** des règles de magie (R-8.x) pour **ne perdre aucune règle** pendant
> le build du **moteur Magie**, dont le **cœur est désormais en place** dans `rules-core` (`magic.ts` +
> intégration `combat.ts`) ; restent l'**effet du sort** et la résolution complète. Données existantes :
> `spells.yaml` 324 sorts, `magic-schools.yaml` 11 écoles. Même esprit que `COMBAT-IMPLEMENTATION.md`.
>
> Source d'autorité : `docs/rules/08-magie.md` (R-8.x, **10/10 tranché**) + D1 (jets) + D2 R-2.11 (énergie).
> Légende : ✅ couvert · 🟡 partiel · ❌ absent · 🆕 nouveau. Périmètre : **MVP** · **V2** · **backlog**.
>
> **État global : données ✅ · cœur moteur ✅** (lancement + énergie + TI/réduction + interruption/concentration, **intégrés au combat live**) · **résolution d'effet ❌** (le sort réussit mais n'applique pas encore son effet).

## Décisions verrouillées

1. **Grimoire = browser de référence** (consulter les sorts). **Apprendre/acheter** → sur la **Fiche** (XP, R-7.5 NA×10). **Lancer** → en **jeu**.
2. **Moteur Magie = build dédié**, tracé par ce registre (gated comme le combat).
3. **Cœur MVP indissociable** : **lancement (R-8.5) + énergie coût/récup (R-8.10) + TI/concentration/interruption (R-8.6/7/8)**. On **ne dissocie pas** le TI du lancement.
4. **Intégration du cast : Combat (live, TI dans la timeline DT) au MVP.** Le **Forum** (jet-dans-post) viendra avec le **combat asynchrone**.
5. **Variantes (R-8.11), développement (R-8.12), familier (R-8.13) → plus tard.**

### Arbitrage 2026-05-27 — périmètre **canonique complet** (au-delà du cœur MVP)

Le cœur MVP (décisions 3-4) étant livré, l'auteur tranche le périmètre cible du reste du moteur. Ces décisions **élargissent** le scope du MVP-court vers le moteur canonique complet :

6. **Application de l'effet = structuration complète des 324 sorts.** Audit sort-par-sort (LLM propose + justification → validation humaine **par école**, méthode Q-D8.2) produisant un **effet machine-lisible** par sort. Pas de « texte narratif seulement ».
7. **Schéma = étendre l'`EffectModel` existant** (un **seul** moteur d'effets pour atouts + sorts + combat). Ajouts : variable `successes` (R) et **durées narratives** (`unit: min/hour/day`). Pas de schéma d'effet dédié aux sorts.
8. **Durées = runtime temps-double complet (R-8.20).** On construit l'horloge narrative + conversion combat↔narratif + suivi des sorts actifs (`character_active_spells`, expiration double-échelle) + renouvellement + contrôles MJ — pas seulement le stockage de la durée.
9. **Résistance = multi-couches complète (R-8.15 / R-1.33).** Magique (`direct_magic`, `D100 ≤ %`, bouclier **et** fardeau) + armure P/E/C/T + élémentaire, avec routage par type d'agression. Déborde volontairement sur D9/D10.
10. **Grimoire = reporté** hors de ce programme (rôle déjà fixé en décision 1 ; build ultérieur).

> **Conséquence** : ce n'est plus « finir M2 » mais un **programme pluri-épics transverse** (D8 + D9/D10 + session/DB/cockpit + audit gouverné des 324 sorts). Découpage dans le plan de vagues ci-dessous.

## Périmètre MVP (cœur jouable)

- [x] **Lancement** (R-8.5) : pool = **Intelligence + points dans le sort** vs difficulté convenue (>9 possible). → `magic.ts` `resolveSpellCast`.
- [x] **Énergie** (R-8.10) : coût au lancement, récupération (repos 8 h = plein). → `magic.ts` `spendEnergy` / `gainEnergy` / `restoreEnergyToFull`.
- [x] **TI** (R-8.6) : temps d'incantation en DT. → `combat.ts` `castingTimeDT` (windup planifié par `declareSpellCast`).
- [x] **Réduction de TI** (R-8.8) : 2 énergie / DT en moins, plancher = FV du magicien. → `combat.ts` `tiReductionDT`.
- [x] **Concentration / interruption** (R-8.7) : annulation + énergie **perdue** (réutilise R-9.4) ; action conservée = +1 difficulté / point de dégât subi pendant le TI. → `combat.ts` `declareSpellCast` + `applyDamage` (`spellConcentrationDamage`).
- [x] **Intégration Combat** : action de sort avec **TI dans la timeline DT** ; énergie décomptée au cast. → `combat.ts` `declareSpellCast` / `resolveNextAction` (events `spell_started` / `spell_resolved`). _Reste_ : sync vitalité/énergie fiche + **application de l'effet** du sort.

## Registre exhaustif

### Lancement / résolution

| Règle  | Objet                                                             | Périmètre        | Statut | Emplacement / écart                                  |
| ------ | ----------------------------------------------------------------- | ---------------- | ------ | ---------------------------------------------------- |
| R-8.5  | Pool = Int + points de sort vs difficulté (pas de compétence)     | MVP              | ✅     | `magic.ts` `resolveSpellCast`                        |
| R-8.1  | Définition de la magie                                            | —                | ✅     | doc                                                  |
| R-8.2  | Voie magique = engagement à vie                                   | MVP              | 🟡     | gate création (R-6.3) ; pas de moteur magie          |
| R-8.3  | 11 écoles (couleurs §14)                                          | MVP              | ✅     | `magic-schools.yaml`                                 |
| R-8.4  | Schéma de sort (énergie/TI/diff/portée/durée/`direct_magic`/type) | MVP              | ✅     | `spells.yaml` (324) — vérifier complétude des champs |
| R-8.15 | Résistance magique (tag `direct_magic`)                           | MVP-résolution\* | ❌     | jet de résistance non implémenté                     |
| R-8.19 | Jet d'aptitude brute (résistances)                                | MVP-résolution\* | ❌     | type de jet absent                                   |

### Énergie

| Règle  | Objet                                                          | Périmètre        | Statut | Emplacement / écart                              |
| ------ | -------------------------------------------------------------- | ---------------- | ------ | ------------------------------------------------ |
| R-8.10 | Modèle d'énergie (coût / récup / plafond)                      | MVP (coût+récup) | ✅     | `magic.ts` spend/gain/restoreEnergyToFull        |
| R-8.8  | Réduction de TI (2 énergie/DT, min = FV)                       | MVP              | ✅     | `combat.ts` `declareSpellCast` (`tiReductionDT`) |
| R-8.14 | Drain / don / captage / sacrifice / inversion énergie↔vitalité | V2               | ❌     | transferts d'énergie                             |

### Temps d'incantation / concentration

| Règle | Objet                                                                                   | Périmètre | Statut | Emplacement / écart                                            |
| ----- | --------------------------------------------------------------------------------------- | --------- | ------ | -------------------------------------------------------------- |
| R-8.6 | TI en DT (4 → 192 DT)                                                                   | MVP       | ✅     | `combat.ts` `castingTimeDT` (windup planifié)                  |
| R-8.7 | Concentration / interruption (annule + énergie perdue ; action conservée +1 diff/dégât) | MVP       | ✅     | `combat.ts` `declareSpellCast` + `applyDamage` (concentration) |
| R-8.9 | Atouts TI/concentration (Anticipation, Incantation silencieuse/stoïque, Persistance)    | V2        | ❌     | catalogue                                                      |

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
2. **Moteur — cœur** ✅ : lancement (R-8.5) + énergie coût/récup (R-8.10) + TI (R-8.6) + réduction (R-8.8) + interruption/concentration (R-8.7, via R-9.4). → `magic.ts` + `combat.ts` (PR #181/#182/#183/#184).
3. **Intégration Combat (cast)** ✅ : action de sort + **TI dans la timeline DT** + énergie ← cast (`declareSpellCast` / `resolveNextAction`, events `spell_started` / `spell_resolved`). _Reste l'application de l'effet → E1._

### Programme « Magie canonique complète » (arbitrage 2026-05-27)

> Ordre recommandé : **E0 → E1 → E2 (long, lancé tôt) ∥ E3 → E4**. Chaque épic en PRs gated comme le cœur M2. R-8.19 (jet d'aptitude brute, `rollWillpowerTest`) est déjà disponible.

- **E0 — Liaison sources prose ↔ éléments** (fondation transverse — voir `PROSE-SOURCE-LINKAGE.md`) : parser le **lexique** (514 entrées) + les sources prose et **lier inconditionnellement** chaque élément (sort, atout…) à sa définition canonique ; réconcilier web↔paper + rapport d'orphelins. _Dépend de : —. **Prérequis de E1 et E2** (l'audit structure depuis la prose, pas la ligne terse du grimoire)._
- **E1 — Moteur d'effets étendu + application au cast** (rules-core) : étend `EffectModel` (variable `successes`/R + durées narratives `min/hour/day`) ; définit la forme de l'effet structuré d'un sort ; `resolveSpell` **applique** l'effet (dégâts/statut/buff/énergie) **scalé par R** sur la cible ; ~8 sorts exemplaires écrits à la main + tests. _Dépend de : —. Démarre en 1er (dé-risque le schéma avant l'audit)._
- **E2 — Audit/structuration des 324 sorts** (catalogs + gouvernance, méthode Q-D8.2) : effet structuré + `direct_magic` + `damage_type` + type élémentaire + catégorie de cumul (Q-D8.9), **depuis la prose du lexique (E0)** et non la ligne terse, un passage par sort. _Dépend de : E0 + E1. Sous-décision à son démarrage : outillage de validation (CMS Payload vs git-native YAML + revue de PR)._
- **E3 — Runtime temps-double (R-8.20)** (session/DB/cockpit) : horloge narrative + conversion combat↔narratif + suivi des sorts actifs (`character_active_spells`, expiration double-échelle) + renouvellement (R-8.7-bis) + contrôles MJ (passer la journée, multiplicateur de cadence). _Dépend de : E1 ; parallélisable avec E2._
- **E4 — Résistance multi-couches (R-8.15 / R-1.33)** (rules-core + D9/D10) : moteur `D100 ≤ %` ; couches magique (`direct_magic`) / armure P/E/C/T / élémentaire ; routage par type d'agression ; magique = bouclier **et** fardeau. _Moteur démarrable tôt ; contenu dépend des tags de E2._
- **E5 — Grimoire (surface)** : **reporté** (rôle fixé : browser 324 sorts × 11 écoles, lien _apprendre→Fiche_).
- **Forum** : cast asynchrone (jet-dans-post) — **avec** le combat asynchrone.
- **V2** : variantes (R-8.11), développement (R-8.12), familier (R-8.13), transferts d'énergie (R-8.14), atouts magiciens (R-8.9/8.17).
