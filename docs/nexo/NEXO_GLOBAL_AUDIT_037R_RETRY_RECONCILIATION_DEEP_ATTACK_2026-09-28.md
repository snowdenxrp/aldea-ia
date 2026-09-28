# GLOBAL-AUDIT-037R — RETRY/RECONCILIATION DEEP ATTACK — 2026-09-28

## Purpose
Resume GLOBAL-AUDIT-037 without advancing to 038. Deepen the unresolved convergence question with explicit state transitions and counterexamples.

## 1. State separation
The audit distinguishes:
- `EffectState`: what is known about the external effect;
- `AuthorityState`: whether the original authorization remains valid;
- `ReconciliationState`: whether external outcome has been sufficiently reconstructed;
- `RecoveryState`: whether execution may resume;
- `RetryEligibility`: whether a new attempt is permitted.

These states must not be collapsed into one status.

## 2. Counterexample: UNKNOWN -> revoked
History: ADMISSION(A1) -> SEND -> TIMEOUT -> UNKNOWN -> AUTH_REVOKE(A1).

A later reconciliation confirming the original effect occurred may resolve EffectState, but cannot restore A1 authority. Retry under A1 remains prohibited unless the claim contract explicitly permits it. A new admission A2 is distinct.

## 3. Counterexample: UNKNOWN -> reincarnation
History: effect attempt on resource incarnation R1 -> UNKNOWN -> resource becomes R2 -> provider reports success for R1.

The observation may resolve the historical R1 effect, but it cannot authorize an effect against R2. Resource incarnation is part of historical binding.

## 4. Counterexample: contradictory observations
O1 says UNKNOWN/accepted-at-time-t1; O2 says rejected-at-time-t2. These cannot be merged by latest-write-wins unless the provider's ordering semantics establish that O2 supersedes O1 for the exact EffectID/incarnation. Otherwise the state remains unresolved and requires provider-specific reconciliation.

A contradiction is not automatically FALSE for P_AA. It may instead mean evidence inconsistency or unresolved ordering.

## 5. Counterexample: duplicate reconciliation workers
Workers W1 and W2 independently query the provider and obtain equivalent observations with different local timestamps. Local arrival order cannot define external truth. Deduplication requires observation identity/provider revision/authoritative generation or equivalent provider semantics.

## 6. Counterexample: stale provider response
A provider response can be authentic yet stale. Authentication establishes source integrity, not currentness. Promotion requires freshness/ordering semantics appropriate to the claim.

## 7. Counterexample: retry after unresolved UNKNOWN
If the original effect may exist and no stable external EffectID/deduplication contract exists, creating a second effect can violate effect uniqueness even when the second attempt is locally authorized. Safe outcome is HOLD/QUARANTINE until reconciliation or an explicitly safe compensation protocol exists.

## 8. Convergence criterion
A reconciliation process converges for claim C only if repeated observations eventually establish a stable equivalence class of external histories sufficient for C, or remain UNKNOWN without unsafe promotion. Mere termination of retries is not convergence.

Candidate condition:
`Resolve_C(O1...On) = state S` only if all claim-critical alternatives inconsistent with S are excluded by authenticated, context-bound, fresh/ordered evidence.

## 9. Monotonicity refinement
Reconciliation evidence should be monotone in the space of compatible histories: valid new evidence may remove histories, but must not re-add histories previously excluded unless a previously trusted observation is itself invalidated under explicit provenance rules. Therefore epistemic state can legitimately move TRUE -> UNKNOWN if an earlier observation is revoked or found stale; this is not a violation of monotonic evidence semantics because the evidence basis changed.

## 10. Recovery gate
Recovery may proceed only when:
1. external effect state is sufficiently resolved for the requested action;
2. original authority/admission is still valid or a new authorization exists;
3. resource incarnation matches;
4. EffectID/AttemptID lineage is preserved;
5. reconciliation evidence is current and provenance-complete;
6. no unresolved claim-critical contradiction remains.

Otherwise HOLD/QUARANTINE.

## 11. Strongest conclusion from 037R
UNKNOWN convergence is not guaranteed merely by repeated queries, retries or eventual provider responses. Convergence is a semantic property requiring an authoritative observation model, stable effect identity, freshness/order rules, incarnation binding and explicit authority separation.

## Status
GLOBAL-AUDIT-037 remains OPEN. This continuation is a deeper research checkpoint, not closure.

No formal proof, TLC/TLAPS execution or runtime fault-injection evidence. No implementation/V21.

Next action remains within 037 until explicitly closed: attack the convergence criterion itself, including whether the compatible-history set can oscillate under evidence invalidation and whether a provider can expose sufficient ordering to make resolution sound.
