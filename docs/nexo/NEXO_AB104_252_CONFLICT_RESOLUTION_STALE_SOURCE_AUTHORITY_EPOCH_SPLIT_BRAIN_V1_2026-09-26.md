# NEXO AB104.252 — CONFLICT RESOLUTION, STALE-SOURCE DOMINANCE, EPOCH FENCING AND SPLIT-BRAIN V1 — 2026-09-26

## Status
Research/study only. No architecture implementation or semantic freeze.

## Core finding
A conflict between negative/positive evidence must be resolved by an authenticated authority and lineage relation, not by arrival time, wall-clock timestamp, raw replica count, or local preference. A source can be stale without its historical statement becoming false; admissibility and historical fact remain separate.

## Authority generation
Candidate authority context:
`(authority_root, authority_epoch/generation, configuration_digest, fence_generation)`.
A claim from generation G is admissible only if the current trusted transition chain says G remains valid for the queried scope. A later generation does not automatically erase historical facts; it can fence earlier permissions/evidence from current execution decisions.

## Stale-source dominance
Candidate ordering is partial, not total. Source A dominates B only when protocol evidence establishes that A has a later valid authority/lineage position for the exact scope and B is superseded/stale under that protocol. Newer timestamp alone is insufficient.

Raft's Leader Completeness and Log Matching properties show why committed history is preserved through later leaders under the protocol rather than by timestamps or replica counting. citeturn0search14turn0search7

## Split brain
If two partitions independently produce apparently authoritative claims under incompatible authority generations/configurations, the safe classification is CONFLICT/QUARANTINED until the authority transition/consensus protocol establishes admissibility. Do not merge branches by longest log, latest arrival, or highest local sequence.

A quorum certificate must bind exact statement digest, signer eligibility, configuration/epoch, predecessor/lineage and freshness. Threshold count without those bindings is insufficient.

## Equivocation
One issuer producing incompatible signed statements is not repaired by accepting the newest one. Candidate handling:
1. preserve both statements as immutable evidence;
2. identify the common issuer/trust dependency;
3. mark equivocation;
4. apply revocation/fencing rules to current admissibility;
5. retain historical statements for audit/reconciliation.

TUF provides a useful analogue: trust is scoped by roles, metadata has signed versions/expiration, and root metadata establishes which keys may sign which roles. Its security guidance explicitly addresses rollback and freeze attacks and emphasizes freshness. citeturn0search0turn0search1

## Restore lineage
A restored snapshot must carry its source snapshot identity, predecessor/coverage, restore event and new target incarnation. A restored old state cannot silently regain current authority. If a restore conflicts with newer authoritative history, quarantine the restored claim rather than rewriting current history.

## Negative claim conflict matrix
- NOT_COMMITTED vs COMMITTED, both current/admissible -> CONFLICT/QUARANTINED.
- NOT_COMMITTED old epoch vs COMMITTED current epoch -> old negative claim is STALE for current admissibility, but remains historical evidence.
- COMMITTED old epoch vs current NOT_COMMITTED with complete current coverage -> current negative claim may govern current decision only if its coverage explicitly includes the operation and target incarnation.
- Two claims same epoch but incompatible lineage -> CONFLICT until protocol resolves lineage.
- Same statement copied across many replicas -> one evidence lineage, not independent multiplication.

## Recovery rule
Recovery must never rewrite an historical claim merely to make current state coherent. It may derive a new admissibility state from trusted transitions while preserving the original evidence graph. This is the same conceptual separation already established between historical fact and current authority.

## Code study
Indexed GitHub search did not surface the operation registry/effect-adapter implementation in this pass. This remains non-evidence of absence. No implementation changed.

## Persistent AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

## DO-NOT-REPEAT
newer timestamp != authority; raw quorum != independence; stale != historically false; restore != authority reset; longest branch != canonicality; signed equivocation != resolved truth; current admissibility != historical rewrite; no V21; no implementation; no unsupported verification.

## Exact next mission
AB104.253: investigate authority-generation transition/revocation and evidence fencing in detail — generation monotonicity, root rotation, emergency revocation, delayed messages, replay after fencing, and how historical evidence remains auditable while becoming inadmissible.