# Suivi d'implémentation — Moteur d'effets K&W (EffectModel)

> **But** : registre **exhaustif** du **moteur d'effets** — faire que les **atouts / handicaps / sorts /
> objets enchantés / statuts AGISSENT** réellement (modifient jets, dégâts, FV, énergie, vitalité, statuts).
> **Transversal** : alimente Fiche, Combat, Magie, Atouts. Même esprit que `COMBAT-IMPLEMENTATION.md` /
> `MAGIC-IMPLEMENTATION.md`.
>
> Cadre = `effect-model.ts` (type `EffectModel` + parser, **8 cibles**) + `effects.ts`
> (`computeEffectiveModifiers`, `effectiveValue`). Règles : R-1.36→1.40 (modificateurs), R-9.x (atouts
> combat), R-8.x (sorts), D4 (atouts). Légende : ✅ · 🟡 · ❌. Périmètre : **MVP** · **V2**.
>
> **État : le cadre existe et est partiellement consommé ; les specs ne sont pas encodées.**

## Décisions verrouillées

1. **Registre dédié** (décision propriétaire) — comme combat/magie.
2. **MVP** : compléter **`target:'damage'`** (#137) + **encoder un lot pilote** d'atouts (#127 : race +
   atouts de niveau) + **statuts** (#132/#141).
3. **Atouts INERTES tant que non encodés** : un atout listé ne fait **rien** sans sa spec `EffectModel`.
4. **Changement de cible d'atout / de prédilection = validation MJ** (#139/#140, posé sur la Fiche).

## Consommation des 8 cibles `EffectModel`

| Cible        | Consommée par                                   | Statut           |
| ------------ | ----------------------------------------------- | ---------------- |
| `aptitude`   | `character.ts` (`calculateEffectiveAttributes`) | ✅               |
| `factor`     | `combat.ts` (`effectiveSpeedFactor`, V2b)       | ✅               |
| `pool`       | `dice.ts` (`calculateEffectiveRollRequest`)     | ✅               |
| `difficulty` | `dice.ts`                                       | ✅               |
| **`damage`** | —                                               | ❌ **#137**      |
| `energy`     | (magie — à venir)                               | 🟡               |
| `vitality`   | (soin / drain — à venir)                        | 🟡               |
| `status`     | `status-effects.ts` (`fou_furieux` seul)        | 🟡 **#132/#141** |

## Encodage des specs (le gros du travail)

| Source                                                               | Volume   | Statut         | Issue                    |
| -------------------------------------------------------------------- | -------- | -------------- | ------------------------ |
| Cadre EffectModel (schéma + parser + renderer + applyEffects)        | —        | ✅             | #123 / #124 / #125       |
| Prédilection (slots)                                                 | —        | ✅ (mécanisme) | #140 (`predilection.ts`) |
| Atouts de classe / orientation                                       | 88 specs | ❌             | #127 (pilote)            |
| Atouts / handicaps (valeurs)                                         | ~2410    | ❌             | #127                     |
| Atouts raciaux (R-3.3)                                               | —        | ❌             | #127                     |
| Atouts de niveau (R-7.10)                                            | —        | ❌             | #127                     |
| Dimensions de match (aptitude + target + intent + **validation MJ**) | —        | ❌             | #139                     |
| `uses_per_day` (atouts éphémères)                                    | —        | ❌             | #142                     |

## Plan de vagues

1. **Compléter la consommation** : `target:'damage'` dans `combat-damage.ts` (#137) ; `energy`/`vitality`
   (au branchement magie / soin).
2. **Statuts** : catalogue R-9.27 via `status-effects.ts` (#132) + statuts composites & sources d'activation
   (#141) + états via effets dans `combat.ts` (#126).
3. **Encodage pilote** : atouts de **race** + de **niveau** → `EffectModel` (#127).
4. **Dimensions de match** (#139) + `uses_per_day` (#142) + **validation MJ** des cibles (#139/#140).
5. **Encodage complet** : les 88 atouts classe/orientation + le gros des ~2410 (au fil de l'eau).

> Lien : ce registre est **pointé** par `COMBAT-IMPLEMENTATION.md` (`target:'damage'`, statuts R-9.27) et
> `MAGIC-IMPLEMENTATION.md` (effets de sorts, durées). Il **possède** l'EPIC #122 et son cluster.
