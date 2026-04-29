# Synthese de Comprehension : Projet Knight & Wizard

## 1. Vue d'Ensemble et Etat Actuel

Le projet **Knight & Wizard** est une transposition digitale ambitieuse d'un jeu de role (JdR) papier. Il ne s'agit pas d'un simple Virtual Tabletop (VTT) ou d'une fiche de personnage numerisee, mais d'un veritable **moteur de jeu de role (RPG engine)** concu pour supporter une architecture multi-arbitre (Humain, LLM, Automatique).

Actuellement, le projet a franchi deux etapes majeures :

- **Phase 1 (Terminee)** : La canonisation exhaustive des regles. 13 domaines (D1 a D13) ont ete documentes, representant environ 230 regles canoniques qui couvrent la resolution, les attributs, les races, les classes, la magie, le combat, l'equipement, le controle des PNJ, la geographie/economie, et les roles d'arbitrage.
- **Phase 2A (Terminee)** : L'importation et la structuration des catalogues de donnees (armes, protections, bestiaire, nations, religions, etc.) au format YAML, totalisant environ 1100 entrees.
- **Phase 2B (En cours)** : Le developpement d'une carte interactive (application frontend Leaflet/Vite) utilisant les donnees geographiques structurees.

Le depot actuel (`knightandwizard`) sert de **referentiel source** : regles, catalogues, lore, donnees legacy, carte, assistant MJ/Joueur et architecture LLM.

Le projet **K&W-game** est separe, dans un autre depot, et porte des decisions produit distinctes.

## 2. Architecture et Meta-Principes

Le design du systeme repose sur des fondations solides et des partis pris architecturaux forts.

### Le Moteur Multi-Arbitre (Pattern D13)

Le systeme est concu pour accepter quatre types de controleurs pour n'importe quelle entite (PJ ou PNJ) :

1. **Joueur humain** (`player`)
2. **Maitre de Jeu humain** (`human_gm`)
3. **Agent LLM** (`llm`)
4. **Script deterministe** (`auto`)

Une hierarchie stricte (`human_gm > player > llm > auto`) gere les conflits et les passations de controle, permettant des modes de jeu varies : solo avec LLM, table classique, hybride.

### Le Systeme de Combat (DT - Divisions de Temps)

Le combat n'est pas base sur des tours classiques (Round/Turn) mais sur une **timeline continue de Divisions de Temps (DT)**, ou 1 DT = 0,2 seconde. Chaque action coute un certain nombre de DT (le "Facteur de Vitesse" du personnage). Ce systeme permet une gestion fine des interruptions, des incantations magiques et des deplacements.

### Les Regles Vivantes (CMS)

Toutes les donnees (armes, atouts, etats tactiques) sont concues pour etre editables et versionnables via un futur CMS. Le moteur de jeu (`rules-core`) ne doit contenir aucun hard-code de contenu, mais uniquement la logique de resolution.

## 3. Projection Produit : MVP Recommande K&W

La prochaine etape logique pour le depot K&W est de construire un **Compagnon de table digital / Moteur K&W tabletop-first**.

Ce MVP devrait comprendre :

1. **Fiche de Personnage Digitale** : Creation, import/export, calcul automatique des jets, gestion de l'XP et de l'inventaire.
2. **Moteur de Session** : Gestion de campagne, journal d'evenements canonique, et file de decisions pour les differents arbitres (Humain/LLM/Auto).
3. **Combat Tactique DT** : Une visualisation sobre (timeline + positions abstraites/zones) du systeme de Divisions de Temps, sans necessiter de rendu 3D complexe dans un premier temps.
4. **Assistant MJ (LLM)** : Integration de l'IA comme aide narrative et assistant de regles, tout en gardant le moteur automatique strict pour les calculs.
5. **CMS de Regles** : Interface pour editer les catalogues YAML existants.

## 4. Stack Technique et Prochaines Etapes

L'architecture cible s'oriente vers un monorepo avec des packages separes :

- `packages/rules-core` : Le coeur du moteur en TypeScript pur, testable unitairement, sans dependance a l'UI.
- `packages/catalogs` : Loaders et schemas de validation pour les donnees YAML.
- `apps/game` : L'application principale K&W pour joueur/MJ.
- `apps/server` : API et base de donnees (PostgreSQL/SQLite) pour la persistance des sessions.

Ordre de construction recommande :

1. Verrouiller les schemas de catalogues et leur validation.
2. Implementer le moteur `rules-core` (des, resolution, personnages).
3. Developper la fiche de personnage web.
4. Mettre en place le systeme de session et le journal d'evenements.
5. Integrer le moteur de combat DT minimal.
