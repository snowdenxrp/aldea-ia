# AB104.81 — Lúmina workflow sync-order repair — 2026-09-25

## Evidence
- Source checkpoint: `31a9311a49769f8c81ef6d539b5a53430398650d`.
- Lúmina Actions run 2095: run id `36194886436`, job `108268454716`, failed after all `npm test` audits and `npm run assistants` passed.
- Village visual audit now passed: 16 buildings, 10 paths, 20 trees, house minimum scale 1, tree minimum scale 1.7.
- Assistant diagnostics passed functionally; ExplorerAgent reported 57 known regions, Alex 43 areas/65 regions, Bruno 46 areas/66 regions.
- Failure was workflow ordering, not simulation/test logic: `npm run assistants` modifies `.lumina-assistant-memory.json`, then the old `git pull --ff-only origin main` attempted to merge a newer state commit and was blocked by that local uncommitted file.
- Exact failure: `Your local changes to the following files would be overwritten by merge: .lumina-assistant-memory.json`.

## Repair
Workflow `.github/workflows/lumina-simulation.yml` was changed in commit `186c10f39e6f4b4e5fe58deccfe49a2b3827bfc7`:
- synchronization moved before validation/assistant execution;
- `git fetch origin main && git reset --hard origin/main` establishes a clean current base;
- obsolete post-assistant `git pull --ff-only origin main` removed;
- final state commit/rebase retry remains intact.

This preserves generated assistant memory instead of attempting to pull over it.

## Status
- Village residential repair: verified through run 2095's passing village geometry audit.
- Current blocker: workflow sync ordering, repaired.
- Verification of commit `186c10f...`: PENDING.
- Do not claim full workflow success until a post-repair Lúmina run reaches simulation/state-save completion.

## Next exact action
Inspect the newest Lúmina Actions run for commit `186c10f...`, then follow the first concrete failure only.
