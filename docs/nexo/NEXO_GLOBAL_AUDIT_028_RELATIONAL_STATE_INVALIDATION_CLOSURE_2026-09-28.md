# GLOBAL-AUDIT-028 — TYPED RELATIONAL STATE AND INVALIDATION CLOSURE — 2026-09-28

## Objective
Construct the bounded research-state schema without executing a model, then attack whether every transition declares claim-relevant invalidations.

## Candidate typed state
Identity records: AuthRec(AuthId, SubjectId), ResourceRec(ResourceId, Incarnation, FenceDomain, FenceGeneration), PolicyRec, DelegationRec, OperationRec, AttemptRec, AdmissionRec, BridgeRec, LeaseRec, EventRec.

Binding relations: UsesAuthority, UsesBridge, BindsAttempt, BindsOperation, BindsResource, BindsPolicy, BindsDelegation, BindsFence.

Protocol relations: ProtocolOf, LeaseLifecycle, Linearization, RecheckFacts, RecheckDeps, RetryRelation.

Evidence/history: DependencySnapshot, ProvenanceComplete, EvidenceValid, ClaimScope, authoritative event/order relations, Invalidates.

## Invalidation closure attack
A transition is closed only if it updates every directly changed claim-relevant relation, invalidates/recomputes every derived relation whose assumptions changed, or deliberately leaves the observation UNKNOWN until reconciliation/revalidation.

Authority changes may invalidate authority validity, capability scope, delegation linkage, fence freshness, lease/bridge admissibility and future continuation.
Policy/delegation changes may invalidate policy/delegation bindings, recheck facts and future admission eligibility.
Resource changes may invalidate resource bindings, incarnation-sensitive authority, fences, prepared effects and retry eligibility.
Admission changes may invalidate actual UsedAdmissionContext, attempt/operation binding and bridge/lease linkage.
Lease/protocol changes may invalidate expiry, renewal, consumption, linearization and protocol continuation assumptions.
Retry changes may invalidate authorization inheritance, idempotency assumptions, operation/effect identity and reconciliation lineage.
Recheck/dependency changes may invalidate fact sets, dependency completeness and provenance.
STOP/recovery changes may invalidate execution eligibility, fence validity, external-effect assumptions, reconciliation and release authority.

## Counterexample criterion
For each transition T, seek histories H1/H2 equal under the retained representation except that T occurred in H1, then a legal continuation C where Obs_AA(H1·C) differs from Obs_AA(H2·C), including TRUE/FALSE/UNKNOWN differences. If so, the schema is incomplete unless it distinguishes the histories or invalidates affected relations.

## Key finding
The relational schema is materially stronger than the flat parameter tuple, but it is NOT yet closed under invalidation. Dominant residual risk: stale derived relations after source authority, policy, resource incarnation, dependency, lease or fence changes.

Safe mechanisms are explicit source-generation dependencies plus invalidation, reconstruction from authoritative history, or UNKNOWN until reconciliation/revalidation.

Preserved rules: CURRENT_RELATION_PRESENT != CURRENT_RELATION_VALID; NO_INVALIDATION_RECORD != NO_INVALIDATION. Missing observed invalidation is not evidence of absence unless event completeness is established.

## Gate
No bounded model execution. No implementation/V21.

Next: GLOBAL-AUDIT-029 — dependency/invalidation matrix plus stale-cache and missing-event adversarial attacks.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; EventDAG closure PARTIAL; finite-domain completeness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
