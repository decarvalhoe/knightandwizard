# D2 — Attributs

> Les 9 aptitudes et les 4 stats dérivées (vitalité, énergie, facteur de vitesse, facteur de volonté) qui composent le squelette numérique du personnage.

**Sources consultées** :
- [documents/regles/index.md:16-54](documents/regles/index.md) — Facteurs de volonté / vitesse, vitalité
- [documents/regles/index.md:107-136](documents/regles/index.md) — Énergie (magiciens) + repos
- [documents/regles/index.md:137-174](documents/regles/index.md) — Les 9 aptitudes, limites physiques, attributs nuls
- [documents/regles/index.md:254-259](documents/regles/index.md) — Encombrement (Force → max portable)
- [documents/regles/index.md:276-277](documents/regles/index.md) — 60 points d'énergie de départ pour les magiciens
- [documents/regles/index.md:285-293](documents/regles/index.md) — Distribution des points à la création
- [documents/regles/index.md:557-569](documents/regles/index.md) — Malus d'affaiblissement + perte d'aptitudes
- [documents/bestiaire/index.md](documents/bestiaire/index.md) — Maxima et facteurs de base par race
- [site/includes/class/Character.php](site/includes/class/Character.php) — Propriétés persistées
- [site/includes/managers/_DBManager.php:126-159](site/includes/managers/_DBManager.php) — Colonnes DB
- [site/includes/managers/user/AddCharacterMan.php:876-946](site/includes/managers/user/AddCharacterMan.php) — `setRandomSpeedFactor`, `setRandomVitality`, `setRandomWillFactor` (génération PNJ par niveau)
- [site/includes/managers/_PrintManager.php:140-162](site/includes/managers/_PrintManager.php) — Fiche de perso PDF (champs affichés)

---

## Vue d'ensemble

Un personnage est caractérisé par :

| Catégorie | Stats | Scoring |
|---|---|---|
| **9 aptitudes** | Force, Dextérité, Endurance, Réflexes, Perception, Intelligence, Charisme, Empathie, Esthétique | Plus haut = mieux, plafond racial |
| **Vitalité** | `vitality` (courante), `vitalityMax` (max) | Plus haut = mieux |
| **Énergie** | `energy` (courante), `energyMax` (max) — magiciens uniquement | Plus haut = mieux |
| **Facteur de vitesse** | `speedFactor` | Plus bas = mieux (0,2 s par point) |
| **Facteur de volonté** | `willFactor` | Plus bas = mieux (échelle 1-20) |

**Nomenclature confusante** : les « facteurs » s'écrivent comme des attributs mais fonctionnent en inverse (1 = optimal). Les « non-facteurs » (aptitudes + vitalité + énergie) suivent le scoring normal (plus haut = mieux).

---

## Partie A — Les 9 aptitudes

### R-2.1 — Liste et définitions

**Énoncé legacy**
> « Les aptitudes sont les capacités que toute personne équilibrée possède quelle que soit sa race ou sa classe. Elles sont au nombre de 9. »
> Source : [documents/regles/index.md:137-156](documents/regles/index.md)

| # | Nom (FR) | Propriété PHP | Rôle principal |
|---|---|---|---|
| 1 | **Force** | `strength` | Dégâts au corps à corps, capacité de portage (5 kg / point) |
| 2 | **Dextérité** | `dexterity` | Habileté et précision physique — « aptitude la plus usitée » |
| 3 | **Endurance** | `stamina` | Résistance à la fatigue, poison, alcool, encaissement des dégâts |
| 4 | **Réflexes** | `reflexes` | Réaction, esquive, action improvisée (R-1.5) |
| 5 | **Perception** | `perception` | Observation, détection, repérage |
| 6 | **Intelligence** | `intelligence` | Savoir, raisonnement, **canalisation des énergies magiques** |
| 7 | **Charisme** | `charisma` | Présence, peur, respect, fraternité |
| 8 | **Empathie** | `empathy` | Compréhension d'autrui, jugement des intentions |
| 9 | **Esthétique** | `aestheticism` | Charme physique, séduction |

