# NEXO AB104.250 — AUTHORITATIVE NOT_COMMITTED EVIDENCE CONTRACT, EXPIRY, INCARNATION AND UNKNOWN_PERMANENT V1 — 2026-09-26

## Status
Research/study only. No architecture implementation or semantic freeze.

## Core finding
NOT_COMMITTED is a positive claim about non-occurrence, not merely a missing record. Its evidence contract must prove that the observation domain was complete for the relevant operation identity and target incarnation, and that the domain could not have silently lost a committed operation.

## Candidate evidence contract
A NOT_COMMITTED evidence object should bind:
- operation_id and namespace;
- operation/effect fingerprint or contract version sufficient to prevent identity collision;
- target/resource identity;
- target incarnation;
- authority root/epoch/fence applicable to the operation;
- coverage start/end revision or sequence interval;
- observation boundary and consistency level;
- durable absence marker/tombstone or equivalent complete-history certificate;
- retention policy and exact expiry boundary;
- anti-rollback/root continuity evidence;
- issuer/authenticity/integrity;
- evidence dependencies and common-mode failure domains;
- policy version defining when absence is admissible.

## Coverage is the key semantic
For a negative claim to be valid, the evidence must cover every point at which the operation could have become committed. A certificate covering [r10,r20] cannot prove non-commit at r21. A time-only window is insufficient if target clocks or sequence mapping are not trusted. Prefer an authoritative target revision/sequence domain, with explicit mapping to incarnation and authority generation.

## Expiry
When coverage expires, the evidence loses admissibility; it does not turn into evidence that the effect never happened. Therefore:
NOT_COMMITTED (valid within coverage) -> EVIDENCE_EXPIRED -> UNKNOWN/UNKNOWN_PERMANENT according to whether further authoritative evidence can ever be obtained.
The boundary must be explicit rather than inferred from wall-clock age alone.

etcd provides a concrete analogy: its compaction removes access to revisions before the compaction revision and its retention modes intentionally define how much history remains available. citeturn0search1turn0search3 This supports treating retention as a validity boundary, not as a claim of non-occurrence.

## Tombstone certificate
A tombstone is useful only if its semantics prove that the operation identity was rejected/absent over a complete covered interval. A generic key deletion tombstone does not automatically prove an application-level operation was never accepted. The application contract must define what event the tombstone certifies.

## Incarnation transition
A new target incarnation must not inherit old negative evidence automatically. Candidate transition record binds old incarnation, new incarnation, transition authority, predecessor digest, restore/freshness evidence, and policy for which historical operations remain queryable. Without this, an old absence certificate cannot answer questions about the new incarnation.

## Authority/quorum dependence
Multiple replicas reporting the same absence are not automatically independent evidence. If they share the same rollbackable snapshot, storage failure domain, trust root or replication history, their claims can fail together. Quorum can strengthen availability/consistency only when the protocol establishes what the quorum attests and which histories are independent enough for the claim.

## UNKNOWN_PERMANENT
This state should mean something narrower than 'we have waited long enough.' Candidate definition: authoritative reconciliation is no longer obtainable under the applicable contract, retention and target-incarnation policy, while the historical outcome remains unresolved. It is a terminal epistemic state, not a statement that the effect did not happen.

## Relation to conditional writes
RFC 9110's If-Match demonstrates the general pattern: the server evaluates a precondition against the current representation before performing the state-changing method, and may recognize an already-successful equivalent change after a lost response. This supports the separation between stale client observations and target-side authoritative conditional acceptance, but HTTP ETags alone do not provide Nexo's authority, incarnation or historical negative-evidence semantics. citeturn0search0turn0search6

## Candidate classification
VALID_NOT_COMMITTED: complete covered domain + authoritative observation + current incarnation/authority + anti-rollback + unexpired evidence.
EXPIRED_NOT_COMMITTED_EVIDENCE: historically valid evidence whose coverage is no longer admissible.
UNKNOWN: authoritative answer not yet obtainable.
UNKNOWN_PERMANENT: contract says authoritative answer can no longer be obtained; historical outcome remains unresolved.
CONFLICT: mutually incompatible authoritative claims requiring quarantine/resolution.

## Code study
Indexed GitHub searches did not surface operation-registry implementation in this pass. This is not evidence of absence. No code changed.

## Persistent historical residuals
AB50->AB58 remain unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

## DO-NOT-REPEAT
expiry != non-occurrence; tombstone != application-level NOT_COMMITTED without contract semantics; quorum count != independence; new incarnation != old evidence continuity; UNKNOWN_PERMANENT != NOT_COMMITTED; CAS/ETag != authority/freshness; no implementation; no V21; no unsupported verification.

## Exact next mission
AB104.251: investigate authoritative evidence composition and independence — how multiple negative claims combine, when quorum/threshold evidence is admissible, common-mode dependency graphs, contradictory replicas, and whether negative evidence can be reconstructed after migration/restore.