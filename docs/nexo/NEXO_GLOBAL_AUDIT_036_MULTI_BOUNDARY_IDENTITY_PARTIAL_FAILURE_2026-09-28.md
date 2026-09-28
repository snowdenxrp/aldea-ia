# GLOBAL-AUDIT-036 — MULTI-BOUNDARY PARTIAL FAILURE AND IDENTITY SEPARATION — 2026-09-28

## Objective
Attack whether one identity can safely represent control admission, local durability, external effect attempt and external confirmation across partial failures.

## Result
One logical operation identity should remain stable across the lifecycle, but its semantic states must remain distinct. A single status field is insufficient.

Candidate identity/state separation:
- OperationID: logical user/mission operation.
- AdmissionID: specific Z1 authorization decision/binding.
- AttemptID: concrete execution attempt/retry lineage.
- EffectID: stable external effect identity used for reconciliation/idempotency where supported.
- ConfirmationID/ObservationID: evidence of an external outcome, not authority itself.
- RecordGeneration/EventID: durable historical ordering identity.

## Partial-failure attacks
1. Admission durable, no attempt: admission exists; effect state is NOT_ATTEMPTED/UNKNOWN depending recovery evidence.
2. Attempt created, crash before send: attempt exists but external attempt is not established.
3. Send accepted externally, local crash before record: effect outcome is UNKNOWN, not NOT_COMMITTED.
4. Broker/provider rejects before external acceptance: if rejection is authenticated and bound, effect may be REJECTED; otherwise UNKNOWN.
5. External success, local acknowledgement lost: confirmation must be reconstructed/reconciled; duplicate retry must preserve EffectID.
6. Local recovery replays an admission after external success: replay must not create a new logical effect.
7. New AdmissionID for same OperationID after policy/authority change: this is a new authorization decision, not an update to the old admission.
8. New AttemptID under same AdmissionID: allowed only if the admission contract explicitly permits retries; otherwise requires reauthorization.
9. New resource incarnation under same resource ID: existing AdmissionID cannot silently bind to the new incarnation.
10. EffectID reused across different semantic operations: forbidden unless the external protocol explicitly defines that identity equivalence.

## Critical distinctions
`OperationID != AdmissionID != AttemptID != EffectID != ConfirmationID`
`ADMISSION != EFFECT`
`ATTEMPT != CONFIRMATION`
`RECORD != WORLD_TRUTH`
`RETRY != NEW_AUTHORIZATION` (unless the claim contract requires it)
`NEW_ADMISSION != MUTATION_OF_OLD_ADMISSION`

## Reconciliation rule
Reconciliation must preserve the original logical identity and reconstruct the missing boundary state from authoritative local history plus external evidence. It must never infer NOT_COMMITTED solely from absence of a local record or timeout.

If external effect identity cannot be determined or external outcome cannot be distinguished, the effect remains UNKNOWN and recovery stays quarantined for that effect.

## Resource-incarnation rule
An EffectID or AttemptID is not sufficient to prove resource continuity. Protected effects must bind to the resource incarnation/generation relevant to the admission.

## Protocol implication
Idempotency is an effect-deduplication mechanism, not a proof of authorization, atomicity or external confirmation. A provider may accept an effect while local control state remains uncertain.

## Verification status
Semantic/adversarial specification only. No exhaustive model execution, TLC/TLAPS proof or runtime fault injection.

## Next
GLOBAL-AUDIT-037 — attack retry/reconciliation semantics, especially whether repeated UNKNOWN states can converge without accidentally changing authority, admission identity or effect identity.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; composition algebra universality UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
