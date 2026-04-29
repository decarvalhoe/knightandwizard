# Handover — Knight and Wizard (Phase 1 clôturée 2026-04-25)

> 🎉 **Phase 1 terminée** — 13 domaines complets, ~230 règles canoniques, ~70 entrées backlog. Document de reprise pour Phase 2 (implémentation digitale) ou pour dépiler les backlogs.

## Contexte global

**Projet** : transposition digitale du JdR papier **Knight and Wizard**.

**Phase actuelle** : Phase 1 — extraction règle-par-règle des règles legacy en docs canoniques `rules/0X-domaine.md`.

**Périmètre produit K&W** : ce dépôt porte le corpus source, l'assistant MJ/Joueur tabletop-first, les règles vivantes, le moteur multi-arbitre et l'architecture LLM. Voir [product/](product/).

**Séparation K&W-game** : `knightandwizard-game` est un projet et un dépôt séparés, avec des décisions produit distinctes (CRPG tactique coop). Les docs K&W-game ne remplacent pas les décisions K&W.

**Méthodologie validée** :
- 13 domaines numérotés D1 à D13 (révisé : à l'origine 12, ajout D13 pour rôles & passation MJ↔PJ)
- Format de fiche par règle : énoncé legacy → statut (🟢🟡🔴) → cas couverts/ambigus → précisions → transposition par moteur×arbitre×rythme → questions ouvertes
- Validation par l'auteur **question par question** (pas en batch)
- Web canonique > Paper supplémentaire (règle de priorité, cf. [sources.md](sources.md))
- L'auteur reformule, corrige, et ajoute des nuances en cours de route — **ses corrections priment** sur ma compréhension initiale

## Domaines : état d'avancement

| # | Domaine | Statut | Fichier |
|---|---|---|---|
| D1 | Résolution (dés, difficulté, succès, critiques) | ✅ Complet (11/11 questions) | [rules/01-resolution.md](rules/01-resolution.md) |
| D2 | Attributs (9 aptitudes + dérivées) | ✅ Complet (9/9 + 7 sous-questions) | [rules/02-attributs.md](rules/02-attributs.md) |
| D3 | Races (33 races) | ✅ Complet (8/8 questions) | [rules/03-races.md](rules/03-races.md) |
| D4 | Orientations (13) + Classes + Atouts | ✅ Complet (9/9 questions) | [rules/04-classes.md](rules/04-classes.md) |
| D5 | Compétences & Spécialisations | ✅ Complet (7/7, dont 2 en standby) | [rules/05-competences.md](rules/05-competences.md) |
| D6 | Création de personnage | ✅ Complet (9/9 + 2 nouvelles règles R-6.14/15) | [rules/06-creation-perso.md](rules/06-creation-perso.md) |
| D7 | Progression / XP / niveaux | ✅ Complet (8/10 + 2 standby + R-7.20/21 machine d'état mort) | [rules/07-progression.md](rules/07-progression.md) |
| D8 | Magie (11 écoles, sorts, énergie, TI, familiers) | ✅ Complet (9/10 + 1 standby + R-8.19 jet aptitude brute + R-8.20 système de temps double) | [rules/08-magie.md](rules/08-magie.md) |
| D9 | Combat (DT, actions, initiative, dégâts, armures) | ✅ Complet (32/32 questions tranchées + 21 entrées backlog Q-D9.33→53) | [rules/09-combat.md](rules/09-combat.md) |
| D10 | Équipement (armes, armures, potions, crafting, monnaie) | ✅ Complet (13/13 questions architecturales + 15 entrées backlog Q-D10.14→28 imports/extensions) | [rules/10-equipement.md](rules/10-equipement.md) |
| D11 | Contrôle PNJ (joueur/MJ humain/LLM/auto) | ✅ Complet (9/9 questions architecturales + 11 entrées backlog Q-D11.10→20 / clôt 2 backlogs D9 : Q-D9.39, Q-D9.47) | [rules/11-controle-pnj.md](rules/11-controle-pnj.md) |
| D12 | Géographie + social + économie | ✅ Complet (13/13 décisions batch pattern D + 17 entrées backlog Q-D12.14→30 / clôt Q-D11.19 réputation) | [rules/12-geographie-social-economie.md](rules/12-geographie-social-economie.md) |
| D13 | Rôles & passation MJ↔PJ | ✅ Complet (15/15 décisions batch + 6 entrées backlog Q-D13.16→21 / clôt 3 backlogs D11 : Q-D11.13, Q-D11.15, Q-D11.18 / **formalise pattern mode arbitre R-13.15**) | [rules/13-roles-passation.md](rules/13-roles-passation.md) |
| **PHASE 1** | **CLÔTURÉE 2026-04-25** | ✅ **13/13 domaines, ~230 règles canoniques, ~70 backlog** | — |

## D9 — Synthèse (clos 2026-04-25)

**Position** : D9 complet (44 règles canoniques R-9.1 → R-9.44, 32 questions tranchées Q-D9.1 → Q-D9.32, 21 entrées backlog Q-D9.33 → Q-D9.53).

**Décisions structurantes D9** (à savoir avant D10) :

- **R-9.30 — Méta-modèle d'item type-classes dynamiques** : item-types canoniques `weapon_melee`, `weapon_ranged`, `weapon_thrown`, `armor_piece`, `shield`, `ammunition`, `status`, `hit_table`, `unarmed_attack`, `mount`, `siege_engine` (à venir), `intelligent_weapon` (à venir), `combat_maneuver` (à venir). Schéma `item_type` + `item_instance` versionné, éditable par admin/MJ.
- **R-9.34 — Mode tour-par-tour vs temps réel** : configurable par campagne (`turn_based | real_time | hybrid_switchable`). Bascule triviale grâce à la base DT commune. UI de capacité de déplacement varie selon le mode (anneaux discrets vs continus).
- **R-9.32 — Déplacement et positionnement** : zones abstraites + vitesse numérique en mètres + modificateurs de terrain + UI 3 anneaux marche/course/sprint + intégration native du système de charge (D2).
- **R-9.27 — États tactiques** : catalogue vivant éditable d'états (prone, grappled, stunned, blinded, surprised_total/partial, hostage, surrendered, dishonored, etc.) avec durée DT, modificateurs, immunités.
- **R-9.21 — Tables de touches multiples** : catalogue versionné, sélection par mode arbitre, surcharge possible par item/sort.
- **R-9.24 / R-9.25 — Portée et munitions** : portée hybride catégorie + numérique, stock numérique, qualités vivantes (perforante, empoisonnée, etc.), récupération paramétrable.
- **R-9.26 — Durabilité** : 3 modes paramétrables par campagne (arcade/standard/réaliste).
- **R-9.31 — Sorts en combat** : seuils d'interruption paramétrables, AOE par sort (`target_type`, `radius`, `affects`), contre-sort via école Abjuration.
- **R-9.36 — Attaques multi-cibles physiques** : `area_attack` sur l'arme (`sweep | cone | line | ricochet | charge`).
- **R-9.37 — Fuite et poursuite** : conditions de fin de combat configurables, atouts d'évasion (Hors-la-loi : Cours toujours, Retraite stratégique, Discrétion, etc.) reconnus nativement.
- **R-9.38 — Désengagement** : 3 modes (controlled/hasty/fighting_retreat).
- **R-9.39 — Surprise/embuscade** : 3 niveaux (totale/partielle/nulle), couplage R-9.27.
- **R-9.40 — Tactique de groupe** : 5 modules (flanquement, formation, garde mutuelle, aide à l'action, buffs collectifs), atouts dédiés (Musique stimulante Barde, Défense Garde, etc.).
- **R-9.41 — Mains nues / lutte** : item-type `unarmed_attack`, manœuvres canoniques, multi-membres (nagas).
- **R-9.42 — Deux armes / armes à 2 mains** : pénalité +3 mauvaise main (regles:381), atout Ambidextrie, `min_strength` sur armes 2 mains.
- **R-9.43 — Combat à cheval** : item-type `mount`, atout Maîtrise équestre, équipement équestre.
- **R-9.44 — Coup de grâce / reddition / interrogatoire / otage** : achèvement automatique sur cible KO/prone+restrained/dying, conditions de reddition, interrogatoire (atout Anti-délivrance).

**Backlog D9 (Q-D9.33 → Q-D9.53)** : 21 sujets identifiés mais non tranchés, à traiter ultérieurement (cf. partie I du fichier `rules/09-combat.md`). Inclut : combat aquatique, acrobatique, dans l'obscurité, sorts vs sorts duel, monstres multi-attaques, combat de masse, taille différente, drogues, manœuvres spéciales (feinte/intimidation), combat aérien, sièges, rage/berserk, familiers, atouts de détection (`Détection des coups portants`, `Pressentiment`), critique aggravée par zone, armes intelligentes, gravité altérée, push/pull.

## D10 — Synthèse (clos 2026-04-25)

**Position** : D10 complet (12 règles architecturales R-10.18 → R-10.29, 13 questions tranchées Q-D10.1 → Q-D10.13, 15 entrées backlog Q-D10.14 → Q-D10.28).

**Décisions structurantes D10** (à savoir avant D11) :

- **R-10.18 — Système monétaire minimaliste** : 4 unités (Po/Pa/Pb/Pc) en factor 10. Stockage interne en Pc (entier). Conversion auto pour l'affichage. Prix fixes globaux. Aucune banque mécanique, aucune devise étrangère, aucune marge marchande.
- **R-10.19 — Stratégie d'import** : import auto avec valeurs inférées + table d'ambiguïtés détectées + édition admin/MJ. Versioning, migration des persos. S'applique à tous les catalogues (armes, protections, potions, champignons, etc.).
- **R-10.20 — Méta-modèle `creation_procedure`** : générique pour potions, rituels, enchantements, recettes, items magiques, items structurels. Sous-types (`output_type`) extensibles.
- **R-10.21 — Crafting** : `craft_check` standard (Aptitude + Compétence + Σ Spés vs difficulté) + extensions optionnelles (multi_check, moon_phase, sacred_location, divine_invocation, multi_dose_increment) + table des compétences canoniques.
- **R-10.22 — Items magiques** : couche `enchantments` cumulative sur tout item. 5 types (passive/active/charged/reactive/conditional). Création via R-10.20. Identification, dispel, désenchantement.
- **R-10.23 — Containers** : 3 modes (arcade/standard/realistic). Item-type `container` avec capacité, items magiques (sac sans fond, bourse de réduction), arborescence (mode realistic).
- **R-10.24 — Réparation** : 3 paliers (entaillé/endommagé/cassé) via `creation_procedure repair`. Coûts et délais paramétrables. Atouts dédiés (Forge magique, Bénédiction de l'objet).
- **R-10.25 — Péremption** : 3 modes (arcade/standard/realistic). Champ `expiration` sur l'item-instance avec `storage_requirements` et `quality_curve` (mode realistic).
- **R-10.26 — Loot** : 3 modes (arcade/standard/realistic). Item-type `loot_table` par PNJ template / lieu / événement. Lien R-9.37 fin de combat.
- **R-10.27 — Vêtements civils** : item-type `clothing` avec `social_class`, `concealment_capacity_kg`, `weather_protection`. Impact passif sur jets sociaux selon contexte (D12).
- **R-10.28 — Items légendaires** : 4 archétypes (`legendary_artifact`, `intelligent_weapon`, `holy_relic`, `cursed_item`) + couches optionnelles cumulables (`history`, `intelligence`, `attunement`, `evolution`, `divine_blessing`, `curse`). **Clôt le backlog Q-D9.51 armes intelligentes**.
- **R-10.29 — Outils non-combat** : 7 familles (`tool`, `instrument`, `book`, `travel_gear`, `scientific_tool`, `luxury_item`, `document`) avec champs communs + spécifiques + bonus de jet automatique.

**Backlog D10 (Q-D10.14 → Q-D10.28)** : 15 sujets identifiés mais non tranchés, à traiter ultérieurement. Inclut : imports effectifs des catalogues legacy (armes, protections, potions, champignons), extensions narratives (recettes culinaires/médicinales), atouts manquants à proposer (Forge magique, Couture habile), marchands itinérants vs fixes, banques narratives D12, items de troc, récolte de matières premières, items contextuels d'enquête, drogues et stimulants, équipement pour familiers magiques.

## D11 — Synthèse (clos 2026-04-25)

**Position** : D11 complet (8 règles architecturales R-11.15 → R-11.22, 9 questions tranchées Q-D11.1 → Q-D11.9, 11 entrées backlog Q-D11.10 → Q-D11.20). **Clôt 2 backlogs D9** : Q-D9.39 (combat de masse) et Q-D9.47 (familiers).

**Décisions structurantes D11** (à savoir avant D12) :

- **R-11.1 — Quatre contrôleurs PNJ** : `player | human_gm | llm | auto`. Tout PNJ a exactement un contrôleur à un instant donné.
- **R-11.2 — Flag PJ/PNJ mutable** : un PNJ peut devenir PJ et vice-versa.
- **R-11.15 — Architecture du contrôle** : hiérarchie d'assignation par défaut (campagne → scène → catégorie → individu), bascule dynamique (manuelle MJ ou par règle automatique : vitalité critique, charme, KO, reddition), fallback en cascade (player→human_gm→llm→auto), audit historique.
- **R-11.16 — Bestiaire** : import via R-10.19 + structure modulaire (stats obligatoires + lore optionnels avec ref D12 ou autonome). 30+ entrées paper à importer.
- **R-11.17 — IA tactique 3 niveaux** : priority list (PNJ standards) / state machine (PNJ complexes) / decision tree (PNJ avancés). Mode campagne détermine.
- **R-11.18 — Personnalité PNJ LLM** : 3 modes mémoire (none/session/persistent), prompt hybride (JSON stats + JSON personnalité + texte narratif + JSON mémoire). Évolution attitude via attitude_modifiers.
- **R-11.19 — Hostilité dynamique** : item-type `social_action` (charm/intimidation/persuasion/bribery/seduction/deception/reassurance/provocation), cumul attitude_modifiers, atouts dédiés.
- **R-11.20 — Foules / masses** : item-type `crowd` agrégé, 3 modes par scène (individual/aggregated/hybrid_threshold), morale + cohésion + débandade. **Clôt Q-D9.39**.
- **R-11.21 — Animaux non-sentients** : compétence Dressage + bond_strength (0-10) + catalogue d'ordres standards par difficulté + atouts dédiés (Empathie animale, Communion sauvage).
- **R-11.22 — Familiers** : couches débloquées par atouts du lexique (`Familier` base, `Sens du familier` sensory_link, `Main du magicien` remote_spell_casting, `Passage au familier` possession_transfer, `Rappel du familier` summon_dismiss, `Familier supplémentaire` multiplicity). Initiative distincte. Mort → drain selon couches actives. Statut `extended_rules_pending` (D8 Q-D8.6 standby). **Clôt Q-D9.47**.

**Backlog D11 (Q-D11.10 → Q-D11.20)** : 11 sujets identifiés mais non tranchés. Inclut : import effectif du bestiaire, cohérence D3↔Bestiaire, atouts manquants à proposer, architecture technique mémoire LLM, catalogue d'archétypes détaillé, triggers de bascule précis, PNJ d'interaction sociale (marchands/artisans/autorité/informateurs), créatures magiques sous-types, compagnons persistants, réputation par faction, **Q-D9.38 monstres multi-attaques par DT**.

## D12 — Synthèse (clos 2026-04-25, batch pattern D)

**Position** : D12 complet (13 règles architecturales R-12.1 → R-12.13, 13 questions batchées Q-D12.1 → Q-D12.13, 17 entrées backlog Q-D12.14 → Q-D12.30). **Clôt Q-D11.19 réputation par faction**.

**Décisions structurantes D12** (à savoir avant D13) :

- **R-12.1 — `region`** : item-type pour territoires (continent/nation/duchy/city/etc.) avec hiérarchie, géographie, politique, culture, économie, diplomatie. Catalogue : 18 nations paper (Aderand, Cortega, Dundoria, Empire, Yonkado…).
- **R-12.2 — `location`** : lieux ponctuels (auberges, temples, ruines). Manoir Rossellini comme exemple.
- **R-12.3 — `travel_route`** : voyages avec durée, méthodes (foot/horse/wagon/boat/flying/teleport), risques.
- **R-12.4 — `religion`+`deity`** : panthéons (Dieu Unique, Dieux Elfiques 12+, Dieux Orientaux 12+, Dieux Païens 8, Dieux Gnomiques 5, Culte de la Mort, Liberté de Culte, divinités raciales 60+).
- **R-12.5 — `faction`** : organisations (guildes, ordres, criminels, secret_society) avec membres, hiérarchie, alliances, réputations.
- **R-12.6 — `language`** : langues + spécialisations D5.
- **R-12.7 — Régionalisation des prix** : opt-in (R-10.18 mode B réactivable) avec multipliers, scarce_items, illegal_items par région.
- **R-12.8 — `social_class`** : noblesse/clergé/bourgeoisie/paysannerie/marginaux/esclaves. Privilèges, obligations, mobilité sociale.
- **R-12.9 — `legal_system`** : lois, crimes, peines, procédure judiciaire par région.
- **R-12.10 — Réputation par faction** : `character_reputation` avec score -100/+100, seuils (enemy/hostile/neutral/friendly/ally/revered). **Clôt Q-D11.19**.
- **R-12.11 — `quest`** : structure (giver, hooks, prerequisites, objectives, rewards, status). Lien D7 (XP, quest_points).
- **R-12.12 — `lore_entry`** : mythes, événements historiques, prophéties, légendes (la-creation-des-terres-oubliees.md).
- **R-12.13 — `custom`+`proverb`** : coutumes et culture populaire.

**Backlog D12 (Q-D12.14 → Q-D12.30)** : 17 sujets, principalement des **imports effectifs** (18 nations, 60+ divinités, mythe fondateur, organisations, us et coutumes, carte du monde, lieux notables) + extensions (météo/saisons, rencontres aléatoires, économie dynamique, génération procédurale). Inclut clôture potentielle de Q-D10.21 (marchands itinérants), Q-D10.22 (banques narratives), Q-D10.23 (troc), Q-D11.16 (PNJ sociaux).

## D13 — Synthèse (clos 2026-04-25, batch pattern D)

**Position** : D13 complet (15 règles architecturales R-13.1 → R-13.15, 15 questions batchées Q-D13.1 → Q-D13.15, 6 entrées backlog Q-D13.16 → Q-D13.21). **Clôt 3 backlogs D11** : Q-D11.13 (mémoire LLM), Q-D11.15 (triggers de bascule), Q-D11.18 (compagnons persistants).

**Décisions structurantes D13** :

- **R-13.1 — Quatre rôles canoniques** : `player | human_gm | llm | auto` avec décisions autorisées/interdites et permissions explicites. Hiérarchie de surcharge : `human_gm > player > llm > auto`.
- **R-13.2 — Cinq modes de session** : `classic_table` / `digital_human_gm` / `digital_llm_gm` / `digital_auto_gm` / `multiplayer_no_gm`.
- **R-13.3 — Mode solo** : 1 joueur + LLM principal + auto fallback.
- **R-13.4 — Mode async** : sessions étalées avec persistence + queue de décisions + timeout fallback.
- **R-13.5 — Passation GM→PJ** : un PJ devient MJ temporaire (interlude, MJ rotatif).
- **R-13.6 — Passation PJ→GM** : abandon, possession, mort sans résurrection.
- **R-13.7 — Combinaisons hybrides** : MJ humain + LLM coopératifs avec split de responsabilités + protocole d'escalation.
- **R-13.8 — Architecture mémoire LLM** : structured DB + vector store + rolling log + summarization. **Clôt Q-D11.13**.
- **R-13.9 — Catalogue triggers de bascule** : vitality_critical, charm, ko, surrender, player_inactive, llm_unavailable, gm_afk, scenario_scripted. **Clôt Q-D11.15**.
- **R-13.10 — Compagnons persistants** : recrutement (social_action/quest/rescue/hire/oath), bond_strength, partage XP/loot, conditions de séparation. **Clôt Q-D11.18**.
- **R-13.11 — Audit transversal** : log permanent (modifications/passations/arbitrages), rolling 30 jours (jets/résolutions), accès gradué.
- **R-13.12 — Arbitrage de conflits** : hiérarchie de résolution (table → MJ → règles → dés → admin) + recours (re-roll, retcon, escalade).
- **R-13.13 — Onboarding** : 3 niveaux (novice/standard/expert) + features progressives + assistance LLM modulaire.
- **R-13.14 — Cas limites** : tous arbitres indispos, paradoxes, conflits de règles, hallucinations LLM, server outage, conflits joueurs.
- **R-13.15 — Pattern mode arbitre formalisé** : schéma canonique apparaissant dans **toutes les règles D9-D12**. Phase 1 clôturée.

**Backlog D13 (Q-D13.16 → Q-D13.21)** : 6 sujets pour Phase 2 — spec technique du moteur multi-arbitre, format export/import des sessions, modération automatique anti-griefing, sous-rôles granulaires, mode tournoi PvP, intégration outils externes (Discord/Roll20/Foundry).

---

## Phase 1 — Bilan officiel

**13 domaines complétés** :

| Domaine | Règles | Backlog | Statut |
|---|---:|---:|---|
| D1 Résolution | 40+ | — | ✅ |
| D2 Attributs | 20+ | — | ✅ |
| D3 Races | 8+ | — | ✅ |
| D4 Orientations/Classes/Atouts | 9+ | — | ✅ |
| D5 Compétences | 7+ | 2 standby | ✅ |
| D6 Création perso | 11+ | — | ✅ |
| D7 Progression | 22+ | 2 standby | ✅ |
| D8 Magie | 20+ | 1 standby (familier D8 Q-D8.6) | ✅ |
| D9 Combat | 44 | 19 (Q-D9.33→53, dont Q-D9.39, Q-D9.47, Q-D9.51 clôturés ailleurs) | ✅ |
| D10 Équipement | 12 | 15 (Q-D10.14→28) | ✅ |
| D11 Contrôle PNJ | 8 | 9 (Q-D11.10→20, dont Q-D11.13, Q-D11.15, Q-D11.18, Q-D11.19 clôturés) | ✅ |
| D12 Géo/Social/Éco | 13 | 17 (Q-D12.14→30) | ✅ |
| D13 Rôles & passation | 15 | 6 (Q-D13.16→21) | ✅ |
| **Total** | **~230 règles** | **~70 backlog** | **🎉 Phase 1 close** |

**Ce qui suit (Phase 2 ou ultérieur)** :
1. **Imports effectifs** des catalogues legacy (armes, protections, potions, bestiaire, nations, religions, mythes).
2. **Backlogs D9-D13** à dépiler selon priorité (combat aquatique, items magiques détaillés, IA tactique avancée, banques narratives, intégrations VTT, etc.).
3. **Standby D5/D7/D8** : règles d'apprentissage (Q-D5.2-b/c), Q-D3.5-c-iii (validation finale), familier complet (D8 Q-D8.6).
4. **Implémentation digitale** : moteur multi-arbitre, schéma DB, prompts LLM, IA tactique, UI.

## Phase 2 — Suggestions de démarrage

**Position** : Phase 1 complète. Choix de continuation possibles :

### A) Imports effectifs des catalogues legacy ✅ **TERMINÉ (2026-04-25)**
- ✅ Armes (102 entrées) — `catalogs/armes.yaml` + `armes-ambiguites.md` (12 ambiguïtés documentées)
- ✅ Protections (49 + 11 boucliers) — `catalogs/protections.yaml`
- ✅ Potions (5 entrées) — `catalogs/potions.yaml`
- ✅ Champignons (8 syndromes) — `catalogs/champignons.yaml`
- ✅ Bestiaire (30 créatures) — `catalogs/bestiaire.yaml`
- ✅ Nations (29 nations : 18 paper + 11 ajouts via cartes) — `catalogs/nations.yaml` v2 (Portes d'Azrak, Stazyliss, Terres Sauvages, Royaume du Chaos, Onarit, Lounaxill, Île aux Basilics, Montagnes Grises, Treadur, Chez Nous, Terres Sans Noms)
- ✅ Religions/Divinités (9 religions, 70+ divinités) — `catalogs/religions.yaml`
- ✅ Lore narratif (6 entrées préservées) — `catalogs/lore-index.yaml`

- ✅ Carte du monde — `catalogs/world-map.yaml` (5 régions web + 9 villes + 17 lieux + 6 régions découvertes via carte mondiale + 15 villes Cortega)
- ✅ Organisations — `catalogs/organisations.yaml` (7 organisations : 5 maisons divinatoires, Devins fédération, Sans Noms)
- ✅ **Images visuelles** — `catalogs/images.yaml` (1 carte mondiale + 15 cartes régionales + 10 blasons + 3 web assets, 29 fichiers référencés)
- ✅ **Villes extraites des 15 cartes régionales** — `catalogs/cities-from-maps.yaml` (~280 villes + 10 portes fortifiées Azrak + 3 nouvelles régions Stazyliss/Treadur/Chez Nous + zones géographiques)

**Total : ~690 entrées canoniques importées en 12 catalogues YAML + 29 fichiers images référencés.** Backlogs Q-D10.14/15/16/17, Q-D11.10, Q-D12.14/15/16 clôturés.

**Corrections post-validation auteur (2026-04-25)** :
- Difficulté `95` ≡ difficulté `10` (notation étendue D1 R-1.X : « 9 ET 5 minimum sur 2 dés »). Appliqué aux 4 armes (Faux, Goupillon, Fléau de guerre × 2) et 1 potion (Calme Loup-Garou).
- Manoir Rossellini : propriété d'un groupe de PJ, **hors règles canoniques**. Marqué `is_canon: false` dans `world-map.yaml`. Plans/screenshots non importés.

**Anomalies à signaler** (à creuser ultérieurement) :
- "Portes d'Azrak" : nation naine présente en web mais absente de nations.md paper.
- Princesse Alteria : "Santa-Lucarna" (paper) vs "Santa-Ferucci" (web).
- Oracle Cortega : 2 gorgées (paper) vs 1 gorgée (web).
- Géomanciens : maison-mère "Deonit" (organisations.md) ≠ "Hildurm" (nations.md capitale Terres du Nord).

**Régions découvertes via les cartes mondiale + régionales** mais absentes de nations.md paper :
- Via carte mondiale (`terres-oubliees.jpg`) : **Royaume du Chaos**, **Onarit**, **Lounaxill** (mentionné poisons.md), **Île aux Basilics**, **Montagnes Grises**, **Terres Sauvages**, **Terres Sans Noms** (cortega.jpg)
- Via cartes régionales : **Stazyliss** (Hommes-Lézards, cf. yonkado.jpg + irtanie.jpg), **Treadur** (NE Collines d'Ico), **Chez Nous** (frontière W Fauche-le-Vent)

**Villes extraites** : ~280 au total (incluant capitales et villages) sur les 15 cartes régionales. Détail :
- Cortega 15, Alteria ~30, Collines d'Ico ~20, Detre 16, Dundoria 13, Empire 35, Enorie 23
- Fauche-le-Vent 19, Forêt de Tyrkan 28, Haut Royaume 24+5 îles, Irtanie 22
- Portes d'Azrak 33 villes + 10 portes fortifiées, Sombre Monde 25, Terres du Nord 7+zones, Yonkado 25

**Détails clés extraits** :
- **Portes d'Azrak** : 10 portes fortifiées explicites (Nord, Brameust, Melaran, Volcan, Niebel, Lâche, Orotrim, Waldnor, Gruduria, Sud) — confirme la nature de "nation entièrement fermée" derrière des passes nain.
- **Terres du Nord** : 7 tribus + Hildurm = confirmation visuelle des 8 tribus de Sorolson (paper).
- **Haut Royaume** : 5 îles + pieuvre géante au nord (kraken à ajouter au bestiaire ?).
- **Volcans** dans territoire nain (Portes d'Azrak) — habitat naturel forgerons.

### B) Implémentation digitale (moteur multi-arbitre)
- Spec technique — `Q-D13.16`
- Schéma DB normalisé selon les R-9.30 / R-10.20 / R-11.16 / R-12.X
- Prompts LLM système (par mode session R-13.2)
- Engine combat (DT timeline R-9.22 + IA tactique R-11.17)
- UI multi-mode (arcade/standard/realistic R-9.26 et al.)

### C) Approfondissement backlogs (priorité au choix)
- **D9 Combat** : combat aquatique, acrobatique, magique-vs-magique, créatures multi-attaques, sièges, etc.
- **D10 Équipement** : marchands, banques narratives, items contextuels, drogues
- **D11 Contrôle PNJ** : créatures magiques sous-types, PNJ sociaux, monstres multi-attaques
- **D12 Géo/Social/Éco** : carte 3D, rencontres aléatoires, économie dynamique, génération procédurale

### D) Validation des règles standby
- D5 Q-D5.2-b/c : système d'apprentissage (formule jours)
- D7 Q-D7.X : R-7.18 Q-D3.5-c-iii niveau après transformation (à valider)
- D8 Q-D8.6 : règles complètes du familier (auteur a indiqué qu'elles sont plus riches)

## ANCIENNE — D8 résumé (pour archive)

**Sources principales** pour D8 :
- [documents/regles/index.md:91-134](documents/regles/index.md) — section Magie complète
- [documents/grimoire/index.md](documents/grimoire/index.md) — 2621 lignes, 11 écoles, ~889 entrées
- [regles-papier/extracted/listes/grand-grimoire.md](regles-papier/extracted/listes/grand-grimoire.md)
- [regles-papier/extracted/listes/lexique.md](regles-papier/extracted/listes/lexique.md)
- [regles-papier/extracted/listes/atouts-de-niveaux.md](regles-papier/extracted/listes/atouts-de-niveaux.md)

**Décisions D8 structurantes pour D9-D10** :
- **R-8.6 — TI** : Temps d'Incantation en DT
- **R-8.7 — Concentration** : sort interrompu sur dégâts subis
- **R-8.19 — Jet d'aptitude brute** : Endurance, FV, FVol seuls (pas de comp.)
- **R-8.20 — Système de temps double** : narratif (heures/jours) et combat (DT 0,2s) imbriqués

## ANCIENNE — D7 résumé (pour archive)

**Sources principales** pour D7 :
- [Experience.doc](regles-papier/extracted/listes/experience.md) — coûts XP officiels (déjà bien intégrés en D2 R-2.20)
- [documents/regles/index.md:206-248](documents/regles/index.md) — section Niveaux + Expérience
- [documents/atouts-niveaux/index.md](documents/atouts-niveaux/index.md) — atouts de niveau par orientation
- [regles-papier/extracted/listes/atouts-de-niveaux.md](regles-papier/extracted/listes/atouts-de-niveaux.md) — version paper
- [site/includes/class/CharacterPlayer.php:60-189](site/includes/class/CharacterPlayer.php) — calcul levelPoints
- [site/includes/managers/user/UpdateCharacterMan.php](site/includes/managers/user/UpdateCharacterMan.php) — méthodes de mise à jour
- [site/includes/managers/user/AddCharacterMan.php:486-946](site/includes/managers/user/AddCharacterMan.php) — `setRandom*` pour PNJ

**Décisions D2 déjà actées qui s'appliquent à D7** :
- Coûts XP : NA × 5 attributs, NA × 20 au-delà limite, NA × 3 compétences/spés, NA × 10 sorts, 10 vitalité flat, 3 énergie flat, NA × 10 atout classe éphémère, (NB-NA+1) × 25 facteurs
- XP attribué par session : 1-8 pts + 1 pt quête (présence, concentration, parole, psychologie, objectif, interprétation, quête)
- Mort = perte XP, points de quête à part
- **Trou** : durée d'apprentissage en jours (Q-D5.2-b standby)
- Génération PNJ aléatoire via `setRandom*` (séparée du flow PJ guidé via XP)

**Sujets à couvrir en D7** :
- Mécanisme de gain XP (par session)
- Mécanisme de dépense XP (passage de niveau, achat de points)
- Détection / processus de passage de niveau
- Pool d'atouts au passage de niveau (R-3.4 / R-4.7)
- Atouts éphémères cumul (déjà couvert)
- Distribution random PNJ par niveau
- Q-D3.5-c-i/ii/iii (transformation de race en cours de jeu) à creuser
- Migration des persos sur changement de règles (cf. méta-principe rules-living)
- Fenêtre temporelle d'application des XP (entre sessions ? sur demande ?)

## ANCIENNE — D6 résumé (pour archive)

**Toutes questions D6 tranchées** :
- ~~Q-D6.1~~ : Ordre étapes — hybride par mode (tutoriel strict / libre dépendances / expert libre)
- ~~Q-D6.2~~ : Validation timing — hybride par mode (tutoriel par étape / libre warnings live / expert final)
- ~~Q-D6.3~~ : Brouillons — auto-save par étape + manuel + expiration 30 jours
- ~~Q-D6.3-a~~ : Drafts multiples — illimité (expiration auto fait le ménage)
- ~~Q-D6.4~~ : Templates étendus + générateur PNJ cohérent par niveau (toutes combinaisons, lot, contexte narratif)
- ~~Q-D6.5~~ : Avertissements de cohérence — 2 couches (mode arbitre × mode UX)
- ~~Q-D6.6~~ : Familiers (standby règles plus profondes) + Compagnons/montures (pas à création)
- ~~Q-D6.7~~ : Multi-PJ — 1 PJ par campagne, multi-campagne pour 1 PJ, rôles MJ/joueur non-exclusifs
- ~~Q-D6.8~~ : Divinité — opt-in mécanique, extensibilité religieuse (autres religions futures)
- ~~Q-D6.9~~ : Création N > 1 hybride par mode + restrictions XP cohérent
- ✅ R-6.14 : Import/Export JSON automatique avec checksum + migration version
- ✅ R-6.15 : Feuilles tabletop digitales (PDF + web responsive, modes complet/combat/social/admin, temps réel)

**Méta-principe acté 2026-04-25** : *les règles sont vivantes* — toutes versionnables, modifiables via admin/MJ, migration des persos. Mémoire enregistrée. S'applique à tous les domaines D1-D13.

## Règle de comportement standard (mémoire)

**À chaque question de phase 1**, je dois :
1. **Lire les sources concernées** (lexique, bestiaire, atouts-de-niveaux, regles, code) AVANT de poser la question
2. **Citer le texte exact** dans la question pour que l'auteur ait le contexte
3. Si la description est absente : **le dire explicitement** (« pas trouvé »)
4. Application web canonique > paper supplémentaire pour les divergences

(Mémoire enregistrée dans `~/.claude/projects/C--Dev-knightandwizard/memory/feedback_lexique_verification.md`)

## Sources principales

**Web scraped (canonique)** : `documents/regles/`, `documents/bestiaire/`, `documents/classes/`, `documents/competences/`, `documents/atouts/`, `documents/atouts-niveaux/`, `documents/grimoire/`, `documents/armes/`, `documents/potions/`, `documents/cartes/`, `monde/`, `personnages/`, `outils/`, `raw-html/`

**Paper (supplémentaire)** : `regles-papier/extracted/regles/regles.md`, `regles-papier/extracted/listes/*.md` (lexique, bestiaire, atouts-de-niveaux, experience, grand-grimoire, orientations-et-classes, armes, protections, rituels-et-potions), `regles-papier/extracted/infos/*.md` (table-des-touches, monnaie, poisons, champignons-toxiques), `regles-papier/extracted/histoires/*.md`, `regles-papier/extracted/manoir-rossellini/*.png`, `regles-papier/extracted/kw.csv`

**Code** : `site/includes/class/Character.php`, `CharacterPlayer.php`, `Arena.php`, `Npc.php`, `Place.php`, `Weapon.php` ; `site/includes/managers/_DBManager.php` (3170 lignes), `_DiceManager.php`, `user/AddCharacterMan.php`, `user/UpdateCharacterMan.php`, `user/FightAssistantMan.php`, `user/DiceRollerMan.php`, `_PrintManager.php` (PDF generator)

**Inventaire complet** : [sources.md](sources.md) à la racine.

## Décisions structurantes (rappel pour cohérence)

### Architecture cible (3 couches orthogonales)
- **Ruleset** : Legacy 1:1 / Digital adapté
- **Arbiter** : MJ humain / MJ LLM / MJ auto
- **Pacing** : Async / Tour par tour / Temps réel

### Règles vivantes (acté 2026-04-25, méta-principe transversal)
**Toutes** les règles K&W sont versionnables, modifiables, extensibles par admin/MJ. Aucun hard-code dans le moteur. Le résultat final de la phase 1 sera un **référentiel évolutif**, pas un système figé. Mémoire dédiée enregistrée. S'applique à tous les domaines D1-D13.

### Modèle "exception est la règle"
Le système est extensible par défaut — base + atouts/sorts/objets qui modifient. Pas de drapeaux booléens rigides type "magicien only". Cf. R-2.11 (énergie) qui a été le cas-pivot.

### Système de temps double (R-8.20, D8) — architecture fondamentale
- **Échelle narrative** (heures/jours/semaines) : hors combat
- **Échelle DT** (1 DT = 0,2 s) : en combat
- Imbrication : combat s'inscrit dans le narratif (50 DT combat = 10 s narratif)
- Switch tour-par-tour ↔ temps réel trivial (base DT identique)
- Multiplicateur de cadence **instancié** par campagne/session (× 0.5 pour ralentir, × 2 pour accélérer)
- Concerne D9 Combat, gestion des sorts à durée, mécaniques combat

### Trois types de jets distincts (R-8.19, D8)
- **Action standard (D1 R-1.2)** : Aptitude + Compétence + Σ Spés
- **Jet d'aptitude brute** : Aptitude seule (D10s) — résistance naturelle, sort « Contre jet d'X »
- **Test de volonté D20** : F.Volonté + modificateurs

### Catégories de cumul des sorts (D8 Q-D8.9)
9 types : `buff` / `debuff` / `drain` / `damage` / `transformation` / `heal` / `summon` / `illusion` / `permanent_effect`. Règle de stacking par défaut : max + refresh pour buffs/debuffs, cumul total pour drains/damage/heal.

### PS = Points de Sort = mana courant (D8 Q-D8.10)
Drain de sort réduit `energy` (current pool), pas `energyMax` (capacity). Récupération via repos / potions standard. Pas de perte XP.

### Modèle de modificateurs (R-1.36 à R-1.40 dans D1)
Tout est additif et linéaire. Aucun cap dur sur la difficulté (la règle d'empilement diff>9 s'étend à l'infini). 14 sources de modificateurs identifiées.

### Pattern par mode (récurrent dans toutes les questions)
Quand une question concerne un comportement digital, l'auteur a tendance à choisir l'**hybride** :
- MJ humain (papier) = liberté totale
- MJ LLM = borné par template canonique validé
- MJ auto = strict canonique

### Système d'apprentissage (R-5.6-bis)
5 dimensions : accès au savoir / temps en jours / jet d'apprentissage / jet d'enseignement / coût XP. **Trou** : la formule des "jours de base" n'existe nulle part dans les sources. **Mise en standby** (Q-D5.2-b et Q-D5.2-c).

### Polyvalence (atout pivot)
Casse la barrière d'orientation (mais pas de classe). Permet à un Guerrier d'acquérir des atouts d'autres orientations jusqu'au niveau Polyvalence + 1.

### Vampire / Art occulte (cas-école d'exception)
Atout racial N2 qui donne 40 énergyMax + 1 sort de magie noire à un perso non-magicien. Référence pour traiter d'autres cas similaires.

## Questions persistantes (à reprendre plus tard)

| Question | Domaine | Sujet |
|---|---|---|
| Q-D3.2-b | D3 → D4/D8 | Mécanique du jet d'évitement de Rage lunaire (confinement) |
| Q-D3.5-c-i | D3 → D7 | Aptitudes au-dessus de la nouvelle limite raciale après transformation : capping ou grandfathering ? |
| Q-D3.5-c-ii | D3 → D7 | Bases dérivées (vitalityMax, FV, FVol) recalculées ou conservées après transformation ? |
| Q-D3.5-c-iii | D3 → D7 | Niveau actuel change-t-il après changement de catégorie (transformation) ? |
| Q-D3.7-a | D3 → D4 | Lycanthropie volontaire pré-N9 (Transformation hybride) — texte ambigu |
| Q-D5.2-b | D5 | Formule de durée d'apprentissage en jours — **trou complet, à concevoir** |
| Q-D5.2-c | D5 | Couplage élève/mentor (réussites cumulées ? seuil ?) — dépend de Q-D5.2-b |
| Promotion communautaire (Q-D5.1-a) | D5 | Seuils N/M pour valider une compétence custom au catalogue |

## Découvertes notables (souvent corrections de ma compréhension initiale)

1. **13 orientations**, pas 9 (correction en D4)
2. **Repos 8h restaure aussi la vitalité** (correction R-2.10 en D2 → révisé en D3 Q-D3.6)
3. **Magicien : pas de compétence primaire**, sorts ×2 quel que soit l'école (D4 Q-D4.9)
4. **Atouts perm peuvent être partagés** entre plusieurs classes (relation N:1, D4 Q-D4.7-8)
5. **Familier = atout d'orientation Magicien permanent**, pas éphémère (exception)
6. **Repos du guerrier** divise par 2 le temps de repos requis (cumulable : 4h → 2h → 1h…)
7. **Vampire Art occulte** = pivot pour le modèle d'exception extensible
8. **Système d'apprentissage à 5 dimensions** non-documenté explicitement, déduit des atouts qui le modifient
9. **Catalogue des compétences éditable comme un CMS** (admin/MJ peuvent restructurer dynamiquement)
10. **Zombie présent dans web mais pas paper** — 33 races (web canonique)

## Méthodes de continuation

**Pour reprendre la conversation** dans une nouvelle session :
1. Lire ce document `_HANDOVER.md` en premier (Phase 1 close, état Phase 2)
2. Lire `MEMORY.md` (`~/.claude/projects/C--Dev-knightandwizard/memory/MEMORY.md`)
3. Lire `sources.md` à la racine
4. Choisir une continuation dans **Phase 2 — Suggestions de démarrage** ci-dessus (A imports / B implémentation / C backlogs / D standby)
5. **Tous les backlogs ouverts à dépiler** :
   - **D9** : 19 entrées Q-D9.33 → Q-D9.53 (3 clôturés en D11/D10)
   - **D10** : 15 entrées Q-D10.14 → Q-D10.28
   - **D11** : 9 entrées Q-D11.10 → Q-D11.20 (Q-D11.13, .15, .18, .19 clôturés en D13/D12)
   - **D12** : 17 entrées Q-D12.14 → Q-D12.30
   - **D13** : 6 entrées Q-D13.16 → Q-D13.21 (Phase 2 spec)

**Format de question canonique** :
```markdown
## Q-DX.Y — [Sujet]

### Full context
- Source legacy citée
- Description lexique si applicable
- Lien avec règles déjà actées

### Ma question
- Option A...
- Option B...
- Option C...

**Mon avis** : ...

Ton choix ?
```

L'auteur répond souvent par une seule lettre (A/B/C/D) ou un commentaire court — parfois il corrige le cadrage (cas critique : Q-D5.2 où il a demandé une recherche plus profonde sur les atouts d'apprentissage avant de répondre).

## Outils disponibles

- LibreOffice 26.2 installé (extraction .doc/.ppt/.xls fonctionnelle)
- Python 3.13 + pypdf, xlrd, docx2txt, python-docx (libs d'extraction)
- gh CLI configuré
- Code source PHP K&W disponible localement (mirror FTP)

## Notes UX

- L'utilisateur écrit parfois en français approximatif ("ça pourais", "competance", etc.) — interpréter charitablement
- Il préfère **les réponses courtes** quand il s'agit de valider (souvent juste "A" ou "oui")
- Il **corrige spontanément** quand mon cadrage est imparfait — accepter et re-cadrer
- Pour les sujets complexes, il préfère qu'on creuse les sources d'abord (cf. règle de mémoire)
- Il est **l'auteur du jeu** — c'est l'autorité ultime sur les choix de design
