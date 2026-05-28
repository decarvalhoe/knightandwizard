# File de validation — surface de gouvernance (règles vivantes)

> Comment utiliser la **surface CMS (Payload, S13)** pour traiter la file d'arbitrage MJ : effets de
> sorts `pending`, ambiguïtés de source, décisions canon. Voir le contrat de cycle dans
> `cms-governance-workflow.md` et le registre dans `docs/plan/GOVERNANCE-IMPLEMENTATION.md`.

## Où

`pnpm dev:cms` → admin Payload sur `http://localhost:3001/admin` (rôle `admin` = autorité `human_gm`,
R-13.1). Données importées par `pnpm cms:import:catalogs` (devlab Postgres requis).

## Les trois files

### 1. Effets de sorts à valider (`pending`)

Collection **Spells** (groupe « Catalogues canoniques »). Filtre :
`effectModelPendingValidation = true` (ou `effectModelFidelity = pending`). **162 sorts** structurés
en E2 attendent la validation MJ ; `effectModel` (json) porte l'`EffectModel` complet à relire.

**Workflow** (la YAML reste la source canonique) :

1. Relire `effectModel` dans le CMS (triage/décision).
2. Éditer l'overlay `data/spell-effects/<école>.yaml` : `fidelity: pending → covered`, retirer
   `spec.requires_mj_validation` (cf. E2c/E2d pour le patron).
3. `pnpm catalogs:link:spell-effects` (réinjecte dans `spells.yaml`).
4. `pnpm cms:governance:regenerate` (canonical:write + nomos:export + bloc d'artefacts à tracer, G3).
5. `pnpm cms:import:catalogs` (rafraîchit la vue CMS) + commit.

### 2. Ambiguïtés ouvertes

Collection **Catalog Ambiguities** (groupe « Gouvernance »). Filtre : `status = open`. Importées des
`*-ambiguites.md` (G2) ; `metadata.legacyStatus` distingue `tranché` (décision historique en
`proposedResolution`) de `à valider`.

**Cycle** (`cms-governance-workflow.md`) : `open → assigned → resolved | rejected`. Une résolution
crée/relie une **Catalog Decision** et exige la régénération (G3).

### 3. Décisions canon

Collection **Catalog Decisions**. Cycle `proposed → accepted → applied | superseded | rejected`. Une
décision `applied` exige `decidedBy`, `decidedAt`, `regenerationStatus: completed` et les
`regeneratedArtifacts` (produits par `pnpm cms:governance:regenerate`).

## Règle produit

Aucune décision métier ne reste cachée dans le code : un choix d'interprétation **référence une
`catalog-decisions`** ou **reste bloqué en ambiguïté** (`cms-governance-workflow.md`).
