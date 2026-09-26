# NEXO AB104.232 — COMPETING VALID HISTORIES / FORK ARBITRATION V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
Recovery must distinguish VALID HISTORY, CURRENTLY AUTHORITATIVE HISTORY, HISTORICALLY VALID BUT SUPERSEDED HISTORY, CONFLICTING VALID HISTORY, and UNVERIFIED HISTORY.

Cryptographic validity does not create a rule for choosing between two valid branches.

## Fork cases
- Same predecessor, same sequence, different payload: CONFLICT/FORK. Never choose by timestamp, arrival order or local preference.
- Same predecessor, different successor, same authority epoch: possible equivocation unless branching is explicitly permitted.
- Old trusted root vs newer local root: higher sequence/version is not sufficient authority; root transition must be authenticated and anchored.
- Two devices offline: valid local history does not imply canonical authority.
- Returning stale branch: preserve as historical evidence but reject current authority if freshness/epoch rules say so.
- Archive branch vs snapshot branch: authentic components can still be incompatible; shared predecessor/commitment/epoch is required.
- Same operation_id with different fingerprints: collision/quarantine. Matching fingerprints still do not prove both branches are canonical.

## Admissible selection
A history may be selected only when an independent authority rule establishes it.

Candidate evidence classes:
1. protected trusted root/anchor;
2. authenticated root-transition statement;
3. authoritative monotonic epoch/freshness;
4. quorum/consensus commitment under an explicitly defined configuration;
5. verifiable continuity to a trusted checkpoint;
6. explicit recovery/arbitration authority.

Timestamp, newest arrival, larger sequence, majority of cached copies, or most complete-looking branch are not independently sufficient.

Raft is a useful reference: joint consensus requires agreement from majorities of both old and new configurations during membership transition. This is a reference invariant, not a Nexo architecture choice. citeturn0search27turn0search29

SCITT provides a reference for append-only finality and non-equivocation. Its continuity work also shows that consistency proofs connect roots over time, while internal consistency alone does not exclude a divergent fork. citeturn0search3turn0search5turn0search6

TUF Snapshot binds metadata versions/hashes into a consistent view and separately addresses rollback/freeze attacks, supporting the distinction between authentic artifacts and one coherent current view. citeturn0search2turn0search4

## Candidate fork state machine
UNSEEN -> CANDIDATE_HISTORY -> LINEAGE_VERIFIED -> AUTHORITY_VERIFIED -> CURRENT_CANONICAL

Side states:
SUPERSEDED, STALE, CONFLICTING_FORK, UNVERIFIED, QUARANTINED, HISTORICAL_ONLY.

No transition from CONFLICTING_FORK to CURRENT_CANONICAL without an explicit authoritative resolution event.

## Multi-device recovery
A returning device may carry valid historical work, stale authority, missing history, a different valid root, a clone, or a partition-created branch. Recovery should preserve rejected branches as evidence rather than delete them.

## Restore attacks
- Older snapshot + newer trusted anchor: snapshot is stale; do not roll authority backward.
- Newer snapshot + older anchor: quarantine until transition chain is verified.
- Alternate complete branch: internally coherent but potentially forked; independent anchor required.
- Two restored devices claiming current: no arrival-time winner; authority arbitration required.

## Negative result
There is no generic Nexo rule that "the longest valid chain wins." Length/sequence is evidence, not authority.
Also, a quorum of copies is not necessarily a quorum of authority because copies can share a compromised root or be clones.

## Current prototype
No canonical-history arbitration mechanism was demonstrated in the inspected Nexo effect/recovery path. No architecture implementation was added.

## AB50→AB58 residuals
UNCHANGED:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- valid signature != canonical history
- larger sequence != authority
- newest arrival != authority
- longest chain != generic winner
- quorum of copies != quorum of authority
- fork resolution != timestamp choice
- stale branch != erased history
- historical branch != current permission
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.233: attack authority arbitration itself — quorum independence, clone/shared-root attacks, offline return, root rotation during partitions, recovery authority compromise, and whether canonical-history selection can be deterministic without sacrificing safety.