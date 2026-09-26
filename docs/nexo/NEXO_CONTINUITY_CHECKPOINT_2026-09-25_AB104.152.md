# NEXO — CONTINUITY CHECKPOINT 2026-09-25 / AB104.152

Status: RESEARCH + CURRENT LÚMINA EXECUTION-PATH AUDIT; final Nexo architecture remains research/design-only. No V21.

## Canonical resume
Repository: snowdenxrp/aldea-ia
Mainline checkpoint immediately before this research: AB104.151
Commit: ea76969681505628c211072f5757eda4ec01eab4

## AB104.151 carryover
The current repository prototype has a Nexo execution primitive, but no production caller that owns the complete execution lifecycle. assistants.mjs plans/persists missions but does not call executeNexoStep/executeLuminaNexoStep. simulate.mjs owns world-state persistence/revision/lock/temp-rename but does not execute Nexo effects. runtime.js accepts persistPreparedIntent but has no owner callback that durably checkpoints prepared intent before an effect.

Therefore the next implementation decision remains BLOCKED pending an explicit execution-owner contract. Do not wire an executor merely to fill the missing call site.

## Research completed this round
Completed adversarial research attack: EFFECT OUTCOME AMBIGUITY + COMPENSATION SELECTION.
Saved as:
docs/nexo/NEXO_EFFECT_OUTCOME_AMBIGUITY_COMPENSATION_RESEARCH_V1_2026-09-25.md

Core conclusion:
UNKNOWN external outcome is not ABSENT and not ordinary FAILURE. Retry, wait, reconcile, compensate and quarantine are distinct decisions. Generic runtime must not choose compensation. Compensation is a new protected effect and requires an effect-class contract proving safety across the unresolved outcome set. The conservative universal default for a nontrivial unresolved external effect is HOLD/QUARANTINE until safe reconciliation, unless an explicit effect-class contract proves a bounded alternative.

External evidence cross-checks:
- AWS Step Functions preserves successful step history during redrive and reruns unsuccessful steps; RedriveExecution accepts a client token for idempotency. This supports explicit replay identity/history, not blind replay. citeturn1search0turn1search1
- Kubernetes Lease is shared coordination state used for leader election; local restored ownership is not equivalent to current shared ownership. citeturn1search5
- Node.js documents concurrency limitations of fs/promises and that same-file writeFile calls must be awaited; filesystem persistence is not a transaction spanning an external effect. citeturn0search1
- Transactional-outbox research documents the crash window where an effect may be published before its local publication record is durable, requiring idempotency/reconciliation. citeturn0search0

## Architecture consequences added
1. Protected execution/recovery needs an Effect Outcome/Recovery Decision Contract.
2. The contract must bind effect class, external-effect identity, resource incarnation/fence, authority/recovery epoch, STOP state, evidence generation/freshness, and the admitted uncertainty set.
3. Generic executor may expose UNKNOWN and reconciliation, but must not infer compensation safety.
4. "Retry until success" is not a generic recovery strategy.
5. A durable prepared-intent record is necessary for recovery context but does not prove whether the external effect occurred.
6. Late/stale recovery results must be rejected or merged only under current-context/generation rules.
7. Internal idempotency keys do not create external exactly-once semantics.
8. The next research layer must test multi-resource UNKNOWN/partial-commit with recovery restart and resource replacement.

## Current runtime prototype state
Preserved, not promoted to final architecture:
- effect adapter supports prepared intent, reconciliation, UNKNOWN handler exceptions, shared in-flight/queue serialization.
- simulation.nexoMemory.nexo.effectJournal is the intended durable journal collection.
- persistPreparedIntent is currently only a hook; actual durability requires caller-owned persistState.
- assistants.mjs currently records mission plans and persists world state but does not execute missions.
- simulate.mjs remains canonical owner of world-state persistence/revision/lock/temp-rename.
- No current CI PASS is claimed for the latest commits.

## Historical residuals that MUST remain visible
AB50→AB58 ternary residuals:
- TERNARY_MATH_GAP FOUND
- TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
- TERNARY_PAA_COLLISION UNKNOWN
- EVENTDAG_CLOSURE PARTIAL
- RECONSTRUCTION BOUNDED_ONLY
- SEMANTIC_FREEZE NOT_DECLARED
- FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED

These are not closed by AB104 work.

## DO-NOT-REPEAT
- Do not claim AB56 closed FutureObs_PAA.
- Do not claim current CI/tests passed without fresh evidence.
- Do not wire an executor before the execution-owner contract is researched/designated.
- Do not treat prepared intent as proof of non-execution.
- Do not treat UNKNOWN as failure/absence.
- Do not infer external exactly-once from local idempotency.
- Do not implement V21 or silently migrate historical architecture.
- Do not delete/overwrite historical research or turn candidate objects into settled schema.

## EXACT NEXT ACTION
Research and save:
MULTI-RESOURCE UNKNOWN + PARTIAL COMMIT + RECOVERY RESTART.
Attack sequence:
1. Resource A commits.
2. Resource B becomes UNKNOWN.
3. Recovery actor crashes.
4. New recovery incarnation starts from a checkpoint.
5. One resource is replaced/new incarnation.
6. STOP changes during recovery.
7. stale evidence/late ACKs arrive.
8. analyze retry vs reconcile vs compensation vs quarantine, including minimum identities/fences/evidence and conflict semantics.

After that, audit whether the execution-owner contract needs changes before any implementation.
