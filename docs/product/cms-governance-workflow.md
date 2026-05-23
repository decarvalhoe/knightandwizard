# CMS governance workflow

Issue: [#57](https://github.com/decarvalhoe/knightandwizard/issues/57)

## Scope

The Payload CMS governance surface records source conflicts and business decisions for canonical catalogs. It does not replace YAML catalogs or generated canonical artifacts; it makes the human decision trail explicit before those artifacts change.

## Ambiguity lifecycle

A `catalog-ambiguities` record is created when two sources conflict, a canonical value is missing, or a normalized field needs author review. Each ambiguity is linked to one catalog collection, one `catalogEntryCanonicalId`, optional `fieldPath`, and source references with `path`, `ref`, and `sha256` when available.

Statuses:

- `open`: conflict captured, not assigned.
- `assigned`: reviewer/editor owns the review; `assignedTo` is required.
- `resolved`: requires `assignedTo`, `resolutionDecision`, `resolvedBy`, `resolvedAt`, `regenerationStatus: completed`, and at least one regenerated artifact.
- `rejected`: captured issue is not a product ambiguity, with rationale preserved in the record.

## Decision lifecycle

A `catalog-decisions` record is the only valid place to store a business resolution that changes a catalog interpretation. It links back to affected ambiguities, the target catalog entry, source references, rationale, and the exact regenerated artifacts.

Statuses:

- `proposed`: decision drafted, not accepted.
- `accepted`: decision approved, application may still be pending.
- `applied`: requires `decidedBy`, `decidedAt`, `regenerationStatus: completed`, and regenerated artifacts.
- `superseded`: replaced by a newer explicit decision.
- `rejected`: considered and rejected; rationale remains auditable.

## Regeneration contract

When a decision is applied, the editor records the command and files touched, for example:

```bash
pnpm canonical:write
pnpm nomos:export
```

Typical regenerated artifacts include `data/catalogs/*.yaml`, `data/catalogs/*-ambiguites.md`, `docs/canonical/source-manifest.yaml`, `docs/canonical/canonical-matrix.yaml`, `docs/canonical/coverage-report.md`, and `docs/canonical/nomos/*`.

## Product rule

No K&W business decision may be hidden only in TypeScript, tests, or importer heuristics. If a code change chooses between plausible source interpretations, it must reference a `catalog-decisions` record or remain blocked as an ambiguity.
