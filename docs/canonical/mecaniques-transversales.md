# Mécaniques transversales — Knight & Wizard

> Inventaire **fin** des mécaniques transversales : les règles qui opèrent *à travers* les
> entités (personnages, créatures, objets), par opposition aux objets de catalogue.
> **Sourcé depuis `docs/rules/`** (règles `R-x.y` déjà tranchées). Ce document n'invente rien :
> il extrait, structure et relie chaque mécanique à son **moteur rules-core** gouvernant.
>
> Principe : **1 mécanique distincte = 1 entrée**. (Ex. résistances ≠ protections : négation
> probabiliste vs soustraction déterministe.)

Statut : **brouillon v1 pour relecture** (auteur K&W = autorité). Légende moteur :
✅ implémenté · ⚠️ partiel · ❌ manquant · 🔎 à confirmer contre `packages/rules-core`.

---

## ① Système de dés (D1 — résolution)
*Socle de toute action. Moteur : **Résolution** (✅ existe : `dice.ts`, `rollDice`).*

| Mécanique | Source | Mécanique exacte |
|---|---|---|
| Pool D10 | R-1.1, R-1.2, R-1.13 | nb dés = aptitude + compétence + Σ spé ; 1 réussite par dé ≥ difficulté |
| Pool magie | R-1.4 | Intelligence + points dans le sort (pas de compétence) |
| Attribut nul | R-1.6 | 0 réussite forcée, **sans** D100 d'échec critique |
| Règle du 10 | R-1.15 | 10 = réussite + relance (cascade potentiellement infinie) |
| Règle du 1 | R-1.16 | chaque 1 annule 1 réussite (valeur décroissante) ; annule la cascade d'un 10 |
| Échec critique | R-1.17 | plus de 1 que de réussites → 1 D100 de gravité (table générique + overrides) |
| Réussite critique | R-1.19 | réussites ≥ dés lancés → **flag** narratif, pas d'effet chiffré |
| Difficulté | R-1.7, R-1.8 | base 7 (standard) ou convenue (arme/sort = donnée de référentiel) |
| Empilement modificateurs | R-1.36→R-1.40 | **linéaire, sans plafond** (difficulté, pool, temps) |
| Ordre de résolution D10 | R-1.41 | pseudocode canonique (1 → réussites → cascade) |
| Difficulté > 9 | R-1.20 | empilement `9 + dernier chiffre` ; `nbChiffres = floor(diff/5)` |
| Test de volonté D20 | R-1.26→R-1.29 | D20 ≥ F.Volonté (+malus) ; 1=échec/20=réussite auto ; **indicatif vs mécanique** |
| D100 | R-1.30, R-1.31 | 2×D10 (00=100) ; chance = D100 ≤ % |

---

## ② Attributs & stats dérivées (D2)
*Squelette numérique. Moteur : **Création/Personnage** (✅ `character.ts`, `createPlayerCharacter`).*

| Mécanique | Source | Mécanique exacte |
|---|---|---|
| 9 aptitudes | R-2.1 | Force, Dextérité, Endurance, Réflexes, Perception, Intelligence, Charisme, Empathie, Esthétique |
| Scoring + limites raciales | R-2.2, R-2.3 | plus haut = mieux ; plafond = `race.attributeMax` |
| Distribution création | R-2.6, R-2.8 | Σ aptitudes = `race.category` ; max création = limite − 1 |
| Attributs nuls (inné/acquis) | R-2.4 | inné = blocage permanent ; acquis = remontable XP |
| Vitalité | R-2.9, R-2.10 | base race ; courante/max ; repos 8 h = 100 % |
| Énergie | R-2.11, R-2.12 | défaut magicien 60, autres 0 ; modèle « exception = règle » extensible |
| Facteur de vitesse | R-2.13, R-2.14 | base race ; 0,2 s/point ; plancher 1 |
| Facteur de volonté | R-2.15, R-2.16 | base race ; échelle 1-20 ; plus bas = mieux |
| Malus d'affaiblissement | R-2.17 | `vitality ≤ ceil(max/2)` → −1 aptitude par point manquant (9 aptitudes only, cap, pas de négatif) |
| Aptitude effective (stacking) | R-2.17 | `max(0, base + atouts ± buffs/debuffs − malus)` — utilisé dans le pool |
| Encombrement | R-2.18 | > Force×5 kg → +1 FV par tranche de 5 kg |
| Progression XP (table) | R-2.20 | coûts officiels par caractéristique (attributs NA×5, compétences NA×3, etc.) |

---

## ③ Temps & action (D9 + D1)
*Rythme de jeu. Moteur : **Combat / timeline** (⚠️ surface existe, profondeur 🔎).*

