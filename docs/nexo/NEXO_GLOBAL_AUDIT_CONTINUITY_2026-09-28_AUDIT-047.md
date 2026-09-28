# NEXO GLOBAL AUDIT — CONTINUITY — GLOBAL-AUDIT-047

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Verified endpoint

GLOBAL-AUDIT-046 completed as a research/audit artifact.

Audit commit:
76971cbfef96ff3f9807110f07bbbbd74f89a490

Artifact:
docs/nexo/NEXO_GLOBAL_AUDIT-046_BRANCHING_MERGE_PROVENANCE_2026-09-28.md

Previous continuity:
docs/nexo/NEXO_GLOBAL_AUDIT_CONTINUITY_2026-09-28_AUDIT-046.md
commit previously recorded: 326d951846b301fc866b9384473beead79097f68

## 046 result

Branch-local LossSets are not automatically compositional. Two summaries can be mechanically mergeable while remaining semantically non-composable for a claim.

Critical finding:
UNKNOWN + UNKNOWN does not become a concrete fact merely because the summaries are different.

A concrete result requires an explicit completeness/refinement argument showing that the combined evidence closes the claim's missing-evidence boundary.

Migration provenance is itself part of the evidence dependency graph whenever semantic preservation of a migration is relied upon. It therefore needs immutable identity, predecessor linkage, transformation identity, authority/context, and an admissibility basis. The recursion must terminate at an explicit trust boundary/TCB.

Conflicting provenance must preserve alternatives/conflict state and UNKNOWN rather than silently selecting the lineage that produces the strongest result.

Target-schema equality, byte equality, or provenance-format validity are insufficient to establish claim-relative semantic equivalence.

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

AB55/AB56 carryover remains unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Research evidence used

W3C PROV documents distinct versions/revisions and explicit derivation/provenance relations; PROV also distinguishes alternate/specialized descriptions. This supports keeping branch and migration histories explicit rather than treating equal representations as automatically interchangeable.

Git merge records the parent histories of diverged branches and may require explicit conflict resolution.

Apache Iceberg models branches as independent snapshot lineages and treats snapshot/cherry-pick operations as new historical objects.

These are external analogues and evidence, not proofs of Nexo's final semantics.

## Next exact mission — GLOBAL-AUDIT-047

Attack evidence dependency closure after merge:
1. common-source overlap;
2. double counting through different branches;
3. correlated/common-mode provenance;
4. hidden shared predecessors or TCBs between apparently independent migrations;
5. whether duplicated evidence can incorrectly collapse UNKNOWN into a concrete claim;
6. minimum evidence identity/overlap representation and anti-double-counting rule.

Do not redo 041-046 except where required as premises.
Do not implement Nexo.
Do not start V21.
Do not close any UNKNOWN without evidence.
