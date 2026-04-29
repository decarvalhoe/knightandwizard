# D8 — Magie (11 écoles, sorts, énergie, TI, familiers)

> Système magique du jeu. 11 écoles, ~889 sorts catalogués (web), magicien comme orientation exclusive (sauf exceptions D4 R-4.9), familiers, mécanique de drain et de captage. Reprend les règles déjà actées en D1 (résistance), D2 (énergie), D4 (orientation magicien), D5 (apprentissage), D7 (résurrection).

**Sources** :
- [documents/regles/index.md:91-134](documents/regles/index.md) — section Magie + Énergie + TI + Familier + Repos
- [documents/grimoire/index.md](documents/grimoire/index.md) — 2621 lignes, 11 écoles, ~889 entrées (web canonique)
- [regles-papier/extracted/listes/grand-grimoire.md](regles-papier/extracted/listes/grand-grimoire.md) — version paper (448 lignes, plus condensée)
- [regles-papier/extracted/listes/lexique.md](regles-papier/extracted/listes/lexique.md) — atouts liés à la magie
- [regles-papier/extracted/listes/atouts-de-niveaux.md](regles-papier/extracted/listes/atouts-de-niveaux.md) — atouts magiciens par niveau
- [site/includes/managers/_DBManager.php:820-851](site/includes/managers/_DBManager.php) — `getAllSpells`, `insertSpell`

---

## Partie A — Principes fondamentaux

### R-8.1 — Définition de la magie

**Énoncé legacy** ([regles:91-93](documents/regles/index.md)) :

> La magie consiste à canaliser les énergies pour les rediriger de telle manière à créer un effet que l'on appelle "sort". Les seules personnes capables de les lancer, se nomment les **magiciens**. Ce qui ne signifie pas que ce sont les seuls à pouvoir faire des rituels, comme pour construire un objet magique par exemple.

**Statut** : 🟢 claire

### R-8.2 — Engagement à vie de la voie magique

**Énoncé legacy** ([regles:92-93](documents/regles/index.md)) :

> Un personnage qui n'est pas magicien à la base, ne peut en aucun cas le devenir par après. Alors qu'un magicien lui peut décider d'**abandonner la magie**. Un lanceur de sorts ayant tourné le dos aux énergies, ne peut décider de redevenir magicien par la suite.

**Statut** : 🟢 claire (cf. D6 R-6.3)

**Exceptions au principe** (cf. D4 R-4.9) :
- **Vampire + Art occulte** (atout racial N2) : non-magicien acquiert un sort + 40 energy
- **Polyvalence** : non-magicien peut accéder aux atouts magiciens d'autres orientations
- **Effets liés à la race** : Dryade (Lingua vegetalis, Vegothropie), Ondine (Chant envoûtant) — mécaniques magico-inspirées sans nécessiter l'orientation magicien

### R-8.3 — Les 11 écoles de magie

**Énoncé legacy** ([regles:94-106](documents/regles/index.md)) :

> Il existe 11 sources d'énergie qui donnent lieu à 11 types de magies, avec chacune leurs couleurs et leurs magiciens.

| # | École | Couleur | Magicien spécialiste | Source d'énergie / domaine |
|---|---|---|---|---|
| 1 | Abjuration | Jaune | Abjurateur | Anti-magie : annule, dévie, perturbe les sorts d'autrui |
| 2 | Altération | Rouge | Altérateur | Évolution / changement / transformation physique |
| 3 | Magie blanche | Blanc | Clerc | Vibrations positives : restaure, protège, augmente |
| 4 | Divination | Brun | Devin | Temps et réalité : informations, perception |
| 5 | Enchantement | Turquoise | Enchanteur | Désir et espoir : contournement de la réalité |
| 6 | Élémentaire | Bleu | Élémentariste | Feu, air, terre, eau, roche, foudre, lave, glace, fumée |
| 7 | Illusion | Violet | Illusionniste | Esprit : fausse réalité |
| 8 | Invocation | Orange | Invocateur | Espace : juxtaposer lieux/distances pour invoquer |
| 9 | Magie naturelle | Vert | Druide ou Chaman | Organique et vie : alliance avec la nature |
| 10 | Magie noire | Noir | Sorcier | Vibrations négatives : dégrade, affaiblit, diminue |
| 11 | Nécromancie | Gris | Nécromancien | Mort : contrôle des morts |

**Tous les magiciens peuvent lancer n'importe quel sort** ([regles:106](documents/regles/index.md)). Les magiciens spécialisés ont juste **plus de facilité** sur les sorts de leur école (-1 difficulté via l'atout permanent de classe « Magie X »).

**Statut** : 🟢 claire

---

## Partie B — Modèle de données d'un sort

### R-8.4 — Schéma d'un sort

D'après le Grand Grimoire, chaque sort a les attributs suivants :

| Attribut | Description | Type |
|---|---|---|
| `name` | Nom du sort | string |
| `school` | École (Abj, Alt, Bla, Bru, Ble, Enc, Ill, Inv, Nat, Noi, Nec) | enum |
| `energy_cost` | Coût en points d'énergie pour lancer | int ≥ 0 |
| `incantation_time` | TI — Temps d'Incantation en DT (R-8.6) | int ≥ 1 |
| `difficulty` | Difficulté convenue du jet | int (peut > 9, R-1.20) |
| `effect` | Description courte de l'effet | text |
| `value` | Valeur (richesse) du sort, ex: prix d'achat ou de vente | int |
| `description_full` | Description complète (lexique) | text (optionnel) |
| `direct_magic` | Booléen : cible vivante directement (oui/non), pour résistance magique R-1.33 | bool |
| `damage_type` | Si dégâts : P/E/C/T (R-1.32) | enum nullable |
| `range` | Portée (mètres / rayon) — souvent paramétrée par niveau du lanceur | string |
| `duration` | Durée d'effet (souvent en min/niveau ou DT/réussite) | string |

**Statut** : 🟢 claire

**Source** : `_DBManager.php:formatSpellArray` (à confirmer en code) + Grand Grimoire (paper et web).

### R-8.5 — Lancement d'un sort (rappel D1 R-1.4)

**Pool de dés** :
```
pool = Intelligence + points dans le sort
```

**Pas de compétence d'utilisation** — les sorts ne sont pas des compétences (cf. D5 R-5.6-bis). Pas de spécialisations sur les sorts.

**Difficulté** : la difficulté convenue du sort, modifiable par les modificateurs habituels (D1 R-1.36) :
- Atout « Magie X » de la classe magicien spécialiste : -1 sur les sorts de l'école
- Atout « Énergie à l'honneur » : -1 sur une école choisie pendant 10 min/niveau (Magicien N4)
- Atout « Énergie au déshonneur » (abjurateur N4) : +1 sur une école adverse (saboté)
- Magie à l'honneur de race élémentaliste : -1 sur l'élément correspondant
- Atouts qui touchent l'école : -1 (Maîtrise de l'énergie N15)
- Modificateurs de circonstances habituels (R-1.11)

**Modèle de difficulté > 9** (R-1.20) : la plupart des sorts puissants ont une difficulté ≥ 10 (« 9 8 », « 9 9 5 », etc.). Le système d'empilement s'applique.

