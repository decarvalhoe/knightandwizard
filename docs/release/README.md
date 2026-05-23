# Release process

Issue: [#61](https://github.com/decarvalhoe/knightandwizard/issues/61)

This runbook is the release contract for Knight & Wizard. It keeps releases reproducible, reviewable and reversible while preserving the canonical-first gates.

## Branch policy

- `dev` is the active integration branch.
- `staging` is the release candidate branch.
- `main` is production history and is promoted only by pull request.
- No direct push to `main` or `staging`.
- Release commits use Conventional Commits and release PR titles use `chore(release): vX.Y.Z`.

## Release checklist

1. Confirm all milestone issues are closed or explicitly deferred in the release PR.
2. Pull the latest `dev` and verify the worktree is clean.
3. Run `pnpm install --frozen-lockfile`.
4. Regenerate generated artifacts when inputs moved: `pnpm canonical:write` and `pnpm nomos:export`.
5. Run the local gate: `pnpm validate` (it builds shared packages before tests, so fresh worktrees and CI behave the same way).
6. Run the release gate: `pnpm canonical:check:strict`.
7. Update `CHANGELOG.md` by moving relevant `Unreleased` entries under the target version and date.
8. Confirm user and contributor docs still describe the shipped behavior.
9. Open a PR from `dev` to `staging`; merge only when CI is green.
10. Open a PR from `staging` to `main`; merge only when CI is green and the strict canonical gate is green.
11. Tag the merge commit on `main` as `vX.Y.Z` and create the GitHub release from the changelog entry.
12. Keep the release PR body with validation output, changelog link, backup status and rollback plan.

## Required PR evidence

Every promotion PR to `staging` or `main` must include:

- source branch and target branch;
- exact commit being promoted;
- `pnpm validate` result;
- `pnpm canonical:check:strict` result;
- CI run link for the PR;
- changelog section link;
- backup location or snapshot id;
- rollback target commit/tag and database restore plan.

## Changelog contract

`CHANGELOG.md` is the public release ledger. Keep `Unreleased` for merged changes that are not yet released. For a release, create `## [X.Y.Z] - YYYY-MM-DD`, move shipped entries into it, and update compare links at the bottom.

Do not ship a release if the changelog only says "misc" or hides business decisions. Canonical/catalog decisions must reference the relevant docs, issue or Payload governance record.

## Backup before promotion

For the local devlab, create a PostgreSQL custom-format dump before risky migrations or release rehearsals:

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-knightandwizard}" \
  -d "${POSTGRES_DB:-knightandwizard}" \
  --format=custom \
  --file=/tmp/kw-release.dump
docker cp kw-postgres:/tmp/kw-release.dump "backups/kw-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

For a managed environment, record the managed snapshot id or dump path in the promotion PR before merge. The backup must cover PostgreSQL/pgvector and any uploaded assets used by Payload CMS.

## Rollback

Rollback is branch-first, then data-first:

1. Identify the last known-good tag or merge commit.
2. Open a revert PR against `main` or promote the last known-good commit through the normal PR path.
3. Run CI and the strict canonical gate on the rollback PR.
4. Restore the database snapshot only when the code rollback is insufficient or a migration/data import changed persistent state.
5. Record the rollback commit, backup id and post-restore health checks in the incident or release issue.

Local devlab restore command:

```bash
docker cp backups/kw-YYYYMMDDTHHMMSSZ.dump kw-postgres:/tmp/restore.dump
docker compose exec -T postgres pg_restore \
  --clean \
  --if-exists \
  -U "${POSTGRES_USER:-knightandwizard}" \
  -d "${POSTGRES_DB:-knightandwizard}" \
  /tmp/restore.dump
pnpm devlab:test
```

## Post-release verification

After `main` is promoted and tagged:

- check the GitHub release page and tag;
- run `pnpm devlab:test` against the released checkout or deployment environment;
- verify `/health` and `/ready` for the API environment;
- confirm `docs/canonical/coverage-report.md` matches the release commit;
- leave the release issue with links to PRs, tag, release notes, backup and rollback target.
