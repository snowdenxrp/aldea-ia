# NEXO GLOBAL AUDIT-060 — DELEGATION GRAPH COMPLETENESS / REVOCATION PROPAGATION
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Objective
Attack hidden or missing parent edges, multiple delegation paths, convergent descendants, partial-chain evidence, cross-domain delegation, scope composition, cycles/near-cycles, merged-chain revocation, reconstruction with missing branches, and common-mode graph indexes.

## External evidence
W3C PROV defines delegation relationships and requires provenance consistency; its validity model includes uniqueness, ordering and impossibility constraints. Ordering is represented as a graph and cycles containing a strict-precedence edge invalidate the provenance instance. citeturn0search1
UCAN 1.0 explicitly models delegation as hierarchical authority, attenuation, and revocation that invalidates a delegation and breaks a chain. Its delegation specification describes delegation as transfer of authority without transferring cryptographic keys. citeturn0search0turn0search3

## Findings

### A — graph completeness != traversal termination
A verifier can terminate while missing an undiscovered parent edge. Finite traversal therefore does not prove the delegation graph is complete.

### B — missing parent edge
If child C has authority but its parent/root cannot be established, C's current authorization cannot be upgraded merely from C's local signature. Missing ancestry => UNKNOWN for the affected claim.

### C — multiple paths
Two paths to C do not automatically provide two independent proofs. They may share the same root, credential, registry, delegation event or revocation source. Evidence overlap must be resolved before support is counted independently.

### D — convergent descendants
A and B may delegate to C. Revoking A should affect only the portion of C's authority actually dependent on A. Revoking B should not automatically invalidate A-derived authority. A single flattened C state can lose this distinction.

### E — partial-chain evidence
A valid-looking child certificate plus an incomplete ancestry record is not equivalent to a complete chain. Snapshot presence cannot substitute for missing historical links.

### F — cross-domain delegation
When authority crosses domains, the boundary requires explicit trust/translation semantics. A local scope name cannot automatically acquire the semantics of the destination domain.

### G — scope composition
Intersection, union, subsumption and attenuation across delegation edges require defined semantics. Partial overlap must not be converted into universal conflict or universal inheritance.

### H — cycles and near-cycles
A cycle cannot self-bootstrap authority. Near-cycles can also create hidden common dependencies where two apparent roots actually depend on one another. The graph must be analyzed for dependency closure, not merely reachability.

### I — merged-chain revocation
When multiple parent paths converge, revocation must propagate along dependency edges and scope, not by globally flipping the descendant. Historical decisions remain historical records while current authorization may change.

### J — missing branch reconstruction
If one branch of a convergent delegation graph is lost, reconstruction from the surviving branch can create a false complete graph. LossSet must remain evidence-bearing.

### K — graph index common-mode
A graph index used simultaneously for ancestry discovery, revocation propagation and independence analysis can become a common-mode dependency. Different queries against the same index are not independent evidence.

### L — current projection
Candidate current authorization requires:
TargetIdentity/Incarnation
+ Complete Relevant Parent Closure
+ Delegation Edge Semantics
+ Scope Composition
+ Authority Epoch
+ Validity Intervals
+ Revocation/Restoration Closure
+ Identity Resolution
+ Dependency/Common-Mode Analysis
+ Retention/Reconstruction evidence.

If relevant graph closure is unknown, current authorization remains UNKNOWN.

## Key distinctions
TRAVERSAL TERMINATION != GRAPH COMPLETENESS
LOCAL SIGNATURE != COMPLETE ANCESTRY
MULTIPLE PATHS != INDEPENDENT EVIDENCE
CONVERGENCE != UNIVERSAL DEPENDENCY
PARTIAL CHAIN != COMPLETE AUTHORITY
CROSS-DOMAIN NAME EQUALITY != SEMANTIC EQUALITY
SCOPE UNION/INTERSECTION != AUTOMATIC PRECEDENCE
REACHABILITY != AUTHORITY CLOSURE
CYCLE DETECTION != COMPLETE DEPENDENCY CLOSURE
SURVIVING BRANCH != COMPLETE HISTORY
GRAPH INDEX != INDEPENDENT EVIDENCE
DETERMINISTIC REVOCATION PROPAGATION != PROVEN SEMANTIC CORRECTNESS

## Result
FOUND:
- delegation graph completeness is a semantic property, not a traversal property;
- missing ancestry forces UNKNOWN for affected authorization;
- convergent paths require dependency-aware propagation;
- multiple paths do not imply independent support;
- cross-domain delegation requires explicit translation/trust semantics;
- scope composition remains claim-relative;
- graph cycles and common-mode indexes can defeat naive independence;
- retention loss must not be silently reconstructed as complete history.

NOT CLOSED:
FutureObs_PAA; P_AA quotient congruence; complete delegation graph algebra; R1-R5 completeness/minimality; dependency/TCB/evidence reducer completeness; independence/quorum completeness; retention/reconstruction soundness.

NOT PERFORMED:
implementation; formal verification; runtime/fault injection; V21; semantic freeze.

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

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission — GLOBAL-AUDIT-061
Attack cross-domain delegation and authority translation:
- namespace/subject translation;
- capability/resource semantic translation;
- audience binding;
- domain trust roots;
- delegation across incompatible scope languages;
- translated revocation propagation;
- bridge/gateway common-mode dependencies;
- stale translation caches;
- rollback and restoration across domains.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.
