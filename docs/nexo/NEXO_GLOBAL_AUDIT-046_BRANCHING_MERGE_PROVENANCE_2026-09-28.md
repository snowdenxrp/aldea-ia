# NEXO GLOBAL AUDIT-046 — BRANCHING / MERGE / MIGRATION PROVENANCE

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main
Status: research/audit artifact only

## Boundary

Attack the GLOBAL-AUDIT-045 candidate preservation boundary under branching archival histories, fork/merge, independently migrated summaries, conflicting migration provenance, and merge across schema versions.

This audit does NOT implement Nexo, does NOT start V21, and does NOT constitute formal verification or runtime verification.

## Primary evidence reviewed

W3C PROV:
- PROV models versions/revisions as distinct entities linked by provenance relations.
- Different descriptions may be alternates or specializations; provenance includes derivation, generation, usage and invalidation.
- PROV validity/equivalence is not the same as Nexo claim-relative semantic preservation.

Git:
- A merge joins diverged histories and records parent histories in a new commit; conflicts may require explicit resolution. This demonstrates that a merge result is a new historical object, not merely an unordered union.

Apache Iceberg:
- Branches are independent snapshot lineages with explicit snapshot identities; snapshot lineage is retained for time travel/audit, and cherry-pick creates a new snapshot from another snapshot.

These mechanisms are useful analogues, not proofs of Nexo semantics.

## Attack A — forked summaries with different LossSets

Let S0 be a common historical source. Branch A produces summary SA and branch B produces SB. If each branch independently records a locally sound LossSet, the union of the two summaries does not imply that their omitted distinctions are jointly known to be absent.

A LossSet is therefore branch-relative unless its provenance binds:
- exact source history;
- transformation lineage;
- claim scope;
- excluded/unknown distinctions;
- reconstruction contract.

Finding: local soundness of SA and SB does not imply soundness of merge(SA,SB).

## Attack B — merge of two UNKNOWN summaries

Construct:
- SA: claim X = UNKNOWN because evidence path E1 is missing.
- SB: claim X = UNKNOWN because a different path E2 is missing.
- Neither branch establishes X.
- A naive merge treats the two UNKNOWN records as complementary and emits X=true.

This is unsound unless the merge contract proves that E1 and E2 are complementary complete partitions whose union closes the missing evidence boundary.

Therefore:
UNKNOWN + UNKNOWN != concrete fact by default.

A concrete result after merge requires an explicit completeness/refinement proof over the combined evidence and claim scope.

## Attack C — independently migrated summaries

SA is migrated V1→V3 using migration M_A; SB is migrated V2→V3 using M_B. Equal target schema does not imply equal historical semantics.

The merge must retain predecessor identities and migration provenance. Otherwise two target records that look structurally identical may represent different reconstruction histories or different loss boundaries.

Finding: target-schema equality is insufficient for semantic mergeability.

## Attack D — conflicting migration provenance

If two summaries claim incompatible migration lineage for the same historical source, the system must not silently select the lineage that yields the strongest or most convenient claim.

Minimum conservative rule:
CONFLICTING_PROVENANCE -> preserve alternatives + UNKNOWN for affected dependent claims.

Resolution requires an authoritative tie-breaker whose own provenance and authority scope are explicit.

## Attack E — merge after different schema versions

V1→V2 and V1→V3 may each be valid transformations while preserving different distinctions. Later merging V2 and V3 cannot assume either representation contains the other's lost distinctions.

Therefore migration compatibility must be assessed against the target claim, not only against target-schema acceptance.

A merge contract needs at least:
- predecessor identities;
- migration identities/versions;
- source-history ranges;
- cumulative LossSet;
- reconstruction contract;
- claim scope;
- dependency closure;
- epoch/incarnation bindings;
- conflict state.

## Attack F — provenance-of-provenance

Migration provenance is itself evidence about how a historical artifact was transformed. If a future claim depends on the transformation being semantics-preserving, then the migration record becomes part of the claim's evidence dependency graph.

Therefore provenance metadata cannot be treated as inherently authoritative merely because it is attached to an artifact.

Candidate requirement:
MigrationProvenance must itself have immutable identity, predecessor references, transformation/schema identity, actor/authority, time/event context, and enough evidence to determine whether its assertions are admissible.

This is a provenance-of-provenance requirement, but it does not imply recursively unbounded metadata. The recursion must terminate at an explicitly declared authoritative trust boundary/TCB.

## Attack G — branch convergence

Two branches can converge to the same apparent summary while retaining different omitted distinctions. Hash equality or schema equality does not establish equality of claim-relevant history unless the canonical reconstruction semantics are also equivalent.

A merge must therefore distinguish:
1. byte/content identity;
2. schema identity;
3. provenance identity;
4. reconstruction equivalence;
5. claim-relative semantic equivalence.

Only (5) can justify treating two histories as interchangeable for a claim.

## Provisional merge rule

For claim C, merge(M1,M2) is eligible to produce a concrete claim only if:
1. both inputs have valid, immutable provenance identities;
2. their source histories and branch/fork relations are known;
3. migrations are individually admissible for C;
4. cumulative LossSets are known;
5. reconstruction contracts are compatible or an explicit combined contract proves equivalence;
6. dependencies and negative-space/completeness boundaries are closed for C;
7. no unresolved provenance/conflict ambiguity can change C's truth value;
8. epoch/incarnation/authority bindings required by C are preserved.

Otherwise the merged result is UNKNOWN or retains alternatives/conflict state.

## New distinction

MERGEABLE-AS-DATA is not MERGEABLE-AS-EVIDENCE.

Two summaries may be mechanically mergeable while remaining semantically non-composable for a claim.

## Epistemic status

FOUND:
- branch-local LossSets are not automatically compositional;
- UNKNOWN states cannot be combined into a concrete claim without a completeness/refinement argument;
- same target schema does not establish same historical meaning;
- migration provenance participates in the evidence dependency graph when semantic preservation is claimed;
- conflicting provenance requires conservative preservation of alternatives/UNKNOWN;
- mergeability must be claim-relative.

NOT PROVEN:
- a complete formal merge algebra;
- P_AA quotient congruence;
- FutureObs_PAA;
- R1-R5 completeness/minimality;
- dependency/TCB/evidence-reducer completeness;
- independence;
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

## Next exact mission — GLOBAL-AUDIT-047

Attack the boundary between claim-relative mergeability and evidence dependency closure:
- common-source overlap and double counting;
- duplicate evidence appearing through different branches;
- correlated/common-mode provenance;
- whether independent-looking migrations actually share a hidden predecessor/TCB;
- whether a merged UNKNOWN can become concrete because of duplicated evidence;
- minimum representation for evidence identity, overlap, and anti-double-counting.

No implementation. No V21. Preserve UNKNOWN unless closed by evidence.
