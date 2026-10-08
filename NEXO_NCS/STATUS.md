# NEXO NCS — STATUS

Date: 2026-10-08

## Current phase
CONSTRUCTION — STEP 3C

Research phase is intentionally exited. Do not reopen broad historical audits unless new implementation evidence contradicts an established invariant.

## Current architecture
PROPOSAL → CLAIM → AUTHORITY → ISOLATION → CANDIDATE → FINAL VALIDATION → CONDITIONAL COMMIT → OUTCOME → RECONCILIATION

## Authoritative foundation
- MASTER/final distillation remains authoritative for the protected-transition lifecycle and non-bypass invariants.
- AB104/AB105/P112 evidence remains historical evidence for the established invariants; it is not being replayed.
- P112 already established that existing persistState(expectedRevision) is the canonical conditional snapshot-commit primitive for cooperating writers.
- No second generic transaction/commit wrapper is being invented.

## Completed construction
STEP 3A — isolation contract closure completed and runtime-verified.
STEP 3B — smallest protected-transition composition completed and runtime-verified.

STEP 3C — canonical persistence integration is now structurally wired at the ownership boundary.

Implemented:
- src/nexo/core/protected-transition.mjs
- src/nexo/adapters/conditional-commit-persist-state.mjs
- tests/nexo/protected-transition.test.mjs
- tests/nexo/conditional-commit-persist-state.test.mjs
- .github/workflows/nexo-step-3a-isolation.yml
- NEXO_NCS/BUILD/STEP_3C_INTEGRATION_GATE_2026-10-08.md

## STEP 3C structural correction
The real persistState(...) primitive is asynchronous while the first STEP 3B composition was synchronous.

This was detected before hiding it behind an adapter.

Decision:
- protected-transition composition is now asynchronous;
- the ConditionalCommit port is awaited;
- no synchronous bridge, polling loop, second persistence primitive, or speculative transaction layer was introduced;
- Core remains schema-independent; simulation-specific persistence details stay in the adapter.

This is an architectural contract correction, not a patch around the persistence boundary.

## STEP 3C commit semantics
- STATE_REVISION_CONFLICT → CONDITIONAL_CONFLICT → STALE_CANDIDATE.
- Non-conflict persistence exception → UNKNOWN conservatively.
- Invalid/unknown commit result → UNKNOWN.
- Final semantic validation remains mandatory before commit.
- Terminal outcomes still pass through OutcomeClassifier.
- Canonical persistence remains exclusively behind ConditionalCommit.
- Revision conflict is NOT treated as proof of dependency validity, fencing, exactly-once, or external-effect absence.

## Runtime proof state
🟢 STEP 3A runtime verified.
🟢 STEP 3B runtime verified: run 37737359129 / job 113179842110.
🟢 STEP 3C source/integration tests have been added.
🔵 STEP 3C GitHub Actions runtime verification is the immediate pending proof after the latest commits.
🔵 This still does not prove power-loss durability, universal writer participation, external-effect correctness, exactly-once, distributed fencing, or reconciliation.

## Next action
1. Verify the STEP 3C GitHub Actions run.
2. If PASS, save a dedicated STEP 3C runtime proof and advance the construction frontier.
3. If FAIL, classify the concrete failure; do not patch around it.
4. After 3C closure, proceed to the next smallest construction boundary only if the contracts remain coherent.

## Non-negotiables
- New architecture; no V21 patch lineage.
- V1–V20 are evidence, not implementation dependencies.
- Structural contradiction = STOP and redesign.
- UNKNOWN never becomes success by inference.
- Provider/model has no commit authority.
- Candidate cannot mutate canonical state.
- Final semantic validation cannot be bypassed.
- External effects are separate from canonical commit.

## Do not repeat
- Do not rerun TLC.
- Do not create AB105.117R.
- Do not replay AB104/AB105 sequentially.
- Do not restart broad audits already closed by research exit.
- Do not patch legacy orchestrator into Nexo Core.
- Do not create a second generic conditional persistence primitive.

## Continuity
All prior MASTER, AB104/AB105, P112, final distillation, construction design, STEP 3A, STEP 3B, and the new STEP 3C integration gate remain part of the continuity chain. They must be consulted as evidence/constraints when a later implementation boundary depends on them.
