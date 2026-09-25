# NEXO AB36Y — PROTOCOL RESIDUAL RELATIONAL QUOTIENT RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. External cross-check
Lamport explicitly describes history variables as remembering past facts not deducible from current state and as auxiliary variables that need not be implemented. This supports representing residual protocol support as auxiliary semantic structure when the concrete implementation state alone cannot express the refinement mapping. citeturn0search0turn0search1

## 2. Objective
Attack the remaining candidate ResidualProtocolHistory by replacing a bag of history fields with a claim-relative relational quotient over admissions, bridges, bindings, and relevant order/invalidation relations.

## 3. Candidate relational residual
Define:
RProto(a,b,E) = <AdmissionLink, BridgeLink, ProtocolValidity, OrderFacts, InvalidationFacts, FutureSupport>
where a is an actual admission context, b is the actual protocol bridge, E is the retained set of claim-relevant event relations.
This is a semantic relation, not a raw event log.

## 4. Admission-centered representation
A residual relation is relevant only through an actual admission or a future continuation that can create one. Unlinked historical events are removable if their removal cannot change any future P_AA observation or reconstructibility obligation.

## 5. Protocol validity relation
Candidate:
ProtoValid(a,b,h,t) is true only when the protocol semantics represented by h establish that b safely carries or re-establishes the authorization facts used by admission a at t.
This deliberately does not mean external effect occurred.

## 6. Atomic representation
For ATOMIC, the residual relation can be compressed to a linearization/no-interleaving fact:
AtomicPoint(a) = a semantic point at which all P_AA-relevant authorization conditions are jointly established for admission.
A separate DECIDE event is unnecessary if this point is reconstructible and no relevant interleaving exists.

## 7. Lease representation
For LEASE, the residual relation can potentially be absorbed into BridgeLink if BridgeLink reconstructs:
issuance-to-admission relation, validity interval, expiry, renewal semantics, replay/consumption, invalidation bindings, and future continuation rights.
If any of these remain ambiguous, residual order/history is required or the result becomes UNKNOWN.

## 8. Recheck representation
For RECHECK, the residual relation must preserve the exact set of authorization facts re-established and their binding to the actual admission. A Boolean recheck marker is insufficient.

## 9. Cross-protocol collision test
Three histories can share current visible fields:
H1 = ATOMIC with valid linearization;
H2 = LEASE with valid bridge but pending expiry/renewal semantics;
H3 = RECHECK with only a subset of facts re-established.
If the retained relational representation cannot distinguish their legal future transitions or protocol validity, they cannot share a quotient class.

## 10. Quotient candidate
H1 ≈res H2 iff:
1. same claim contract and boundary;
2. same actual UsedAdmissionContext modulo stable identity equivalence;
3. same ProtocolValidity result for corresponding admissions;
4. same relevant Order/Invalidation relations;
5. same FutureSupport for all allowed P_AA continuations;
6. same no-authority-amplification/refinement obligations.

## 11. FutureSupport is not a list of all futures
It is a semantic equivalence class of continuation capabilities relevant to P_AA. The implementation need not enumerate every future trace physically. It must preserve enough structure to establish future equivalence or expose UNKNOWN.

## 12. Residual relation versus EventDAG
EventDAG is a concrete/auxiliary representation. RProto is the semantic quotient derived from it. Multiple different DAGs may map to the same RProto class. Therefore minimizing EventDAG edges is not itself the semantic minimality problem.

## 13. Candidate absorption theorem
A residual dimension d may be absorbed into LeaseBridge or AdmissionBindingClass when a total reconstruction function exists and is:
- linkage preserving;
- protocol-validity preserving;
- order/invalidation preserving where relevant;
- transition preserving;
- future-observation preserving;
- non-amplifying;
- boundary preserving.

## 14. New attacks
CM-AA479: same bridge fields, different atomic linearization support.
CM-AA480: same bridge validity, different lease renewal capability.
CM-AA481: same binding class, different recheck fact set.
CM-AA482: same current assessment, different future continuation relation.
CM-AA483: same EventDAG projection, different semantic hyperedge.
CM-AA484: same current order, different invalidation relation.
CM-AA485: bridge/binding individually complete but jointly unable to reconstruct protocol semantics.
CM-AA486: residual quotient merges histories that diverge only after a future policy/delegation/incarnation change.

## 15. Key result
The residual should not be modeled as a seventh permanent state variable by default. The stronger candidate is a claim-relative relational quotient RProto whose physical realization may be an auxiliary history variable, a derived relation, or information already encoded in Bridge/Binding.

However, RProto itself remains semantically necessary until a proof or bounded exhaustive analysis shows that its obligations are reconstructible from R1.

## 16. Minimal semantic product candidate
SEM_AA* = AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + LeaseBridge + AdmissionBindingClass + RProto_support,
where RProto_support is the smallest representation needed to reconstruct protocol validity and future P_AA behavior.

## 17. Important lower-bound statement
We have not proved that RProto_support is nonempty for every protocol. ATOMIC may reduce to a linearization predicate; LEASE may reduce substantially into Bridge; RECHECK may reduce into a re-established-facts relation. The claim is only that the semantics cannot be discarded before reconstruction/future-equivalence obligations are discharged.

## 18. AB36Z frontier
1. Define the exact semantic quotient RProto as a relation over admission/bridge/event facts.
2. Derive its concrete-to-abstract mapping from EventDAG.
3. Attack whether each RProto component can be reconstructed from Bridge/Binding.
4. Search for minimal cross-protocol collision traces.
5. Define the reduced semantic product and its observation function.
6. Only then draft the next TLA+ state variables and refinement mapping.
