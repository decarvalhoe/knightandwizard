# D3 — Races (33 races + règles raciales transversales)

> Les races sont le socle du personnage. Elles déterminent la catégorie (rythme de progression), les stats de base (vitalité, facteurs), les plafonds d'aptitudes, et octroient des atouts/handicaps raciaux. Tous les personnages (PJ et PNJ) utilisent le même modèle racial.

**Sources** :
- [documents/bestiaire/index.md](documents/bestiaire/index.md) — 33 races, version web **canonique**
- [regles-papier/extracted/listes/bestiaire.md](regles-papier/extracted/listes/bestiaire.md) — 32 races détaillées, paper (manque Zombie)
- [regles-papier/extracted/listes/lexique.md](regles-papier/extracted/listes/lexique.md) — descriptions des atouts/handicaps
- [regles-papier/extracted/listes/atouts-de-niveaux.md](regles-papier/extracted/listes/atouts-de-niveaux.md) — atouts de niveau conditionnés par race
- [documents/regles/index.md:8-14](documents/regles/index.md) — règles générales races/atouts/handicaps
- [site/includes/managers/_DBManager.php:737-774, 2462-2510](site/includes/managers/_DBManager.php) — structure DB race

**Note de divergence** : la version web liste **33 races** (inclut Zombie absent du paper). Priorité web = canonique → Zombie est inclus dans le catalogue. Une seule autre divergence notable : Troll handicap est « Soleil pétrificateur » (web) / « Aube pétrificatrice » (paper) — même effet, on retient le nom web.

---

## Partie A — Règles raciales transversales

### R-3.1 — La race détermine 4 stats de base

**Énoncé legacy** — [documents/regles/index.md:53, 22-23, 49-51](documents/regles/index.md)

À la création, chaque personnage hérite de sa race :
- **Catégorie** — nombre qui détermine (a) les points d'aptitudes à distribuer à la création, (b) le seuil de chaque niveau (niveau N atteint à `levelPoints = N × catégorie`).
- **Vitalité de base** (= `vitalityMax` initial).
- **Facteur de vitesse** de base (`speedFactor` initial).
- **Facteur de volonté** de base (`willFactor` initial, échelle 1-20).

**Statut** : 🟢 claire

### R-3.2 — La race détermine les limites physiques (9 aptitudes)

Chaque race expose un plafond pour chacune des 9 aptitudes (`strengthMax`, `dexterityMax`, `staminaMax`, `aestheticismMax`, `charismaMax`, `empathyMax`, `intelligenceMax`, `perceptionMax`, `reflexesMax`).

- À la création : valeur max autorisée = `limiteRace - 1` (R-2.8).
- En jeu : la limite est « quasiment indépassable » — franchissable via XP au coût × 4 (NA × 20 au lieu de NA × 5), ou × 3 avec atout « Dépassement de soi » (NA × 15), ou × 2 avec atouts « Anti-limites physiques » / « Force de géant » (NA × 10).

**Statut** : 🟢 claire

### R-3.3 — La race octroie des atouts et handicaps automatiquement

**Énoncé legacy** — [documents/regles/index.md:8-14](documents/regles/index.md) :

> Les atouts et handicaps de races [...] sont **octroyés à tous les personnages sans exception** (du joueur, au non-joueur le plus insignifiant). Sachez encore que l'on ne peut se débarrasser des handicaps de race.

**Implications** :
- Atouts de race = automatiques à tous les personnages de cette race, **sans exception**, même les plus insignifiants (contrairement aux autres types d'atouts qui ne sont donnés qu'aux personnages importants — cf. [regles:69-71](documents/regles/index.md)).
- Handicaps de race = permanents irréversibles, jamais combattables ni dissipables.

**Statut** : 🟢 claire

### R-3.4 — Certaines races ont des atouts de niveau conditionnés

Au-delà des atouts raciaux automatiques, certaines races débloquent des **atouts de niveau** spécifiques (catégorie 4 des types d'atouts, cf. [regles:75-86](documents/regles/index.md)).

**Mécanique de choix d'atout au passage de niveau** *(précisé par l'auteur 2026-04-25)* :

- À chaque passage de niveau N, le joueur **débloque** la totalité des atouts de niveau N accessibles à son perso (selon race, orientation, classe, conditions).
- Il existe **plusieurs atouts par palier** — pas un seul atout imposé.
- Le joueur peut aussi choisir un atout d'un **niveau inférieur** qu'il aurait sauté (atouts N1, N2, N3 toujours dispo si pas pris).
- Le joueur **choisit librement** un atout dans cette pool unlocked.
- **Atouts filtrés de la pool** : ceux déjà acquis et **non-cumulables** sont exclus du choix (le joueur ne peut pas les re-prendre).
- **Atouts éphémères** ([regles:84-86](documents/regles/index.md)) : explicitement cumulables — le joueur peut les re-prendre pour augmenter la fréquence d'usage quotidienne (chaque instance = +1 usage/jour).
- **Atout « Polyvalence »** : étend la pool en ouvrant les atouts d'orientations différentes jusqu'au niveau `Polyvalence + 1` (mais pas les atouts de classe spécifique).

**Renvois** : modélisation complète en D4 (Classes + atouts) et D7 (Progression / level-up flow).

**Exemples** :
- Vampire N2 → « Art occulte : 1 » (+40 énergie + 1 sort magie noire)
- Vampire N4 → « Charme ténébreux » (séduction bonus)
- Loup-garou N3 → « Souvenir de la bête »
- Loup-garou N6 → « Maîtrise de la bête »
- Loup-garou N9 → « Transformation hybride »
- Homme Lézard N2 → « Ostéoderme » (+1 armure au choix P/E/C/T)
- Homme Lézard N4 → « Réflexes fulgurants »
- Homme Lézard N8 → « Régénération des membres »
- Nain N2 → paquet de résistances (+10% alcool/drogues/maladies/poisons, +5% magie)
- Nain N3 → « Répondre à l'insulte » → prérequis pour N4 « Généralisation »
- Chigr/Khochigr/Khogr N2 → « Griffes acérées », N4 → « Réflexes fulgurants »
- Khochigr/Khogr/Orc N2 → « Dents de sabres : 1 »
- Orc N2 → Résistance aux maladies +10%
- Homme Rat N2 → « Contagion : 1 »
- Fantôme N2 → « Possession : 1 »
- 4 races elfiques N2 → Résistances +10% variées

**Statut** : 🟢 claire (catalogue → voir Partie D)

### R-3.5 — Modèle de données de la race

**Colonnes persistées** ([_DBManager.php:737-774](site/includes/managers/_DBManager.php)) :

```
races:
  id, name, category, vitality, speed_factor, will_factor,
  strength_max, dexterity_max, stamina_max,
  aestheticism_max, reflexes_max, perception_max,
  charisma_max, intelligence_max, empathy_max
races_atouts: (race_id, asset_id, points_default)
races_handicaps: (race_id, handicap_id)
```

