# GLOBAL-AUDIT-032 — EVIDENCE AGGREGATION AND WITNESS COMPOSITION — 2026-09-28

## Objective
Attack whether partial evidence supporting R1-R5 can be safely composed into a P_AA justification.

## Core finding
Evidence that proves individual properties does not automatically prove their conjunction. A composed claim requires joint realizability under one coherent admission history, identity/incarnation context, ordering, dependency closure and threat model.

## Counterexamples
1. Authority witness from history H1 + resource witness from H2: each individually valid, joint tuple unrealizable.
2. Current validity witness + historical binding witness: current validity does not prove validity at admission time.
3. Lease-valid witness + policy-valid witness from different generations: scalar validity bits can form an invalid joint context.
4. Recheck witness omitting a dependency changed after capture: stale evidence appears complete.
5. Two agreeing witnesses sharing a common-mode source: agreement does not establish independence.
6. Protocol witness without linearization/ordering: atomic validity cannot be inferred from protocol label.
7. Resource witness without incarnation: same resource ID may refer to different protected object generations.
8. Provenance witness with incomplete dependency capture: provenance exists but does not establish completeness.

## Composition contract
To combine witnesses W1..Wn for claim C, require:
- same claim contract and temporal scope;
- compatible identity domains;
- compatible resource incarnations;
- compatible authority/policy/delegation generations;
- compatible admission/attempt/bridge linkage;
- compatible authoritative order;
- complete dependency closure for the properties asserted;
- no unresolved common-mode dependency where independence is required;
- no hidden invalidation between witness capture and decision;
- reconstruction to one legal concrete history or explicit UNKNOWN.

## Three-valued composition
TRUE + TRUE is NOT automatically TRUE.
FALSE + anything remains FALSE only if the FALSE witness directly establishes the claim violation.
TRUE + UNKNOWN -> UNKNOWN when the unknown covers a claim-critical obligation.
UNKNOWN + UNKNOWN -> UNKNOWN.

A set of individually TRUE witnesses may still compose to UNKNOWN if they cannot be jointly realized in one admissible history.

## Anti-splicing invariant
NO_CROSS_HISTORY_WITNESS_SPLICING:
A TRUE_JUSTIFIED result may not be constructed by combining witnesses that are not shown jointly realizable under the same claim-relative history/context.

## Evidence promotion
Candidate promotion chain:
UNKNOWN -> OBSERVED -> AUTHENTICATED -> CONTEXT_BOUND -> VALIDATED_FOR_PROPERTY -> VERIFIED_FOR_CLAIM.
Promotion requires the evidence contract at each stage. Authentication alone does not establish freshness, completeness, historical validity or independence.

## R1-R5 composition
R1 AdmissionLink, R2 ProtocolValidity, R3 Order/Linearization, R4 Invalidation/Continuation, R5 FutureSupport are obligations. They can be physically packed, but each asserted obligation needs a proof/evidence contract and joint reconstruction condition.

## Result
Partial witness composition is safe only through a claim-scoped relational composition operator with compatibility and joint-realizability checks. A naive AND over booleans is unsound.

No formal proof or model execution yet.

Next: GLOBAL-AUDIT-033 — define the semantic composition operator and attack its associativity, commutativity, monotonicity and UNKNOWN propagation.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