| Mécanique | Source | Mécanique exacte |
|---|---|---|
| DT (division de temps) | R-9.1 | 1 DT = 0,2 s ; compteur cyclique 1→50 |
| FV = délai d'action | R-9.2 | une action prend `FV` DT avant résolution |
| Recharge = action | R-9.3 | armes balistiques : recharger/viser/tirer = actions distinctes |
| Interruption | R-9.4, R-1.25 | DT écoulés perdus ; énergie d'un sort interrompu perdue |
| Types d'actions | R-1.12 | simple / précise (+) / improvisée (+1, Réflexes) / multiple / contre-action / conservée |
| Action conservée | R-1.24 | +1 difficulté par point de dégât subi pendant l'exécution |
| Timeline dynamique | R-9.22, R-9.23 | `nextActionAt = declaredAt + FV + modifs` ; égalité départagée par Réflexes |

---

## ④ Dégâts (D9)
*Moteur : **Combat** (⚠️/🔎).*

| Mécanique | Source | Mécanique exacte |
|---|---|---|
| Jet de dégâts | R-9.9 | mêlée = réussites_Force + dégâts_arme ; distance = dégâts_arme seul |
| Difficulté du jet de dégâts | R-9.10 | 7 − réussites obtenues au toucher |
| 4 types de dégâts | R-9.11 | **P**erforant / **É**nergétique / **C**ontendant / **T**ranchant (+ composantes additionnelles typées) |
| Ordre des modificateurs | R-9.12 | bouclier → résistance D100 → circonstance → protections P/E/C/T → endurance → zone |
| Modif. de circonstance | R-9.13 | charge +1, chute +2, charge cheval +3 (cumulables) |
| Dégâts retardent l'action | R-9.18-bis | `nextActionAt += finalDamage` (1 DT par point subi) |

---

## ⑤ Défense / atténuation (D9) — chaîne ordonnée (R-9.12)
*Mécaniques **distinctes**. Les **déductions** réduisent les dégâts dans l'ordre ; puis le **multiplicateur de zone** s'applique **en tout dernier** sur le résiduel. Moteur : **Combat** (⚠️/🔎).*

| Ordre | Mécanique | Source | Mécanique exacte (≠ les autres) |
|---|---|---|---|
| 1 | Bouclier **actif** | R-9.7 | contre-action : jet Dex + Bouclier (D10) → réduit les réussites adverses |
| 2 | Bouclier **passif** | R-9.8 | `D100 ≤ %` → déviation **totale** du coup |
| 3 | **Résistances %** | R-1.32/1.33, R-9.12 | `D100 ≤ %` par type (magie, feu, froid, poison…) → **ignore** la composante (négation probabiliste) |
| 4 | Modif. de **circonstance** | R-9.13 | charge +1 / chute +2 / charge cheval +3 (cumulables) |
| 5 | **Protections P/E/C/T** | R-9.14 | **soustraction** déterministe par **couche** (natural/soft/mail/plate/magic) |
| 6 | **Endurance** — *dernier rempart* | R-9.16 | jet d'Endurance (D10) diff 7 → −1 dégât/réussite. **Dernière déduction**, appliquée **seulement si la zone l'autorise** (cf. 7). |
| 7 | Multiplicateur de **zone** | R-9.15 | appliqué **en tout dernier** sur le résiduel : **×2** (tête/gorge/yeux). **Zones « non endurées »** (endurance interdite) : **gorge, yeux, parties génitales (m)**. |
| — | Seuils évanouissement/mort | R-9.17 | sur les dégâts **finaux** d'un coup (> ½ vitalité restante ; > ¼ max tête ; > ½ base tête/gorge = mort) |

> **Deux subtilités (R-9.15 / R-9.17)** :
> - **L'endurance est la dernière déduction** (« dernier rempart ») — *avant* le doublement de zone, qui multiplie le **résiduel post-endurance**.
> - **Certaines zones sont « non endurées »** (gorge, yeux, parties génitales) : l'endurance n'est **pas** autorisée → on applique les autres déductions, puis le ×2. La zone a donc **deux** effets : elle **conditionne** l'endurance **et** applique le **×2**.
>
> **Résistance vs Protection** : la résistance **annule** une composante (probabiliste, D100 ≤ %) ; la protection **retranche** une valeur fixe (P/E/C/T). Mécaniques opposées → catégories séparées.

---

## ⑥ États / altérations (D9)
*Catalogue vivant. Moteur : **Combat / états** (❌/🔎).*

| Mécanique | Source | Mécanique exacte |
|---|---|---|
| Catalogue d'états | R-9.27 | états avec durée, cumul, modificateurs, immunités, interactions (blocks/forces) |
| Familles | R-9.27 | physiques (prone, grappled, stunned…) · mentaux (frightened, charmed…) · sensoriels (blinded…) · environnementaux (poisoned, burning…) · magiques (invisible, cursed…) |

