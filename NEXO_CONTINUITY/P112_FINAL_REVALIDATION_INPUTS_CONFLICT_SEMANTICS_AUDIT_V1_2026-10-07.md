# P112 FINAL REVALIDATION INPUTS + CONFLICT SEMANTICS AUDIT V1 — 2026-10-07

## Scope
Bounded follow-up to the P112 final-revalidation → existing conditional-commit audit.

## INVESTIGAR

### Existing repository path
Current production persistence callers inspected:
- `scripts/simulate.mjs`: loads state, mutates an isolated simulation, then calls `persistState(... expectedRevision: state.stateRevision, stateRevision: state.stateRevision + 1)`.
- `scripts/assistants.mjs`: operates on an `applyState()` snapshot and calls the same `persistState(expectedRevision)`.
- `runtime.js`: executes Nexo steps and commits mission outcome into Nexo memory, but does not call canonical `persistState()`.
- `effect-adapter.js`: supports reconcile and optional `persistPreparedIntent`; terminal `persist()` remains in-memory.

Repository-wide search found `STATE_REVISION_CONFLICT` at the persistence primitive/tests and worker path, but no demonstrated production handler that catches that error and performs semantic reconciliation/replan.

## FINAL-REVALIDATION INPUTS

The already-established P112 admission/provenance research identifies the claim-specific final closure as including, when relevant:
1. selected option/intent identity and provenance;
2. every authoritative dependency that influenced eligibility, target, score, branch or protected preconditions;
3. transitive dependencies of derived values/helpers/aggregates/predicates;
4. current authority context and invalidation/revocation state;
5. resource/participant identity and current resource incarnation;
6. fence/generation/STOP/recovery context where applicable;
7. current policy/invariant/config/logic version;
8. freshness/consistency/provenance of external observations;
9. random evidence when randomized selection affects the protected outcome;
10. operation/effect identity and retry/recovery generation;
11. the canonical state revision/version token used for conditional commit.

Important: these are not all equivalent to `stateRevision`. `stateRevision` is only the current repository's persistence conflict token.

## SNAPSHOT MAPPING

🟢 Values physically represented in the persisted snapshot include world/agents/events/Nexo memory and the canonical `stateRevision`.

🔵 The snapshot does not by itself establish complete provenance for every authority-relevant input used to choose or execute an effect.

🔵 No current generic protected-transition object was found that durably carries the complete claim-specific DependencySet, authority context, resource incarnation/fence context, freshness metadata and operation/recovery provenance through final commit.

🔵 The existing persistence lock/revision check therefore detects canonical state staleness but cannot substitute for final semantic revalidation.

## CONFLICT SEMANTICS

Current demonstrated behavior:
- revision mismatch → `STATE_REVISION_CONFLICT`;
- persistence is rejected before replacement;
- caller's in-memory snapshot is not automatically rolled back;
- no production semantic replan/reconciliation path was found.

Minimum safe interpretation:
`STATE_REVISION_CONFLICT` = **STALE_COMMIT_CANDIDATE**, not generic failure and not proof that the intended effect was absent.

If the attempted transition had no external side effect and the isolated snapshot was discarded, the caller may reacquire current state and recompute/revalidate.

If a protected/external effect may already have occurred before the conflict became visible, conflict cannot authorize blind retry; the prior effect identity/outcome must first enter reconciliation/UNKNOWN handling.

## CONCLUSION

🟢 Existing conditional commit is sufficient at its own persistence layer.
🟢 Exact final-gate categories are now bounded by prior P112 evidence.
🔵 The repository lacks the production owner that binds those categories to the conditional commit and maps conflict into semantic reconciliation.
🔵 Completeness of dynamic dependency/provenance capture remains open.

No implementation was performed.

## DO-NOT-REPEAT
- No second persistence wrapper.
- No generic `STATE_REVISION_CONFLICT` replacement.
- No TLC rerun.
- No AB104.185 primary.
- No AB105.117R.
- Do not treat later ABs as historical backfill.

## EXACT NEXT P112 ACTION
Audit the **current final-gate candidate boundary at `executeAction()/performDecision()` versus the Nexo runtime path** and determine whether a single isolated-snapshot final validator can cover the already-identified DependencySet without accidentally including unrelated post-effect learning/event writes. Then map that validator's failure states to STALE_ADMISSION / HOLD / UNKNOWN / RECONCILE.

No implementation until this bounded boundary audit closes.
