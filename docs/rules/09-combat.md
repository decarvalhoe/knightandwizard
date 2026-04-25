# D9 — Combat (DT, actions, initiative, dégâts, armures)

> Système de combat. Repose sur le rythme DT (Divisions de Temps, 1 DT = 0,2 s) acté en D8 R-8.20, le facteur de vitesse acté en D2, les types d'actions actés en D1 R-1.12, le modèle de modificateurs additif acté en D1 R-1.36/40, le malus d'affaiblissement acté en D2 R-2.17, la machine d'état mort/mourant actée en D7 R-7.20/21, les résistances multi-couches actées en D3 Q-D3.8.

**Sources** :
- [documents/regles/index.md:305-569](documents/regles/index.md) — section Combat complète (DT, actions, dégâts, armures, malus)
- [documents/armes/index.md](documents/armes/index.md) — table des armes (web canonique)
- [regles-papier/extracted/listes/armes.md](regles-papier/extracted/listes/armes.md) — table armes (paper)
- [regles-papier/extracted/listes/protections.md](regles-papier/extracted/listes/protections.md) — table protections (armures, boucliers)
- [regles-papier/extracted/infos/table-des-touches.md](regles-papier/extracted/infos/table-des-touches.md) — D100 zones touchées
- [site/includes/managers/user/FightAssistantMan.php](site/includes/managers/user/FightAssistantMan.php) — assistant combat existant (cyclic DT counter 1–50)
- [site/includes/class/Arena.php](site/includes/class/Arena.php) — entité d'arène de combat
- [site/includes/class/Weapon.php](site/includes/class/Weapon.php) — entité arme

---

## Partie A — Cadre temporel & flux d'action

### R-9.1 — DT comme rythme de combat (rappel D8 R-8.20)

**Énoncé legacy** ([regles:305-307](documents/regles/index.md)) :

> Lors d'un combat (ou d'une scène qui a besoin d'être très précise), le MJ peut s'aider des divisions de temps (DT). Chacune d'entre elles représentes 0.2 seconde.
> Pour les utiliser correctement, le MJ compte les DT (1, 2, 3,... il est conseillé de repartir à 0 une fois arrivé à 50, ce qui représente 10 secondes) et les joueurs lui font signe de s'arrêter lorsqu'ils effectuent des actions. Chaque action effectuée par un personnage prend le facteur de vitesse de celui-ci en DT avant d'être terminée.

