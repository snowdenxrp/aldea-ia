# NEXO — DISCOVERY / INVALIDATION / ADMISSION RACE + LINEARIZATION — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can a protected effect cross an admission boundary after a safety-relevant dependency has been discovered but before stale assurance has been fully invalidated and enforcement propagated?

## External cross-checks

etcd transactions demonstrate a useful coordination primitive: multiple comparisons can be evaluated atomically and the success branch applied as one transaction; etcd's linearizable operations provide an ordering point for its own state. This is a coordination analogy, not evidence that external-world effects become atomic. citeturn0search0turn0search5 Kubernetes uses resourceVersion to reject stale writes with a 409 Conflict, illustrating optimistic concurrency control against stale state; its cache may lag the API server, so cache freshness and authoritative ordering are separate concerns. citeturn0search2turn0search9 AWS documents that retries can duplicate non-idempotent effects and that idempotency requires an explicit contract/key semantics. citeturn0search3turn0search6

## Core result

The critical race is not solved by merely publishing an invalidation event.

The protected admission decision and the invalidation state need a common authoritative ordering domain, or an equivalent fencing protocol that guarantees stale admission cannot cross the protected boundary.

Core rule:

`STALE_ASSURANCE + ADMISSION_AFTER_INVALIDATION_LINEARIZATION = DENY`

But:

`INVALIDATION_LINEARIZED != ALL_EXTERNAL_ENFORCEMENT_UPDATED`

Therefore two distinct boundaries are required:

1. `AUTHORITY_CUTOFF_LINEARIZATION`
2. `ENFORCEMENT_VERIFICATION`

## 1. Canonical race

Initial:
A1 has valid AssuranceContext C1.

Concurrent actors:
- D-discovery actor learns dependency D.
- admission actor attempts A2 using C1.
- invalidation actor propagates impact.
- cache still contains C1.

Race:
D discovered → A2 admitted from stale C1 → invalidation linearized.

If A2 is safety-relevant, the system has a violation unless its protected ordering places A2 before the invalidation boundary or rejects A2.

The system must never decide based on message arrival order.

## 2. Two legitimate serializations

### Case A: admission linearizes first

`ADMISSION(A2) → INVALIDATION(D)`

A2 belongs to the pre-invalidation context.

The architecture must then classify what D means for A2:
- allowed historical transition;
- invalidated in-flight continuation;
- external effect now UNKNOWN;
- reconciliation required.

It cannot retroactively pretend A2 never happened.

### Case B: invalidation linearizes first

`INVALIDATION(D) → ADMISSION(A2)`

A2 must be denied unless it obtains a new compatible current context.

This gives a clean safety property:

`A2 admission context generation > invalidation boundary` or equivalent protected compatibility proof.

## 3. The dangerous third case

Neither event has a common authoritative ordering.

A2 observes old C1 while another component has already changed safety state.

This is not safely classified by timestamps.

Result:

`ORDER_UNKNOWN → HOLD/REVALIDATE`

unless a fencing mechanism makes stale A2 physically impossible at the protected boundary.

## 4. Admission cannot trust a cache

Kubernetes documents that cached state can lag authoritative state and that stale resourceVersion values can be rejected by the API server. citeturn0search2turn0search9

Nexo therefore needs the same conceptual separation:

`READABLE_CACHE != AUTHORITATIVE_ADMISSION_STATE`.

A cache may help compute a proposal, but protected admission must validate current authoritative context or use a current fence/version condition that the authority domain guarantees.

## 5. Candidate Protected Admission Guard

Admission should atomically/equivalently validate:

- operation identity;
- effect identity;
- attempt identity;
- current authority epoch;
- current policy/invariant version;
- current dependency closure version;
- current effect-path closure version;
- current interaction graph version;
- current scope version;
- current boundary generations;
- current resource incarnations;
- current STOP/recovery state;
- current continuity context;
- absence of unresolved invalidation affecting the claim;
- required evidence/abstraction certificate validity.

