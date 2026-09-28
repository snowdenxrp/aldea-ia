# GLOBAL-AUDIT-029 — INVALIDATION MATRIX AND STALE-CACHE ATTACKS — 2026-09-28

## Objective
Attack every claim-relevant derived relation for stale-cache, lost-invalidation, reordered-invalidation and incomplete-dependency scenarios.

## Matrix
| Source change | Potentially stale relation | Required dependency | Safe response |
|---|---|---|---|
| authority revoke/epoch | UsesAuthority, LeaseLifecycle | AuthId+epoch+generation | invalidate/revalidate/UNKNOWN |
| capability change | admission eligibility | capability scope+generation | invalidate/revalidate/UNKNOWN |
| policy change | BindsPolicy, RecheckFacts | PolicyId+generation | invalidate/revalidate/UNKNOWN |
| delegation change | BindsDelegation, future support | DelegationId+generation | invalidate/revalidate/UNKNOWN |
| resource reincarnation | BindsResource, fence, prepared effect | ResourceId+incarnation | hard invalidation/quarantine |
| fence advance | BindsFence, execution eligibility | FenceDomain+generation | reject stale actor |
| lease renew/expire/consume | LeaseLifecycle, continuation support | LeaseId+generation | recompute/UNKNOWN |
| retry/new attempt | RetryRelation, auth inheritance | AttemptId+AdmissionId | explicit rebinding |
| recheck dependency change | RecheckFacts, provenance | FactSet+dependency generation | invalidate/recheck |
| provenance loss | completeness | dependency digest/completeness | UNKNOWN |
| STOP/recovery | execution/release state | operation+recovery fence | block/quarantine/reconcile |

## Adversarial attacks
A1 stale cache after authority revoke.
A2 stale cache after epoch advance.
A3 policy changes after recheck but before admission.
A4 resource reincarnation with same ResourceId.
A5 fence advances while old admission remains stored.
A6 lease expires during retry.
A7 lease renews after a policy change.
A8 retry creates a new attempt but inherits old authorization accidentally.
A9 recheck fact remains after dependency generation changes.
A10 provenance digest is missing but cached decision remains.
A11 invalidation event exists but arrives after admission evaluation.
A12 invalidation event is duplicated/out of order.
A13 invalidation event is lost while current snapshot remains unchanged.
A14 recovery occurs from stale local history after an external effect already changed state.
A15 second failure occurs during reconciliation.

## Results
A1-A10 demonstrate direct stale-state hazards unless dependency generation is part of the relation or the relation is reconstructed/revalidated.
A11-A13 establish that event arrival/order/completeness cannot be treated as equivalent to authoritative invalidation state. Missing or delayed invalidation must not produce TRUE_JUSTIFIED.
A14 confirms prior recovery rule: restored local history is not automatically authoritative over newer external evidence.
A15 confirms recovery progress cannot itself confer recovery authority.

## New requirement: invalidation closure is bidirectional
It is insufficient to define source -> derived invalidation only. The model must also define the admission/claim dependencies that make the invalidation claim-relevant. Otherwise a broad invalidation can erase useful state, while a narrow invalidation can miss a dependency.

Therefore define a typed dependency graph:
SourceVersion -> DerivedRelation -> ClaimPredicate -> Observation.
Each edge requires an explicit dependency contract.

## Cache rule
A cached claim-relevant value is safe only if its source identity, incarnation/generation, dependency digest, derivation identity and freshness/completeness remain valid for the current admission.

A cache hit is NOT evidence of current validity.

## Gate
Invalidation matrix is now semantically required before bounded model execution. The next task is GLOBAL-AUDIT-030: attack dependency-graph completeness itself, including hidden reads, aggregate predicates, cache layers and common-mode dependencies.

Status remains: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; EventDAG closure PARTIAL; finite-domain completeness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
