# NEXO GLOBAL AUDIT — CONTINUITY — GLOBAL-AUDIT-045

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Verified endpoint

GLOBAL-AUDIT-045 completed as a research/audit artifact.

Audit commit:
65b547fe796d405e0e35d201fb0fa6ffa11c9f63

Artifact:
docs/nexo/NEXO_GLOBAL_AUDIT-045_ARCHIVAL_SUMMARY_MIGRATION_2026-09-28.md

Previous handoff:
5124e9ccfb4a5f19f964cc92f73172c60cecc3ae

## 045 result

The attack found that repeated archival summaries and reconstruction/schema migration cannot be assumed semantics-preserving merely because:
- each local transformation is structurally valid;
- hashes/digests remain valid;
- the new schema can decode the old representation;
- adjacent schema versions are compatible.

Key result:
CUMULATIVE LOCAL SOUNDNESS != COMPOSITIONAL SEMANTIC PRESERVATION.

A migration can remain integrity-valid while silently:
- filling historical UNKNOWN with a new-schema default;
- collapsing event order;
- replacing historical incarnation identity with current identity;
- changing invalidation meaning;
- treating imprecise derivation as precise;
- dropping a distinction needed by a later claim.

## Candidate preservation boundary

A migration should only be treated as semantics-preserving for claim C when an explicit refinement/observational-equivalence argument establishes that every C-observable source distinction is either preserved or reconstructible from authoritative preserved provenance under a historically bound reconstruction contract.

Otherwise:
MIGRATED-BUT-NOT-PROVEN
and dependent claims remain UNKNOWN.

Candidate cumulative metadata:
SummaryVersion
DerivationID/Version
SourceHistoryRange
ClaimScope
LossSet
CompletenessStatus
AdmissionLinkage
EventOrder
IncarnationBindings
DependencyClosure
InvalidationState
Authority/Membership/Resource epochs where relevant
ReconstructionContract
Migration provenance + predecessor identity

## Important clarification

Schema compatibility is useful evidence for representational interoperability, but it is not by itself evidence of historical semantic equivalence. W3C PROV's distinction between entities, activities, derivations, revisions, generation and invalidation supports keeping migrated artifacts and their provenance explicitly distinct. External schema-evolution practice also distinguishes transitive compatibility from compatibility only with the latest version.

## Global epistemic state — preserve

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

## NEXT EXACT MISSION — GLOBAL-AUDIT-046

Attack whether cumulative LossSet + ReconstructionContract remains sound across:
1. branching archival histories;
2. fork/merge of summaries;
3. independently migrated summaries;
4. conflicting migration provenance;
5. merge after different schema versions;
6. whether two summaries that are each conservatively UNKNOWN can accidentally produce a concrete claim after merge;
7. whether migration provenance itself requires provenance-of-provenance;
8. minimum conflict rule: preserve alternatives/UNKNOWN rather than choose an arbitrary compatible history.

Do not redo 041-045 except where required as premises.
Do not implement Nexo.
Do not start V21.
Do not claim any unresolved UNKNOWN is closed.
