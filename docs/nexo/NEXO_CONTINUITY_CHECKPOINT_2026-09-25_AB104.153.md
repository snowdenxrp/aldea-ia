# NEXO — CONTINUITY CHECKPOINT AB104.153
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Completed
Saved and reviewed:
docs/nexo/NEXO_MULTI_RESOURCE_UNKNOWN_PARTIAL_COMMIT_RECOVERY_RESTART_RESEARCH_V1_2026-09-25.md

Core result:
- Multi-resource state must remain participant-aware.
- A=CONFIRMED, B=UNKNOWN is a real partial-commit state, not global FAILURE.
- Resource replacement creates a new incarnation unless explicit continuity is proven.
- Recovery restart creates a new recovery incarnation and must reacquire current ownership/fence.
- STOP changes invalidate affected pending retry/compensation/release decisions.
- Late evidence is historical unless current context and resource incarnation validate promotion.
- Compensation/retry remain effect-class-specific.
- Partial commit + unresolved participant + changed incarnation/stale context defaults to HOLD/QUARANTINE for nontrivial effects until reconciliation establishes admissibility.

## AB104.151/152 carryover
Execution-owner boundary remains undefined and implementation remains blocked.
persistPreparedIntent is a hook, not yet an integrated durable transaction boundary.
No current CI PASS is claimed.

## Historical residuals preserved
AB50→AB58:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED

## DO-NOT-REPEAT
Do not collapse participant outcomes.
Do not treat resource replacement as continuity without proof.
Do not restore recovery authority from checkpoint.
Do not treat STOP as external outcome resolution.
Do not infer external exactly-once from local idempotency.
Do not wire executor before execution-owner contract.
Do not claim tests/CI passed without fresh evidence.
Do not implement V21 or delete historical gaps.

## EXACT NEXT ACTION
Audit the execution-owner contract against the multi-resource model. Determine the minimum protected ownership/persistence boundary and crash semantics before any implementation.


## AB104.154 carryover
New adversarial research persisted:
docs/nexo/NEXO_CONTROL_EFFECT_BOUNDARY_RESEARCH_V1_2026-09-25.md
commit: b5fa815d27e0b7da98e1941abdb4532ef4c9f084

Key correction:
- owner_generation alone is not enough for external-effect safety.
- Control-plane protected admission and effect-plane fencing/enforcement are separate boundaries.
- STOP must invalidate stale admission; a prior STOP read is not sufficient.
- recovery_incarnation identifies recovery context but does not replace ownership fencing.
- resource_incarnation must be bound and revalidated.
- provider capability classes R0-R3 prevent silently claiming stronger guarantees than the provider supports.
- UNKNOWN remains participant-level and survives STOP, restart, timeout, and resource replacement until admissible reconciliation.

No implementation/V21 performed.
No current CI PASS claimed.

## EXACT NEXT ACTION
Formalize the resource/intermediary capability contract and attack R0-R3 against stale ownership, STOP races, replacement, retries, intermediary crash, and partial multi-resource outcomes before implementation.