À la création, le personnage **copie** les valeurs racial dans ses propres champs (`vitality`, `speedFactor`, etc.), puis peut les faire évoluer via XP. Les maxima d'aptitude restent lus depuis la race (pas dupliqués sur le personnage).

**Statut** : 🟢 claire

---

## Partie B — Catalogue des 33 races

### Tableau de synthèse

| Race | Cat | Vit | FV | FVol | Force | Dex | End | Esth | Charis | Emp | Int | Perc | Réf | Atouts | Handicaps |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Canidae | 20 | 24 | 8 | 9 | 5 | 4 | 7 | 4 | 5 | 5 | 5 | 7 | 5 | 3 | 0 |
| Centaure | 22 | 35 | 8 | 11 | 7 | 5 | 7 | 5 | 6 | 5 | 5 | 5 | 5 | 2 | 0 |
| Chat | 12 | 4 | 7 | 13 | 1 | 6 | 1 | 4 | 1 | 3 | 2 | 7 | 6 | 3 | 0 |
| Cheval | 16 | 35 | 8 | 16 | 8 | 2 | 8 | 4 | 1 | 2 | 2 | 4 | 3 | 1 | 0 |
| Chigr | 16 | 14 | 7 | 10 | 4 | 5 | 3 | 5 | 3 | 5 | 4 | 6 | 6 | 4 | 0 |
| Demi-elfe | 20 | 18 | 8 | 11 | 5 | 6 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 2 | 0 |
| Dryade | 20 | 16 | 8 | 10 | 4 | 6 | 4 | 7 | 6 | 5 | 5 | 5 | 5 | 2 | 0 |
| Elfe de Nacre | 20 | 16 | 7 | 10 | 4 | 6 | 5 | 6 | 5 | 5 | 6 | 5 | 5 | 5 | 0 |
| Elfe des Bois | 20 | 17 | 7 | 10 | 4 | 6 | 4 | 6 | 5 | 5 | 6 | 6 | 6 | 4 | 0 |
| Elfe Sombre | 20 | 16 | 7 | 8 | 4 | 6 | 4 | 6 | 7 | 4 | 6 | 5 | 5 | 4 | 0 |
| Fantôme | 31 | 13 | 10 | 2 | 3 | 3 | 3 | 3 | 4 | 4 | 5 | 4 | 3 | 5 | 0 |
| Gnome | 15 | 12 | 8 | 15 | 2 | 5 | 3 | 5 | 3 | 5 | 5 | 6 | 5 | 3 | 0 |
| Gobelin | 12 | 11 | 8 | 14 | 2 | 4 | 4 | 1 | 2 | 2 | 4 | 5 | 5 | 3 | 0 |
| Haut-elfe | 20 | 15 | 7 | 10 | 4 | 6 | 4 | 6 | 6 | 6 | 7 | 5 | 5 | 4 | 0 |
| Hobbit | 16 | 13 | 8 | 15 | 3 | 5 | 4 | 5 | 3 | 5 | 5 | 5 | 5 | 3 | 0 |
| Homme Lézard | 18 | 16 | 7 | 9 | 4 | 5 | 4 | 4 | 4 | 3 | 5 | 6 | 8 | 3 | 1 |
| Homme Oiseau | 22 | 18 | 8 | 11 | 5 | 5 | 5 | 6 | 5 | 5 | 5 | 7 | 5 | 2 | 0 |
| Homme Rat | 18 | 15 | 7 | 14 | 4 | 5 | 6 | 2 | 4 | 4 | 5 | 6 | 6 | 3 | 0 |
| Humain | 20 | 20 | 8 | 12 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 1 | 0 |
| Khochigr | 20 | 19 | 8 | 10 | 5 | 4 | 5 | 5 | 5 | 4 | 4 | 6 | 6 | 4 | 0 |
| Khogr | 20 | 22 | 8 | 10 | 6 | 4 | 6 | 5 | 7 | 4 | 4 | 6 | 6 | 4 | 0 |
| Loup | 16 | 12 | 7 | 13 | 4 | 4 | 6 | 4 | 5 | 3 | 3 | 7 | 6 | 2 | 0 |
| Loup-garou | 45 | 41 | 7 | 15 | 10 | 4 | 8 | 4 | 5 | 2 | 4 | 7 | 7 | 6 | 3 |
| Nain | 20 | 25 | 9 | 9 | 7 | 5 | 7 | 4 | 5 | 4 | 5 | 4 | 4 | 6 | 0 |
| Ogre | 38 | 58 | 11 | 14 | 23 | 3 | 35 | 1 | 4 | 3 | 4 | 4 | 3 | 2 | 0 |
| Ondine | 19 | 16 | 8 | 12 | 3 | 5 | 3 | 8 | 3 | 6 | 5 | 5 | 5 | 2 | 0 |
| Orc | 20 | 27 | 8 | 12 | 6 | 4 | 6 | 1 | 5 | 4 | 4 | 5 | 5 | 3 | 0 |
| Squelette | 16 | 15 | 8 | 1 | 4 | 4 | 5 | 1 | 2 | 1 | 4 | 3 | 4 | 3 | 0 |
| Troll | 48 | 120 | 10 | 13 | 37 | 3 | 33 | 1 | 4 | 2 | 2 | 4 | 4 | 5 | 1 |
| Vampire | 30 | 35 | 8 | 10 | 7 | 5 | 7 | 6 | 7 | 6 | 5 | 5 | 5 | 7 | 3 |
| Zombie | 18 | 20 | 12 | 1 | 5 | 3 | 6 | 1 | 1 | 1 | 1 | 2 | 2 | 5 | 0 |

### Fiches par race

> Ordre alphabétique. Format : stats + atouts + handicaps + atouts de niveau liés + descriptif court.

#### Canidae
- Catégorie 20, Vitalité 24, FV 8, FVol 9. Hommes-loup/chien.
- Aptitudes max : Force 5, Dex 4, Endurance 7, Esth 4, Charis 5, Emp 5, Int 5, Perc 7, Réf 5
- Atouts : **Flaire infaillible**, **Pisteur né**, **Résistance à la fatigue : 25%**
- Handicaps : aucun
- Taille 2,10 m · Espérance 65 ans · Plaines karstiques / orée de forêts

#### Centaure
- Catégorie 22, Vitalité 35, FV 8, FVol 11. Homme-cheval, force de la nature.
- Aptitudes max : Force 7, Dex 5, Endurance 7, Esth 5, Charis 6, Emp 5, Int 5, Perc 5, Réf 5
- Atouts : **Vélocité**, **Résistance à l'alcool : 11%**
- Handicaps : aucun
- Taille 2,40 m · Espérance 100 ans

