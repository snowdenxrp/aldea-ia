# NEXO AB29 — P_AA DEPENDENCY GRAPH, JOINT ORDER CLOSURE, OBSERVATION FUNCTION, AND FIRST SIMULATION OBLIGATION RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. External cross-check
Lamport's official material confirms that history variables can preserve past information needed by a refinement mapping, that stuttering is relative to relevant variables, and that refinement can be checked as a mapping from lower-level behavior to higher-level behavior. His reduction-theorem material also explicitly concerns reasoning about a fine-grained specification using a coarser-grained one. These sources support the current direction but do not prove this Nexo abstraction.

## 2. Concrete dependency graph
Use a labeled graph over P_AA-relevant event instances, not merely event types.
Each event node carries: event_id, type, subject, operation, attempt, resource, incarnation, authority_epoch, policy_context, delegation_context, bridge_id, protocol_class, boundary.
Candidate edge labels:
PRECEDES_AA — required relative order for P_AA.
BINDS — event establishes/uses the same claim-relevant entity.
INVALIDATES — event can invalidate a prior context.
BRIDGES — event participates in carrying authorization to admission.
CONSUMES — event changes replay/one-use state.
CAUSES — separate causal relation, never inferred from PRECEDES_AA.

## 3. Admission-centered dependency closure
For each actual admission record a, define DepClosure_AA(a) as the least joint closure containing:
- the admission event;
- the actual authority context used by the admission;
- the actual binding tuple;
- the protocol bridge used;
- every event that can change validity of that authority/bridge/binding before admission;
- every event needed to establish replay, attempt, incarnation, policy, delegation, or boundary semantics.

Important: closure is joint. Taking the union of independent pairwise closures is not assumed sound.

## 4. Order-edge classification
Candidate edge classes:
E1 direct necessity — reversing the pair can change P_AA.
E2 transitive necessity — relation follows from already-required edges.
E3 protocol necessity — order is required by the admission protocol even when current values match.
E4 history-support necessity — order is needed to reconstruct an omitted distinction.
E5 irrelevant — changing order cannot affect P_AA under the modeled assumptions.
E6 unknown — relevance cannot be established; retain or return UNKNOWN rather than delete.

Only E1-E4 may justify retaining order. E2 need not be physically stored if the representation preserves the path.

## 5. Exact observation candidate
Obs_AA(h) = an admission-indexed mapping from each actual admission record to its P_AA assessment, with UNKNOWN when the retained representation cannot establish a required distinction.
Candidate assessment values remain: TRUE_JUSTIFIED, FALSE, UNKNOWN, with provenance flags for history-incomplete, dependency-unknown, authority-unresolved, boundary-unresolved, and concretization-pending.

This avoids confusing a missing distinction with a false admission.

## 6. Observation sequence versus set
An unordered set of assessments is insufficient if admission identity or historical attribution is claim-relevant.
A raw sequence is potentially too strong because irrelevant internal ordering can differ.
Therefore the current candidate is an admission-keyed partial observation structure rather than a plain list or plain set.

## 7. First simulation obligation
Candidate relation R_AA(Hc,Ha):
1. current P_AA semantic context represented;
2. every actual admission in Hc has a corresponding abstract admission key;
3. UsedAdmissionContext is preserved, not reconstructed from mere validity;
4. required order edges are preserved or derivable;
5. bridge, replay, invalidation, and binding relations are preserved;
6. each concrete P_AA-relevant step has an abstract matching step, or is proven stuttering relative to the abstract observation and future support;
7. no abstract authority consequence exists without a concrete counterpart;
8. if correspondence is unresolved, assessment is UNKNOWN/PENDING rather than silently accepted.

## 8. Forward versus exact refinement
For a safety-only abstraction, the first target should be forward simulation/refinement sufficient to show that concrete admitted states cannot violate the abstract P_AA safety condition.
An exact quotient requires more: matching observations in both directions under the chosen future-continuation semantics.
Therefore the immediate formal target is forward simulation, while exact bisimulation remains a later optional strengthening.

## 9. Joint-order attack
CM-AA201 — pairwise closure union misses a three-event dependency.
CM-AA202 — transitive edge is removed and the path is also lost.
CM-AA203 — order preserved but binding endpoint changed.
CM-AA204 — binding preserved but protocol bridge changed.
CM-AA205 — same observation now, future continuation differs.
CM-AA206 — unknown history compressed to FALSE.
CM-AA207 — unknown history compressed to TRUE.
CM-AA208 — causal label inferred from precedence.
CM-AA209 — replay consumption omitted from closure.
CM-AA210 — admission identity omitted from observation key.

## 10. Kernel factorization attack
Test whether Ord_AA can be decomposed as:
Ord_AA = Order(AdmissionBindingClass) + Order(LeaseBridge) + ResidualOrder.
The residual is empty only if all P_AA-relevant order distinctions are recoverable from the first two components under every future continuation.
No such factorization is proven yet.

## 11. TLA+ readiness condition
The model is not ready merely because the variables have names.
Before drafting the first TLA+ module we need:
- fixed abstract state vocabulary;
- fixed action semantics;
- fixed observation function;
- fixed simulation relation;
- bounded domains;
- explicit treatment of UNKNOWN;
- explicit protocol class semantics;
- explicit history variables required by the mapping.

Lamport's official examples show refinement mappings and history/stuttering variables as proof machinery, and TLC can be used to expose mistakes in the mapping; this is methodology, not evidence that the Nexo model has already been verified.

## 12. Result
AB29 converts the previous informal order discussion into a dependency-graph candidate and an initial forward-simulation obligation.
Most important new result: the order structure is not an isolated timeline. It is a labeled, binding-aware, admission-centered relational closure.

## 13. AB30 frontier
1. Construct explicit 2-event and 3-event dependency tables.
2. Enumerate minimal countermodels for every edge class E1-E6.
3. Attack the proposed admission-keyed observation function.
4. Test whether UNKNOWN can safely be represented as an abstract value without collapsing truth states.
5. Attempt kernel factorization of Ord_AA into LeaseBridge, AdmissionBindingClass, and residual history.
6. Only if stable, freeze the first abstract state/action vocabulary for TLA+.