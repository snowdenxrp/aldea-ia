# NEXO GLOBAL AUDIT-054 — REVOCATION CONFLICT RESOLUTION
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: research/audit artifact only

## Objective

Attack revocation conflict resolution as a semantic problem:
1. precedence lattices versus partial orders;
2. incomparable authorities;
3. emergency/ordinary intersections;
4. multiple valid revocations with different scopes;
5. cancellation versus supersession;
6. conflicts across epochs/incarnations;
7. conservative UNKNOWN;
8. common-mode trust introduced by the resolver.

## External evidence

W3C PROV defines validity constraints and event-ordering constraints for provenance. Its formal semantics include ordering constraints involving invalidation, and its constraints can expose circular provenance histories as inconsistent rather than silently resolving them. citeturn1search0turn1search12

This supports a key audit principle: a provenance/conflict resolver needs explicit semantic constraints; syntactic validity or arrival order is not enough.

## A — total precedence is unsafe by default

A total order such as "emergency > ordinary > older" can manufacture a winner for cases where the authorities are actually incomparable.

If no authoritative relation establishes A > B for the exact scope/epoch/claim, forcing a total order creates information not contained in the evidence.

Candidate rule:
UNORDERED AUTHORITIES + CLAIM-RELEVANT CONFLICT => UNKNOWN.

## B — partial orders preserve unresolved distinctions

A partial order can represent:
A precedes B,
B precedes C,
while A and C remain incomparable.

This is preferable to inventing A < C merely to obtain deterministic output.

But partial-order representation alone does not prove semantic completeness. The relation itself requires provenance, authority and scope semantics.

## C — lattices do not automatically solve authority conflicts

A join operation is useful only if its ordering relation means something semantically valid for the claim.

A mathematically complete lattice can still encode the wrong authority semantics.

Therefore:
ALGEBRAIC COMPLETENESS != SEMANTIC CORRECTNESS.

A "top" element such as EMERGENCY cannot automatically mean "wins every conflict" unless the governing authority contract says so.

## D — incomparable authorities

Let R1 revoke C under authority A, and R2 preserve C under authority B.

If A and B have disjoint scopes, there may be no conflict.
If scopes overlap and neither authority dominates the other, the combined state cannot safely be reduced to one winner without an explicit rule.

Candidate conservative projection:
- preserve both histories;
- compute overlap;
- if overlap is unresolved, current claim state = UNKNOWN.

## E — scope-sensitive composition

Revocations should be evaluated against exact target scope.

R1: revoke credential X for service S.
R2: revoke credential X globally.

These are not necessarily conflicting; R2 may subsume R1.

Conversely:
R1: revoke X for S.
R2: restore X for T.

They conflict only if S and T overlap under the applicable identity/resource semantics.

Therefore conflict resolution must be scope-aware, not identifier-only.

## F — cancellation versus supersession

"R1 is cancelled" and "R2 supersedes R1" are different semantic operations.

Cancellation may negate current effect while preserving historical issuance.
Supersession may replace the applicable rule while leaving R1 historically valid.

A resolver that maps both to DELETE(R1) loses auditability and can break reconstruction.

Candidate distinction:
CANCEL != SUPERSEDE != ERASE.

## G — epoch and incarnation boundaries

R1 may apply to source incarnation i1 during authority epoch e1.
R2 may concern i2/e2.

A resolver that merges by stable identifier alone can create false conflict.

Therefore conflict identity must include at least:
TargetIdentity + SourceIncarnation + AuthorityEpoch + Scope + EffectiveInterval.

## H — delayed conflict events

If R2 arrives after a decision based on R1, the resolver must not assume R2 is semantically later merely because it arrived later.

A provenance model with explicit event ordering can distinguish these cases. W3C PROV explicitly models ordering constraints rather than treating records as an unordered bag. citeturn1search0turn1search12

Historical decision records should remain historical; current projection may change if the late evidence is admissible.

## I — emergency/ordinary intersection

Emergency authority may dominate ordinary authority only within its declared domain.

Three cases must remain distinct:
1. emergency explicitly dominates ordinary for this scope;
2. emergency and ordinary are independent/incomparable;
3. emergency authority itself is disputed or expired.

