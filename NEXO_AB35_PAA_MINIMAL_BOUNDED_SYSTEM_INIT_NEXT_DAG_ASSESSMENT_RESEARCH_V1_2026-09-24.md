# NEXO AB35 — MINIMAL BOUNDED ABSTRACT SYSTEM, INIT/NEXT DERIVATION, DAG HISTORY, AND ASSESSMENT OBSERVATION V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+, no TLC, no TLAPS, no formal proof claimed.

## 1. AB34 continuity

AB34 was re-read. The surviving lower bound remains:
AuthorityContext + ResourceIncarnation + PolicyContext + DelegationContext + LeaseBridge + AdmissionBindingClass + claim-relevant auxiliary history.

The direct attack did not justify dropping any of these semantic roles. It also did not prove they are irreducible as physical variables.

## 2. External methodology cross-check

Lamport's official Auxiliary Variables material states that refinement mappings may require auxiliary variables that do not alter actual behavior, and explicitly distinguishes history variables from stuttering variables. The official TLA material defines a stuttering step as one leaving all relevant variables unchanged. The TLA notes describe the Reduction Theorem as reasoning about a fine-grained specification through a coarser one. These support our separation of semantic state, auxiliary history, and stuttering; they do not prove Nexo's model.

## 3. Smallest bounded candidate domains

For the first bounded mathematical system:

Subjects = {s0,s1}
Operations = {op0,op1}
Attempts = {a0,a1}
Resources = {r0,r1}
Incarnations = {i0,i1}
Epochs = {e0,e1}
Policies = {p0,p1}
Delegations = {d0,d1}
Bridges = {b0,b1}
Capabilities/Scopes = {c0,c1}
Protocol = {ATOMIC, LEASE, RECHECK}
Assessment = {TRUE_JUSTIFIED, FALSE, UNKNOWN}

Boundary is fixed to B0 = Z1 -> Z3.

This is deliberately finite and adversarial. It is not claimed sufficient for all implementations.

## 4. Semantic state

Candidate abstract state S:

AuthorityContext
ResourceIncarnation
PolicyContext
DelegationContext
LeaseBridge
AdmissionBindingClass
AdmissionAssessment

Auxiliary/history support H:

EventDAG
AdmissionRecords
HistoricalLinkage
RetainedEvidence

Important distinction:
AdmissionAssessment is an observation/result of the claim evaluation, not itself authority.

## 5. Event DAG instead of event log

Candidate history representation:

EventDAG = (V, E_precedes, E_binds, E_invalidates, E_bridges, E_consumes)

Each event carries only claim-relevant attributes.

The DAG is not intended to reproduce the entire implementation log.

It preserves only distinctions required to reconstruct P_AA-relevant:
- order;
- linkage;
- invalidation;
- bridge issuance/expiry;
- attempt identity;
- historical admission use.

A total timestamp sequence is unnecessary if a partial order is sufficient.

## 6. Admission observation operator

Define:

Obs_AA(H,S) = mapping from actual admission_id to Assessment_AA.

For each admission:
1. locate immutable AdmissionRecord;
2. resolve its actual linked authority and bridge;
3. reconstruct required binding;
4. evaluate current/historical validity under the claim's temporal scope;
5. evaluate protocol validity;
6. return TRUE_JUSTIFIED, FALSE, or UNKNOWN.

Unknown is returned whenever a required distinction cannot be soundly reconstructed.

The observation is admission-indexed rather than a single global Boolean.

## 7. UNKNOWN propagation

UNKNOWN must propagate when a decisive P_AA predicate cannot be established.

Examples:
- unknown revocation order;
- unknown bridge-to-admission linkage;
- unknown incarnation at admission;
- unknown policy compatibility;
- unknown delegation validity;
- unknown replay state;
- unknown admission linearization.

But UNKNOWN must not automatically propagate when an independent complete witness proves the required condition without relying on the missing distinction.

Thus UNKNOWN propagation is dependency-sensitive, not syntactic contagion.

## 8. Init candidate

Init must establish:
1. all domains are finite and well-formed;
2. current contexts are internally coherent;
3. no admission is treated as justified without an actual AdmissionRecord;
4. every existing bridge has explicit bindings;
5. every existing admission has immutable linkage;
6. EventDAG is acyclic;
7. no abstract authority exists without a represented authority context;
8. all observations are computed conservatively.

Initial bridges, attempts, and admissions may be empty.

## 9. Next candidate

Next is a disjunction of:

AUTH_ISSUE
AUTH_REVOKE
EPOCH_ADVANCE
DELEGATION_CHANGE
POLICY_CHANGE
RESOURCE_REINCARNATE
LEASE_ISSUE
LEASE_EXPIRE
ATTEMPT_CREATE
RETRY
DECIDE
ADMIT
ABORT
STUTTER