**Statut** : 🟢 claire

---

## Partie C — Temps d'Incantation et concentration

### R-8.6 — TI (Temps d'Incantation)

**Énoncé legacy** ([regles:113-119](documents/regles/index.md)) :

> Abrévié TI, le temps d'incantation représente le temps nécessaire à l'incantation d'un sort, en **DT** (division de temps, 0,2 s par DT). Il s'agit d'un laps de temps durant lequel le magicien récitera une formule magique et effectuera un mouvement de la main.

**Modèle** :
- TI exprimé en DT (1 DT = 0,2 s, R-1 / R-2.13)
- Variable selon le sort : de 4 DT (sorts simples) à 192 DT (Contact divin) — soit 0,8 s à ~38 s
- Pendant l'incantation, le magicien est **vulnérable** (concentration requise, R-8.7)

**Statut** : 🟢 claire

### R-8.7 — Concentration et interruption

**Énoncé legacy** ([regles:115-116](documents/regles/index.md)) :

> Pendant cette période [le TI], la concentration du personnage ne doit pas être perturbée. Ce qui signifie que si quelqu'un d'autre le bouscule ou le fait taire, **le sort sera annulé avant même d'avoir été lancé**. Dans ce cas, **les points d'énergies dépensés sont perdus**.
>
> Pour relancer un sort annulé, il faut reprendre celui-ci depuis le début.

**Mécanique** :
- Un sort interrompu (bousculade, son, dégâts subis) → **annulation totale**
- Énergie dépensée = **perdue** (pas remboursée)
- Aucun effet ne se produit
- Le magicien doit recommencer depuis le début si il veut relancer

