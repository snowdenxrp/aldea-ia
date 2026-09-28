# NEXO GLOBAL AUDIT-048 — DEPENDENCY GRAPH CLOSURE

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: research/audit artifact only

## Boundary

Attack the GLOBAL-AUDIT-047 evidence-dependency model at graph-closure level:
- cycles and self-reference;
- reducer termination without silently dropping dependencies;
- multiple paths to one root;
- dynamic dependencies introduced by reconstruction;
- dependency identity across epoch/incarnation changes;
- finite closure versus complete TCB boundary.

No Nexo implementation, V21, or formal verification is performed.

## Primary external evidence

W3C PROV defines validation over provenance instances and explicitly checks event-order graphs for cycles containing strict-order edges. It also defines normalization with a termination condition and a normal-form result. Importantly, PROV states that there is no inference making derivation transitive, so a consumer cannot safely assume that an immediate provenance relation represents the full transitive dependency closure. PROV also models bundles as entities so provenance-of-provenance can itself be represented. These are useful reference constraints, not a proof of Nexo's eventual dependency semantics.

## Attack A — cycle in dependency/provenance graph

A graph containing A -> B -> C -> A cannot be treated as an ordinary acyclic dependency DAG.

A naive recursive reducer can:
- recurse indefinitely;
- revisit nodes and double count;
- terminate by silently cutting one edge;
- or arbitrarily select a partial closure.

Candidate rule:
cycles must be detected as an explicit graph condition. A cycle must not be silently converted into an acyclic interpretation.

For a claim whose dependency closure crosses an unresolved cycle, the conservative result is UNKNOWN unless a separately defined fixed-point semantics proves the cycle harmless.

## Attack B — self-reference

A provenance record can claim that its own admissibility depends on a transformation whose validity depends on that same record.

Self-reference is especially dangerous when the record is being used to establish its own completeness or semantic preservation.

Candidate rule:
a claim cannot establish its own admissibility solely through a dependency path that returns to the claim/evidence node without an independently trusted base.

## Attack C — multiple paths to one root

E1 -> R and E2 -> R does not represent two independent roots.

A graph reducer that counts paths instead of unique underlying dependencies can inflate evidence.

Therefore closure should be computed over canonical dependency identities/nodes, with path multiplicity retained only as provenance information, not as independent evidentiary weight.

This extends GLOBAL-AUDIT-047's distinction:
DIFFERENT RECORDS != DIFFERENT EVIDENCE.

## Attack D — dynamic dependencies from reconstruction

A reconstruction operation can discover additional dependencies not visible in the summary itself:
- a missing predecessor;
- a historical checkpoint;
- an epoch transition record;
- a revocation/invalidation event;
- an external outcome needed to interpret an operation.

Therefore a summary's declared dependency list cannot automatically be treated as complete merely because reconstruction succeeded.

Candidate state:
RECONSTRUCTED_WITH_UNRESOLVED_DEPENDENCIES must remain distinct from COMPLETE_RECONSTRUCTION.

A reconstruction procedure should emit the dependency identities it actually consulted and the completeness boundary under which the result is valid.

## Attack E — epoch/incarnation identity

A dependency identity such as Resource-7 is insufficient if Resource-7 can have multiple incarnations.

Dependency identity must bind the relevant incarnation/epoch when claim semantics depend on it.

Candidate identity:
LogicalResourceID + IncarnationID + relevant Epoch(s).

This preserves the 041-045 historical-binding requirement.

## Attack F — finite closure does not prove complete closure

A reducer can terminate after traversing a finite set of records while still being incomplete if:
- an omitted edge exists;
- a dependency is represented only indirectly;
- an authority boundary is assumed rather than declared;
- reconstruction dynamically reveals another dependency;
- historical retention removed a required distinction.

Therefore:
TERMINATED != COMPLETE.

A finite closure is claim-complete only relative to an explicit completeness contract and authoritative boundary.

## Attack G — TCB boundary

The dependency traversal must terminate somewhere.

If the system treats every provenance assertion as requiring another provenance assertion indefinitely, closure has no finite stopping point.

A practical model needs an explicit authoritative trust boundary/TCB whose assumptions are declared. But TCB existence alone does not prove TCB completeness.

Candidate statuses:
- CLOSED_AT_TCB — traversal reached a declared boundary and all claim-required dependencies are accounted for;
- OPEN — more dependencies may exist;
- CONFLICT — incompatible dependency histories;
- CYCLIC — unresolved dependency cycle;
- UNKNOWN — closure/completeness cannot be established.

These are candidate semantic states, not implementation.

## Candidate closure contract

For claim C, a dependency closure is admissible only if:
1. every traversed dependency has stable identity;
2. relevant derivation/provenance edges are explicit;
3. duplicate paths resolve to shared dependency identity;
4. cycles are detected and not silently pruned;
5. dynamic reconstruction dependencies are recorded;
6. epoch/incarnation bindings are preserved;
7. traversal reaches a declared boundary;
8. completeness of the boundary is established for C, or the result remains UNKNOWN.

## Key new distinction

TERMINATED CLOSURE != COMPLETE CLOSURE.

ACYCLIC TRAVERSAL != SEMANTIC COMPLETENESS.

DECLARED TCB != PROVEN TCB COMPLETENESS.

## Epistemic status

FOUND:
- dependency cycles cannot be silently pruned;
- self-reference cannot bootstrap its own admissibility;
- path multiplicity must not become evidence multiplicity;
- reconstruction can introduce dynamic dependencies;
- dependency identity must preserve epoch/incarnation where relevant;
- finite termination does not establish semantic completeness;
- closure needs an explicit trust boundary.

NOT PROVEN:
- complete dependency graph algebra;
- complete closure algorithm;
- P_AA quotient congruence;
- FutureObs_PAA;
- R1-R5 completeness/minimality;
- TCB completeness;
- evidence-reducer completeness;
- independence proof;
- quorum/retention/reconstruction soundness.

NOT PERFORMED:
- formal verification;
- executable implementation;
- runtime/fault injection;
- V21.

## Global epistemic state — unchanged

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

## Next exact mission — GLOBAL-AUDIT-049

Attack the boundary between dependency closure and claim reduction:
- monotonic versus non-monotonic evidence addition;
- whether adding evidence can invalidate a previously concrete claim;
- late-arriving revocation/invalidation;
- negative evidence and absence claims;
- temporal closure and FutureObs interaction;
- whether a reducer must support retraction/recomputation.

No implementation. No V21. Preserve UNKNOWN unless closed by evidence.