Then it must establish the admission linearization point.

## 6. Compare-and-swap is only a coordination primitive

A CAS-style guard can prevent two internal writers from accepting incompatible states if the guarded state is authoritative.

But CAS does not make an external provider obey the result.

Therefore:

`INTERNAL_CAS != EXTERNAL_FENCE`

and:

`AUTHORITY_ORDER != WORLD_ORDER`.

## 7. Candidate protected transaction

A candidate abstract transaction is:

`CHECK_CURRENT_CONTEXT`
→ `CHECK_NO_AFFECTING_INVALIDATION`
→ `CHECK_EFFECT_INTERACTION`
→ `CHECK_SCOPE/CLOSURE`
→ `CHECK_FENCES/INCARNATIONS`
→ `LINEARIZE_ADMISSION`
→ `PUBLISH_DURABLE_INTENT`

The exact implementation mechanism remains open.

The contract matters more than assuming a specific database primitive.

## 8. Invalidation barrier semantics

Candidate barrier fields:

- barrier_id;
- invalidation_generation;
- affected claims/effects;
- old context generation;
- new required context;
- linearization reference;
- fence activation state;
- enforcement verification state;
- reconciliation requirements;
- recovery state;
- expiry/invalidation conditions.

The barrier becomes authoritative at its protected linearization point.

## 9. Admission generations

A useful model is a monotonic logical generation per relevant coordination domain.

Example:

C1 / generation 41
→ invalidation
→ C2 / generation 42

Any admission carrying 41 is stale after the invalidation boundary unless the contract explicitly allows a pre-bound transition.

But numeric monotonicity alone is insufficient:

`generation 42 != semantic compatibility`.

Generation must be bound to identity, domain, continuity and context.

## 10. Multiple invalidations

D1 and D2 may arrive concurrently.

The system cannot assume:

D1 < D2

based on network arrival.

A protected authority domain must establish a current ordering or a partial order with explicit conflict semantics.

If an admission depends on both, it must validate against the closure of all relevant invalidations.

## 11. Invalidation during an already admitted effect

Suppose A2 linearized before D.

D cannot erase the historical admission.

Instead:

`ADMITTED_PRE_D → IN_FLIGHT_CONTEXT_CHANGED`

Then evaluate whether the effect is:

- safely fenceable;
- continuation-compatible;
- externally cancellable;
- already externally attempted;
- UNKNOWN;
- requiring compensation;
- requiring reconciliation.

This uses the previous ContinuationTransition model.

## 12. Stale admission message

A process may compute an admission under C1, crash, then submit it after C2 exists.

The protected authority must reject it based on current context/fence, not timestamp.

Candidate rule:

`SUBMIT(admission_context) => admission_context compatible with CURRENT_AUTHORITY_CONTEXT`

or DENY.

## 13. Cached abstraction certificate

A cached AbstractionCertificate is valid only if its context fingerprint still matches the current relevant context.

Candidate fingerprint:

`FP = hash(scope, dependencyClosure, effectPathClosure, interactionGraph, boundaryGenerations, resourceIncarnations, policy, invariants, authorityEpoch, STOP/recovery, continuity)`

A fingerprint is not itself proof; it is a cheap mismatch detector whose trust depends on the protected storage/continuity semantics.

## 14. Cache invalidation race

A cache may contain:

C1 valid

while authority already has:

C2 invalidated.

Therefore cache invalidation notifications are not sufficient for safety.

The authoritative admission path must reject stale C1 independently of whether the cache has received the notification.

## 15. Crash windows

W1 discovery before admission read.
W2 admission read before discovery.
W3 admission prepared before invalidation.
W4 admission submitted concurrently with invalidation.
W5 admission linearized before invalidation.
W6 invalidation linearized before admission.
W7 invalidation linearized, crash before fence propagation.
W8 fence propagated, crash before verification.
W9 verification incomplete, recovery starts.
W10 recovery restores stale checkpoint.

