# D1 — Résolution (dés, difficulté, succès, critiques)

> Mécanique fondamentale : comment on détermine si une action réussit. Base de tous les autres domaines (combat, magie, compétences, social).

**Sources consultées** :
- [documents/regles/index.md:319-464](documents/regles/index.md) — section "Actions et Jet de Dés" + "Chance" + "Résistances" + "Zones Touchées"
- [documents/regles/index.md:23-48](documents/regles/index.md) — section "Test de Volonté" + "Malus de Volonté"
- [outils/lanceur-de-des/index.md](outils/lanceur-de-des/index.md) — UI tool (minimaliste : juste nombre + difficulté)
- [site/includes/managers/_DiceManager.php](site/includes/managers/_DiceManager.php) — implémentation complète du moteur de dés

---

## Vue d'ensemble

Le système utilise **trois types de dés** :

| Dé | Usage | Mécanique |
|---|---|---|
| **D10** (en pool) | Actions : compétences, combat, magie | Nombre de dés = Aptitude + Compétence + Spé ; chaque dé ≥ difficulté = 1 réussite |
| **D20** (seul) | Tests de volonté (peur, charme, émotion) | Succès si roll ≥ F.Volonté (+ malus) |
| **D100** (2×D10) | Chance, résistances, zones touchées, gravité d'échec critique | Succès si roll ≤ seuil % |

---

## Partie A — Noyau D10

### R-1.1 — Dés d'action = D10 en pool

**Énoncé legacy**
> « Toutes les actions se jouent à l'aide des D10. »
> Source : [documents/regles/index.md:322](documents/regles/index.md)

**Statut** : 🟢 claire

**Cas couverts** : toute action mécanique (combat, compétence, sort).

**Transposition par moteur**
- *Legacy 1:1* : pool de D10 jetés simultanément, résolus selon R-1.13 à R-1.19.
- *Digital* : identique, côté moteur. L'UI peut animer ou afficher le résultat brut.

**Transposition par arbitre**
- Pas d'implication particulière — la mécanique du dé est identique quelle que soit la source de contrôle.

**Transposition par rythme** : indifférent.

---

### R-1.2 — Nombre de dés = Aptitude + Compétence + Σ Spécialisation(s) adéquate(s)

**Énoncé legacy**
> « Pour connaître le nombre de dés que vous devrez lancer, il vous faut tout d'abord trouver quelle aptitude, compétence et spécialisation(s) sont adaptées à l'action que vous voulez jouer aux dés. Vous devez ensuite additionner le nombre de points que vous possédez dans chaque secteur. »
> Source : [documents/regles/index.md:323-329](documents/regles/index.md)

**Exemple canonique (Salogel)** : Dextérité 4 + Arc long 5 + 0 spé = **9 D10**.

**Statut** : 🟢 claire

