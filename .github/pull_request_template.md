## Summary

-

## Verification

- [ ] `pnpm validate`
- [ ] `pnpm canonical:check:strict` when promoting to `staging` or `main`
- [ ] Generated artifacts refreshed when sources, catalogs, docs or matrix logic changed

## Release promotion

Complete only for `dev` -> `staging` or `staging` -> `main` PRs.

- [ ] `CHANGELOG.md` updated for the release
- [ ] Backup or snapshot id recorded in the PR body
- [ ] Rollback target commit/tag recorded in the PR body
- [ ] CI is green on this PR before merge
