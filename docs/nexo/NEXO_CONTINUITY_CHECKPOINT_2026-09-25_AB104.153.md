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


## AB104.155 carryover
Resource/intermediary capability attack persisted:
docs/nexo/NEXO_RESOURCE_INTERMEDIARY_CAPABILITY_CONTRACT_ATTACK_V1_2026-09-25.md
commit: 131a8cbb0b049dab1796f861b9f1153b16d28fa5

Repair: capability class is now part of effect binding, not just documentation. R0/R1 cannot claim stale-owner exclusion; R2 requires resource/intermediary fence enforcement on every protected mutation path; R3 claims are limited to the provider transaction scope. STOP binding, resource incarnation, effect identity, timeout/retry semantics and bypass paths are mandatory contract fields. UNKNOWN remains unresolved unless authoritative evidence promotes it.

No V21 implementation. No current CI PASS claimed.

## EXACT NEXT ACTION
Inventory concrete current Nexo/Lúmina effect paths and map each to RC1-RC12, identifying every bypass path and the minimum contract needed before any execution-owner implementation.


## AB104.156 carryover
Current Nexo/Lúmina effect-path audit persisted:
docs/nexo/NEXO_CURRENT_EFFECT_PATH_CAPABILITY_MAP_V1_2026-09-25.md
commit: 2cdfd96c412d117b04669a7ec2a85b7351d8ebf6

Concrete findings:
- Current effect requests have no explicit capability class, owner_generation, resource_incarnation or final STOP fence.
- createLuminaEffectAdapter directly mutates simulation state; current nexoEffectRevision is only an in-memory local revision, not an external fence.
- persistState stateRevision/file lock protects state persistence, not already-running effect execution.
- nexoEffectRevision is not serialized in world-state.json, so it cannot currently act as a durable cross-restart fence/incarnation.
- executionJournal retention is bounded to 200 entries; long-lived reconciliation cannot assume indefinite local identity retention.
- prepared-intent persistence remains optional and no current production caller supplies the hook.
- local postcondition evidence cannot prove external-world truth outside the simulation boundary.

RC mapping is now explicit: RC1/RC2/RC3/RC4/RC5 OPEN/FAIL; RC6 locally preserved; RC7/RC8 respected; RC9 unclaimed; RC10 bypasses found; RC11 partial; RC12 preserved by prior research.

No implementation/V21. No current CI PASS claimed.

## EXACT NEXT ACTION
Research and formalize the minimum protected local Lúmina transition boundary: owner/fence record, effect binding, resource incarnation, STOP epoch, prepared-intent durability, and final admission point. Compare it against the current stateRevision/file-lock topology before implementation.


## AB104.157 carryover
Minimum protected Lúmina transition boundary researched and persisted:
docs/nexo/NEXO_MINIMUM_PROTECTED_LUMINA_TRANSITION_BOUNDARY_V1_2026-09-25.md
commit: 60988614c1aa555caf1f0282b8db9f204de7795e

Result: the minimum boundary is a protected final admission that atomically validates current owner_generation, recovery_incarnation, authority_epoch, STOP context, resource_incarnation, capability/fence scope, effect identity and policy/invariant versions against the prepared intent. stateRevision/filesystem lock remain persistence/concurrency mechanisms, not universal external fences. nexoEffectRevision remains in-memory only and cannot be authority across restart.

Crash/race cuts P0-P8 were defined, including local durable-commit ambiguity and the distinction CONTROL_ADMITTED vs EFFECT_FENCED vs EFFECT_ATTEMPTED vs outcome states.

No implementation/V21. No current CI PASS claimed.

## EXACT NEXT ACTION
Attack the minimum boundary with exhaustive crash/race cases and determine whether one local persistence linearization can cover OwnerFence + PreparedIntent + local effect commit, or whether control admission and effect commit must remain separate even for Lúmina.
