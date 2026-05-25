# Moteurs rules-core — cadrage (moteur d'effets + dégâts/défense)

> Cadrage des deux chantiers `rules-core` identifiés par la carte des moteurs
> (voir `mecaniques-transversales.md`). **Principe directeur** : *données déclaratives +
> moteur générique* — on ne code pas 2406 atouts ni 100 armes ; chaque effet/stat est une
> **donnée** de catalogue que le moteur **interprète**. Aligné « règles vivantes » + NOMOS
> (colonne `source → structuré → produit`).

Statut : **brouillon de cadrage pour relecture** (auteur K&W = autorité).

---

## 1. Modèle d'effet — le pont prose ↔ déclaratif

Un effet doit porter **3 représentations liées**, une seule source de vérité :

```yaml
EffectModel:
  id: abordage
  source:                 # ① AUTORITÉ — prose legacy, immuable, tracée (NOMOS)
    prose: "Additionne le niveau au nombre de dés lors d'un combat sur un navire."
    ref:   "lexique:… / R-x.y"          # span source
  spec:                   # ② MOTEUR — structuré, typé, exécutable
    target: pool
    op: add
    value: level
    condition: { context: combat, env: naval }
    activation: passive
    duration: permanent
  render:                 # ③ HUMAIN — généré AUTOMATIQUEMENT depuis spec
    # "Ajoute votre niveau au pool de dés en combat naval."
  fidelity: covered | ambiguous | pending     # fidélité prose ↔ spec
  ambiguity_ref: null | "#57-…"
```

**Les 3 faces** :
- ① **`source`** — la prose canonique + sa référence. L'autorité ; on n'y touche pas.
- ② **`spec`** — ce que **le moteur consomme** (déterministe, typé).
- ③ **`render`** — texte lisible **généré depuis `spec`** par un renderer générique → affiché en UI **et** support d'**audit** : comparer `render` vs `source.prose`.

**Boucle de fidélité (le garde-fou honnêteté)** :
- **prose → spec** = encodage (humain / LLM-assisté), **vérifié** par `render ≈ source.prose`. Tout écart → `fidelity ≠ covered` → ambiguïté `#57`. Pas d'invention silencieuse.
- **spec → lisible** = automatique. Le texte UI **ne dérive jamais** du spec (pas de prose en double à maintenir).
- **Règles vivantes** : on édite le `spec`, le `render` se régénère, la prose reste la référence d'autorité.

Ce modèle est **générique** : il vaut pour toute règle prose→exécutable, pas que les atouts.

---

## 2. Format des valeurs, conditions et rendu

### 2a. `value` (et formules)
Grammaire **restreinte et déterministe** (pas de code arbitraire — sûr, versionnable) :

