# NEXO AB104.239 — MIXED SNAPSHOT + JOURNAL RECOVERY, FORKS AND PERMISSION RESURRECTION V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
Recovery must validate that snapshot and journal belong to one continuous authority/history before replay. A locally valid snapshot plus locally valid journal segment can still form an invalid mixed history.

## Attack matrix
1. Snapshot S8 + journal J7: reject as semantic/lineage mismatch unless an explicit transition proves compatibility.
2. Snapshot S7 + journal J9 with missing J8: HISTORY_GAP; do not invent J8 or reconstruct current permission.
3. Snapshot S8 + old J7 after root rotation: historical evidence may be retained, but replay cannot reduce current authority to E7.
4. Two valid J8 branches with same predecessor: FORK/CONFLICT; no timestamp/arrival winner.
5. Duplicate event_id with different payload: IDENTITY_COLLISION/QUARANTINE.
6. Duplicate event_id with identical content: idempotent replay.
7. Schema v1 snapshot + schema v2 journal: compatibility must be explicitly established; parseability is not semantic compatibility.
8. Root rotates during replay: replay must bind each event to its authority context and stop current-permission reconstruction if the transition lineage is not verified.
9. Old snapshot contains executable decision D7, later journal contains revocation E8: recovery must not expose D7 before E8 is replayed/validated.
10. Snapshot contains D7 and journal is truncated before E8: current permission is UNKNOWN/BLOCKED, not restored.
11. Derived cache says D7 current while authoritative journal says E8: cache is stale and must be discarded/rebuilt.
12. Restore snapshot from another device/incarnation: valid signatures alone do not prove current local authority; incarnation/anchor continuity must be checked.

## Critical anti-resurrection invariant
Let G be the highest trusted authority generation accepted for a scope. Recovery MUST NOT produce an executable permission whose authority generation is less than G.
Formally, conceptually: executable(P) => authority(P) == current_admissible_authority AND lineage(P) is continuous AND dependencies(P) are not invalidated.

Historical reconstruction may include an old decision D7, but its status must remain HISTORICAL/STALE/REVOKED rather than CURRENT_EXECUTABLE when E8 supersedes it.

## Fork handling
A fork is not repaired by choosing the longer branch, newest timestamp, most recent arrival, or branch with more locally observed entries.
Candidate fork states: CONFLICTING_HISTORY, UNVERIFIED_BRANCH, HISTORICAL_ONLY, CURRENT_CANONICAL.
Promotion requires explicit authority/continuity evidence. Otherwise preserve both branches and block current-authority reconstruction.

RFC 9943 gives a useful external reference: SCITT requires append-only logs, non-equivocation and replayability; receipts provide evidence of registration, while consistency mechanisms prevent silently treating divergent histories as one sequence. citeturn0search0turn0search9
A 2026 SCITT continuity-receipts draft explicitly frames recovery as a separate continuity statement and says a receipt proves registration of that statement, not the truth of the underlying recovery event. That maps closely to Nexo's separation between evidence and authority. It remains an Internet-Draft. citeturn0search6turn0search8

TUF's Snapshot metadata provides a related pattern: it binds metadata into one coherent view so an attacker cannot mix files from different repository states. Its security guidance also treats rollback and indefinite freeze as distinct attacks. citeturn0search7turn0search4

## Recovery candidate
trusted anchor -> identify snapshot scope/incarnation -> verify snapshot completeness/integrity/authenticity -> verify journal predecessor continuity -> verify schema/semantic compatibility -> replay only contiguous events -> apply invalidations -> recompute current authority -> revalidate pending decisions -> expose executable permissions only after current boundary checks.

Any failed stage yields BLOCKED/UNKNOWN/CONFLICT/QUARANTINE as appropriate; it does not yield an inferred safe state.

## Current prototype
No demonstrated snapshot+journal authority continuity mechanism or fork-resolution engine was found in the inspected Nexo effect/recovery path. Existing local journals remain prototype evidence only. No implementation added.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.
AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
valid snapshot + valid journal != valid combined history; parseability != semantic compatibility; old decision != current permission; missing successor != non-existence; fork != winner by timestamp/length/arrival; receipt != underlying truth; replay != effect execution; no V21; no architecture implementation; no unsupported formal/CI/fault-injection claims.

## Exact next mission
AB104.240: attack schema evolution and semantic compatibility during recovery — version downgrade, field deletion/defaulting, authority-context changes, migration records, and whether an apparently valid old decision can become executable through schema reinterpretation.