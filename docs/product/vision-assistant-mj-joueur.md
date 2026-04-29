# Vision Produit : Assistant MJ & Joueur "Tabletop-First" (Knight & Wizard)

## 1. L'Heritage du Site PHP : Une Base Solide

L'exploration du site PHP legacy revele que Knight & Wizard n'etait pas qu'un simple recueil de regles. Il s'agissait deja d'un **outil d'assistance de jeu en ligne** tres avance pour son epoque.

Les fonctionnalites existantes prouvent la viabilite du concept "Tabletop-First" :

- **Creation et Gestion de Personnages (PJ/PNJ)** : Un flow complet (wizard) guidant le joueur a travers le choix du genre, de la race, de l'orientation, de la classe, et le calcul automatique des attributs, competences, sorts et atouts. Le systeme gerait deja la distinction entre PJ, PNJ actifs/inactifs, et familiers [1].
- **Moteur de Session (Play/Forum)** : Un systeme de "lieux" (places) ou les personnages pouvaient interagir. Les joueurs pouvaient poster des messages narratifs (RP) tout en integrant directement des jets de des (Attribut + Competence + Specialisations vs Difficulte) resolus par le serveur [2].
- **Assistant de Combat (DT)** : Un outil dedie au MJ pour gerer la timeline des Divisions de Temps (DT). Il permettait d'ajouter des PNJ, de suivre leur vitalite, leur facteur de vitesse, et de calculer automatiquement le DT de leur prochaine action [3].
- **CMS Embryonnaire** : Un back-office d'administration permettant de gerer les catalogues (armes, atouts, classes, races, sorts, lieux) [4].

## 2. La Vision Cible : Le Moteur Multi-Arbitre K&W

L'objectif est de moderniser cet heritage pour creer un **Assistant MJ & Joueur de nouvelle generation**, centre sur l'experience "Tabletop" (autour d'une table physique ou virtuelle), avec une integration profonde de l'IA (LLM) et un moteur de regles strict.

### 2.1. Le CMS : Referentiel Vivant des Regles

Le coeur du systeme repose sur les catalogues YAML/CSV (Phase 2A). Le CMS permettra au MJ (ou a l'auteur) de :

- Editer les armes, armures, sorts, atouts, et bestiaire.
- Gerer le versioning des regles (les personnages migrent d'une version a l'autre).
- Creer des templates de PNJ et des tables de loot.

### 2.2. L'Assistant Joueur (Fiche de Personnage 2.0)

Une application web responsive remplacant la fiche papier :

- **Creation guidee** : Reprise du flow legacy (14 etapes) avec validation stricte des prerequis (ex: choix irreversible de la magie).
- **Calculs automatises** : Resolution instantanee des pools de des (D10), calcul de l'XP, des niveaux, et de l'encombrement.
- **Gestion d'inventaire et Grimoire** : Acces direct aux catalogues vivants pour equiper des objets ou preparer des sorts.

### 2.3. L'Assistant MJ et le Moteur de Session

L'outil central pour le Maitre de Jeu, fusionnant le "Play" et le "Fight Assistant" legacy :

- **Gestion de Scene** : Definition du lieu, des PNJ presents, et de l'ambiance.
- **Timeline DT Unifiee** : Une interface visuelle (timeline) gerant l'initiative continue (Divisions de Temps) pour les combats, integrant les temps d'incantation (TI) des sorts et les facteurs de vitesse.
- **Controle PNJ Hybride (Le Pattern D11/D13)** : Le MJ peut assigner le controle d'un PNJ a :
  - Lui-meme (`human_gm`).
  - Un script deterministe (`auto`) pour les foules ou les animaux.
  - Un **Agent LLM** (`llm`) dote d'une personnalite, d'une memoire de session, et capable de gerer les dialogues ou les tactiques de combat basiques.

### 2.4. Vers le MJ Automatise (Solo / Coop sans MJ)

A terme, l'architecture multi-arbitre (D13) permet d'envisager des sessions sans MJ humain :

- **Le LLM comme Narrateur** : Generation de descriptions, interpretation des actions des joueurs, et gestion des dialogues PNJ.
- **Le Moteur Auto comme Juge** : Le LLM ne lance pas les des et ne triche pas avec les regles. Le moteur `rules-core` (TypeScript) valide les actions, calcule les difficultes, et resout les degats. Le LLM se contente de *proposer* des intentions d'action au moteur.
- **Generation de Scenarios Live** : Utilisation des catalogues de lieux, de factions et de lore pour generer des intrigues coherentes a la volee.

## 3. Strategie d'Implementation

Pour atteindre cette vision, le developpement doit suivre une approche modulaire :

1. **Socle de Donnees (Packages)** : Finaliser `packages/catalogs` (loaders YAML) et `packages/rules-core` (moteur de des, calculs de stats, validation des actions).
2. **Module Personnage** : Developper l'UI de creation et la fiche de personnage digitale (connectee au `rules-core`).
3. **Module Session & Combat** : Creer la timeline DT interactive et le journal d'evenements (reprise du concept de `play.php`).
4. **Module IA (LLM)** : Integrer l'agent LLM en tant que controleur de PNJ (dialogue d'abord, puis tactique), avant de l'etendre au role de MJ narratif.

## References

[1] Fichiers `user/add-character.php` et `user/update-character.php` du site legacy.
[2] Fichier `user/play.php` et template `play.tpl` du site legacy.
[3] Fichier `user/fight-assistant.php` et manager `FightAssistantMan.php` du site legacy.
[4] Structure du dossier `admin/` et `main-menu.tpl` du site legacy.
