# GLOBAL-AUDIT-035 — FINAL-GATE LINEARIZATION AND COMMIT-BOUNDARY ATTACK — 2026-09-28

## Objective
Attack the semantic FinalGate candidate from AB034 at the exact boundary where an admission becomes authoritative, especially races immediately before/after linearization and ambiguous commit acknowledgement.

## Boundary model
Candidate protected sequence:
CAPTURE -> REVALIDATE -> FINAL_GATE -> LINEARIZE_ADMISSION -> EXTERNAL_ATTEMPT/EXECUTION.

These are semantic phases, not frozen implementation events. A real implementation may combine phases only if it preserves their claim-relevant ordering and evidence semantics.

## Adversarial cases
1. Revocation immediately before FINAL_GATE: gate must reject or return UNKNOWN; cached pre-revocation evidence cannot authorize.
2. Revocation after FINAL_GATE but before LINEARIZE: outcome depends on declared linearization rule; no implicit assumption that gate success means commit.
3. Revocation immediately after LINEARIZE: it cannot retroactively erase an already-authorized historical admission, but may affect subsequent effects/retries according to the claim contract.
4. Policy/delegation change crossing the boundary: the authoritative ordering must determine which generation governs admission.
5. Resource reincarnation crossing the boundary: stable resource identifier alone is insufficient; incarnation must be bound to the admission.
6. Fence advance crossing the boundary: stale actors must be rejected by the protected resource, not merely by the caller's local cache.
7. Final-gate success followed by crash before durable admission record: recovery cannot infer absence of admission solely from missing local record; external/effect evidence may require reconciliation.
8. Durable admission record followed by crash before external attempt: recovery must preserve the historical admission but distinguish it from external effect execution.
9. External attempt before local effect record: timeout/disconnect does not imply NOT_COMMITTED; effect identity remains UNKNOWN until reconciliation.
10. Duplicate retry after uncertain boundary: retry must retain logical operation/effect identity and cannot silently create a second semantic operation.

## Key distinctions
`FINAL_GATE_SUCCESS != LINEARIZED_ADMISSION`
`LINEARIZED_ADMISSION != EXTERNAL_CONFIRMED`
`DURABLE_LOCAL_RECORD != EXTERNAL_WORLD_TRUTH`
`MISSING_LOCAL_RECORD != NOT_COMMITTED`
`TIMEOUT/DISCONNECT != NOT_COMMITTED`
`POST-LINEARIZATION_REVOCATION != RETROACTIVE_ERASURE`

## Candidate linearization contract
A protected admission has a claim-relative linearization point L only if the system can establish:
- exact admission identity;
- actual UsedAdmissionContext;
- authoritative identity/epoch/policy/delegation/resource incarnation/fence generation;
- complete claim-critical dependencies and provenance;
- protocol/lease/recheck obligations;
- authoritative ordering around L;
- durable history sufficient to reconstruct whether admission occurred;
- explicit semantics for failures before and after L.

If L cannot be determined for a claim-critical history, the admission state is UNKNOWN and recovery/retry must not invent a favorable ordering.

## Important refinement
A single global commit point is not necessarily sufficient for the whole Nexo system. There may be distinct semantic boundaries for control authorization, local durability, external attempt, and external confirmation. Therefore:
`CONTROL_LINEARIZATION != DURABILITY_LINEARIZATION != EFFECT_ATTEMPT != EXTERNAL_CONFIRMATION`.

Treating these as one point would recreate the exact ambiguity the audit is trying to eliminate.

## Verification status
This is a semantic/adversarial result, not a formal proof. No TLC/TLAPS execution and no runtime fault-injection test establish these laws yet.

## Carryover
P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; composition algebra universality UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.

## Next
GLOBAL-AUDIT-036 — attack multi-boundary partial failures and determine whether a single admission identity can safely span control, durability, effect-attempt and external confirmation without conflating their states.