#### Chat
- Catégorie 12, Vitalité 4, FV 7, FVol 13. Animal gracieux, compagnon d'occultisme.
- Aptitudes max : Force 1, Dex 6, Endurance 1, Esth 4, Charis 1, Emp 3, Int 2, Perc 7, Réf 6
- Atouts : **Équilibre contrôlé**, **Retombe sur ses pattes**, **Vision nocturne**
- Handicaps : aucun
- Taille 0,25 m · Espérance 15 ans

#### Cheval
- Catégorie 16, Vitalité 35, FV 8, FVol 16. Monture fière et endurante.
- Aptitudes max : Force 8, Dex 2, Endurance 8, Esth 4, Charis 1, Emp 2, Int 2, Perc 4, Réf 3
- Atouts : **Vélocité**
- Handicaps : aucun
- Taille 1,80 m · Espérance 25 ans

#### Chigr
- Catégorie 16, Vitalité 14, FV 7, FVol 10. Homme-petit félin (chat/lynx/ocelot).
- Aptitudes max : Force 4, Dex 5, Endurance 3, Esth 5, Charis 3, Emp 5, Int 4, Perc 6, Réf 6
- Atouts : **Équilibre contrôlé**, **Retombe sur ses pattes**, **Résistance à la chaleur : 3%**, **Vision nocturne**
- Handicaps : aucun
- Atouts de niveau : « Griffes acérées » (N2), « Réflexes fulgurants » (N4)
- Taille 1,70 m · Espérance 50 ans

#### Demi-elfe
- Catégorie 20, Vitalité 18, FV 8, FVol 11. Hybride elfe-humain.
- Aptitudes max : Force 5, Dex 6, Endurance 4, Esth 5, Charis 5, Emp 5, Int 5, Perc 5, Réf 5
- Atouts : **Dépassement de soi**, **Vision nocturne**
- Handicaps : aucun
- Taille 1,80 m · Espérance 2000 ans

#### Dryade
- Catégorie 20, Vitalité 16, FV 8, FVol 10. Nymphes des arbres, toujours féminines.
- Aptitudes max : Force 4, Dex 6, Endurance 4, Esth 7, Charis 6, Emp 5, Int 5, Perc 5, Réf 5
- Atouts : **Lingua vegetalis**, **Vegothropie**
- Handicaps : aucun
- Taille 1,70 m · Espérance 2000 ans · Forêt de Tyrkan

#### Elfe de Nacre
- Catégorie 20, Vitalité 16, FV 7, FVol 10. Teint pâle, cheveux noirs, cruels.
- Aptitudes max : Force 4, Dex 6, Endurance 5, Esth 6, Charis 5, Emp 5, Int 6, Perc 5, Réf 5
- Atouts : **Résistance à l'alcool : 30%**, **Résistance aux drogues : 12%**, **Résistance aux maladies : 30%**, **Vision : 110%**, **Vision nocturne**
- Handicaps : aucun
- Atouts de niveau N2 : Résistances drogues/maladies/poisons +10%
- Taille 1,85 m · Immortel · Le Blanc Royaume

#### Elfe des Bois
- Catégorie 20, Vitalité 17, FV 7, FVol 10. Philosophes, meilleurs archers.
- Aptitudes max : Force 4, Dex 6, Endurance 4, Esth 6, Charis 5, Emp 5, Int 6, Perc 6, Réf 6
- Atouts : **Résistance à l'alcool : 24%**, **Résistance aux maladies : 30%**, **Vision : 110%**, **Vision nocturne**
- Handicaps : aucun
- Atouts de niveau N2 : Résistance maladies +10%, poisons +10%
- Taille 1,85 m · Immortel · Forêt de Tyrkan

#### Elfe Sombre
- Catégorie 20, Vitalité 16, FV 7, FVol 8. Destinée tragique, ne peuvent pleurer.
- Aptitudes max : Force 4, Dex 6, Endurance 4, Esth 6, Charis 7, Emp 4, Int 6, Perc 5, Réf 5
- Atouts : **Résistance à l'alcool : 30%**, **Résistance aux maladies : 30%**, **Vision : 110%**, **Vision nocturne**
- Handicaps : aucun
- Atouts de niveau N2 : Résistance maladies +10%, poisons +10%
- Taille 1,90 m · Immortel · Monde Sombre

#### Fantôme
- Catégorie 31, Vitalité 13, FV 10, FVol 2. Âmes errantes avec mission à remplir.
- Aptitudes max : Force 3, Dex 3, Endurance 3, Esth 3, Charis 4, Emp 4, Int 5, Perc 4, Réf 3
- Atouts : **Immatérialité**, **Mort-vivant**, **Possession : 1**, **Vision nocturne**, **Vol**
- Handicaps : aucun
- Atouts de niveau racial : Possession progressable
- Taille race de base · Immortel · Landes Désertiques

#### Gnome
- Catégorie 15, Vitalité 12, FV 8, FVol 15. Mystérieux, illusionnistes culturels.
- Aptitudes max : Force 2, Dex 5, Endurance 3, Esth 5, Charis 3, Emp 5, Int 5, Perc 6, Réf 5
- Atouts : **Affinité avec les illusions**, **Résistance à la magie : 20%**, **Vision nocturne**
- Handicaps : aucun
- Taille 0,60 m · Espérance 200 ans · Collines d'Ico

#### Gobelin
- Catégorie 12, Vitalité 11, FV 8, FVol 14. Petites créatures sournoises, attaquent en nombre.
- Aptitudes max : Force 2, Dex 4, Endurance 4, Esth 1, Charis 2, Emp 2, Int 4, Perc 5, Réf 5
- Atouts : **Frénésie collective**, **Résistance aux maladies : 16%**, **Vision nocturne**
- Handicaps : aucun
- Taille 0,50 m · Espérance 15 ans · Terres Sauvages

#### Haut-elfe
- Catégorie 20, Vitalité 15, FV 7, FVol 10. Utopistes, cités blanches flottant dans les nuages.
- Aptitudes max : Force 4, Dex 6, Endurance 4, Esth 6, Charis 6, Emp 6, Int 7, Perc 5, Réf 5
- Atouts : **Résistance à l'alcool : 30%**, **Résistance aux maladies : 30%**, **Vision : 110%**, **Vision nocturne**
- Handicaps : aucun
- Atouts de niveau N2 : Résistance maladies +10%, poisons +10%
- Taille 1,90 m · Immortel · Haut Royaume

#### Hobbit
- Catégorie 16, Vitalité 13, FV 8, FVol 15. Paysans paisibles, pieds poilus et amateurs de tabac.
- Aptitudes max : Force 3, Dex 5, Endurance 4, Esth 5, Charis 3, Emp 5, Int 5, Perc 5, Réf 5
- Atouts : **Pieds poilus**, **Résistance à la fumée : 60%**, **Résistance magique : 60%**
- Handicaps : aucun
- Taille 1,10 m · Espérance 95 ans

