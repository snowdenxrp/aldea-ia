# NEXO AB36R — PROTOCOL HISTORY SUPPORT LOWER BOUND RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. Objective
Define the minimum P_AA-relevant protocol history support needed to distinguish ATOMIC, LEASE and RECHECK behavior without prematurely retaining a physical ProtocolClass variable.

## 2. Complete protocol-history semantics
For a concrete admission q, candidate protocol history support contains only distinctions that can affect:
- actual admission linkage;
- authorization validity at the semantic admission point;
- linearization/order;
- lease interval validity, expiry, renewal and replay/consumption;
- recheck facts actually re-established;
- retry/attempt binding;
- invalidation by epoch, policy, delegation or incarnation;
- boundary constraints;
- future P_AA observations.

## 3. ATOMIC minimum candidate
A P_AA-complete ATOMIC history needs:
1. atomic linearization point or equivalent proof of no relevant interleaving;
2. actual authority/admission binding;
3. relevant authority/policy/delegation/incarnation context;
4. boundary.
A separate DECIDE event is unnecessary if the atomic semantic point is preserved and no future behavior distinguishes the hidden decomposition.

## 4. LEASE minimum candidate
A P_AA-complete LEASE history needs:
1. bridge identity or reconstructible bridge semantics;
2. issuance-to-admission relation;
3. authority context carried by the bridge;
4. subject/operation/attempt/resource/incarnation binding;
5. validity interval or equivalent freshness semantics;
6. expiry/revocation/renewal invalidation semantics;
7. replay/consumption semantics where retries are possible;
8. policy/delegation compatibility;
9. boundary.

## 5. RECHECK minimum candidate
A P_AA-complete RECHECK history needs:
1. actual admission linkage;
2. exact authority facts re-established;
3. exact policy/delegation/incarnation/scope facts re-established when P_AA-relevant;
4. recheck-to-admission ordering/linearization;
5. attempt binding;
6. boundary.
A generic recheck flag is not sufficient.

## 6. Deletion criterion
A history distinction d may be removed for P_AA only if for every pair of concrete histories differing only in d, all allowed future continuations produce the same P_AA observations, or the abstraction returns UNKNOWN whenever d becomes decisive.
This is behavioral quotienting, not event-log minimization.

## 7. CM-AA447 — atomic linearization deletion
Remove the atomic linearization point while preserving current fields. Permit a hidden revocation between decision and admission. P_AA splits. Therefore linearization is necessary unless equivalent atomicity is encoded elsewhere.

## 8. CM-AA448 — lease expiry deletion
Remove expiry/order support. Histories LEASE_EXPIRE→ADMIT and ADMIT→LEASE_EXPIRE become indistinguishable. P_AA splits. Expiry semantics are necessary.

## 9. CM-AA449 — lease renewal deletion
Remove renewal history. One history renews after authority invalidation and another does not. Future retry/admission behavior can split. Renewal semantics are necessary when renewal exists in the protocol.

## 10. CM-AA450 — lease consumption deletion
Remove consumption/replay history. Two retries can appear identical although one bridge has already been consumed. If replay is prohibited, P_AA can split. Consumption is conditional but necessary when protocol semantics depend on it.

## 11. CM-AA451 — recheck field deletion
Remove policy from the recorded recheck facts while preserving authority and resource. A policy change can distinguish histories. The omitted field is necessary when policy compatibility is claim-relevant.

## 12. CM-AA452 — recheck witness deletion
Remove actual UsedAuth linkage. A different valid authority can satisfy the recheck. Historical used-context becomes ambiguous and TRUE_JUSTIFIED is unsafe. Actual witness linkage is necessary.

## 13. CM-AA453 — attempt deletion
Collapse attempts to operation identity. Retry can inherit or substitute authorization incorrectly. Attempt identity is necessary whenever authorization is attempt-scoped.

## 14. CM-AA454 — incarnation deletion
Collapse resource incarnation to resource_id. Resource reincarnation can make an old bridge or authority context invalid. Incarnation is necessary.

## 15. CM-AA455 — protocol history false compression
Two histories have identical LeaseBridge and AdmissionBindingClass fields, but one contains an event that changes future replay behavior. If future observations differ, field equality is not behavioral equivalence.

## 16. Semantic lower bound
The surviving lower bound is not a fixed list of event records. It is a set of behavioral distinctions:
- admission linkage;
- authorization context;
- linearization/order where relevant;
- protocol validity interval/point;
- replay/consumption where relevant;
- invalidation context;
- attempt binding;
- resource incarnation;
- boundary;
- future-observation support.

## 17. ProtocolClass conclusion
No countermodel establishes that a literal ProtocolClass variable is required. Countermodels establish that protocol semantics are required. Therefore ProtocolClass may be eliminated only through a reconstruction function satisfying behavioral equivalence and conservative UNKNOWN behavior.

## 18. Candidate protocol support quotient
Let H1 ≈prot H2 iff:
1. same actual admission linkage;
2. same P_AA-relevant authority semantics;
3. same protocol-validity semantics at admission;
4. same relevant replay/expiry/renewal behavior;
5. same future P_AA observations for all allowed continuations;
6. same boundary/assumption contract.
ProtocolHistorySupport may store only the quotient class under this relation, if the relation is well-defined and transition-stable.

## 19. Transition stability requirement
If H1 ≈prot H2, every relevant concrete transition from H1 must have a corresponding transition from H2 preserving ≈prot, or both must conservatively move to UNKNOWN. Otherwise the quotient is not stable.

## 20. Result
The history lower bound is behavioral, not syntactic. We can remove individual event records, IDs, timestamps or protocol labels when their semantics are reconstructible and future behavior is preserved. We cannot remove the semantic distinctions that separate protocol-valid and protocol-invalid admissions or future P_AA observations.

## 21. AB36S frontier
1. Define exact protocol quotient relation over complete histories.
2. Test transition stability for all protocol-changing events.
3. Separate mandatory from conditional history dimensions.
4. Determine whether LeaseBridge + AdmissionBindingClass + quotient history fully reconstruct protocol semantics.
5. Attack cross-protocol quotient collisions.
6. Derive a candidate minimal semantic history domain before TLA+.
