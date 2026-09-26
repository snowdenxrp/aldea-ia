# NEXO — CONTROL/EFFECT BOUNDARY ADVERSARIAL RESEARCH V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21 implementation.

## Result
The invariant attack confirms that one owner-generation boundary is insufficient. Nexo needs two explicitly separated guarantees: protected control-plane admission, and effect-plane enforcement or an explicitly weaker reconciliation-only contract.

## Boundary contract
CONTROL: validate current owner_generation; recovery_incarnation; authority_epoch; STOP context; policy/invariant versions; freeze participant footprint; bind resource_incarnation and external_effect_identity; persist prepared intent; commit protected admission/fence record.
EFFECT: accept only a currently admissible control generation/fence; reject stale generation/resource incarnation; execute or enqueue effect; return outcome or preserve UNKNOWN; reconcile against current resource incarnation and effect identity.

## Critical race rules
1. STOP changes after an earlier read invalidate the earlier authorization.
2. Ownership transfer invalidates the old owner's pending admission.
3. Recovery restart invalidates prior recovery context.
4. Resource replacement invalidates old bindings unless continuity is proven.
5. Timeout or connection loss after dispatch produces UNKNOWN, not ABSENT.
6. Participant CONFIRMED does not resolve another participant UNKNOWN.
7. Release/transfer is conditional on the same protected owner generation.
8. Controller generation does not provide atomicity across independent resources.

## Resource capability classes
R0 — provider supports no conditional fence and no reliable reconciliation: only local intent/history guarantees are admissible; strong external-effect claims remain UNKNOWN.
R1 — provider supports idempotency/effect lookup but no fencing: retry/reconciliation can be safer, but stale-owner exclusion is not proven.
R2 — provider supports effect identity plus conditional admission/fencing: the effect boundary can enforce current authority for that resource.
R3 — provider offers stronger transactional semantics over the relevant participants: multi-resource guarantees may be stronger, but only within the documented transaction boundary.
A provider must not be silently promoted between classes.

## Revised object separation
ControlLease/Fence = authority ordering.
ExternalEffectIdentity = effect identity.
ResourceIncarnation = resource lifecycle.
ParticipantOutcome = external result state.
ReconciliationRecord = evidence connecting observed resource state to effect identity.
StateRevision = local state concurrency/version.
None is a substitute for another.

## Crash cuts
C1 after protected admission, before dispatch.
C2 after dispatch, before response.
C3 response lost after external completion.
C4 STOP changes after admission.
C5 ownership transfer after admission.
C6 resource replacement after admission.
C7 A confirmed/B unknown.
C8 intermediary crash after accepting admission but before dispatch.
C9 recovery restart with unresolved participant UNKNOWN.
For every cut, recovery must preserve uncertainty and reject stale authority.

## Architecture consequence
persistPreparedIntent must not be treated as the complete execution-owner contract. It can be one durability step inside a larger protected transition.
The current local world-state.json plus stateRevision can remain a bounded Lúmina control-plane mechanism, but only if all protected transitions are serialized through the same authoritative boundary. It cannot be presented as a universal external fencing mechanism.
General Nexo keeps a protected authority store boundary OPEN.

## Historical residuals preserved
AB50→AB58: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED.

## DO-NOT-REPEAT
Do not equate stateRevision with owner_generation.
Do not treat a lock/lease as external fencing.
Do not treat STOP read-before-dispatch as sufficient.
Do not restore authority from checkpoint.
Do not collapse UNKNOWN.
Do not infer exactly-once from local idempotency.
Do not implement V21.
Do not claim CI/test PASS without fresh evidence.

## NEXT EXACT ACTION
Formalize the capability contract for resource/intermediary fences and reconciliation, then attack provider classes R0-R3 against stale ownership, STOP, replacement, retries and partial multi-resource outcomes before implementation.