#### Homme Lézard
- Catégorie 18, Vitalité 16, FV 7, FVol 9. Pacifistes flegmatiques, escarmouches précises.
- Aptitudes max : Force 4, Dex 5, Endurance 4, Esth 4, Charis 4, Emp 3, Int 5, Perc 6, Réf 8
- Atouts : **Résistance à la chaleur : 36%**, **Sang-froid**, **Vision nocturne**
- Handicaps : **Organisme fragile** (maladies × 2)
- Atouts de niveau racial : Ostéoderme (N2), Réflexes fulgurants (N4), Régénération des membres (N8)
- Taille 1,80 m · Espérance 70 ans · Stazyliss

#### Homme Oiseau
- Catégorie 22, Vitalité 18, FV 8, FVol 11. Peuple pacifique de la Grande Citée Haute.
- Aptitudes max : Force 5, Dex 5, Endurance 5, Esth 6, Charis 5, Emp 5, Int 5, Perc 7, Réf 5
- Atouts : **Vision : 235%**, **Vol**
- Handicaps : aucun
- Taille 1,85 m · Espérance 90 ans

#### Homme Rat
- Catégorie 18, Vitalité 15, FV 7, FVol 14. Sociaux, imprévisibles, souterrains.
- Aptitudes max : Force 4, Dex 5, Endurance 6, Esth 2, Charis 4, Emp 4, Int 5, Perc 6, Réf 6
- Atouts : **Frénésie collective**, **Résistance aux maladies : 49%**, **Vision nocturne**
- Handicaps : aucun
- Atouts de niveau racial : Contagion : 1 (N2)
- Taille 1,50 m · Espérance 45 ans · Souterrain

#### Humain
- Catégorie 20, Vitalité 20, FV 8, FVol 12. Polyvalents, meilleur et pire, s'entêtent.
- Aptitudes max : **5 dans chaque aptitude** (strict moyenne).
- Atouts : **Anti-limites physiques** (seule race à avoir une réduction sur TOUTES les aptitudes au-delà de la limite physique, coût NA × 10)
- Handicaps : aucun
- Taille 1,75 m · Espérance 75 ans · Empire, Enorie, Aderand, Terres du Nord, Alteria, Cortega, Dundoria, Yonkado, Irtanie, Dêtre

#### Khochigr
- Catégorie 20, Vitalité 19, FV 8, FVol 10. Homme-félin moyen (léopard/panthère/puma/jaguar/guépard).
- Aptitudes max : Force 5, Dex 4, Endurance 5, Esth 5, Charis 5, Emp 4, Int 4, Perc 6, Réf 6
- Atouts : **Équilibre contrôlé**, **Résistance à la chaleur : 6%**, **Retombe sur ses pattes**, **Vision nocturne**
- Handicaps : aucun
- Atouts de niveau racial : Dents de sabres : 1 (N2), Griffes acérées (N2), Réflexes fulgurants (N4)
- Taille 1,90 m · Espérance 55 ans

#### Khogr
- Catégorie 20, Vitalité 22, FV 8, FVol 10. Homme-grand félin (lion/tigre), guerrier brutal.
- Aptitudes max : Force 6, Dex 4, Endurance 6, Esth 5, Charis 7, Emp 4, Int 4, Perc 6, Réf 6
- Atouts : **Équilibre contrôlé**, **Résistance à la chaleur : 9%**, **Retombe sur ses pattes**, **Vision nocturne**
- Handicaps : aucun
- Atouts de niveau racial : Dents de sabres : 1 (N2), Griffes acérées (N2), Réflexes fulgurants (N4)
- Taille 1,95 m · Espérance 60 ans

#### Loup
- Catégorie 16, Vitalité 12, FV 7, FVol 13. Prédateur en meute.
- Aptitudes max : Force 4, Dex 4, Endurance 6, Esth 4, Charis 5, Emp 3, Int 3, Perc 7, Réf 6
- Atouts : **Frénésie collective**, **Vision nocturne**
- Handicaps : aucun
- Taille 0,80 m · Espérance 50 ans

#### Loup-garou
- Catégorie 45, Vitalité 41, FV 7, FVol 15. Humain pleine lune = massacre, très agressif.
- Aptitudes max : Force 10, Dex 4, Endurance 8, Esth 4, Charis 5, Emp 2, Int 4, Perc 7, Réf 7
- Atouts : **Auto régénération**, **Humanothropie**, **Lycanthropie**, **Morsure lupine**, **Terreur**, **Vision nocturne**
- Handicaps : **Brûlure de l'argent**, **Rage lunaire**
- Atouts de niveau racial : Souvenir de la bête (N3), Maîtrise de la bête (N6), Transformation hybride (N9)
- Taille 2,50 m · Espérance 50 ans

#### Nain
- Catégorie 20, Vitalité 25, FV 9, FVol 9. Guerriers entêtés, meilleurs artisans et brasseurs.
- Aptitudes max : Force 7, Dex 5, Endurance 7, Esth 4, Charis 5, Emp 4, Int 5, Perc 4, Réf 4
- Atouts : **Force de géant** (anti-limite Force uniquement, NA × 10), **Résistance à l'alcool : 30%**, **Résistance aux drogues : 21%**, **Résistance aux maladies : 21%**, **Résistance aux poisons : 21%**, **Résistance magique : 15%**
- Handicaps : aucun
- Atouts de niveau racial : Résistances +10% (alcool/drogues/maladies/poisons, +5% magie) N2 ; Répondre à l'insulte N3 ; Généralisation N4
- Taille 1,30 m · Espérance 500 ans · Portes d'Azrak

#### Ogre
- Catégorie 38, Vitalité 58, FV 11, FVol 14. Colosses terrifiants, appétit de chair tendre.
- Aptitudes max : Force 23, Dex 3, Endurance 35, Esth 1, Charis 4, Emp 3, Int 4, Perc 4, Réf 3
- Atouts : **Résistance au feu : 54%**, **Terreur**
- Handicaps : aucun
- Taille 3 m · Espérance 300 ans · Terres Sauvages

#### Ondine
- Catégorie 19, Vitalité 16, FV 8, FVol 12. Nymphes d'eaux, charme surnaturel.
- Aptitudes max : Force 3, Dex 5, Endurance 3, Esth 8, Charis 3, Emp 6, Int 5, Perc 5, Réf 5
- Atouts : **Chant envoûtant**, **Race aquatique**
- Handicaps : aucun
- Taille 1,75 m · Immortel · Eaux vives partout

#### Orc
- Catégorie 20, Vitalité 27, FV 8, FVol 12. Symbole de brutalité, soldats parfaits.
- Aptitudes max : Force 6, Dex 4, Endurance 6, Esth 1, Charis 5, Emp 4, Int 4, Perc 5, Réf 5
- Atouts : **Peur**, **Résistance aux maladies : 4%**, **Vision nocturne**
- Handicaps : aucun
- Atouts de niveau racial : Dents de sabres : 1 (N2), Résistance maladies +10% (N2)
- Taille 1,60 m · Espérance 35 ans · Terres Sauvages

