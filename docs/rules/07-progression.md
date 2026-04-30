# D7 — Progression / XP / Niveaux

> Mécanismes de gain et de dépense d'XP, calcul du niveau, passage de niveau, débloqage de la pool d'atouts. Reprend et formalise les coûts de [Experience.doc](regles-papier/extracted/listes/experience.md) déjà partiellement actés en D2.

**Sources** :
- [documents/regles/index.md:206-248](documents/regles/index.md) — section Niveaux + Expérience
- [regles-papier/extracted/listes/experience.md](regles-papier/extracted/listes/experience.md) — coûts XP officiels
- [documents/atouts-niveaux/index.md](documents/atouts-niveaux/index.md) — catalogue web (2186 lignes)
- [regles-papier/extracted/listes/atouts-de-niveaux.md](regles-papier/extracted/listes/atouts-de-niveaux.md) — catalogue paper (450 lignes)
- [site/includes/class/CharacterPlayer.php:60-189](site/includes/class/CharacterPlayer.php) — calcul de levelPoints
- [site/includes/managers/user/UpdateCharacterMan.php](site/includes/managers/user/UpdateCharacterMan.php) — méthodes d'update
- [site/includes/managers/user/AddCharacterMan.php:486-946](site/includes/managers/user/AddCharacterMan.php) — `setRandom*` pour PNJ

---

## Partie A — Cycle de progression

### R-7.1 — Cycle global de progression

```
1. Joueur participe à une session de jeu
   ↓
2. MJ distribue de l'XP en fin de session (1-8 pts + 1 pt quête)
   ↓
3. XP s'accumule dans la "réserve" du perso (XP disponibles)
   ↓
4. Joueur dépense des XP pour améliorer son perso (entre sessions, ou au passage de niveau)
   ↓
5. levelPoints (dérivé) augmente
   ↓
6. Si levelPoints atteint le seuil suivant → passage de niveau
   ↓
7. Pool d'atouts au passage de niveau s'ouvre, le joueur choisit
   ↓
8. Cycle continue
```

**Statut** : 🟢 claire

### R-7.2 — Gain d'XP par session (légalisé par MJ)

**Énoncé legacy** ([regles:234-247](documents/regles/index.md)) :

> À la fin de chaque session de jeu, le maître de jeu distribue des points d'expériences aux joueurs. [...] Pour une évolution harmonieuse, il est conseillé de distribuer **entre 1 et 8 points d'expériences, plus 1 point de quête**.

**Échelle officielle (recommandée pour une session de 4-5 h)** :