| Forme | Exemple | Sens |
|---|---|---|
| littéral | `-1`, `+2`, `0` | constante |
| variable perso (whitelist) | `level`, `force`, `stamina`, `vitalityMax`, `energyMax` | lue sur le perso au moment T |
| expression simple | `level*2`, `level+1` | `+ - * /` + entiers + variables whitelist |
| table | `{ table: gravite_d100, key: roll }` | lookup (ex. gravité d'échec critique) |

Le moteur évalue `value` contre le perso + le contexte. Variables hors whitelist = erreur de validation.

### 2b. `condition` (déclenchement)
Vocabulaire de **prédicats whitelistés**, évalués contre le contexte d'action :

| Clé | Exemples | Sens |
|---|---|---|
| `context` | `combat`, `exploration`, `social`, `rest` | scène en cours |
| `env` | `naval`, `mounted`, `underwater` | environnement |
| `action_type` | `attaque`, `defense`, `sort`, `esquive` | type d'action (R-1.12) |
| `target_tag` | `undead`, `demon`, `magical` | nature de la cible |
| `weapon` / `school` | `arc`, `abjuration` | outil/école |
| `self_state` | `enraged`, `wounded` | état du porteur |

Combinaison : `all_of` / `any_of`. Vocabulaire **extensible** (règles vivantes), versionné.

### 2c. `render` (renderer générique)
Génère une phrase FR depuis le `spec` : `gabarit[(target, op)] + value rendue + condition rendue`.

| (target, op) | Gabarit |
|---|---|
| (pool, add) | « Ajoute {value} au pool de dés » |
| (difficulty, sub) | « Réduit la difficulté de {value} » |
| (aptitude, add) | « +{value} en {scope} » |
| (status, grant) | « Inflige l'état {scope} » |
| (vitality, add) | « Restaure {value} points de vitalité » |
| (damage, add) | « Inflige {value} dégâts supplémentaires » |

+ condition : « … en combat naval », « … contre les morts-vivants ». Les clés de condition ont des **libellés FR**. Le `render` reste **toujours synchrone** avec le `spec`.

---

## 3. Moteur d'effets  *(priorité 1 — le plus rentable)*

**Objectif** : appliquer les effets (atouts, sorts, potions, capacités) comme **modificateurs** (R-1.39, R-2.17) ou **états** (R-9.27).

- **Entrées** : perso (attributs base, effets actifs) + contexte (action, cible). **Sortie** : modificateurs effectifs (aptitude / FV / difficulté / pool / énergie) + états.
- **Mécaniques** : R-1.36→39 (empilement linéaire), R-2.17 (aptitude effective), R-2.11 (énergie extensible), **R-3.3 / R-3.4** (atouts raciaux/handicaps), R-9.27 (états).
- **Intégration** : nouveau `effects.ts` → `computeEffectiveModifiers(char, activeEffects, ctx)` ; `character.ts` (aptitude effective) · `dice.ts` (pool/difficulté) · `combat.ts` (états) le consomment.
- **Build** : (1) `EffectModel` + parseur/validation (value/condition) ; (2) renderer générique ; (3) `applyEffects` (calcul des modificateurs) ; (4) durée/activation ; (5) famille pilote ; (6) tests (dont `render ≈ prose`).

> **⚠️ Le vrai coût n'est pas le moteur — c'est l'encodage.** Les effets du catalogue sont en
> **prose** (~800 atouts + sorts). Les structurer en `spec` (avec fidélité auditée) est le gros
> du travail, et **là vivent les ambiguïtés `#57`**. Le moteur lui-même est petit.

---

## 4. Moteur dégâts / défense  *(priorité 2)*

**Objectif** : calculer les **dégâts finaux** d'une attaque (jet de dégâts + chaîne de défense ⑤) — produire le nombre que `combat.applyDamage` consomme aujourd'hui à l'aveugle.

- **Entrées** : attaquant (Force, arme, réussites au toucher) + défenseur (boucliers, résistances %, armures P/E/C/T par zone/couche, endurance) + zone (Table des Touches/ciblée) + circonstances + RNG.
  **Sortie** : dégâts finaux typés + **log par étape** (auditable).
- **Mécaniques (ordre R-9.12)** : jet de dégâts R-9.9/9.10 → 4 types R-9.11 → bouclier R-9.7/8 → résistances % R-1.32/33 → circonstance R-9.13 → protections P/E/C/T par couche R-9.14 → **endurance R-9.16 (si la zone l'autorise)** → **×2 zone R-9.15 (en dernier)** → seuils R-9.17 *(déjà dans `applyDamage`)*.
- **Intégration** : `combat.ts` — nouvelle `computeAttackDamage(attacker, defender, ctx)` **en amont** de `applyDamage` (inchangé : vitalité/mort/inconscient/malus/retard). Consomme **données armes/protections** (catalogues) + **résistances** (du moteur d'effets / race).
- **Build** : chaque étape de la chaîne = **fonction pure testable** vs les **exemples canoniques** des règles.

---

## 4bis. Résolution d'attaque d'arme & attribut par type d'action

**Acté (autorité K&W, 2026-05-25).** Une attaque d'arme se résout en **deux phases couplées**, à **attributs imposés** (≠ action générale, où l'attribut est libre) :

| Phase | Attribut | Pool / calcul | Modificateurs qui s'y appliquent |
|---|---|---|---|
| ① **Touche** | **Dextérité (toujours)** | Dex + Compétence(arme) + Σ Spés + dés ajoutés | tous les modificateurs de **difficulté** ; dés de **pool** (atout de classe « +niveau », effets, équipement) |
| ② **Dégâts** *(si touche)* | **Force** *(si la formule de l'arme inclut `F`)* | jet de Force, difficulté `7 − réussites nettes de touche` (R-9.10) ; `dégâts = (réussites_force si F) + dégâts_arme + munition + Σ mods` | modificateurs de **dégâts** (atout / effet / sort) |

- **Couplage** : les réussites **nettes** de touche (R-1.23 : après esquive/parade) fixent la difficulté du jet de Force (R-9.10). Les deux phases ne sont **pas** indépendantes.
- **Inclusion de la Force = par arme** (token `F` de `damage_formula`), **pas** mêlée/distance (R-9.9 corrigé ; preuves Fronde `F+bille` vs Lance-pierres `2+bille`, couteau de lancer `F+1`).

**Pattern général — l'attribut est fonction du type d'action** (au-delà du combat) :

| `action_type` | Attribut imposé |
|---|---|
| `general` | **libre** (choisi par le joueur) |
| `weapon_hit` | Dextérité |
| `weapon_damage` | Force (si l'arme l'inclut) |
| `sort` | Intelligence (D8) |
| `endurance` | Endurance |
| `esquive` / `parade` | contre-action (Réflexes + Gymnastique + Esquive / arme) |

**Conséquence EffectModel** — les modificateurs sont **typés par `target`**, et `target` détermine **la phase** où ils atterrissent :

| `target` | Phase |
|---|---|
| `difficulty`, `pool`, `aptitude` | ① touche |
| **`damage`** *(à AJOUTER à l'enum)* | ② dégâts |

L'enum actuel (`aptitude|factor|difficulty|pool|energy|vitality|status`) **n'a pas** `damage` → les adds de dégâts (atouts / effets / sorts) n'ont aujourd'hui aucune cible. **Ajout requis** (suite épic effets #122).

---

## 4ter. Modèle activité / Domaine (atouts conditionnels)

**Acté (autorité K&W, 2026-05-25).** Le `condition.activity` d'un `EffectModel` est un **prédicat de Domaine** : il décrit l'activité où l'effet s'applique. Origine : les **88 atouts de classe (75) + orientation (13)** suivent tous ce modèle. La majorité des Domaines s'**auto-infèrent** du jet ; une minorité **irréductible** exige une **intention déclarée et gouvernée**.

### Dimensions de match

| Dimension | Sens | Exemples |
|---|---|---|
| `competence` / `spec` | activité de compétence (cascade : une compétence matche ses spés filles) | danse, forge, alchimie, pistage |
| `aptitude` | attribut engagé | perception, volonté, intelligence |
| `context` | cadre situationnel | combat naval, duel, combat défensif, vs-monstres |
| `tool` | objet « de prédilection » (→ slots) | arme, instrument, monture, animaux |
| `school` | couleur / école de magie | 11 atouts « Magie [couleur] » = `−1 diff` tous sorts de l'école |
| `target` | cible déclarée de l'action | allié (employeur), ennemi + tag magicien |
| `intent` | but déclaré, irréductible | sauvegarder, nuire, défendre les faibles |

Prédicat **composite** = AND intra-prédicat (ex. *défense* = `context: combat_defensif` + `tool: arme_predilection`). Le OR passe par `condition.any_of`.

### Slots de prédilection *(généralise « arme de prédilection »)*

Famille de slots liés au perso : `arme` (coup-décisif / défense / précision), `instrument` (son-envoûtant), `monture` / locomotion (périple), `animaux` (élevage), `domaine` d'orientation (magnétisme, maîtrise-martiale, ouvrage, paysannerie, service).

Machine à états commune : **1** valeur par type à la création · **changement** via {passage de niveau \| validation MJ}, **journalisé** · **extension 1→N** via atouts de niveau · résolution : matche si l'objet engagé ∈ l'ensemble du slot.

### Sélecteur de cible (`target`)

Dimension **mécanique** sur la cible déclarée, réutilisable au-delà des atouts (tout effet lié à un allié / ennemi) :

```yaml
target: { disposition: ally|enemy, tag: [magicien, ...], ref: <cible nommée déclarée> }
```

- *sus-aux-magiciens* → `{ tag: magicien, disposition: enemy }` → **purement mécanique, sans validation**.
- *garde-rapprochée* → `{ disposition: ally, ref: employeur }` → allié déclaré **+ validation MJ**.

### Intention & gouvernance

But déclaré, **validé selon le mode arbitre** : MJ humain (narratif) · MJ LLM (propose + valide) · MJ auto (flag explicite requis, sinon pas de bonus). Vocabulaire d'intents = **registre gouverné** versionné.

Validation **par intent** (`requires_mj_validation`) + **override MJ global** (désactivable pour un jeu plus souple) :

| Atout | Prédicat | Validation MJ |
|---|---|---|
| sus-aux-magiciens | `target: {tag: magicien, disposition: enemy}` | non |
| garde-rapprochée | `target: {disposition: ally, ref: employeur}` | oui |
| méfait | `action_type: offensive` (large) | oui — 🟡 **révision** (portée trop large, fuite) |
| juste-cause / pour-la-prime | `target` sélectionné + `directness: direct_only` | oui |

**direct / indirect** = proximité causale (l'action vise-t-elle la cible déclarée **directement** ?), non calculable → sélecteur de cible + validation MJ. Ex. juste-cause : « sauver une demoiselle = direct ; détruire un objet qui sauvera le monde = indirect ».

### Statuts composites (effets activables)

Un atout peut **accorder un `status`** (catalogue d'états R-9.27) portant un **faisceau d'EffectModels** — pas un modificateur unique. Ex. *folie-furieuse* :

```yaml
status: fou_furieux
effects:
  - { target: pool, op: add, value: level, condition: { aptitude: [force, endurance] } }
  - { target: aptitude, op: set, value: 1, scope: empathie }   # + intelligence, perception
duration: { dt: 25*level, locked: true }   # non réductible
```

Sources d'activation : `player_toggle` (folie-furieuse) \| `mj_validated` \| `mj_imposed` (le MJ l'impose **sans** accord du joueur). Supporte op `set` + durée **verrouillée**. Sert aussi aux futurs **buffs / potions**.

### Distribution & sous-patterns des 88

| Catégorie | ~N |
|---|---|
| compétence / spé | ~47 |
| aptitude | 3 |
| contexte | ~6 |
| école de magie | 11 |
| outil / prédilection | ~6 |
| intention irréductible | ~9 |
| spéciaux (folie-furieuse, familier) | 2 |

*(recoupements pour les atouts composites)*

**3 sous-patterns structurels** :
- **classe permanent** (~64) : `target: pool, op: add, value: level` sur `[domain]`, `activation: passive`, `duration: permanent`.
- **classe magie** (11) : `target: difficulty, op: sub, value: 1, scope: school`.
- **orientation** (12) : `target: difficulty, op: sub, value: 5` sur `[domain]`, `activation: active`, `duration: ephemeral`, `uses_per_day` — **familier = exception (moteur propre)**.

### Conséquences EffectModel (→ issues code)

`condition.activity` (dimensions ci-dessus) · nouvelles dimensions `aptitude`, `target`, `intent` (+ `requires_mj_validation`, override MJ) · `tool` → slots de prédilection (état perso) · statuts composites (`set`, durée verrouillée, sources d'activation) · `uses_per_day` · (`target: damage` = #137).

### 🟡 Ouvert

- *méfait* : « action offensive » trop large → réviser le prédicat (ambiguïté gouvernée).
- **Seed du registre** : mapper chaque `[domain]` compétence/spé → ID de `competences.yaml`, puis encoder les 88 specs.

---

## 5. Séquencement & dépendances

> **Moteur d'effets d'abord**, puis dégâts/défense.

La chaîne de défense consomme des **résistances**, souvent fournies par des **effets** (raciaux,
atouts, équipement). Le moteur d'effets débloque donc **atouts + sorts** *et* alimente le combat.

Dépendances de données (catalogues) :
- armes / protections → valeurs P/E/C/T, dégâts, difficulté, couches, zones (pour ④/⑤).
- atouts / sorts → `EffectModel.spec` encodé (pour le moteur d'effets).

---

## 6. À faire
1. Valider ce cadrage + le modèle d'effet avec l'auteur (autorité K&W).
2. Build moteur d'effets : `EffectModel` + `effects.ts` + renderer + **famille pilote** d'atouts (encodage prose→spec audité).
3. Build moteur dégâts/défense : `computeAttackDamage` (chaîne ordonnée) en amont de `applyDamage`.
4. Brancher sur NOMOS : `source` des effets = atomes canoniques tracés ; `spec` = contrat runtime.
