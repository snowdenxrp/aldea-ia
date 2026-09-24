# NEXO V1–V20 RE-AUDIT AGAINST NORMALIZED SEMANTICS V1 — 2026-09-24

Status: RESEARCH / PRE-CONSTRUCTION RECONCILIATION
Decision: ARCHITECTURE REMAINS BLOCKED

## 1. Audit rule

Every historical mechanism is reclassified against the normalized vocabulary established after the second-order gap pass.

The historical artifacts remain immutable lineage. This document does not rewrite them.

New rule:

HISTORICAL CLAIM
→ CANONICAL SEMANTIC MAPPING
→ DEPENDENCY / ASSUMPTION CHECK
→ CLAIM / EVIDENCE CHECK
→ DISPOSITION.

NIST's systems-security engineering guidance emphasizes lifecycle traceability from protection needs and requirements through architecture, verification methods, evidence and baselines. This re-audit therefore treats historical lineage as evidence-bearing design history rather than as an automatic source of current guarantees. citeturn0search24turn0search7

## 2. Disposition vocabulary

CARRY_FORWARD = semantic mechanism survives substantially unchanged.
REWORK = useful intent survives but mechanism/semantics must change.
REJECTED = must not enter clean architecture.
HISTORICAL_ONLY = retained as lineage/evidence, not architecture.
OPEN = cannot yet be safely classified as an implementation guarantee.

A historical PASS never overrides a current OPEN dependency.

## 3. V1–V3

V1 useful semantics:
- authority separation;
- execution separation;
- unknown-state concept;
- protected transitions.

V1 lacked external-effect identity, freshness, explicit evidence and concrete linearization.
Disposition: authority separation, unknown blocking and state separation CARRY_FORWARD; implicit atomicity and model-as-implementation-proof REJECTED; model HISTORICAL_ONLY.

V2 strengthened state/authority boundaries but remained insufficient on object identity and transition ownership.
Disposition: semantic mechanisms CARRY_FORWARD; model HISTORICAL_ONLY.

V3 audit findings included unconsumed release authorization, overly global STOP, global authority epoch, incomplete invalidation, global reconciliation generation, absent external-effect state and implicit linearization.
Disposition:
- consumed authorization → CARRY_FORWARD;
- exact authority context → CARRY_FORWARD;
- global authority epoch as universal mechanism → REWORK;
- global reconciliation generation → REWORK;
- implicit linearization → REJECTED;
- external-effect state → CARRY_FORWARD;
- STOP as global execution switch → REWORK;
- model → HISTORICAL_ONLY.

## 4. V6–V8

V6 protected-transition direction is CARRY_FORWARD; concrete model HISTORICAL_ONLY.

V7 executable-model and configuration awareness are CARRY_FORWARD; specific model HISTORICAL_ONLY.

V8 toolchain audit found unavailable/unchecked Java/TLA tooling, syntax problems and undefined record sets.
Critical normalized rule:
DESIGNED != TOOLCHAIN-CHECKED.
Toolchain discipline CARRY_FORWARD; V8 executable status REJECTED; model HISTORICAL_ONLY.

## 5. V9

Useful:
- durable historical commit survives later revocation;
- explicit authority requirements;
- separate external-effect concern.

Problems:
Observe could write APPLIED directly; provenance was too weak; active-work/history distinction incomplete.

Disposition:
- historical commit persistence → CARRY_FORWARD;
- Observe⇒APPLIED → REJECTED;
- provenance boolean → REJECTED;
- observed/verified world-state separation → CARRY_FORWARD;
- model → HISTORICAL_ONLY.

Canonical rule:
OBSERVED != VERIFIED != COMMITTED.

## 6. V10

Useful:
- lease ownership/generation;
- expiry/takeover concept;
- stale-owner concern;
- STOP dominance.

Problems:
expiry semantics incomplete; release authorization ambiguous; execution-expiry semantics incomplete; lease risked being conflated with authority.

Disposition:
- lease as coordination → CARRY_FORWARD;
- generation/fencing → CARRY_FORWARD;
- lease as authority → REJECTED;
- lease as external truth → REJECTED;
- expiry alone as safety proof → REJECTED;
- stale-owner fencing → CARRY_FORWARD;
- model → HISTORICAL_ONLY.

## 7. V11

Problems:
generic table parameters not bound to actual variables; no concrete stale-owner enforcement; non-negativity mistaken for monotonicity; vacuous expiry.

