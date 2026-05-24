# Planches de design system validées (Claude Design — 2026-05-22)

5 planches **par surface**, validées (verifier OK). Les exports HTML (~16 Mo chacun)
sont **gardés en local** (gitignorés) ; le design est **codifié** dans
[`packages/tokens/src/kw-system.ts`](../../../packages/tokens/src/kw-system.ts)
(moteur + pack « Terres Oubliées » + 5 skins + 11 écoles) et documenté dans
[`../DA-MATRICES.md`](../DA-MATRICES.md) (§12-16).

| # | skin | surface | composant hero |
|---|---|---|---|
| 1 | `grimoire` | Sorts & magie | spell stat-block + roue des 11 écoles |
| 2 | `registre` | Combat / Tracker DT | timeline DT (142→152) |
| 3 | `tripot` | Lancer de dés | résultat + roulette D100 « tire au cent » |
| 4 | `archives` | Règles D1-D13 | article de loi (§ renvois) |
| 5 | `bibliotheque` | CMS règles vivantes | versioning par champ + diff |

**Ossature commune (moteur)** : radius 0, bordures 1,5px, ombres dures décalées, grain
papier, signature dé/destin (`.die` `.s/.t/.o/.casc`, ↪, D100), rampe Veillée
`#15110A→#1F1810→#2A2218`. **Par skin** : accent, triple de polices, ornement, hero.
