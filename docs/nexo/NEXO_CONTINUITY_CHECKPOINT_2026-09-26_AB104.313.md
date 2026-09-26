# NEXO CONTINUITY — AB104.313

## Canonical state
AB104.313 research persisted. No implementation performed.

## Finding
Receipt authority depends on the read path's consistency, lineage, freshness, incarnation, and coverage. Replica/cache absence is not automatically proof of NOT_COMMITTED.

## Required semantics
Evidence classes: TARGET_PRIMARY/LINEARIZABLE, TARGET_QUORUM/CONTRACTED, REPLICA_STALE_OR_UNKNOWN, CACHE, INTERMEDIARY. Preserve UNKNOWN when the required authoritative frontier cannot be established.

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.314: research negative evidence/non-membership after crash and restore, and the conditions required to prove absence of an operation.

## DO-NOT-REPEAT
Do not treat a stale replica, cache, timeout, or incomplete read as authoritative proof that an external operation did not commit.