Disposition:
- explicit variable binding requirement → CARRY_FORWARD;
- non-negativity as monotonicity proof → REJECTED;
- generic lease abstraction → HISTORICAL_ONLY;
- current lease semantics → REWORK.

## 8. V14–V15

V14:
- concrete protected transitions → CARRY_FORWARD;
- safety-to-liveness inference → REJECTED;
- model → HISTORICAL_ONLY.

V15:
- time-based lease validity → CARRY_FORWARD;
- reliable time requirement → CARRY_FORWARD;
- lease validity as authorization → REJECTED;
- TLA atomicity as implementation linearizability → REJECTED;
- model → HISTORICAL_ONLY.

## 9. V16–V18

V16:
- reauthorization as new authority context → CARRY_FORWARD;
- revoked context cannot silently resume → CARRY_FORWARD;
- every historical counter independently necessary → OPEN;
- counter proliferation → REWORK.

V17:
- revoke/protected-commit ordering obligation → CARRY_FORWARD;
- vacuous proof → REJECTED;
- effect owner/generation/authority binding → CARRY_FORWARD.

V18:
- effect carries owner/generation/authority epoch → CARRY_FORWARD;
- current authorization check → CARRY_FORWARD;
- historical commit survives later revocation → CARRY_FORWARD;
- admin reauthorization abstraction → REWORK;
- model → HISTORICAL_ONLY.

## 10. V19

Useful:
- separate commit/revoke sequence concepts.

Problem:
two sequences did not establish total ordering.

Disposition:
- explicit ordering requirement → CARRY_FORWARD;
- sequence counters as proof of total order → REJECTED;
- model → HISTORICAL_ONLY.

## 11. V20

V20 introduced global clock-based ordering.

Useful:
- explicit abstract ordering;
- effect records authority epoch/order;
- revocation and reauthorization become ordered events.

Critical normalized correction:
ABSTRACT TOTAL ORDER != IMPLEMENTATION LINEARIZABILITY.
External world remains outside the abstract ordering.

Disposition:
- explicit ordering requirement → CARRY_FORWARD;
- global clock mechanism → REWORK;
- global clock as distributed-linearizability proof → REJECTED;
- external effect verification via internal clock → REJECTED;
- model → HISTORICAL_ONLY.

## 12. Cross-version findings

### X01 Global ordering

AUTHORITATIVE_ORDER is a protected serialization relation.

It may be implemented using clock, sequence, transaction, consensus or another mechanism, but no mechanism is semantically authoritative until implementation correspondence is proven.

Disposition: semantic requirement CARRY_FORWARD; V20 mechanism REWORK.

### X02 Epoch proliferation

Historical models introduced authority epoch, lease generation, commit sequence, revoke sequence, admin epoch and other epochs.

Retain a counter/epoch only if it has:
1. unique semantic meaning;
2. one authoritative owner;
3. explicit invalidation rule;
4. protected transition that changes it;
5. persistence/rollback semantics;
6. evidence requirement.

Otherwise collapse it into derived context or remove it.

Disposition: REWORK / MINIMIZE.

### X03 Lease

LEASE = coordination.
Never LEASE = authority.
Never LEASE = world truth.
Never LEASE = evidence.

Disposition: CARRY_FORWARD.

### X04 External effect

Canonical states:
NOT_ATTEMPTED
EXECUTING
UNKNOWN
PARTIALLY_APPLIED
APPLIED
REVERSED
RECONCILED.

UNKNOWN remains first-class.

Disposition: CARRY_FORWARD.

### X05 STOP

STOP becomes an independent safety fence:

STOP_REQUESTED
→ STOP_ENFORCING
→ EXECUTION_BLOCKED / ACTUATION_INTERRUPTED
→ STOP_VERIFIED
→ RECONCILIATION_REQUIRED.

Executor ACK cannot independently establish STOP_VERIFIED.

Disposition: REWORK into independent safety plane.

### X06 Recovery

RESTART != AUTHORITY.

Recovery requires current fence, current authority, current VersionSet, reconciliation, recovery owner and explicit release.

Disposition: CARRY_FORWARD / REWORK where implementation semantics remain open.

### X07 Evidence

Evidence must be context-bound, fresh, provenance-aware, dependency-aware and invalidatable.

LOGGED != OBSERVED
OBSERVED != VERIFIED
VERIFIED != TRUE IN ALL CONTEXTS.

Disposition: new evidence semantics CARRY_FORWARD; old evidence booleans REJECTED.

### X08 Formal verification

