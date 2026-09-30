# AB105.088R — adversarial Decision Contract: replay, stale state, epochs, reconstruction, STOP

Date: 2026-09-30
Chain: AB105.087R -> AB105.088R

## Objective
Test the Decision Contract against replay, stale appraisal, authority-epoch changes, duplicate operations, missing successors, partial reconstruction, and STOP/fencing.

## Fresh primary evidence
RFC 8613 requires replay protection using a recipient replay window and states that a previously received sequence number must not be processed again; after loss of security context, additional recovery is required to avoid accepting replays. citeturn0search0turn0search24
NIST SP 800-63B defines replay resistance as preventing successful authentication from a recorded previous message and identifies nonces/challenges or timeliness data as mechanisms for detecting old messages. citeturn0search1
RFC 8387 further shows that sequence-number protection does not by itself establish when an update was created, so replay protection and temporal freshness remain distinct properties. citeturn0search10

## Adversarial results
1. REPLAYED_DECISION
A previously valid Decision must not be executable again merely because its signature/authority was once valid.
Required boundary: operation identity + replay/idempotency state + current authority/freshness check.
Result: REJECT/UNKNOWN according to whether replay status is proven or unavailable.

2. DUPLICATE_OPERATION
Same operation_id arriving twice is not two independent authorizations.
Required: durable idempotency/reconciliation state.
Result: existing terminal outcome may be returned; missing outcome is UNKNOWN rather than a second effect.

3. STALE_APPRAISAL
A Claim/Appraisal valid at T0 cannot automatically authorize an effect at T1 after its freshness/recheck boundary.
Result: RECHECK or STOP.

4. AUTHORITY_EPOCH_CHANGED
An authorization bound to epoch E1 cannot silently execute under current epoch E2 when the contract requires current authority.
Result: FENCE/STOP unless a provider/system contract explicitly proves compatibility.

5. STOP_REQUESTED_WITH_IN_FLIGHT_OPERATION
STOP_REQUESTED is not STOP_ENFORCED.
An in-flight effect must be reconciled against observed effects and remaining unobservable effects.
Result: STOP state plus reconciliation; never infer zero prior effect.

6. MISSING_SUCCESSOR
If reconstruction expects a successor and it is absent, reconstruction cannot manufacture EMPTY or terminal state.
Result: UNKNOWN/PENDING at the affected boundary.

7. PARTIAL_RECONSTRUCTION
A bounded prefix of an EventDAG is not a complete execution history.
Result: reconstructed facts remain bounded; downstream decisions requiring complete history become UNKNOWN/STOP.

8. REPLAY_AFTER_REBOOT
Loss of replay/security state can reopen old-message acceptance unless recovery establishes a fresh security context or equivalent anti-replay state.
Result: fence/deny until replay state is safely reconstructed.

9. EFFECT_OBSERVED_WITHOUT_DECISION
An observed effect does not prove that the prior Decision was authorized.
Result: EFFECT_OBSERVED + AUTHORIZATION_UNKNOWN.

10. DECISION_OBSERVED_WITHOUT_EFFECT
A successful Decision record does not prove the external effect happened.
Result: DECISION_RECORDED + EFFECT_UNKNOWN.

## Historical AB50–AB58 preservation
The historical FutureObs_PAA/EventDAG gap remains open exactly as previously recorded:
- TERNARY_MATH_GAP = FOUND
- TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
- TERNARY_PAA_COLLISION = UNKNOWN
- EVENTDAG_CLOSURE = PARTIAL
- RECONSTRUCTION = BOUNDED_ONLY
- SEMANTIC_FREEZE = NOT_DECLARED
- FORMAL_VERIFICATION = NOT_PERFORMED
- IMPLEMENTATION = NOT_PERFORMED

Therefore this adversarial pass does NOT close those historical gaps.

## Required Decision Contract controls
- decision_id
- operation_id
- subject/target identity
- authority epoch/version
- appraisal freshness boundary
- replay/idempotency state
- required reconstruction completeness
- expected effects
- observed effects
- unobservable effects
- STOP/fencing state
- policy version
- final evidence state

## Core invariants
DECISION_VALID_AT_T0 != EXECUTABLE_AT_T1
AUTHORIZED_TO_START != AUTHORIZED_FOR_EVERY_LATER_SIDE_EFFECT
REPLAYED_DECISION != NEW_DECISION
DUPLICATE_OPERATION != NEW_OPERATION
DECISION_SUCCESS != EFFECT_PROVEN
EFFECT_OBSERVED != AUTHORIZATION_PROVEN
STOP_REQUESTED != STOP_ENFORCED
FENCE_ISSUED != FENCE_ENFORCED_EVERYWHERE
PREFIX_RECONSTRUCTION != COMPLETE_HISTORY
MISSING_SUCCESSOR != EMPTY_TERMINAL_STATE
SEQUENCE_NUMBER != EVENT_CREATION_TIME

## Result
The Decision Contract survives the adversarial pass, but only if replay/idempotency, authority epoch, freshness, reconstruction completeness, and fencing are explicit decision inputs rather than hidden assumptions.
No new generic Claim/Evidence primitive is required.
The historical EventDAG/reconstruction gap remains the principal unresolved semantic dependency for complete historical decisions.

## Status
DECISION_CONTRACT_GENERIC = CLOSED_WITH_BOUNDED_UNKNOWN
REPLAY_IDEMPOTENCY_BOUNDARY = NORMATIVELY_DEFINED
AUTHORITY_EPOCH_BOUNDARY = CLOSED_AT_GENERIC_LAYER
STOP_FENCING_BOUNDARY = CLOSED_AT_GENERIC_LAYER_WITH_ENFORCEMENT_UNKNOWN
EVENTDAG_RECONSTRUCTION = HISTORICALLY_OPEN
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.089R — focus only on the historical EventDAG/reconstruction semantic gap: define the minimum conditions under which a reconstructed execution graph may be considered complete, and preserve UNKNOWN when those conditions are absent. Do not reopen already closed evidence branches.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.