# Armes — Ambiguïtés détectées (Phase 2 axe A)

> Liste des points à valider par l'auteur après l'import auto. Cf. R-10.19 phase 2.

## A1. Difficultés legacy "95" — ✅ TRANCHÉ (auteur, 2026-04-25)

**Décision** : la notation `95` est la **notation étendue legacy de la difficulté 10** (D1 R-1.X) :
> Pour une difficulté de 10, le joueur doit obtenir un **9 ET un 5 minimum sur deux dés**.

Donc `difficulty: 10` (cohérent avec le système d'extension de difficulté D1).

| Arme | Legacy | Interprété | Source |
|---|---|---|---|
| Faux | 95 | **10** | armes.yaml (ligne `faux`) |
| Goupillon | 95 | **10** | armes.yaml (ligne `goupillon`) |
| Fléau de guerre | 95 | **10** | armes.yaml (ligne `fleau_de_guerre`) |
| Fléau de guerre à pointes | 95 | **10** | armes.yaml (ligne `fleau_de_guerre_a_pointes`) |

Confirmé aussi par la potion **Calme pour Loup-Garou** dont le legacy paper indique explicitement `Difficulté : 10 (= 95)`.

Le champ `metadata.difficulty_notation: "legacy_extended_95_means_10"` est posé sur ces 4 armes pour documenter la conversion.

---

## A2. Différence "Fauchon" / "Faux"

**Description** : deux armes proches dans le legacy.
- **Fauchon** : T, F+3, difficulté 7, 1.1 kg
- **Faux** : T, F+4, difficulté 95→9, 2.8 kg

**À valider** : sont-ce bien deux armes distinctes, ou typo ? Hypothèse retenue : oui, deux armes.

---

## A3. Lance de cavalerie : utilisation hors monture

**Description** : `lance_de_cavalerie` (F+5, 7 kg, difficulté 9). Le poids extrême (7 kg) suggère une utilisation strictement à cheval.

**Hypothèse retenue** : utilisable seulement monté (R-9.43). Au sol, malus important ou non utilisable. À valider.

---

## A4. Tomahawk : mêlée OU jet ?

**Description** : Tomahawk classé `thrown` dans l'import auto, mais utilisable en mêlée (F+3, 0.6 kg).

**Hypothèse retenue** : `category: thrown` mais utilisable en mêlée avec les mêmes stats (mêlée standard si tenu, jet si lancé). À standardiser : ajouter `usable_as: [melee, thrown]`.

---

## A5. Goupillon paramétrique (tête variable)

**Description** : "F+3+1/tête" pour les dégâts, "+1 P/tête" pour le bonus, "1.4+1/t." pour le poids. Arme à nombre de têtes variable.

**Hypothèse retenue** : champ `parametric: true` + `parametric_field: heads` pour permettre instances avec 1, 2, 3 têtes ou plus.

**À valider** : combien de têtes par défaut ? Plafond ?

---

## A6. Chaîne paramétrique (longueur variable)

**Description** : "0.8/1m" pour le poids. Chaîne à longueur variable.

**Hypothèse retenue** : `parametric_field: length_m`. Instance par défaut = 2 m (à valider).

---

## A7. Catégorisation "natural" pour Crocs / Griffe

**Description** : Crocs et Griffe ont poids = 0 et sont des attaques naturelles.

**Hypothèse retenue** : catégorie `natural` (sous-classe de `weapon`), accessible uniquement pour créatures avec ces attributs (cf. R-11.3 `natural_attacks`).

**À valider** : sont-elles disponibles pour des PJ avec atouts spéciaux (Loup-garou, Vampire, Chimère…) ? Hypothèse oui via `natural_attacks` du `creature`.

---

## A8. Range des armes à distance — toutes valeurs inférées

**Description** : aucune portée n'est documentée dans le legacy paper. Tous les `range.nominal` ont été inférés selon des conventions médiévales standard :

| Catégorie | Nominal inféré | Justification |
|---|---:|---|
| Arc court | 50 m | Standard tir d'arc court historique |
| Arc long | 100 m | Standard arc anglais |
| Arbalète légère | 100 m | Plus rapide à recharger, moins puissante |
| Arbalète à étrier | 150 m | Standard arbalète médiévale |
| Arbalète à pied de biche | 180 m | Mécanisme amélioré |
| Arbalète à cry | 200 m | Mécanisme à manivelle |
| Arbalète à tour | 250 m | Arbalète lourde montée |
| Couteau de lancer | 15 m | Distance courte |
| Hache de jet | 15 m | Idem |
| Tomahawk | 12 m | Plus léger que la hache de jet |
| Javelot | 30 m | Standard javelot historique |
| Sagaie | 25 m | Plus courte que javelot |
| Harpon (Arpon) | 20 m | Arme de pêche/chasse |
| Chakram | 20 m | Lame en disque |
| Boomerang | 30 m | Aller-retour |
| Étoile ninja | 10 m | Arme furtive courte |
| Shuriken | 12 m | Idem |
| Fronde | 30 m | Standard |
| Lance-pierres | 25 m | Plus court que fronde |
| Sarbacane | 20 m | Souffle limité |
| Grappin | 8 m | Outil escalade, courte portée |

**À valider** : tous les `range.nominal` peuvent être ajustés par l'auteur. Les catégories short/medium/long/extreme sont calculées à 30%/60%/100%/180% du nominal.

---

## A9. min_strength — toutes valeurs inférées

**Description** : aucune `min_strength` n'est documentée. Inférée par formule `ceil(weight_kg / 1.5)` pour mêlée, `0` pour ranged simples.

**À valider** : la formule est conservatrice. Pour les armes très lourdes (Espadon 5 kg = min 4 Force, Lance de cavalerie 7 kg = min 5 Force), à confirmer.

---

## A10. durability_max — toutes valeurs inférées

**Description** : aucune durabilité n'est documentée. Inférée par catégorie de matériau supposé (R-9.26 mode realistic).

| Matériau supposé | Durability max |
|---|---:|
| Bois simple (bâton, gourdin, matraque) | 25-35 |
| Bois renforcé (lance, javelot) | 40-50 |
| Métal léger (couteau, dague) | 20-35 |
| Métal moyen (épée à 1 main) | 60-80 |
| Métal lourd (épée à 2 mains, hache de bataille) | 80-100 |
| Acier supérieur (katana) | 90 |
| Cordage/fibre (fouet, fronde, sarbacane) | 25-40 |

**À valider** : les valeurs sont indicatives. Activées seulement en mode `realistic` de durabilité (R-9.26).

---

## A11. area_attack — patterns inférés

**Description** : selon R-9.36, certaines armes ont un pattern d'attaque multi-cibles. Inféré du nom :

| Arme | Pattern inféré |
|---|---|
| Épée à deux mains, Espadon, Hallebarde, Bardiche, Vouge, Fauchard, Faux, Naginata | sweep |
| Lance, Pique, Arpon | line |
| Lance de cavalerie | charge |
| Chakram, Boomerang | ricochet |

**À valider** : le `max_targets` et `damage_distribution` par arme. Hypothèse par défaut : `max_targets: 2`, `damage_distribution: divided`.

---

## A12. Prix manquants

**Description** : seules ~10 armes sur 100 ont un prix dans `monnaie.md` (legacy). Toutes les autres ont `price_pc: null`.

**À valider** : extension du catalogue par admin/MJ (R-10.18 prix fixes globaux, surcharge libre).

---

## Résumé exécutable

| Ambiguïté | Auto-résolu | Validé |
|---|:---:|:---:|
| A1 — Difficulté 95 = 10 (notation étendue D1) | 10 | ✅ |
| A2 — Fauchon/Faux distincts | oui | ✓ |
| A3 — Lance cavalerie hors monture | non utilisable | ✓ |
| A4 — Tomahawk mêlée+jet | usable_as | ✓ |
| A5 — Goupillon paramétrique | heads var. | ✓ |
| A6 — Chaîne paramétrique | length_m | ✓ |
| A7 — Crocs/Griffe natural | natural | ✓ |
| A8 — Range inféré | tableau ci-dessus | ✓ |
| A9 — min_strength inféré | ceil(w/1.5) | ✓ |
| A10 — durability inféré | par matériau | ✓ |
| A11 — area_attack inféré | par nom | ✓ |
| A12 — Prix manquants | null | ⚠ extension |