#### Squelette
- Catégorie 16, Vitalité 15, FV 8, FVol 1. Relevé par nécromancie, troupe docile.
- Aptitudes max : Force 4, Dex 4, Endurance 5, Esth 1, Charis 2, Emp 1, Int 4, Perc 3, Réf 4
- Atouts : **Jusqu'à la mort** (mort uniquement à `vitality = 0`), **Mort-vivant**, **Peur**
- Handicaps : aucun
- Taille race de base · Immortel · Landes Désertiques

#### Troll
- Catégorie 48, Vitalité 120, FV 10, FVol 13. Force brute, bête sauvage.
- Aptitudes max : Force 37, Dex 3, Endurance 33, Esth 1, Charis 4, Emp 2, Int 2, Perc 4, Réf 4
- Atouts : **Auto régénération**, **Résistance aux maladies : 20%**, **Résistance aux poisons : 11%**, **Terreur**, **Vision nocturne**
- Handicaps : **Soleil pétrificateur** (web) / « Aube pétrificatrice » (paper) — statue permanente au soleil, ne revient pas la nuit
- Taille 3,60 m · Immortel · Terres Sauvages

#### Vampire
- Catégorie 30, Vitalité 35, FV 8, FVol 10. Mort-vivant aristocratique, beauté ténébreuse.
- Aptitudes max : Force 7, Dex 5, Endurance 7, Esth 6, Charis 7, Emp 6, Int 5, Perc 5, Réf 5
- Atouts : **Baiser de la nuit**, **Baiser des ténèbres**, **Brumathropie**, **Chiroptèrothropie**, **Lycanthropie**, **Mort-vivant**, **Vision nocturne**
- Handicaps : **Aube meurtrière**, **Sans reflet**, **Soif de sang**
- Atouts de niveau racial : Art occulte : 1 (N2) — acquiert `energyMax = 40` + 1 sort magie noire ; Charme ténébreux (N4)
- Taille 1,75 m · Immortel · Partout

#### Zombie
- Catégorie 18, Vitalité 20, FV 12, FVol 1. Non listé dans le paper — ajouté au web.
- Aptitudes max : Force 5, Dex 3, Endurance 6, Esth 1, Charis 1, Emp 1, Int 1, Perc 2, Réf 2
- Atouts : **Mort-vivant**, **Peur**, **Jusqu'à la mort**, **Résistance aux maladies : 100%** *(tranché 2026-04-24)*, **Résistance aux poisons : 100%** *(tranché 2026-04-24)*
- Handicaps : aucun documenté
- Divergence : absent du bestiaire paper ; présent uniquement dans web canonique
- Descriptif : cadavre animé par nécromancie (inféré de la sémantique Mort-vivant + stats basses sociales + FVol=1 comme Squelette)

---

## Partie C — Catalogue des atouts raciaux uniques (avec descriptions)

> Tableau avec citation directe du [lexique](regles-papier/extracted/listes/lexique.md).