**Action conservée** (R-1.24) : un sort en cours **peut être conservé** si le magicien subit des dégâts — la difficulté du sort augmente alors de +1 par point de dégât subi pendant le TI (cf. règles d'action conservée, le magicien choisit de poursuivre malgré la perturbation).

**Statut** : 🟢 claire

### R-8.8 — Réduction du TI par dépense d'énergie

**Énoncé legacy** ([regles:117-119](documents/regles/index.md)) :

> Pour avoir plus de chances de réussir à lancer son sort (voir en être certain), le magicien a la possibilité de **diminuer son temps d'incantation**. Pour se faire, le lanceur devra dépenser **2 points d'énergie supplémentaires par division de temps (DT) en moins**. Une incantation ne peut être descendue en dessous du **facteur de vitesse du personnage**.

**⚠️ Divergence web/paper** déjà notée en sources.md :
- **Web (canonique)** : minimum = facteur de vitesse du perso
- **Paper** : minimum = **1 DT** (toujours possible)

**Décision** : web fait foi → minimum = `speedFactor` du magicien.

**Mécanique** :
```
TI_effectif = max(speedFactor, TI_base - DT_supprimées)
coût_énergie_total = energy_cost + 2 × DT_supprimées
```

**Exemple** : magicien FV=7, sort « Flèche de foudre » (TI=10, énergie=10) qui veut lancer en 7 DT (TI minimum = FV) → réduction de 3 DT → 16 énergie au total (10 + 2×3).

**Statut** : 🟢 claire

### R-8.9 — Atouts qui modifient le TI ou la concentration

**Atouts pertinents (lexique)** :

- **Anticipation magique** (Magicien N5 éph) : « Le magicien peut incanter un sort sans le lancer, celui-ci est alors anticipé. Une fois le sort anticipé, le magicien peut le lancer à tout moment **en 1 DT**. Le magicien peut anticiper 1 sort par niveau. »
- **Incantation silencieuse** (Magicien N3) : peut incanter sans bruit (utile pour furtivité)
- **Incantation stoïque** (Magicien N3) : peut incanter sans gesticulations (utile face à un ennemi qui voit les mouvements)
- **Persistance magique** (Magicien N3) : permet de re-lancer un sort déjà actif sans reprendre l'incantation depuis 0 (à valider)
- **Augmentation énergétique** (sort Abjuration) : augmente l'énergie d'un sort cible de 2/R
- **Ralentissement magique** (sort Abjuration) : prolonge le TI d'un sort cible de 2/R

**Statut** : 🟡 partielle — descriptions des atouts à vérifier ponctuellement

---

## Partie D — Énergie (rappel D2 R-2.11)

### R-8.10 — Modèle d'énergie consolidé

Déjà acté en D2 R-2.11 (extensible "exception est la règle") :

| Attribut | Source | Effet |
|---|---|---|
| `energyMax` base | Magicien orientation : 60. Non-magicien : 0. | Plafond standard |
| Progression XP | 3 XP par +1 (Experience.doc) | Augmente le plafond |
| Atout « Énergie latente » (Magicien N2 perm) | +3 × niveau d'atout par passage de niveau | Augmente le plafond |
| Atout « Art occulte » (Vampire N2 racial) | +40 (cumulable pour plusieurs sorts) | Cas exception : non-magicien acquiert energy |
| Potions d'énergie | Variables (D10) | Restaure ou ajoute temporairement |
| Atout « Débordement d'énergie » (Magicien N5 perm) | Permet de dépasser energyMax via potions ou drain | Pas de plafond de fait |
| Sort « Captage d'énergie » (Abjuration) | Vol d'énergie sur un magicien en cours d'incantation : +3 par R | Source temporaire |
| Sort « Don d'énergie » (Magie blanche) | Donne 3 d'énergie/R à une cible | Transfert volontaire |
| Atout « Sacrifice d'énergie » (Magicien N3 perm) | Drain d'énergie sur un autre magicien (1m/niveau) | Vol direct |
| Atout « Inversion des énergies » (Magicien N12 perm) | Lance des sorts en consommant la **vitalité** au lieu de l'énergie | Conversion énergie ↔ vitalité |
| Repos (R-2.11 confirmé R-2.10 révisé D3) | 8h = 100% restauration de `energy` jusqu'à `energyMax` | Récupération naturelle |

**Statut** : 🟢 claire

---

## Partie E — Variantes et développement de sort

### R-8.11 — Variantes de sort (mineur, majeur, masse, distance)

**Indice grimoire** : on voit dans le catalogue des variantes nommées :
- « Bouclier mineur » / « Bouclier » / « Bouclier majeur »
- « Branchies » / « Branchies de masse »
- « Bénédiction » / « Bénédiction de masse »
- « Barrière psychique » / « Barrière psychique de masse »
- « Corrosion » / « Corrosion de masse »

**Mécanique** : un sort peut avoir des variantes :
- **Mineur** : version simplifiée, moins puissante, moins coûteuse
- **(Standard)** : version normale
- **Majeur** : version améliorée, plus puissante, plus coûteuse
- **De masse** : affecte plusieurs cibles (1 cible/R typiquement)
- **De distance** : portée étendue

Chaque variante est un **sort distinct** dans le grimoire, avec ses propres énergie/TI/difficulté/effet.

**Statut** : 🟢 claire (modèle simple)

### R-8.12 — Développement de sort (atouts Magicien)

**Atouts** :
- **Développement** ([lexique:356](regles-papier/extracted/listes/lexique.md), Magicien) : *« Le magicien peut développer et apprendre un sort qu'il possède en sort mineur, majeur ou standard. Le temps du développement dure le double du temps d'apprentissage du sort sur lequel travaille le personnage. »* — coût XP web : 4000 (table de pondération)
- **Développement avancé** ([lexique:358](regles-papier/extracted/listes/lexique.md), Magicien) : étend à mineur, majeur, standard, **masse**, **distance**. Coût web : 5000.

**Mécanique** : un magicien qui maîtrise « Bouclier » (standard) peut le développer en « Bouclier mineur » ou « Bouclier majeur » via l'atout. Le développement consomme 2× le temps d'apprentissage normal du sort + un jet de développement.

**Statut** : 🟡 partielle — la mécanique de jet de développement n'est pas explicitée dans le lexique

---

## Partie F — Familier magique (règles retrouvées + table d'atouts)

### R-8.13 — Familier : entité magique distincte des compagnons/montures

**Sources principales** :
- [documents/regles/index.md:120-134](documents/regles/index.md) — règles générales : forme, vitalité, renaissance, mort.
- [documents/atouts/index.md:2290](documents/atouts/index.md) — règle complète de feuille, budget, coûts, atouts et handicaps.
- [data/catalogs/atouts-values.csv](../../data/catalogs/atouts-values.csv) — table générale des valeurs d'atouts utilisée pour le coût `valeur / 10`.

Le familier est un **suivant magique lié au magicien** par l'atout d'orientation `Familier`. Il ne doit pas être confondu avec les compagnons, montures ou animaux non magiques :

| Type | Modèle |
|---|---|
| **Familier magique** | Règles R-8.13 : lien magique, budget `niveau × 100`, renaissance au passage de niveau, atouts comme pseudo-raciaux |
| **Compagnon / monture non magique** | Personnage ou créature autonome, fiche complète, évolution par XP partagé par son propriétaire PJ/PNJ |

Le texte legacy dit que les familiers sont des "personnages secondaires", mais c'est un raccourci historique : pour la spec, le familier utilise **ses propres règles**.

### R-8.13-a — Forme, taille et vitalité

- Chaque magicien peut posséder un familier via l'atout permanent d'orientation `Familier`.
- Le familier peut prendre n'importe quelle forme choisie par le magicien : animal classique, objet animé, oeil ailé, livre à pattes, sphère, etc.
- La **limite de vitalité / volume** est `niveau du magicien × 5`.
- Le familier doit avoir au moins `1` point de vitalité.
- Pour une forme non animale, on compare le **volume** plutôt que la taille. Exemple source : au niveau 1, `5` vitalité correspond environ à un chat ou à une sphère de taille ballon de handball.
- Le magicien peut toujours choisir une forme plus petite que le maximum autorisé.

**Règle d'harmonisation web/paper** : la vitalité `niveau × 5` est traitée comme **cap de vitalité et de volume**. La vitalité effective est inscrite sur la fiche du familier et payée avec les points de création du familier, minimum `1`, maximum le cap sauf atout spécifique.

### R-8.13-b — Feuille et budget de création du familier

Le familier possède une **fiche de personnage dédiée**, mais avec un modèle simplifié :

```text
budget_total_familier = niveau_du_magicien × 100
budget_disponible = budget_total_familier - points_deja_engages
facteur_vitesse_base = 8
facteur_volonte_base = 8
vitalite_cap = niveau_du_magicien × 5
```

Ces points sont des **points de création/évolution du familier**. La source parle de "points d'expérience", mais la spec les isole du partage XP des compagnons/montures pour éviter la confusion.

Le budget est **total par niveau**, pas ajouté intégralement à chaque passage de niveau :

| Niveau du magicien | Budget total familier |
|---:|---:|
| 1 | 100 |
| 2 | 200 |
| 3 | 300 |

Ce qui a déjà été dépensé est décompté du budget disponible. Au passage de niveau, le magicien peut conserver, retirer ou remanier les choix de son familier : les points précédemment engagés sont récupérables et peuvent être réattribués dans la limite du nouveau budget total.

Les coûts suivent les pondérations XP du jeu :

| Élément acheté sur la fiche du familier | Coût |
|---|---:|
| Aptitude | `NA × 5` |
| Compétence | `NA × 3` |
| Spécialisation | `NA × 3` |
| Vitalité | `10` par point |
| Facteur de vitesse | `(NA - NB + 1) × 25`, avec `NB = 8` |
| Facteur de volonté | `(NA - NB + 1) × 25`, avec `NB = 8` |
| Énergie, si autorisée par effet/atout | `3` par point |

Les limites physiques normales ne s'appliquent pas aux familiers.

### R-8.13-c — Restrictions propres au familier

- Le familier n'a **pas de race**, pas de catégorie, pas d'orientation, pas de classe.
- Il est toujours considéré comme **niveau 1** pour les effets qui demandent son niveau propre.
- Il n'a pas accès aux atouts d'orientation ou de classe comme un personnage ordinaire.
- Il peut recevoir des atouts, mais ceux-ci sont traités comme des **atouts raciaux du familier**.
- Le familier ne peut pas posséder de points dans une connaissance que le magicien ne possède pas lui-même.
- Les atouts choisis doivent rester validables par le MJ/admin selon la forme du familier. Exemple : `Vol` est cohérent pour un hibou ou un livre ailé, mais doit être justifié pour une sphère ou un crapaud.

### R-8.13-d — Coût des atouts et handicaps du familier

La table générale des valeurs d'atouts est importée dans [data/catalogs/atouts-values.csv](../../data/catalogs/atouts-values.csv). Elle est la règle de coût des atouts et handicaps de familier.

```text
coût_atout_familier = valeur_atout / 10
bonus_handicap_familier = abs(valeur_handicap) / 10
```

Exemples :

| Atout / handicap | Valeur source | Effet budget familier |
|---|---:|---:|
| `Vol` | 2000 | coûte 200 points |
| `Sens du familier` | 2000 | coûte 200 points si porté par le familier ; sinon couche du maître |
| `Familier vigoureux` | 8000 | coûte 800 points si traité comme atout du familier, ou atout du maître selon build |
| `Aveugle` | -5000 | donne 500 points supplémentaires |
| `Sourd` | -2500 | donne 250 points supplémentaires |

**Note de spec** : les valeurs très basses ou atypiques de la table source sont conservées telles quelles. Elles doivent être validées par l'admin si elles produisent des coûts familiers absurdes.

### R-8.13-e — Passage de niveau, mort et renaissance

À chaque passage de niveau du magicien :

- le familier renaît symboliquement ;
- le magicien peut conserver la forme actuelle ou en choisir une nouvelle ;
- le budget total devient `nouveau niveau du magicien × 100` ;
- les points déjà engagés peuvent être conservés, retirés, transformés ou réattribués ;
- un familier mort peut être récupéré à ce moment ;
- un magicien qui n'avait pas de familier peut en obtenir un.

Si le familier meurt avant le prochain passage de niveau :

- les points de création investis dans la fiche courante sont perdus jusqu'à renaissance ;
- le familier ne revient normalement qu'au prochain passage de niveau du magicien ;
- les atouts de niveau que le magicien a placés dans son familier sont transférés au prochain familier.

### R-8.13-f — Atouts liés au familier

| Atout | Valeur source | Coût `valeur/10` | Effet résumé |
|---|---:|---:|---|
| Familier | 500 | 50 | Atout d'orientation Magicien, donne accès au familier |
| Familier supplémentaire | 10000 | 1000 | Ajoute un familier ; les atouts placés sont hérités |
| Familier vigoureux | 8000 | 800 | Le familier gagne des points de vitalité selon le niveau du propriétaire |
| Hybridation du familier | 12000 | 1200 | Le magicien peut substituer une zone de son corps par celle du familier rappelé |
| Main du magicien | 4000 | 400 | Le magicien peut lancer un sort depuis le familier |
| Passage au familier | 6000 | 600 | Le magicien entre intégralement dans son familier |
| Rappel du familier | 3000 | 300 | Le familier peut être rappelé en soi ; entrée/sortie prend un facteur de vitesse |
| Sens du familier | 2000 | 200 | Lien sensoriel sur un sens choisi |
| Ventre du magicien | 4000 | 400 | Le familier peut nourrir le magicien en se nourrissant |
| Vol de familier | 20000 | 2000 | Détourne le lien d'un familier adverse tant que l'atout est actif |

### R-8.13-g — Statut

**Statut** : 🟢 règle source structurée et arbitrée.

**À valider par l'équipe** :
- les restrictions automatiques sur les atouts absurdes selon la forme du familier ;
- la répétabilité exacte de `Familier supplémentaire` et `Familier vigoureux`.

---

## Partie G — Drain, captage, transfert d'énergie

### R-8.14 — Sorts et atouts de manipulation d'énergie / vie

**Catalogue** (rappel des découvertes D1/D2/D7) :

| Mécanisme | Type | Source | Effet |
|---|---|---|---|
| **Captage d'énergie** | Sort Abjuration | grimoire | Le lanceur attire l'énergie d'un magicien en cours d'incantation : +3 énergie au lanceur par réussite. Le magicien cible doit compenser ou voir son sort annulé. |
| **Don d'énergie** | Sort Magie blanche | grimoire | Transfert volontaire : 3 énergie transmise à la cible par réussite |
| **Sacrifice d'énergie** | Atout Magicien N3 perm | lexique | Drain volontaire d'énergie sur un magicien cible (1m/niveau) — points perdus pour le sacrifié, gagnés (?) pour le sacrifiant |
| **Drain de sort majeur / mineur / standard** | Sort Magie noire | grimoire | Drains 4/2/3 PS (Points de Sort = mana courant) absorbés par réussite — **réduit le pool d'énergie courant de la cible**, transfert au lanceur. `energyMax` non affecté. Récupération via repos / potions standard. |
| **Drain de vie** | Sort Magie noire | grimoire | 1 PV absorbé par réussite |
| **Augmentation énergétique** | Sort Abjuration | grimoire | Augmente le coût en énergie d'un sort cible de 2 par R |
| **Complexité magique** | Sort Abjuration | grimoire | Augmente la difficulté d'un sort cible de 2 par R |
| **Inversion des énergies** | Atout Magicien N12 perm | lexique | Lance des sorts en consommant la vitalité au lieu de l'énergie |
| **Barrière psychique** | Sort Abjuration | grimoire | Réduit les R des sorts mentaux ciblant le bénéficiaire |
| **Boomerang** | Sort Abjuration | grimoire | Renvoie un sort au lanceur d'origine |
| **Substitution de sort** | Sort Abjuration | grimoire | Remplace un sort incanté par un autre |
| **Contre-X** (11 sorts Abjuration) | Sort Abjuration | grimoire | Annule un sort de l'école X par réussite |

**Statut** : 🟢 claire (catalogue connu, descriptions à compléter en lecture du grimoire complet)

### R-8.15 — Résistance magique (rappel D1 R-1.33)

**Modèle multi-couches** (D1 R-1.33) :
- **Résistance magique** (D100) : protège contre la magie **directe** (contrôle mental, transformation, illusion, soins, bénédictions)
- **Armure** (P/E/C/T) : absorbe les dégâts physiques/énergétiques (souvent issus de sorts indirects type boule de feu)
- **Résistances élémentaires** (feu, froid, foudre, etc.) : par type de dégât
- **Tag `direct_magic` sur chaque sort** (R-8.4) : permet au moteur de déterminer quelle résistance s'applique

**Renvoi D9 et D10** : tables d'armures et résistances paramétrées (Q-D3.8 schéma normalisé `(type, value, source)`).

---

## Partie H — Apprentissage des sorts (rappel D5 R-5.6-bis)

### R-8.16 — Spécificités de l'apprentissage de sorts

Cohérent avec D5 R-5.6-bis (système d'apprentissage à 5 dimensions) :

**Côté élève** :
- Aptitude : Intelligence (le plus souvent)
- Compétence : « Apprentissage de la magie » (sous Maîtrise de soi du catalogue, [competences:254](documents/competences/index.md))
- Spécialisation : « Apprentissage de [école] » (à raffiner par école — ex: « Apprentissage de la magie blanche »)

**Côté mentor** :
- Aptitude : Empathie ou Intelligence
- Compétence : « Enseignement de la magie » ([competences:349](documents/competences/index.md))
- Spécialisation : « Enseignement de [école] »

**Atouts qui modifient l'apprentissage de sorts** :
- **Affinité arcanique** (Magicien N3 perm, prérequis : connaître 4 sorts) : divise les jours d'apprentissage par (niveau d'atout + 1)
- **Autodidacte** (perm) : permet d'apprendre un sort vu/entendu sans mentor, mais ×2 le temps. **Interdit aux Chamans** (transmission orale obligatoire)
- **Apprentissage rapide** (Intellectuel N2) : +niveau aux réussites du jet d'apprentissage

**Coût XP** (Experience.doc) :
- Nouveau sort : 10 XP flat
- +1 point dans un sort existant : NA × 10

**Durée d'apprentissage en jours** : règle D5 R-5.6-ter.

```text
jours_base = coût_XP × 3
```

Donc, à titre provisoire :
- Nouveau sort : `10 XP × 3 = 30 jours` avant jets/atouts.
- +1 point dans un sort existant : `NA × 10 XP × 3` jours avant jets/atouts.
- Les réussites d'apprentissage et d'enseignement se soustraient aux jours.
- Affinité arcanique divise ensuite les jours par `(niveau d'atout + 1)`.

**Statut** : 🟢 claire.

---

## Partie I — Atouts magiciens par niveau (rappel D2/D4 + détails)

### R-8.17 — Catalogue des atouts magiciens

| Atout | Niveau | Type | Effet résumé |
|---|---|---|---|
| **Familier** | Orient. perm | Permanent | Atout d'orientation, ouvre la fiche de familier D8 R-8.13 |
| **Énergie latente** | N2 perm | Permanent | +3 × niveau d'atout d'`energyMax` à chaque passage de niveau |
| **Sens du familier** | N2 perm | Permanent | Sensoriel via le familier |
| **Aura magique** | N2 éph | Éphémère | Manifestation visuelle d'énergie |
| **Désactivation** | N2 perm | Permanent | Contrôle de sort lancé |
| **Affinité arcanique** | N3 perm | Permanent | ÷ (niveau + 1) jours d'apprentissage des sorts (prérequis : 4 sorts) |
| **Incantation silencieuse** | N3 perm | Permanent | Sort sans bruit |
| **Incantation stoïque** | N3 perm | Permanent | Sort sans gesticulation |
| **Libération d'énergie** | N3 perm | Permanent | Convertit énergie en déflagration (1m/niveau) |
| **Persistance magique** | N3 perm | Permanent | Re-lancer un sort actif sans incantation |
| **Rappel du familier** | N3 | — | Le familier peut être rappelé en soi ; entrée/sortie prend un facteur de vitesse |
| **Sacrifice d'énergie** | N3 perm | Permanent | Drain d'énergie volontaire sur autre magicien |
| **Énergie à l'honneur** | N4 éph | Éphémère | -1 difficulté sur école choisie pendant 10 min/niveau |
| **Énergie au déshonneur** | N4 éph (Abjurateur) | Éphémère | +1 difficulté sur école adverse choisie |
| **Développement** | N4 perm | Permanent | Apprendre variantes mineur/majeur/standard |
| **Anticipation magique** | N5 éph | Éphémère | Pré-incanter, lancer en 1 DT |
| **Débordement d'énergie** | N5 perm | Permanent | Dépasser energyMax via potions ou drain |
| **Développement avancé** | N5 perm | Permanent | Apprendre variantes masse/distance |
| **Conceptualisation** | N6 perm | Permanent | Création de nouveaux sorts |
| **Télékinésie** | N6 perm (orient. Magicien, mais conflit avec Intellectuel — D4 Q-D4.5-bis) | Permanent | Soulève 1 kg/niveau au rythme de la marche |
| **Télépathie** | N6 perm | Permanent | Contact mental |
| **Conceptualisation étendue** | N7 perm | Permanent | Création de sorts avancés |
| **Perception des énergies** | N7 perm (prérequis Ressentir + Savoir la magie) | Permanent | Détection et quantification d'énergie |
| **Aura bénéfique** | N8 perm (Clerc) | Permanent | Empêche magie noire à proximité (1m/niveau, magicien d'un niveau inférieur) |
| **Aura maléfique** | N8 perm (Sorcier) | Permanent | Empêche magie blanche à proximité |
| **Bouclier des arcanes** | N9 perm | Permanent | 1 énergie/DT de bouclier total = niveau |
| **Lévitation** | N9 perm | Permanent | Mouvement via magie |
| **Transfert spatial** | N9 perm | Permanent | Déplacement spatial |
| **Maître en sort mineur** | N10 perm | Permanent | -1 difficulté sur les sorts mineurs |
| **Maître en sort majeur** | N10 perm | Permanent | -1 difficulté sur les sorts majeurs |
| **Maître en guérison** | N10 perm (Clerc) | Permanent | -1 difficulté sur les sorts de guérison |
| **Maître en sort de masse** | N11 perm | Permanent | -1 difficulté sur les sorts de masse |
| **Inversion des énergies** | N12 perm | Permanent | Sorts via vitalité au lieu d'énergie |
| **Maîtrise de l'énergie** | N15 perm (prérequis Énergie à l'honneur) | Permanent | Bonus +niveau au lieu de +1 sur école choisie |

**Statut** : 🟢 claire (catalogue connu, à étendre via lecture exhaustive d'atouts-de-niveaux)

---

## Partie J — Modèle de données

### R-8.18 — Tables et liaisons

```sql
spell_schools (id, name {abjuration, alteration, blanche, ...}, color, magicien_class_id, description)

spells (
  id, name, school_id, energy_cost, incantation_time, difficulty,
  effect_short, description_full, value, direct_magic BOOLEAN,
  damage_type ENUM(P, E, C, T) NULL,
  range_text, duration_text,
  is_canonical BOOLEAN,
  variant_of_id NULL,  -- pour les variantes mineur/majeur/masse/distance
  variant_type ENUM(mineur, standard, majeur, masse, distance) NULL,
  created_by, validated_by, version
)

character_spells (character_id, spell_id, points)

spell_relations (spell_id_a, spell_id_b, relation_type)  -- ex: "Contre-rouge" annule "Magie rouge"
```

**Notes architecturales** :
- `spells.school_id` permet de filtrer par école
- `direct_magic` permet le moteur de résistance (R-8.15)
- `variant_of_id` + `variant_type` lient un sort à son sort racine (Bouclier mineur → Bouclier)
- `version` permet la migration de règles (cf. méta-principe règles vivantes)
- CMS éditable par admin (cohérent avec D5 Q-D5.3)

---

## Partie K — Questions ouvertes

### ~~Q-D8.1~~ — Catalogue web vs paper ✅ **Tranché (2026-04-25)** : Option (a) **tout web est canonique**.

Les **~889 entrées** du `documents/grimoire/index.md` sont **toutes validées** comme canoniques v1. Le paper (~200 sorts) est une version condensée historique, le web reflète l'état le plus à jour.

**Implication** : import direct des 889 sorts dans la DB initiale du moteur, sans flag de source ni validation différée. Le CMS d'admin (Q-D5.3) reste disponible pour l'évolution future via le méta-principe règles vivantes.

### ~~Q-D8.2~~ — Tag `direct_magic` ✅ **Tranché (2026-04-25)** : **audit complet sort-par-sort, automatisé avec validation humaine finale**.

**Workflow** (à implémenter en phase 2) :

1. **Analyse automatisée par LLM** : pour chaque sort des 889 entrées, le LLM lit la description complète + l'effet et **propose** un tag `direct_magic: true/false` avec **justification courte** (1-2 phrases).
2. **Présentation par lot à l'auteur** : les 889 propositions sont consolidées dans une UI de validation (probablement par école pour faciliter la cohérence par catégorie).
3. **Validation humaine** : l'auteur **approuve, corrige ou rejette** chaque proposition. Possibilité de modifier la justification.
4. **Persistance** : le tag validé devient canonique en DB. La justification est conservée comme méta-donnée pour traçabilité.
5. **Mise à jour future** : si un sort est modifié (édition CMS, ajout d'une nuance), le tag est ré-évalué (LLM propose à nouveau, auteur valide).

**Critères de classification** (rappel D1 R-1.33) :
- **Direct** : le sort agit **directement sur la cible vivante** (contrôle mental, transformation, illusion, soins, bénédictions, malédictions personnelles)
- **Indirect** : le sort **crée, transforme ou invoque** quelque chose qui agit ensuite (boule de feu, enchantement d'objet, invocation, divination)

**Cadrage auteur (2026-04-27)** : `direct_magic` n'est qu'un axe technique nécessaire au moteur de résistance. La magie ne doit pas être réduite à « direct/indirect » : l'audit des sorts doit préparer une taxonomie multi-axes, au minimum cible (`self`, `living`, `object`, `area`, `spirit`, `energy`), mode d'action (`damage`, `heal`, `transform`, `control`, `summon`, `create`, `protect`, `counter`, `detect`, `move`), résistance applicable, durée, concentration, cumul, source/école, portée, conditions de lancement et interactions avec contre-sort/captage/anti-magie.

**Implication** : ce travail est **bloquant pour le moteur de résistance** mais ne bloque pas la spec D8. À planifier dans le plan d'implémentation phase 2.

### ~~Q-D8.3~~ — Jet de résistance opposé ✅ **Tranché (2026-04-25)** : Option (d) **variable selon le sort** + clarification critique sur les types de jet.

**Mécanique** :
1. Chaque sort spécifie son **jet de résistance opposé** dans sa description (« Contre jet d'X », « Si R > jet d'X »).
2. Selon le type de jet demandé, deux mécaniques distinctes :

#### Jet d'aptitude brute (D10)

Quand un sort dit « **Contre jet d'endurance / force / intelligence / dextérité / etc.** » :
- La cible roule **uniquement les points d'aptitude** comme nombre de D10s
- **PAS de compétence ajoutée**, **PAS de spécialisation**
- C'est un jet **sans contexte d'expertise** — l'aptitude « brute » du perso pour résister
- Difficulté standard 7 (sauf mention contraire dans la description du sort)
- Comparé au nombre de réussites du jet du magicien

**Différence avec R-1.2** : ceci est une **exception au pattern standard** (pool = aptitude + compétence + spé). Les jets de résistance aux sorts utilisent l'aptitude **seule** parce qu'ils représentent la **résilience naturelle** de la cible, pas son entraînement spécifique.

#### Jet de volonté (D20)

Quand un sort dit « **Contre jet de volonté** » ou affecte le mental/l'esprit :
- Cible fait un **test de volonté D20** (R-1.26 à R-1.29)
- Difficulté = `F.Volonté + réussites du sort attaquant` (R-1.28, le pont D10 → D20)
- 1 = échec auto, 20 = réussite auto (R-1.27)

**Statut** : 🟢 claire

### R-8.19 — Nouveau type de jet : aptitude brute

**Acté 2026-04-25** : il existe **trois types de jets** dans Knight and Wizard, pas seulement deux comme initialement modélisé en D1.

| Type | Formule | Usage |
|---|---|---|
| **Jet d'action standard (R-1.2)** | Aptitude + Compétence + Σ Spécialisations | Toute action qui mobilise compétence/expertise (combat, métier, perception, social…) |
| **Jet d'aptitude brute** | Aptitude seule (D10s) | **Résistance naturelle** : encaissement (R-2.17 endurance), résistance à un sort (« Contre jet d'X »), réflexe pur dans certains cas, etc. |
| **Test de volonté (D20)** | D20 vs F.Volonté + modificateurs | Réactions émotionnelles, charme, peur, contrôle mental |

**Extensibilité** : d'autres usages du « jet d'aptitude brute » peuvent exister hors magie (à découvrir dans le grimoire et autres règles). À retenir comme une catégorie de jet à part entière.

**Renvoi D1** : R-1.2 reste valable pour les actions « volontaires expert ». R-8.19 formalise le jet brut comme **autre catégorie**.

### ~~Q-D8.4~~ — Création de sorts (Conceptualisation) ✅ **Tranché (2026-04-25)** : Option (d) **hybride par mode + promotion communautaire**.

**Mécanique** :

| Mode | Politique de création de sort |
|---|---|
| **MJ humain (papier)** | Création **locale à la fiche** du joueur. Le MJ valide narrativement. Sort non partagé au catalogue global. |
| **MJ LLM** | Le joueur **propose** un sort (nom, école, énergie, TI, difficulté, effet). LLM analyse cohérence vs catalogue existant, propose des ajustements (équilibrage). Admin valide la publication au catalogue partagé. |
| **MJ auto strict** | **Pas de création** — catalogue figé, le joueur ne peut pas inventer de nouveau sort en cours de session. |

**+ Workflow de promotion communautaire** (cohérent avec Q-D5.1-a) :
- Un sort créé en mode papier ou LLM peut être **proposé au catalogue canonique** par son créateur
- Validation par seuil (N joueurs / M MJ qui l'utilisent et le valident) + curation finale par admin/auteur
- Une fois promu, le sort devient accessible à tous

**Implications architecturales** :
- `spells.is_canonical` (déjà prévu en R-8.18) : false par défaut pour les créations joueurs, true après promotion
- `spells.created_by` : identifiant du créateur
- `spells.parent_template_id` (nullable) : si le sort dérive d'un sort existant via Conceptualisation étendue
- Workflow de promotion : table `spell_promotion_proposals (spell_id, votes_yes, votes_no, status)`

**+ CMS de gestion du catalogue de sorts** *(précisé par l'auteur 2026-04-25)* :

Cohérent avec le **CMS du catalogue de compétences** (Q-D5.3) et le méta-principe **règles vivantes**, le catalogue de sorts (`spells`, `spell_schools`, `spell_relations`) est géré via un **CMS d'admin** :

- **Édition libre** par les rôles admin et MJ (ajouter, renommer, déplacer entre écoles, modifier énergie/TI/difficulté/effet, fusionner les variantes)
- **Mise à jour fréquente** anticipée — équilibrage des sorts, ajout de variantes, raffinement des descriptions
- **Pas de structure figée** côté code : le moteur consomme `spells` depuis la DB, jamais de hardcode
- **Versioning par sort** : historique des modifications (qui, quand, quoi), permettant rollback et traçabilité
- **Migration des fiches** : si un sort est renommé / modifié, les `character_spells` existants suivent (relinking auto, recalcul des coûts si baisse, grandfathering si hausse — cf. Q-D7.10)
- **Workflow de proposition** : un MJ peut proposer un nouveau sort ou une modification, un admin valide
- **Compatibilité avec promotion communautaire** : les sorts créés par les joueurs (Conceptualisation) peuvent être proposés au CMS pour promotion canonique

Cette décision résout aussi par cohérence l'équivalent pour les écoles de magie (admin peut potentiellement créer une 12e école si l'extensibilité religieuse Q-D6.8 ou un événement narratif majeur l'impose).

### ~~Q-D8.5~~ — Mécanique des variantes ✅ **Tranché (2026-04-25)** : Option (a) **sorts distincts à apprendre séparément** par défaut, avec **CMS + validation communautaire** comme infrastructure opérationnelle.

**Mécanique mécanique de base** :
- Chaque variante (mineur, standard, majeur, masse, distance) est un **sort distinct** dans le catalogue, avec ses propres `energy/TI/difficulty/effet`.
- Apprentissage **séparé** : un magicien qui connaît « Bouclier » doit apprendre indépendamment « Bouclier majeur » (10 XP nouveau sort + NA × 10 pour monter).
- Atouts **Développement** (N4) / **Développement avancé** (N5) : permettent au magicien de **développer** une variante d'un sort qu'il possède déjà — ils ne lui donnent pas la variante automatiquement, mais débloquent la **possibilité** de l'apprendre.
- Champ `spells.variant_of_id` (R-8.18) : lie une variante à son sort racine pour l'UI / la recherche.

**Infrastructure prioritaire (méta-principe règles vivantes — réaffirmé par l'auteur 2026-04-25)** :

Le **CMS** + **validation communautaire** sont la base de tout :
- L'admin peut **éditer** la mécanique des variantes (ex: décider qu'une école particulière fonctionne en "modes" plutôt qu'en sorts distincts)
- Les **propositions communautaires** peuvent faire évoluer la mécanique au fil du temps (vote sur "et si Bouclier majeur s'accédait automatiquement à partir de Bouclier ?")
- Le **versioning** permet le rollback si une mécanique modifiée s'avère mauvaise
- L'application **rétroactive favorable au joueur** (Q-D7.10) garantit que les modifications de variantes ne pénalisent pas les fiches existantes

**Implication** : la décision (a) est un **default mécanique**, pas un dogme. Le CMS permet de l'ajuster sort par sort, école par école, ou globalement selon les retours de jeu.

### Q-D8.6 — Familier — règles complètes

✅ **ACTÉ (2026-04-27)** : les règles de base du familier sont retrouvées et structurées en R-8.13. La table générale des valeurs d'atouts est la règle de coût `valeur / 10`.

### ~~Q-D8.7~~ — Persistance magique ✅ **Résolu (2026-04-25)** : description complète trouvée dans le lexique.

**Description officielle** ([lexique:839](regles-papier/extracted/listes/lexique.md)) :

> « Le magicien peut, en **1 DT**, renouveler un sort actif **sans faire d'incantation**. Ce qui signifie qu'un sort à 3 réussites qui durait 10 minutes sera renouvelé dès le moment où le magicien utilisera son atout, et repartira pour 10 minutes, **en conservant ses 3 réussites**. Les **points d'énergie du sort sont dépensés normalement**. (Permanent) (Atout de niveau 3 de l'orientation : Magicien) »

**Mécanique** :
- **TI = 1 DT** (au lieu du TI normal du sort) — extrêmement rapide en combat
- **Pas d'incantation** (donc pas de risque d'interruption R-8.7)
- **Conserve les réussites** du jet d'origine (l'effet/qualité du sort ne change pas)
- **Coût en énergie normal** du sort (le coût en énergie du sort reste dû à chaque renouvellement)
- **Pas de nouveau jet de difficulté** — c'est un renouvellement, pas un re-cast
- **Pas de risque d'échec** au renouvellement

**Cas d'usage typique** : un magicien avec Bénédiction (durée 10 min/niveau) en cours de combat peut renouveler son sort en 1 DT pour le maintenir actif sans risque, au prix de l'énergie standard à chaque renouvellement.

**Implication architecturale** : sur la fiche `character_active_spells`, ajouter `last_renewed_at` + `expires_at` recalculé à chaque renouvellement.

### ~~Q-D8.8~~ — Durée des sorts ✅ **Tranché (2026-04-25)** : système de temps **double** (narratif + DT) avec **instanciation**.

**Voir nouvelle règle structurante R-8.20 ci-dessous** — c'est un système qui dépasse la magie et structure tout le moteur de jeu.

### R-8.20 — Système de temps en deux échelles avec instanciation (transversal)

**Acté 2026-04-25 — règle architecturale fondamentale**.

#### Deux échelles temporelles coexistantes

| Échelle | Granularité | Usage |
|---|---|---|
| **Temps narratif** | Heures, journées, semaines | Hors combat — exploration, voyage, dialogues, repos, gestion de campagne, durée des sorts en min/heures/jours |
| **Temps de combat (DT)** | 1 DT = 0,2 s | En combat — actions, initiative, durée des sorts en DT, résolution séquentielle |

**Imbrication** : le **temps de combat s'inscrit dans le temps narratif**. Un combat de 50 DT = 10 secondes de temps narratif. Quand le combat se termine, l'horloge narrative avance du temps cumulé de la scène de combat.

#### Manipulations admin / MJ

- **Faire passer la journée** : commande qui avance l'horloge narrative de N heures / 24h. Utile pour les voyages, les nuits, les transitions de scène.
- **Avancer à une heure précise** : « avancer jusqu'à 18h », « avancer jusqu'au lendemain matin ». MJ ou moteur narratif déclenche.
- **Mode combat activé** : le moteur passe sur l'échelle DT. Les actions sont résolues en séquence DT par DT.
- **Mode combat terminé** : le compteur DT est ajouté au temps narratif (1 DT = 0,2 s), retour au mode narratif.

#### Switch tour-par-tour ↔ temps réel (mode combat)

En mode combat, deux sous-modes possibles :
- **Tour par tour** : le moteur attend l'input des joueurs avant chaque DT (ou groupe de DT). Pédagogique, accessible.
- **Temps réel** : les DT s'enchaînent en temps réel, les joueurs doivent réagir vite. Immersif mais tendu.

Le switch est **trivial** dans le moteur digital car la base sous-jacente (DT) est identique.

#### Accélération / ralentissement global instancié

**Cas d'usage** : adapter la cadence du jeu aux contraintes pratiques (joueurs en ligne, latence réseau, sessions longues à compresser, etc.).

**Mécanique** :
- Un **multiplicateur de temps** est paramétrable **par instance / campagne / session** (pas globalement pour tout le jeu)
- Exemples :
  - Temps réel × 1.0 (référence)
  - Temps réel × 0.5 (le jeu avance 2× plus lentement, plus de temps de réaction pour les joueurs)
  - Temps réel × 2.0 (accéléré, pour rattraper du retard narratif)
  - Pause (× 0)
- Le multiplicateur s'applique au **rythme d'avancée** du compteur DT en mode temps réel et au **timer narratif** en mode hors combat
- **Pas d'effet** sur les durées intrinsèques des sorts (un sort de 10 min reste 10 min de temps narratif, peu importe le multiplicateur de cadence du jeu)

#### Implication pour les durées de sort

Chaque sort a une **durée intrinsèque** exprimée dans son unité naturelle :
- DT (durée courte, en combat) : conservé tel quel, conversion automatique en temps narratif si combat se termine avant expiration
- Minutes / heures / jours (durée narrative) : tracké en heures de jeu narratives
- « Permanent » : pas de durée, dissipation uniquement via dispel actif (sort Abjuration, atout, etc.)

**Modèle de données** (à préciser en spec phase 2) :
```sql
character_active_spells (
  id, character_id, spell_id, target_id,
  cast_at_narrative_time, cast_at_combat_dt,
  duration_amount, duration_unit ENUM(DT, min, hour, day, permanent),
  successes_count,  -- pour les sorts dont l'effet dépend des réussites
  expires_at_narrative_time,  -- calculé
  expires_at_combat_dt,  -- nullable, si en cours de combat
  source_caster_id, last_renewed_at
)
```

#### Implication pour la cohabitation modes

| Mode | Échelle dominante | Combat |
|---|---|---|
| **Async (forum-RP)** | Temps narratif, transitions par scène | Combat résolu DT par DT mais asynchrone (chaque joueur poste son action quand il peut) |
| **Tour par tour digital** | Mix narratif (hors combat) + DT (combat) | Mode tour-par-tour explicite |
| **Temps réel digital** | Mix narratif (hors combat) + DT (combat) | Mode temps réel, multiplicateur ajustable |

**Renvoi D9 (Combat)** : ce système de temps est le squelette du moteur de combat — à élaborer plus en détail là-bas.

**Statut** : 🟢 architecture fondamentale claire, **détails opérationnels à raffiner en D9 et phase 2 (specs)**.

### ~~Q-D8.9~~ — Cumul de sorts identiques ✅ **Tranché (2026-04-25)** : règle **par catégorie de sort**, default = (c) max + refresh timer.

**Règle par défaut** : Option (c) — seul le sort avec le **meilleur effet** (plus de réussites) s'applique. L'autre est ignoré. **Si le sort entrant a un meilleur effet, il remplace** le précédent et le timer est refresh à la durée du nouveau sort.

**Différenciation par catégorie** *(précisé par l'auteur 2026-04-25)* — il faut une **vraie typologie des sorts** dans le catalogue, car le drain n'est pas un debuff strict. Catégories proposées :

| Catégorie | Cumul | Exemples |
|---|---|---|
| **Buff** (bonus passif sur cible) | (c) Max + refresh | Bénédiction, Bouclier, Force physique, Esthétisme, Rapidité, Courage, Force mentale |
| **Debuff classique** (malus passif sur cible) | (c) Max + refresh | Corrosion (sur cible vivante), Pétrification, Changement de sexe |
| **Drain** (transfert/vol de ressource) | Cumul **total** | Drain de sort, Drain de vie, Sacrifice d'énergie, Captage d'énergie |
| **Dégât direct** (effet ponctuel) | Cumul **total** (chaque lancer = nouveau dégât) | Boule de feu, Flèche de foudre, Châtiment de la matière |
| **Transformation** (modifie la nature de la cible) | Une seule transformation à la fois (la plus récente l'emporte) | Changement en corbeau / lapin / humain, Pétrification |
| **Soin** (récupère vitalité) | Cumul **total** (chaque lancer ajoute du PV jusqu'à `vitalityMax`) | Guérison absolue, Guérison de la peau/muscles/os |
| **Invocation** (appelle une créature) | Plusieurs invocations en parallèle si capacité | Sorts d'invocation orange |
| **Illusion** | À ajuster — probablement (c) refresh | Sorts violet |
| **Effet permanent** (changement définitif) | Une seule application, pas de re-application | Résurrection, Auto régénération créée par sort |

**Implication architecturale** :
- Ajouter `spells.cumul_type` à R-8.18 :
  ```
  cumul_type ENUM(buff, debuff, drain, damage, transformation, heal, summon, illusion, permanent_effect)
  ```
- Le moteur applique la règle par défaut selon `cumul_type` :
  - `buff`, `debuff`, `transformation`, `illusion` → (c) max + refresh
  - `drain`, `damage`, `heal`, `summon` → cumul total
  - `permanent_effect` → pas de cumul, refus si déjà appliqué
- Cas particuliers : un sort peut avoir un override explicite via le CMS (admin peut décider qu'un drain spécifique a un comportement différent)

**Renvoi Q-D8.2** : la classification par `cumul_type` peut être faite dans le **même audit** que le tag `direct_magic` — workflow LLM auto + validation auteur. Optimal en termes de coût.

### ~~Q-D8.10~~ — Drain de sort : sémantique « PS » et durée ✅ **Tranché (2026-04-25)** : Option (c) — **temporaire avec récupération différée par la mécanique d'énergie normale**.

**Clarification critique de l'auteur** : « PS » = **Points de Sort** = synonyme de **points d'énergie** (mana) du magicien. Le drain **puise dans le pool de mana courant** (`energy`), pas dans la **capacité** (`energyMax`).

**Mécanique** :
- **Drain de sort majeur** : 4 PS absorbés/R → la cible perd 4 points de `energy` par réussite du lanceur, le lanceur les **gagne** (transfert)
- **Drain de sort mineur** : 2 PS absorbés/R
- **Drain de sort standard** : 3 PS absorbés/R
- **Récupération** : via les mécaniques normales d'`energy` — repos (8 h = 100%, R-2.11), potions d'énergie, dons d'énergie (sort blanc), captage d'énergie d'autres magiciens, etc.
- **`energyMax` non affecté** — la capacité du magicien cible reste intacte

**Implication R-8.14 corrigée** : « Drain de sort » réduit le pool d'énergie courant (`energy`), pas l'investissement dans un sort spécifique ni l'XP. Pas de perte permanente. Pas de re-achat XP nécessaire pour la cible.

**Cohérence avec R-8.10** (modèle d'énergie consolidé) : les drains entrent dans la liste des sources de modification d'`energy` (transferts), aux côtés du Don d'énergie, Captage d'énergie, Sacrifice d'énergie.

**Effet tactique** : un magicien drained ne peut temporairement plus lancer de gros sorts (manque d'énergie). Il doit se reposer ou trouver une potion. Pas de pénalité permanente — bonne mécanique RP.

---

## Acceptance checklist

- [x] ~~Q-D8.1 : web vs paper grimoire~~ → tout web canonique (~889 sorts)
- [x] ~~Q-D8.2 : tag `direct_magic`~~ → audit complet sort-par-sort, LLM auto + validation auteur
- [x] ~~Q-D8.3 : formule jet de résistance opposé~~ → variable selon le sort + R-8.19 nouveau type "jet d'aptitude brute" (sans compétence/spé)
- [x] ~~Q-D8.4 : création de sorts (Conceptualisation)~~ → hybride par mode + CMS + promotion communautaire
- [x] ~~Q-D8.5 : variantes~~ → sorts distincts apprenables séparément + CMS pour ajustement
- [x] ~~Q-D8.6 : familier~~ → règles retrouvées ; coût des atouts = table générale `valeur / 10`
- [x] ~~Q-D8.7 : Persistance magique~~ → résolu par lecture lexique (1 DT, sans incantation, conserve réussites, énergie payée)
- [x] ~~Q-D8.8 : durée des sorts~~ → R-8.20 système de temps double (narratif + DT) avec instanciation
- [x] ~~Q-D8.9 : cumul de sorts identiques~~ → typologie par `cumul_type` (buff/debuff/drain/damage/transformation/heal/summon/illusion/permanent_effect)
- [x] ~~Q-D8.10 : Drain de sort sémantique PS~~ → temporaire, drain `energy` courant (mana), `energyMax` non affecté, récupération via repos/potions standard

**D8 complet** ✅ (10/10 tranchées ; familier complet + 2 nouvelles règles structurantes R-8.19 jet aptitude brute / R-8.20 système de temps double).

**Nouvelles découvertes structurantes** :
- **R-8.19 Trois types de jets** distincts (action standard, aptitude brute, volonté D20) — étend D1
- **R-8.20 Système de temps double** (narratif heures/jours + DT 0.2s combat) avec instanciation — architecture fondamentale pour D9 et le moteur global
- **Typologie `cumul_type`** des sorts (9 catégories) pour la mécanique de cumul
- **PS = Points de Sort = mana courant** (pas points investis dans un sort spécifique) — clarification importante

Une fois validé → **D9 Combat** (DT, actions, initiative, dégâts, armures).
