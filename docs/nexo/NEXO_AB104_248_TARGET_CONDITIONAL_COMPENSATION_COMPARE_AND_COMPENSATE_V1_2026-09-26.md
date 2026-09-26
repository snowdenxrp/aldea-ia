# NEXO AB104.248 — TARGET-SIDE CONDITIONAL COMPENSATION, ATOMIC COMPARE-AND-COMPENSATE V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
The strongest compensation boundary studied so far is target-side conditional acceptance: the target evaluates the original operation state, target incarnation, authority/fence, expected resource version and compensation identity as one acceptance decision. A client-side read followed by a separate compensation write leaves a TOCTOU race.

## Candidate atomic predicate
ACCEPT_COMPENSATION iff:
- original operation identity and payload fingerprint match the compensation contract;
- original target/incarnation is the intended one;
- current authority epoch/root and fence are admissible;
- target resource version equals the expected version or satisfies an explicit predicate;
- compensation identity/fingerprint is either new and reservable or already maps to the same terminal result;
- the target can atomically bind acceptance/commit/receipt semantics at its boundary.

A failure of any predicate must not be converted into success by a local retry.

## Operation registry binding
The target-side registry should conceptually distinguish:
UNSEEN -> RESERVED -> ACCEPTED -> COMMITTED -> RECEIPT_AVAILABLE
with REJECTED_PRE_ACCEPTANCE, UNKNOWN_EXTERNAL, PARTIAL and CONFLICT as side states.
RESERVED is not proof of effect. ACCEPTED is not necessarily COMMITTED. A receipt must identify operation, effect, fingerprint, target incarnation, authority/fence and result.

## Crash cases
1. Crash before target acceptance: classify only from protocol guarantee; otherwise UNKNOWN.
2. Target accepts/commits, client loses response: reconcile registry/target; do not create a new compensation identity blindly.
3. Registry receipt durable, materialized local state stale: reconstruct locally.
4. Target state restored behind registry: continuity failure; do not infer NOT_COMMITTED from absence.
5. Compensation accepted but partial child effects: PARTIAL and child-level reconciliation.
6. Two concurrent compensators with same identity: target registry should converge to one result if contract supports idempotency.
7. Two different compensation identities: potentially two real effects; quarantine/reconcile rather than assume duplicates are harmless.

## CAS versus authority fence
CAS protects a resource version against stale writes. It does not by itself establish who is authorized to write. Authority epoch/fence protects authorization freshness. The stronger predicate composes both rather than substituting one for the other.

## Compare-and-compensate
Conceptual atomic target operation:
CHECK(original_state, target_incarnation, authority/fence, expected_resource_version, compensation_identity/fingerprint)
AND IF VALID THEN APPLY_COMPENSATION + RECORD_OPERATION_RECEIPT

If target cannot make these atomic, the protocol must explicitly represent the resulting uncertainty. A pre-read plus write is not equivalent.

## Target restart
After restart, target must not lower its accepted authority generation/resource fence or erase operation history in a way that changes an authoritative COMMITTED result into apparent absence. If target storage can roll back, external continuity/anti-rollback is required for definitive negative evidence.

## Partial effects
Parent compensation identity is insufficient when child effects can commit independently. Each child needs a stable identity bound to parent, target, incarnation, child scope/chunk and fingerprint. Aggregate status is COMMITTED only when all required children are committed; mixed children yield PARTIAL; unresolved child blocks definitive classification.

## External research
Transactional outbox references confirm that local commit and external publication are separate boundaries and that relay duplication is possible; consumers therefore need idempotency. citeturn0search3turn0search5 Saga implementations similarly use durable state, compensation and idempotent handling rather than assuming distributed rollback. citeturn0search0turn0search11

## Code study limitation
GitHub indexed search for `effect-adapter` returned no indexed results in this pass. This is not evidence that the files do not exist. Earlier direct inspection remains the basis for prototype observations. No implementation added.

## Persistent AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

## DO-NOT-REPEAT
CAS != authority; fence != resource version; RESERVED != COMMITTED; receipt != permission; local pre-read/write != atomic conditional effect; target restart/restore != proof of non-execution; parent compensation != child completion; no V21; no architecture implementation; no unsupported verification claims.

## Exact next mission
AB104.249: target operation registry crash/restore and negative evidence — durable receipt ordering, tombstones/absence guarantees, registry compaction, target incarnation changes, and when the target can authoritatively say NOT_COMMITTED.