| Atout | Description (lexique) | Races |
|---|---|---|
| **Affinité avec les illusions** | « Le personnage à tellement l'habitude de vivre entouré d'illusion que son sens de détection de celles-ci s'est fortement aiguisé. Il bénéficie d'une difficulté baissée de 3 pour tout jet de détection d'illusions. » (perm) | Gnome |
| **Anti-limites physiques** | « Le coût d'un point supplémentaire dans une aptitude, une fois la limite physique atteinte, est de NA × 10 (à la place de NA × 20). » (perm) | Humain |
| **Auto régénération** | « Tous les 10 DT, le personnage récupère un point de vitalité. Il ne peut ainsi dépasser son nombre de point de vitalité maximum. Cet atout prend fin lorsque le personnage meurt. » (perm) | Loup-garou, Troll |
| **Baiser de la nuit** | « Le personnage peut faire boire à un humain, un peu de sang vampirique pour transformer sa proie en goule. Cette opération peut être faîte en une fois ou sur plusieurs nuits. » (perm) | Vampire |
| **Baiser des ténèbres** | « Le personnage peut après avoir vider un humain d'une partie de son sang, lui faire boire un peu de sang vampirique pour transformer sa proie en nouveau vampire. » (perm) | Vampire |
| **Brumathropie** | « Permet au personnage de se changer en brume. La transformation prend 50 DT. Sous forme de brume, le personnage ne peut subir, ni engendrer des actions physiques. [...] peut s'engouffrer et passer par les interstices d'une porte, un trou de serrure. » (perm) | Vampire |
| **Chant envoûtant** | « Lorsque le personnage se met à chanter, les personnes autour de lui doivent faire un test de volonté pour ne pas être séduit directement (difficulté +1 par niveau du chanteur). Cet état se dissipe lentement après le chant. » (perm) — **aussi atout de classe Chanteur N4** | Ondine (racial), Chanteur (classe) |
| **Chiroptèrothropie** | « Permet au personnage de se changer en chauve-souris. La transformation prend 50 DT. La forme de la chauve-souris est considérée comme un personnage secondaire. » (perm) | Vampire |
| **Dépassement de soi** | « Le coût d'un point supplémentaire dans une aptitude, une fois la limite physique atteinte, est du niveau actuel × 15. » (perm) | Demi-elfe |
| **Équilibre contrôlé** | « Le personnage possède un sens inné de l'équilibre et diminue la difficulté de touts les jets basés sur l'équilibre de 3. » (perm) ([lexique:445](regles-papier/extracted/listes/lexique.md)) | Chat, Chigr, Khochigr, Khogr |
| **Flaire infaillible** | « Le personnage possède un flaire hors norme et diminue la difficulté de tous les jets basés sur l'odorat de 3. » (perm) | Canidae |
| **Force de géant** | « Octroie l'anti-limite physique pour l'attribut « Force ». Autrement dis, une fois atteint la limite physique, les points supplémentaires ne coûtent que NA × 10 (à la place de NA × 20). » (perm) | Nain |
| **Frénésie collective** | « Le personnage peut déduire 1 à son facteur de volonté (lors d'un jet de peur) pour chaque personnage de la même race que lui l'accompagnant. » (perm) | Gobelin, Homme Rat, Loup |
| **Humanothropie** | « Permet au personnage de se changer en humain. La transformation prend 50 DT (soit 10 secondes). La forme d'humain est considérée comme un personnage secondaire. » (perm) | Loup-garou |
| **Immatérialité** | « Le personnage appartient à un autre plan, et même si on peut le voir, on ne peut le toucher. De même, il ne peut saisir d'objet et passe à travers ceux-ci. » (perm) | Fantôme |
| **Jusqu'à la mort** | « Le personnage ne mourra que lorsque sa vitalité sera réduite à 0. » (perm) — **invalide les seuils de mort par blessure grave** | Squelette, Zombie |
| **Lingua vegetalis** | « Le personnage peut communiquer avec les végétaux. » (perm) | Dryade |
| **Lycanthropie** | « Permet au personnage de se changer en loup. La transformation prend 50 DT (soit 10 secondes). La forme du loup est considérée comme un personnage secondaire. » (perm) | Loup-garou, Vampire |
| **Morsure lupine** | « Si le personnage mord un autre personnage de type humain (vivant), celui-ci devient un Loup-garou. » (perm) | Loup-garou |
| **Mort-vivant** | « En tant que mort, le personnage ne respire plus, son cœur ne bat plus, son teint s'éclaircit et sa peau se refroidit. » (perm) — **purement descriptif, pas de mécanique d'immunité sociale directe** | Fantôme, Squelette, Vampire, Zombie (+ Loup-garou partiel) |
| **Peur** | « Le personnage provoque la peur chez les autres. Ceux-ci doivent en sa présence faire un test de volonté pour maîtriser leur peur. Attention un personnage possédant cet atout s'y voit immunisé. » (perm) | Orc, Squelette, Zombie |
| **Pieds poilus** | « Diminue de 3 la difficulté d'un jet pour se mouvoir silencieusement. » (perm) | Hobbit |
| **Pisteur né** | « Le personnage possède un sens du pistage aiguisé et diminue la difficulté de tous les jets basés sur le pistage de 3. » (perm) | Canidae |
| **Possession** | « Le personnage peut entrer dans un le corps d'un autre personnage vivant. Celui-ci peut tenter de résister en effectuant un jet de volonté avec une difficulté supplémentaire égale au score détenu par le personnage entrant, en possession. [...] Un exorcisme peut faire sortir le personnage de force. » (éph) | Fantôme |
| **Race aquatique** | « Le personnage peut respirer normalement sous l'eau. Ses mouvements ne sont pas ralentis (les facteurs de vitesses sont normalement doublés pour les non-aquatiques) et ses jets de nage se font automatiquement avec une difficulté diminuée de 3. » (perm) | Ondine |
| **Résistance à la chaleur : X%** | Résistance D100 ≤ X% (R-1.32) | Chigr (3%), Khochigr (6%), Khogr (9%), Homme Lézard (36%) |
| **Résistance à l'alcool : X%** | idem | Centaure (11%), Elfe de Nacre/Sombre/Haut (30%), Elfe des Bois (24%), Nain (30%) |
| **Résistance aux drogues : X%** | idem | Elfe de Nacre (12%), Nain (21%) |
| **Résistance aux maladies : X%** | idem | Elfe de Nacre/Sombre/Haut (30%), Elfe des Bois (30%), Gobelin (16%), Homme Rat (49%), Nain (21%), Orc (4%), Troll (20%) |
| **Résistance à la magie : X%** (= « Résistance magique ») | idem | Gnome (20%), Hobbit (60%), Nain (15%) |
| **Résistance aux poisons : X%** | idem | Nain (21%), Troll (11%) |
| **Résistance à la fumée : X%** | idem | Hobbit (60%) |
| **Résistance au feu : X%** | idem | Ogre (54%) |
| **Résistance à la fatigue : X%** | idem | Canidae (25%) |
| **Retombe sur ses pattes** | « Permet de retomber automatiquement sur ses pattes ou pieds. » (perm) | Chat, Chigr, Khochigr, Khogr |
| **Sang-froid** | « Le personnage ne tient compte d'aucun malus d'augmentation de son facteur de volonté. » (perm) — **bouclier total contre R-1.28 (malus D20 adverses)** | Homme Lézard |
| **Terreur** | « Le personnage provoque la terreur chez les autres. Ceux-ci doivent en sa présence faire un test de volonté, avec une difficulté supplémentaire égale au niveau du personnage, pour maîtriser leur peur. Attention, un personnage possédant cet atout s'y voit immunisé ainsi qu'à la peur. » (perm) — **immunité à Peur + Terreur** | Loup-garou, Ogre, Troll |
| **Vegothropie** | « Le personnage peut se transformer en plante. La durée de la transformation est de 10 minutes. La plante en question est relative au personnage. » (perm) | Dryade |
| **Vélocité** | « Diminue de 3 la difficulté de course. » (perm) | Centaure, Cheval |
| **Vision : X%** | Multiplicateur de portée de vision (% au-delà de 100% = au-delà de la vision humaine normale) | Elfes (110%), Homme Oiseau (235%) |
| **Vision nocturne** | « Permet au personnage de voir dans la nuit, mais pas dans le noir total. [...] ne permet pas de distinguer les couleurs la nuit, ni de voir en cas de noir total. » (perm) | 20 races (voir tableau B) |
| **Vol** | « Le personnage peut voler. Que ce soit grâce à des ailes, une faculté mentale ou autres, celui-ci peut sans problème se déplacer librement dans les airs. » (perm) | Fantôme, Homme Oiseau |

---

## Partie D — Catalogue des handicaps raciaux

| Handicap | Description | Races |
|---|---|---|
| **Aube meurtrière** | « Les rayons de soleil brûlent le personnage comme le feraient des flammes. » (perm) | Vampire |
| **Brûlure de l'argent** | « L'auto régénération du personnage ne s'applique pas lorsque celui-ci est blessé par de l'argent. Ces blessures guérissent normalement. » (perm) | Loup-garou |
| **Organisme fragile** | « L'organisme du personnage est particulièrement sensible aux maladies (deux fois plus). » (perm) — résistance maladie × 2 dans le sens inverse (malus multiplicatif) | Homme Lézard |
| **Rage lunaire** | *(Reconstruit par inférence 2026-04-25, à valider finement)* Les nuits de pleine lune, si exposé à la lueur lunaire, le personnage subit une transformation forcée en Loup-garou (via Lycanthropie) et perd le contrôle de ses actions jusqu'à l'aube. Comportement dicté par l'agressivité, la chasse, la soif de sang. **Évitement possible par confinement total isolant de toute lueur lunaire** — mais avec un risque d'échec (jet de résistance à définir, cf. Q-D3.2-b). Les atouts de niveau mitigent progressivement : **Souvenir de la bête** (N3, récupère la mémoire des actes), **Maîtrise de la bête** (N6, récupère le contrôle des actions mais l'agressivité reste), **Transformation hybride** (N9, permet de transformer volontairement hors pleine lune, mais ne permet toujours pas d'éviter la pleine lune si exposé à sa lueur). | Loup-garou |
| **Sans reflet** | « Le personnage n'a aucun reflet, que ce soit dans l'eau, dans un miroir, … » (perm) | Vampire |
| **Soif de sang** | « Le personnage ne peut se nourrir exclusivement que de sang. » (perm) | Vampire |
| **Soleil pétrificateur** (web) = « Aube pétrificatrice » (paper) | « Les rayons du soleil change le personnage en pierre. Un personnage ainsi statufié ne reviens pas à son état normal une fois la nuit venue. » (perm) | Troll |

---

## Partie E — Patterns et synthèse

### Catégories observées
`12, 15, 16, 18, 19, 20, 22, 30, 31, 38, 45, 48` — plus la catégorie est haute, plus la race est « puissante » mais progresse lentement en niveau.

- **Petites créatures / animaux** (≤ 16) : Chat, Cheval, Chigr, Gobelin, Gnome, Hobbit, Loup, Squelette
- **Humanoïdes standards** (18-22) : Homme Lézard, Zombie, Ondine, Humain, Orc, Nain, Canidae, Demi-elfe, 4 races elfiques, Dryade, Khochigr, Khogr, Centaure, Homme Oiseau, Homme Rat
- **Créatures avancées** (30+) : Vampire (30), Fantôme (31), Ogre (38), Loup-garou (45), Troll (48)

### Groupes thématiques

| Groupe | Races |
|---|---|
| Elfes | Demi-elfe, Elfe de Nacre, Elfe des Bois, Elfe Sombre, Haut-elfe |
| Félidés humanoïdes | Chigr, Khochigr, Khogr (+ Chat animal) |
| Non-vivants | Fantôme, Squelette, Zombie, Vampire (+ Loup-garou partiellement) |
| Transformateurs | Loup-garou (3 formes), Vampire (3 formes), Dryade (1 forme) |
| Magie innée / semi | Dryade (Lingua vegetalis, Vegothropie), Ondine (Chant envoûtant), Vampire (Art occulte N2 racial → energyMax = 40), Fantôme (Possession, Vol) |
| Auto-régénération | Loup-garou, Troll |
| Causent Peur | Orc, Squelette, Zombie |
| Causent Terreur (+ immunité Peur+Terreur) | Loup-garou, Ogre, Troll |
| Vision nocturne | 20 races sur 33 |
| Vol | Fantôme, Homme Oiseau |

### Races avec handicaps majeurs

- **Loup-garou** : Brûlure de l'argent + Rage lunaire (+ agressivité lunaire narrative)
- **Vampire** : Aube meurtrière + Sans reflet + Soif de sang
- **Troll** : Soleil pétrificateur
- **Homme Lézard** : Organisme fragile (compensé par Résistance chaleur + Sang-froid)

### Paliers d'anti-limite physique

Trois niveaux d'atouts raciaux qui réduisent le coût XP une fois la limite physique atteinte :

| Atout | Coût au-delà de la limite | Applicable à | Race |
|---|---|---|---|
| *(standard)* | NA × 20 | Toutes aptitudes | Toute race sans atout |
| **Dépassement de soi** | NA × 15 | Toutes aptitudes | Demi-elfe |
| **Anti-limites physiques** | NA × 10 | Toutes aptitudes | Humain |
| **Force de géant** | NA × 10 | Force uniquement | Nain |

---

## Partie F — Questions ouvertes et points d'attention

### ~~Q-D3.1~~ — Descriptif Zombie manquant ✅ **Tranché (2026-04-24)** : Résistance Maladies = 100%, Résistance Poisons = 100% (immunité totale, sémantique Mort-vivant).

### ~~Q-D3.2~~ — Rage lunaire description manquante ✅ **Tranché (2026-04-25)** : mécanique Option C (hybride). Les nuits de pleine lune + exposition à la lueur → transformation forcée + perte de contrôle jusqu'à l'aube. Évitement possible par confinement total isolant de toute lueur lunaire, mais avec risque d'échec (jet de résistance à préciser). Tant que le perso n'a pas N9 Transformation hybride, il **ne peut pas** se transformer volontairement hors pleine lune — transformation toujours involontaire.

### Q-D3.2-b — Rage lunaire : mécanique exacte du jet d'évitement par confinement

Quand un Loup-garou est **confiné** la nuit de pleine lune (pour éviter la lueur), l'évitement est « potentiellement incertain ». Quel jet / quelle mécanique ?

- **Option A — Jet de volonté** (D20 ≥ FVol) : le personnage tente de résister à l'appel de la lune. Les atouts de niveau pourraient diminuer la difficulté.
- **Option B — Jet de chance** (D100 ≤ %) : le confinement a un % de chance de succès, réduit par des conditions (petite fissure qui laisse passer un rayon, confinement pas complet, etc.).
- **Option C — Narratif pur** : le MJ décide selon la qualité du confinement.
- **Option D — Hybride** : confinement trivial (cave aveugle, cercueil scellé) = 100% succès auto ; confinement imparfait = jet de volonté ; exposition = transformation forcée.

À trancher en D4 ou D8 (détails de l'atout Lycanthropie / Rage lunaire).

### ~~Q-D3.3~~ — Atout « Équilibre contrôlé » sans description lexique ✅ **Résolu (2026-04-25)** : description trouvée dans le lexique (orthographié sans accent initial, « Equilibre »). Effet : -3 difficulté sur tous les jets basés sur l'équilibre.

### ~~Q-D3.4~~ — Cohabitation « Chant envoûtant » racial vs classe ✅ **Tranché (2026-04-25)** :

**Règle générale de déduplication des atouts (permanents)** :
- Atouts **permanents non-cumulables** déjà acquis (par race/classe/orientation/niveau) → **filtrés** de la pool de choix au level-up. Le joueur n'est pas pénalisé : il choisit librement un autre atout dans la pool.
- Atouts **éphémères** : **cumulables** explicitement, y compris depuis sources différentes (race + classe + niveau, etc.) — chaque instance ajoute 1 usage/jour (Q-D3.4-a confirmé 2026-04-25). Cas réel d'application incertain mais règle à intégrer.
- Atouts **explicitement cumulables** (Mémoire photographique, Nuit blanche, etc.) : le texte dit "peut être cumulé" → ils empilent leurs effets.

**Cas Ondine Chanteuse** : Chant envoûtant racial + Chanteur N4 → la 2ème instance n'est pas accessible (permanent non-cumulable, déjà acquis). L'Ondine Chanteuse choisit un autre atout d'orientation Artiste / classe Chanteur dans sa pool N4.

**Implications architecturales** :
- Le moteur de level-up doit générer dynamiquement la pool d'atouts choisis : (atouts unlocked au niveau actuel et inférieurs) − (atouts déjà acquis non-cumulables).
- Les éphémères restent toujours dans la pool (cumulables).
- Les "Polyvalence" élargit la pool aux atouts d'autres orientations, mais sans bypass des restrictions de classe.

### ~~Q-D3.5~~ — Atouts de transformation virale ✅ **Partiellement tranché (2026-04-25)** :

- **Q-D3.5-a — Vampire (Baiser de la nuit / Baiser des ténèbres)** : choix libre du vampire entre transformation **immédiate** ou **étalée sur plusieurs nuits**. Narratif pur, pas de mécanique chiffrée.
- **Q-D3.5-b — Loup-garou (Morsure lupine)** : conversion **immédiate et automatique** sur toute morsure réussie sur humain vivant. Pas de jet, pas de délai, pas de résistance.
- **Q-D3.5-c — Devenir de la victime** : *non tranché, voir Q-D3.5-c ci-dessous*.

### ~~Q-D3.5-c~~ — Devenir du personnage transformé ✅ **Tranché (2026-04-25)** : Option (i) — Race change, le reste persiste.

**Mécanique** :
- Le perso conserve : nom, mémoire, levelPoints, classe, orientation, compétences, spécialisations, sorts (pour magicien), atouts non-raciaux acquis hors atouts de niveau.
- Le perso **perd** : atouts raciaux et handicaps raciaux de l'ancienne race.
- Le perso **acquiert** : atouts raciaux et handicaps raciaux de la nouvelle race, nouvelle catégorie, nouvelles limites physiques, nouvelles bases (vitalité/FV/FVol).
- Le niveau est recalculé selon la nouvelle catégorie ; les atouts de niveau déjà acquis sont perdus puis reconstruits selon le nouveau niveau (D7 R-7.18).

**Implications architecturales pour le moteur** (à traiter en D7 Progression) :
- `Character.race_id` est **mutable** en cours de jeu (pas figé à la création).
- Lors d'un changement de race, le moteur doit :
  - Retirer les atouts/handicaps de l'ancienne race
  - Ajouter ceux de la nouvelle race
  - Recalculer les limites physiques (peut faire baisser une aptitude au-dessus de la nouvelle limite ? ou grandfathering ?)
  - Recalculer la base `vitalityMax / speedFactor / willFactor` ? Ou garder les valeurs actuelles ?
  - Recalculer le niveau actuel (`levelPoints / nouvelle_catégorie` peut faire chuter ou monter le niveau)

**Questions secondaires liées** :
- **Q-D3.5-c-i** : tranché D7 R-7.16 → capping immédiat.
- **Q-D3.5-c-ii** : tranché D7 R-7.17 → nouvelle base + delta acquis.
- **Q-D3.5-c-iii** : tranché D7 R-7.18 → niveau recalculé sur nouvelle catégorie, perte/rebuild des atouts de niveau.

### ~~Q-D3.6~~ — Atout « Repos du guerrier » ✅ **Tranché (2026-04-25)** :

**Révision de R-2.10 (D2)** : la règle de base était incomplète. Le repos **restaure pleinement** la vitalité (8 h = 100% `vitalityMax`, 4 h = 50%, échelle linéaire). Le texte legacy listait les éléments dans l'ordre d'importance narrative, pas exhaustivement.

**« Repos du guerrier »** : divise par 2 le temps requis pour récupération totale → **4 h pour 100%** (au lieu de 8 h). **Potentiellement cumulable** (à confirmer en D4) : chaque instance halve again le temps : 2 h → 1 h → 30 min → 15 min → 7,5 min → … (puissance de 2 décroissante).

**Implication architecturale** : si cumulabilité confirmée, c'est un **second cas de permanent cumulable** (avec Mémoire photographique et Nuit blanche). À noter : la règle générale "permanent = single instance" tolère des exceptions explicites.

### ~~Q-D3.7~~ — Mécanisme de transformation ✅ **Tranché (2026-04-25)** : Option A — **aucune limite**.

Les atouts de transformation (Brumathropie, Chiroptèrothropie, Lycanthropie, Humanothropie, Vegothropie) sont **permanents et illimités**. Aucun coût en énergie, aucune limite par jour, aucun cooldown narratif imposé. Seules contraintes :
- **Durée de transformation** (50 DT = 10 s pour la plupart) — une action conséquente en combat
- **Conséquences narratives** de rester en forme alternative (brume = pas d'action physique, plante = immobile, etc.)

### ~~Q-D3.7-a~~ — Lycanthropie volontaire vs involontaire ✅ **Tranché (2026-04-27)**

Le modèle lycan permet deux formes de base :
- **Humain de base** avec possibilité de transformation en loup via les atouts de niveau appropriés.
- **Loup de base** avec possibilité de transformation en humain via les atouts de niveau appropriés.

**Politique de jeu** :
- Pour un **PJ**, la forme humaine de base est le défaut fortement recommandé, sinon le RP devient difficile à gérer.
- Pour un **PNJ**, la forme loup de base peut être utilisée librement si elle sert la fiction.
- Les transformations restent portées par les atouts de niveau (`Lycanthropie`, `Humanothropie`, `Transformation hybride`) et par Rage lunaire selon R-3.4.

À confirmer en D4.

### ~~Q-D3.8~~ — Modèle de données des résistances ✅ **Tranché (2026-04-25)** :

**Modèle normalisé (Option A)** :
```json
character.resistances: [
  { type: "maladies", value: 21, source: "race:nain" },
  { type: "maladies", value: 10, source: "atout:nain-n2-resistance-maladies" },
  { type: "alcool",   value: 30, source: "race:nain" },
  ...
]
```

Au moment d'un test (R-1.32 : `D100 ≤ %`), le moteur **somme tous les `value`** du `type` concerné. Architecture extensible :
- Atouts raciaux → source `race:X`
- Atouts de niveau → source `atout:nom-de-l-atout-niveau-N`
- Buffs magiques temporaires → source `sort:nom-du-sort` avec une `expiresAt`
- Equipement → source `equip:nom-objet`

**Plafond** : **100%** = immunité totale possible (Q-D3.8-b confirmé). Aucun soft-cap. Cohérent avec Zombie (Maladies 100%, Poisons 100%) déjà tranché.

**Catalogue des types de résistance v1** (Q-D3.8-c, extensible) :
- **Physiologique** : Maladies, Poisons, Drogues, Alcool, Fatigue
- **Élémentaire** : Feu, Froid, Fumée, Chaleur
- **Magique** : Magie (directe, R-1.33)
- **+ futurs** : à ajouter au fil des découvertes (foudre/électrique, acide, ténèbres, lumière, etc.)

**Implication architecturale** :
- La table `resistance_types` est un référentiel (clé : nom du type, label affiché, couleur/icône optionnelle)
- Le calcul d'une résistance à un type donné est `Σ value WHERE type = X` — utilisable directement dans le moteur d'évaluation des dégâts/sorts.

---

## Acceptance checklist pour l'auteur

- [ ] Validation des 33 races (33 fiches synthétiques + tableau maître)
- [ ] Validation des descriptions d'atouts/handicaps citées
- [ ] Confirmation de la priorité web (Zombie inclus, Troll « Soleil pétrificateur »)
- [ ] Trancher Q-D3.1 à Q-D3.8

Dès validé → **D4 Classes + orientations + atouts**. Polyvalence sera le centre névralgique.