**Cas couverts** :
- Compétence absente → score 0 dans ce secteur (l'aptitude seule compte)
- Spécialisation absente → score 0

**Cas ambigus / non couverts** :
- **Quelle aptitude + compétence choisir ?** Le joueur choisit ce qui a du sens (Force + Bagarre ou Dextérité + Bagarre pour plaquer un adversaire). Le MJ peut imposer.
- Spécialisations **multiples pertinentes** : toutes se cumulent (voir R-1.10).

**Transposition par moteur**
- *Legacy 1:1* : choix libre soumis à validation MJ (humain) ou règle métier (LLM/auto).
- *Digital* : l'UI propose une suggestion basée sur un mapping `action → (aptitudes recommandées, compétences recommandées)`, mais laisse le joueur override.

**Transposition par arbitre**
- *MJ humain* : valide/impose le couple aptitude+compétence en cas de litige.
- *MJ LLM* : arbitre selon contexte narratif (injecter la règle dans le prompt).
- *MJ auto* : règle déterministe — chaque action du système a une composition définie (`getAttackDicePool(char, weapon)`).

---

### R-1.3 — Une seule aptitude ET une seule compétence par jet (mais spé cumulables)

**Énoncé legacy**
> « Une seule aptitude et une seule compétence peuvent être utilisées lors d'un jet. Mais jamais un groupe de dés ne pourra être composé de plusieurs aptitudes (genre : Force + Dextérité + ...+ ...) ou de plusieurs compétences (comme : Force + Bagarre + Lutte + ...). »
> Source : [documents/regles/index.md:370, 376](documents/regles/index.md)

**Exemple canonique (Salogel bis)** : Dex 4 + Arc long 5 + "Tir dans la gorge" 3 + "Tir dans la carotide" 2 = **14 D10** (Dex + 1 compétence + 2 spés).

**Statut** : 🟢 claire

**Transposition** : contrainte de validation à appliquer dans tous les moteurs/arbitres.

**Cas limite** (précisé par l'auteur 2026-04-23) : un personnage peut avoir des points dans une **spécialisation sans avoir la compétence mère**. Rare mais possible. Dans ce cas :
- Pool = aptitude + 0 (pas de compétence) + points de spé
- Le **-1 de compétence ne s'applique pas** (la règle R-1.9 requiert une compétence > 0)
- Le **-1 par spécialisation s'applique normalement** (R-1.10)

---

### R-1.4 — Magie : Intelligence + points dans le sort (pas de compétence primaire)

**Énoncé legacy**
> « Attention, pour lancer un sort, la sélection à faire est simplement l'intelligence + le sort désiré. »
> Source : [documents/regles/index.md:330-332](documents/regles/index.md)

**Exemple** : mage Int 4 + Boule de Feu 3 = **7 D10**.

**Statut** : 🟢 claire

**Transposition** : règle spécifique à la magie, appliquée automatiquement pour toute action de lancement de sort. Les magiciens n'ont pas de compétence primaire (voir D7 Progression).

---

### R-1.5 — Actions improvisées utilisent Réflexes automatiquement

**Énoncé legacy**
> « Noter aussi que si vous venez à effectuer une action improvisée, vous utiliserez de toute manière l'aptitude "Réflexe". »
> Source : [documents/regles/index.md:403](documents/regles/index.md)

**Statut** : 🟢 claire

**Cas couverts** : esquives, réactions surprises, parades non prévues.

**Transposition par arbitre**
- *MJ auto* : override automatique de l'aptitude choisie → Réflexes dès qu'une action est marquée "improvisée" (voir R-1.12).

---

### R-1.6 — Attribut nul → échec total automatique

**Énoncé legacy**
> « Avoir un attribut nul signifie entre autre que chaque jet de dés basé sur cette aptitude est un échec total. »
> Source : [documents/regles/index.md:167](documents/regles/index.md)

**Statut** : 🟢 claire (tranché par l'auteur le 2026-04-23)

**Décision** : « Échec total » = **0 réussite forcée, sans D100 d'échec critique**. L'action échoue proprement, sans conséquence dramatique supplémentaire.

**Cas** :
- Attribut nul d'origine (créatures, animaux) → action impossible à réussir sur cette aptitude.
- Attribut nul acquis (blessure, défiguration, affaiblissement) → idem, mais peut être remonté via XP.
- Si une action peut être tentée avec **une autre aptitude** défendable narrativement, c'est au MJ / moteur d'arbitrer (cf. R-1.2).

**Transposition par moteur**
- *Legacy + Digital* : lorsqu'une aptitude = 0 est sélectionnée, le jet retourne directement `nbrOfSuccess = 0` sans tirage.

---

## Partie B — Difficulté & modificateurs

### R-1.7 — Difficulté standard = 7

**Énoncé legacy**
> « Une difficulté standard (c'est-à-dire pour des actions qui demandent de se concentrer, mais pas d'être un professionnel, comme sauter, courir, pêcher,...) est de 7. »
> Source : [documents/regles/index.md:337-338](documents/regles/index.md)

**Statut** : 🟢 claire

---

### R-1.8 — Difficulté convenue (tables d'armes/sorts) vs standard (7)

**Énoncé legacy**
> « Lorsque par contre nous effectuons des actions spéciales [...] nous parlerons de difficulté convenue. C'est en général le MJ qui la fixe. Des tables sont à sa disposition pour l'aider (notamment pour l'utilisation des armes, voir "La Table des Armes" et "Le grand Grimoire" pour les sorts). »
> Source : [documents/regles/index.md:339](documents/regles/index.md)

**Statut** : 🟢 claire (précisé par l'auteur le 2026-04-23)

**Clarification** :
- **Standard (7)** = fallback pour toute action « courante » entreprise **sans compétence ni arme/sort spécifique** (courir, sauter, pêcher, frapper à mains nues de façon générique…).
- **Convenue** = difficulté **propre à l'outil** utilisé :
  - Chaque **arme** a sa difficulté de maniement dans la Table des Armes (voir D10 Équipement) — ce **n'est pas** 7 par défaut.
  - Chaque **sort** a sa difficulté dans le Grand Grimoire (voir D8 Magie).
  - Certaines actions complexes (alchimie, fabrication d'objet magique, rituels) ont leur propre difficulté dans leur table dédiée.

**Conséquence architecturale** : la "difficulté de base" d'une action est une **donnée de référentiel** (attribut d'arme, de sort, d'action), pas une constante. Elle est ensuite modifiée par tous les autres modificateurs (compétence, spé, précision, circonstances, atouts, magie…).

**Transposition par arbitre**
- *MJ humain* : lit la difficulté dans la table concernée ; peut l'overrider narrativement.
- *MJ LLM* : difficulté lue dans la table, modificateurs choisis par le LLM avec justification.
- *MJ auto* : table stricte, aucune improvisation possible.

---

### R-1.9 — Modificateur compétence adéquate : **-1**

**Énoncé legacy**
> « La difficulté doit être diminuée de 1 par le joueur si son personnage possède une compétence adéquate à l'action qu'il entreprend. »
> Source : [documents/regles/index.md:354-357](documents/regles/index.md)

**Statut** : 🟢 claire

**Cas ambigus** : la compétence est « adéquate » = elle est déjà présente dans le pool (R-1.2). Ce modificateur s'applique donc **automatiquement** dès que la compétence > 0. À confirmer : le modificateur vaut -1 quel que soit le nombre de points en compétence ?

---

### R-1.10 — Modificateur spécialisation adéquate : **-1 par spé cumulable**

**Énoncé legacy**
> « Une diminution de 1 de la difficulté peut aussi avoir lieu par spécialisation adéquate [...]. Vous pouvez également posséder plusieurs spécialisations qui sont pertinentes [...]. Celles-ci se cumulent ainsi que leur diminution de difficulté. »
> Source : [documents/regles/index.md:358-368](documents/regles/index.md)

**Statut** : 🟢 claire

**Exemple canonique** : « Tir dans la gorge (Arc long) » + « Tir dans la carotide (Arc long) » → difficulté -2, 14 dés au total.

---

### R-1.11 — Modificateur de circonstances (libre MJ)

**Énoncé legacy**
> « La difficulté peut être modifiée directement par le MJ. Elle peut par exemple être élevée à cause de conditions météorologiques mauvaises [...]. C'est au MJ de déterminer le degré de l'influence des circonstances. »
> Source : [documents/regles/index.md:378-388](documents/regles/index.md)

**Exemple canonique** : droitier qui dessine de la main gauche → +3. Chant guerrier d'un barde → -N réussites pour les alliés.

**Statut** : 🟢 claire (tranché par l'auteur le 2026-04-23)

**Décision** : régime **hybride par mode d'arbitre** (Option E).

**Principe universel (garde-fou)** : un modificateur ne peut **jamais dépasser la valeur de ce qu'il mesure**. Exemple canonique : malus de distraction par séduction ≤ Esthétique de la cible ([regles:383](documents/regles/index.md)).

**Échelle indicative (non contraignante sauf mode auto)** :
| Intensité | Modif | Exemples |
|---|---|---|
| Légère | ±1 | Léger inconfort, encouragement verbal |
| Modérée | ±3 | Main non dominante, stress de surnombre, chant guerrier bon barde |
| Forte | ±5 | Blessure, météo exécrable, distraction majeure |
| Extrême | ±8 | Panique, conditions quasi impossibles, perfection narrative |

**Transposition par arbitre**
- *MJ humain* : **liberté totale**. Slider libre avec texte explicatif. Garde-fou universel uniquement.
- *MJ LLM* : **fourchette indicative** injectée dans le prompt + justification narrative obligatoire. Peut dépasser sur justification explicite.
- *MJ auto* : **table finie bornée** (météo, terrain, état du perso). Pas de dépassement possible.

**Pont vers D20** (lien avec R-1.28) : si le MJ hésite sur le chiffrage d'un modificateur psychologique, il peut déclencher un test de volonté ; l'écart entre le seuil et le résultat devient le modificateur. Cette mécanique est **non-obligatoire** en mode humain, **systématique optionnelle** en LLM, **déclenchée par contexte** en auto.

---

### R-1.12 — Types d'actions & modificateurs associés

**Énoncé legacy (table récapitulative)**
> Source : [documents/regles/index.md:343-352](documents/regles/index.md)

| Type d'action | Modificateur de difficulté |
|---|---|
| Simple | 0 |
| Précise | +1 / +2 / +3 / **… (échelle ouverte)** |
| Improvisée | +1 (et aptitude forcée à Réflexes, cf. R-1.5) |
| Multiple | +1 par action supplémentaire, sur **toutes** les actions |
| Contre-action | 0 |
| Action conservée | +1 par point de dégât subi pendant l'exécution |

**Statut** : 🟢 claire (précisé par l'auteur le 2026-04-23)

**Échelle de précision** (indicative, non plafonnée) :
- +1 = zone large (tête, torse, bras, jambe)
- +2 = sous-partie (main, pied, œil, bouche, cou)
- +3 = point chirurgical (canine droite, phalange, carotide)
- +4 et au-delà = cas extrêmes (écaille précise d'un dragon en mouvement, serrure de puce, …) — MJ libre

L'échelle 3 niveaux est un **outil didactique** pour débutants ; les cas standards s'y résolvent. Rien n'empêche d'aller plus loin pour des actions très complexes.

**Règles complémentaires** :
- Une action peut être **composée** (ex: « action multiple précise »).
- Action improvisée **ne peut pas** être multiple.
- Action conservée s'applique **pendant** l'exécution d'une action multi-DT, pas après résolution.

---

## Partie C — Succès, réussites, critiques

### R-1.13 — Succès = 1 réussite par dé ≥ difficulté

**Énoncé legacy**
> « Si un moins 1 dé correspond ou est supérieur à la difficulté du jet, vous obtenez alors 1 réussite et l'action est considérée comme réussie. Si 2 dés sont supérieurs à cette difficulté, vous avez alors 2 réussites et ainsi de suite. »
> Source : [documents/regles/index.md:333-335](documents/regles/index.md)

**Statut** : 🟢 claire

**Implication** : l'intensité de la réussite (qualité du coup, dégâts bonus, effet secondaire) est proportionnelle au nombre de réussites.

---

### R-1.14 — Référentiel : 4 réussites = niveau professionnel

**Énoncé legacy**
> « On estime qu'un professionnel, dans son domaine, devrait faire en moyenne 4 réussites. »
> Source : [documents/regles/index.md:336](documents/regles/index.md)

**Statut** : 🟢 claire

**Usage** : calibrage des difficultés. Une tâche qui exige un pro = fixer les attentes à 4 réussites.

---

### R-1.15 — Règle du 10 : réussite + relance (potentiellement infinie)

**Énoncé legacy**
> « À chaque fois qu'un dé vous indique un 10, en plus de le compter parmi les réussites, vous pourrez le relancer et donc avoir une nouvelle chance de faire une réussite ou même un autre 10 qui sera à son tour comptabilisé et relancé. »
> Source : [documents/regles/index.md:430-433](documents/regles/index.md)

**Statut** : 🟢 claire

**Cas couverts** :
- 10 compte comme 1 réussite + relance
- Chaîne possible de relances infinies
- Confirmé par code : [_DiceManager.php:146-168](site/includes/managers/_DiceManager.php) (boucle de relance des 10)

**Cas ambigus** : les 1 obtenus **après** relance des 10 ne sont pas pris en compte (R-1.18).

---

### R-1.16 — Règle du 1 : annule 1 réussite (par valeur décroissante) + annule la cascade si 10

**Énoncé legacy**
> « Chaque 1 obtenu sur un dé annule une réussite, de la plus élevée à la plus petite. »
> Source : [documents/regles/index.md:434-437](documents/regles/index.md)

**Statut** : 🟢 claire (tranché par l'auteur le 2026-04-24)

**Décision** :
- **Ordre d'annulation** : valeur brute décroissante. Un 1 annule **d'abord les 10**, puis les 9, puis les 8, puis les 7 (jusqu'à la difficulté).
- **Les 1 sont résolus AVANT les réussites hors cascade**. Les 1 en excès (après avoir consommé toutes les réussites) causent l'échec critique (R-1.17).
- **Annulation d'un 10 = annulation en bloc** : quand un 1 annule un 10, **la cascade déclenchée par ce 10 est également annulée** (la relance n'a pas lieu, ou si déjà effectuée, ses réussites sont retirées).

**Ordre de résolution complet** — voir R-1.41 (règle de synthèse ajoutée).

**⚠️ Divergence code/règle** : [_DiceManager.php:84-102](site/includes/managers/_DiceManager.php) traite bien les 1 sur les 10 en priorité, mais la boucle de relance des 10 en fin de méthode ([_DiceManager.php:146-168](site/includes/managers/_DiceManager.php)) relance **tous** les 10 initiaux, y compris ceux qui ont été annulés par un 1. Bug : la cascade d'un 10 annulé ne devrait pas avoir lieu.

---

### R-1.17 — Échec critique : D100 pour gravité

**Énoncé legacy**
> « Il vous arrivera aussi (et ça, c'est rigolo) de faire plus de 1 que de réussites. Vous auriez donc un nombre de réussite en négatif. Nous appelons ceci, l'échec critique. Dans ce cas, quel que soient le nombre de 1 obtenus, lancer un D100 [...]. Plus le nombre sera élevé, plus votre action sera catastrophique. »
> Source : [documents/regles/index.md:437-440](documents/regles/index.md)

**Statut** : 🟢 claire (tranché par l'auteur le 2026-04-24)

**Décision** :
- **Un seul D100, sans multiplicateur**. Le nombre de 1 en excès des réussites n'influence pas le résultat — qu'on soit à -1 ou à -10, c'est un D100 brut.
- **Modèle de gravité : table générique + overrides par type d'action + liberté totale en mode humain** (Option C + E).

**Modèle** :
| Mode | Comportement |
|---|---|
| MJ humain | Liberté totale. Le MJ narre les conséquences comme il le souhaite en s'inspirant du chiffre (1 = ridicule, 100 = mortel). |
| MJ LLM | **Table générique par défaut** (10 tranches 1-10, 11-20, …, 91-100, chacune avec une description narrative d'intensité). Si le type d'action a un **override** (combat, magie, social, craft, exploration), c'est l'override qui s'applique. |
| MJ auto | Idem LLM — table générique par défaut, overrides par type d'action. Conséquences déterministes. |

**Table générique (à rédiger en D9/D10/D11 selon type)** :
| Tranche D100 | Intensité narrative |
|---|---|
| 1-10 | Ridicule / comique — aucun dommage, juste embarrassant |
| 11-25 | Gaffe mineure — perte de temps, effort gâché |
| 26-50 | Erreur notable — conséquence gênante (ressource perdue, moquerie publique) |
| 51-75 | Grave — dommage tangible (blessure légère, outil cassé) |
| 76-90 | Très grave — dommage lourd (blessure sérieuse, échec qui compromet la mission) |
| 91-99 | Catastrophique — dommage majeur (blessure critique, mort proche) |
| 100 | Mortel — conséquence létale ou irréversible |

**Overrides à rédiger dans les domaines concernés** :
- **D9 Combat** : blessure auto-infligée, arme cassée, chute, tir ami, allié touché
- **D8 Magie** : retour de sort, brûlure d'énergie double, manifestation incontrôlée, altération temporaire
- **D12 Social** : insulte publique, perte de crédibilité, offense de divinité
- **D10 Craft/Alchimie** : ingrédients perdus, objet raté et dangereux, explosion
- **D9 Exploration/Déplacement** : chute, désorientation, blessure environnementale

---

### R-1.18 — Les 1 obtenus après relance des 10 ne comptent pas

**Énoncé legacy**
> « Attention, les 1 obtenus après la relance des 10 ne sont pas pris en compte. »
> Source : [documents/regles/index.md:440](documents/regles/index.md)

**Statut** : 🟢 claire

**Implication code** : [_DiceManager.php:146-168](site/includes/managers/_DiceManager.php) — la boucle de relance des 10 ne modifie que `nbrOfSuccess` (via CRITICAL/YES), jamais `nbrOf1`. ✅ cohérent.

---

### R-1.19 — Réussite critique = autant ou plus de réussites que de dés lancés à la base

**Énoncé legacy**
> « Une réussite critique se dit d'un jet comportant autant, ou plus, de réussites que de dés lancé à la base. »
> Source : [documents/regles/index.md:433](documents/regles/index.md)

**Statut** : 🟢 claire (tranché par l'auteur le 2026-04-24)

**Décision** :
- **Pas d'effet mécanique chiffré**. Les règles historiques n'ont **jamais formalisé** un bonus (pas de "dégâts doublés", pas de "+1 niveau de qualité"). La qualité de l'action scale déjà linéairement avec le nombre de réussites (R-1.14 : 4 réussites = pro).
- **La réussite critique est un état explicite** que le moteur doit tracker — c'est un **flag** sur le résultat, pas un modificateur.
- **Effet narratif / RP** : déclenche un moment narratif enrichi — le joueur et/ou le MJ racontent l'action de manière plus détaillée que pour une réussite ordinaire.
- **En digital** : le moteur peut déclencher une **scène cinématographique**, un zoom visuel, un slow motion, un affichage particulier, une musique dédiée, une animation de l'attaque — bref, un **marqueur de moment fort**.

**Triggers de "moment narratif fort" (plus large que la seule R-1.19)** :
- Réussite critique (nb réussites ≥ nb dés lancés à la base)
- « Belle réussite » — nombre de réussites notablement élevé (seuil à définir par mode, ex: ≥ 2× le "pro moyen" de R-1.14 = ≥ 8 réussites)
- Réussite sur difficulté haute (typiquement difficulté > 9, cf. règle d'empilement R-1.20)

**Transposition par rythme / arbitre** :
| Mode | Comportement |
|---|---|
| MJ humain + tout rythme | Pause narrative implicite, joueur/MJ enrichissent la description |
| MJ LLM | Le LLM génère un paragraphe narratif plus dense lorsque le flag est levé |
| MJ auto + temps réel | Scène cinématographique (anim, ralenti, effet visuel) |
| MJ auto + tour par tour | Highlight du coup, bannière "CRITIQUE", narration pré-écrite choisie dans une pool |

**Cumul** : si plusieurs triggers s'activent en même temps (ex: réussite critique ET difficulté > 9), le moteur utilise le niveau d'emphase le plus fort disponible (ne pas jouer deux animations consécutives).

---

## Partie D — Difficultés > 9 (règle d'empilement)

### R-1.20 — Difficulté > 9 : empilement de 9 + dernier chiffre

**Énoncé legacy**
> « Il vous faut encore savoir que l'on ne peut demander un 10 pour réussir une action (étant donné que l'on a autant de chance de faire un 10 qu'un 1). Lorsque qu'une difficulté dépassera 9, le joueur devra alors obtenir un 9 sur un dé, plus encore un autre chiffre sur un autre dé en partant de 5 jusqu'à 9 et ainsi de suite. »
> Source : [documents/regles/index.md:441-455](documents/regles/index.md)

**Table officielle (texte)** :
| Diff | Exigence |
|---|---|
| 10 | 9 + 5 |
| 11 | 9 + 6 |
| 12 | 9 + 7 |
| 13 | 9 + 8 |
| 14 | 9 + 9 |
| 15 | 9 + 9 + 5 |
| 16 | 9 + 9 + 6 |
| 17 | 9 + 9 + 7 |
| 18 | 9 + 9 + 8 |
| 19 | 9 + 9 + 9 |
| 20 | 9 + 9 + 9 + 5 |

**Formule texte** : « Diviser la difficulté par 5. Cela vous donne le nombre de chiffres à obtenir. Le reste + 5 étant le dernier chiffre après les 9. »

**Interprétation correcte** : `nbChiffres = floor(difficulté / 5)`, `dernierChiffre = (difficulté % 5) + 5`.

**Mécanique de réussites supplémentaires** : « Une fois la difficulté obtenue sur les dés, les réussites supplémentaires sont comptabilisées sur chaque 9 ou plus qui viennent s'y ajouter. »

**Statut** : 🔴 **ambiguë + DIVERGENCE CODE/TEXTE**

**Cas ambigus / bugs identifiés** :

1. **🔴 Divergence code vs texte (diff 13, 14, 18, 19)** :
   Le code PHP utilise `number_format($difficulty / 5, 0)` qui applique un **arrondi standard** (round) au lieu d'un `floor()`.
   - Pour diff 13 : `number_format(2.6, 0)` = `"3"` → code exige **3 chiffres** (9+9+8).
   - Pour diff 13 : le texte dit **2 chiffres** (9+8). L'exemple du texte explicite : « avec un seul dé et une difficulté de 13, un joueur devra faire d'abord un 10, qu'il pourra relancer pour ensuite obtenir un 8 minimum » → confirme 2 résultats successifs = 2 chiffres.
   - **Cas divergents** : diff 13, 14, 18, 19 (toutes les diff où `diff % 5 > 2` et `diff / 5` n'est pas entier).

   **Question pour l'auteur** : le texte fait foi → le code a un bug. Faut-il utiliser `floor()` ou conserver le comportement code comme règle officielle ?

2. **Mécanique multi-dés précisée par l'auteur (2026-04-24)** :
   Les 10 peuvent **se substituer** au chiffre "9" requis dans la séquence (n'importe quel dé participant à une réussite peut être remplacé par un 10), MAIS un 10 seul **ne remplit qu'une seule position** de la séquence.

   **Exemples** :
   - **Diff 9, 1 dé, fait 10** → réussite (10 ≥ 9). Relance.
   - **Diff 10, 1 dé, fait 10** → échec au 1er jet (10 ≠ "9+5", il manque le 5). MAIS le 10 relance. Si la relance fait ≥ 5, la séquence "10 + 5+" forme une réussite. Si la relance fait ≤ 4, échec.
   - **Diff 10, 2 dés, fait 10 et 6** → le 10 fournit le "9", le 6 fournit le "5+" → réussite. Le 10 relance normalement (cascade).
   - **Diff 15, 3 dés, fait 10/9/5** → séquence "9-9-5" formée → réussite. Le 10 relance.
   - **Diff 15, 2 dés, fait 10/9** → partiellement formé (9-9 mais il manque le 5). Si la cascade du 10 fait ≥5, la séquence "9-9-5" se complète → réussite.

**Précisions apportées** :
- Formule : `nbChiffres = floor(diff/5)`, `dernierChiffre = (diff%5)+5`, les `nbChiffres-1` premiers = 9 (ou 10 substitutif).
- Corriger la formule code en `floor()` au lieu de `round()`/`number_format`.
- La cascade des 10 peut "compléter" une séquence incomplète.

---

## Partie E — Actions spéciales

### R-1.21 — Action simple = cas par défaut

**Énoncé legacy**
> « Les actions simples représentent la plupart des actions qui seront effectuées. »
> Source : [documents/regles/index.md:389-392](documents/regles/index.md)

**Statut** : 🟢 claire

---

### R-1.22 — Actions multiples : répartition libre des dés d'aptitude

**Énoncé legacy**
> « Il faut alors répartir ses points d'aptitude dans les diverses actions. La répartition de ces points est libre et au choix du joueur. »
> Source : [documents/regles/index.md:413](documents/regles/index.md)

**Exemple canonique** : Salogel tire + fuit. Dex 4 répartie librement. Possible : 1 dé sur tir, 3 dés sur fuite ; ou tout sur fuite ; etc. Les points de **compétence/spécialisation** ne se divisent pas — ils sont utilisables plein pot sur chaque action.

**Statut** : 🟢 claire

**Cas ambigus** : si deux actions simultanées utilisent la **même** compétence/spé (ex: 6 bras armés d'un naga), toutes les actions bénéficient du plein pot. Seules les aptitudes se divisent.

---

### R-1.23 — Contre-action : diminue les réussites adverses

**Énoncé legacy**
> « Une contre action est le fait de faire des réussites afin de diminuer le nombre de réussites, d'une action que l'ont souhaite contrer. »
> Source : [documents/regles/index.md:419-424](documents/regles/index.md)

**Cas limite** : si la contre-action fait **plus** de réussites que l'action initiale, celle-ci est neutralisée (0 réussites), **pas** transformée en échec critique.

**Statut** : 🟢 claire

---

### R-1.24 — Action conservée : +1 difficulté par point de dégât subi

**Énoncé legacy**
> « Lorsqu'une action est entreprise, et que pendant que celle-ci s'opère, le personnage reçoit des points de dégâts, la difficulté de cette même action se voit augmentée du nombre de dégâts reçus. »
> Source : [documents/regles/index.md:425-429](documents/regles/index.md)

**Statut** : 🟢 claire

**Transposition** : nécessite un état temporel (action en cours pendant N DT). Facile en tour par tour, plus complexe en temps réel (besoin de tracker `damageTakenDuringAction`).

---

### R-1.25 — Une action peut être interrompue à tout moment

**Énoncé legacy**
> « Il est important de savoir qu'à tout moment, une action peut être interrompue (souvent pour en recommencer une autre, mais parfois aussi pour attendre). »
> Source : [documents/regles/index.md:321](documents/regles/index.md)

**Statut** : 🟢 claire

**Transposition par rythme**
- *Tour par tour* : le joueur déclare une action, peut annuler avant résolution.
- *Temps réel* : l'action en cours peut être interrompue par input ; les DT déjà écoulés sont perdus (pas de « demi-action »).
- *Async* : peu pertinent (actions résolues à la rédaction du post).

**Cas ambigu** : les points d'énergie dépensés pour un sort interrompu sont **perdus** (règle magique, cf. D8).

---

## Partie F — D20 (tests de volonté)

### R-1.26 — Test de volonté = D20 ≥ F.Volonté (+ malus)

**Énoncé legacy**
> « Celui-ci consiste simplement à jeter un D20 et à espérer obtenir son facteur ou plus afin de "réussir" son test. »
> Source : [documents/regles/index.md:25](documents/regles/index.md)

**Statut** : 🟢 claire

**Confirmation code** : [_DiceManager.php:209-240](site/includes/managers/_DiceManager.php) — `rollD20()` compare simplement `value >= difficulty`.

**Usage** : déclenché sur circonstance émotionnelle (peur, charme, gêne, rage). Réservé au **joueur** pour décider sa réaction. Peut être imposé par MJ.

---

### R-1.27 — D20 : 1 = échec auto, 20 = réussite auto (inconditionnel)

**Énoncé legacy**
> « Sachez encore qu'un 1 est toujours considéré comme un échec alors que le 20 est toujours considéré comme une réussite quelque soit les malus de volonté. »
> Source : [documents/regles/index.md:48](documents/regles/index.md)

**Statut** : 🟢 claire (tranché par l'auteur le 2026-04-24)

**Décision** : les règles "1 = échec" et "20 = réussite" sont **inconditionnelles** et s'appliquent à **toute difficulté**, y compris les cas limites (diff 1 et diff > 20). C'est l'équivalent D20 de la "part d'aléa incompressible" (5% plancher / plafond garantis).

**Cas limites confirmés** :
- **Difficulté 1** (perso ultra-volontaire, F.Volonté = 1, aucun malus) : un tirage de 1 est **toujours un échec**, même si `value >= difficulty` serait techniquement vrai. 5% d'échec incompressible.
- **Difficulté > 20** (malus cumulés extrêmes poussant le seuil au-delà) : un tirage de 20 est **toujours une réussite**, même si `value >= difficulty` est faux. 5% de réussite incompressible.

**⚠️ Bug code à corriger** : [_DiceManager.php:220-224](site/includes/managers/_DiceManager.php) utilise uniquement `value >= difficulty`. La logique correcte doit être :

```
if value == 1:
    success = 'NO' (échec auto, inconditionnel)
elif value == 20:
    success = 'YES' (réussite auto, inconditionnelle)
elif value >= difficulty:
    success = 'YES'
else:
    success = 'NO'
```

---

### R-1.28 — Malus de volonté : MJ ou réussites adverses

**Énoncé legacy**
> « Le MJ peut décider d'augmenter la difficulté d'un test de volonté. [...] Mais, des malus peuvent aussi être entraînés par un autre personnage. »
> Source : [documents/regles/index.md:42-47](documents/regles/index.md)

**Exemple canonique** : demoiselle fait un jet de séduction (D10) sur un humain (F.Volonté 12) et obtient 3 réussites. Seuil devient 12 + 3 = **15** à atteindre sur D20.

**Statut** : 🟢 claire

**Implication architecturale** : **pont D10 → D20** — les réussites d'un jet d'action peuvent alimenter la difficulté d'un test de volonté adverse. Cette mécanique unifie les deux systèmes de dés.

---

### R-1.29 — Test de volonté : deux types (indicatif vs mécanique)

**Énoncé legacy**
> « Ce jet n'existe qu'à but indicatif, pour vous aiguiller dans la réaction que vous déciderez d'adopter avec votre personnage. [...] Le joueur peut parfois décider de ne pas jeter le dé s'il pense savoir exactement comment réagirait son personnage. »
> Source : [documents/regles/index.md:28, 37](documents/regles/index.md)

**Statut** : 🟢 claire (tranché par l'auteur le 2026-04-24)

**Décision** : la règle d'optionalité s'applique **uniquement aux tests indicatifs**. Il existe **deux types** de tests de volonté distincts.

#### Type 1 — Test indicatif (RP / émotionnel)

**Définition** : le D20 aide le joueur à jouer la **réaction émotionnelle** de son personnage (peur, attirance, gêne, pitié, surprise). Le résultat n'applique **aucun modificateur mécanique automatique** aux dés ou aux effets.

**Règle** : **optionnel**. Le joueur peut refuser le jet ou ignorer son résultat, **à condition de fournir une justification narrative** (background, race, culture, psychologie déjà établie).

**Exemples** :
- Humaine tente de séduire un homme-lézard → l'homme-lézard peut refuser le jet ("mon espèce n'est pas sensible aux traits humains")
- Humain face à un troll → le joueur peut refuser le jet ("mon chevalier paladin ne fuit jamais, c'est son serment")

#### Type 2 — Test mécanique (règle)

**Définition** : le D20 est utilisé par le MJ / le système pour **calibrer un effet mécanique concret** :
- Modificateur de difficulté (ex: stress de combat → +N aux prochaines attaques)
- Résistance à un sort (ex: sort de sommeil → test pour résister)
- Durée d'un effet
- Seuil de contrainte physique/mentale

**Règle** : **obligatoire**. Le résultat s'applique automatiquement. **Exceptions** possibles au cas par cas via des règles explicites (atouts d'immunité, résistances raciales, sorts de contre-mesure).

**Exemples** :
- Humain seul contre 20 orcs → MJ fait un test de volonté, échec → +3 à sa difficulté sur ses prochaines attaques (mécanique, non-refusable)
- Sort de *Sommeil* ciblé → test de volonté pour résister à l'effet (mécanique, non-refusable sauf immunité)

#### Validation de la justif (test indicatif refusé)

**Décision (Option Y)** : le **joueur est toujours cru**. Le moteur **loggue** la justification (traçabilité). Les abus répétés se voient dans l'historique et sont sanctionnés **a posteriori** (ex: XP réduits comme dans la règle papier — « le MJ devrait réduire les points d'expérience attribués aux joueurs qui abusent »).

- **Pas** de validation bloquante de la justif → pas de friction dans le flow de jeu.
- Le log peut être consulté par le MJ humain ou analysé statistiquement en mode LLM (ex: "ce joueur refuse 80% des tests indicatifs — sanction XP applicable").

#### Matrice complète par mode

| Mode | Test indicatif | Test mécanique |
|---|---|---|
| MJ humain | Optionnel + justif logguée (traçabilité). MJ sanctionne l'abus via XP. | Obligatoire. MJ peut accorder exception narrative ponctuelle. |
| MJ LLM | Optionnel + justif logguée. LLM vérifie statistiquement la cohérence avec la fiche + historique. | Obligatoire. LLM applique les exceptions codifiées (atouts, immunités). |
| MJ auto | Deux sous-modes au choix : (a) Optionnel avec justif structurée choisie dans menu pré-rempli à partir de la fiche ; (b) "RPG dur" qui désactive les tests indicatifs (tous sont mécaniques). | Obligatoire, stricte. Exceptions via flags sur le perso (atouts, immunités codifiés). |

**Conséquence architecturale** : chaque déclenchement de test de volonté doit être **typé à la source** (`'indicative'` ou `'mechanical'`) pour que le moteur applique le bon comportement.

---

## Partie G — D100 (chance, résistances, zones)

### R-1.30 — D100 = 2×D10 (dizaine + unité, 00 = 100)

**Énoncé legacy**
> « Un D10 pour la dizaine et un autre pour l'unité, le 00 représentant le 100. »
> Source : [documents/regles/index.md:438, 464](documents/regles/index.md)

**Statut** : 🟢 claire

**Confirmation code** : [_DiceManager.php:172](site/includes/managers/_DiceManager.php) — `rand(1, 100)` (abréviation directe, résultat identique).

---

### R-1.31 — Chance = D100 ≤ seuil %

**Énoncé legacy**
> « La chance qu'un évènement se produise est toujours représentée en pourcentage. Pour que l'effet en question se manifeste, un nombre égal ou inférieur à ce pourcentage doit être obtenu sur un D100. »
> Source : [documents/regles/index.md:463-464](documents/regles/index.md)

**Statut** : 🟢 claire

---

### R-1.32 — Résistances (magie, froid, alcool, poison) : D100 ≤ seuil %

**Énoncé legacy**
> « Les résistances, que se soit à la magie, au froid ou à l'alcool se gèrent toutes à l'aide du dé de chance. »
> Source : [documents/regles/index.md:474-479](documents/regles/index.md)

**Statut** : 🟢 claire

---

### R-1.33 — Résistances : système multi-couches (résistance magique + armure + élémentaires + …)

**Énoncé legacy (résistance magique)**
> « Cette résistance protège uniquement de la magie directe. C'est-à-dire un sort qui agit directement sur la cible (comme un contrôle mental, une transformation en grenouille, une illusion, ...) et ne protège en rien de ce qui a été créé, transformé ou invoqué magiquement (comme une boule de feu, un enchantement des statues, un sort de lumière, une invocation, divination, ...). Ce qui signifie que cette résistance peut se révéler être un fardeau lors d'un sort bénéfique comme les soins, les bénédictions, ... »
> Source : [documents/regles/index.md:474-479](documents/regles/index.md)

**Statut** : 🟢 principe clair — **modélisation complète renvoyée aux D8/D9/D10** (tranché 2026-04-24)

#### Principe général

**Toute résistance utilise la mécanique D100 ≤ % (R-1.32)**. Le moteur doit évaluer **la bonne couche de résistance** selon le type d'agression. Il n'existe **pas une résistance générique** — chaque attaque transite par une ou plusieurs résistances pertinentes.

#### Classification (à affiner en D8/D9/D10)

**Sorts directs** (la magie agit directement sur la cible vivante) :
- Contrôle mental, transformation, illusion, charme, peur
- **Soins, bénédictions, buffs magiques** (directs eux aussi — cible la cible vivante)
- Résistance magique (D100) applicable comme bouclier ET comme fardeau (soins bloqués)

**Sorts indirects** (la magie crée/transforme/invoque quelque chose qui agit ensuite) :
- Boule de feu, sorts élémentaux offensifs
- Enchantement d'objet, lumière, invocation, divination
- La résistance magique ne s'applique **pas** — mais d'autres résistances oui (armure, résistance élémentaire)

#### Catalogue des types de résistance connus (liste non-exhaustive, à enrichir en D8/D10)

| Résistance | Cible | Où modélisée |
|---|---|---|
| Résistance magique (% D100) | Magie directe | D8 Magie |
| Armure / Défense énergétique (valeurs P/E/C/T) | Dégâts physiques + énergétiques (sorts indirects élémentaires inclus) | D10 Équipement + D9 Combat |
| Résistances élémentaires (feu, froid, acide, foudre, …) | Dégâts énergétiques d'un type précis | D8 Magie + D9 Combat |
| Résistance aux poisons / maladies | Agents toxiques, infections | D9 Combat + D11 Bestiaire (effets NPC) |
| Résistance à la peur / contrôle mental (via volonté) | Effets sur la psyché | D1 R-1.26 à R-1.29 (test de volonté) |
| *Autres à identifier* | *…* | *à cataloguer* |

#### Ordre d'évaluation des résistances (esquisse — à valider en D9 Combat)

Pour une attaque qui arrive sur un perso, le moteur évalue dans l'ordre :

1. **Bouclier passif** (D100 ≤ % bouclier, R-1.34) — dévie si succès
2. **Résistance magique** si sort direct (D100 ≤ % résistance)
3. **Résistance élémentaire** si élément spécifique (réduction / immunité dédiée)
4. **Armure** (soustraction des valeurs P/E/C/T selon type de dégât)
5. **Endurance** (jet d'absorption final, [regles:540-545](documents/regles/index.md))

**Conséquence architecturale** : chaque sort, attaque ou effet a un **vecteur de tags** (`{direct|indirect, element?, type_de_degat?, cible_type?}`) qui détermine quelles couches de résistance s'appliquent.

#### Question ouverte persistante

**Organisation documentaire** : faut-il un **domaine dédié "Résistances"** (par exemple D13bis) ou répartir la modélisation entre D8 (résistance magique + élémentaires), D9 (armure + endurance) et D10 (catalogue armures) ?
→ À trancher au démarrage de D8.

---

### R-1.34 — Bouclier passif = D100 ≤ % bouclier

**Énoncé legacy**
> « Chaque bouclier possède un pourcentage de chance de vous protéger qui augmente avec la taille de celui-ci. [...] Lancer un D100, si vous faites le facteur de votre bouclier ou moins, le coup est dévié. »
> Source : [documents/regles/index.md:470-471](documents/regles/index.md)

**Statut** : 🟡 incomplète

**Cas ambigus** :
- Seule la mécanique « passive » (sans action) est détaillée ici. L'usage actif (jet Dextérité + Bouclier) est évoqué mais renvoyé à la mécanique générale R-1.2.
- Pas de table des % par bouclier dans les sources markdown → **à chercher en D10 (Équipement) + code**.

---

### R-1.35 — Zones touchées aléatoires : D100 + Table des Touches

**Énoncé legacy**
> « Lorsqu'un coup est donné sans précision sur la zone visée, vous pouvez lancer un D100 et vous référer aux "Tables des touches". Plus le nombre sera élevé, plus la zone touchée sera vitale. »
> Source : [documents/regles/index.md:480-483](documents/regles/index.md)

**Statut** : 🔴 ambiguë

**Cas ambigus / trous** :
- **Tables des touches** mentionnées (général, corps à corps, …) mais **pas présentes** dans les docs scraped.
- Conséquences mécaniques (dégâts doublés tête, pas d'endurance gorge/yeux/parties) dans R-combat ([documents/regles/index.md:532-537](documents/regles/index.md)) mais sans les tables de répartition D100.

**À faire en D9 (Combat)** : retrouver ou reconstruire les tables de touches.

---

## Partie H — Modèle complet des modificateurs

> Synthèse transversale (validée avec l'auteur le 2026-04-23) — cadre complet pour les moteurs digital / auto.

### Principe : empilement linéaire sans plafond

**Toutes** les sources de modificateurs se **somment** (pas de multiplication, pas d'exposant, pas de rendement décroissant). Il **n'y a pas de plafond** de difficulté : les règles d'empilement R-1.20 s'étendent indéfiniment (25 = 99995, 30 = 999995, etc.).

**Action "impossible" mathématiquement** = le jet est **quand même autorisé**. Le MJ informe le joueur de la difficulté affichée, le joueur choisit de tenter ou non (décision RP). La relance infinie des 10 garantit une probabilité strictement > 0.

### R-1.36 — Sources modifiant la difficulté

| # | Source | Direction | Référence |
|---|---|---|---|
| 1 | Difficulté de base (standard 7 ou convenue arme/sort) | = | R-1.7, R-1.8 |
| 2 | Compétence adéquate ≥ 1 | −1 | R-1.9 |
| 3 | Spécialisation(s) adéquate(s), cumulables | −1 chacune | R-1.10 |
| 4 | Type d'action (précise, improvisée, multiple, conservée) | + selon type | R-1.12 |
| 5 | Circonstances libres (MJ) | ± libre (garde-fou : ne dépasse pas la valeur qu'il mesure) | R-1.11 |
| 6 | Atouts du personnage pertinents | ± selon atout | D4 atouts (renvoi) |
| 7 | Atouts / handicaps de l'adversaire (applicables contre le jet actuel) | + adverse | D4 atouts (renvoi) |
| 8 | Effets magiques actifs sur le personnage (buffs/debuffs) | ± selon effet | R-1.37 |
| 9 | Propriétés magiques / enchantements de l'équipement utilisé | ± selon objet | R-1.38 |

### R-1.37 — Sources modifiant le pool de dés

| # | Source | Direction | Référence |
|---|---|---|---|
| 1 | Points d'aptitude + compétence + Σ spé | pool de base | R-1.2 |
| 2 | Attribut nul (0) | pool = 0 pour cette aptitude | R-1.6 |
| 3 | Malus d'affaiblissement (blessures > ½ vitalité) | −N sur aptitudes concernées | détaillé en D9 Combat |
| 4 | Effets magiques sur les aptitudes (affaiblissement, buff) | ± sur aptitudes | R-1.37 (cet encart) |
| 5 | Action multiple (répartition libre des dés d'aptitude) | aucun changement du pool total, mais redistribution | R-1.22 |

### R-1.38 — Sources modifiant le temps (facteur de vitesse)

| # | Source | Direction | Référence |
|---|---|---|---|
| 1 | Facteur de vitesse de base (race) | = | D3 Races (renvoi) |
| 2 | Encombrement (> Force × 5 kg) | +1 FV par 5 kg supplémentaires | [regles:254-259](documents/regles/index.md) — détaillé en D9 Combat |
| 3 | Effets magiques sur le FV (lenteur, hâte) | ± | R-1.38 (cet encart) |
| 4 | Atouts qui modifient la vitesse d'action | ± selon atout | D4 atouts (renvoi) |

### R-1.39 — Effets magiques actifs (buffs/debuffs) comme modificateurs

**Principe** : un sort lancé sur un personnage (par soi-même ou par autrui) peut modifier temporairement :
- Une ou plusieurs aptitudes (ex: *affaiblissement* → Force −N) → impact **pool**
- Un facteur (ex: *hâte* → FV −N) → impact **temps**
- La difficulté d'une catégorie d'actions (ex: *bénédiction* → −1 sur jets d'attaque ; *malédiction* → +1) → impact **difficulté**
- Des capacités sensorielles (aveuglement, surdité) → impact circonstances R-1.11

**Cumul** : plusieurs effets magiques actifs se cumulent linéairement comme le reste.

**Durée** : définie par le sort (voir D8 Magie pour la modélisation de la durée et des effets).

**Déclenchement** : souvent lié à un atout ou sort du personnage lui-même ; parfois déclenché par un autre personnage (atout/compétence/sort offensif).

**Statut** : 🟢 principe clair, catalogue des effets → renvoi D8 (Magie) pour l'énumération exhaustive par sort.

### R-1.41 — Ordre de résolution complet d'un jet D10 (pseudocode canonique)

**Statut** : 🟢 claire (décision auteur 2026-04-24)

Pour un jet de `N` dés D10 à difficulté `D` :

```
1. Lancer N dés. Chaque dé a une valeur v ∈ [1..10].

2. Identifier :
   - nb10     = nombre de dés qui ont fait 10
   - nb1      = nombre de dés qui ont fait 1
   - réussites bruts = dés tels que v ≥ D et v ≠ 10 (pour D ≤ 9)
                     ou selon règle d'empilement (pour D > 9, voir R-1.20)

3. Résolution des 1 (AVANT les succès hors cascade) :
   a) Soustraire les 1 aux 10 en priorité.
      Chaque 10 annulé perd AUSSI sa future cascade (étape 6).
      nb10  ← max(0, nb10  − nb1)
      nb1   ← max(0, nb1   − nb10_initial)
   b) Si des 1 restent, soustraire aux autres réussites par valeur décroissante
      (9, puis 8, puis 7, ...).
      réussites ← max(0, réussites − nb1_restants)
      nb1_restants ← max(0, nb1_restants − réussites_initiales)

4. Les 10 NON annulés comptent chacun comme 1 réussite.
   réussites_totales = réussites + nb10_survivants

5. Si (réussites_totales < 0) après soustraction des 1 restants :
   → Échec critique (R-1.17). Lancer un D100 de gravité.

6. Cascade des 10 survivants :
   Pour chaque 10 non annulé :
      Relancer un D10 à difficulté min(D, 9) (on ne peut pas demander un 10 en relance).
      Si le nouveau dé ≥ difficulté : réussites_totales += 1, et si c'est un 10, relancer à nouveau.
      Les 1 obtenus en relance SONT IGNORÉS (R-1.18).

7. Cas particulier difficulté > 9 :
   Si à l'étape 2 aucune "séquence complète" (ex: 9+5 pour diff 10) n'a été formée
   mais qu'un dé a fait 10, la cascade peut COMPLÉTER la séquence.
   Voir R-1.20 pour détail.

8. Si (réussites_totales ≥ N) : c'est une RÉUSSITE CRITIQUE (R-1.19).

Retourner réussites_totales.
```

**Conséquences importantes** :
- Les 10 sont "les réussites les plus précieuses" mais aussi **les plus vulnérables aux 1**.
- Un jet avec 3 dés qui sortent 10/10/1 donne : le 1 annule un 10 (et sa cascade) ; reste 2 × 10 → 2 réussites + leurs 2 cascades.
- Un jet avec 3 dés qui sortent 10/7/1 (diff 7) : le 1 annule le 10 (et sa cascade) ; reste le 7 → 1 réussite nette.

---

### R-1.40 — Propriétés particulières de l'équipement

**Principe** : un objet (arme, armure, autre) peut avoir des propriétés qui modifient la difficulté et/ou les effets de son usage. Ces propriétés se déclinent en **4 catégories** cumulables (précisé par l'auteur 2026-04-24) :

#### R-1.40.a — Qualité de fabrication (non-magique)

Comme dans le monde réel, deux objets du même type peuvent avoir des qualités différentes :
- **Arme** : réduction de difficulté de maniement (équilibrage, légèreté, ergonomie) et/ou augmentation des dégâts (qualité du métal, affûtage, fil)
- **Armure** : résistance accrue contre un ou plusieurs types de dégâts (perforant, énergétique, contendant, tranchant)

**Origine** : simple travail d'artisan. Accessible à tout forgeron, tanneur, armurier, etc.

#### R-1.40.b — Enchantement magique (magiciens uniquement)

Application d'un sort sur un objet existant pour lui conférer des propriétés magiques durables : modificateurs de difficulté/dégâts, effets passifs (lumière, chaleur, résistance magique), effets actifs (arme qui empoisonne, armure qui régénère…).

**Origine** : magicien qui maîtrise l'école appropriée. Renvoi D8 Magie pour les sorts d'enchantement et leurs coûts.

#### R-1.40.c — Runes (non-magiciens)

Équivalent des enchantements mais réalisé par des **non-magiciens** via le tracé de runes. Type d'inscription permanente qui confère des effets similaires aux enchantements magiques, sans recourir à la magie active.

**Origine** : compétence spécifique (ex: "Rune (armurier)") ou classe spécialisée (runemaker, scribe runique). Renvoi D5 (Compétences) et D10 (Équipement) pour le catalogue.

#### R-1.40.d — Attributs spéciaux d'atouts d'artisan

Un artisan qui possède certains atouts de classe peut, lors de sa fabrication, imprimer à son œuvre des propriétés particulières héritées de son atout (ex: "Forge d'élite" → +1 dégâts à toute arme forgée par ce perso ; "Tanneur maître" → armure légère = +1 point de résistance).

**Origine** : atout spécifique de l'artisan qui fabrique l'objet. Renvoi D4 (Atouts) pour le catalogue exhaustif.

---

**Cumul inter-catégories** : les 4 catégories **s'additionnent linéairement**. Une épée peut être à la fois de bonne qualité (a), enchantée (b) ET créée par un maître forgeron (d).

**Cumul intra-catégorie** : *(question ouverte en D10)* — par exemple, deux enchantements de même type peuvent-ils coexister sur un même objet ?

**Statut** : 🟡 principe clair, catalogue complet → renvoi D4 (atouts) + D10 (équipement).

---

## Synthèse & questions bloquantes

### Matrice de transposition (règle × combinaison viable)

Légende : ✅ sans adaptation / 🔧 adaptation mineure / ⚠️ adaptation majeure / ❌ incompatible

| Règle clé | Legacy+MJhumain+Async | Legacy+MJhumain+TourTour | Digital+MJauto+Temps réel | Digital+LLM+TourTour |
|---|---|---|---|---|
| R-1.2 pool de dés | ✅ | ✅ | ✅ (mapping action→pool) | ✅ |
| R-1.11 modif circonstances | ✅ | ✅ | 🔧 (table finie) | 🔧 (LLM borné) |
| R-1.15 relance des 10 | ✅ | ✅ | ✅ | ✅ |
| R-1.20 diff > 9 | ✅ | ✅ | ⚠️ (bug code à corriger) | ⚠️ |
| R-1.24 action conservée | ✅ | ✅ | 🔧 (état pendant l'action) | ✅ |
| R-1.25 interruption | ✅ | ✅ | 🔧 (état pendant l'action) | ✅ |
| R-1.29 volonté indicative | ✅ | ✅ | ❌ (doit être déterministe) | 🔧 (contrainte souple) |

### Questions bloquantes à trancher avec l'auteur (résumé)

1. ~~**R-1.6** — « Attribut nul = échec total » : déclenche-t-il un D100 d'échec critique ou juste 0 réussites ?~~ ✅ **Tranché (2026-04-23)** : 0 réussite forcée sans D100.
2. ~~**R-1.11** — Fourchette recommandée pour le modificateur de circonstances ?~~ ✅ **Tranché (2026-04-23)** : hybride par mode (humain libre / LLM borné / auto table finie) + garde-fou universel "un modif ≤ ce qu'il mesure".
3. ~~**R-1.12** — Barème objectif pour les actions précises (+1/+2/+3) ?~~ ✅ **Tranché (2026-04-23)** : échelle indicative 3 niveaux pour débutants, extension libre au-delà. Modèle complet des modificateurs consolidé en R-1.36/37/38/39/40.
4. ~~**R-1.16** — L'annulation d'un 10 par un 1 annule-t-elle aussi la relance déjà effectuée ?~~ ✅ **Tranché (2026-04-24)** : oui, annulation en bloc. Ordre de résolution consolidé en R-1.41.
5. ~~**R-1.17** — Table de gravité pour le D100 d'échec critique (par type d'action) ?~~ ✅ **Tranché (2026-04-24)** : table générique 10 tranches + overrides par type d'action (combat, magie, social, craft, exploration). Liberté totale en mode humain. Pas de multiplicateur selon le nombre de 1 en excès.
6. ~~**R-1.19** — Effet mécanique d'une **réussite critique** (≥ dés initiaux) ?~~ ✅ **Tranché (2026-04-24)** : pas d'effet mécanique chiffré. Flag explicite tracké par le moteur, déclenche un moment narratif / cinématographique. Élargi à "moments narratifs forts" (critique + belle réussite + diff>9).
7. ~~**R-1.20** — 🔴 **DIVERGENCE CODE/TEXTE** : la formule pour diff > 9 est `floor()` (texte) ou `round()` (code actuel — bug) ?~~ ✅ **Tranché (2026-04-24)** : `floor()` (texte fait foi). Code à corriger si réutilisé.
8. ~~**R-1.20** — Comment la règle d'empilement fonctionne-t-elle avec **plusieurs dés** (vs 1 seul) ?~~ ✅ **Tranché (2026-04-24)** : un 10 se substitue à **un** chiffre requis dans la séquence, pas plusieurs. Cascade d'un 10 peut "compléter" une séquence incomplète.
9. ~~**R-1.27** — Le test D20 à difficulté 1 doit-il traiter le 1 comme échec auto (texte) ou comme succès (code actuel) ?~~ ✅ **Tranché (2026-04-24)** : 1 = échec auto inconditionnel, 20 = réussite auto inconditionnelle, valable même pour diff 1 ou diff > 20. Bug code à corriger.
10. ~~**R-1.29** — Dans les modes digital non-humain, le test de volonté est-il déterministe ou laisse-t-il une marge d'override au joueur ?~~ ✅ **Tranché (2026-04-24)** : deux types de tests distincts — indicatif (optionnel avec justif logguée, sanction XP a posteriori) et mécanique (obligatoire sauf exceptions codifiées). Typage à la source du déclenchement.
11. ~~**R-1.33** — Marquer explicitement chaque sort comme `direct: bool` dans le Grand Grimoire ?~~ ✅ **Tranché (2026-04-24)** : système de résistances multi-couches (magique, armure, élémentaire, autres). Modélisation complète renvoyée aux D8/D9/D10. Soins/bénédictions = directs. Question persistante : domaine dédié "Résistances" ou réparti — à trancher au démarrage de D8.

### Données à remonter en aval

- **R-1.31 à R-1.35** : toutes les tables de % (boucliers, résistances, zones touchées) sont à retrouver en **D10 (Équipement)** ou à reconstruire.
- **R-1.5 + R-1.12** : l'ensemble « types d'actions + aptitudes imposées » sera la base de la modélisation du combat **D9**.
- **R-1.28** : le « pont D10 → D20 » (réussites alimentent le seuil de volonté adverse) est une mécanique transversale à garder présente à l'esprit pour D5 (Compétences sociales) et D9 (Combat).

---

## Acceptance checklist pour l'auteur

- [ ] Validation globale du cadre mécanique D10 / D20 / D100
- [ ] Trancher les 11 questions bloquantes ci-dessus
- [ ] Confirmer la **matrice de transposition** (quelles combinaisons sont attendues comme viables)
- [ ] Autoriser la correction du code PHP diff>9 (`floor` au lieu de `round`) si on réutilise ce moteur quelque part

Une fois validé → passage à **D2 (Attributs)**.
