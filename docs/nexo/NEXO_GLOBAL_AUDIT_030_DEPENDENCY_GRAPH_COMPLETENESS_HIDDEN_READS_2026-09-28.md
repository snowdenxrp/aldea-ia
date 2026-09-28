# GLOBAL-AUDIT-030 — DEPENDENCY-GRAPH COMPLETENESS ATTACK — 2026-09-28

## Objective
Determine whether the dependency graph can miss claim-relevant inputs through hidden reads, derived aggregates, layered caches or common-mode dependencies.

## Attack classes
1. Hidden read: helper reads protected state not declared by caller.
2. Aggregate read: count/sum/min/max/range predicate depends on a set, not one scalar.
3. Predicate read: eligibility predicate depends on policy/delegation/fence context indirectly.
4. Cache read: derived cache omits source generation or derivation identity.
5. Multi-layer cache: L1 is fresh while L2/source changed, or invalidation reaches only one layer.
6. External observation: provider response depends on resource incarnation/revision not captured locally.
7. Common-mode dependency: two apparently independent observations share policy, time, provider, identity, or storage source.
8. Conditional read: branch-dependent dependency is not recorded on the branch actually taken.
9. Retry-dependent read: retry observes a newer dependency generation than the original attempt.
10. Historical read: current snapshot replaces a claim-relevant historical event/order dependency.

## Findings
### Hidden reads
A caller-visible ReadSet is incomplete if helpers can access authoritative state outside the declared capture boundary. Safe rule: all protected reads must pass through a claim-scoped authoritative access boundary or the admission becomes INCOMPLETE_CAPTURE -> UNKNOWN/HOLD.

### Aggregates
An aggregate is not represented safely by a single aggregate value unless its dependency set/version and predicate semantics are captured. A change to one member can alter the predicate while leaving a stale aggregate unchanged.

### Layered caches
Every cache layer needs either source generation/dependency digest propagation or a trusted invalidation chain. Partial invalidation produces stale-but-plausible values.

### External observations
Provider, endpoint/resource identity, resource incarnation, revision/consistency mode, observation time/freshness and operation identity may be claim-relevant. A successful response is not proof that the local resource incarnation is current.

### Common-mode
Two observations are not independent merely because they come from different processes, services or models. Independence is claim-relative and requires a dependency/domain analysis.

### Conditional branches
Dependency recording must follow actual branch execution. Static union of all possible dependencies is conservative but may reduce availability; missing the executed branch dependency is unsound.

### Retry
A retry can cross a dependency generation boundary. Reusing the original admission evidence without revalidation can create stale authorization.

### Historical reads
A current snapshot cannot replace historical event/order evidence when the claim asks whether an earlier admission was valid under the state that existed at its actual decision/binding point.

## Required capture contract
For a claim-relevant read, record at least:
SourceIdentity, SourceIncarnation, SourceVersion/Revision, ReadID, AdmissionID, DerivationID, ParentDigest, DependencyGeneration, Freshness, ConsistencyMode, Completeness, TrustBoundary.

For aggregates add predicate/range/aggregate identity and the covered dependency set or authoritative aggregate generation.

## Critical result
The dependency graph cannot be declared complete merely because every top-level variable is listed. Completeness is a property of the authoritative access boundary and derivation semantics.

The claim-scoped TCB therefore includes the dependency recorder and every mechanism that can read protected state or produce a decision-influencing derived value.

An uninstrumented protected read is not "no dependency"; it is incomplete capture.

## Gate
Before bounded model execution, dependency completeness must be represented explicitly. A conservative fallback is INCOMPLETE_CAPTURE -> UNKNOWN/HOLD/REVALIDATE.

Next: GLOBAL-AUDIT-031 — common-mode and independence attack, then define claim-scoped TCB boundaries for dependency capture.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; EventDAG closure PARTIAL; formal verification NOT PERFORMED; implementation NOT STARTED.
