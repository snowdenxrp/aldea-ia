# NEXO AB104.317 — Independent archival evidence and common-mode failure

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Multiple evidence sources do not automatically provide independent evidence. Replicas can share storage, power, software, keys, operators, synchronization paths, or the same upstream source; correlated failures can therefore defeat apparent redundancy. Independent archival evidence is useful only to the extent that its failure/dependency domain is sufficiently separated for the claim being made. citeturn0search0turn0search1turn0search25

## Nexo consequence
1. Model evidence dependencies explicitly rather than counting sources.
2. Two archives with the same upstream source, credential, replication pipeline, or restore snapshot may form one common-mode fault domain.
3. A quorum of correlated sources is not equivalent to independent corroboration.
4. To close a historical coverage gap, an archive should have authenticated lineage and coverage plus a dependency profile showing which failure modes it shares with the primary source.
5. If all available evidence depends on one failed/common root, the claim remains UNKNOWN even when several copies agree.
6. Independence is claim-specific: two sources may be independent for storage loss but dependent for semantic corruption if they share the same software/parser or signing authority.

## Candidate evidence-dependency model
`EvidenceNode -> {source, lineage, authority, storage_domain, software_domain, credential_domain, operator_domain, upstream_inputs, restore_dependency}`

Candidate rule: evidence multiplicity increases confidence only when the relevant common-mode dependencies are sufficiently separated; raw source count is not a validity criterion.

## Explicit non-claims
No numeric independence threshold is selected. Independence must be defined relative to the threat/failure model and the claim being verified.

## Sources studied
Research on correlated/dependent failures in distributed systems and fault-tolerance taxonomy. citeturn0search0turn0search1turn0search25

## Next
AB104.318 — investigate how to authenticate and preserve an evidence-dependency graph across archive/restore, including whether the graph itself becomes a common-mode trust root.
