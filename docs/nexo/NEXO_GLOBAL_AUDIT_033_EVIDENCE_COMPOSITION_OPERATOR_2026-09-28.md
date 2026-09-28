# GLOBAL-AUDIT-033 — SEMANTIC EVIDENCE COMPOSITION OPERATOR — 2026-09-28

## Objective
Define and adversarially test a claim-scoped composition operator for evidence/witnesses.

## Candidate operator
Let each witness W denote a claim-relative constraint set plus provenance/dependency context. Define W1 ⊗C W2 only when:
1. claim contracts are compatible;
2. identity/incarnation/generation domains are compatible;
3. temporal/order constraints are jointly satisfiable;
4. dependency sets are complete for the asserted properties;
5. common-mode assumptions are compatible;
6. there exists at least one legal concrete history satisfying both witness constraints.

If compatibility cannot be established, result is UNKNOWN rather than TRUE.
If the conjunction is demonstrably inconsistent in a way that violates the claim, result is FALSE for that claim; mere empty evidence intersection is not automatically FALSE.

## Property attacks
### Associativity
Raw field intersection is not guaranteed associative at the semantic layer because compatibility may depend on provenance/history context. A properly defined constraint-set conjunction over a common semantic universe can be associative, but only if normalization preserves all context needed for satisfiability.

Status: CONDITIONAL, not established universally.

### Commutativity
For pure conjunctive constraints, semantic conjunction is commutative. Operational evidence acquisition order must not change claim meaning. If acquisition order changes freshness or invalidation, the evidence objects must retain timestamps/generations so semantic composition can distinguish them.

Status: CONDITIONAL on context preservation.

### Monotonicity
Adding information is not universally monotone with respect to epistemic status. New evidence can reveal contradiction or invalidate an earlier witness, changing TRUE candidate to UNKNOWN/FALSE. Safe monotonicity is therefore about narrowing the consistent-history set only when the new evidence is authenticated, context-bound and compatible; it is not monotonic growth of TRUE.

### UNKNOWN propagation
UNKNOWN is claim-relative. An UNKNOWN component propagates when it covers a necessary obligation and no independent evidence discharges it. UNKNOWN need not propagate when the unknown concerns an irrelevant property or is discharged by a complete alternative proof path.

## Algebraic consequence
There is no unconditional Boolean semiring for evidence composition. The correct operator is a claim-scoped partial/three-valued semantic composition over constraint sets and provenance.

Candidate semantic representation:
W = <ClaimContract, Constraints, HistorySet, DependencySet, FailureDomains, Freshness, Completeness>

Composition intersects compatible HistorySets and unions required constraints/dependencies, while checking consistency and claim scope. If HistorySet is unknown because dependencies/order are incomplete, output remains UNKNOWN.

## Critical counterexample
W1 says authority A was valid at t1.
W2 says policy P was valid at t2.
If no ordering relation connects t1/t2 and the claim requires one admission interval, W1⊗W2 cannot be TRUE merely because each is TRUE independently.

## Gate
A composition operator can be used in bounded modeling only after the semantic universe, history satisfiability, dependency completeness and UNKNOWN rules are explicit.

Next: GLOBAL-AUDIT-034 — adversarial test of evidence revocation, freshness and temporal race conditions against the composition operator.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; composition algebra UNIVERSALITY UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