DESIGNED != SANY/TLC CHECKED != PROOF CHECKED != IMPLEMENTATION CORRESPONDENCE != RUNTIME VERIFIED.

Disposition: mandatory lifecycle rule CARRY_FORWARD.

## 13. Explicitly rejected from clean architecture

1. timeout ⇒ external effect did not happen;
2. new operation ID ⇒ resolves old UNKNOWN;
3. lease validity ⇒ external truth;
4. lease ownership ⇒ authority;
5. process restart ⇒ authority;
6. checkpoint restore ⇒ authority restore;
7. executor ACK ⇒ STOP verified;
8. signed/authenticated artifact ⇒ safety compatibility;
9. valid rollback image ⇒ safe rollback;
10. recovery image ⇒ automatically trusted recovery;
11. update journal ⇒ authority;
12. authenticated telemetry ⇒ world truth;
13. logged event ⇒ observed fact;
14. observed fact ⇒ verified fact;
15. different process ⇒ independent evidence;
16. different model ⇒ independent evidence;
17. different service ⇒ independent authority;
18. sequence counter ⇒ linearizability;
19. TLA atomic action ⇒ implementation atomicity;
20. formal correspondence by state names only;
21. formal checker PASS ⇒ runtime correctness;
22. proof cache flag ⇒ current proof validity;
23. TLC simulation ⇒ exhaustive model checking;
24. symmetry ⇒ harmless performance optimization;
25. liveness without explicit fairness;
26. negative claim without explicit evidence;
27. human approval without exact effect binding;
28. reward/metric ⇒ authority;
29. local success ⇒ mission success;
30. configuration change ⇒ automatically non-safety-relevant.

## 14. Carry-forward semantic baseline

A. exact operation/effect/target identity;
B. scoped versioned authority;
C. separate coordination;
D. protected transitions;
E. explicit linearization/equivalent serialization;
F. stale-actor fencing;
G. independent STOP plane;
H. recovery fence;
I. external UNKNOWN;
J. reconciliation;
K. evidence provenance/freshness/invalidation;
L. dependency/common-mode closure;
M. VersionSet compatibility;
N. claim-specific TCB;
O. information-flow restrictions;
P. formal refinement;
Q. runtime trace correspondence;
R. lifecycle/decommission semantics;
S. bidirectional traceability;
T. conservative failure handling.

## 15. Final open items from re-audit

R-A01 — choose minimum epoch/generation vocabulary.
R-A02 — define exact authoritative ordering mechanism.
R-A03 — prove implementation linearization correspondence.
R-A04 — define negative-evidence semantics.
R-A05 — define claim composition implementation.
R-A06 — define large-scale evidence invalidation.
R-A07 — define external reconciliation by provider semantics.
R-A08 — define trusted-time failure behavior.
R-A09 — define storage rollback detection.
R-A10 — define TCB compromise containment.
R-A11 — define resource starvation protections.
R-A12 — define migration semantics.
R-A13 — define long-duration rollover.
R-A14 — execute actual formal toolchain.
R-A15 — runtime trace/refinement tests.
R-A16 — fault injection.
R-A17 — architecture complexity minimization.

## 16. Reconciliation result

CARRY_FORWARD:
core safety semantics and distinctions.

REWORK:
global ordering implementation;
epoch/generation structure;
STOP integration;
recovery implementation;
authority lifecycle;
external reconciliation;
evidence infrastructure.

REJECTED:
historical shortcuts listed above.

HISTORICAL_ONLY:
V1–V20 concrete models as architectural source code.

OPEN:
R-A01 through R-A17.

No V1–V20 model is promoted wholesale into the clean architecture.

## 17. Pre-architecture status

Requirements baseline: NOT YET FROZEN.
Semantic vocabulary: SUBSTANTIALLY NORMALIZED.
Historical lineage: RECONCILED.
Evidence/observability: DEFINED, implementation OPEN.
Formal refinement: DEFINED, execution OPEN.
Atomicity: DEFINED, topology/protocol OPEN.
TCB: DEFINED, implementation closure OPEN.
Common-mode: DEFINED, runtime evidence OPEN.
Claims: DEFINED, composition implementation OPEN.
Assumptions: CLASSIFIED.
Failure composition: DEFINED, formal/fault coverage OPEN.

Architecture construction: BLOCKED.

Next required step:
build the final canonical requirements/invariant baseline from this reconciliation, then run one last architecture-from-requirements completeness audit before drawing the architecture.

No V21 implementation.
No silent migration.
No deletion of historical evidence.
No claim of verification.
