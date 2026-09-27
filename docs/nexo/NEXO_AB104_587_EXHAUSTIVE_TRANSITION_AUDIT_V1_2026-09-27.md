# NEXO — AB104.587 — Auditoría exhaustiva de transiciones

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
TLC systematically explores the reachable state graph of a finite model and checks invariants; a completed bounded model check applies only to the configured constants/assumptions, not automatically to arbitrary system sizes or implementation. citeturn0search1
TLA+ safety properties are checked by finding reachable counterexample traces; liveness requires separate temporal/fairness reasoning. citeturn0search2turn0search5
Distributed-system state spaces can grow exponentially, so bounded/exhaustive checking must state its scope. citeturn0search0turn0search14

## Audit result
The AB104.586 lifecycle is NOT safe to treat as a single flat enum. Exhaustive reasoning exposes cross-product state combinations that create illegal or underspecified transitions.

The minimum audit dimensions are:
- EffectOutcome
- AuthorityState
- AdmissionState
- DependencyState
- Incarnation
- Fence/Epoch
- ReconciliationState
- CompensationState
- ClosureState.

## Newly identified transition hazards
1. AUTHORITY_REVOKED while EXECUTING: outcome remains independent; must reconcile external acceptance/execution evidence.
2. INCARNATION_CHANGED while UNKNOWN: old effect identity cannot be rebound automatically to the new resource/provider incarnation.
3. DEPENDENCY_UNKNOWN while COMPENSATION_PENDING: compensation may itself be blocked; no automatic reverse replay.
4. COMPENSATION_COMMITTED while original remains UNKNOWN: both facts coexist; compensation does not resolve the original outcome unless its contract explicitly establishes that relation.
5. CLOSURE_REQUESTED with UNKNOWN dependency: closure must be refused for required unresolved work.
6. ADMISSION_VALID + FENCE_INVALID: mutation is rejected; admission does not override fence.
7. GRAPH_VERSION_CHANGED + QUEUED: stale admission; fresh admission required.
8. PROVIDER_ACK + LOCAL_TIMEOUT: outcome is not inferred from the client observation; reconcile by stable identity.
9. ROOT_PARTIAL_COMMIT + NEW_RETRY: retry only unresolved participant(s), never replay already committed participants blindly.
10. FAIRNESS_ELIGIBLE + AUTHORITY_INVALID: scheduling eligibility cannot create authority.

## State-machine rule
The transition relation should be defined over the product state, not inferred from a human-readable status label.
An action is legal only if its preconditions hold across ALL relevant dimensions.

Conceptual form:
`Next = ⋁ Action_i`
where each `Action_i` declares explicit preconditions and postconditions.

This is the point where formal modeling becomes appropriate: TLA+ represents state variables, Init, Next and invariants, while TLC can explore the reachable graph and return counterexample traces. citeturn0search1turn0search5

## Safety invariants to carry into the formal model
S1. UNKNOWN cannot authorize duplicate external execution.
S2. Expired/revoked authority cannot authorize a new external mutation.
S3. An effect bound to incarnation X cannot mutate incarnation Y without explicit transfer evidence.
S4. Stale admission cannot execute.
S5. Historical COMMITTED cannot become NOT_COMMITTED by local state mutation.
S6. Required unresolved dependencies prevent root closure.
S7. Compensation cannot erase original outcome evidence.
S8. Internal atomic commit cannot imply external atomic effect when the provider lacks the corresponding fence.
S9. Independent work is not invalidated without dependency reachability.
S10. Every external effect has a unique stable identity within its declared provider/contract scope.

## Liveness candidates — NOT YET PROVEN
L1. Every eligible effect eventually receives a scheduling opportunity under declared fairness assumptions.
L2. Every UNKNOWN effect eventually reaches reconciliation if authoritative evidence becomes available.
L3. Recovery cannot permanently starve unrelated eligible work.

These require explicit fairness/environment assumptions; they are not established by the safety audit. TLA+ distinguishes safety from eventual-progress properties and fairness constraints. citeturn0search5turn0search7

## Important epistemic boundary
No formal verification has been performed on Nexo yet. This AB is an audit-derived candidate invariant set and transition hazard inventory, not a proof.

## Closure
AB104.587 identifies the correct next methodological boundary: stop adding prose-only transitions and build a small formal model of the effect lifecycle for bounded exhaustive checking, while keeping implementation untouched.

## Next exact step
AB104.588 — construct the first bounded formal model specification (research/model only, NOT production implementation), encode the above safety invariants and inspect counterexamples. Do not claim verification until the model actually runs.