Every action must:
- satisfy its Pre;
- update its Post;
- obey Frame;
- apply all relevant invalidations;
- append/extend EventDAG with the required relations;
- preserve immutable historical admission linkage;
- recompute affected assessments;
- return UNKNOWN when necessary distinctions become unrecoverable.

## 10. Candidate invariants

INV-01 — NO_AUTHORITY_AMPLIFICATION:
Every abstract authorization consequence has a concrete counterpart.

INV-02 — ACTUAL_LINKAGE:
Every assessed admission uses its actual linked authority/bridge context.

INV-03 — INCARNATION_BINDING:
A bridge bound to an old resource incarnation cannot silently authorize a new incarnation.

INV-04 — CURRENT_AUTHORITY:
Current admission authorization depends on current authority semantics, not merely historical issuance.

INV-05 — HISTORICAL_LINKAGE_IMMUTABILITY:
Later events do not rewrite what authority/bridge an earlier admission actually used.

INV-06 — UNKNOWN_SOUNDNESS:
Missing required distinctions never become TRUE_JUSTIFIED by default.

INV-07 — PROTOCOL_SOUNDNESS:
AdmissionProtocolValid is evaluated according to the actual protocol semantics.

INV-08 — RETRY_BINDING:
Retry cannot silently substitute or inherit an authorization context unless the explicit protocol permits it.

INV-09 — ORDER_SOUNDNESS:
All P_AA-relevant order relations are retained or derivable.

INV-10 — BOUNDARY:
The model does not infer Z4 external effect from Z1->Z3 admission.

## 11. 2-event trace basis

Minimum attacks:
AUTH_REVOKE -> ADMIT
EPOCH_ADVANCE -> ADMIT
POLICY_CHANGE -> ADMIT
DELEGATION_CHANGE -> ADMIT
RESOURCE_REINCARNATE -> ADMIT
LEASE_EXPIRE -> ADMIT
RETRY -> ADMIT
DECIDE -> ADMIT

Each must be tested with matching and nonmatching bindings.

## 12. 3-event trace basis

Minimum joint attacks:
POLICY_CHANGE -> DELEGATION_CHANGE -> ADMIT
DELEGATION_CHANGE -> REINCARNATE -> ADMIT
LEASE_ISSUE -> POLICY_CHANGE -> ADMIT
LEASE_EXPIRE -> RETRY -> ADMIT
DECIDE -> REVOKE -> ADMIT
RETRY -> LEASE_RENEW -> ADMIT

Also test permutations where the same events occur in different partial orders.

## 13. DAG minimization criterion

An event or edge can be removed from EventDAG only if:
for every allowed future continuation, Obs_AA remains equivalent, or the abstraction explicitly becomes UNKNOWN.

This is stronger than:
- event no longer visible;
- event is old;
- event is compensated;
- event has no immediate effect.

## 14. Important result: DAG is a representation candidate, not a new semantic domain

The semantic object remains the claim-relative history/order/linkage needed by P_AA.

An EventDAG is one possible encoding.

Therefore:
SEMANTIC PARTIAL ORDER != REQUIRED GRAPH DATA STRUCTURE.

A future implementation may use another compact structure if it preserves the same observable behavior and refinement obligations.

## 15. Assessment is not authority

AdmissionAssessment must not feed back into AuthorityContext unless a separate, explicit policy says that an assessment is itself an authorization input.

Otherwise this creates a semantic cycle:
assessment -> authority -> assessment.

The current kernel treats assessment as observation.

## 16. First bounded safety target

The first model should not attempt all of Nexo.

It should model only:
Z1 authorization/admission safety
at Z1 -> Z3
with Z4 effect outside the claim.

The target safety condition is:
every concrete admitted event has an assessment that is either TRUE_JUSTIFIED under the kernel or, where the model deliberately abstracts away a decisive distinction, UNKNOWN rather than an unsound TRUE_JUSTIFIED.

A separate model will eventually be required for external effect/enforcement claims.

## 17. Readiness assessment

The mathematical shape is now sufficiently constrained to draft a first abstract TLA+ module.

However, two things remain before treating that module as stable:
1. exact representation of EventDAG relations and admission linkage;
2. exact refinement observation function and UNKNOWN semantics.

Therefore AB35 reaches:
TLA+ DRAFT-READY,
not:
TLA+ VERIFIED.

## 18. AB36 frontier

1. Draft the first abstract TLA+ module as a research artifact only.
2. Keep the model finite and claim-scoped.
3. Encode EventDAG relations without assuming total time.
4. Encode actual admission linkage explicitly.
5. Encode UNKNOWN as assessment state, not world truth.
6. Define Init, Next, and candidate invariants.
7. Run no claim of correctness until TLC actually executes.
8. After drafting, adversarially inspect the TLA+ semantics before model checking.
