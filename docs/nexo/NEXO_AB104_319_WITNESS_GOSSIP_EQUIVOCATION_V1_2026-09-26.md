# NEXO AB104.319 — Witness/gossip and equivocation detection

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Transparency systems show that independent observers can detect equivocation by comparing signed checkpoints/roots. RFC 9162 describes gossip as comparison of log views, while the current IETF Checkpointed Local Log draft explicitly states that multiple independent witnesses strengthen resistance to equivocation. citeturn0search0turn0search1turn0search2

## Important boundary
A witness authenticates/observes a checkpoint and its continuity; witnessing does NOT prove the truth of the underlying record content. The current CLL draft explicitly separates witnessed commitment from content accuracy and real-world effect. citeturn0search3

## Nexo consequence
1. Independent witnesses can add evidence against **equivocation** when they have sufficiently separated trust/failure domains.
2. Witnesses do not automatically prove **completeness**, **truth**, or **external effect**.
3. A witness sharing the producer's authority, storage, software, or acquisition path may reproduce the same common-mode omission.
4. A detected disagreement is evidence of `CONFLICT/EQUIVOCATION`, not permission to choose one history by majority alone.
5. Absence of disagreement is not proof that no equivocation occurred; detection depends on witness coverage and communication.

## Candidate evidence classes
`WITNESS_CONTINUITY`
`WITNESS_EQUIVOCATION_PROOF`
`WITNESS_CONTENT_CORROBORATION`
`WITNESS_COMPLETENESS_COVERAGE`

These must remain distinct. A witness should not upgrade one class into another.

## Candidate rule
For an evidence claim, witness value is determined by the failure modes the witness can independently detect. Source count alone is insufficient.

## Next
AB104.320 — study quorum/threshold witnesses: when a threshold gives Byzantine equivocation detection versus merely correlated signatures, and how recovery should classify disagreement.