---

## ⑦ Progression (D7)
*Moteur : **Progression** (⚠️ `calculateLevelProgression` existe).*

| Mécanique | Source | Mécanique exacte |
|---|---|---|
| Cycle de progression | R-7.1 | session → XP → dépense → passage de niveau |
| Gain d'XP | R-7.2 | légalisé par le MJ par session |
| Points de quête | R-7.3 | ressource séparée des XP |
| Mort = perte d'XP | R-7.4, R-7.13 | la mort réinitialise les XP accumulés |
| Table des coûts XP | R-7.5, R-2.20 | barème par caractéristique |
| levelPoints | R-7.8 | dérivé (compétences/spés/sorts pondérés : primaire×2 non-mage, sorts×2 mage) |
| Seuil de niveau | R-7.9 | `niveau` dérivé par comparaison à `N × race.category` |
| Pool d'atouts au niveau | R-7.10 | atouts de niveau automatiques au passage |
| Machine mort/mourant | R-7.20/21 | états `dead`/`unconscious`/… (lien D9 R-9.17) |

---

## ⑧ Magie (D8)
*Moteur : **Effets / magie** (❌ manquant — R-3.3/3.4 & co.). Détail des écoles/sorts → D8.*

| Mécanique | Source | Mécanique exacte |
|---|---|---|
| Énergie (ressource) | R-2.11, R-2.12 | pool ; consommation par sort ; repos = récup ; modèle extensible |
| Lancement de sort | R-1.4 | Intelligence + points dans le sort, vs difficulté du Grand Grimoire |
| Temps d'incantation (TI) | R-8.x, R-9.31 | état `casting` pendant TI DT ; vulnérable ; interruptible |
| Effets magiques (buffs/debuffs) | R-1.39 | modificateurs temporaires sur aptitude / facteur / difficulté / sens — empilés linéairement |
| Résistance magique | R-1.33 | D100 ≤ % ; magie **directe** seulement (bloque aussi les soins → fardeau) |
| Écoles de magie | D8 | catalogue (abjuration, invocation…) — *objets, voir D8* |
| Sorts en combat | R-9.31 | flux incantation, ciblage, AOE, contre-sort, interruption |

---

## Carte des moteurs (synthèse)
> « Complet » pour un objet/mécanique = (1) tracé à la source · (2) **moteur implémenté + le consomme** · (3) UI si obligatoire.

| Moteur rules-core | Module | Mécaniques | État **vérifié** (`origin/dev`) |
|---|---|---|---|
| **Résolution (dés)** | `dice.ts` | ① | ✅ implémenté (`rollDice`) |
| **Création / personnage** | `character.ts` | ② | ✅ implémenté (`createPlayerCharacter`, malus d'affaiblissement) |
| **Progression** | `progression.ts` | ⑦ | ✅ largement (`gainXP`, `calculateSessionXPAward`, `learnSkill/Spell`, `finalizeDefinitiveDeath`) |
| **Combat** | `combat.ts` | ③ ④ ⑤ ⑥ | ⚠️ **partiel** — ✅ DT/timeline (`getCyclicDT`, `resolveNextAction`), `applyDamage` (vitalité/mort/inconscient/malus/retard), endurance (`resolveStaminaDamage`), statuts de base (`bleeding/stunned/unconscious/dead`). ❌ **calcul des dégâts** (jet Force+arme, R-9.9/9.10) et **chaîne de défense ⑤** (boucliers, résistances %, protections P/E/C/T par couche, zone ×2) ABSENTS — `applyDamage` reçoit un nombre déjà calculé. |
| **Effets / magie** | — | ⑧ + atouts/sorts à effet propre | ❌ **manquant** — aucune application d'effet ; `SpellAction` = stub. C'est le **gros morceau** (R-3.3/3.4 & co.). |

### Reste-à-faire moteur (le vrai chantier rules-core, vérifié)
1. **Moteur d'effets** (❌) — appliquer les effets d'atouts/sorts/potions/capacités. Débloque atouts (2406), sorts (324), et les sorts en combat.
2. **Combat — calcul des dégâts + chaîne de défense ⑤** (⚠️→❌) — jet de dégâts (Force+arme) puis boucliers → résistances % → protections P/E/C/T → endurance → zone. Aujourd'hui `applyDamage` saute toute cette étape.
3. **Combat — catalogue d'états complet** (R-9.27) — au-delà des 4 statuts actuels.
*(Résolution, création, progression : faits.)*

---

## À faire (sur ce document)
- Confirmer/corriger chaque ligne avec l'auteur (autorité K&W).
- Vérifier l'état réel des moteurs contre `packages/rules-core` (remplacer les 🔎).
- Brancher sur NOMOS : ces mécaniques = unités canoniques `rule` des domaines D1/D2/D7/D8/D9.
