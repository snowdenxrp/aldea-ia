# NEXO AB104.245 — MIGRATION ROLLBACK, COMPENSATION AND ANTI-RESURRECTION ATTACKS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
A rollback of representation is not equivalent to a rollback of authority. An inverse transformation may restore bytes/state shape while leaving authority, effects, target incarnation, receipts, or external side effects changed.

## Four distinct operations
1. REPRESENTATION_ROLLBACK: restore a previous data/schema representation.
2. MIGRATION_COMPENSATION: create a new state transition that counteracts a prior effect.
3. AUTHORITY_REVOCATION/TRANSITION: explicitly changes what is currently admissible.
4. EXTERNAL_EFFECT_COMPENSATION: a new external operation intended to offset an earlier effect.

None should be silently inferred from another.

## Main attacks
- Old snapshot restored after a newer authority epoch: old state must not resurrect executable permission.
- "Down migration" restores old schema but accidentally restores old authority fields.
- Partial reverse chain: M3 reversed while M2 remains; dependent state becomes semantically mixed.
- Compensation replay: same compensation identity with different payload/fingerprint => collision/quarantine.
- Stale worker: worker authorized under epoch E7 wakes after E8 and attempts an old migration/compensation; target must reject stale authority/fence.
- External compensation confusion: successful compensation does not erase historical fact that the original effect occurred.
- Rollback-after-UNKNOWN: an unknown original effect cannot be treated as absent merely because representation was rolled back.
- Dependency resurrection: restoring predecessor M1 while retaining descendant M4 creates a graph state that never existed.
- Target-incarnation rollback: state from incarnation A is restored into B without explicit rebind evidence.
- Receipt rollback: deleting/reverting a receipt can turn known COMMITTED into apparent UNKNOWN; absence is not proof of non-execution.

## Anti-resurrection invariant
If G is the highest trusted current authority generation, recovery must not expose executable permission whose authority generation is below G merely because an older representation/snapshot was restored.

Candidate:
executable(P) => current_admissible_authority(P) AND continuous_lineage(P) AND dependencies_current(P) AND target_incarnation_current(P)

## Compensation semantics
Compensation is itself an effect. It therefore needs its own operation/effect identity, authority, target incarnation, payload fingerprint, acceptance/commit evidence, idempotency semantics and reconciliation path. It must reference the compensated operation without overwriting or deleting that operation's history.

## Partial rollback
Safe recovery should identify the highest contiguous verified migration frontier and the reverse/compensation frontier separately. If either frontier has UNKNOWN state, dependent executable decisions remain blocked.

## External evidence
TUF explicitly treats rollback as a distinct attack and uses freshness/version information so previously seen older metadata is not silently accepted. Its metadata model also prevents mixing metadata files from different repository states through snapshot binding. citeturn0search1turn0search2
Kubernetes uses resourceVersion and conditional update semantics to reject writes based on stale resource versions; this is a concrete example of protecting against lost updates/stale writers, not a Nexo architecture choice. citeturn0search0
Recent Kubernetes work also explicitly tracks stale-cache synchronization and skips stale controller work, reinforcing the distinction between observed state and current admissible state. citeturn0search6

## Code study
The current GitHub indexed search did not expose migration-specific implementation. Earlier direct inspection remains the evidence for the prototype effect path: local effect journal/idempotency behavior is not equivalent to distributed authority fencing or rollback-resistant migration semantics. No implementation was added.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
Rollback representation != rollback authority; compensation != deletion/erasure; compensation != proof original effect did not happen; old snapshot != current authority; missing receipt != NOT_COMMITTED; stale worker != safe retry; local revision != distributed fence; inverse migration != guaranteed inverse semantics; no V21; no architecture implementation; no unsupported verification claims.

## Exact next mission
AB104.246: crash/recovery during rollback and compensation — atomicity boundaries, partial inverse chains, compensation receipt loss, UNKNOWN original effect, concurrent compensators, and reconciliation without double compensation.