Every window needs explicit semantics; none may rely on “probably arrived first.”

## 16. Enforcement gap

After invalidation linearizes, external actors may still hold old capabilities.

Thus:

`AUTHORITY_CUTOFF → FENCE_ACTIVATION → ENFORCEMENT_VERIFICATION`

is a distinct sequence.

If the claim requires external quiescence, the claim cannot become VERIFIED merely because authority was revoked internally.

## 17. Resource-side fence

The strongest continuation defense is when the protected resource itself rejects stale context generations.

Then an old A2 may reach the resource but be rejected.

Without resource-side enforcement, Nexo can only claim internal authority cutoff, not necessarily external effect prevention.

## 18. Provider queue race

Even if the main API rejects C1, an old provider queue may contain work created before invalidation.

The closure must include:

- queue entries;
- retries;
- callbacks;
- child executions;
- delayed tasks;
- offline/autonomous continuations.

If these paths cannot be fenced or observed adequately, the strong claim remains degraded/UNKNOWN.

## 19. Simultaneous admission from two stale caches

C1-cache and C1-cache on two actors can both propose the same old generation.

The authoritative domain must make acceptance mutually exclusive or semantically equivalent.

Kubernetes' optimistic concurrency pattern is an example: stale writes are rejected rather than both being accepted. citeturn0search2

This is only an analogy for the internal admission problem; it does not solve external effects.

## 20. Admission and invalidation can share a coordination domain without becoming one global coordinator

The requirement is:

`ONE AUTHORITATIVE SAFETY ORDER PER INTERACTING CLAIM`.

If D and A2 cannot affect each other's safety claim, they need not share a coordinator.

If they can, their relevant coordination domain must serialize or jointly validate them.

This directly uses the previous CCD/minimal-coordination-domain research.

## 21. New object: AdmissionContextFingerprint

Candidate fields:

- operation/effect/attempt identity;
- coordination domain;
- authority epoch;
- policy/invariant versions;
- scope/closure versions;
- boundary generations;
- resource incarnations;
- STOP/recovery epochs;
- continuity context;
- invalidation generation;
- abstraction certificate references.

It is a context binding, not authority by itself.

## 22. New transition: AdmissionCommit

Candidate contract:

`AdmissionCommit = CHECK → GUARDED LINEARIZATION → DURABLE RECORD`

with:

- exact preconditions;
- read set;
- invalidation set;
- scope/closure versions;
- fence set;
- linearization point;
- durable post-state;
- crash semantics;
- retry semantics;
- stale-submission semantics;
- verification evidence.

## 23. Candidate invariants INV-DIA-01..30

INV-DIA-01 Protected admission and affecting invalidation share an authoritative ordering domain or equivalent stale-rejection fence.
INV-DIA-02 Stale cached assurance cannot authorize protected admission.
INV-DIA-03 Message arrival order does not establish safety order.
INV-DIA-04 Admission before invalidation is historical pre-invalidation state, not retroactively erased.
INV-DIA-05 Invalidation before admission denies stale admission.
INV-DIA-06 Unknown relative order requires revalidation or a fence that makes stale execution impossible.
INV-DIA-07 Internal CAS/transaction ordering does not imply external effect ordering.
INV-DIA-08 Admission validates all claim-relevant context dimensions.
INV-DIA-09 Numeric generation requires identity/domain/continuity binding.
INV-DIA-10 Generation equality does not imply semantic compatibility.
INV-DIA-11 Multiple invalidations require current closure, not arrival-order assumptions.
INV-DIA-12 In-flight effects require continuation validation after affecting invalidation.
INV-DIA-13 Stale admission messages are rejected by current authoritative context.
INV-DIA-14 Cached certificate fingerprints detect mismatch but do not independently prove truth.
INV-DIA-15 Cache invalidation notifications are not the safety boundary.
INV-DIA-16 Critical invalidation linearization is distinct from external enforcement verification.
INV-DIA-17 Old provider queue work remains in effect-path closure.
INV-DIA-18 Resource-side fence is stronger evidence of stale-effect rejection than controller state alone.
INV-DIA-19 Simultaneous stale submissions cannot both cross a mutually exclusive protected admission point.
INV-DIA-20 Coordination scope is claim-dependent.
INV-DIA-21 AdmissionContextFingerprint is not authority.
INV-DIA-22 AdmissionCommit requires durable semantics appropriate to crash/retry.
INV-DIA-23 Recovery must not restore stale admission authority.
INV-DIA-24 Revalidation after crash must observe current invalidation generation.
INV-DIA-25 A claim cannot be VERIFIED during unresolved enforcement gap if external enforcement is required.
INV-DIA-26 Provider continuation can keep an old effect path alive after local invalidation.
INV-DIA-27 Unknown external continuation blocks claims requiring quiescence.
INV-DIA-28 The protected admission point is distinct from execution start.
INV-DIA-29 The external effect point is distinct from admission linearization.
INV-DIA-30 World reconciliation remains necessary when external outcome is uncertain.