**Groupes conceptuels (usage implicite par l'ordre dans le code)** : Physique (1-3), Sensoriel (4-6), Social (7-9). Pas un découpage mécanique, juste une lecture logique.

**Statut** : 🟢 claire

---

### R-2.2 — Scoring ouvert, plus haut = mieux

**Énoncé legacy**
> « Si l'important est toujours d'avoir le plus de points possible (il n'existe aucune limite), les facteurs eux au contraire devraient être minimes. »
> Source : [documents/regles/index.md:17](documents/regles/index.md)

**Statut** : 🟢 claire

**Implication** : pas de diminishing return (cf. R-1.36, empilement linéaire). Un perso à 7 en Force est strictement meilleur qu'un perso à 5 pour toutes les actions qui utilisent la Force.

---

### R-2.3 — Limite physique par race

**Énoncé legacy**
> « C'est donc qu'il existe des limites liées au physique des races [...]. Pour prendre connaissance de celles-ci, reportez-vous au "Bestiaire". Ces maximums dans les aptitudes sont quasiment indépassables, à cause des points d'expérience à dépenser pour cela. »
> Source : [documents/regles/index.md:157-160](documents/regles/index.md)

**Statut** : 🟢 claire

**Implémentation** : chaque race expose 9 maxima (`strengthMax`, `dexterityMax`, …, `reflexesMax`) — ce sont des propriétés de la **race**, pas du personnage (cf. [_DBManager.php:755-765](site/includes/managers/_DBManager.php)).

**Exemples (tirés du Bestiaire)** :
| Race | Catégorie | Force max | Dex max | Int max |
|---|---|---|---|---|
| Canidae | 20 | 5 | 4 | 5 |
| Centaure | 22 | 7 | 5 | 5 |
| Chat | 12 | 1 | 6 | 1 |

**Cas ambigu** : « quasiment indépassables à cause des points d'expérience à dépenser » — peut-on dépasser via XP suffisant ? Si oui, quel est le coût ? → **Question ouverte pour D7 (Progression)**.

---

### R-2.4 — Attributs nuls : inné vs acquis

**Énoncé legacy**
> « Les attributs nuls ou inexistants ne peuvent être modifiés (ou passer à plus de 0). Attention toutefois, un personnage qui possédait des points et qui les a, par la suite, perdus (par exemple quelqu'un de très beau brûlé au troisième degré sur tout le corps), peut toujours évoluer dans cette aptitude. »
> Source : [documents/regles/index.md:165-166, 565](documents/regles/index.md)

**Statut** : 🟢 claire

**Distinction clé** :
- **Nul d'origine** (race/créature n'ayant jamais eu de points dans cette aptitude — chat à 1 en Force, animal à 0 en Intelligence, golem à 0 en Empathie) → **blocage permanent**, jamais d'évolution possible.
- **Nul acquis** (perso qui avait des points et les a perdus via blessure, défiguration, affaiblissement permanent) → récupérable via XP, même depuis 0.

**Effet mécanique** : 0 dé jeté pour cette aptitude → voir R-1.6 en D1 (échec forcé, pas de D100).

**Règle de cohérence narrative** : le MJ / le moteur doit justifier le type de nullité par la fiche (race, background, cicatrices permanentes, handicap listé).

---

### R-2.5 — Moyenne estimée d'une race = limite / 2

**Énoncé legacy**
> « Pour vous faire une idée de la moyenne de point de d'une race dans une aptitude, divisez la limite physique de celle-ci par 2. »
> Source : [documents/regles/index.md:161-164](documents/regles/index.md)

**Exemple** : humain avec Force max = 5 → moyenne Force ≈ 2,5. Pour les valeurs non-entières, ajustement narratif : soldat plutôt 3, artiste plutôt 2.

**Statut** : 🟢 claire

**Usage** :
- Calibration des PNJ génériques (gardes, civils, animaux) — leurs stats par défaut tournent autour de la moyenne.
- Génération procédurale en mode auto : distribution centrée sur limite/2 avec dispersion selon la classe (voir D3 Races pour la formule complète, D4 Classes pour les archétypes).

---

## Partie B — Distribution à la création

### R-2.6 — Points disponibles = catégorie de la race

**Énoncé legacy**
> « Vous possédez sur votre feuille de personnage neuf aptitudes dans lesquelles vous pourrez dépenser un nombre de points égal à votre catégorie. Par exemple : Un hobbit (catégorie 16) pourra dépenser 16 points. »
> Source : [documents/regles/index.md:286-288](documents/regles/index.md)

**Statut** : 🟢 claire

**Exemples de catégories** (cf. Bestiaire) : 12 (Chat), 16 (petits humanoïdes), 20 (Canidae, humains), 22 (Centaure), etc. Catégories connues : 16, 20, 22, 24, 28, 32, 40.

**Conséquence** : les races plus puissantes (catégorie élevée) ont plus de points à distribuer, mais progressent plus lentement en niveau (voir D7 seuils de niveau = niveau × catégorie).

---

### R-2.7 — Minimum 1 conseillé, 0 possible mais stagnant

**Énoncé legacy**
> « Un minimum de 1 point est vigoureusement conseillé. Il se peut que vous jouiez tout de même une créature avec 0 dans une aptitude (notamment pour ce qui est des petites créatures et des animaux), mais cela indiquerait qu'aucune évolution ne sera possible dans cette même aptitude. »
> Source : [documents/regles/index.md:289-290](documents/regles/index.md)

**Statut** : 🟢 claire

**Conséquence** : mettre 0 à la création = attribut nul d'origine (cf. R-2.4) = blocage permanent. Choix rare réservé aux animaux / créatures spécifiques.

---

### R-2.8 — Maximum à la création = limite physique - 1

**Énoncé legacy**
> « Au commencement, vous avez droit à votre limite physique (en fonction de votre race et de l'attribut en question) - 1, au maximum. »
> Source : [documents/regles/index.md:291-293](documents/regles/index.md)

**Exemples** :
- Elfe avec Esthétique max = 6 → max à la création = 5
- Hobbit avec Force max = 3 → max à la création = 2

**Statut** : 🟢 claire

**Rationale** : le perso démarre avec une marge de progression. Atteindre la limite physique exige de l'XP.

**Contrainte totale à la création** : `Σ(9 aptitudes) = catégorie` ET `∀ aptitude i, 0 ≤ i ≤ (limiteRace_i - 1)`.

---

## Partie C — Stats dérivées

### R-2.9 — Vitalité : base de race + progression

**Énoncé legacy**
> « La vitalité est définie par la race à la base. C'est une quantité de point qui définissent le nombre de blessures que les personnages peuvent subir avant de succomber. Vous la trouverez dans "Le Bestiaire". »
> Source : [documents/regles/index.md:52-54](documents/regles/index.md)

**Deux champs** :
- `vitality` = points courants (diminuent avec les dégâts, récupérés par soins)
- `vitalityMax` = plafond actuel du personnage (grandit avec l'XP)

**Statut** : 🟢 claire (tranché 2026-04-24)

**Base** : valeur fournie par la race dans le Bestiaire (ex: Canidae = 24, Centaure = 35, Chat = 4).

**Progression** :
- **PJ** : le joueur dépense **10 XP** pour +1 point de vitalité max (coût flat, cf. [Experience.doc](regles-papier/extracted/listes/experience.md)).
- **PNJ génériques** : peuvent être statés rapidement via [AddCharacterMan.php:setRandomVitality](site/includes/managers/user/AddCharacterMan.php) (40% de +1 par tick d'échec, espérance ≈ N × 2/3 sur N niveaux). Approximation pour le MJ.
- **PNJ importants** (antagonistes, alliés nommés) : statés comme des PJ.

**Implication mécanique (détail en D9 Combat)** :
- `vitality` = 0 → mort/inconscience
- `vitality ≤ vitalityMax / 2` → déclenchement des malus d'affaiblissement (R-2.17)
- « Vitalité de base » (valeur initiale de `vitalityMax`, avant toute progression) est le seuil de référence pour certaines réactions aux dégâts (R-1.17 gravité, règle « dégâts > ½ vitalité de base dans la tête/gorge = mort »).

---

### R-2.10 — Vitalité : courante vs max, récupération

**Statut** : 🟢 claire (révisé 2026-04-25, l'auteur a précisé que la règle papier était incomplète)

**Décision révisée (2026-04-25)** : le repos **restaure pleinement** la vitalité courante, comme il restaure l'énergie et les atouts éphémères.
- **8 h de sommeil** = 100% de la `vitalityMax` restaurée (`vitality` ← `vitalityMax`)
- **4 h** = 50%, échelle linéaire
- Cumulable avec les autres voies de récupération (soins magiques, atouts spécifiques, potions)

**Rectification vs décision antérieure (2026-04-24)** : la version initiale disait "le repos ne restaure pas la vitalité, seulement énergie+atouts éphémères". L'auteur a clarifié que c'était une omission du texte legacy — la vitalité **est** restaurée lors du repos. Le texte de [regles:134-136](documents/regles/index.md) doit être lu comme listant les éléments dans l'**ordre d'importance narrative**, pas comme une liste exhaustive.

**Atouts qui modifient le repos** (catalogue extensible) :
- **Repos du guerrier** ([lexique:934](regles-papier/extracted/listes/lexique.md)) : « Le personnage récupère le double de point de vitalité lors d'une nuit de sommeil » — interprété comme **divise par 2 le temps requis pour récupération totale** (4h au lieu de 8h pour 100%). Potentiellement **cumulable** : 4h, 2h, 1h, 30 min, 15 min, 7,5 min, etc. (à confirmer en D4).
- À documenter : autres atouts modifiant le repos (sommeil léger, repos amélioré, etc.).

**Voies de récupération de la vitalité courante** (catalogue extensible — même principe "exception = règle" qu'en R-2.11) :

| Voie | Accès | Effet | Type | Source |
|---|---|---|---|---|
| **Repos / sommeil** | Tous | 8 h = 100% `vitality`, 4 h = 50%, linéaire | Standard | R-2.10 (cette règle) |
| **Repos du guerrier** (atout) | Guerrier (à valider en D4) | Divise par 2 le temps requis (4 h pour 100%, cumulable : 2 h, 1 h, 30 min, …) | Permanent | D4 |
| **Soins magiques** (sorts) | Magicien | Variable selon sort | Sort | D8 |
| **Auto régénération** (racial) | Loup-garou, Troll | +1 PV / 10 DT passif | Atout permanent | D3 |
| **Auto soin** (atout) | Guerrier N2 | +niveau vitality (self) | Éphémère | D4 |
| **Apaisement** (atout) | Guerrier N2 | +niveau vitality (autre, au toucher) | Éphémère | D4 |
| **Baiser vivifiant** (atout) | Tous N2 | +niveau vitality (personne aimée) | Éphémère | D4 |
| **Astre régénérateur** (atout) | Guerrier N12 | `vitality = vitalityMax` + suppression fatigue | Éphémère | D4 |
| **Baiser salvateur** (atout) | Tous N18, prérequis Baiser vivifiant | Résurrection (mort < 1 min/niveau) | Éphémère | D4 |
| **Potions de vie** | Tous | Restaure `vitality` (détail → D10) | Consommable | D10 |
| **Compétence Médecine** | Tous | Durée narrative, +N PV/jour par jet | Compétence | D5 |
| **Compétence Herboristerie** | Tous | Baumes / onguents | Compétence | D5 |
| **Cicatrisation naturelle** | Tous | Sur jours/semaines selon gravité (cas combat sans repos possible) | Narratif | MJ |

**Implication design** :
- La vitalité **se régénère naturellement** par repos (8 h = 100%) — pas une ressource rare en condition de repos accessible.
- En revanche **en combat / aventure sans repos possible**, les blessures s'accumulent et les soins externes (magie, potions, compétences médicales) deviennent critiques.
- Les malus d'affaiblissement (R-2.17) ne se résorbent que par soins (pas par simple retour à `vitalityMax`) — ils peuvent donc persister au-delà du repos même si la vitalité revient à son max.
- Le système doit supporter N mécanismes parallèles de récupération avec règles de cumul / saturation claires (→ D9 Combat pour arbitrage).

**Note sur la récupération des aptitudes réduites par malus** :
Certaines aptitudes (ex: Esthétique après brûlure) ne se récupèrent **pas** par repos ni par simple cicatrisation — il faut un magicien qui « efface » les blessures ([regles:563-565](documents/regles/index.md)). D'autres (Force, Endurance) reviennent avec la cicatrisation naturelle quand la blessure sous-jacente guérit.

---

### R-2.11 — Énergie : modèle extensible (défaut magicien + exceptions)

**Énoncé legacy**
> « Les magiciens ont droit à deux points de sort pour commencer. [...] Ils ont également droit à 60 points d'énergie (à noter dans "Energie"). »
> Source : [documents/regles/index.md:276-277](documents/regles/index.md)

**Statut** : 🟢 claire (tranché 2026-04-24)

#### Principe architectural : « L'exception est la règle »

Le modèle d'énergie n'est **pas** "magicien = pool, tout le reste = 0 strict". Il fonctionne par **base + mécanisme d'exceptions extensible** :

- **Défaut** : `energyMax = 60` pour l'orientation Magicien ; `0` pour toutes les autres.
- **Exceptions** : divers atouts (raciaux, de classe, de niveau), consommables (potions), ou mécanismes narratifs peuvent **grant, modifier, transférer ou convertir** l'énergie. Ces exceptions sont la norme, pas des cas exceptionnels — le moteur doit les gérer de façon générique.

#### Base à la création

- **Magicien (orientation)** : `energyMax = 60`, `energy = 60`.
- **Autres** : `energyMax = 0`, `energy = 0`.

#### Progression permanente

- **Via XP (Magicien)** : 3 XP par point (flat), cf. [Experience.doc](regles-papier/extracted/listes/experience.md).
- **Via atout « Énergie latente » (Magicien N2 perm)** : +3 × niveau à chaque passage de niveau (bonus automatique).
- **Via atout racial « Art occulte » (Vampire N2 racial)** : un vampire non-magicien qui prend cet atout acquiert `energyMax = 40`. Peut être cumulé (plusieurs sorts de magie noire appris) et peut progresser aux mêmes conditions XP qu'un magicien. Ce cas est **typique de la règle d'exception** — d'autres races / classes / atouts pourront le répliquer.

#### Acquisition temporaire

- **Potions d'énergie** : ajoutent N points à `energy` courante (détail → D10). Comportement vs `energyMax` à préciser (sans atout Débordement, ne dépassent probablement pas le plafond).
- **Atout « Débordement d'énergie » (Magicien N5 perm)** : permet de dépasser `energyMax` via potions d'énergie et sorts de drain d'énergie.
- **Sort « Captage d'énergie » (abjuration)** : +3 points d'énergie par réussite au lanceur, volés à un magicien en cours d'incantation.

#### Conversion et transfert

- **Atout « Sacrifice d'énergie » (Magicien N3 perm)** : le magicien peut sacrifier N points de sa propre énergie pour en retirer N au magicien cible (dans un rayon de 1m/niveau).
- **Atout « Inversion des énergies » (Magicien N12 perm)** : permet de lancer un sort en dépensant de la vitalité au lieu de l'énergie (conversion énergie ↔ vitalité, un sort à la fois).

#### Consommation par atout (non-sort)

- **Atout « Bouclier des arcanes » (Magicien N9 perm)** : consomme 1 point d'énergie par DT. C'est un atout, pas un sort, donc peut être maintenu en parallèle d'une incantation.

#### Cas limites importants à garder en scope

- **Atout « Polyvalence »** *(important dans la méca, à creuser en D4)* : permet à un personnage d'accéder à des atouts d'autres orientations. Implique qu'un non-magicien avec Polyvalence + atout magicien d'énergie pourrait acquérir de l'énergie.
- **Télékinésie / Télépathie** : accessibles à Magicien, Intellectuel, **et potentiellement d'autres classes via Polyvalence**. Conflit de source lexique vs atouts-de-niveaux, à résoudre en D4.
- **Capacités magico-inspirées non-énergétiques** : certains atouts raciaux (vampire : Brumathropie, Chiroptèrothropie, Lycanthropie ; ondine : Chant envoûtant) offrent des effets type-sort **sans consommer d'énergie** — ils fonctionnent comme des atouts avec leurs propres règles (permanent / éphémère / jet de compétence + test D20 pour cibles).

**Implication architecturale** : le moteur doit modéliser l'énergie comme un **stat ordinaire** (`energyMax` peut être modifié par N sources indépendantes), pas comme un drapeau magicien/non-magicien. Chaque atout / consommable / sort qui touche à l'énergie s'enregistre comme un **modificateur** avec ses propres règles de cumul, temporalité, et conditions.

---

### R-2.12 — Énergie : consommation et récupération

**Énoncé legacy**
> « Chaque magicien ne peut en déplacer [de l'énergie] qu'une certaine quantité par jour [...]. Un sommeil a pour effet de restaurer ces points. »
> Source : [documents/regles/index.md:107-109](documents/regles/index.md)

**Consommation** :
- Lancement d'un sort : consomme le coût `energy` du sort (voir Grand Grimoire, D8).
- **Incantation interrompue** = énergie **perdue** quand même.
- Réduction du temps d'incantation : +2 énergie supplémentaires par DT économisée ([regles:117](documents/regles/index.md)).

**Récupération** :
- **Repos (8 h) = 100%** ; moins = proportionnel (ex: 4 h = 50%).
- Potions d'énergie ? Aucune règle explicite — à vérifier dans [documents/potions/](documents/potions/) en D10.

**Statut** : 🟢 claire (consommation) / 🟡 incomplète (proportionnalité exacte du repos partiel — linéaire ou pas ?)

---

### R-2.13 — Facteur de vitesse : base race, 0,2 s par point

**Énoncé legacy**
> « Ce facteur [...] se traduit par un nombre compris entre 1 et l'infini. Ce facteur représente le temps qu'il vous est nécessaire pour accomplir une action [...] chaque point représentant 0,2 seconde. »
> Source : [documents/regles/index.md:49-51](documents/regles/index.md)

**Statut** : 🟢 claire

**Base** : fournie par la race dans le Bestiaire. Exemples : Canidae = 8, Centaure = 8, Chat = 7 (plus bas = plus rapide).

**Plafond bas** : 1 (ne peut descendre en dessous) — cf. [AddCharacterMan.php:894-896](site/includes/managers/user/AddCharacterMan.php).

**Plafond haut** : théoriquement infini, modulé par encombrement (R-2.18), magie et atouts.

---

### R-2.14 — Facteur de vitesse : progression par XP

**Statut** : 🟢 claire (tranché 2026-04-24)

**Formule officielle** ([Experience.doc](regles-papier/extracted/listes/experience.md)) :
```
Coût XP pour -1 FV = (NA - NB + 1) × 25
```
Où `NA` = valeur actuelle du FV, `NB` = valeur de base (race).

**Exemples** : pour un humain à FV 8 de base (exemple fictif) :
- 1er point (8 → 7) : (7 - 8 + 1) × 25 = **0** ?? hmm formule ambiguë

Attendez — le FV descend, donc `NA < NB` au fur et à mesure. Relecture de la formule : `(NA - NB + 1) × 25`.
Si NB=8 et NA=7 (après 1 amélioration) : (7-8+1) × 25 = **0 XP** → incohérent.

**Interprétation probable** : `NB` = valeur **d'origine** (race), `NA` = valeur **actuelle** AVANT l'amélioration, et le "+1" force la formule à démarrer à 25 :
- 1er point (de 8 à 7) : (8 - 8 + 1) × 25 = **25 XP**
- 2e point (de 7 à 6) : mais avec `NA` = 7 et `NB` = 8, ça donne 0 × 25 = 0, toujours incohérent

**Autre interprétation** : la formule est `(NB - NA + 1) × 25` (inversion ? coquille dans Experience.doc ?) :
- 1er point (NA=8 après amélioration → non, car `NA = valeur actuelle`) : (8-8+1)×25 = 25
- 2e point (NA=7) : (8-7+1)×25 = 50
- 3e point (NA=6) : (8-6+1)×25 = 75 ✓ — cohérent avec l'exemple donné (25, 50, 75, 100)

→ **Formule corrigée : `(NB - NA + 1) × 25`** (le texte du doc contient probablement une coquille inversée).

**Question ouverte** : confirmer cette interprétation avec l'auteur.

**PNJ génériques** : [AddCharacterMan.php:setRandomSpeedFactor](site/includes/managers/user/AddCharacterMan.php) — 7% chance de -1 par niveau (min 1). Approximation MJ.

**Plafond bas** : 1 (ne peut descendre en dessous, cf. [regles:894-896](site/includes/managers/user/AddCharacterMan.php)).

---

### R-2.15 — Facteur de volonté : base race, échelle 1-20

**Énoncé legacy**
> « La volonté est considérée sur une échelle de 1 à 20. Donc, plus un personnage s'approche de 1 dans son facteur de volonté, plus il sera maître de lui-même. Le facteur de volonté est un nombre fixé à la base, en fonction de la race. »
> Source : [documents/regles/index.md:20-23](documents/regles/index.md)

**Statut** : 🟢 claire

**Base** : fournie par la race dans le Bestiaire. Humain = 12, Canidae = 9, Centaure = 11.

**Plafond bas** : 1 (ne peut descendre en dessous).

**Plafond haut** : 20 théorique — au-delà, selon les règles de test de volonté (R-1.26 à R-1.29), la règle 20 = réussite auto garantit toujours 5% de chances de réussite.

**Usage** : seuil à atteindre sur D20 pour « réussir » un test de volonté. Plus bas = plus volontaire / stable mentalement.

---

### R-2.16 — Facteur de volonté : progression par XP

**Statut** : 🟢 claire (tranché 2026-04-24)

**Formule** : identique à R-2.14 (FV) — `(NB - NA + 1) × 25` XP par point (25, 50, 75, 100, …).

**Plafond bas** : 1.

**PNJ génériques** : [AddCharacterMan.php:setRandomWillFactor](site/includes/managers/user/AddCharacterMan.php) — 7% chance de -1 par niveau. Approximation MJ.

---

## Partie D — Modifications en cours de jeu

### R-2.17 — Malus d'affaiblissement : blessures réduisent les aptitudes

**Énoncé legacy**
> « 1 point de malus d'affaiblissement est distribué pour chaque point de vitalité en moins, lorsque la moitié de celle-ci est perdue (arrondie au supérieur pour ceux qui n'ont pas un nombre de points de vitalité pair). Ces malus diminuent de 1 les aptitudes concernées jusqu'à ce que le personnage ait soigné ses blessures. »
> Source : [documents/regles/index.md:557-569](documents/regles/index.md)

**Statut** : 🟢 claire (tranché 2026-04-24)

**Formule** :
- Seuil de déclenchement : `vitality ≤ ceil(vitalityMax / 2)`
- Nombre de malus = `ceil(vitalityMax / 2) - vitality` (quand dégâts dépassent la moitié)

**Exemple canonique** (Ilmig, vitalité max 25) :
- Seuil = ceil(25/2) = 13
- Ilmig subit 15 points de dégâts → vitality = 10
- Malus = 13 - 10 = 3 points

#### Portée du malus (Q6-a validé)

Le malus d'affaiblissement **n'affecte que les 9 aptitudes** (Force, Dex, Endurance, Réflexes, Perception, Intelligence, Charisme, Empathie, Esthétique). **Jamais** les facteurs (FV, Volonté), **jamais** les stats max (vitalityMax, energyMax).

#### Règle de plancher et capping (Q6-b validé)

Une aptitude **ne peut jamais descendre en négatif** sous l'effet du malus. Le malus appliqué sur une aptitude est **plafonné à la valeur initiale** de cette aptitude.

**Conséquence** : si une aptitude est déjà à 0 (via R-2.4 attribut nul, ou via autre malus), le malus supplémentaire ne fait rien sur elle — il doit être redistribué sur d'autres aptitudes pertinentes, ou « dissipé » (à arbitrer, voir Q6-b-bis ci-dessous).

#### Modèle de calcul d'une aptitude à un moment T (stacking généralisé)

```
aptitude_effective(t) = max(0,
    base_value_at_creation_XP
  + racial_atouts_permanent_modifiers
  + class_atouts_permanent_modifiers
  + orientation_atouts_permanent_modifiers
  + level_atouts_permanent_modifiers
  + Σ(magical_buffs_active_at_t)
  - Σ(magical_debuffs_active_at_t)
  - Σ(atouts_debuffs_active_at_t)
  - affliction_malus_on_this_aptitude
)
```

Chaque source est **indépendante et empilable linéairement** (cohérent avec R-1.36 modèle de modificateurs). L'ordre d'application n'est pas significatif puisque tout est additif.

**Important** : le calcul ci-dessus s'applique **également** quand on évalue le pool de dés pour un jet (R-1.2) — l'aptitude utilisée dans le pool est l'aptitude **effective au moment du jet**, pas la valeur « de base ».

#### Choix des aptitudes touchées par le malus

**Décision** : Option E hybride (cohérent avec R-1.11, R-1.12, R-1.17) :

| Mode | Comportement |
|---|---|
| MJ humain | Liberté totale selon le narratif. Exemples guides fournis par les règles papier (brûlure = toutes, fatigue = Force/End/Dex, blessure bras = Force/Dex). |
| MJ LLM | Table indicative par **nature** de la blessure (voir ci-dessous), adaptation narrative possible avec justification. |
| MJ auto | Table stricte par **nature × zone touchée** (Table des Touches D100 + type de dégât P/E/C/T). |

**Table indicative par nature d'événement (mode LLM/auto)** :

| Nature de blessure | Aptitudes généralement touchées | Durée / Conditions de récupération |
|---|---|---|
| Blessure physique membre | Force + Dextérité (selon membre) | Cicatrisation naturelle |
| Blessure au torse | Force + Endurance | Cicatrisation naturelle |
| Traumatisme crânien | Intelligence + Perception + Réflexes | Soins magiques ou repos prolongé |
| Brûlure (toute zone) | Toutes les 9 — persistance longue sur Esthétique | Nécessite magicien pour Esthétique |
| Fatigue / faim / soif | Force + Endurance + Dextérité | Repos, nourriture |
| Poison | Varie (souvent Endurance + ciblé) | Antidote, soins |
| Maladie | Varie (typiquement Endurance + Perception) | Guérison magique ou temps |
| Choc émotionnel | Charisme + Empathie + Volonté (rare) | Temps narratif |

La **Table des Touches** ([infos/table-des-touches.md](regles-papier/extracted/infos/table-des-touches.md)) sert à déterminer la **zone** touchée par un coup non-visé. Le moteur auto l'utilise pour préciser quel membre/zone est concerné, ce qui affine le choix des aptitudes.

#### Atouts liés au malus d'affaiblissement

- **Anti-délivrance** ([lexique:84](regles-papier/extracted/listes/lexique.md)) : permet de **réduire** le niveau de malus d'un perso qu'on maltraite (pour le faire souffrir plus longtemps). Manipulation inverse du seuil de récupération.
- **Folie furieuse** ([lexique:479](regles-papier/extracted/listes/lexique.md)) : mécanique similaire mais volontaire — réduit Empathie/Int/Perception à 1 pendant l'état, en échange de bonus en Force/Endurance.

#### Conséquences critiques (également R-combat en D9)

- Endurance réduite à 0 → **évanouissement**
- Force réduite à 0 (ou insuffisante pour porter l'équipement) → **chute à terre**

#### Exception raciale — atout « Jusqu'à la mort »

[Lexique:574](regles-papier/extracted/listes/lexique.md) :
> « Le personnage ne mourra que lorsque sa vitalité sera réduite à 0. »

Cet atout racial (Squelette) **invalide les règles de mort par seuil** (R-1.17 gravité D100, règles tête/gorge > ½ vitalité de base). Le personnage ne meurt strictement qu'à `vitality = 0`. Autres seuils (évanouissement via endurance=0, chute via force=0) restent actifs ? À arbitrer en D9.

**Renvoi** : le principe d'exception est extensible — d'autres atouts raciaux ou de niveau peuvent modifier ces seuils. À cataloguer en D3/D4.

#### Cas limite — malus sur aptitude à 0 (Q6-b-bis validé 2026-04-24)

Quand un malus doit s'appliquer sur une aptitude déjà à 0 : **il est perdu** (ignoré). Pas de redistribution sur une autre aptitude, pas de mise en attente. C'est un effet seuil simple : aptitude déjà plafonnée = aucun impact supplémentaire.

---

### R-2.18 — Encombrement : modifie le facteur de vitesse

**Énoncé legacy**
> « Vous pouvez porter jusqu'à 5 kg d'équipement sur vous par point en force, sans avoir de pénalité de vitesse. Au dessus de votre maximum, votre facteur de vitesse augmente de 1 par tranche de 5 kg supérieurs à votre maximum. »
> Source : [documents/regles/index.md:254-259](documents/regles/index.md)

**Formule** :
```
maxSansPenalite (kg) = Force × 5
poidsExcedent (kg) = max(0, poidsTotal - maxSansPenalite)
malusFV = ceil(poidsExcedent / 5)   # SAUF au pile 5 kg (ex: 15.0 kg = 0 malus, 15.1 kg = 1 malus)
FVeffectif = FVbase + malusFV
```

**Exemple** : Force 3 → max sans pénalité = 15 kg. Charge 15,1 kg → FV + 1. Charge 20,1 kg → FV + 2. Etc.

**Statut** : 🟢 claire

**Cas limite** : en cas de perte de Force (malus d'affaiblissement, R-2.17), la capacité de portage diminue → peut déclencher un encombrement soudain si on était pile au seuil.

---

### R-2.19 — Modifications magiques (buffs/debuffs)

**Renvoi D1 R-1.39** : un sort actif peut modifier temporairement une ou plusieurs aptitudes, un facteur, ou l'énergie.

**Statut** : 🟡 à enrichir en D8 (catalogue complet des sorts modificateurs).

---

### R-2.20 — Progression via XP (feuille "L'Expérience")

**Statut** : 🟢 claire (tranché 2026-04-24, source [regles-papier/extracted/listes/experience.md](regles-papier/extracted/listes/experience.md))

**Coûts officiels** (NA = Niveau Actuel dans la caractéristique, NB = Niveau de Base / racial) :

| Caractéristique | Coût XP par point | Exemple progression |
|---|---|---|
| Attributs (sous limite physique) | NA × 5 | 5, 10, 15, 20, … |
| Attributs (au-delà de la limite physique) | NA × 20 | 100, 120, 140, … |
| Compétences (existantes) | NA × 3 | 3, 6, 9, 12, … |
| Nouvelle compétence | 3 (flat) | 3 |
| Spécialisations (existantes) | NA × 3 | 3, 6, 9, 12, … |
| Nouvelle spécialisation | 3 (flat) | 3 |
| Facteur de vitesse (-1 pt) | (NB - NA + 1) × 25 | 25, 50, 75, … |
| Facteur de volonté (-1 pt) | (NB - NA + 1) × 25 | 25, 50, 75, … |
| Vitalité (+1 max) | 10 (flat) | 10 |
| Sorts (points dans un sort existant) | NA × 10 | 10, 20, 30, … |
| Nouveau sort | 10 (flat) | 10 |
| Énergie (+1 max) | 3 (flat) | 3 |
| Atout de classe éphémère (+1 usage/jour) | NA × 10 | 10, 20, 30, … |

**Dépassement des limites physiques** : **autorisé** via XP au coût × 4 (NA × 20 au lieu de NA × 5). Cohérent avec le texte legacy « quasiment indépassables à cause des points d'expérience à dépenser ».

**Remontée d'aptitude perdue** : fonctionne même depuis 0 (R-2.4), coût identique à une progression normale (NA × 5 depuis le score actuel).

**Atouts** (précision auteur 2026-04-24) :
- **Atouts de race** → automatiques à la création, permanents, non-achetables
- **Atouts de niveau** → automatiques au passage de niveau, non-achetables
- **Atouts d'orientation** → obtenus à la création, non-achetables (toujours éphémères)
- **Atouts de classe** → **2 atouts par classe** :
  - Un atout **permanent** (ajoute des dés supplémentaires en fonction du niveau) → automatique, non-achetable
  - Un atout **éphémère** (minimum 2 usages/jour, augmentable) → **seul achetable via XP** au coût `NA × 10`

Voir D4 (Classes) pour le catalogue détaillé des atouts de classe et la formule du gain de dés du permanent.

---

## Partie E — Modèle de données

### R-2.21 — Structure persistée sur un personnage

| Champ (PHP) | Colonne DB | Type | Source initiale | Modifié par |
|---|---|---|---|---|
| `strength` | `strength` | int ≥ 0 | Distribution création (≤ limiteRace-1) | XP, malus affaiblissement, magie |
| `dexterity` | `dexterity` | int ≥ 0 | idem | idem |
| `stamina` | `stamina` | int ≥ 0 | idem | idem |
| `reflexes` | `reflexes` | int ≥ 0 | idem | idem |
| `perception` | `perception` | int ≥ 0 | idem | idem |
| `intelligence` | `intelligence` | int ≥ 0 | idem | idem |
| `charisma` | `charisma` | int ≥ 0 | idem | idem |
| `empathy` | `empathy` | int ≥ 0 | idem | idem |
| `aestheticism` | `aestheticism` | int ≥ 0 | idem | idem |
| `vitality` | `vitality` | int ≥ 0 | = vitalityMax à la création | dégâts / soins / repos |
| `vitalityMax` | `vitality_max` | int ≥ 1 | Base race | XP, atouts, magie |
| `energy` | `energy` | int ≥ 0 | = energyMax à la création (60 si magicien, 0 sinon) | sorts / repos |
| `energyMax` | `energy_max` | int ≥ 0 | 60 si magicien, 0 sinon | XP, atouts, magie |
| `speedFactor` | `speed_factor` | int ≥ 1 | Base race | XP, encombrement, magie |
| `willFactor` | `will_factor` | int ≥ 1 | Base race (1-20) | XP, magie |

**Champs en lecture (propriétés de la race, pas du perso)** :
| Champ | Signification |
|---|---|
| `race.category` | Détermine seuils de niveau et points de création |
| `race.strengthMax`, `race.dexterityMax`, … `race.reflexesMax` | Plafond racial pour chaque aptitude |
| `race.vitality`, `race.speedFactor`, `race.willFactor` | Valeurs de base héritées à la création |

**Champs dérivés non persistés** (calculés à la volée) :
- `FVeffectif = speedFactor + malusEncombrement + Σ(buffs/debuffs magiques)`
- `pool_de_dés(action) = aptitude + compétence + Σ(spés pertinentes) - Σ(malus affaiblissement sur aptitude)`

---

## Partie F — Liens avec les autres domaines

### R-2.22 — Matrice des usages (aptitude → règle)

| Aptitude | Usages principaux | Règles concernées |
|---|---|---|
| **Force** | Dégâts CAC, portage (×5 kg), seuil chute | R-1.2 (pool), [regles:485-495](documents/regles/index.md) (résolution dégâts), R-2.18 (encombrement), R-2.17 (chute si F=0) |
| **Dextérité** | Actions physiques précises, tir, escalade | R-1.2 (pool) |
| **Endurance** | Encaissement dégâts, résistance poison/alcool | R-1.2, [regles:540-545](documents/regles/index.md) (jet d'endurance post-dégâts), R-2.17 (évanouissement si End=0) |
| **Réflexes** | Actions improvisées (forcé), esquives | R-1.5, R-1.12 (action improvisée) |
| **Perception** | Détection, observation | R-1.2 |
| **Intelligence** | **Lancement des sorts** (Int + points dans le sort), savoir | R-1.4 (magie), D8 |
| **Charisme** | Impression, peur, respect | R-1.2 |
| **Empathie** | Lecture sociale | R-1.2 |
| **Esthétique** | Séduction, garde-fou des modifs de circonstances | R-1.11 (exemple séduction), R-1.28 (alimente D20) |

### R-2.23 — Matrice des usages (stat dérivée → règle)

| Stat | Usages principaux | Règles concernées |
|---|---|---|
| `vitality` / `vitalityMax` | Seuil de mort, évanouissement, malus d'affaiblissement | D9 Combat, R-2.17 |
| `energy` / `energyMax` | Coût des sorts, concentration, familier | D8 Magie |
| `speedFactor` | Durée des actions (DT), initiative combat | D9 Combat, R-1.24 (action conservée), R-2.18 (encombrement) |
| `willFactor` | Seuil D20 des tests de volonté | R-1.26 à R-1.29 |

---

## Synthèse & questions bloquantes

### Complétude

| Bloc | Statut |
|---|---|
| Liste et définitions des 9 aptitudes | 🟢 |
| Limites physiques (maxima raciaux) | 🟢 (renvoi Bestiaire D3) |
| Attributs nuls (inné vs acquis) | 🟢 |
| Distribution à la création | 🟢 |
| Vitalité : base + usage | 🟢 |
| Vitalité : progression par niveau | 🟡 random code vs XP PJ |
| Énergie : départ 60 pour magiciens, consommation, repos | 🟢 |
| Énergie : progression de energyMax | 🔴 formule manquante |
| Facteur de vitesse : base + encombrement | 🟢 |
| Facteur de vitesse : progression | 🟡 random code vs XP PJ |
| Facteur de volonté : base + usage | 🟢 |
| Facteur de volonté : progression | 🟡 random code vs XP PJ |
| Malus d'affaiblissement | 🟢 (principe) / 🟡 (mapping type blessure → aptitudes) |
| Progression générale via XP | 🔴 renvoi D7 |

### Questions ouvertes à trancher

1. ~~**Repos et vitalité** : le repos de 8 h restaure-t-il uniquement l'énergie et les atouts éphémères, ou aussi la vitalité courante ?~~ ✅ **Tranché (2026-04-24)** : le repos ne restaure **pas** la vitalité. Récupération par soins magiques / compétences médicales / cicatrisation narrative uniquement.
2. ~~**Progression PJ vs PNJ** : les fonctions `setRandomSpeedFactor/Vitality/WillFactor` (code) sont-elles la formule **officielle** pour les PJ aussi, ou seulement pour générer des PNJ aléatoires ?~~ ✅ **Tranché (2026-04-24)** : PJ via XP (feuille "L'Expérience" retrouvée dans paper, cf. R-2.20), `setRandom*` pour PNJ génériques uniquement. PNJ importants statés comme PJ.
3. ~~**Formule energyMax au level-up** : non documentée.~~ ✅ **Tranché (2026-04-24)** : 3 XP par point (flat), cf. R-2.20.
4. ~~**Énergie pour non-magiciens** : un perso non-magicien peut-il acquérir/stocker de l'énergie via objet magique, rune, bénédiction divine, potion ? Ou c'est strictement exclusif aux magiciens ?~~ ✅ **Tranché (2026-04-24)** : modèle extensible "exception = règle". Base : magicien 60, autres 0. Exceptions documentées : Vampire (Art occulte) +40, atout Polyvalence (cross-orientation), potions d'énergie, atouts magicien (drain, transfert, bouclier, débordement). Voir R-2.11.
5. ~~**Dépassement des maxima raciaux via XP** : le texte dit « quasiment indépassables ». Quasiment = possible avec coût très élevé ? Ou jamais ?~~ ✅ **Tranché (2026-04-24)** : possible, coût × 4 (NA × 20 au lieu de NA × 5), cf. R-2.20.
6. ~~**Aptitudes sociales pour créatures non-conscientes** : un golem / mort-vivant / élémentaire a-t-il un score en Empathie, Charisme, Esthétique ? Si 0 d'origine = immunité aux effets sociaux (cf. R-1.6 + R-2.4) ?~~ ✅ **Tranché (2026-04-24)** : pas de flag explicite `immuneToSocial`. Immunité gérée nativement par la combinaison (a) aptitudes raciales basses ou nulles, (b) willFactor bas (Squelette=1, Fantôme=2), (c) atouts ciblés « Peur » / « Terreur » (immunité à leur propre effet). L'atout « Mort-vivant » est purement descriptif (pas de mécanique).
7. ~~**Mapping type de blessure → aptitudes affectées (malus d'affaiblissement)** : table de correspondance en mode auto ? Ou choix libre MJ/LLM en humain ?~~ ✅ **Tranché (2026-04-24)** : Option E hybride (humain libre / LLM table indicative / auto table stricte par nature + Table des Touches). Q6-a : malus uniquement sur 9 aptitudes. Q6-b : pas de négatif, cap sur valeur initiale. Modèle de stacking généralisé ajouté en R-2.17.
8. ~~**levelPoints sur la fiche PDF** : `Character->levelPoints` mentionné dans [_PrintManager.php:160](site/includes/managers/_PrintManager.php). Ces "Points" affichés sur la fiche = ? Points d'XP restants à dépenser ? Points de niveau cumulés vers le prochain passage ? Autre ?~~ ✅ **Tranché (2026-04-24)** : `levelPoints` = cumul dérivé des points de compétences/spécialisations/sorts avec pondération primaire×2 pour non-magicien et sorts×2 pour magicien. `Niveau` est ensuite dérivé en comparant à `N × race.category`. Aucun stocké.
9. ~~**"Expérience" affichée vide sur la fiche** : pas de valeur dans le PDF — c'est un champ manuel ? Ou dérivé quelque part ?~~ ✅ **Tranché (2026-04-24)** : XP n'est pas tracké en base v1. Trou de spec à combler en D7 Progression avec stockage cumulatif + historique d'événements.

### Questions supplémentaires surgies pendant la phase

- ✅ **Q2-bis-a** (atouts de classe) : 2 atouts par classe (1 permanent ajouteur de dés, 1 éphémère 2+/jour augmentable via XP). Seul l'éphémère est XP-achetable (NA × 10).
- ✅ **Q2-bis-b** (dépassement limite physique) : possible via XP à coût × 4 (NA × 20).
- ✅ **Q2-bis-c** (formule FV/Volonté) : coquille dans Experience.doc — formule réelle `(NB - NA + 1) × 25`.
- ✅ **Q5-a** (atout Jusqu'à la mort) : invalide les seuils de mort par blessure grave (R-1.17 gravité). Squelette meurt uniquement à `vitality = 0`.
- ✅ **Q5-b** (atout Polyvalence) : atout méta qui casse la barrière d'orientation (pas de classe). À propager en D4 comme centre névralgique du système d'atouts.
- ✅ **Q6-a** : malus d'affaiblissement touche uniquement les 9 aptitudes (jamais facteurs ni stats max).
- ✅ **Q6-b** : pas de valeur négative, cap sur la valeur initiale de l'aptitude.
- ✅ **Q6-b-bis** : malus sur aptitude déjà à 0 = perdu (ignoré).

### Acceptance checklist pour l'auteur

- [ ] Validation du **modèle 9 aptitudes + 4 stats dérivées**
- [ ] Trancher les 9 questions ouvertes ci-dessus
- [ ] Confirmer que la progression par niveau suit le pattern code (random ± XP choix joueur) OU fournir la règle orale manquante
- [ ] Confirmer le périmètre du repos (énergie + atouts éphémères seulement, ou vitalité incluse)

Une fois validé → passage à **D3 (Races)** où on réconcilie les 32 races + leurs atouts raciaux avec les maxima et facteurs déjà référencés ici.
