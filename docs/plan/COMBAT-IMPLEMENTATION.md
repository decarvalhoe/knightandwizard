# Suivi d'implémentation — Combat K&W

> **But** : registre **exhaustif** des règles de combat pour **ne perdre aucune règle** pendant la
> refonte. Source d'autorité des règles = `docs/rules/09-combat.md` (R-9.x) + `01-resolution.md`
> (R-1.x) + `02-attributs.md` (R-2.x) + backlog `Q-D9.x`.
>
> **Enforcement** : l'implémentation réelle est tracée dans `docs/canonical/rule-evidence.yaml`
> (couches `rules_core / api / ui / tests`), générée + vérifiée par `tools/canonical.ts` et le
> **gate canonique strict en CI**. Règle d'or : pas de « partiel » dans l'évidence → **l'absence =
> pending = visible**. Ce document est la **vue plan** (MVP/V2 + écarts) ; `rule-evidence.yaml` est
> la **vérité gated**. À chaque vague : on code → on ajoute l'évidence (files+tests) → la règle passe
> `covered` → on coche ici.
>
> Légende statut : ✅ couvert · 🟡 partiel · ❌ absent · 🆕 nouveau (règle à écrire, canonical-first).
> Périmètre : **MVP** (jouable) · **V2** (au fil de l'eau) · **backlog** (Q-D9 non triés).

## Décisions verrouillées (modèle)

1. **Facteur de vitesse = attribut de l'ACTEUR** (R-2.13), affiné par spé + encombrement (R-2.18) +
   magie/atouts (R-1.38). **L'arme n'a PAS de FV.** La Force aux dégâts dépend de l'arme (token `F`).
2. **Zones de toucher** (R-9.21/R-1.35) : auto = D100 sur la **Table des Touches** ; ciblée = action
   précise (+difficulté, échec = coup manqué) ; spé définissant la zone = +dés / −1 diff. La **donnée
   de la table existe (dessin non extrait)** → à **OCR / reco d'image** puis encoder (`hit_table`).
3. **Allonge de mêlée = 🆕 nouvelle règle** (n'existe pas en canon, gérée off-MJ) → **champ
   `armes.yaml`** (ex. allonge 0/1/2 : dague 0 · épée 1 · lance/hallebarde 2) + impl. moteur.

## Périmètre MVP combat (validé)

- [ ] **Socle** (déjà ✅) : dés (cascade/critiques/D100), chaîne touche→dégâts→atténuation, timeline DT.
- [ ] **Interruptions** (R-9.4) — DT écoulés perdus, 3 cas (relance / attente / sort interrompu).
- [ ] **Recharge en 3 actions** (R-9.3) — recharger/viser/tirer, chacune `FV` DT.
- [ ] **Zones** — extraire la Table des Touches (#2) + action précise (R-1.12) + zone auto.
- [ ] **Allonge** (#3) — champ catalogue + modificateur d'engagement.
- [ ] **Statuts R-9.27 de base** — catalogue (modificateurs/durée/immunités/interactions).

**V2** : lutte/étreinte (R-9.41), monture (R-9.43), multi-cibles (R-9.36), sorts-en-combat (R-9.31),
surprise (R-9.39), désengagement (R-9.38), tactiques de groupe (R-9.40), encodage des 88 atouts.

## Registre exhaustif (toutes les règles de combat)

### Timing / initiative

| Règle                         | Objet                                               | Périmètre | Statut | Emplacement / écart                                      |
| ----------------------------- | --------------------------------------------------- | --------- | ------ | -------------------------------------------------------- |
| R-9.1                         | DT = 0,2 s, cycle 1→50                              | MVP       | ✅     | `combat.ts` `getCyclicDT`, `roundForDT`                  |
| R-9.2                         | FV = délai d'action (déclare→FV→résout)             | MVP       | ✅     | `combat.ts` `actionCostDT`, `nextActionAt`               |
| R-9.22                        | Timeline dynamique (pas d'initiative fixe)          | MVP       | ✅     | `combat.ts` `sortTimeline`                               |
| R-9.23                        | Tie-break DT (simultané/Réflexes/conservée/arbitre) | MVP       | 🟡     | Réflexes+id ok ; préemption action conservée ❌          |
| R-2.13                        | FV depuis la race                                   | MVP       | ✅     | attribut acteur                                          |
| R-2.18                        | Encombrement → +1 FV / 5 kg                         | MVP       | ❌     | non recomposé au scheduling (moteur consomme un FV fixe) |
| R-1.38                        | Sources de modif du FV (magie/atouts)               | MVP       | ❌     | `effects.ts` `factor` non appelé par `combat.ts`         |
| R-9.4                         | Interruptions (DT perdus, 3 cas)                    | **MVP**   | ❌     | aucune op d'interruption                                 |
| R-9.18-bis                    | Dégâts repoussent l'action (+1 DT/pt)               | MVP       | ✅     | `combat.ts` `applyDamage` (+finalDamage)                 |
| R-1.24                        | Action conservée : +1 diff / pt subi                | V2        | ❌     | pas d'état temporel `damageDuringAction`                 |
| R-9.3                         | Recharge = viser/recharger/tirer (3 actions)        | **MVP**   | ❌     | `AttackAction` mono-résolution                           |
| atout `frappe-affaiblissante` | +FV sur cible blessée (50 DT/niv)                   | V2        | ❌     | catalogue seulement                                      |

### Résolution touche / dégâts / atténuation

| Règle         | Objet                                                  | Périmètre | Statut | Emplacement / écart                                                                                   |
| ------------- | ------------------------------------------------------ | --------- | ------ | ----------------------------------------------------------------------------------------------------- |
| R-9.5         | Touche = **Dextérité** (jamais Force)                  | MVP       | ✅     | `combat.ts` `resolveAttack`                                                                           |
| R-1.13→1.20   | Dés : succès, cascade des 10, annulation par 1, diff>9 | MVP       | ✅     | `dice.ts`                                                                                             |
| R-1.6         | Attribut 0 = échec forcé (0 succès, pas de D100)       | MVP       | ✅     | `dice.ts` (rule-evidence ✅)                                                                          |
| R-1.17        | Échec critique → 1 D100 sévérité                       | MVP       | ✅     | `dice.ts` (rule-evidence ✅)                                                                          |
| R-1.19        | Succès critique = flag narratif                        | MVP       | ✅     | `dice.ts`                                                                                             |
| R-9.6/9.7/9.8 | Esquive / parade / bouclier (actif+passif)             | MVP       | 🟡     | défense générique ok ; bouclier actif réducteur-de-succès dédié ❌                                    |
| R-9.10        | Dégâts = Force @ diff `7 − succès nets`                | MVP       | ✅     | `combat-damage.ts` `rollAttackDamage`                                                                 |
| R-9.9         | Force incluse **par arme** (token `F`)                 | MVP       | ✅     | `armes.yaml` `damage_formula`, `includesForce`                                                        |
| R-9.11        | 4 types P/E/C/T (+ choix de type)                      | MVP       | ✅     | `combat-damage.ts` multi-composant                                                                    |
| R-9.12        | Chaîne d'atténuation (ordre)                           | MVP       | ✅     | `combat-damage.ts` `mitigateDamageComponents`                                                         |
| R-9.13        | Circonstances (charge/chute)                           | MVP       | ✅     | étape circonstance                                                                                    |
| R-9.14        | Protections P/E/C/T par couche (5)                     | MVP       | ✅     | `protections.yaml` + moteur                                                                           |
| R-9.16        | Endurance = dernier rempart                            | MVP       | ✅     | `applyEndurance`                                                                                      |
| R-9.15        | Zones : ×2 tête/gorge/yeux, endurance interdite        | MVP       | ✅     | ×2 en dernier + gating endurance                                                                      |
| R-9.17        | Seuils KO/mort                                         | MVP       | 🟡     | « >½ → KO », « 0 → mort » ok ; **seuils tête ¼-max / gorge ½-base ❌** ; groupage coups simultanés ❌ |

### Zones / localisation

| Règle  | Objet                                            | Périmètre | Statut | Emplacement / écart                                 |
| ------ | ------------------------------------------------ | --------- | ------ | --------------------------------------------------- |
| R-9.21 | Table des touches (schéma, table vivante)        | MVP       | 🟡     | schéma canon ; **donnée D100 absente** (à OCR)      |
| R-1.35 | Données de la Table des Touches                  | MVP       | ❌     | **dessin non extrait** (ni `images.yaml` ni legacy) |
| R-1.12 | Action précise (+difficulté par finesse de zone) | MVP       | ❌     | pas de calcul difficulté/zone ni « échec = manqué » |

### Atouts / effets / statuts

| Règle                              | Objet                       | Périmètre      | Statut | Emplacement / écart                                                            |
| ---------------------------------- | --------------------------- | -------------- | ------ | ------------------------------------------------------------------------------ |
| EffectModel                        | cadre source/spec/render    | —              | ✅     | `effect-model.ts`, `effects.ts`, renderer                                      |
| 88 specs atouts classe/orientation | modificateurs d'action      | V2             | ❌     | cadre prêt, **specs non encodées**                                             |
| `target:'damage'`                  | bonus dégâts d'atout/sort   | MVP            | ❌     | enum présent, **non consommé** par le moteur (#137)                            |
| `requires_mj_validation`           | garde/juste-cause/méfait…   | MVP            | 🟡     | flag présent ; flux d'arbitrage ❌                                             |
| prédilection (slots)               | arme/instrument/monture/…   | —              | ✅     | `predilection.ts`                                                              |
| R-9.27                             | catalogue d'états tactiques | **MVP** (base) | 🟡     | 4 statuts nus ; `fou_furieux` ✅ ; **modificateurs/immunités/interactions ❌** |

### Portée / allonge / recharge

| Règle         | Objet                                                    | Périmètre | Statut | Emplacement / écart                                            |
| ------------- | -------------------------------------------------------- | --------- | ------ | -------------------------------------------------------------- |
| R-9.24        | Portée à distance (catégories short/medium/long/extreme) | V2        | 🟡     | données `armes.yaml` **inférées** (A8) ; moteur de distance ❌ |
| R-9.32        | Zones de proximité (mêlée ≤2 m …)                        | V2        | ❌     | pas de positionnement                                          |
| allonge mêlée | lance/hallebarde > dague                                 | **MVP**   | 🆕❌   | **règle à écrire** + champ `armes.yaml`                        |
| R-9.25        | Munitions (stock/récupération)                           | MVP       | 🟡     | `ammoBonus` câblé ; **stock/décrément/récup ❌**               |

### Manœuvres & reste (V2 / backlog sauf mention)

| Règle           | Objet                                                                                                                        | Périmètre | Statut                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------- |
| R-1.12          | Types d'action (simple/précise/improvisée/multiple/contre/conservée)                                                         | MVP       | ❌ (math difficulté)      |
| R-9.42          | 2 armes / ambidextrie / 2 mains (+3 mauvaise main)                                                                           | V2        | ❌                        |
| R-9.36          | Attaques multi-cibles (`area_attack`)                                                                                        | V2        | ❌ (données inférées A11) |
| R-9.38          | Désengagement (3 modes, attaque d'opportunité)                                                                               | V2        | 🟡 (concept doc)          |
| R-9.39          | Surprise / embuscade                                                                                                         | V2        | ❌                        |
| R-9.40          | Tactiques de groupe (flanc, formations)                                                                                      | V2        | ❌                        |
| R-9.41          | Lutte / étreinte (mains nues)                                                                                                | V2        | ❌                        |
| R-9.43          | Combat monté                                                                                                                 | V2        | ❌                        |
| R-9.44          | Coup de grâce / reddition / otage                                                                                            | V2        | ❌                        |
| R-9.31          | Sorts en combat (incantation, interruption)                                                                                  | V2        | ❌                        |
| R-9.29          | Transformation de race                                                                                                       | V2        | ❌                        |
| R-9.28          | Apparition de PNJ / vagues / invocations                                                                                     | V2        | ❌                        |
| R-9.32          | Déplacement / terrain / charge                                                                                               | V2        | ❌                        |
| R-9.33          | Soins en combat                                                                                                              | V2        | ❌                        |
| R-9.35          | Poisons (14 canoniques)                                                                                                      | V2        | ❌                        |
| R-9.26          | Durabilité des objets (3 modes)                                                                                              | V2        | ❌                        |
| R-1.40          | Propriétés magiques d'équipement                                                                                             | V2        | ❌                        |
| Q-D9.33→Q-D9.53 | backlog (sous-marin, duels de mages, hydre, masse, incorporel, taille, ivresse, feinte, 3D aérien, sièges, rage, familiers…) | backlog   | ❌ non triés              |

## Plan de vagues (chaque vague met à jour `rule-evidence.yaml` + ce doc ; gate strict)

1. **Données** : OCR Table des Touches (R-1.35) + barème allonge (`armes.yaml`).
2. **Moteur — timing** : interruptions (R-9.4), recharge 3 actions (R-9.3), FV effectif (R-2.18/R-1.38).
3. **Moteur — zones** : `hit_table` + action précise (R-1.12) + zone auto/ciblée.
4. **Moteur — statuts** : catalogue R-9.27 (modificateurs/durée/interactions).
5. **Moteur — finitions MVP** : seuils KO/mort par zone (R-9.17), bouclier actif (R-9.7), allonge.
6. **Surface Combat** « Registre du commandant » par-dessus le moteur réel (incrémental, à chaque vague).
7. **V2** : manœuvres + 88 atouts, au fil de l'eau.

## À corriger (dette doc repérée)

- `docs/canonical/mecaniques-transversales.md` déclare la chaîne dégâts/défense « ABSENT » → **faux**
  désormais (`combat-damage.ts` l'implémente). Resynchroniser.