## 24. Formal model direction

Add abstract variables:

`authGen`
`invalidationGen`
`assuranceContext`
`admissionContext`
`inFlight`
`boundaryGen`
`resourceIncarnation`
`enforcementState`
`cacheContext`
`recoveryContext`

Safety property:

`ADMIT(e) => admissionContext(e) == currentCompatibleContext OR staleExecutionRejectedByBoundary(e)`

Race property:

`AFFECTING_INVALIDATION_LINEARIZED < ADMISSION_LINEARIZATION => stale admission impossible`.

Pre-invalidation property:

`ADMISSION_LINEARIZATION < AFFECTING_INVALIDATION_LINEARIZATION => admission remains historical fact and enters continuation/reconciliation analysis`.

Verification property:

`STRONG_EXTERNAL_QUIESCENCE_CLAIM => ENFORCEMENT_VERIFIED`

## 25. Major architectural consequence

The Protected Admission Kernel must not be just a policy checker.

It needs an authoritative ordering/fencing contract connecting:

`AUTHORITY + INVALIDATION + SCOPE + CLOSURE + FENCE + CONTINUITY + ADMISSION`

The clean architecture should therefore treat **Protected Admission Linearization** as a first-class abstract transition, not an implementation detail.

It becomes one of the core L3 protected transitions requiring refinement evidence.

## 26. Remaining gaps

G-DIA-01 exact implementation mechanism for admission/invalidation shared ordering.
G-DIA-02 distributed coordination when multiple CCDs overlap dynamically.
G-DIA-03 atomicity/equivalence between invalidation and fence activation.
G-DIA-04 provider-side stale-work rejection.
G-DIA-05 cache/context fingerprint continuity.
G-DIA-06 crash between admission and durable record.
G-DIA-07 crash between invalidation and enforcement verification.
G-DIA-08 formal TLA+/TLC model and actual execution.
G-DIA-09 implementation refinement to concrete storage/CAS semantics.
G-DIA-10 fault injection for all W1–W10 windows.

## Conclusion

The dangerous race is now precisely framed:

`DISCOVERY → INVALIDATION → ADMISSION`

cannot safely depend on asynchronous notification or cache freshness.

There must be one protected ordering point for the interacting claim, or a resource-side fence that makes stale admission ineffective.

The architecture therefore distinguishes:

`AUTHORITY_CUTOFF_LINEARIZATION`
`FENCE_ACTIVATION`
`ENFORCEMENT_VERIFICATION`
`EXTERNAL_EFFECT`

These are four different events. None may be silently collapsed into one boolean.

## Next attack

**ATOMICITY BETWEEN ADMISSION COMMIT AND DURABLE INTENT + CRASH/REPLAY + DUPLICATE SUBMISSION + FENCE ACTIVATION**

Question: after admission linearizes but before its durable intent/fence is fully recorded, can crash/replay create either a duplicate protected effect or a stale authority resurrection?