| Critère | Points |
|---|---|
| Présence (le joueur est venu à la session) | 1 |
| Concentration (joueur attentif à l'histoire et à ce qui se dit) | 1 |
| Respect de la parole des autres | 1 |
| Respect de la psychologie du personnage | 1 |
| Personnage a atteint un objectif | 1 |
| Interprétation du personnage | 0 à 3 |
| **Point de quête** (cumulatif, séparé, R-7.3) | 1 |
| **TOTAL XP par session** | 1 à 8 (+ 1 pt quête) |

**Important** : *« il est important de ne pas comparer les joueurs entre eux, mais de le faire par rapport à eux-mêmes »* — l'XP n'est PAS compétitif entre joueurs, c'est un retour sur la progression individuelle.

**Précisions auteur (2026-04-25)** :

1. **Le 1-8 est une fourchette indicative, pas un plafond dur**. Le MJ peut récompenser au-delà selon contexte, notamment pour des sessions longues ou particulièrement riches.

2. **Temps de jeu effectif récompensé** (en plus des critères qualitatifs) :
   - Le **temps réellement joué** (pas le temps de connexion) ouvre une dimension de récompense supplémentaire
   - À calculer probablement en `XP par bloc de N heures effectives` ou similaire
   - Distinct du temps de présence simple (le joueur peut être connecté sans jouer effectivement)
   - Formule précise à concevoir en phase 2

3. **Pas d'XP par monstre tué** : les combats **ne sont pas récompensés en tant que tels** (cohérent avec le texte legacy qui valorise « qualité d'interprétation, non nombre d'ennemis tués »). Mais le **rôle joué pendant le combat** (psychologie, interprétation, courage, prudence selon le perso) **est récompensé** dans les critères qualitatifs habituels.

**Statut** : 🟢 claire

### R-7.3 — Points de quête : ressource séparée

**Énoncé legacy** ([regles:248](documents/regles/index.md)) :

> Le point de quête ne se mélange pas aux points d'expériences, mais se note à part et se cumule à chaque session de jeu. Ces points ne sont accessibles aux personnages qu'**une fois l'histoire terminée, si le personnage y survit**.

**Conséquences** :
- Les points de quête sont une **ressource différée** — non utilisables pendant la quête en cours
- Convertis en XP utilisables une fois la quête terminée (et survie du perso)
- Si le perso meurt avant la fin de la quête : **points de quête perdus** (au même titre que les XP, cf. R-7.4)

**Statut** : 🟢 claire

**Modèle de données** : `characters.quest_points` (séparé de `characters.experience_points`).

### R-7.4 — Mort = perte de tous les XP

**Énoncé legacy** ([regles:236](documents/regles/index.md)) :

> La mort du personnage implique la **perte de tous les points d'expérience** que le joueur avait acquis avec celui-ci.

**Conséquences** :
- Mort = retour case départ pour les XP cumulés non encore dépensés
- Les points dépensés (aptitudes, compétences, atouts) restent **acquis** sur la fiche pendant la mort, mais le perso est mort donc inutile
- Si **résurrection** (Baiser salvateur, soins magiques avant fin de la "fenêtre de mort", etc.) : les XP accumulés ET les points de quête sont définitivement perdus, mais les acquis (stats) restent

**Statut** : 🟢 claire

**Question subsidiaire** : la résurrection avant un seuil donne-t-elle accès aux XP perdus ? D'après le texte, **non** — la mort cause la perte, peu importe si on revient à la vie après. À confirmer en cas d'ambiguïté narrative.

---

## Partie B — Dépense d'XP : référentiel des coûts

### R-7.5 — Tableau des coûts (rappel D2 R-2.20)

**Source officielle** : [Experience.doc](regles-papier/extracted/listes/experience.md).

`NA` = Niveau Actuel dans la caractéristique. `NB` = Niveau de Base (racial / initial).

| Caractéristique | Coût XP par +1 | Exemples (NA=1,2,3,4,5) |
|---|---|---|
| **Aptitudes (sous limite physique)** | NA × 5 | 5, 10, 15, 20, 25 |
| **Aptitudes (au-delà de la limite physique)** | NA × 20 | 100, 120, 140, 160, 180 |
| **Aptitudes au-delà de limite avec « Anti-limites physiques » / « Force de géant »** | NA × 10 | 50, 60, 70, 80, 90 |
| **Aptitudes au-delà de limite avec « Dépassement de soi »** | NA × 15 | 75, 90, 105, 120, 135 |
| **Compétence existante** | NA × 3 | 3, 6, 9, 12, 15 |
| **Nouvelle compétence** | 3 (flat, NA passe à 1) | 3 |
| **Spécialisation existante** | NA × 3 | 3, 6, 9, 12, 15 |
| **Nouvelle spécialisation** | 3 (flat) | 3 |
| **Sort existant** | NA × 10 | 10, 20, 30, 40, 50 |
| **Nouveau sort** | 10 (flat) | 10 |
| **Énergie max** (+1) | 3 (flat) | 3 |
| **Vitalité max** (+1) | 10 (flat) | 10 |
| **Facteur de vitesse (-1)** | (NB - NA + 1) × 25 | 25, 50, 75, 100, 125 |
| **Facteur de volonté (-1)** | (NB - NA + 1) × 25 | 25, 50, 75, 100, 125 |
| **Atout de classe éphémère (+1 usage/jour)** | NA × 10 | 10, 20, 30, 40, 50 |

**Statut** : 🟢 claire (déjà tranché en D2 R-2.20)

**Atouts NON achetables via XP** :
- Atouts raciaux (automatiques à la création, irréversibles)
- Atouts de classe **permanent** (automatique, lié à la classe — D4 R-4.3)
- Atouts d'orientation (automatique sauf magicien Familier perm)
- **Atouts de niveau** (sélectionnés gratuitement à chaque passage de niveau dans la pool R-7.10)
- Atouts éphémères de classe peuvent être **augmentés en usage/jour** via XP, mais l'atout lui-même est gratuit à la création.

### R-7.6 — Quand peut-on dépenser des XP ?

**Énoncé legacy** : implicite — entre les sessions de jeu, en présence du MJ pour validation. Pas de règle stricte.

**Question pour digital** :
- (a) **Entre sessions uniquement** (mode tabletop) — verrouillé pendant une session
- (b) **N'importe quand** sauf en plein combat
- (c) **À chaque passage de niveau** (forçage — XP s'accumulent jusqu'au passage)

**À trancher : Q-D7.5**.

### R-7.7 — Validation de la dépense XP

Politique selon mode arbitre (cohérent avec le pattern hybride général) :

| Arbitre | Politique |
|---|---|
| **MJ humain** | Le MJ valide narrativement chaque dépense (apprentissage justifié par RP, mentor disponible, etc.) |
| **MJ LLM** | LLM valide la cohérence (pas d'achat de Magie Blanche pour un perso jamais en contact avec des religieux) |
| **MJ auto strict** | Validation automatique sur la base du système d'apprentissage (R-5.6-bis) — accès au savoir minimum requis pour acheter des points dans une compétence/sort |

**Renvoi** : Q-D5.2-d (gating narratif déjà tranché) s'applique aussi à la dépense XP, pas juste à la création.

---

## Partie C — Niveau et passage de niveau

### R-7.8 — Calcul du levelPoints (rappel D2 R-2.20 / D5 R-5.16)

```python
def levelPoints(character):
    if character.orientation == "magicien":
        # Magicien : compétences ×1, sorts ×2 (TOUS sorts, peu importe l'école)
        return Σ(skill.points × 1) + Σ(spell.points × 2)
    else:
        # Non-magicien : compétences ×1, sauf compétence primaire et son arbre récursif (×2)
        primary_id = character.primary_skill_id
        return Σ(skill.points × (2 if is_in_main_tree(skill, primary_id) else 1))
```

**Note** : `is_in_main_tree` est récursif (toute spécialisation / spé de spé / etc. de la primaire → ×2).

**Statut** : 🟢 claire

### R-7.9 — Seuil de passage de niveau

**Énoncé legacy** ([regles:226-230](documents/regles/index.md)) :

> Niveau N atteint quand `levelPoints ≥ N × race.category`

**Exemple** (humain catégorie 20) :
- N1 = 20 levelPoints
- N2 = 40 levelPoints
- N3 = 60 levelPoints
- ...

**Conséquence pour les races à catégorie haute** : un Loup-garou (cat 45) atteint N1 à 45 levelPoints, soit beaucoup plus que humain. Cohérent avec le principe « catégorie haute = race puissante mais progresse lentement ».

**Statut** : 🟢 claire

### R-7.10 — Pool d'atouts au passage de niveau (rappel D3 R-3.4 / D4 R-4.7)

**À chaque passage de niveau N**, la pool d'atouts s'**ouvre** :

```
pool = (atouts de niveau ≤ N accessibles selon orientation, classe, race, conditions)
       − (atouts permanents non-cumulables déjà acquis)
       + (atouts éphémères : reste dans la pool, cumulables pour usage/jour)
```

Le joueur **choisit librement** un atout dans cette pool. Les autres atouts de la pool restent disponibles pour les niveaux futurs (le joueur peut prendre un atout N2 même au niveau N5, s'il l'avait sauté avant).

**Atout Polyvalence** (D4 R-4.6) : étend la pool aux atouts d'autres orientations, jusqu'au niveau Polyvalence + 1. Cumulable.

**Statut** : 🟢 claire

### R-7.11 — Effets passifs du passage de niveau

Au passage de niveau, **plusieurs effets se déclenchent automatiquement** :

1. **Sélection d'un atout de niveau** (R-7.10) — le joueur choisit dans la pool
2. **Renaissance du familier** (Magicien) — change de forme possible, récupération de familier mort possible (cf. [regles:131](documents/regles/index.md))
3. **Atouts permanents qui scale avec le niveau** : leur effet augmente automatiquement (ex: Précision = +niveau aux dés, augmente immédiatement)
4. **Réussites des tests d'enseignement / apprentissage** : +niveau dans les jets concernés (atouts spécifiques)
5. **Niveau visible** dans les seuils d'effets (ex: « durée 10 min/niveau », « rayon 1m/niveau »)

**Statut** : 🟢 claire

---

## Partie D — Persistance et historique

### R-7.12 — Modèle de données XP

```sql
characters.experience_points        -- XP cumulés disponibles à dépenser
characters.experience_total          -- XP total acquis (cumulatif, jamais réduit sauf mort)
characters.quest_points              -- Points de quête (séparés, ressource différée)
characters.level_points              -- Dérivé (calculé à chaque modification de skills/spells)

experience_log (
  id, character_id, type {gain, dépense}, amount, reason,
  session_id NULL, awarded_by_user_id NULL, spent_on_id NULL,
  created_at, validated_by_user_id NULL
)
```

**Tracking complet** :
- Chaque gain XP est loggué (quelle session, qui a attribué, pour quelle raison)
- Chaque dépense XP est logguée (sur quoi, validé par qui)
- Permet **l'audit** et **la migration** sur changement de règles
- Permet la **résolution de litiges** (un MJ peut contester un gain antérieur)

**Statut** : 🟢 spec claire pour la phase 2

**Renvoi D2 Q-D2.8** : ce modèle clôt la question Q-D2.8 (XP est trou de spec v1) en proposant un système de tracking + historique.

### R-7.13 — Comportement à la mort (rappel R-7.4)

```
Sur l'événement "death(character)" :
  character.experience_points = 0     -- XP disponibles perdus
  character.quest_points = 0          -- Points de quête perdus
  -- experience_total reste pour traçabilité historique
  -- experience_log conserve l'historique complet
  -- skills/aptitudes/atouts acquis restent (intransmissibles)
```

Si **résurrection** :
- Le perso revient à la vie avec ses acquis (stats / atouts / compétences) intacts
- XP disponibles et points de quête **restent à 0** (ne se reconstituent pas)
- Recommencer à accumuler à partir de la prochaine session

---

## Partie E — Génération PNJ par niveau (rappel R-6.10 / Q-D6.4 C.2)

### R-7.14 — Distribution statistique pour PNJ générés

Pour générer un PNJ à un niveau cible (cas D6 Q-D6.4 C.2 — armée, mercenaires, etc.) :

**Algo simplifié** :
1. Calculer le **levelPoints cible** = `niveau × race.category`
2. Distribuer ce budget entre :
   - Aptitudes (selon profil de classe — ex: Guerrier privilégie Force/Endurance, Magicien privilégie Intelligence)
   - Compétences (autour de la compétence primaire de la classe + spés cohérentes)
   - Sorts (si magicien)
3. Acquérir automatiquement les atouts de niveau dans la pool (atouts permanents préférés, éphémères avec usage/jour modéré)
4. Calculer dérivées : vitality, energyMax, FV, FVol selon `setRandom*` du code (déjà documenté D2 R-2.9, R-2.14, R-2.16)

**Variabilité** : appliquer une distribution gaussienne autour des valeurs idéales pour éviter N copies identiques.

**Implication architecturale** : un service `PnjGenerator` consomme le catalogue actuel (atouts, sorts, compétences via CMS D5 Q-D5.3) et applique les distributions. **Stateless**, peut être appelé pour des lots de PNJ.

**Statut** : 🟢 spec claire pour phase 2

### R-7.15 — Templates statiques de PNJ

Cf. D6 Q-D6.4 C.1. Un template de PNJ est :
- Un perso "modèle" sauvegardé (un Garde humain N3, un Mage clerc N5)
- Instantiable plusieurs fois avec petite variabilité (nom, statistique mineure)
- Géré par admin / MJ via le CMS

**Statut** : 🟢 spec claire

---

## Partie F — Transformation de race (clôture Q-D3.5-c-i/ii/iii)

D3 a établi qu'un perso peut **changer de race** en cours de jeu (Vampire, Loup-garou via morsure, etc., D3 Q-D3.5-c). Trois sous-questions étaient reportées à D7 :

### R-7.16 — Capping des aptitudes après transformation de race ✅ tranché 2026-04-25

Quand un perso change de race, sa **nouvelle race** a des limites physiques différentes pour les 9 aptitudes. Si une aptitude dépasse la nouvelle limite :

**Capping immédiat** : l'aptitude est ramenée au max de la nouvelle race. Points au-dessus **perdus définitivement** sans remboursement XP.

**Justification narrative** : la transformation est un événement traumatique / surnaturel (vampirisation, lycanthropie, mort animée) qui « refonde » le corps du perso dans les contraintes de sa nouvelle nature.

### R-7.17 — Recalcul des bases dérivées après transformation de race ✅ tranché 2026-04-25

**Principe** : les améliorations XP investies dans les stats dérivées sont **préservées** comme delta absolu, ré-appliqué sur la nouvelle base raciale.

**Formules** :

**Stats ascendantes** (vitalité, energy si applicable — plus haut = mieux) :
```
delta = current_value − old_race.base
new_value = new_race.base + delta
```

**Stats descendantes** (FV, FVol — plus bas = mieux, l'amélioration consiste à descendre) :
```
delta = old_race.base − current_value   (≥ 0, représente les améliorations acquises)
new_value = max(1, new_race.base − delta)   (clamp min 1, R-2.13 / R-2.15)
```

**Exemple** — Humain N5 (`vitalityMax 35, FV 6, FVol 8`) qui devient Loup-garou (bases : vitalité 41, FV 7, FVol 15) :
- Vitalité : delta = 35 − 20 = +15 → new = 41 + 15 = **56**
- FV : delta = 8 − 6 = +2 → new = 7 − 2 = **5**
- FVol : delta = 12 − 8 = +4 → new = 15 − 4 = **11**

**Vitalité courante (`vitality` ≠ `vitalityMax`)** :
- Conservation **proportionnelle** : `new_vitality = new_vitalityMax × (old_vitality / old_vitalityMax)`
- Si le perso était à 50% de PV avant, il reste à 50% après (arrondi à l'entier le plus proche).

**Énergie** :
- L'`energyMax` est lié à l'**orientation** (Magicien base 60 / Non-magicien base 0) + atouts éventuels (Art occulte Vampire +40, atouts magiciens « Énergie latente », etc.).
- La **transformation de race ne change pas l'orientation** — donc `energyMax` reste calculé comme avant la transformation.
- Cas spécial : un perso qui devient Vampire et obtient l'atout **Art occulte** (N2 racial) gagne **+40 energyMax** via l'atout, indépendamment de la transformation elle-même.

**Effets temporaires (buffs/debuffs magiques)** : conservés à travers la transformation tant que leur durée n'est pas expirée.

**Atouts/Handicaps de race** : retirés (anciennes race) + ajoutés (nouvelle race), conformément à D3 Q-D3.5-c.

### R-7.18 — Q-D3.5-c-iii : niveau actuel après changement de catégorie

Si la nouvelle race a une catégorie différente, le seuil par niveau change. Le niveau est **inflexiblement lié à la catégorie de la race jouée**.

**Décision auteur (2026-04-27)** :
- La table compétences/spécialisations ne change pas.
- Les sorts connus ne changent pas.
- L'orientation et la classe ne changent pas : on accepte donc des cas comme un clerc mort-vivant.
- `levelPoints` reste calculé à partir des acquis du personnage.
- `level` est **recalculé** = `floor(levelPoints / new_race.category)`.
- Tous les atouts de niveau déjà acquis sont perdus lors de la transformation.
- Le personnage est ensuite **rebuild** avec le nouveau niveau calculé, selon les règles standard de choix d'atouts de niveau.
- Les nouveaux atouts raciaux et atouts de niveau de race deviennent disponibles si la nouvelle race les ouvre.

**Exemple** : un humain N5 (`catégorie 20`, `100 levelPoints`) devient Loup-garou (`catégorie 45`). Son niveau devient `floor(100 / 45) = 2`. Il perd les atouts de niveau acquis comme humain et reconstruit ses choix d'atouts comme personnage de niveau 2 avec la nouvelle race/catégorie.

---

## Partie F-bis — Machine d'état mort / mourant / résurrection

### R-7.20 — Machine d'état du personnage (vivant → mort définitive)

Un personnage évolue dans une **machine d'état** où chaque transition implique des **conditions mécaniques** (PV, temps écoulé) et **détermine quelles méthodes de résurrection restent applicables**.

```
[VIVANT]
  ↓ PV ≤ 0 OU déclencheur immédiat (mort instantanée tête/gorge >½ vit. de base)
[KO / ÉVANOUISSEMENT]   (selon R-1.17, R-2.17 : endurance 0 ou seuils dégâts)
  ↓ blessures persistantes / temps sans soins (compteur t1)
[MOURANT]   (corps salvageable, état réversible si soins rapides)
  ↓ temps t1 écoulé sans intervention OU dégâts létaux confirmés
[MORT RÉCENTE]   (méthodes magiques modérées encore possibles)
  ↓ temps t2 écoulé
[MORT CONFIRMÉE]   (méthodes magiques avancées requises)
  ↓ temps t3 écoulé / corps dégradé
[MORT DÉFINITIVE]   (âme partie, aucune méthode standard)
```

**Les états ne sont pas linéaires** : un perso à PV ≤ 0 peut passer directement en « MORT RÉCENTE » si le coup létal est extrême (tête/gorge >½ vitalité de base). Les soins peuvent ramener un « MOURANT » à « VIVANT ».

**Compteurs de temps** (à valider en spec) :
- `t1` (KO → MOURANT) : court (quelques DT à minutes selon contexte)
- `t2` (MOURANT → MORT RÉCENTE) : minutes
- `t3` (MORT RÉCENTE → MORT CONFIRMÉE) : 1 minute par niveau (cohérent avec Baiser salvateur D3 R-3.4)
- `t4` (MORT CONFIRMÉE → MORT DÉFINITIVE) : heures à jours selon contexte (corps dégradable)

### R-7.21 — Catalogue des méthodes de résurrection (table régressive)

Pour chaque méthode, indiquer **dans quels états** elle est encore applicable.

| Méthode | KO | Mourant | Mort récente | Mort confirmée | Mort définitive |
|---|:---:|:---:|:---:|:---:|:---:|
| Soins simples (potion, compétence Médecine, sort de soin mineur) | ✅ | ✅ | — | — | — |
| Auto-régénération raciale (Loup-garou, Troll) | ✅ | ✅ | — | — | — |
| **Baiser salvateur** (atout, < 1 min/niveau) | ✅ | ✅ | ✅ (si délai respecté) | — | — |
| Sort de soin majeur / résurrection magie blanche (D8) | ✅ | ✅ | ✅ | — | — |
| Sort de résurrection avancé (D8, à détailler) | ✅ | ✅ | ✅ | ✅ | — |
| Intervention divine / résurrection extrême (D8 ou narratif MJ) | ✅ | ✅ | ✅ | ✅ | ⚠️ (rare, coût narratif majeur) |

**Régression** : à mesure que l'état se dégrade, **moins de méthodes** sont disponibles. La fenêtre de Baiser salvateur (1 min/niveau) est plus stricte que celle d'un sort de résurrection avancé.

**À détailler en D8** (Magie) : les sorts de résurrection avec leurs fenêtres temporelles propres, leurs coûts en énergie, leurs prérequis (Lien sang, présence du corps, etc.).

### R-7.22 — Effet sur les XP et points de quête lors d'une résurrection

Cohérent avec Q-D7.4 (option b) : **toute résurrection effective restaure** les XP cumulés et points de quête à leur valeur d'avant la mort.

**Cas spécifique** : si le perso meurt définitivement (état MORT DÉFINITIVE atteint), les XP sont **perdus à jamais**. Une intervention narrative extrême (MJ ramène un perso depuis cet état) peut décider de restaurer les XP ou pas — au cas par cas, à l'arbitrage du MJ humain (mode auto strict refusera).

**Règle de design** : la perte d'XP est un **outil de tension narrative**, pas une punition automatique. Le MJ humain a la latitude de l'appliquer ou non.

---

## Partie G — Migration des persos sur changement de règles

### R-7.19 — Migration assistée (méta-principe « règles vivantes »)

Cohérent avec le méta-principe acté 2026-04-25 (règles vivantes), quand une règle change, les persos existants doivent être **migrés** sans perte.

**Cas types** :
- Renommage d'une compétence → relinking automatique
- Suppression d'une compétence → fusion dans une nouvelle compétence sœur (admin spécifie la cible) OU conversion en compétence custom
- Changement d'un coût XP → application **différée** (les futures dépenses suivent la nouvelle règle, les anciennes sont préservées)
- Changement d'une formule (ex: formule familier `niveau×5` → `niveau+5`) → **double versioning** : le perso garde sa version d'origine sauf si admin force la migration
- Ajout d'une nouvelle race / classe → option de re-création ouverte aux joueurs concernés

**Workflow** :
1. Admin propose changement de règle (via CMS)
2. Système simule l'impact sur les persos existants
3. Admin valide la migration (auto, manuelle, ou opt-out par joueur)
4. Persos migrés, log d'audit conservé

**Statut** : 🟡 spec à détailler en phase 2

---

## Partie H — Questions ouvertes

### ~~Q-D7.1~~ — Aptitudes après transformation ✅ **Tranché (2026-04-25)** : Option (b) **Capping immédiat**.

**Mécanique** : à la transformation, chaque aptitude est ramenée au **max de la nouvelle race**. Les points au-dessus sont **perdus définitivement** sans remboursement XP.

**Exemple** : Humain (Esth max 5) avec Esthétique = 5 devient Squelette (Esth max 1) → Esthétique passe à 1, 4 points perdus.

**Implication** : la transformation a un **vrai coût mécanique**. Cohérent avec le caractère traumatique / surnaturel des transformations (Vampire, Loup-garou, Squelette). Le perso « renaît » dans son nouveau corps avec ses limites propres.

**R-7.16 mise à jour** : remplace la décision proposée (grandfathering) par capping immédiat.

### ~~Q-D7.2~~ — Recalcul bases dérivées ✅ **Tranché (2026-04-25)** : Option (d) **nouvelle base + delta acquis** (formules dans R-7.17). Ascending = base+delta ; Descending = base-delta avec clamp à 1. Vitalité courante conservée proportionnellement.

### ~~Q-D7.3~~ — Niveau après changement de catégorie ✅ **Tranché (2026-04-27)** : recalcul strict sur la nouvelle catégorie.

**Règle** : le niveau est recalculé à partir des `levelPoints` et de la catégorie de la nouvelle race.

La classe, les compétences/spécialisations et les sorts ne changent pas. Les atouts de niveau déjà acquis sont perdus puis reconstruits selon le nouveau niveau calculé et les atouts accessibles à la nouvelle race.

### ~~Q-D7.4~~ — Résurrection et XP ✅ **Tranché (2026-04-25)** : Option (b) **Résurrection annule la perte**.

**Justification de l'auteur** : *« il y'a plein de fois où le MJ veut récupérer une mort non prévue, il faut que ce soit possible »*. Donc toute résurrection effective restaure les XP et points de quête comme si la mort n'avait jamais eu lieu.

**Cohérence narrative** : le texte legacy R-7.4 (« mort = perte XP ») reste valide pour les **morts définitives** (le corps n'est pas ramené). Mais la **résurrection effective** annule cette perte.

### ~~Q-D7.4-a~~ — Machine d'état mort/mourant ✅ **Tranché (2026-04-25)** : besoin d'**états distincts** et d'un **compteur de temps** pour chaque méthode de résurrection. Méthodes **régressives** (moins de moyens disponibles à mesure que l'état se dégrade et que le temps passe).

**Voir nouvelle règle R-7.20 ci-dessous.**

### ~~Q-D7.5~~ — Timing de dépense XP ✅ **Tranché (2026-04-25)** : Option (d) hybride par mode (sans mode expert).

**Mécanique** :

| Mode session | Politique de dépense XP |
|---|---|
| **Tabletop / asynchrone (forum-RP)** | **Entre sessions uniquement** — XP gagnés en fin de session N dépensables avant la session N+1, pas pendant la session. |
| **Temps réel / live (RPG digital style D&D vidéoludique)** | **Verrouillé par défaut**. Ouverture via **événements narratifs déclencheurs** (cf. ci-dessous). |
| **Tour par tour** | Idem temps réel : verrouillé sauf événements. |

**Événements déclencheurs en mode temps réel / tour par tour** :
- Le MJ (humain ou LLM) ou le moteur narratif peut **ouvrir une fenêtre temporaire de dépense XP** :
  - **Avant un boss** ou une scène cruciale
  - **Long repos / nuit calme** dans une auberge
  - **Cérémonie / rituel** (initiation, montée de grade)
  - **Lieu sacré** propice à la réflexion / l'apprentissage
  - **Maître / mentor disponible** (justification narrative — cf. R-5.6-bis système d'apprentissage)
- L'événement est annoncé au joueur (« Vous avez 24 h de repos avant l'assaut. Dépensez vos XP si vous le souhaitez. »)
- La fenêtre se ferme automatiquement après expiration narrative ou à la transition d'événement.

**Contrainte universelle** (tous modes) : la dépense XP nécessite une **justification narrative** d'apprentissage cohérente avec le système R-5.6-bis (mentor, livre, expérience, etc.). En mode auto, le moteur valide automatiquement la cohérence.

### ~~Q-D7.6~~ — Cap de niveau ✅ **Tranché (2026-04-25)** : **Pas de cap mécanique**, mais **limites naturelles** émergentes.

**Mécanique** : la progression est **théoriquement infinie**. Aucune règle dure ne plafonne le niveau, l'aptitude, la compétence ou le sort.

**Limites naturelles qui émergent du système** :

1. **Disponibilité des mentors / ouvrages** (R-5.6-bis) : pour acheter un point dans une compétence à un haut niveau, il faut un **mentor capable** (donc lui-même de très haut niveau dans cette compétence) ou un **ouvrage de référence** correspondant. Plus on monte, plus ces ressources se raréfient narrativement (qui peut enseigner Magie Blanche niveau 14 ?).

2. **Temps d'apprentissage** : le perso doit **travailler la compétence** pendant un temps proportionnel au niveau cible (cf. R-5.6-bis et R-5.6-ter : `coût_XP × 3 jours`, réduit par les jets/atouts). Plus le niveau est élevé, plus le temps requis explose. Un personnage à N50 aurait passé sa vie à étudier.

3. **Coût XP exponentiel** : `NA × 3` pour les compétences signifie que monter de NA=14 à 15 coûte 45 XP, de 19 à 20 = 60 XP, etc. À l'échelle d'une session qui rapporte 1-8 XP, atteindre N15 dans une compétence = des dizaines à centaines de sessions.

4. **Mort = perte** : tant qu'un perso est mortel et joue, le risque de mort plane et empêche la progression infinie sans accident.

**Implication design** : pas besoin d'un cap dur. Le système se régule par la **rareté narrative** et **l'économie XP**. C'est cohérent avec le principe « règles vivantes » et la philosophie ouverte du jeu.

**Pour la spec digitale** : pas de cap codé en dur, mais l'UI peut **mettre en garde** quand un joueur tente une dépense XP irréaliste sans mentor / temps disponible (cohérent avec mode tutoriel R-6.5).

### 🟡 Q-D7.7 — XP transférable aux personnages secondaires **Base retrouvée / distinctions corrigées (2026-04-27)**

Règle écrite minimale retrouvée dans les règles legacy :

- Les "personnages secondaires" peuvent évoluer avec l'expérience que le personnage primaire leur cède.
- Exemple explicite : un cavalier peut donner une partie de son XP à son cheval pour augmenter sa vitesse de course.
- Si le personnage secondaire possède une classe, il passe aussi les niveaux.

**Correction de spec** :
- Les **compagnons / montures non magiques** sont des personnages ou créatures autonomes à part entière, que leur propriétaire PJ ou PNJ peut faire évoluer en partageant sa propre XP.
- Les **familiers magiques** ne doivent plus être traités par cette règle générale : ils utilisent D8 R-8.13 (`niveau du magicien × 100`, renaissance, atouts comme pseudo-raciaux).
- Les occurrences legacy qui incluent les familiers dans les personnages secondaires sont conservées comme contexte historique mais ne servent pas de modèle mécanique principal.

**Décisions complémentaires (2026-04-27)** :
- Il n'y a **pas de limite de transfert XP** autre que la réserve d'XP libre du propriétaire.
- Les XP cédés au compagnon/monture sont dépensés **au détriment de l'évolution du propriétaire**.
- Le compagnon/monture est contrôlé comme un autre personnage, avec ses propres statistiques.
- Sa mort est définitive comme pour n'importe quel personnage, sauf effet de résurrection applicable.
- Son passage de niveau suit les règles normales de personnage selon sa race/catégorie/classe éventuelle.
- Le loot suit les règles établies pour un personnage indépendant ; les accords de partage éventuels relèvent du lien social/contrat (D13 R-13.10).

**Reste à préciser** : procédure d'acquisition/recrutement des compagnons/montures. Voir D13 R-13.10 pour les compagnons persistants.

### ~~Q-D7.8~~ — Atouts de niveau rétroactifs ✅ **Tranché (2026-04-25)** : **Totalement rétroactifs**, avec pénalisations naturelles.

**Mécanique précise** :

1. **Pool d'atouts disponible** au passage du niveau N actuel :
   ```
   pool = (tous atouts de niveau ≤ N accessibles selon orientation, classe, race, conditions, Polyvalence)
        − (atouts non-cumulables déjà acquis)
   ```
   Les atouts **cumulables** (notamment les éphémères selon [regles:84-86](documents/regles/index.md)) **ne disparaissent jamais** de la pool — ils peuvent être repris autant de fois qu'on veut (chaque instance = +1 usage/jour ou effet équivalent).

   Les atouts **non-cumulables** sortent de la pool **dès qu'ils sont acquis une fois** (logique : inutile de les reprendre).

2. **Pas de limite temporelle de rattrapage** : un atout N2 peut être pris à N2, N3, N5, N15… À tout moment où le perso passe un niveau ≥ 2.

3. **Pénalisation naturelle pour les atouts à effet déclenché par passage de niveau** :
   - Certains atouts (ex: « Énergie latente » Magicien N2 perm : *« Chaque fois que le personnage passe le niveau, son niveau en Energie latente × 3 est ajouté à ses points de sort »*) ont un effet **par passage de niveau futur**.
   - Si pris **rétroactivement**, l'effet **ne se déclenche que pour les passages de niveau à venir**, pas rétroactivement pour les niveaux déjà passés.
   - **Exemple** : un magicien N5 qui prend « Énergie latente : 1 » au niveau N5 ne gagne PAS les +3 PS qu'il aurait dû gagner s'il l'avait pris à N2 et bénéficié des passages N3, N4, N5. Il commencera à gagner +3 PS uniquement à partir du passage N6.
   - C'est la **pénalisation naturelle** du rattrapage tardif : le joueur ne perd pas l'atout (il peut toujours le prendre) mais perd les bénéfices passés.

4. **Implication architecturale** : le moteur doit distinguer deux types d'effets d'atout :
   - **Effets statiques** (ex: « Précision » = +niveau aux dés de tir) : s'appliquent immédiatement à la prise et reflètent le niveau actuel.
   - **Effets déclenchés par événement** (ex: « Énergie latente » qui déclenche au passage de niveau) : s'appliquent uniquement aux événements **postérieurs** à la prise de l'atout. Pas de rétroactivité.

**Pas de question subsidiaire ouverte** — règle complète.

### ~~Q-D7.9~~ — LLM et distribution XP ✅ **Tranché (2026-04-25)** : Option (c) **hybride** — décomposition par critère + appréciation LLM, avec précisions importantes.

**Mécanique LLM** :
- Le LLM **décompose explicitement les critères** de l'échelle officielle (R-7.2) avec une **justification courte** par critère pour transparence/traçabilité.
- Décomposition pour chaque joueur en fin de session : présence, concentration, parole, psychologie, objectif, interprétation, quête, **+ temps de jeu effectif** (cf. R-7.2 précisions).
- Le **1-8 n'est pas un plafond dur** : le LLM peut accorder plus si la session le justifie (longue, riche narrativement). Doit le justifier explicitement.

**Pas d'XP par monstre** : le LLM ne compte PAS les ennemis tués comme une métrique XP. Mais il évalue le **rôle joué pendant les combats** dans le critère « interprétation » et « psychologie » habituels.

**Configurabilité admin** : l'admin de la campagne peut configurer :
- Strict (cap dur à 8 XP, échelle officielle stricte)
- Standard (suit l'échelle, peut dépasser légèrement avec justification)
- Généreux (tonalité narrative riche, plus permissif)
- + paramètres de bonus pour temps effectif joué

**Implication architecturale** :
- Le LLM consomme la **transcription de la session** (messages des joueurs, événements, jets de dés, descriptions narratives) + la fiche du perso
- Produit un **rapport XP par joueur** avec justification ligne par critère
- Le rapport est **review-able** par l'admin / le joueur (objection possible avant finalisation)
- Dans `experience_log` (R-7.12), chaque attribution porte la justification du LLM

### ~~Q-D7.10~~ — XP rétroactif sur changement de règles ✅ **Tranché (2026-04-25)** : **Rétroactif à l'avantage des joueurs**, application globale aux persos trackés, exception pour les fiches tabletop hors plateforme.

**Mécanique** :

1. **Application globale aux persos trackés** : quand une règle change, **tous les personnages** stockés sur la plateforme sont **automatiquement migrés** vers la nouvelle règle.

2. **Biais à l'avantage des joueurs** :
   - Si le changement est **favorable** (coût XP qui baisse, formule plus généreuse, atout renforcé) → **rétroactivité totale**, remboursement / réajustement automatique en faveur du joueur.
   - Si le changement est **défavorable** (coût qui monte, atout nerfé) → **pas de pénalisation rétroactive**. Les persos existants conservent leur situation actuelle (grandfathering automatique). La nouvelle règle s'applique uniquement aux **dépenses / actions futures**.

3. **Exception : fiches tabletop hors plateforme** :
   - Les **extractions tabletop** (fiches PDF imprimées, exports physiques utilisés sans tracking digital) ne sont pas concernées par la migration automatique — elles vivent leur vie hors plateforme.
   - À la **réimportation** d'une telle fiche sur la plateforme (via le workflow R-6.14 Import/Export) : application des **règles courantes** au moment de l'import, avec workflow de migration assistée (cohérent avec R-7.19).

4. **Audit et traçabilité** :
   - Chaque migration est loggée dans `experience_log` (R-7.12) avec mention « migration règle X v1→v2, ajustement +N XP en faveur du joueur ».
   - Le joueur reçoit une notification de la migration.

**Cohérence avec le méta-principe règles vivantes** : ce mode "favorable au joueur" évite de créer un système de version par perso (option (e) initiale écartée) tout en préservant le bénéfice du jeu pour les joueurs existants.

**Implication architecturale** :
- Le moteur stocke pour chaque règle une **version courante** + un **registre des changements**.
- Lors d'un changement, un job de migration recalcule l'impact sur tous les persos trackés et applique le delta favorable (ou laisse intact si défavorable).
- Les imports tabletop déclenchent une migration ponctuelle.

---

## Acceptance checklist

- [x] ~~Q-D7.1 : grandfathering aptitudes après transformation~~ → capping immédiat, points perdus
- [x] ~~Q-D7.2 : recalcul bases dérivées~~ → nouvelle base + delta acquis (formules R-7.17), vitalité courante % proportionnel
- [x] ~~Q-D7.3 : niveau après changement de catégorie~~ → recalcul strict par nouvelle catégorie + perte/rebuild des atouts de niveau
- [x] ~~Q-D7.4 : résurrection et XP~~ → résurrection annule la perte (option b)
- [x] ~~Q-D7.4-a : machine d'état mort/mourant~~ → R-7.20/21 (états VIVANT → KO → MOURANT → MORT RÉCENTE → MORT CONFIRMÉE → MORT DÉFINITIVE) avec table régressive de méthodes de résurrection
- [x] ~~Q-D7.5 : timing de dépense XP~~ → hybride par mode (sans expert), événements narratifs déclencheurs en temps réel
- [x] ~~Q-D7.6 : cap de niveau~~ → pas de cap mécanique, limites naturelles (mentors, temps, XP exponentiel)
- [x] 🟡 **Q-D7.7 : XP aux secondaires** → base retrouvée : compagnons/montures par XP cédé ; familiers séparés via D8 R-8.13
- [x] ~~Q-D7.8 : atouts de niveau rétroactifs~~ → totalement rétroactifs avec pénalisation naturelle (effets par passage de niveau ne se déclenchent que pour passages futurs)
- [x] ~~Q-D7.9 : LLM et distribution XP~~ → hybride (c) avec décomposition + temps effectif + pas d'XP par monstre
- [x] ~~Q-D7.10 : XP rétroactif sur changement de règles~~ → rétroactif à l'avantage des joueurs, exception tabletop hors plateforme

**D7 complet** ✅ (10/10 tranchées). Une fois validé → **D8 Magie** (11 écoles, sorts, énergie, TI, familiers).
