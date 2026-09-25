# AB57 — EXECUTABLE OBSERVATIONAL / EVENTDAG GATE V1 — 2026-09-25

Status: IN PROGRESS / RESEARCH ONLY
Parent research frontier: AB56 (4a6af7089a5f8c0de47768c639959105639fc374)
AB57 executable harness commit: 7a2feb0f6a367f2c800685b3499df87ea8194364

## 1. Why AB57 was started

The deep audit found that AB55 did not execute the complete AB51/AB54 collision gate. AB56 specified the missing observational/EventDAG machinery but did not execute it.

This round therefore changes the research frontier from specification-only to an executable conservative harness. It does not rewrite AB55 or AB56.

## 2. Implemented

The new research-only Python harness adds:

- identity-bearing Binding tuples;
- identity-bearing UsedAdmissionContext;
- explicit CurrentObs at the ADMIT linearization point;
- explicit TRUE/FALSE/UNKNOWN outcomes;
- protocol event records with named reads/writes;
- conservative EventDAG generation from protocol-declared predecessor edges only;
- topological-order enumeration;
- lower-arity observation projection (unary + selected ordered pairs);
- a FutureObs_PAA interface that refuses to fabricate unspecified successor semantics;
- the existing eight highest-value ternary attacks;
- preservation checks for UsedAdmissionContext identity.

Important correction from the first draft: CurrentObs is sampled when ADMIT executes. Later mutations do not retroactively change the admission result. This avoids the AB55-style mistake of treating a terminal post-history state as the admission observation.

## 3. What this round does NOT claim

The harness is an executable research instrument, not semantic closure.

It does not yet have authoritative protocol rules for:

- LEASE_RENEW successor validity;
- RETRY inheritance / same-attempt semantics;
- MUTATION/RECHECK result linkage;
- complete legal continuation generation;
- complete concrete binding-value domain;
- complete EventDAG legality rules.

Therefore the full ternary P_AA collision question remains UNKNOWN.

The lower-arity projection currently contains an explicit bounded identity projection, but the complete AB51 lower-arity equivalence relation is not yet declared semantically complete.

## 4. Critical EventDAG discipline

The implementation intentionally does NOT turn every read/write overlap into a fixed DAG edge. Such an edge would silently convert an observation dependency into a protocol ordering rule.

Only explicit predecessor declarations create fixed edges. If the protocol later establishes an ordering rule, that rule can be added as evidence without rewriting prior results.

This preserves the AB56 distinction:

forced order != independent order != unknown order legality.

## 5. Research boundary after this round

The correct state is:

TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
IMPLEMENTATION = PARTIAL_RESEARCH_HARNESS
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED

## 6. Next executable closure work

The next implementation increment must replace the remaining placeholders, in this order:

1. define the canonical concrete binding-state value domain from already-persisted research;
2. define UsedAdmissionContext equality and projection from actual admission records;
3. define protocol-specific continuation legality without inventing missing semantics;
4. implement FutureObs_PAA as a set of all legal continuation observations, with UNKNOWN for unresolved legality;
5. generate lower-arity equivalence classes;
6. search each class for distinct ternary candidates;
7. run deterministic reconstruction;
8. only then classify a candidate as a protocol collision if a legal future continuation separates P_AA;
9. run the eight attacks;
10. broaden to all 286 triples only if the complete ternary gate is closed.

## 7. Non-loss checkpoint

AB55 and AB56 remain unchanged historical artifacts. This AB57 artifact records the execution boundary and the exact remaining semantic dependencies.

No claim is promoted from UNKNOWN to CLOSED in this round.
