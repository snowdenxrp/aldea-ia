# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.216

## Persisted
- Research: docs/nexo/NEXO_AB104_216_COMPACTION_ARCHIVE_CERTIFICATE_SNAPSHOT_RECOVERY_V1_2026-09-26.md
- Commit: de8574d23be4f4228e06a9248f82218d6da93083

## Core result
- Safe compaction is not deletion. Candidate transition: LIVE SEGMENT → SEALED SEGMENT → ARCHIVED/COMPACTED CERTIFICATE → LIVE NEXT SEGMENT.
- Archive certificate should bind identity/scope, target incarnation, authority epoch/root, sequence range, predecessor digest, segment root/commitment, operation/effect identity, payload fingerprint where needed, resolution state/evidence reference, retention horizon, archive identifier, policy/version and authenticity.
- PREPARED/UNKNOWN may be moved to archived unresolved evidence, but must remain a known historical identity that blocks blind replay.
- Missing archive content is not automatically corruption; it can be an availability failure. Integrity, availability, authority and freshness are separate properties.
- Snapshot + archive recovery must verify snapshot identity/sequence/epoch, archive continuity and current segment. Gaps become HISTORY_GAP/UNVERIFIED_HISTORY, never fabricated reconstruction.
- Old but valid archives can be stale; authenticated history is not automatically current authority.
- CT Merkle consistency proofs are a useful reference for append-only continuity; TUF snapshot/version binding is a useful reference for coherent views and rollback/freeze defenses; SQLite WAL shows snapshot/recovery mechanics but does not solve Nexo authority or anti-rollback by itself.

## Important unresolved choices
- hash-chain vs Merkle vs combination
- local/remotely replicated archive
- signature/MAC and key lifecycle
- checkpoint frequency and retention
- quorum/external anchor
- exact recovery availability guarantees

## Next exact mission
AB104.217: adversarially attack archive certificates: forgery, replacement, wrong branch, missing index, key rotation, anchor rollback, duplicate certificates for same range, crash during seal/compact, concurrent recovery.

## DO-NOT-REPEAT
- Do not equate archive certificate with current authority.
- Do not equate valid archive with available contents.
- Do not turn missing live record into NOT_COMMITTED.
- Do not GC unresolved UNKNOWN into absence.
- No architecture implementation, no V21, no unsupported formal/CI/fault-injection claims.