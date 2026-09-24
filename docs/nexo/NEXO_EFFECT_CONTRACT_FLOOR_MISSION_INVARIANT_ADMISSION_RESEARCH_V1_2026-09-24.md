# NEXO - EFFECT CONTRACT FLOOR / MISSION INVARIANT ADMISSION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Core result
The minimum external contract is claim-dependent, not a universal API checklist. An effect may cross the admission boundary when either (1) every world consistent with current evidence remains within the affected mission safety region and all relevant future paths are bounded, or (2) the external contract provides enough identity, enforcement and reconciliation to prevent UNKNOWN from creating an unbounded mission-invariant violation. Otherwise: DENY / HOLD / QUARANTINE.

## Cross-checks
AWS documents that retries can execute an operation more than once and that at-least-once retry is safe only for idempotent operations; at-most-once per retry still does not establish exactly-once across a workflow. AWS also describes stable idempotency tokens for recognizing repeated requests. citeturn0search0turn0search1 TLA+ refinement reasoning requires implementation behavior to satisfy a higher-level specification under an explicit refinement mapping. citeturn0search15

## Admission Contract Floor
Candidate object: AdmissionContractFloor.
Relevant dimensions are effect class, mission invariants, required claim strength, effect and attempt identity, target/resource identity and incarnation, commit/acceptance semantics, idempotency/retry, cancellation/fencing, autonomous continuation, status/history/reconciliation, retention/proof boundary, effect-path closure, uncertainty model, compensation/recovery, dependencies, environment assumptions, failure domains, continuity, allowed degraded claims and rejection conditions.
The floor is the minimum subset required for the requested mission claim.

## Decisive predicate
ADMISSIBLE(E,M,C) requires current authority, current scope, current dependency closure, current fence/boundary, and either SAFE_UNDER_OUTCOME_UNCERTAINTY(E,U,M) or enough reconciliation to establish the required claim. A mandatory UNKNOWN becomes HOLD/REVALIDATE/QUARANTINE unless proven irrelevant to M.

## Why idempotency is insufficient
Idempotency can make repeated identical requests safer when the provider honors a stable token, but it does not by itself establish current resource incarnation, cancellation, stale-controller rejection, isolation, temporal ordering, mission-level aggregate limits, history completeness, downstream autonomous work or compensation safety. Therefore IDEMPOTENCY is only one possible component of the admission floor. citeturn0search1

## Mission-risk classes
A: UNKNOWN cannot violate the invariant. If every allowed outcome preserves M, bounded admission may be safe without resolving historical detail.
B: UNKNOWN can violate M, but future effects are fenceable and the outcome can be reconciled. Stable identity, resource incarnation, enforcement, effect-path closure and adequate reconciliation become mandatory.
C: UNKNOWN can violate M and cannot be reliably reconciled. Admission requires a prior proven absorbing safe state or must be denied/held/quarantined.
D: irreversible, non-fenceable, non-observable effect that can violate M. DENY.

## Mission-level threshold
A provider contract can be sufficient for one claim but insufficient for another. A local effect claim may only need outcome identity, while a conservation or temporal mission invariant can require complete effect closure, concurrent interactions, queues, retries, compensation, resource incarnations and causal order.

UNKNOWN is evaluated against the invariant, not against generic fear. Let U be the allowed worlds consistent with current evidence. SAFE_UNDER_UNCERTAINTY(action,U,M) requires every relevant world and every permitted future transition to preserve M.

## Temporal and aggregate invariants
Pre-safe plus post-safe does not imply intermediate safety. Temporal occupancy, overlap, delayed work, retry/redrive, compensation and ordering may be part of the admission floor. Individually valid effects may be collectively unsafe. Therefore InvariantClosure(M) must include every effect, resource, path, queue, retry, compensation, recovery, provider and dependency capable of changing M.

UNKNOWN_CONSUMPTION != ZERO_CONSUMPTION. Missing observation cannot simply return unresolved capacity to a mission budget.

## Absorbing-state exception
An otherwise unreconcilable effect may become admissible if Nexo first establishes a safety-absorbing boundary: relevant future effects fenced; stale capabilities rejected; every remaining possible history preserves M; state survives crash/restart; exit requires a new protected transition; hidden downstream paths are covered or proven irrelevant. Absorption does not prove historical truth.

## Candidate Admission Contract Floor theorem
Not formally proven: for effect E and mission invariant M, admission is justified only if at least one holds: SAFE_UNDER_UNCERTAINTY(E,U,M), RECONCILIATION_COMPLETE_ENOUGH(E,M), or PROTECTED_ABSORBING_STATE(E,M) established before unresolved uncertainty can violate M. Otherwise DENY/HOLD/QUARANTINE.

## Mandatory dimensions are claim-specific
Stable effect identity is mandatory when duplicate/history ambiguity can affect M. Attempt identity is mandatory when attempts can differ semantically. Resource incarnation is mandatory when replacement can change meaning. Idempotency is mandatory when retries can duplicate unsafe effects. Fencing is mandatory when stale actors can still affect M. Cancellation is mandatory when continuing work can violate M. History/status is mandatory when historical outcome classification is needed. Queue/child closure is mandatory when downstream work can affect M. Causal order is mandatory when ordering changes M. Temporal occupancy is mandatory for duration/overlap invariants. Aggregate accounting is mandatory for conservation/budget invariants. Compensation semantics are mandatory if recovery may compensate. Continuity is mandatory when rollback/restore can resurrect stale authority. Boundary completeness is mandatory for strong global claims.