**Implémentation legacy** : `FightAssistantMan::getNextTD` — compteur cyclique 1→50→1, chaque PNJ a un attribut `nextTurn` (le DT du prochain résolution d'action).

**Statut** : 🟢 acté (D8 R-8.20)

### R-9.2 — Facteur de vitesse comme délai d'action

**Énoncé legacy** ([regles:307](documents/regles/index.md)) :

> Chaque action effectuée par un personnage prend le facteur de vitesse de celui-ci en DT avant d'être terminée. Après quoi, le joueur jette éventuellement les dés pour savoir s'il a réussi l'action ou non.

**Exemple** : Salogel (FV = 7). À DT 1, il déclare « j'arme l'arc » → action résolue à DT 8 (1 + 7). Il déclare immédiatement « je tire » → résolution à DT 15 (8 + 7).

**Statut** : 🟢 claire

### R-9.3 — Recharge des armes balistiques comme action

**Énoncé legacy** ([regles:315](documents/regles/index.md)) :

> Attention de bien compter la charge des armes balistiques comme étant une action.

Donc : tirer à l'arbalète = 1) recharger (FV DT) + 2) viser (FV DT) + 3) tirer (FV DT). Trois actions distinctes, chacune coûtant FV DT.

**Statut** : 🟢 claire

### R-9.4 — Interruption d'action

**Énoncé legacy** ([regles:321](documents/regles/index.md)) :

> Il est important de savoir qu'à tout moment, une action peut être interrompue (souvent pour en recommencer une autre, mais parfois aussi pour attendre).

**Rappel D1 R-1.25** : les DT déjà écoulés sont perdus. Il n'existe pas de demi-action récupérable par défaut.

**Mécanique** :
- Interrompre pour recommencer : l'ancienne action est annulée, la nouvelle action démarre au DT courant.
- Interrompre pour attendre : l'action est annulée, le personnage reste disponible au DT courant.
- Sort interrompu : l'énergie déjà dépensée est perdue (rappel D8).

**Statut** : 🟢 acté (D1 R-1.25)

---

## Partie B — Résolution du toucher (rappels)

### R-9.5 — Jet pour toucher = jet d'action standard (rappel D1 R-1.2)

Aptitude (souvent Dextérité ou Force) + Compétence (arme spécifique) + Σ Spécialisations, contre la difficulté convenue de l'arme (cf. Table des armes, colonne Difficulté).

**Statut** : 🟢 acté (D1)

### R-9.6 — Esquive = contre-action improvisée (rappel D1 R-1.12)

> Réflexes + Gymnastique + Esquive contre la difficulté du toucher (souvent 7 - 1 compétence + 1 improvisée = 7).

**Statut** : 🟢 acté (D1)

---

## Partie C — Bouclier

### R-9.7 — Bouclier actif

**Énoncé legacy** ([regles:466-468](documents/regles/index.md)) :

> Vous pouvez décidez de vous protéger d'un coup volontairement en faisant un jet de bouclier (Dextérité + Bouclier + ...) comme nous l'avons vu avant.

C'est une contre-action défensive :

```text
Dextérité + Bouclier + spécialisations pertinentes
```

La réussite du jet actif réduit ou annule les réussites de l'attaque, selon le modèle général des contre-actions (D1 R-1.23). Si l'attaque est complètement neutralisée, le coup ne produit pas de dégâts.

**Statut** : 🟢 acté (Q-D9.3)

### R-9.8 — Bouclier passif (jet de chance)

**Énoncé legacy** ([regles:469-473](documents/regles/index.md)) :

> Ou alors vous pouvez vous en balancer comme de la dernière pluie, et espérer que les coups de vos adversaires tombent sur votre bouclier par hasard. Tout le monde m'accordera que ce "hasard" est proportionnel à la grandeur du bouclier. Or, chaque boulier possède un pourcentage de chance de vous protéger qui augmente avec la taille de celui-ci. Le pourcentage des boucliers est répertorié dans la "Table des Protections". Pour vérifier si un coup atterrit dans un bouclier, lancer donc un D100, si vous faite le facteur de votre bouclier ou moins, le coup est dévié.

Mécanique : D100 ≤ % bouclier → coup dévié (totalement ?).

**Décision Q-D9.3 (2026-04-25)** : le bouclier passif est une chance de déviation totale après toucher confirmé.

**Mécanique** :
1. L'attaque touche.
2. Si le défenseur porte un bouclier utilisable passivement, on lance `D100`.
3. Si `D100 <= % d'arrêt` du bouclier, le coup est dévié et les dégâts sont annulés.
4. Sinon, la résolution des dégâts se poursuit normalement.

Les valeurs `P/E/C/T` du bouclier ne s'appliquent pas à cette déviation passive standard. Elles servent si un coup est explicitement porté contre le bouclier, si une règle spéciale vise le bouclier, ou si un mode arbitre choisit de modéliser l'objet comme protection matérielle.

**Statut** : 🟢 acté

---

## Partie D — Résolution des dégâts (rappels et nouveautés)

### R-9.9 — Jet de dégâts = Force seule (mêlée) ou arme seule (distance)

**Énoncé legacy** ([regles:484-495](documents/regles/index.md)) :

> Pour se faire, le personnage ayant touché fait un jet de force (il n'existe pas vraiment de compétence pour appuyer ses coups), donc les seul dés qui seront lancé seront ceux de la force. La difficulté sera toujours de 7 moins le nombre de réussites obtenues au toucher, mais n'oubliez pas qu'un 1 est toujours un échec. (...) Le nombre de dégâts infligé sera égal au nombre de réussites faites sur le jet de force additionné aux dégâts de l'arme utilisé. (...) Bien évidement, la force n'agit pas sur des armes telles que l'arc, l'arbalète,...

**Mécanique** :
- Mêlée : `dégâts = réussites_force + dégâts_arme` (où dégâts_arme = "F + N" dans la table)
- Distance : `dégâts = dégâts_arme` seul (ex. arc long P: 4+flèche = 4 + bonus de la flèche)

**Statut** : 🟢 claire

### R-9.10 — Difficulté du jet de force = 7 − réussites au toucher

**Énoncé legacy** ([regles:488](documents/regles/index.md)) :

> La difficulté sera toujours de 7 moins le nombre de réussites obtenues au toucher, mais n'oubliez pas qu'un 1 est toujours un échec.

Donc plus on touche bien, plus on inflige facilement.

**Statut** : 🟢 claire

### R-9.11 — Quatre types de dégâts (TD) : P/E/C/T

**Énoncé legacy** ([regles:496-507](documents/regles/index.md)) :

> Perforant (P), Énergétique (E), Contendant (C), Tranchant (T). Certaines armes peuvent faire des dégâts dans plusieurs domaines (ex. torche : C: F+2, E: 1).

**Décision Q-D9.7 (2026-04-25)** : le type d'attaque effectué définit le type de dégât.

**Armes à type au choix** :
Si la table indique plusieurs types possibles (`T/P`, `C/P`, `T/C`, ou mention "à choix"), l'attaquant choisit le mode d'utilisation de l'arme pour ce coup. Ce choix détermine le type de dégât principal.

Exemples :
- Godendac `C/P` : coup contendant ou perforant.
- Hallebarde `T/P` : coup tranchant ou perforant.
- Pelle `T/C` : coup tranchant ou contendant.

**Dégâts additionnels** :
Si la table indique un bonus additionnel (`+1 C`, `+2 P`, `+1 E`, etc.), ce bonus est une ligne de dégât additionnelle séparée, résolue contre sa propre protection P/E/C/T.

Exemples :
- Torche `C F+1 +1 E` : dégâts contendants principaux + 1 dégât énergétique.
- Fléau d'arme à pointes `C F+5 +2 P` : dégâts contendants principaux + 2 dégâts perforants.

**Décision Q-D9.8 (2026-04-25)** : une attaque produit une blessure unique avec composantes typées.

Pour les armes avec dégâts additionnels, chaque composante typée est d'abord résolue contre les protections et résistances pertinentes de son type. Les dégâts restants sont ensuite additionnés en une seule blessure finale.

Sauf règle spéciale, il n'y a qu'un seul modificateur de zone et un seul jet d'endurance pour l'attaque entière. Le moteur conserve toutefois le détail des composantes typées pour les effets spéciaux, résistances, immunités, logs de combat et règles vivantes.

**Statut** : 🟢 acté

### R-9.12 — Ordre fixe d'application des modificateurs de dégâts

**Énoncé legacy** ([regles:509-513](documents/regles/index.md)) :

> Il est conseillé, pour la modification des dégâts, de procéder toujours dans cet ordre :
> 1. Modificateur de circonstance
> 2. Armures
> 3. Modificateur de zone de touche
> 4. Endurance

**Correction auteur Q-D9.11 (2026-04-25)** : le modificateur de zone s'applique après toutes les déductions autorisées. L'ordre canonique corrige donc l'ordre apparent du texte legacy.

**Décision Q-D9.9 (2026-04-25)** : les résistances sont traitées selon leur nature.

**Résistances en pourcentage** :
Les résistances exprimées en `%` (`feu`, `froid`, `poison`, `magie`, etc.) utilisent la mécanique D100 (D1 R-1.32 / D3 Q-D3.8). Elles sont testées avant la résolution des dégâts ou de l'effet concerné. Si le test réussit, la composante ou l'effet auquel la résistance s'oppose est ignoré.

**Protections P/E/C/T naturelles** :
Les résistances formulées comme `+1C`, `+1E`, etc. ne sont pas des résistances D100. Elles sont traitées comme protections P/E/C/T naturelles dans la couche `natural`, et s'appliquent avec les armures.

**Ordre consolidé pour une composante de dégâts** :
1. Bouclier passif/actif si applicable.
2. Résistance D100 pertinente si la composante ou l'effet en déclenche une.
3. Modificateurs de circonstance.
4. Protections P/E/C/T par couche, incluant armures naturelles.
5. Endurance, si la zone et l'effet l'autorisent.
6. Modificateur de zone de touche (ex. tête/gorge/yeux ×2).

**Statut** : 🟢 acté

### R-9.13 — Modificateurs de circonstance (charge, chute)

**Énoncé legacy** ([regles:516-522](documents/regles/index.md)) :

> Charge (humanoïde) → +1 / Chute (humanoïde) → +2 / Charge (cheval) → +3. Cumulables (double charge possible).

**Statut** : 🟢 claire (table extensible — règle vivante)

### R-9.14 — Armures : protection P/E/C/T par pièce

**Énoncé legacy** ([regles:523-530](documents/regles/index.md)) :

> Vous pouvez ensuite diminuer les dégâts reçus grâce à toutes sortes de protections. (...) chacune possède un poids ainsi qu'une protection contre les dégâts perforants (P), énergétiques (E), contendants (C) et tranchants (T).

**Mécanique** : La pièce d'armure couvrant la zone touchée applique sa protection P/E/C/T contre le type de dégât.

**Décision Q-D9.4 (2026-04-25)** : modèle hybride par couches limitées.

Chaque protection appartient à une couche d'équipement. Une zone corporelle ne peut bénéficier que d'une seule protection par couche.

**Couches minimales** :
- `natural` : écailles, peau renforcée, ostéoderme, armure naturelle.
- `soft` : tissu, cuir souple, rembourrage.
- `mail` : maille, cotte de mailles, camail.
- `plate` : plaques, casque, cuirasse, grèves, spalières, pièces métalliques rigides.
- `magic` : protection magique, divine, sort, effet surnaturel.

**Interdiction d'équipement** : un personnage ne peut pas porter plus d'une armure de la même couche sur la même zone. Ce n'est pas seulement une règle de calcul ; c'est une contrainte RP et d'équipement. Exemple : deux cottes de mailles superposées ou deux cuirasses portées ensemble ne sont pas autorisées par défaut.

**Cumul autorisé** : les couches différentes peuvent se cumuler si l'équipement est physiquement et narrativement cohérent. Exemple : protection naturelle + cuir/vêtement + maille + plaque + magie.

**Règle de résolution** :
1. Identifier la zone touchée.
2. Lister les protections équipées qui couvrent cette zone.
3. Vérifier qu'il n'y a pas plus d'une protection par couche.
4. Additionner les valeurs P/E/C/T des couches valides pour le type de dégât concerné.
5. Soustraire cette protection totale avant les modificateurs de zone.

**Décision Q-D9.5 (2026-04-25)** : mapping hybride des zones couvertes.

Chaque type de pièce possède un mapping standard vers les zones corporelles couvertes. Chaque item peut toutefois surcharger ce mapping pour gérer les exceptions, les pièces spéciales, les artefacts, les armures raciales ou les créations custom.

**Exemples de principe** :
- `heaume/casque/bonnet` → tête.
- `gorgerin` → gorge / nuque.
- `gant` → main.
- `brassard/canon d'avant-bras` → avant-bras.
- `spalière` → épaule.
- `cuirasse/haubert/veste` → thorax / dos, selon le détail de l'item.
- `pantalon/cuissot` → haut de jambe.
- `grève` → bas de jambe.
- `botte/soleret` → pied.

Le mapping standard sert à automatiser la résolution. La surcharge par item permet au catalogue vivant de rester extensible.

**Statut** : 🟢 acté

### R-9.15 — Modificateurs de zone de touche

**Énoncé legacy** ([regles:531-539](documents/regles/index.md)) :

| Zone | Modificateur |
|---|---|
| Tête | Dégâts × 2 |
| Gorge | Dégâts × 2, pas d'endurance possible |
| Yeux | Dégâts × 2, pas d'endurance possible |
| Parties génitales (m) | Pas d'endurance possible |

Le modificateur de zone s'applique après toutes les déductions autorisées. Pour la tête, on applique donc les protections puis l'endurance, et on double ensuite les dégâts restants. Pour la gorge et les yeux, l'endurance est interdite : on applique les autres déductions autorisées, puis le doublement.

**Statut** : 🟢 claire (table extensible)

### R-9.16 — Endurance en dernier rempart

**Énoncé legacy** ([regles:540-545](documents/regles/index.md)) :

> Lorsqu'un personnage subit des dégâts, celui-ci peut en règle générale les endurer. Pour ce faire, il effectue un simple jet d'endurance. (...) Chaque réussite diminue le nombre de dégât de 1 (celui-ci ne peut évidement pas aller en négatif). La difficulté sera normalement toujours de 7.

**Mécanique** : Jet d'aptitude brute (D8 R-8.19) sur Endurance, difficulté 7. Chaque réussite − 1 dégât.

**Statut** : 🟢 claire

---

## Partie E — Réactions aux dégâts (rappels)

### R-9.17 — Évanouissement / mort en un coup (rappel D2/D7)

> - Plus de la moitié de la vitalité restante en un coup → Évanouissement
> - Plus du quart de la vitalité maximum dans la tête en un coup → Évanouissement
> - Plus de la moitié de la vitalité de base dans la tête/gorge en un coup → Mort

**Décision Q-D9.11 (2026-04-25)** : les seuils se calculent sur les dégâts finaux réellement subis.

Les dégâts finaux sont ceux qui restent après la chaîne applicable :

```text
résistances/protections -> armures -> endurance si autorisée -> modificateur de zone
```

Précisions :
- Tête : endurance possible, puis dégâts restants doublés.
- Gorge : endurance impossible, puis dégâts restants doublés.
- Yeux : endurance impossible, puis dégâts restants doublés.
- Parties génitales masculines : endurance impossible.

Ces seuils ne se déclenchent que sur un seul coup, ou plusieurs coups subis exactement au même moment.

**Décision Q-D9.12 (2026-04-25)** : regroupement hybride des coups simultanés.

Pour l'évanouissement général (`> 1/2 vitalité restante`), on additionne tous les dégâts finaux subis exactement au même moment, quelle que soit la zone.

Pour les seuils localisés tête/gorge, on additionne seulement les dégâts finaux simultanés qui touchent la zone concernée.

**Décision Q-D9.13 (2026-04-25)** : atout « Jusqu'à la mort » = exception mort-vivant.

Un personnage possédant l'atout « Jusqu'à la mort » ne meurt qu'à `vitality <= 0`. Il ignore donc :
- la mort par seuil tête/gorge ;
- l'évanouissement biologique par choc massif ;
- les réactions de perte de conscience qui supposent un corps vivant vulnérable au choc.

Il reste toutefois neutralisable par limitations mécaniques du corps :
- chute si la Force effective ne permet plus de porter son équipement ou de se tenir debout ;
- immobilisation si une zone/membre devient inutilisable ;
- incapacité d'agir si l'état matériel du corps ne permet plus l'action ;
- destruction/mort lorsque la vitalité atteint 0.

Le moteur doit donc distinguer `dead`, `unconscious`, `prone`, `immobilized`, `disabled`, et `destroyed/dead_at_0` selon les exceptions du personnage.

**Statut** : 🟢 acté (D2 R-2.X, D7 R-7.20)

### R-9.18 — Malus d'affaiblissement (rappel D2 R-2.17)

**Statut** : 🟢 acté (D2)

### R-9.18-bis — Dégâts subis retardent l'action

**Confirmation code legacy** : `FightAssistantMan::modifyNpc` ajoute `abs($modification)` au `nextTurn` du PNJ lorsqu'une perte de vitalité est appliquée.

**Décision Q-D9.10 (2026-04-25)** : règle canonique.

Chaque point de dégât final effectivement subi retarde l'action en cours ou la prochaine action du personnage de `+1 DT`.

```text
nextActionAt = nextActionAt + finalDamageTaken
```

Ce retard s'applique après toute la chaîne de réduction : résistances, circonstances, armures/protections, zone, endurance. Les dégâts réduits à 0 ne retardent pas l'action.

**Statut** : 🟢 acté

---

## Partie F — Tables (catalogues vivants)

### R-9.19 — Catalogue d'armes (table vivante)

Source paper : [armes.md](regles-papier/extracted/listes/armes.md), source web : [documents/armes/index.md](documents/armes/index.md). Champs : nom, TD (P/E/C/T), formule de dégât (F+N ou N seul), difficulté, spécial (effets additionnels), poids.

**Méta-principe** (règles vivantes) : éditable par admin/MJ, versionné, migration des armes existantes.

**Statut** : 🟡 à concevoir le schéma de stockage et les opérations admin (cf. méta-principe)

### R-9.20 — Catalogue de protections (table vivante)

Source paper : [protections.md](regles-papier/extracted/listes/protections.md). Champs : nom, P/E/C/T, poids (avec multiplicateurs raciaux : Gnome 50%, Gobelin 40%, Hobbit 60%, Homme-rat 90%, Khogr 110%, Nain 80%, Ogre 300%, Troll 350%).

**Statut** : 🟡 à concevoir comme R-9.19

### R-9.21 — Table des touches (D100, table vivante)

Source paper : [table-des-touches.md](regles-papier/extracted/infos/table-des-touches.md). Mappage 1-100 → zone corporelle (main G, main D, avant-bras, ..., tête).

> Il existe plusieurs tableaux de touches (le tableau de touche général, de touche au corps à corps, ...)

**Décision Q-D9.6 (2026-04-25)** : zone aléatoire par défaut, ciblage possible comme action précise.

**Mécanique par défaut** :
1. L'attaque touche.
2. Si aucune zone n'a été ciblée explicitement, le moteur lance `D100`.
3. Le résultat est résolu via la table des touches active.

**Ciblage volontaire** :
1. Le joueur annonce la zone avant le jet d'attaque.
2. L'action devient une action précise : la difficulté est augmentée par le MJ / arbitre selon la zone, la taille de la cible et les circonstances.
3. Si l'attaque réussit suffisamment, la zone annoncée est touchée.
4. Si l'action précise annoncée échoue, le coup est raté totalement. Il n'y a pas de redirection automatique vers une zone D100.

**Décision Q-D9.14 (2026-04-25)** : choix D — hybride règle vivante par mode arbitre.

Le système maintient un **catalogue versionné de tables de touches** éditable par admin/MJ (cf. méta-principe règles vivantes). Chaque table est identifiée par son scope (général, mêlée, distance, sort, créature spécifique, etc.) et son anatomie cible.

**Sélection de la table active selon le mode arbitre** :
- **MJ humain (papier ou digital)** : libre choix de la table parmi le catalogue, surcharge ad-hoc autorisée.
- **MJ LLM** : recommandation contextuelle automatique en fonction du type d'attaque + anatomie de la cible, validable/modifiable par l'arbitre.
- **MJ auto** : résolution déterministe par règles :
  - Attaque de mêlée + cible humanoïde → table mêlée humanoïde.
  - Attaque à distance + cible humanoïde → table distance humanoïde.
  - Cible non-humanoïde → table propre à la créature (déclarée dans le bestiaire).
  - À défaut de table spécialisée disponible → fallback sur la table générale.

**Surcharge par item/sort/effet** : une arme, un sort ou un effet peut imposer une table spécifique au moment où il s'applique. Exemples :
- Sort « Frappe vitale » → table de zones critiques.
- Flèche de localisation → table à zones réduites (tête, gorge, cœur uniquement).
- Coup de boucle (lutte) → table membres seulement.

La surcharge prime sur la sélection contextuelle.

**Statut** : 🟢 acté

---

## Partie G — Architecture digitale du combat

### R-9.22 — Flux de combat digital = timeline dynamique, pas initiative fixe

**Décision Q-D9.1 (2026-04-25)** : option C — hybride.

Le combat digital conserve le principe legacy du flux DT pur : il n'y a pas de jet d'initiative classique au début du combat. Chaque action possède une échéance de résolution calculée à partir du DT de déclaration :

```text
nextActionAt = declaredAtDT + speedFactor + modificateurs
```

Le moteur digital peut toutefois présenter ce flux sous forme de **file d'actions triée par `nextActionAt`**. Cette file ressemble visuellement à une initiative dynamique, mais elle ne crée pas un ordre de tour fixe.

**Transposition par mode** :
- Papier / MJ humain : le MJ compte les DT et les joueurs signalent leurs actions, comme en legacy.
- Digital / MJ humain : interface timeline, MJ libre de déplacer/annuler/arbitrer les actions.
- MJ LLM : timeline proposée par le moteur, arbitrage par le LLM dans les cas ambigus.
- MJ auto : timeline stricte, résolution déterministe selon les règles et les tie-breakers.

**Statut** : 🟢 acté

### R-9.23 — Égalités de DT dans la timeline

Si plusieurs actions doivent être résolues au même DT :

1. Les actions réellement simultanées sont résolues simultanément lorsque c'est possible.
2. En cas de conflit d'ordre, on départage par Réflexes.
3. Une action préparée/conservée peut primer si elle répond explicitement à la situation.
4. Si l'ambiguïté reste narrative, l'arbitre tranche selon le mode : MJ humain, LLM ou auto.

**Statut** : 🟢 acté

### R-9.24 — Portée des armes à distance (modèle hybride catégorie + numérique)

**Décision Q-D9.15 (2026-04-25)** : choix D — hybride règle vivante par mode arbitre.

Le legacy ne définit aucune portée explicite pour les armes à distance (arc court, arc long, arbalètes, fronde, boomerang, couteau de lancer, chakram, étoile ninja, harpon). La règle suivante comble ce trou en respectant le pattern hybride récurrent.

**Schéma de stockage par arme à distance** :
```yaml
weapon:
  range:
    nominal: <int en mètres>     # portée optimale, +0 difficulté
    categories:
      short:    [0, X]            # +0 difficulté
      medium:   [X, Y]            # +1 difficulté
      long:     [Y, Z]            # +2 difficulté
      extreme:  [Z, W]            # +4 difficulté
      impossible: [W, ∞]          # tir impossible
```

**Sélection des modificateurs selon le mode arbitre** :
- **MJ humain** : libre, peut s'appuyer sur les catégories ou les ignorer.
- **MJ LLM** : applique automatiquement le modificateur de la catégorie courante, ajuste contextuellement (taille cible, mouvement, météo, couvert) avec D1 R-1.36.
- **MJ auto** : strict — modificateur de catégorie + cumul des modificateurs de circonstance D1 R-1.36 sans interprétation.

**Cumul** : la portée est un modificateur additionnel, cumulable avec les autres modificateurs (D1 R-1.36 à R-1.40 : vent, obscurité, mouvement de la cible, taille de la cible, couvert partiel, encombrement du tireur, etc.).

**Catalogue vivant** : les valeurs par défaut des armes sont éditables par admin/MJ. Migration des armes existantes en cas de changement de barème. Les paliers `short/medium/long/extreme` peuvent être renommés ou redéfinis (ex. moteur en pieds plutôt qu'en mètres, ou granularité différente).

**Statut** : 🟢 acté

### R-9.25 — Munitions (stock, qualité, récupération)

**Décision Q-D9.16 (2026-04-25)** : choix D — hybride règle vivante par mode arbitre.

Le legacy mentionne explicitement « flèche », « carreau », « bille » comme composantes additionnées aux dégâts d'arme (cf. table : Arc court P 3+flèche, Arbalète à étrier P 5+carreau, Fronde C F+bille). Aucune mécanique de stock n'est codifiée. La règle suivante comble ce trou.

**Schéma de stockage par munition** :
```yaml
ammunition:
  id: <slug>
  family: arrow | bolt | bullet | thrown_blade | other
  bonus_damage: <int>            # ex. flèche standard +0, flèche perforante +1
  bonus_difficulty: <int>        # +0 par défaut, +1 si munition difficile à manier
  damage_types: [P, E, ...]      # ex. flèche enflammée [P, E]
  effects: [poison_X, fire_Y, ...]
  weight_per_unit: <float>       # ex. 0.05 kg / flèche
  recovery_chance: <0..1>        # probabilité par défaut de récupérer la munition après tir
```

**Stock par personnage** :
- Le personnage porte des munitions dans des contenants (carquois, sacoche, ceinture). Le poids des munitions compte dans la charge globale (D2, 5 kg / point de Force avant pénalité).
- Compteur numérique par type de munition possédé.
- Les munitions consommées sont décomptées à chaque tir.

**Récupération après combat** :
- Chaque munition tirée a une chance de récupération (`recovery_chance`).
- Modificateur contextuel par l'arbitre selon le terrain (boue, herbes hautes, eau, neige, foule), le type de cible (créature qui s'enfuit avec la flèche dans le corps, mur en pierre, monstre disloqué) et l'effet (flèche enflammée → souvent perdue).

**Application par mode arbitre** :
- **MJ humain** : peut abstraire totalement le stock (« tu as des flèches ») ou le suivre précisément.
- **MJ LLM** : rappelle le stock courant, applique les qualités (modificateurs, effets), propose la récupération en fin de combat.
- **MJ auto** : strict — décrément automatique, refus de tir si stock = 0, calcul déterministe de récupération.

**Catalogue vivant** : éditable par admin/MJ. Ajout de qualités custom (ex. flèche elfique +1 dégât +1 portée, flèche bénite contre morts-vivants, carreau d'argent contre lycanthropes). Migration des persos en cas d'évolution du catalogue (les munitions retirées sont converties en standard ou notifiées à l'utilisateur).

**Statut** : 🟢 acté

### R-9.26 — Durabilité des armes et armures (mode paramétrable par campagne)

**Décision Q-D9.17 (2026-04-25)** : choix D — hybride règle vivante paramétrable par campagne.

Le legacy ne traite pas de la durabilité. Pour préserver la souplesse, le système expose un **mode de durabilité** par campagne, choisi à la création de la campagne et modifiable par admin/MJ.

**Trois modes** :

1. **Arcade** (durabilité ignorée) — aucune arme/armure ne se casse jamais. Convient aux campagnes axées narration, parties one-shot, sessions débutants.

2. **Standard** (casse sur échec critique uniquement) — seule une fumble (D1 R-1.34, échec critique avec D100 sur table d'incidents) peut briser une arme ou endommager une armure. La table d'échec critique inclut des résultats `arme brisée`, `armure entaillée`, `lacet de protection rompu`. Aucun tracking continu. Conforme au legacy minimaliste.

3. **Réaliste** (pool de points de durabilité) — chaque arme/armure possède un pool `durability` :
   ```yaml
   item:
     durability:
       max: <int>
       current: <int>
       degradation_on_use: <int>      # par coup porté ou encaissé
       degradation_on_critical: <int> # bonus si fumble
       breaking_threshold: 0          # à 0 → cassée/inutilisable
   ```
   Une arme à 0 PD est inutilisable jusqu'à réparation. Une armure à 0 PD perd tout ou partie de ses protections P/E/C/T. La compétence Forge/Artisanat permet la réparation (jet d'apprentissage / temps).

**Application par mode arbitre** :
- **MJ humain** : libre, peut surcharger ponctuellement le mode de campagne.
- **MJ LLM** : applique le mode de campagne, propose des fumbles narratifs cohérents.
- **MJ auto** : strict — applique le mode de campagne sans interprétation.

**Migration** : changement de mode de campagne possible. Passage `arcade → standard` neutre. Passage `standard → réaliste` nécessite l'initialisation des PD (valeurs par défaut basées sur le matériau de l'item, ou full-PD pour les items existants). Passage inverse n'efface pas les données, juste désactive l'usage.

**Catalogue vivant** : valeurs `durability` éditables par item, par matériau, par qualité (ex. acier elfique × 2 PD, bois pourri × 0.5 PD).

**Statut** : 🟢 acté

### R-9.27 — États tactiques en combat (catalogue vivant d'états)

**Décision Q-D9.18 (2026-04-25)** : choix D — hybride règle vivante par mode arbitre.

Le legacy ne mentionne explicitement que les états `mort`, `inconscient` (D7 R-7.20), `à terre` (regles:567 quand la Force est insuffisante pour porter l'équipement) et `affaibli` (D2 R-2.17). Tout système digital exige un catalogue plus large.

**Schéma de stockage par état** :
```yaml
status:
  id: <slug>                    # ex. prone, grappled, blinded, stunned
  name: <string localisé>
  category: physical | mental | magical | sensory | environmental
  duration_dt: <int | null>     # null = jusqu'à dissipation explicite
  stackable: bool               # plusieurs instances possibles ?
  modifiers:
    - target: difficulty | dice_count | speed_factor | damage_in | damage_out
      scope: action_type | aptitude | competence | all
      value: <int>
  immunities: [status_id, ...]
  removed_by: [status_id, action_type, healing_type, ...]
  interactions:
    blocks: [action_type, ...]    # interdit certaines actions
    forces: [action_type, ...]    # force certaines actions (ex. fuite si effrayé)
```

**Catalogue de base recommandé** (catégories non exhaustives, éditables) :
- **Physiques** : `prone` (à terre), `grappled` (agrippé), `restrained` (entravé), `unconscious` (inconscient), `dying` (mourant), `dead` (mort), `disarmed` (désarmé), `disabled_limb` (membre inutilisable), `encumbered` (encombré), `stunned` (étourdi), `winded` (essoufflé).
- **Mentaux** : `frightened` (effrayé), `enraged` (enragé), `charmed` (charmé), `confused` (confus), `dominated` (dominé), `surprised` (surpris).
- **Sensoriels** : `blinded` (aveuglé), `deafened` (sourd), `silenced` (réduit au silence), `petrified` (pétrifié).
- **Environnementaux** : `poisoned` (empoisonné), `burning` (en feu), `frozen` (gelé), `electrified` (électrocuté), `bleeding` (saignant), `drowning` (en noyade).
- **Magiques** : `invisible` (invisible), `incorporeal` (incorporel), `levitating` (lévitant), `silenced_magic` (anti-magie), `blessed` (béni), `cursed` (maudit).

**Application par mode arbitre** :
- **MJ humain** : libre, applique les états narrativement, peut ignorer la table.
- **MJ LLM** : suggère contextuellement les états applicables, applique automatiquement les modificateurs en mode standard.
- **MJ auto** : strict — applique mécaniquement chaque état, vérifie les immunités/interactions, décrémente les durées par DT.

**Interactions importantes** :
- `prone` augmente la difficulté des attaques de mêlée pour soi (+1) et diminue celle des attaquants en mêlée (-1).
- `grappled` empêche le déplacement et augmente la difficulté de presque toutes les actions.
- `blinded` rend toute attaque ciblée improvisée + difficulté augmentée selon la cible.
- `unconscious` rend toute action impossible et toute attaque réussie automatiquement (jet à difficulté 0 ou auto-succès selon mode).

**Migration** : ajout/retrait d'un état dans le catalogue → migration des persos affectés (les états retirés sont convertis en effet narratif ou supprimés). Versionnement obligatoire.

**Catalogue vivant** : éditable par admin/MJ. Compatibilité descendante via versioning.

**Statut** : 🟢 acté

### R-9.28 — Spawn de PNJ en cours de combat (renforts, vagues, invocations)

**Décision Q-D9.19 (2026-04-25)** : choix D — hybride 3 sources + règle vivante par mode arbitre.

**Trois voies de spawn** :

#### 1. MJ humain manuel (live add)
- Interface temps réel inspirée de `FightAssistantMan::addNpc`.
- Le MJ choisit un PNJ depuis le bestiaire ou en génère un à la volée (cf. D6 Q-D6.4 templates par niveau).
- Insertion dans la timeline au DT courant + facteur de surprise (par défaut, le PNJ entre avec `nextActionAt = currentDT + speedFactor` ou plus, selon la narration).
- Conforme au comportement legacy.

#### 2. Déclencheurs scriptés (waves)
- La rencontre (encounter) prédéfinit des vagues avec triggers :
  ```yaml
  encounter:
    waves:
      - id: wave_2
        trigger:
          type: dt_threshold | vitality_threshold | event | flag
          value: <selon type>
        spawn:
          template: <id template du bestiaire>
          count: <int | range>
          position: <zone narrative>
        delay_dt: <int>     # délai avant que les nouveaux PNJ soient actifs
  ```
- Triggers types :
  - `dt_threshold` : « au DT 50 du combat »
  - `vitality_threshold` : « quand le boss tombe à 50% vitalité »
  - `event` : « si l'alarme est sonnée »
  - `flag` : « si le drapeau X est posé par une action »
- Permet MJ auto-pilote complet.

#### 3. Invocations magiques (école Invocation D8)
- Sort d'invocation lancé par un magicien.
- Consomme `energy` selon le sort (cf. D8 grimoire).
- Crée une entité avec stats du bestiaire, contrôlée par le lanceur.
- Durée en DT (selon le sort, souvent quelques minutes ou jusqu'à dispel).
- Apparaît dans la timeline au DT de fin du sort + son propre `speedFactor`.
- Comptabilisée dans la limite globale de la scène.

**Limite globale par scène** :
- Paramètre de campagne : `max_simultaneous_entities_per_combat` (par défaut 20, ajustable par MJ).
- Si la limite est atteinte, le moteur refuse les nouveaux spawns automatiques (waves) et notifie le MJ humain s'il tente une addition manuelle. Les invocations en cours ne sont pas annulées mais peuvent bloquer un nouveau sort d'invocation.
- Évite les ralentissements et les situations ingérables.

**Application par mode arbitre** :
- **MJ humain** : libre, peut désactiver les déclencheurs scriptés ou les surcharger.
- **MJ LLM** : applique les déclencheurs, propose des renforts narratifs cohérents quand pertinent.
- **MJ auto** : strict — applique les déclencheurs scriptés sans interpréter, refuse au-delà de la limite globale.

**Catalogue vivant** : templates de spawn éditables (vagues prédéfinies, escouades types, créatures aléatoires). Migration des rencontres existantes en cas d'évolution.

**Statut** : 🟢 acté

### R-9.29 — Transformation de race en cours de combat (action conservée 50 DT)

**Décision Q-D9.20 (2026-04-25)** : choix A — action unique de 50 DT, vulnérable et inactif.

Réfère D3 Q-D3.7 (durée canonique 50 DT ≈ 10 s) et D7 R-7.16/17/18 (math du changement de race). Cette règle traite uniquement de la **fenêtre temporelle** et du **flux d'action** pendant la transformation.

**Mécanique** :

1. **Type d'action** : action conservée (D1 R-1.12). Le perso déclare la transformation au DT `T`. Elle se résout au DT `T + 50` par défaut (cf. D3 Q-D3.7).

2. **Verrouillage des actions** : pendant les 50 DT, le perso ne peut entreprendre **aucune autre action**. Aucune attaque, aucun déplacement, aucune incantation, aucun jet d'esquive ou de parade actif.

3. **Vulnérabilité totale** : toute attaque portée pendant la fenêtre est :
   - Résolue à difficulté standard (pas de bonus défensif).
   - Pas de jet d'esquive, pas de jet de bouclier actif possible.
   - Le bouclier passif (R-9.8) reste applicable car il ne nécessite pas d'action volontaire.
   - Les protections passives (armure, résistances naturelles, atouts permanents) restent applicables.

4. **Action conservée → règle des dégâts** (D1 R-1.12) : chaque point de dégât subi pendant la transformation augmente la difficulté du jet de transformation finale. Si le jet final échoue (pas de réussite), la transformation est interrompue ; le perso reste dans sa forme d'origine et a perdu les 50 DT.

5. **Interruption forcée** :
   - **KO** : transformation annulée, perso reste dans la forme d'origine en état KO.
   - **Mort** : transformation annulée. Si la forme cible aurait évité la mort (ex. forme brume immune aux dégâts physiques), c'est sans effet — le déclenchement n'a pas abouti.
   - **Dispel / anti-magie** : annule la transformation en cours.
   - **Sort d'altération forcée** : peut surcharger ou empêcher la transformation selon les règles du sort.

6. **Équipement** :
   - Si la nouvelle forme a une morphologie incompatible (ex. humain → loup), l'équipement métallique rigide non adapté tombe au sol au moment de la complétion (DT `T + 50`).
   - Vêtements et cuir souples se déchirent (modèle de durabilité R-9.26 applicable si activé).
   - Équipement magique adaptatif (objets enchantés « fits any form ») peut survivre, selon la règle de l'item.
   - À la transformation inverse (retour à la forme d'origine), le perso est nu si l'équipement n'a pas été récupéré entre-temps.

7. **Sorts et effets en cours** :
   - Buffs/debuffs sur le personnage : conservés à travers la transformation tant que leur durée n'est pas expirée (cf. D7 R-7.17).
   - Sort que le perso lançait au moment de déclarer la transformation : interrompu, énergie perdue (D8 sur sorts interrompus).

8. **Sortie de transformation** : la fin volontaire de transformation suit la même règle (50 DT vulnérable et inactif), sauf surcharge par l'atout / la nature de la transformation.

**Application par mode arbitre** :
- **MJ humain** : peut surcharger ponctuellement (ex. autoriser une demi-action en milieu de transformation pour la narration).
- **MJ LLM** : applique strict 50 DT vulnérable, propose des descriptions narratives.
- **MJ auto** : strict — aucun écart possible.

**Surcharge par atout / forme** : un atout ou une forme spécifique peut redéfinir la durée (ex. transformation magique instantanée à coût élevé en énergie, transformation rituelle longue de plusieurs minutes). La règle par défaut reste 50 DT en l'absence de surcharge explicite.

**Statut** : 🟢 acté

### R-9.30 — Catalogues d'armes, protections et items : méta-modèle type-classes dynamiques

**Décision Q-D9.21 (2026-04-25)** : choix D — type-classes dynamiques.

Cette règle clôture les statuts 🟡 de R-9.19 (catalogue d'armes), R-9.20 (catalogue de protections), R-9.21 (table des touches), R-9.25 (catalogue de munitions) et R-9.27 (catalogue d'états tactiques).

**Méta-modèle** :

```yaml
# Définition d'un type d'item (item-type, défini par admin)
item_type:
  id: <slug>                   # ex. weapon_melee, weapon_ranged, armor, shield, ammunition, status, hit_table
  name: <string localisé>
  fields:
    - name: <slug>
      type: int | float | string | bool | enum | list | ref | json
      required: bool
      default: <value>
      validation: <regex | range | enum_values>
      ref_target: <item_type_id>   # si type = ref
  rules:
    - hook: on_use | on_hit | on_damage | on_equip | ...
      script: <ID de règle dans le moteur>

# Instance d'un item (instance, remplie par admin/MJ)
item_instance:
  id: <slug>
  type: <item_type_id>
  values:
    <field_name>: <value>
  metadata:
    version: <int>
    created_at: <timestamp>
    created_by: <user_id>
    archived: bool
    notes: <string>
```

**Item-types canoniques de base** (tous éditables) :
- `weapon_melee` : arme de mêlée — champs nom, TD principal, formule de dégât, difficulté, modificateurs spéciaux, poids, durabilité, mode d'attaque (R-9.7).
- `weapon_ranged` : arme à distance — champs ci-dessus + range catégorisée + munition compatible (R-9.24, R-9.25).
- `weapon_thrown` : arme de jet — hybride mêlée/distance.
- `armor_piece` : protection — champs P/E/C/T, layer, zones couvertes, poids, multiplicateurs raciaux, durabilité (R-9.14, R-9.20, R-9.26).
- `shield` : bouclier — champs % déviation passive, modificateurs actifs, P/E/C/T, poids (R-9.7, R-9.8).
- `ammunition` : munition — champs cf. R-9.25.
- `status` : état tactique — champs cf. R-9.27.
- `hit_table` : table de touches — champs cf. R-9.21.

**Opérations admin/MJ** :
- **Créer un nouvel item-type** : ex. `firearm` avec champs custom (calibre, capacité chargeur, vitesse de recharge).
- **Cloner un item-type** existant pour le modifier.
- **Créer une instance** : nouvelle arme custom sur un type existant.
- **Modifier un item-type** : ajout/retrait/renommage de champs → migration des instances existantes obligatoire (valeur par défaut pour ajout, archive ou conversion pour retrait).
- **Archiver** : un item-type ou instance peut être archivé (plus utilisable mais conservé pour historique).
- **Versionner** : chaque modification incrémente le `version`. Les personnages référencent un `version` figé jusqu'à acceptation explicite de migration.

**Application par mode arbitre** :
- **MJ humain** : peut créer des items à la volée pendant la session (loot custom).
- **MJ LLM** : applique les règles selon les `rules` du type, propose des items cohérents avec le bestiaire.
- **MJ auto** : strict — refuse toute instance qui ne respecte pas la validation du type.

**Migration** : changement de schéma d'item-type → moteur propose une stratégie de migration item par item. Admin valide. Les persos sont notifiés des items modifiés (cf. R-7.19 méta-principe règles vivantes).

**Statut** : 🟢 acté

### R-9.31 — Sorts en combat (interruption, ciblage, AOE, contre-sort)

**Décision Q-D9.22 (2026-04-25)** : choix D — hybride règle vivante : seuils paramétrables + flux canonique + AOE par sort.

Cette règle complète D8 R-8.6 (TI), R-8.7 (concentration / interruption) et l'école Abjuration (Captage d'énergie, sorts d'annulation).

#### A. Flux canonique d'incantation en combat

1. **Déclaration** au DT `T` : le magicien annonce le sort + cible(s) + paramètres (puissance, zone, etc.).
2. **Coût en énergie** : déduction immédiate au DT `T` (l'énergie est mobilisée dès le début, cf. D8 R-8.10/12).
3. **TI en cours** du DT `T` au DT `T + TI` : le magicien est en état `casting` (état tactique R-9.27 dédié) :
   - Inactif (pas d'autre action possible).
   - Pas d'esquive/parade actif (bouclier passif et armure restent applicables).
   - Visible (sauf Incantation silencieuse + stoïque, atouts D8).
4. **Résolution** au DT `T + TI` : jet d'action D8 R-8.5 (Intelligence + sort + spécialisations) contre la difficulté du sort.
5. **Effet** : si réussi, application immédiate. Si raté, énergie perdue (R-8.13).

#### B. Seuils d'interruption (paramétrables par campagne)

Trois sources d'interruption :

| Source | Seuil par défaut | Configurable ? |
|---|---|---|
| Dégâts subis pendant TI | ≥1 dégât final | Oui (mode arcade : 0, mode standard : 1, mode strict : seuil par sort) |
| Action volontaire du lanceur | toute autre action | Oui (sauf Persistance magique D8) |
| Anti-magie / dispel actif | sort tier ≤ tier dispel | Oui (matrice par école) |

Si interrompu :
- L'incantation est annulée.
- L'énergie déjà déduite est perdue (D8).
- Le perso reprend son flux normal au DT courant.

**Mode `arcade`** : un sort n'est jamais interrompu par les dégâts (seul l'action volontaire ou le KO/dispel l'arrête). Adapté débutants.

**Mode `standard`** : 1 dégât final suffit (D8 par défaut).

**Mode `strict`** : seuil par sort (chaque sort déclare son `interrupt_threshold` ; certains sorts résistants peuvent absorber jusqu'à N dégâts avant interruption).

#### C. Ciblage d'un sort

Trois modes de ciblage (déclarés par l'item-type `spell`, R-9.30) :

- `target_self` : sur le lanceur uniquement. Pas de jet de toucher. Pas de zone touchée. Pas de bouclier/armure de la cible (sauf résistance magique R-9.9).
- `target_single` : une cible désignée. Jet de toucher selon le sort (Intelligence + sort vs difficulté du sort + difficulté de cible). Zone touchée déterminée par R-9.6 (D100 ou action précise).
- `target_area` : sort à zone d'effet (AOE). Voir D ci-dessous.

#### D. Sorts à zone d'effet (AOE)

L'item-type `spell` étend R-9.30 avec ces champs :

```yaml
spell:
  target_type: self | single | cone | sphere | line | area_custom
  radius: <int en mètres>           # rayon ou portée maximale
  origin: caster | target | point   # origine de la zone
  affects: enemies | allies | all | non_caster | non_party
  damage_resolution: per_target | shared
```

**Règles AOE** :
- Le sort touche toutes les entités dans la zone décrite, selon le filtre `affects`.
- Chaque entité subit son propre jet de défense (résistance, esquive si applicable, jet d'aptitude brute D8 R-8.19).
- Si `damage_resolution = per_target` : chaque entité subit la chaîne complète de réduction (résistance → circonstances → armures → endurance → zone).
- Si `damage_resolution = shared` : les dégâts sont divisés à parts égales entre les cibles touchées (cas rare).
- Le moteur trace chaque entité affectée pour le log de combat.

#### E. Contre-sort

Trois mécanismes existants ou à formaliser :

1. **Captage d'énergie (école Abjuration, déjà acté D8)** : sort réactif qui vole de l'énergie au lanceur en cours d'incantation (+3 énergie par réussite). Si le magicien cible ne compense pas, son sort est annulé.
2. **Sort d'annulation** : sort actif qui dissipe un sort en cours ou un sort actif. Tier vs tier (le tier du contre-sort doit être ≥ tier du sort cible).
3. **Déflexion** : redirige un sort à cible unique vers une autre cible (au choix du défenseur ou aléatoire selon le sort de déflexion).

Tous les contre-sorts sont des sorts standards de l'école Abjuration, catalogués via R-9.30. Ils suivent les règles standard d'incantation (TI, énergie, jet) avec en plus une condition de déclenchement réactif (autorisée comme contre-action D1 R-1.12 si le contre-sort le permet).

#### F. Sorts à durée

Pour les sorts à effet temporaire, deux échelles selon D8 R-8.20 :
- **Sort à durée DT** : décompte par DT en mode combat. Conversion automatique en temps narratif si combat se termine avant expiration.
- **Sort à durée narrative** (minutes/heures/jours) : décompte par DT pendant le combat (1 DT = 0,2 s), conversion en temps narratif après.

Les sorts en cours sur un perso continuent à s'appliquer pendant les transformations (D7 R-7.17, D9 R-9.29).

#### G. Application par mode arbitre

- **MJ humain** : libre, peut surcharger ponctuellement (notamment l'AOE, pour des effets narratifs).
- **MJ LLM** : applique strict, propose des résolutions cohérentes pour les ambiguïtés.
- **MJ auto** : strict — applique mécaniquement, refuse les sorts mal définis dans le catalogue.

**Statut** : 🟢 acté

### R-9.32 — Déplacement et positionnement en combat (zones abstraites + vitesse numérique + terrain + UI)

**Décision Q-D9.23 (2026-04-25)** : choix hybride B+C selon précision auteur.

#### A. Modèle de positionnement

Le système combine **zones abstraites narratives** et **distances numériques** :

- **Coordonnées** stockées en mètres pour chaque entité (numérique).
- **Zones de proximité** dérivées : `mêlée` (≤ 2 m), `proche` (3–10 m), `moyen` (11–30 m), `lointain` (> 30 m). Les zones servent de catégories pour les règles d'arme (R-9.24), les sorts (R-9.31), l'engagement de mêlée, la portée de voix, etc.
- Pas de grid 1×1 obligatoire. Le moteur peut afficher une grille tactique en option (mode UI) sans pour autant l'imposer narrativement.

#### B. Vitesse de déplacement

Chaque race a une `base_speed_m_per_dt` (mètres par DT, soit mètres par 0,2 s). Catalogue éditable (règle vivante).

Trois modes de déplacement :
- **Marche** : `× 0.5` de la vitesse de base. Économique, action simple.
- **Course** : `× 1.0`. Action standard. Endurance utilisée pour course longue distance.
- **Sprint** : `× 2.0`. Action improvisée ou multiple, Dextérité utilisée pour sprint court.

Atouts modulant la vitesse (`Course rapide`, `Pas du chasseur`, `Pied léger`, etc.) appliquent leurs modificateurs additifs cf. R-1.36.

#### C. Modificateurs de terrain

Le terrain influe sur la **zone de déplacement effective**. Modificateurs multiplicatifs appliqués à la vitesse :

| Terrain | Multiplicateur | Note |
|---|:---:|---|
| Plat sec | × 1.0 | Référence |
| Herbe haute | × 0.8 | Ralentissement modéré |
| Boue / neige légère | × 0.6 | |
| Sable / neige profonde | × 0.5 | |
| Escalade verticale | × 0.3 | Compétence Escalade applicable |
| Eau peu profonde | × 0.5 | |
| Nage en eau profonde | × 0.4 | Compétence Natation applicable |
| Glace / surface très glissante | × 0.4 | Test Dextérité éventuel pour ne pas glisser |
| Encombré (foule, mobilier) | × 0.5 | |
| Obscurité totale sans vision adaptée | × 0.4 | |

Catalogue éditable. Cumul des modificateurs gérable par produit (ex. boue + obscurité = × 0.6 × 0.4 = × 0.24).

#### D. Système de charge (rappel D2 + intégration combat)

Le port d'équipement réduit la vitesse :
- Capacité sans pénalité : `5 kg × Force`.
- Au-delà : +1 facteur de vitesse (FV) par tranche de 5 kg supplémentaires.
- L'augmentation du FV ralentit toutes les actions du perso (R-9.2), y compris le déplacement.

L'inventaire combat tient compte du poids des armes, armures, munitions, et de l'équipement de quête. Le moteur affiche la capacité courante / capacité maximale et le malus de FV.

#### E. UI : zone de déplacement max visualisable (couplée au mode R-9.34)

Pendant la planification d'un déplacement, le moteur affiche en surbrillance trois anneaux :
- **Anneau vert** — zone atteignable avec le mode `marche`.
- **Anneau jaune** — zone atteignable avec le mode `course`.
- **Anneau rouge** — zone atteignable avec le mode `sprint` (action plus risquée).

**La nature de cette représentation dépend du mode de jeu (R-9.34)** :

- **Mode tour-par-tour** : les anneaux sont **discrets et figés** sur la durée d'un tour (`tour_length_dt`, par défaut 10 DT ≈ 2 s). Ils représentent la zone que l'entité peut parcourir si elle dépense l'intégralité de son tour à se déplacer dans le mode choisi. Ils restent affichés tant que l'entité n'a pas validé son action.

- **Mode temps réel** : les anneaux sont **continus et dynamiques**. Pendant que l'entité bouge, la zone restante se réduit en direct selon le DT courant. Les anneaux deviennent des indicateurs prospectifs (« à partir de maintenant, voici jusqu'où tu peux aller en marche/course/sprint avant que ton action en cours soit résolue »). Ils se déforment en temps réel selon la position courante et le terrain traversé.

Dans les deux modes, les modificateurs de terrain et de charge sont appliqués en direct ; les anneaux se déforment (ex. ovales) selon les zones de terrain difficile autour de l'entité.

#### F. Engagement de mêlée

Une entité est en `engaged_melee` avec une autre si elles sont à ≤ 2 m. Conséquences :
- Tirer à distance vers une cible engagée → +1 difficulté + risque de toucher l'allié engagé (table touches contextuelle).
- Quitter l'engagement (`disengage`) sans contre-attaque nécessite une action spécifique (Dextérité + Réflexes selon mode).
- Une attaque de mêlée déclarée nécessite l'engagement à la résolution (DT `T + FV`). Si la cible se déplace hors mêlée pendant le TI, l'attaque rate ou peut être convertie en charge selon la situation.

#### G. Application par mode arbitre

- **MJ humain** : peut ignorer la précision numérique et raisonner narrativement.
- **MJ LLM** : utilise les zones abstraites par défaut, recourt aux distances numériques pour les cas litigieux.
- **MJ auto** : strict — calcule chaque déplacement en mètres précis.

**Catalogue vivant** : tables de vitesse raciales, modificateurs de terrain, atouts de mobilité, tous éditables et versionnés.

**Statut** : 🟢 acté

### R-9.33 — Soins en combat (potions, sorts, médecine, atouts d'auto-soin)

**Décision Q-D9.24 (2026-04-25)** : choix D — hybride règle vivante : catalogue + règles standard + mode arbitre.

#### A. Item-type `healing_method` (extension de R-9.30)

```yaml
healing_method:
  id: <slug>
  category: potion | spell | medicine | innate_ability | item_consumable
  cast_time_dt: <int>            # DT requis pour appliquer la méthode
  energy_cost: <int>              # 0 pour les méthodes non magiques
  vitality_restored: <expr>       # ex. "level", "1d6+2", "successes_x_2"
  vitality_restored_target: <expr> # peut différer (ex. dégâts auto-régénérés ailleurs)
  target_type: self | single | area
  range_m: <float>
  interruptible: bool
  prerequisites:
    - skill_or_attribute: <ref>
      min_level: <int>
  side_effects:
    - status: <status_id>
      duration_dt: <int>
  uses_per_combat: <int | unlimited>
  uses_per_day: <int | unlimited>
```

#### B. Règles standard par catégorie

- **Potion** : `cast_time_dt = 5` (déboucher + boire) par défaut. Interruptible (1 dégât subi → potion brisée OU avalée partielle selon item). Action improvisée (D1 R-1.12, +1 difficulté).
- **Sort de soin (école Magie blanche, D8)** : `cast_time_dt = TI` du sort, énergie selon le sort, suit le flux d'incantation R-9.31. Interruption sur dégâts.
- **Médecine en combat** (compétence) : `cast_time_dt = 20` par défaut (premiers secours improvisés). Jet `Réflexes + Médecine + spécialisations` à difficulté 8 (improvisé +1, contexte stressant). Action conservée (R-1.12) — les dégâts subis pendant les 20 DT augmentent la difficulté.
- **Médecine hors combat** (compétence) : minutes/heures, voir D5 et D7.
- **Atouts d'auto-soin** :
  - `Apaisement` (toucher, vitalité = niveau soignant) : `cast_time_dt = 5`, target_type = single, range_m = 0.5.
  - `Auto soin` (concentration sur soi) : `cast_time_dt = 10`, target_type = self.
  - `Astre régénérateur` : non utilisable en combat (nécessite contemplation paisible) — selon arbitre.
- **Auto-régénération raciale** (Loup-garou, Troll, atout Auto régénération) : passive, pas de cast_time, applique `+1 vitalité` toutes les 10 DT (cf. lexique « Auto régénération »).

#### C. Limites

- **Par combat** : configurable par item (ex. potion de soin majeur limitée à 1 par combat).
- **Par jour** : configurable par atout/sort (ex. Apaisement = N usages/jour selon le niveau).
- **Cumul** : un personnage ne peut pas être soigné par deux méthodes simultanées sur le même DT (limitation par défaut, surchargeable par règle vivante).

#### D. Application par mode arbitre

- **MJ humain** : libre, peut surcharger les `cast_time_dt` selon la situation.
- **MJ LLM** : applique les règles standard, propose des variantes narratives.
- **MJ auto** : strict — applique chaque méthode selon son catalogue.

**Catalogue vivant** : `healing_method` éditable, ajout de méthodes custom (potions rares, sorts homebrew, atouts custom). Migration des persos en cas d'évolution.

**Statut** : 🟢 acté

### R-9.34 — Mode tour-par-tour vs temps réel (rappel D8 R-8.20 explicité pour le combat)

**Méta-principe (D8 R-8.20)** : le compteur DT est l'unité commune. Les modes diffèrent sur la **façon dont le DT avance** et sur la **présentation à l'utilisateur**.

#### A. Mode tour-par-tour (`turn_based`)

- Le DT n'avance que quand toutes les actions du DT courant sont déclarées et résolues.
- Chaque entité décide de son action quand son `nextActionAt == currentDT`.
- Le moteur attend les inputs (joueurs et MJ) avant d'avancer.
- **Représentation de la capacité de déplacement** : la zone affichée est **discrète** — elle correspond à ce que l'entité peut parcourir sur **ce tour** (un nombre fixe de DT par tour, ex. `tour_length_dt = 10` par défaut, configurable par campagne). Les anneaux marche/course/sprint sont calculés sur cette durée fixe et restent affichés tant que l'entité n'a pas validé son action.

#### B. Mode temps réel (`real_time`)

- Le DT avance automatiquement selon une cadence configurable (multiplicateur de R-8.20).
- Les entités déclarent leurs actions à la volée, le moteur les enfile et les résout à `nextActionAt`.
- Une action en cours peut être interrompue (R-9.4) ; le coût en DT déjà investis est perdu.
- **Représentation de la capacité de déplacement** : la zone affichée est **continue** — elle se met à jour en direct selon le DT courant. Pendant qu'une entité bouge, la zone restante diminue progressivement. Les anneaux sont des indicateurs prospectifs (« si tu commences ton sprint maintenant, voici jusqu'où tu iras ») et se déforment en temps réel selon la position et le terrain.

#### C. Bascule

- La bascule entre `turn_based` et `real_time` est triviale (D8 R-8.20) : la base DT est identique. Le moteur peut basculer en cours de combat (ex. moment dramatique → tour par tour pour la précision tactique, retour temps réel après).
- Les états en cours (timeline d'actions, énergie, états tactiques, durée des sorts) sont conservés.

#### D. Application par mode arbitre

- **MJ humain (papier)** : tour-par-tour par défaut, le MJ compte les DT manuellement.
- **MJ humain (digital)** : choix libre, peut basculer.
- **MJ LLM** : suit le réglage de campagne, propose des bascules narratives.
- **MJ auto** : suit le réglage de campagne, pas de bascule narrative spontanée.

#### E. Paramètres de campagne

```yaml
campaign:
  combat_mode: turn_based | real_time | hybrid_switchable
  tour_length_dt: <int>         # défaut 10 (= 2 secondes)
  real_time_cadence: <float>    # multiplicateur DT/seconde réelle ; défaut 1.0
```

**Statut** : 🟢 acté

### R-9.35 — Poisons (item-type, double échelle, catalogue Harold)

**Décision Q-D9.25 (2026-04-25)** : choix D — hybride règle vivante : double échelle DT/narratif + catalogue.

#### A. Item-type `poison` (extension R-9.30)

```yaml
poison:
  id: <slug>
  name: <string localisé>
  origin: vegetal | animal | mineral | magical | hybrid
  inoculation_modes: [ingestion, injection, contact, inhalation]
  lethal_dose:
    value: <float>
    unit: mg | g | drop | sip
  combat_phase:                    # effet immédiat en DT (action courte)
    onset_dt: <int>                # délai avant premiers effets
    duration_dt: <int>             # durée totale de la phase combat
    damage_per_dt: <int>           # dégâts récurrents par DT (typés ou bruts)
    damage_type: P | E | C | T | raw
    statuses_applied:
      - status: <status_id>
        intensity: <int>
        duration_dt: <int>
  narrative_phase:                 # effet long terme (hors combat ou après combat)
    onset: <duration narrative>    # ex. "30 minutes", "4 heures"
    death_window: <duration>       # délai jusqu'à mort si non traité
    statuses_applied:
      - status: <status_id>
        duration: <duration>
  resistance:
    method: endurance_check | percent_resistance | both
    difficulty: <int>              # difficulté du jet d'Endurance D8 R-8.19
    threshold_percent: <int>       # seuil D100 si percent_resistance
  antidote:
    item_id: <ref healing_method | item>
    effective_window: <duration>   # délai max après inoculation pour être efficace
    full_cure: bool
  rarity: courant | rare | tres_rare | unique
  geographic_origin: <string narratif>
  notes: <string>
```

#### B. Double échelle d'effet

Cohérent avec D8 R-8.20 (système de temps double) :

- **Phase combat (DT)** : effets immédiats du poison ressentis en quelques DT à quelques minutes. Pertinent pour les poisons à action rapide :
  - **Taxine** : 5–10 min (≈ 1500–3000 DT) → effet en combat possible si combat très long.
  - **Curare** : 90–120 s (≈ 450–600 DT) → effet en combat probable.
  - **Cyanure** : 1–2 min (≈ 300–600 DT) à forte dose → effet en combat probable.
  - **Strychnine** : 15 min (≈ 4500 DT) → effet narratif post-combat.
- **Phase narrative (heures/jours)** : effets long terme. Pertinent pour les poisons lents (Hétérosides 4 h, Colchicine semaines, Ricine 2-5 jours).

Le moteur convertit automatiquement la durée narrative en DT pour la phase combat (1 minute = 300 DT, 1 heure = 18 000 DT) si le combat dure assez longtemps. Sinon, la phase narrative s'applique au temps narratif après le combat.

#### C. Mode d'inoculation

| Mode | Action en combat | Détection |
|---|---|---|
| `ingestion` | Action volontaire ou ruse (potion empoisonnée). 5 DT pour avaler. | Goût parfois (selon poison). |
| `injection` | Arme empoisonnée (lame, dard, flèche). Jet de toucher standard. Si touche → inoculation auto. | Souvent immédiate via la blessure. |
| `contact` | Touche peau/muqueuse. Action de toucher (FV DT) ou contact incident. | Variable. |
| `inhalation` | Exposition à un gaz/poudre. AOE possible (zone toxique). | Selon densité/odeur. |

#### D. Résistance

Trois mécanismes selon le poison :
- **Jet d'Endurance** (aptitude brute D8 R-8.19) à la difficulté du poison. Réussite = effet annulé ou réduit (selon le poison). Échec = effets appliqués.
- **Résistance % D100** (R-9.9 type A) : si la cible a une résistance poison stockée (ex. nain `+20% poison`), test D100 ≤ % avant effet.
- **Both** : test % d'abord, puis jet d'Endurance si le test % a échoué.

Atouts pertinents : `Résistance aux poisons`, `Estomac de fer`, `Antitoxine naturelle`, etc. (catalogue lexique).

#### E. Cumul de doses

- Une dose unique applique l'effet standard.
- Doses multiples peuvent :
  - Réduire le délai d'apparition (`onset` divisé par le nombre de doses, plancher = 1 DT).
  - Augmenter l'intensité des `statuses_applied` (selon règle vivante du poison).
  - Avancer la phase narrative (`death_window` divisé par le nombre de doses).
- Plafond configurable par poison.

#### F. Antidote

- Application = action standard ou sort de soin (R-9.33).
- Doit être administré dans la `effective_window` du poison.
- Effet : annulation totale, réduction des effets, ou simple stabilisation (ne tue plus mais les effets actuels persistent), selon le couple poison/antidote.
- Antidotes spécifiques (selon PDF Harold) :
  - Aconitine ↔ aucun (létal sans intervention).
  - Atropine ↔ Physostigmine (inconnu au moyen âge — sort de Magie blanche équivalent ?).
  - Curare ↔ Néostigmine.
  - Digitaline ↔ Aconit (paradoxal) ou solution d'acide tannique (vin).
  - Opium ↔ Naloxone (inconnu — sort équivalent).
  - Plusieurs ↔ aucun (sauf lavage gastrique).

Pour les antidotes « inconnus au moyen âge », le moteur peut soit :
- Les traiter comme rares/légendaires (à découvrir narrativement).
- Les remplacer par un sort équivalent (`Purification` école Magie blanche ?, à valider en D8 si manquant).

#### G. Catalogue de base (issu du PDF Harold)

14 poisons canoniques importés : Aconitine, Atropine, Ciguë, Colchicine, Curare, Cyanure, Digitaline, Ergotamine, Hétérosides, Hyoscyamine, Opium, Ricine, Scopolamine, Strychnine, Taxine. Chaque entrée éditable, versionnée. Migration possible.

#### H. Application par mode arbitre

- **MJ humain** : peut surcharger les délais et effets pour la narration.
- **MJ LLM** : applique la double échelle automatiquement, propose des descriptions narratives selon les symptômes du PDF.
- **MJ auto** : strict — applique les effets DT et narratifs sans interprétation.

**Statut** : 🟢 acté

### R-9.36 — Attaques physiques multi-cibles (fauchage, cône, ligne, rebond, charge)

**Décision Q-D9.26 (2026-04-25)** : choix D — hybride règle vivante : `area_attack` sur arme + cumul D1 R-1.12.

#### A. Extension de l'item-type `weapon_*` (R-9.30)

```yaml
weapon:
  area_attack:
    enabled: bool
    pattern: sweep | cone | line | ricochet | charge
    max_targets: <int>
    target_radius_m: <float>           # rayon ou portée du pattern
    damage_distribution: full | divided | halved | scaled
    difficulty_per_extra_target: <int> # ex. +1 par cible additionnelle (par défaut)
    requires_specialization: <ref>     # optionnel, ex. spé "Fauchage (épée à 2 mains)"
```

#### B. Patterns

- **`sweep` (fauchage)** : balayage en arc. Touche jusqu'à `max_targets` ennemis dans un demi-cercle frontal de rayon `target_radius_m`. Typique : épée à deux mains, hallebarde, bardiche, faux.
- **`cone`** : éventail conique. Touche tout ennemi dans le cône de demi-angle 30–60° et de portée `target_radius_m`. Typique : balayage à plusieurs entités, attaque à très grande envergure.
- **`line`** : ligne droite. Touche les cibles alignées sur le trajet de l'attaque. Typique : flèche perforante magique, harpon traversant, lance projetée.
- **`ricochet`** : rebond entre cibles. Une cible primaire est touchée, puis l'arme rebondit sur jusqu'à `max_targets - 1` cibles supplémentaires (dans `target_radius_m` autour de la précédente). Typique : chakram, boomerang, étoile ninja avec spécialisation.
- **`charge`** : un personnage qui charge à pleine vitesse peut tenter de traverser une ligne d'ennemis. Mécanisme dérivé du modificateur de circonstance Charge (R-9.13) avec `pattern: line`. Typique : cavalier, créature massive en mouvement.

#### C. Distribution des dégâts

- **`full`** : chaque cible touchée subit la totalité des dégâts de l'attaque. Privilégie les armes lourdes magiques rares.
- **`divided`** : les dégâts sont répartis également entre les cibles touchées. Ex. fauchage standard de 8 dégâts sur 2 cibles → 4 chacune.
- **`halved`** : chaque cible additionnelle au-delà de la première subit la moitié des dégâts (cumul possible : 1ère plein, 2ème ½, 3ème ¼, etc.).
- **`scaled`** : barème custom par cible (1ère 100%, 2ème 70%, 3ème 40%, etc.). Configurable par arme.

#### D. Mécanique de résolution

1. L'attaquant déclare la cible primaire et l'attaque multi-cible (en s'appuyant sur le pattern de l'arme).
2. Modificateur de difficulté : `+1` par cible additionnelle au-delà de la première (réglable par arme via `difficulty_per_extra_target`).
3. Si une spécialisation pertinente existe (ex. « Fauchage (Épée à deux mains) »), elle réduit la difficulté selon les règles standard (R-1.10 / R-9.5).
4. **Un seul jet de toucher** est résolu pour l'ensemble du pattern. Le nombre de réussites détermine la qualité du coup pour toutes les cibles.
5. Chaque cible peut **séparément** tenter une esquive ou une parade (R-9.6, R-9.7) en contre-action.
6. Pour chaque cible touchée, on applique la chaîne de résolution standard (R-9.12) avec le `damage_distribution` configuré.
7. Le retard d'action (R-9.18-bis) est calculé sur les **dégâts finaux maximaux subis** par l'attaquant lui-même (pas de cumul si l'attaque touche plusieurs cibles).

#### E. Cumul avec actions multiples (D1 R-1.12)

Si l'attaquant veut **viser séparément** plusieurs cibles non couvertes par le pattern, il peut combiner :
- **Action multiple D1 R-1.12** : +1 difficulté par cible additionnelle, répartition des dés selon le joueur.
- **Pattern d'arme** : le pattern continue à s'appliquer (l'arme couvre naturellement N cibles, l'action multiple permet d'en cibler d'autres en plus).

Exemple : épée à deux mains avec `sweep max_targets=2`, attaquant veut frapper 3 ennemis dont 2 alignés et 1 isolé. Solution : `sweep` sur les 2 alignés (1 jet) + 1 frappe isolée (action multiple, +1 difficulté). Total 2 jets distincts.

#### F. Application par mode arbitre

- **MJ humain** : peut autoriser ou refuser un pattern selon la situation, surcharger les paramètres.
- **MJ LLM** : applique le pattern de l'arme strictement, propose les répartitions de dégâts standard.
- **MJ auto** : strict — applique le pattern sans surcharge.

**Catalogue vivant** : les paramètres d'`area_attack` par arme sont éditables. Migration des armes existantes en cas d'évolution.

**Statut** : 🟢 acté

### R-9.37 — Fuite, poursuite et conditions de fin de combat

**Décision Q-D9.27 (2026-04-25)** : choix D + prise en charge native des atouts d'évasion.

#### A. Flux canonique de fuite

1. **Déclaration d'intention** : le perso (PJ ou PNJ contrôlé) annonce sa volonté de fuir au DT `T`.
2. **Désengagement** (si en mêlée, R-9.32 F) : action standard ou improvisée selon la situation. Voir Q-D9.28 pour les conditions précises.
3. **Mouvement** : le perso applique le mode `course` ou `sprint` (R-9.32 B) en direction d'une zone de sortie.
4. **Jet de fuite** (action multiple cumulable R-1.12) : à chaque DT clé pendant la poursuite, le fuyard fait un **jet de fuite** = `Endurance + Course + spécialisations` (sprint court) ou `Endurance + Course + spécialisations` (course longue), à difficulté standard 7 modulée par le terrain et les modificateurs.
5. **Jet d'opposition** : chaque poursuivant fait son propre jet équivalent. Si le poursuivant fait `≥ réussites_fuyard`, il maintient ou réduit la distance. Sinon, le fuyard distance.
6. **Distance d'évasion atteinte** : par défaut `50 m` hors de vue directe. Une fois cette distance atteinte sans contact maintenu, la fuite est réussie.
7. **Conditions de fin de combat** : la scène combat se termine quand l'une des conditions configurées est atteinte (cf. E).

#### B. Atouts et orientations modulant la fuite (catalogue intégré)

Le catalogue d'atouts (D4) inclut déjà plusieurs atouts d'évasion à intégrer nativement dans le moteur de fuite. Le moteur reconnaît leurs effets :

| Atout | Effet | Source |
|---|---|---|
| **Cours toujours** | Le perso ajoute son niveau au nombre de réussites de tout jet de fuite. | Atout |
| **Retraite stratégique** | Diminue de 1 la difficulté du jet de fuite. | Hors-la-loi N2 |
| **Disparition** | Permet de se cacher en 1 DT si personne ne regarde. Action ultra-rapide. | Éphémère |
| **Invisibilité** | Le perso devient invisible jusqu'à 1 min/niveau. Le poursuivant doit faire un jet de Perception modifié. | Atout |
| **Silence de mort** | Crée un silence sur 1m/niveau, durée 1 min/niveau. Annule la détection auditive. | Atout |
| **Pieds poilus** | Diminue de 3 la difficulté de mouvement silencieux (cumulable avec mouvement furtif lors de la fuite). | Permanent (hobbit) |
| **Discrétion** (orientation Hors-la-loi) | Atout d'orientation. Bonus aux jets liés à la dissimulation. | Hors-la-loi (orientation) |
| **Atouts de classe Voleur, Espion, Ninja, Assassin** | Modificateurs spécifiques à la furtivité, l'évasion, la dissimulation. | Hors-la-loi |
| **Inesquivable** (côté poursuivant) | Augmente de 1 la difficulté d'esquive/fuite des cibles, pendant 1 tour (50 DT) par niveau. | Atout |

Tous ces atouts sont des items du catalogue vivant (R-9.30, item-type `atout`) ; le moteur les applique automatiquement dans le calcul du jet de fuite.

#### C. Modificateurs de terrain en fuite

Les modificateurs de terrain (R-9.32 C) s'appliquent au jet de fuite et au jet d'opposition. Les terrains favorables au fuyard (forêt dense, ville labyrinthique, marais pour un nain alourdi) peuvent inverser l'avantage. Le moteur calcule l'écart de difficulté pour chaque entité.

#### D. Distance d'évasion paramétrable

```yaml
campaign:
  evasion:
    default_distance_m: 50            # distance par défaut pour fuite réussie
    requires_out_of_sight: true        # fuite réussie seulement si hors de vue
    requires_breaking_pursuit: true   # fuite réussie seulement si plus aucun poursuivant ne maintient le contact
```

Surchargeable par scène (ex. donjon clos = pas de fuite par distance, doit atteindre une issue).

#### E. Conditions de fin de combat (configurables)

```yaml
combat_end_conditions:
  - all_hostiles_neutralized: true   # toutes les entités hostiles tuées, KO ou fuites
  - pj_declared_flee: true           # tous les PJ ont déclaré la fuite et l'ont réussie
  - mj_declared: true                # le MJ humain (ou LLM) déclare la fin
  - timer_expired: false             # rare, par contrainte narrative
  - peace_offered: false             # reddition acceptée des deux côtés
```

Le combat se termine dès qu'**au moins une condition activée** est atteinte. Configurable par campagne et surchargeable par rencontre.

#### F. Application par mode arbitre

- **MJ humain** : peut autoriser une fuite narrative sans jet, ou imposer des conditions strictes.
- **MJ LLM** : applique les jets standard et propose des résolutions narratives quand le résultat est ambigu.
- **MJ auto** : strict — calcule chaque DT de poursuite, applique les modificateurs et atouts, déclenche la fin de combat sur les conditions configurées.

**Statut** : 🟢 acté

### R-9.38 — Désengagement de mêlée (3 modes + atouts dédiés)

**Décision Q-D9.28 (2026-04-25)** : choix D — hybride règle vivante : 3 modes + atouts dédiés.

#### A. Trois modes de désengagement

##### 1. Désengagement volontaire (`controlled_disengage`)

- **Type** : action conservée (D1 R-1.12), durée par défaut **5 DT** (configurable par campagne).
- **Jet** : `Réflexes + Esquive + spécialisations` vs `Dextérité + Compétence d'arme + spécialisations` de l'adversaire (jet d'opposition).
- **Réussite** : le perso quitte la mêlée sans attaque d'opportunité. Action conservée appliquée — chaque dégât subi pendant ces 5 DT augmente la difficulté du jet d'opposition (R-1.12).
- **Échec** : le désengagement échoue, le perso reste en mêlée et peut subir une attaque réflexe de l'adversaire au moment de la résolution.
- **Multiplicité** : si le perso est en mêlée avec plusieurs adversaires, **un jet par adversaire** est requis ; le pire résultat détermine le succès.

##### 2. Désengagement précipité (`hasty_disengage`)

- **Type** : action improvisée (D1 R-1.12), durée standard FV DT.
- **Jet** : aucun jet de désengagement. L'adversaire bénéficie automatiquement d'une **attaque d'opportunité** (action gratuite, +1 difficulté improvisée, contre la cible qui fuit) au moment où le perso quitte la portée de mêlée.
- **Avantage** : rapide, pas de risque d'opposition.
- **Inconvénient** : exposition garantie à l'attaque d'opportunité.

##### 3. Retraite progressive (`fighting_retreat`)

- **Type** : action multiple D1 R-1.12 (déplacement + garde).
- **Jet** : déplacement à reculons à vitesse `× 0.5` (R-9.32 B mode marche). Le perso maintient sa garde, peut esquiver ou parer normalement les attaques.
- **Mécanique** : pas d'attaque d'opportunité tant que le perso garde le contact visuel et la garde levée. Le perso ne peut pas tourner le dos.
- **Inconvénient** : vitesse réduite, action multiple (toutes les actions du DT en cours sont en difficulté +1 par action additionnelle).

#### B. Atouts dédiés (catalogue intégré)

Le moteur reconnaît automatiquement les atouts pertinents :

| Atout | Effet | Application |
|---|---|---|
| **Désengagement souple** (à proposer si manquant au lexique) | Permet le mode `controlled_disengage` en 2 DT au lieu de 5. | Bonus de vitesse |
| **Pas de retraite** (à proposer si manquant) | Empêche tout désengagement volontaire ou retraite. Force `hasty_disengage` ou combat à mort. | Effet de zone par adversaire |
| **Cours toujours** (déjà acté R-9.37) | +niveau aux réussites de tout jet de fuite, applicable aussi au désengagement. | Bonus de réussites |
| **Retraite stratégique** (déjà acté R-9.37) | -1 difficulté du jet de fuite/désengagement. | Bonus de difficulté |
| **Inesquivable** (côté adversaire) | +1 difficulté à l'esquive et au désengagement de la cible. | Malus de difficulté pour le fuyard |

Les atouts manquants au lexique sont à proposer en D4 ou via règle vivante (admin/MJ peut créer un atout custom).

#### C. Engagement multi-adversaires

Si le perso est en mêlée avec N adversaires :
- `controlled_disengage` : N jets distincts, le pire détermine le succès.
- `hasty_disengage` : N attaques d'opportunité (une par adversaire engagé).
- `fighting_retreat` : praticable si tous les adversaires sont devant le perso ; impossible si le perso est encerclé (sauf atout spécifique type `Tourbillon défensif`).

#### D. Application par mode arbitre

- **MJ humain** : peut autoriser des modes hybrides ou narratifs spéciaux (ex. fuite après une feinte).
- **MJ LLM** : applique strictement les 3 modes, propose le plus tactique selon la situation.
- **MJ auto** : strict — applique les 3 modes selon le choix du joueur, refuse les variantes non documentées.

**Catalogue vivant** : durée de `controlled_disengage`, modificateurs des modes, atouts associés, tous éditables.

**Statut** : 🟢 acté

### R-9.39 — Round de surprise / embuscade (niveaux + atouts dédiés)

**Décision Q-D9.29 (2026-04-25)** : choix D — hybride règle vivante : niveaux de surprise + atouts dédiés + couplage R-9.27.

#### A. Déclenchement de la surprise

À l'amorce d'un combat (avant le DT 0 du combat), le moteur évalue la surprise :

1. **Conditions préalables** :
   - Au moins une partie souhaite attaquer en surprise (déclaration explicite ou IA hostile en mode embuscade).
   - Les cibles n'ont pas conscience explicite de la menace (couvert, distance, distraction, etc.).

2. **Jet d'opposition Furtivité vs Perception** :
   - Côté attaquant : `Réflexes/Dextérité + Discrétion + spécialisations` (avec atout Discrétion s'il l'a, R-9.37 catalogue).
   - Côté défenseur : `Perception + Vue/Ouïe + spécialisations`.
   - Modificateurs de circonstance D1 R-1.36 : obscurité, terrain, bruit ambiant, vigilance précédente, etc.

3. **Calcul de l'écart** : `écart = réussites_attaquant − réussites_défenseur`.

#### B. Trois niveaux de surprise

| Niveau | Écart | État appliqué (R-9.27) | Durée | Effets |
|---|:---:|---|:---:|---|
| **Totale** | ≥ 3 | `surprised_total` | 1 round (50 DT) | Cible inactive, ne peut pas esquiver/parer/agir. Toute attaque sur la cible bénéficie de **+2 dés** ou **−1 difficulté**. Le perso surpris ne peut pas déclarer d'action avant la fin de la durée. |
| **Partielle** | 1–2 | `surprised_partial` | 1 demi-round (25 DT) | La cible peut agir mais uniquement en action improvisée (+1 difficulté D1 R-1.12). L'esquive et la parade sont possibles mais en contre-action improvisée. L'attaquant a un bonus initial de +1 dé sur sa première attaque. |
| **Nulle** | ≤ 0 | aucun état appliqué | — | Pas de surprise. Combat débute normalement, l'attaquant garde son `nextActionAt = 0`, le défenseur aussi. |

#### C. Atouts dédiés (catalogue intégré)

| Atout | Effet | Catégorie |
|---|---|---|
| **Discrétion** (Hors-la-loi) | −5 difficulté sur un jet de furtivité (avantage attaquant). | Bonus furtivité |
| **Pieds poilus** (hobbit) | −3 difficulté pour mouvement silencieux. Cumul possible avec Discrétion. | Bonus furtivité |
| **Détection des coups portants** | Le perso sait automatiquement si un coup de mêlée va le toucher → ne peut pas être surpris en mêlée s'il a la perception ≥ 4. | Immunité partielle (mêlée) |
| **Détection des projectiles portants** | Équivalent pour les attaques à distance, requiert ouïe ≥ 4. | Immunité partielle (distance) |
| **Brumathropie** (forme brume) | Forme brume détectable seulement par quelqu'un d'attentif → +Niveau aux réussites de furtivité tant que le perso est en forme brume. | Bonus furtivité (forme spéciale) |
| **Vigilance** (Chasseur de primes, classe) | Donne un bonus à la Perception en condition d'embuscade. | Bonus perception |
| **Espionnage** (Espion, classe) | Bonus aux jets de furtivité en milieu social/urbain. | Bonus furtivité contextuel |

#### D. Effets sur la timeline de combat

- **Sans surprise** : tous les participants démarrent leur premier `nextActionAt` au DT 0 + leur FV propre.
- **Surprise totale** : les attaquants démarrent au DT 0 ; les surpris ne peuvent pas agir avant DT 50. Pendant ces 50 DT, ils sont vulnérables (pas de défense active).
- **Surprise partielle** : les attaquants ont +1 dé à leur première attaque (DT 0 + FV) ; les surpris peuvent réagir en improvisé à partir du DT 25.
- **Embuscade ratée** : les défenseurs détectent l'attaque imminente, le combat débute normalement.

#### E. Cas particuliers

- **Attaque dans le dos** : si la cible n'a pas conscience de l'attaquant (sens occlus, attention dirigée ailleurs), elle est traitée comme `surprised_total` même sans jet d'opposition (à l'arbitrage du MJ).
- **Embuscade collective** : un groupe d'attaquants peut tenter une embuscade coordonnée. Le moteur fait un jet par attaquant, ou un jet de groupe (le pire, cf. principe « la chaîne se brise par le maillon le plus faible » — par défaut, le jet du moins furtif détermine).
- **Embuscade magique** : un sort de Captage d'énergie ou un sort offensif lancé de surprise applique les mêmes règles. Le TI du sort doit être terminé avant le combat pour profiter de la surprise totale (sinon l'incantation devient l'élément déclencheur, et la cible peut réagir).

#### F. Application par mode arbitre

- **MJ humain** : peut autoriser une embuscade narrative sans jet, ou imposer des conditions strictes.
- **MJ LLM** : applique le jet d'opposition automatiquement, propose des descriptions narratives selon le niveau de surprise.
- **MJ auto** : strict — calcule le jet, applique le niveau, démarre la timeline avec les modificateurs corrects.

**Catalogue vivant** : seuils d'écart, durées d'état, modificateurs par niveau, tous éditables.

**Statut** : 🟢 acté

### R-9.40 — Tactique de groupe (5 modules + atouts dédiés)

**Décision Q-D9.30 (2026-04-25)** : choix D — hybride règle vivante : modules activables + atouts dédiés reconnus.

#### A. Cinq modules tactiques optionnels

Chaque module est activable par campagne (`combat.tactics.<module>: true|false`). Par défaut, tous les modules sont activés en mode `standard` et tous désactivés en mode `arcade`.

##### 1. Flanquement (`flanking`)

Une cible **engagée en mêlée** (R-9.32 F) avec un allié de l'attaquant subit un malus si l'attaquant est positionné sur son flanc ou dans son dos.

| Position de l'attaquant | Modificateur |
|---|:---:|
| Face | aucun (combat normal) |
| Flanc (gauche/droit) | +1 dé attaquant ou −1 difficulté |
| Dos | +2 dés attaquant ou −2 difficulté ; en cas de surprise, peut déclencher l'état `surprised_partial` (R-9.39) |

Le calcul de la position utilise les coordonnées de R-9.32 et l'orientation visuelle de la cible. L'orientation peut être manipulée par feinte ou contrainte (atouts d'agitation, sorts d'illusion).

##### 2. Formation (`formation`)

Un groupe de ≥ 2 alliés en `engaged_melee` mutuel et en garde mutuelle déclarée bénéficie d'une **formation**.

| Type de formation | Bonus défensif | Malus offensif |
|---|---|---|
| **Mur de boucliers** (≥ 2, boucliers requis) | +2 % chance bouclier passif (R-9.8) à tous les membres | −1 dé offensif |
| **Phalange** (≥ 3, alignés en ligne) | −1 difficulté esquive/parade | −1 dé offensif sauf cible en face |
| **Cercle défensif** (≥ 3, encerclant un protégé) | Le protégé est immune à l'engagement direct par les attaquants extérieurs | Membres en cercle ne peuvent pas charger |
| **Tortue romaine** (≥ 4, boucliers requis) | +5 % bouclier passif tous, +1 protection contre projectiles | Vitesse × 0,3, attaques de mêlée +1 difficulté |

Les formations sont éditables (catalogue vivant). Activation = action conservée, durée = jusqu'à rupture (≥ 1 membre quitte).

##### 3. Garde mutuelle (`mutual_guard`)

Un perso peut déclarer une **garde mutuelle** sur un allié à portée de mêlée. Action conservée.

- Pendant la garde, toute attaque visant l'allié peut être interceptée par le gardien (jet de Réflexes + Esquive ou Parade contre la difficulté de l'attaque).
- Réussite : le gardien subit l'attaque à sa place.
- Échec : l'attaque touche normalement l'allié.
- La garde mutuelle dure jusqu'à action contraire ou jusqu'à ce que le gardien soit incapable d'intervenir.

##### 4. Aide à l'action (`assist`)

Un perso peut consacrer son tour à aider un allié dans une action. Jet d'aide :
- Le helper fait un jet à difficulté standard 7 sur la compétence pertinente.
- Chaque réussite donne +1 dé à l'action de l'allié (cumulable jusqu'à 3 dés par helper).
- Plusieurs helpers possibles, mais chaque helper coûte son action.

Exemples : un compagnon tient la corde pendant qu'un autre escalade ; un guérisseur prépare le matériel pendant qu'un autre soigne.

##### 5. Buffs et debuffs collectifs (`collective_buffs`)

Atouts et sorts à effet de groupe :

| Atout/Sort | Effet | Source |
|---|---|---|
| **Musique stimulante** | Stimule une émotion chez les auditeurs (selon style musical). | Barde N2 |
| **Chant guerrier** (exemple legacy regles:385) | 1 réussite = −1 difficulté pour les compagnons en combat ; effet maintenu tant que le chanteur chante. | Barde, exemple |
| **Chant envoûtant** | Test de volonté difficulté +1/niveau du chanteur ; échec = séduit. | Chanteur N4 |
| **Barrière psychique de masse** | Protection mentale collective contre sorts d'esprit. | Sort Magie blanche |
| **Défense** | +Niveau aux dés en combat défensif avec arme de prédilection (pas de groupe direct mais cumulable avec garde mutuelle). | Garde N2 |
| **Aura bénéfique / Aura maléfique** | Protection contre magie noire / blanche dans 1 m × niveau autour. | Atouts |

Le moteur applique automatiquement ces effets aux entités à portée si l'atout/sort est actif.

#### B. Atouts opposés (anti-tactique)

| Atout | Effet |
|---|---|
| **Inesquivable** | +1 difficulté esquive/parade pour les cibles, durée 1 tour (50 DT) × niveau. |
| **Hurlement de la mort** (à proposer si manquant) | Brise les formations à portée par effet de terreur. |

#### C. Application par mode arbitre

- **MJ humain** : peut activer/désactiver chaque module à la volée, surcharger les modificateurs.
- **MJ LLM** : applique les modules activés, propose les bonus contextuels.
- **MJ auto** : strict — applique chaque module configuré sans interprétation.

**Catalogue vivant** : tous les modificateurs, formations, atouts associés sont éditables et versionnés.

**Statut** : 🟢 acté

### R-9.41 — Combat à mains nues, lutte, saisies, désarmement

**Décision Q-D9.32 (2026-04-25)** : choix D — hybride règle vivante par mode arbitre (par cohérence avec le pattern global).

#### A. Compétences et aptitude par défaut

- **Bagarre** (compétence D5) : pour les coups de poing, pied, tête, frappes improvisées. Aptitude par défaut = **Force** ou **Dextérité** selon la nature du coup (cf. regles:372 : « Force + Bagarre + spés » ou « Dextérité + Bagarre + spés »).
- **Lutte** (compétence D5) : pour les manœuvres de saisie, projection, soumission. Aptitude par défaut = **Force**.
- **Étreinte** (spécialisation possible de Lutte ou Bagarre) : pour les saisies à l'arrêt et l'étranglement.

#### B. Item-type `unarmed_attack` (extension R-9.30)

```yaml
unarmed_attack:
  id: <slug>                       # punch, kick, headbutt, elbow, knee, grapple, takedown, ...
  category: strike | grapple | takedown | submission | choke | disarm
  base_damage: F+0 | F+1 | F+2     # selon le coup
  damage_type: C                    # contendant par défaut, sauf exceptions (corne, dent → P)
  difficulty: 7
  applies_status: <status_id>       # ex. grappled, prone, disarmed
  duration_dt: <int>
  requires_specialization: <ref>    # optionnel
```

#### C. Manœuvres canoniques

| Manœuvre | Compétence par défaut | Effet | Action |
|---|---|---|---|
| **Coup de poing/pied/tête** | Bagarre | Dégâts contendants F+0/F+1/F+2 | simple |
| **Agripper** | Lutte | Applique état `grappled` (R-9.27) sur la cible | simple |
| **Plaquer** | Bagarre/Lutte (Force) | Applique `prone` (à terre) sur la cible | précise |
| **Projeter** | Lutte (Force) | `prone` + déplacement de 1–3 m | précise |
| **Soumettre** | Lutte | Applique `restrained` ou `disabled_limb` (selon clé) | conservée |
| **Étrangler** | Étreinte | DoT contendant + applique `silenced` puis `unconscious` après N DT | conservée |
| **Désarmer** | Bagarre/Lutte (Dextérité) | Force la cible à perdre son arme. Jet d'opposition. Réussite = arme tombée au sol. | simple |

Toutes ces manœuvres sont des instances `unarmed_attack` du catalogue vivant.

#### D. Atouts dédiés (catalogue intégré)

| Atout | Effet | Source |
|---|---|---|
| **Corne aux mains** | +1 P/E/C/T sur les mains, dégâts perforants potentiels (selon item) | Atout permanent |
| **Lutte** (spé) | +Niveau au jet de Lutte selon spécialisation | Compétence/spécialisation |
| **Bagarre** (spé) | +Niveau au jet de Bagarre selon spécialisation | Compétence/spécialisation |

Atouts à proposer si manquants : `Prise de fer` (étreinte plus difficile à briser), `Lutte de grappin`, `Coup décisif à mains nues`.

#### E. Cas multi-membres (nagas, créatures)

Le legacy mentionne explicitement les **nagas et leurs six bras armés de lames** (regles:415). Pour ces morphologies :
- Nombre de membres équipés indépendamment > 2 (ex. naga = 6, octopode = 8).
- Chaque membre peut effectuer une action distincte (cumul d'actions multiples D1 R-1.12).
- Le moteur stocke un champ `manipulators_count` sur la race/créature.
- Les pénalités de main faible ne s'appliquent qu'aux membres « surnuméraires », et seulement si le perso n'a pas un atout équivalent à Ambidextrie (R-9.42).

**Statut** : 🟢 acté

### R-9.42 — Combat avec deux armes, ambidextrie, armes à deux mains

**Décision Q-D9.32 (2026-04-25)** : choix D — hybride règle vivante par mode arbitre.

#### A. Pénalité de la « mauvaise main »

**Énoncé legacy** ([regles:381](documents/regles/index.md)) :

> Un personnage droitier veut faire un dessin de la main gauche. La difficulté peut alors être élevée de mmmm... 3 par exemple.

Donc la pénalité par défaut pour utilisation de la **mauvaise main** est **+3 difficulté** sur le jet d'action concerné.

Atout **Ambidextrie** (lexique l66) : « Annule les pénalités dues à l'usage de la « mauvaise main ». »

#### B. Combat avec deux armes (dual wielding)

Mécanique :
1. Le perso porte une arme par main. Pas de pénalité d'équipement si chaque arme est à une main.
2. Pour attaquer avec les deux armes en un seul DT → **action multiple D1 R-1.12** (+1 difficulté par action additionnelle).
3. La frappe de la main faible (mauvaise main) subit en plus la pénalité de +3 difficulté, sauf si Ambidextrie.
4. Les compétences et spécialisations s'appliquent normalement à chaque jet.

Ex. droitier sans Ambidextrie attaque main droite (épée) + main gauche (dague) :
- Attaque main droite : difficulté = 7 (épée) +1 (action multiple) = **8**
- Attaque main gauche : difficulté = 6 (dague) +1 (action multiple) +3 (mauvaise main) = **10**
- Avec Ambidextrie : main gauche = 6 +1 = **7**

#### C. Armes à deux mains

```yaml
weapon:
  hands_required: 1 | 2
  min_strength: <int>     # Force minimum requise pour manier sans pénalité
```

Règles :
- Une arme à deux mains occupe les deux mains. Pas de seconde arme ni de bouclier en main.
- **Force minimum** : si Force < `min_strength`, la difficulté du jet de toucher est augmentée de `(min_strength − Force)`.
- Capacité de port : cf. R-9.32 D (5 kg × Force avant pénalité de FV).

Exemples d'armes à deux mains (table) :
- Épée à deux mains (`F+7`, difficulté 9, poids 3.5 kg, `min_strength` 4 par exemple)
- Espadon (`F+7`, difficulté 9, poids 5 kg, `min_strength` 5)
- Bardiche, Hallebarde, Fauchard, Faux

#### D. Cas des créatures multi-membres

Cf. R-9.41 E. Pour une créature à `manipulators_count > 2` :
- Membres au-delà des 2 « principaux » → considérés comme « mauvaises mains » par défaut (+3 difficulté).
- Atout équivalent à Ambidextrie pour la race entière (ex. atout racial naga **Multi-membres**) annule cette pénalité pour tous les membres.

#### E. Atouts associés

| Atout | Effet |
|---|---|
| **Ambidextrie** | Annule la pénalité de mauvaise main (+3 difficulté). |
| **Multi-membres** (à proposer si manquant pour nagas) | Étend Ambidextrie à tous les membres surnuméraires. |
| **Spécialisation arme à deux mains** | -1 difficulté par spécialisation pertinente. |

#### F. Application par mode arbitre

- **MJ humain** : peut surcharger les pénalités selon la situation (ex. perso entraîné depuis longtemps avec sa main faible peut avoir une pénalité réduite).
- **MJ LLM** : applique +3 mauvaise main et la Force minimum strictement.
- **MJ auto** : strict.

**Statut** : 🟢 acté

### R-9.43 — Combat à cheval / sur monture

**Décision Q-D9.32 (2026-04-25)** : choix D — hybride règle vivante par mode arbitre.

#### A. Atouts et compétences clés (catalogue intégré)

| Atout/Compétence | Effet | Source |
|---|---|---|
| **Maîtrise équestre** | +Niveau aux dés pour toute manœuvre équestre. (permanent) | Atout Cavalier (classe) |
| **Équitation** (compétence D5) | Compétence pour conduire la monture. | Compétence |
| **Charge (cheval)** | +3 dégâts (R-9.13) sur l'attaque effectuée pendant une charge équestre. | Modificateur de circonstance |

#### B. Item-type `mount` (extension R-9.30)

```yaml
mount:
  species: <ref race>             # cheval, ours, dragon, griffon, etc.
  base_speed_m_per_dt: <float>    # vitesse de la monture
  carry_capacity_kg: <float>      # capacité de charge
  combat_capable: bool             # peut attaquer en combat ?
  attacks: [unarmed_attack]        # ruades, morsures, griffes
  vitality_max: <int>
  speed_factor: <int>
  rider_position: <enum>           # selle, dos nu, poste, etc.
```

#### C. Mécaniques en combat équestre

##### Hauteur tactique
- Cavalier en mêlée vs piéton : +1 dé attaquant ou −1 difficulté (R-9.40 A équivalent flanc).
- Tirer à l'arc/arbalète depuis une monture en mouvement → action multiple D1 R-1.12 (course de la monture + tir).

##### Désarçonner
- Manœuvre = `Force + Lutte/Bagarre + spécialisations` ou attaque dédiée.
- Réussite : le cavalier tombe (état `prone`, R-9.27) et perd ses initiatives en cours.
- Modificateur monture : +Niveau Maîtrise équestre aux jets de résistance du cavalier.

##### Tirer à l'arc en mouvement
- Tir depuis un cheval au galop → action multiple D1 R-1.12 (+1 difficulté).
- Atouts comme **Précision** (Cavalier/Archer) compensent partiellement.

##### Monter/descendre
- Action standard FV DT.
- Avec Maîtrise équestre : action improvisée FV DT possible (cf. niveau).

##### Blessure de la monture
- Suit la machine d'état R-9.17 (KO, mort) avec ses propres seuils.
- Si la monture est KO → cavalier auto-désarçonné (état `prone`).
- Si la monture meurt → cavalier subit une chute selon vitesse + R-9.13 (chute humanoïde +2 dégâts) cumulé avec vitesse de la monture.

#### D. Équipement équestre

Item-type `equestrian_gear` :
- `selle` : confort, stabilité, +1 résistance aux désarçonnements.
- `selle de guerre` : +2 résistance aux désarçonnements, place pour lance de cavalerie.
- `lance de cavalerie` : arme spéciale, dégâts décuplés en charge équestre, ne fonctionne que monté.
- `barde` (armure de monture) : protection P/E/C/T pour la monture (équivalent armor_piece pour mount).
- `étrier`, `bride`, `mors` : équipement de contrôle, modificateurs au jet d'Équitation.

#### E. Application par mode arbitre

- **MJ humain** : peut autoriser des manœuvres équestres exotiques (saut au-dessus d'obstacle, attaque en passant, etc.).
- **MJ LLM** : applique les règles standard, propose les manœuvres pertinentes.
- **MJ auto** : strict — applique chaque manœuvre selon le catalogue.

**Statut** : 🟢 acté

### R-9.44 — Coup de grâce, achèvement, reddition, interrogatoire

**Décision Q-D9.32 (2026-04-25)** : choix D — hybride règle vivante par mode arbitre.

#### A. Coup de grâce (achever un adversaire au sol/inconscient)

**Mécanique** :
- Cible doit être : `unconscious` OR `prone` + `restrained` OR `dying` (R-9.27, R-7.20).
- Action conservée FV DT (le coup vise précisément, prend du temps).
- Aucun jet de toucher requis (réussite automatique sauf circonstances exceptionnelles).
- Dégâts : maximum théorique de l'arme (toutes réussites maximales).
- Application immédiate des règles tête/gorge si zone visée (R-9.15) → souvent mort instantanée.

**Conditions d'interruption** :
- Si l'attaquant subit une attaque pendant ces FV DT, son coup de grâce devient une action standard (R-1.12 conservée) avec difficulté augmentée.
- Si la cible se réveille / sort de son état avant la résolution, le coup de grâce est perdu (FV DT investis perdus).

#### B. Reddition

**Mécanisme** :
1. Toute partie peut proposer une reddition à n'importe quel DT.
2. La partie adverse a deux options :
   - **Accepter** : combat terminé selon condition `peace_offered` (R-9.37 E).
   - **Refuser** : combat continue.
3. La proposition de reddition est une **action gratuite** (0 DT) si elle est verbale et brève.
4. Une partie qui rend les armes mais n'est pas acceptée peut être considérée comme `surrendered` (état tactique R-9.27, à proposer si manquant) — pas d'attaque active, défense uniquement.

**Conséquences narratives** :
- Reddition acceptée → captifs, otages, négociations.
- Reddition trahie (attaquant frappe une cible qui s'est rendue) → impact moral/réputation, possible état `dishonored` selon mode.

#### C. Interrogatoire et torture

**Mécanique** : sort du cadre combat strict mais peut survenir en transition combat → narratif.

- **Intimidation** : `Charisme + Intimidation + spécialisations` vs `Volonté` (test D20 D2).
- **Torture physique** : chaque tour de torture inflige des dégâts contendants/tranchants, applique état `affaibli` (D2) ou `restrained`. Test D20 de volonté chaque session.
- **Sorts d'interrogatoire** : Magie blanche/violet/jaune (Détection de mensonge, Sérum de vérité, Interrogatoire mental). Cf. D8 grimoire.
- **Atouts** : `Anti-délivrance` (Hors-la-loi/Malfaisant) déduit niveau aux malus d'affaiblissement de la cible torturée — outil d'interrogatoire prolongé.

#### D. Prise d'otage

**Mécanique** :
- Attaquant en mêlée + cible immobilisée (état `grappled` ou `restrained`) avec arme tranchante/perforante au cou.
- Cible : état `hostage` (R-9.27, à proposer si manquant) → ne peut pas agir sans risquer la mort.
- Toute attaque sur l'attaquant pendant cet état risque de provoquer la mort de l'otage (jet d'opposition Réflexes vs Réflexes).
- État résolu par : libération volontaire, mort de l'otage, neutralisation de l'attaquant via un coup furtif (sort, tireur d'élite hors mêlée, etc.).

#### E. Application par mode arbitre

- **MJ humain** : libre, peut surcharger les conséquences narratives (notamment trahison de reddition).
- **MJ LLM** : applique les règles standard, propose des descriptions narratives.
- **MJ auto** : strict — applique mécaniquement coup de grâce, reddition acceptée/refusée, état hostage.

**États tactiques associés à proposer si manquants au catalogue R-9.27** :
- `surrendered` : cible qui s'est rendue, ne combat plus.
- `hostage` : cible utilisée comme bouclier humain.
- `dishonored` : conséquence narrative de trahison de reddition.

**Statut** : 🟢 acté

---

## Partie H — Questions ouvertes

### ~~Q-D9.1~~ — Architecture du flux de combat (initiative, déclaration, file d'actions) ✅ **Tranché (2026-04-25)**

Choix C : flux DT legacy conservé, timeline digitale triée par `nextActionAt`, sans jet d'initiative fixe.

### ~~Q-D9.2~~ — Interruption d'action : DT investis perdus ou récupérables ? ✅ **Déjà tranché (D1 R-1.25)**

Les DT déjà investis sont perdus ; aucune récupération partielle par défaut.

### Q-D9.3 — Bouclier actif et passif : portée exacte de la déviation

✅ **Tranché (2026-04-25)** : choix C.

- Bouclier actif = contre-action défensive `Dextérité + Bouclier + ...`.
- Bouclier passif = chance de déviation totale après toucher confirmé.
- `P/E/C/T` du bouclier = coups visant le bouclier ou cas spéciaux, pas réduction passive standard.

### Q-D9.4 — Armures : couverture des zones et cumul des couches

✅ **Tranché (2026-04-25)** : choix C, avec interdiction de porter plus d'une armure par couche sur une même zone.

### Q-D9.5 — Mapping zones touchées → pièces d'armure

✅ **Tranché (2026-04-25)** : choix C.

Mapping standard par type de pièce, surcharge possible par item.

### Q-D9.6 — Zone touchée : aléatoire, ciblée, ou hybride ?

✅ **Tranché (2026-04-25)** : choix C.

Par défaut D100 ; ciblage possible comme action précise avec difficulté augmentée. Si l'action précise annoncée rate, le coup est raté totalement.

### Q-D9.7 — Armes à plusieurs types de dégâts : choix ou cumul ?

✅ **Tranché (2026-04-25)** : choix C.

Le type d'attaque effectué définit le type de dégât.

- Si la table indique un choix (`T/P`, `C/P`, `T/C`, ou mention "à choix"), l'attaquant choisit le mode d'utilisation de l'arme pour ce coup. Ce choix détermine le type de dégât principal.
- Si la table indique un bonus additionnel (`+1 C`, `+2 P`, `+1 E`, etc.), ce bonus est un dégât additionnel séparé, résolu contre sa propre protection P/E/C/T.

Exemples :
- Godendac `C/P` : coup contendant ou perforant, selon la manière d'attaquer.
- Hallebarde `T/P` : coup tranchant ou perforant, selon la manière d'attaquer.
- Torche `C F+1 +1 E` : dégâts contendants principaux + dégât énergétique additionnel.

### Q-D9.8 — Dégâts multi-types : regroupement après protection

✅ **Tranché (2026-04-25)** : choix C.

Une attaque produit une blessure unique avec composantes typées. Les protections/résistances s'appliquent par type, puis les dégâts restants sont regroupés pour former une seule blessure finale avec un seul jet d'endurance si autorisé, puis un seul modificateur de zone, sauf règle spéciale.

### Q-D9.9 — Résistances : ordre d'application avec armure et endurance

✅ **Tranché (2026-04-25)** : choix C.

Les résistances en `%` sont testées avant les dégâts concernés ; succès = composante/effet ignoré. Les résistances `+1C`, `+1E`, etc. sont des protections naturelles P/E/C/T dans la couche `natural`.

### Q-D9.10 — Dégâts subis et retard d'action en DT

✅ **Tranché (2026-04-25)** : choix A.

Chaque point de dégât final subi retarde l'action en cours ou la prochaine action de `+1 DT`.

### Q-D9.11 — Seuils d'évanouissement/mort : avant ou après endurance ?

✅ **Tranché (2026-04-25)** : choix B.

Les seuils d'évanouissement/mort se calculent sur les dégâts finaux réellement subis. Attention : tête/gorge/yeux sont doublés après toutes les déductions autorisées ; gorge et yeux ne sont pas endurables.

### Q-D9.12 — Coups simultanés : regroupement pour seuils de réaction

✅ **Tranché (2026-04-25)** : choix C.

Évanouissement général : total global des dégâts simultanés. Seuils tête/gorge : regroupement seulement sur la zone concernée.

### Q-D9.13 — Atout « Jusqu'à la mort » : quels seuils ignore-t-il ?

✅ **Tranché (2026-04-25)** : choix C.

Le personnage ignore mort par seuil et évanouissement biologique par choc, mais garde les limitations mécaniques du corps. À vitalité 0, il meurt/est détruit.

### ~~Q-D9.14~~ — Tables de touches multiples : sélection de la table active ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante par mode arbitre. Catalogue versionné de tables, sélection contextuelle par mode (humain libre / LLM recommandation / auto déterministe), surcharge par item/sort/effet autorisée.

### ~~Q-D9.15~~ — Distance et portée des armes ✅ **Tranché (2026-04-25)**

Choix D — hybride catégorie + valeur numérique, comportement par mode arbitre.

Stockage par arme : portée nominale en mètres + catégories (courte/moyenne/longue/extrême + impossible). Catalogue éditable (règle vivante). Application différenciée selon le mode arbitre. Cumul avec D1 R-1.36 (modificateurs de circonstance : vent, obscurité, mouvement, taille cible).

Voir R-9.24 pour la mécanique complète.

### ~~Q-D9.16~~ — Munitions : gestion stock et qualité ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante par mode arbitre.

Stock numérique par type de munition + catalogue de qualités vivant + comportement par mode (humain libre/abstrait, LLM rappelle stock et qualités, auto strict). Récupération après combat paramétrable. Migration des persos en cas d'évolution du catalogue. Voir R-9.25 pour la mécanique complète.

### ~~Q-D9.17~~ — Durabilité des armes et armures ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante paramétrable par campagne. Trois modes : arcade (aucune durabilité), standard (casse sur échec critique uniquement), réaliste (pool de points de durabilité). Arbitre peut surcharger ponctuellement. Voir R-9.26 pour la mécanique complète.

### ~~Q-D9.18~~ — États tactiques en combat ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante par mode arbitre. Catalogue éditable d'états tactiques. Chaque état = nom + durée DT + modificateurs + immunités + interactions. Application par mode (humain libre / LLM contextuel / auto strict). Migration des persos. Voir R-9.27 pour la mécanique complète.

### ~~Q-D9.19~~ — Renforts et invocations en cours de combat ✅ **Tranché (2026-04-25)**

Choix D — hybride 3 sources + règle vivante par mode arbitre. 3 voies de spawn : MJ humain manuel + déclencheurs scriptés + invocations magiques (école Invocation D8). Catalogue de templates de spawn (vagues, escouades, individuels). Limite globale par scène configurable. Application par mode arbitre. Voir R-9.28 pour la mécanique complète.

### ~~Q-D9.20~~ — Transformations de race en cours de combat ✅ **Tranché (2026-04-25)**

Choix A — action unique de 50 DT, vulnérable et inactif. La transformation est une action conservée (D1 R-1.12) pendant laquelle le perso ne peut rien faire d'autre, ne peut pas esquiver/parer activement, et perd son tour. Si interrompu (KO, mort, dispel), la transformation échoue. Voir R-9.29 pour la mécanique complète.

### ~~Q-D9.21~~ — Catalogue d'armes et de protections : type-classes dynamiques ✅ **Tranché (2026-04-25)**

Choix D — type-classes dynamiques (méta-modèle). Système de classes d'items où chaque type définit ses champs et règles, et chaque instance les remplit. Admin/MJ peut créer de nouveaux types d'items. Migration item-type-aware. Voir R-9.30 pour la mécanique complète. Cette décision clôture les statuts 🟡 de R-9.19 et R-9.20.

### ~~Q-D9.22~~ — Sorts en combat : seuils, ciblage, AOE, contre-sort ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : seuils paramétrables + flux canonique + AOE par sort. Voir R-9.31 pour la mécanique complète.

### ~~Q-D9.23~~ — Déplacement et positionnement en combat ✅ **Tranché (2026-04-25)**

Choix hybride B+C (selon précision auteur) : zones abstraites + vitesse numérique, avec :
- modificateurs de terrain qui altèrent la zone de déplacement effective ;
- UI : visualisation de la zone max atteignable en surbrillance pendant le déplacement ;
- intégration native du système de charge (rappel D2 : 5 kg/point de Force avant pénalité de +1 FV par tranche).

Voir R-9.32 pour la mécanique complète.

### ~~Q-D9.24~~ — Soins en combat ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : catalogue + règles standard + mode arbitre. Voir R-9.33 pour la mécanique complète.

### ~~Q-D9.25~~ — Poisons en combat ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : double échelle DT/narratif + catalogue. Item-type `poison` extension R-9.30. Catalogue éditable adapté du PDF Harold (14 poisons réels). Voir R-9.35 pour la mécanique complète.

### ~~Q-D9.26~~ — Attaques multi-cibles d'un seul coup ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : `area_attack` sur l'arme + cumul D1 R-1.12. Voir R-9.36 pour la mécanique complète.

### ~~Q-D9.27~~ — Fuite et poursuite ✅ **Tranché (2026-04-25)**

Choix D + prise en charge native des paramètres et atouts d'évasion (notamment l'orientation Hors-la-loi qui possède de nombreux atouts dédiés). Voir R-9.37 pour la mécanique complète.

### ~~Q-D9.28~~ — Désengagement de mêlée approfondi ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : 3 modes + atouts dédiés. Voir R-9.38 pour la mécanique complète.

### ~~Q-D9.29~~ — Round de surprise / embuscade ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : niveaux + atouts dédiés + couplage R-9.27. Voir R-9.39 pour la mécanique complète.

### ~~Q-D9.30~~ — Tactique de groupe ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : 5 modules tactiques activables par campagne + atouts dédiés reconnus. Voir R-9.40 pour la mécanique complète.

### ~~Q-D9.31~~ — Bilan D9 et clôture ✅ **Tranché (2026-04-25)** : ouverture de Q-D9.32 pour traiter en lot 4 sujets d'approfondissement (mains nues, deux armes, monture, coup de grâce/reddition).

### ~~Q-D9.32~~ — Approfondissements en lot ✅ **Tranché (2026-04-25)**

L'auteur a demandé d'appliquer le pattern hybride règle vivante (option D, par cohérence avec le reste de D9) aux quatre sujets simultanément :

- **R-9.41** — Combat à mains nues, lutte, saisies, désarmement (compétences Bagarre/Lutte, atouts Corne aux mains, manœuvres canoniques, créatures multi-membres).
- **R-9.42** — Combat avec deux armes, ambidextrie, armes à deux mains (pénalité +3 mauvaise main, atout Ambidextrie, Force minimum sur arme à 2 mains, cas multi-membres).
- **R-9.43** — Combat à cheval / sur monture (atout Maîtrise équestre, item-type `mount`, hauteur tactique, désarçonnement, équipement équestre).
- **R-9.44** — Coup de grâce, reddition, interrogatoire, prise d'otage (mécanique d'achèvement automatique, conditions de reddition, états tactiques associés).

Tous appliquent le pattern règle vivante par mode arbitre (humain libre / LLM contextuel / auto strict).

---

## Partie I — Backlog D9 (champs ouverts à trancher ultérieurement)

> Cette partie regroupe les points pertinents identifiés mais **non tranchés** dans la session actuelle. Chaque point est un champ ouvert de décision (`Q-D9.X — 🟡 backlog`) avec source documentée. Ils peuvent être ouverts à tout moment dans une session future, soit avant D10, soit en parallèle d'autres domaines, soit après refonte.

### Q-D9.33 — 🟡 Combat sous l'eau / aquatique

**Contexte** : R-9.32 C donne un modificateur de terrain pour eau peu profonde (× 0.5) et nage profonde (× 0.4), mais la **mécanique de combat aquatique** (perte d'air, jet de Natation, malus aux armes tranchantes/perforantes selon la résistance de l'eau, propulsion de projectiles) n'est pas formalisée.

**Sources à creuser** : compétence Natation (D5), atouts comme Apnée, monstres aquatiques du bestiaire, sorts élémentaires aquatiques (D8 Élémentaliste).

**Décision attendue** : étendre R-9.32 ou créer R-9.45 avec couches `medium: air | water | underwater | submerged_in_X`.

### Q-D9.34 — 🟡 Combat acrobatique / sur cordes / suspendu

**Contexte** : modificateur de terrain `escalade verticale × 0.3` (R-9.32 C), mais combat actif en suspension (sur cordage, branche, falaise) non traité. Atout `Atterrissage` mentionne chute amortie de 1m/niveau.

**Sources** : compétence Acrobatie/Gymnastique (D5), atouts ninjas/voleurs (Hors-la-loi), atouts Pas d'araignée, Ancrage.

**Décision attendue** : modificateurs spécifiques + risque de chute sur échec critique.

### Q-D9.35 — 🟡 Combat dans l'obscurité totale

**Contexte** : R-9.32 C donne `obscurité totale × 0.4` pour le déplacement, mais le combat à l'aveugle (sans vue) n'a pas de mécanique formelle. Atout `Détection des coups portants` requiert vue → impose la nécessité de définir les autres sens.

**Sources** : atouts Vision nocturne, Vision dans le noir, Ouïe affutée, Odorat développé, sorts de lumière/obscurité.

**Décision attendue** : couche sensorielle (vue/ouïe/odorat/sens vibratoire) + table de modificateurs par sens disponible vs perdu.

### Q-D9.36 — 🟡 Combat improvisé avec objets non-armes (chaise, bouteille, échelle)

**Contexte** : action improvisée D1 R-1.12 (+1 difficulté) couvre le principe, mais les **dégâts** d'un objet non-arme ne sont pas définis. Le legacy parle de poids et matière (cuir, fer, acier elfique).

**Décision attendue** : table de dégâts par catégorie d'objet improvisé + table de durabilité (R-9.26) liée au matériau.

### Q-D9.37 — 🟡 Sorts vs sorts en duel magique

**Contexte** : R-9.31 traite l'incantation, l'interruption, le ciblage, l'AOE et les contre-sorts. Mais le **duel magique** spécifique (deux magiciens qui se contre-incantent simultanément, opposition de tier, miroir magique) n'est pas formalisé.

**Sources** : école Abjuration (Captage d'énergie, Ralentissement magique, Complexité magique), atouts Persistance magique.

**Décision attendue** : règles de tier-vs-tier, miroir, déflexion mutuelle, escalade de l'incantation.

### Q-D9.38 — 🟡 Monstres avec multiples attaques par DT (hydre, créature multi-gueules)

**Contexte** : R-9.41 E couvre les multi-membres pour les armes, mais une **hydre** ou un dragon avec plusieurs gueules indépendantes n'a pas de modélisation.

**Décision attendue** : champ `attack_routines: [...]` sur les créatures du bestiaire, chaque routine ayant son propre `nextActionAt`.

### Q-D9.39 — 🟡 Combat de masse / champ de bataille (abstraction)

**Contexte** : R-9.28 limite à 20 entités simultanées. Au-delà, comment représenter une bataille de 200+ combattants ? Abstraction par escouades, jets agrégés, simulation accélérée.

**Décision attendue** : item-type `unit` (escouade abstraite) avec stats agrégées + règles de transition entité ↔ unit.

### Q-D9.40 — 🟡 Combat contre incorporel / éthéré

**Contexte** : atout `Immatérialité` (lexique l532) : « le perso peut être vu mais pas touché ». Forme brume R-9.29 partage cette propriété.

**Décision attendue** : couche d'interaction physique vs magique vs spirituelle. Quels coups passent ? Sorts d'arme spectrale ? Atouts permettant d'interagir.

### Q-D9.41 — 🟡 Combat avec entités à taille très différente

**Contexte** : Hobbit vs Ogre/Troll/Géant. Taille déjà encodée via multiplicateurs raciaux pour armures (R-9.20). Mais en combat : zones de touche, portée de mêlée, modificateurs.

**Décision attendue** : table d'écarts de taille → modificateurs (mêlée, attaque, esquive, portée). Lien R-9.21 tables de touches par taille.

### Q-D9.42 — 🟡 Combat sous effet de drogues / alcool / sorts modificateurs d'état

**Contexte** : atout `Alcool violent` (lexique l62) — combat ivre = +1 dé en Force ou Endurance par niveau. D'autres atouts/sorts altèrent les stats temporairement.

**Décision attendue** : règle générale d'application des modificateurs d'état (R-9.27) sur les jets, déjà traité partiellement, mais besoin de formaliser pour les substances.

### Q-D9.43 — 🟡 Manœuvres spéciales : feinte, intimidation tactique, distraction

**Contexte** : non traité explicitement. Lien D5 Charisme/Intimidation, atouts comme `Bluff`, `Feinte d'épée`.

**Décision attendue** : item-type `combat_maneuver` avec coût en DT, jet, effet (status R-9.27 type `surprised_partial`, `distracted`, `intimidated`).

### Q-D9.44 — 🟡 Combat aérien (volant vs terrestre)

**Contexte** : sorts de vol (D8 Altération, Magie blanche), créatures volantes (dragons, griffons, harpies). Hauteur tactique R-9.43 mais pas combat aérien spécifique.

**Décision attendue** : règles de combat 3D (altitude, montée/descente, plongée pour charger), modificateurs pour terrestre vs aérien.

### Q-D9.45 — 🟡 Sièges et engins de guerre (catapulte, baliste, bélier)

**Contexte** : équipement de siège non traité. Lien R-9.30 (item-type custom) + ingénierie/artillerie.

**Décision attendue** : item-type `siege_engine` avec stats spécifiques (équipage, temps de visée, dégâts massifs, rayon d'effet).

### Q-D9.46 — 🟡 Système de rage / berserk / second souffle

**Contexte** : atout `Folie furieuse` (Berzerker classe), `Fureur guerrière` (Barbare classe), `Adrénaline` (lexique l47). Modificateurs aux stats pendant combat.

**Décision attendue** : item-type `combat_state_modifier` (déjà couvert par R-9.27 ?). Préciser activation, durée, conditions de fin, retour à la normale.

### Q-D9.47 — 🟡 Combat avec familiers / compagnons animaux

**Contexte** : familier = atout permanent du Magicien (D8). Mais le **combat coordonné** entre maître et familier (commandes en DT, partage d'initiative, ordre tactique) n'est pas traité.

**Décision attendue** : règles de contrôle + initiative liée + portée de communication mentale (lien D8 Magie blanche/Enchantement).

### Q-D9.48 — 🟡 Atout `Détection des coups portants` : mécanique exacte

**Contexte** : lexique l335 : « le perso a un instinct qui lui indique automatiquement si un coup donné dans sa direction en corps à corps le touchera ou non ». Conséquence en termes de timeline : le perso peut **changer son action** en réaction à l'information.

**Décision attendue** : flux exact (le perso reçoit l'info à quel moment du DT ? quelle action peut-il déclarer en réaction ?).

### Q-D9.49 — 🟡 Atout `Pressentiment de la cible` : mécanique exacte

**Contexte** : lexique l868 : « son instinct lui indique infailliblement lorsqu'un projectile, coup, ou autre forme d'agression en vienne à le heurter (même s'il ne peut le voir ou s'il est endormi) ». Cas particulier : déclencheur en sommeil.

**Décision attendue** : intégration avec R-9.39 (surprise) — `Pressentiment de la cible` annule-t-il `surprised_total` ? Mécanique de réveil.

### Q-D9.50 — 🟡 Critique aggravée selon zone touchée

**Contexte** : R-9.15 (zones tête/gorge/yeux × 2 dégâts). R-1.34 (échec critique D100). Pas d'interaction documentée entre **réussite critique** et **zone**. Ex. réussite critique sur l'œil → aveuglement permanent ?

**Décision attendue** : table de critique par zone, conséquences narratives et mécaniques (état permanent).

### Q-D9.51 — 🟡 Combat avec arme magique « vivante » ou intelligente

**Contexte** : épées légendaires avec personnalité (Excalibur, Stormbringer-like). Volonté propre, communication avec porteur, refus de servir.

**Décision attendue** : item-type `intelligent_weapon` avec stats Charisme/Volonté + règles de soumission/négociation entre porteur et arme.

### Q-D9.52 — 🟡 Combat en gravité altérée (lévitation, pesanteur magique, espace)

**Contexte** : sorts d'Altération (lévitation, allègement, pesanteur). Modifie déplacement (R-9.32) mais pas combat.

**Décision attendue** : modificateurs aux jets (force inutile en apesanteur, déplacement libre 3D).

### Q-D9.53 — 🟡 Push / Pull / magnétisme / attraction-répulsion

**Contexte** : atout `Répulsion` (lexique l935), sorts de Télékinésie, magnétisme magique.

**Décision attendue** : règles de mouvement forcé (déplacement involontaire de cible), résistance par Force.

---

## Partie J — Méta : statut de cohérence avec D1-D8 et anticipation D10-D13

D9 fait référence aux décisions de D1-D8 et anticipe D10 (Équipement), D11 (Contrôle PNJ), D12 (Géographie/Social/Économie), D13 (Rôles MJ↔PJ) :

| Référence | Direction | Sujet |
|---|---|---|
| D1 R-1.2/12/25/34/36/40 | ⬅ rappel | Action standard, types d'action, interruption, échec critique, modificateurs |
| D2 R-2.10/17 | ⬅ rappel | Repos/vitalité, malus d'affaiblissement |
| D3 Q-D3.7-3.8 | ⬅ rappel | Transformations, résistances |
| D4 R-4.9 | ⬅ rappel | Orientations / classes / atouts |
| D5 (compétences) | ⬅ rappel | Bagarre, Lutte, Médecine, Équitation, Discrétion |
| D6 Q-D6.4 | ⬅ rappel | Templates PNJ pour spawn (R-9.28) |
| D7 R-7.16/17/18/20/21 | ⬅ rappel | Transformations math, machine d'état mort/mourant, résurrection |
| D8 R-8.6/7/19/20 | ⬅ rappel | TI, concentration, jet d'aptitude brute, système temps double |
| **D10 (Équipement)** | ➡ amont | R-9.30 (méta-modèle items) prévu pour héberger tout l'équipement non-combat (vêtements civils, outils, instruments, livres, etc.) |
| **D10 (Équipement)** | ➡ amont | R-9.19/20/25/35/36 fournissent les item-types `weapon_*`, `armor_piece`, `shield`, `ammunition`, `poison`, `unarmed_attack` |
| **D11 (Contrôle PNJ)** | ➡ amont | R-9.28 (spawn) et le modèle d'arbitre (humain/LLM/auto) à approfondir |
| **D12 (Géographie/Économie)** | ➡ amont | R-9.32 (déplacements, terrain) et R-9.26 (durabilité, coût de réparation) seront étendus |
| **D13 (Rôles MJ↔PJ)** | ➡ amont | Mode arbitre récurrent (humain/LLM/auto) à formaliser globalement
