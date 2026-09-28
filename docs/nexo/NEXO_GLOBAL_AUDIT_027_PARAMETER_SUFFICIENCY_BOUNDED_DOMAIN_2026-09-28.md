# GLOBAL-AUDIT-027 — PARAMETER SUFFICIENCY AND BOUNDED DOMAIN — 2026-09-28

## Objective
Attack the eight semantic transition classes and their proposed parameter set. Determine whether any claim-relevant distinction can be lost even when all proposed parameters appear equal.

## Parameter attack results

### 1. Authority identity
AuthId is necessary but insufficient by itself.
Counterexample: same AuthId, different authority epoch/generation or capability scope.
Result: epoch/generation and scope remain independent dimensions.

### 2. Subject identity
SubjectId cannot substitute for AuthId.
Two authority records may share a subject while differing in policy, epoch, delegation, fence or revocation history.
Result: retain stable authority identity separately from principal identity.

### 3. Policy/delegation
PolicyGeneration and DelegationGeneration are necessary but generation numbers alone are not semantic content.
Counterexample: same generation under distinct policy/delegation state is impossible only if generation is globally authoritative; otherwise provenance must bind generation to policy/delegation identity/incarnation.
Result: generation must be scoped to its source identity/version domain.

### 4. Resource
ResourceId + ResourceIncarnation is necessary for replacement semantics.
Counterexample: same incarnation but different resource fence or provider generation.
Result: ResourceIncarnation does not automatically subsume fence/authority generation.

### 5. Admission binding
AdmissionId must bind actual authority, bridge/lease, operation, attempt and resource incarnation.
A valid independent authority/bridge witness cannot replace the actual used records.
Result: actual UsedAdmissionContext remains irreducible unless total reconstruction is proven.

### 6. Attempt identity
AttemptId alone does not encode whether authorization was inherited, freshly bound, or rechecked.
Result: attempt identity requires binding/provenance relation, not merely a scalar.

### 7. Protocol
ProtocolId/Generation alone cannot encode atomic linearization, lease expiry/renewal/consumption, or recheck semantics.
Result: protocol semantic facts must remain relational or reconstructible.

### 8. Order
EventId is not authoritative order.
Observation time is not authoritative order.
Numeric generation is not automatically semantic continuity.
Result: an explicit claim-relative order/linearization relation is required where order can affect P_AA.

### 9. Recheck
FactSetId alone does not prove fact contents, dependencies, or freshness.
Result: recheck identity must bind to dependency/provenance generation and completeness.

### 10. Dependency/provenance
DependencyGeneration alone does not establish completeness.
Result: completeness is an explicit semantic property; missing required dependency identity yields UNKNOWN.

### 11. Fence
FenceGeneration alone is not sufficient unless the resource/authority domain is bound.
Result: fence identity + generation/incarnation domain required.

## Bounded domain proposal

For adversarial research only, define finite domains with at least:
- 2 subjects
- 2 authorities
- 2 authority epochs
- 2 capability scopes
- 2 policy generations
- 2 delegation generations
- 2 resource incarnations
- 2 operations
- 2 attempts
- 2 admissions
- 2 bridge/lease identities
- 3 protocol modes (ATOMIC, LEASE, RECHECK)
- 2 recheck fact sets
- 2 dependency generations
- 2 fence generations
- 4 event/order positions
- bounded trace depth k

These are research bounds, not claims about production cardinality.

## Critical result

The original parameter list was not sufficient as a set of independent scalars.

The safe abstraction is instead a **typed relational state** containing:
- identities + scoped generations/incarnations;
- actual admission/bridge/attempt bindings;
- claim-relative order/linearization;
- protocol-specific lifecycle facts;
- recheck/dependency/provenance relations;
- explicit completeness/UNKNOWN conditions.

Therefore the next model must not use a flat tuple merely because it contains every named field.

## Bounded-model gate

Before executing any finite state exploration, the bounded domain must satisfy:
1. every semantic parameter has a declared domain;
2. every relation has a declared arity and validity conditions;
3. every transition has preconditions and state/history effects;
4. every transition specifies which relations it may invalidate;
5. UNKNOWN is an explicit observation;
6. actual used-context cannot be replaced by an arbitrary valid witness;
7. bounds are clearly labeled as bounded evidence.

## Status

Parameter sufficiency: **FAILED as flat-scalar representation; REPAIRED as typed relational representation candidate.**

P_AA quotient congruence: UNKNOWN.
FutureObs_PAA sufficiency: UNKNOWN.
R1-R5 completeness: UNKNOWN.
R1-R5 minimality: UNKNOWN.
Finite-domain completeness: UNKNOWN.
TLC/TLAPS/formal verification: NOT PERFORMED.
Implementation: NOT STARTED.

Next: GLOBAL-AUDIT-028 — define the typed relational bounded state schema and attack transition preconditions/invalidation closure before any model execution.