## Reject conditions
Reject/hold when required effect identity is unavailable; relevant resource incarnation is unknown; stale actors cannot be fenced; provider can continue autonomously through an unknown path; required reconciliation is unavailable; UNKNOWN can violate M and no absorbing state exists; required causal order is unknown and not safe for all orders; mission accounting cannot bound unresolved consumption; compensation is unsafe across the uncertainty set; external contract compatibility is unknown; or required dependency/boundary continuity is unknown.

## Degraded admission
A claim lattice may be GLOBAL_MISSION_SAFE, BOUNDARY_SAFE, RESOURCE_SAFE, EFFECT_SAFE, CONTROL_SAFE, UNKNOWN/DEGRADED. A weaker claim may permit an operation only when the operation genuinely requires no stronger claim. Weaker assurance never silently grants stronger authority.

## Break-glass
Break-glass cannot simply bypass the floor. If permitted, it needs bounded effect class, explicit authority, limited scope, mission-risk policy, dedicated fence, evidence, expiry and post-action reconciliation. It cannot become ambient authority.

## External contract drift
A provider can change semantics without Nexo code changing. If ACK semantics, idempotency retention, retry/redrive, cancellation, history or resource replacement semantics change, dependent admission assurance must be invalidated and recomputed.

## Contract identity
Candidate ExternalContractIdentity includes provider identity/version, effect class, API semantic version, ACK semantics, idempotency lifetime, retry/redrive semantics, cancellation/fencing, history/query semantics, retention, replacement semantics, autonomous continuation and assumptions. Same endpoint does not imply same contract.

## Refinement rule
The architecture specifies semantic requirements, not one implementation. An implementation must refine the external contract; a local API shape is not enough. TLA+ refinement reasoning supports this separation between implementation behavior and the higher-level safety specification. citeturn0search15

## Candidate invariants INV-ACF-01..36
01 Admission contract is claim-specific.
02 Local authority does not substitute for external guarantees.
03 UNKNOWN is evaluated against the affected mission invariant.
04 UNKNOWN does not equal zero effect.
05 UNKNOWN does not equal failure.
06 Idempotency alone is not sufficient for mission admission.
07 Required effect identity must be stable.
08 Resource incarnation must be bound when relevant.
09 Stale external actors must be fenceable when stale execution can violate M.
10 Autonomous continuation belongs to effect-path closure.
11 Required reconciliation must be available or the claim must degrade/block.
12 Required history freshness must be adequate.
13 Unknown causal order blocks order-sensitive claims unless all allowed orders are safe.
14 Temporal overlap must be included when relevant.
15 Aggregate invariants require aggregate closure.
16 Compensation is a new protected effect.
17 Compensation must be safe across the remaining uncertainty set.
18 Absorbing safety state may replace historical resolution only with a complete safety boundary.
19 Absorption does not prove historical outcome.
20 Mission-safe does not imply world-state known.
21 Weaker claim does not grant stronger authority.
22 Degraded assurance must be explicit.
23 Break-glass cannot silently bypass the contract floor.
24 Contract changes invalidate dependent assurance.
25 Provider version equality does not prove semantic contract continuity.
26 Unknown mandatory contract property blocks strong admission.
27 Open-world bypass paths block strong global claims.
28 Claim scope determines required effect-path closure.
29 Mission invariant closure determines coordination footprint.
30 Recovery cannot invent missing external semantics.
31 Control commit does not promote external claim.
32 Provider ACK only promotes to its documented semantic level.
33 Reconciliation evidence is claim-specific.
34 Admission floor must survive crash/replay.
35 Snapshot restoration cannot restore historical admission authority.
36 No generic recovery policy may assume all effect classes share one contract.

## Architectural result
The clean architecture gains a hard admission gate:
REQUEST -> MISSION INVARIANT IMPACT -> EFFECT CONTRACT FLOOR -> UNCERTAINTY ANALYSIS -> EFFECT-PATH CLOSURE -> FENCE/BOUNDARY VALIDATION -> COORDINATION DOMAIN -> PROTECTED ADMISSION.
The decision is no longer only whether the action is locally authorized. It is whether the effect is admissible under the strongest mission claim it can affect, given the actual external contract and every allowed unresolved outcome.

## Open gaps
G-ACF-01 formal Admission Contract Floor theorem.
G-ACF-02 automated derivation of mandatory contract dimensions from mission invariants.
G-ACF-03 formal uncertainty-set completeness.
G-ACF-04 safe absorbing-state proof integration.
G-ACF-05 mission-level temporal admission checking.
G-ACF-06 provider contract attestation.
G-ACF-07 external contract drift detection.
G-ACF-08 runtime effect-path closure enforcement.
G-ACF-09 actual SANY/TLC/TLAPS.
G-ACF-10 implementation refinement.
G-ACF-11 fault-injection evidence.

## Next attack
MISSION INVARIANT + MULTIPLE EXTERNAL EFFECT CLASSES + CONTRACT HETEROGENEITY.
Question: when one mission invariant depends on several effects whose providers have different contracts—one strongly reconcilable, one idempotent but delayed, one non-reconcilable—can Nexo compute a single safe admission rule without over-blocking the entire mission or accidentally composing incompatible assurance?