Only case 1 permits deterministic precedence without adding unsupported semantics.

## J — conflict resolver becomes a trust root

A resolver R that decides "which revocation wins" can itself become a common-mode dependency.

If every authority feeds one resolver whose policy/configuration is the sole source of precedence, apparent independence among authorities may collapse at R.

Therefore:
RESOLVER OUTPUT != INDEPENDENT EVIDENCE.

The resolver's policy, version, authority, inputs, dependencies and epoch become evidence-bearing.

## K — conflict persistence

Resolving R1/R2 at epoch e1 does not prove that their relation remains valid at e2.

Authority changes, delegation revocation, scope changes and source reincarnation can reopen a previously resolved conflict.

Thus:
RESOLVED AT E1 != PERMANENTLY RESOLVED.

## L — conservative conflict state

Candidate state machine for research purposes only:
- NO_CONFLICT
- DOMINATED
- SUBSUMED
- INCOMPARABLE
- CONFLICT
- UNKNOWN_DUE_TO_MISSING_AUTHORITY
- UNKNOWN_DUE_TO_MISSING_SCOPE
- UNKNOWN_DUE_TO_MISSING_TEMPORAL_ORDER
- UNKNOWN_DUE_TO_MISSING_DEPENDENCY

These labels are not yet a Nexo implementation or frozen protocol.

## M — minimum semantic boundary for conflict resolution

For a deterministic current projection, the resolver would need:
- canonical target identity/incarnation;
- exact scope relation;
- authority relation and delegation;
- authority epoch;
- effective event interval/order;
- operation semantics (cancel/supersede/revoke/etc.);
- admissible conflict-precedence rule;
- provenance closure for the rule itself;
- revocation state/dependency closure;
- common-mode dependency analysis;
- retention/reconstruction sufficient to reproduce the result.

If any claim-relevant boundary is unresolved, UNKNOWN is safer than fabricated precedence.

## Key distinctions

TOTAL ORDER != JUSTIFIED PRECEDENCE
PARTIAL ORDER != COMPLETE SEMANTICS
LATTICE COMPLETENESS != AUTHORITY CORRECTNESS
INCOMPARABLE != CONFLICT-FREE
SCOPE SUBSUMPTION != IDENTICAL REVOCATION
CANCEL != SUPERSEDE != ERASE
RESOLVED AT E1 != PERMANENTLY RESOLVED
RESOLVER OUTPUT != INDEPENDENT EVIDENCE
DETERMINISTIC OUTPUT != PROVEN CORRECTNESS

## Result

FOUND:
- total precedence can fabricate unsupported winners;
- partial orders preserve incomparability but do not themselves establish semantic completeness;
- lattice structure cannot substitute for authority semantics;
- scope-sensitive overlap is necessary to distinguish real conflicts from disjoint effects;
- cancellation, supersession and erasure must remain distinct;
- epoch/incarnation binding prevents false conflicts across historical identities;
- delayed events require semantic ordering, not arrival ordering;
- emergency precedence is valid only when explicitly authorized for the relevant scope;
- the resolver itself can become a common-mode trust dependency;
- a conflict resolved at one epoch can reopen later.

NOT CLOSED:
- FutureObs_PAA;
- P_AA quotient congruence;
- complete authority algebra;
- complete conflict-resolution semantics;
- R1-R5 completeness/minimality;
- dependency/TCB/evidence reducer completeness;
- independence/quorum completeness;
- retention/reconstruction soundness.

NOT PERFORMED:
- implementation;
- formal verification;
- runtime/fault injection;
- V21;
- semantic freeze.

## Global epistemic state — preserve exactly

P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover remains unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission — GLOBAL-AUDIT-055

Attack **revocation precedence algebra and monotonicity**:
- whether conflict resolution can be monotone under new evidence;
- when adding evidence must reopen UNKNOWN;
- whether supersession forms a safe partial order;
- scope union/intersection/subsumption edge cases;
- contradictory emergency and ordinary decisions;
- precedence changes across authority epochs;
- whether any proposed algebra preserves historical decisions while updating current projections;
- adversarial counterexamples to deterministic resolution.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.
