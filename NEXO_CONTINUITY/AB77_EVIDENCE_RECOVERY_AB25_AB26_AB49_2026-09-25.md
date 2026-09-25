# AB77 — EVIDENCE RECOVERY FROM AB25/AB26/AB49 — 2026-09-25

Status: RESEARCH ONLY. No implementation change, no semantic freeze, no formal verification.

## Purpose

Test whether earlier canonical research recovers any missing completeness dimensions C1-C6 for LEASE_RENEW, RETRY, MUTATION, RECHECK.

## Recovered evidence

AB25 establishes that UsedAdmissionContext is an independently reconstructed historical/relational linkage, not a validity predicate. It also establishes a six-part transition contract: Pre, Post, Frame, Invalidation, HistorySupport, AdmissionLink. It identifies hidden-history attacks involving lease replay, retry/attempt identity, admission order, and bridge linkage.

AB26 strengthens the same contract and states that LeaseBridge and AdmissionBindingClass must remain distinct until future-behavioral equivalence is proven. It also states that temporal ordering may require an ordered event/history structure rather than a fixed three-position abstraction.

AB49 defines allowed HistorySupport primitives: linkage, claim-relevant order, invalidation edges, linearization, lease interval/expiry/renewal/consumption/replay, exact recheck fact-set/order/result linkage, bounded auxiliary history, and boundary. It explicitly keeps future observation and quotient equivalence out of HistorySupport.

## Dimension upgrades

### LEASE_RENEW
C1 source context: upgraded from PARTIAL/KNOWN to KNOWN for named inputs.
C4 frame/invalidation: PARTIAL/KNOWN vocabulary is strengthened: renewal semantics, replay/consumption, policy/delegation/epoch/incarnation/boundary invalidation, bridge linkage, renewal authority are explicit support dimensions.
C5 observation/context mapping: PARTIAL remains. Actual UsedAdmissionContext linkage is independently reconstructible in principle, but the exact renewal successor-to-observation mapping is not fully specified.
C2 legality: UNKNOWN.
C3 post-state: UNKNOWN.
C6 enumeration domain: UNKNOWN.
Overall: UNKNOWN.

### RETRY
C1 source context: upgraded/confirmed KNOWN for prior attempt, retry relation, attempt identity, protocol and binding context.
C4 frame/invalidation: PARTIAL/KNOWN vocabulary: prior bridge cannot transfer implicitly; retry relation and attempt-scoped binding are explicit.
C5 observation/context mapping: PARTIAL because admission linkage must be explicit, but exact successor mapping remains incomplete.
C2 legality: UNKNOWN.
C3 post-state: UNKNOWN because AB25/AB26 allow either fresh attempt or explicitly same attempt according to protocol.
C6 enumeration domain: UNKNOWN.
Overall: UNKNOWN.

### MUTATION
C1 source context: PARTIAL/KNOWN for mutation, attempt, policy, delegation, incarnation.
C4 frame/invalidation: PARTIAL because AB49 names mutation detection and recheck semantics, but does not provide a complete mutation transition law.
C5 observation/context mapping: PARTIAL/UNKNOWN because exact recheck result linkage is an allowed support primitive but not a complete successor generator.
C2 legality: UNKNOWN.
C3 post-state: UNKNOWN.
C6 enumeration domain: UNKNOWN.
Overall: UNKNOWN.

### RECHECK
C1 source context: upgraded/confirmed KNOWN for exact fact-set, mutation state, attempt, policy/delegation/incarnation, boundary.
C4 frame/invalidation: PARTIAL/KNOWN vocabulary through exact fact-set, mutation detection and recheck order.
C5 observation/context mapping: PARTIAL because actual result linkage and order are explicit requirements, but complete result successor law is missing.
C2 legality: UNKNOWN.
C3 post-state: UNKNOWN.
C6 enumeration domain: UNKNOWN.
Overall: UNKNOWN.

## Key result

Earlier research recovers vocabulary and relational/history constraints, but it does not supply a complete successor generator for any of the four unresolved events.

Therefore no event crosses the AB76 completeness gate.

This is important: the UNKNOWN result is now evidence-backed by an explicit gap analysis, not merely by absence of implementation enumeration.

## No contradiction with AB74-AB76

AB74 said the four events were C/UNKNOWN because decisive protocol semantics were incomplete.
AB75 defined the completeness boundary.
AB76 applied that boundary and found unresolved dimensions.
AB77 recovers additional earlier evidence and narrows the unknowns, but does not eliminate them.

The epistemic state therefore becomes more precise without becoming more certain than the evidence permits.

## Gate status

LEASE_RENEW = UNKNOWN
RETRY = UNKNOWN
MUTATION = UNKNOWN
RECHECK = UNKNOWN

TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

Eight-attack closure and 286-triple expansion remain blocked.

## Next exact experiment

Recover AB36 and AB38 evidence if available, then test whether their concrete transition/reconstruction material supplies C2/C3/C6 for any of the four events. If not, the next step is a bounded adversarial successor construction, not a protocol invention.
