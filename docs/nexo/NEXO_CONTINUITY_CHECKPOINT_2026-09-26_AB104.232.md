# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.232

## Persisted
Research:
docs/nexo/NEXO_AB104_232_COMPETING_VALID_HISTORIES_FORK_ARBITRATION_V1_2026-09-26.md
Commit: f0027d284991a9cc46739b5f0980ecd38a67a362

## Core result
Valid history != canonical history.
Cryptographic validity does not choose between valid branches.
No generic longest-chain rule is established for Nexo.
Timestamp, arrival order, larger sequence, or majority of cached copies are insufficient authority by themselves.

Forks require explicit authority:
- protected anchor
- authenticated root transition
- authoritative freshness/epoch
- quorum/consensus under explicit configuration
- continuity to trusted checkpoint
- explicit recovery/arbitration authority

Candidate states:
UNSEEN -> CANDIDATE_HISTORY -> LINEAGE_VERIFIED -> AUTHORITY_VERIFIED -> CURRENT_CANONICAL
Side states: SUPERSEDED, STALE, CONFLICTING_FORK, UNVERIFIED, QUARANTINED, HISTORICAL_ONLY.

Rejected branches must be preserved as evidence, not silently deleted.

## External evidence
Raft joint consensus demonstrates overlapping authority during configuration changes; reference invariant only, not Nexo design. citeturn0search27turn0search29
SCITT provides append-only/non-equivocation and continuity concepts; internal consistency does not alone exclude a fork. citeturn0search3turn0search5turn0search6
TUF Snapshot binds a coherent metadata view and its security model addresses rollback/freeze. citeturn0search2turn0search4

## Current prototype
No canonical-history arbitration mechanism demonstrated in inspected effect/recovery path. No architecture implementation.

## Residuals
AB50→AB58 unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks.

## Constraints
Research/study only. No V21. No architecture implementation. Preserve UNKNOWN/PENDING and contradictions.

## Exact next mission
AB104.233: attack authority arbitration itself — quorum independence, clone/shared-root attacks, offline return, root rotation during partitions, recovery authority compromise, and deterministic canonical-history selection.

## DO-NOT-REPEAT
Valid signature != canonical history; larger sequence != authority; newest arrival != authority; longest chain != generic winner; quorum of copies != quorum of authority; stale branch != erased history; no V21.