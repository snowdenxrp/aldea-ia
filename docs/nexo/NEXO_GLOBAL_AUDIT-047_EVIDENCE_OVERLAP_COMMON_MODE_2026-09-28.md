# NEXO GLOBAL AUDIT-047 — EVIDENCE OVERLAP / DOUBLE COUNTING / COMMON MODE

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: research/audit artifact only

## Boundary

Attack the GLOBAL-AUDIT-046 merge rule at the evidence-dependency layer:
- common-source overlap;
- duplicate evidence through different branches;
- correlated/common-mode provenance;
- hidden shared predecessors or TCBs;
- whether duplicated evidence can incorrectly collapse UNKNOWN;
- minimum evidence identity and overlap representation.

This does NOT implement Nexo, start V21, or constitute formal verification.

## External evidence

W3C PROV defines provenance in terms of entities, activities and agents and provides constraints for consistent histories. Its derivation model does not make provenance relationships automatically transitive; provenance bundles can also be independently valid and linked as provenance-of-provenance. These properties support explicit dependency identity rather than assuming that two provenance paths are independent merely because they are separately recorded.

## Attack A — same source, two branches

Let E be one underlying observation. Branch A and Branch B independently summarize E into EA and EB.

A naive evidence reducer that counts EA and EB as two supporting observations can manufacture apparent corroboration without adding independent information.

Finding:
same underlying evidence identity must not acquire additional evidentiary weight merely because it passed through multiple branches.

## Attack B — derived duplicates

Let E -> D1 and E -> D2 be two derived artifacts produced by different transformations. D1 and D2 may be byte-distinct and provenance-distinct while remaining dependent on the same source E.

Therefore:
different artifact IDs != independent evidence.

A reducer needs dependency closure sufficient to detect common ancestors when independence matters.

## Attack C — hidden common-mode predecessor

Suppose M1 and M2 are two migrations, apparently independent, but both depend on the same migration library, schema registry decision, attestation root, or reconstruction checkpoint R.

If R is wrong or semantically incomplete, both outputs can fail in the same direction.

Thus:
separate paths do not establish independence when they share an upstream dependency.

The dependency graph must expose common-mode ancestors relevant to the claim.

## Attack D — two UNKNOWNs becoming concrete

Construct U1 and U2:
- U1 = UNKNOWN because source distinction X is missing.
- U2 = UNKNOWN because a second representation of the same missing distinction X is unavailable.

If the reducer treats the records as complementary, it may infer X incorrectly.

A merge may close UNKNOWN only when the dependency graph proves that the combined evidence covers the missing distinction and that the contributing evidence is not merely duplicate representation of the same unresolved gap.

## Attack E — provenance-of-provenance overlap

W3C PROV supports bundles for provenance-of-provenance. A bundle can itself contain evidence about another provenance description.

Therefore a claim relying on migration provenance may have a deeper dependency chain than the migrated artifact alone.

Candidate rule:
the evidence reducer must operate over the transitive dependency closure required by the claim, not only the immediate evidence records.

But the closure must have an explicit termination condition at the declared TCB/trust boundary; otherwise the model risks unbounded recursive dependency.

## Attack F — minimum evidence identity

Candidate minimum identity for claim-relevant evidence:

EvidenceID
UnderlyingSourceID
DerivationID / transformation lineage
ClaimScope
Observation/event identity
SourceHistoryRange
Authority/attestation identity
Epoch/incarnation where relevant
DependencyRoot / predecessor set
CommonModeGroup or equivalent overlap relation
Completeness/LossSet status
Conflict status

This is a candidate specification, not a final architecture.

## Candidate anti-double-counting rule

For claim C, two evidence items may contribute as independent support only if the dependency analysis establishes that no relevant claim-supporting distinction is shared through a common source, transformation, attestation, reconstruction checkpoint, or other common-mode dependency.

If independence is not established:
- combine as one dependency class for evidentiary purposes, or
- retain them separately but do not treat multiplicity as independent corroboration.

If overlap cannot be resolved:
UNKNOWN for the independence-dependent conclusion.

## New distinction

DIFFERENT RECORDS != DIFFERENT EVIDENCE.

DIFFERENT PROVENANCE PATHS != INDEPENDENT SUPPORT.

INDEPENDENT SUPPORT is claim-relative and requires dependency analysis.

## Epistemic status

FOUND:
- branch duplication can manufacture false corroboration;
- derived artifacts can remain dependent on one source;
- common-mode predecessors can invalidate apparent independence;
- provenance-of-provenance can become part of the evidence dependency closure;
- UNKNOWN must not collapse through duplicate representations;
- evidence identity must distinguish record identity from underlying dependency identity.

NOT PROVEN:
- complete evidence-dependency algebra;
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

## Global state — unchanged

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

## Next exact mission — GLOBAL-AUDIT-048

Attack dependency-graph closure itself:
- cycles and self-reference in provenance/dependency graphs;
- whether a reducer can terminate without silently dropping dependencies;
- multiple dependency paths to one root;
- dynamic dependencies introduced by reconstruction;
- dependency identity across epoch/incarnation changes;
- whether a finite closure can be claimed without a complete TCB boundary.

No implementation. No V21. Preserve UNKNOWN unless closed by evidence.
