# NEXO AB104.242 — MIGRATION AS EFFECT: CRASH, IDEMPOTENCY, FENCING AND SECURITY-METADATA RACES V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
A migration is itself an effect when it changes durable state. Therefore migration needs the same separation already established for external effects: intent, acceptance, commit, receipt/evidence, authority, idempotency, fencing and reconciliation.

## Migration boundary
Candidate sequence:
CURRENT_SCHEMA/STATE -> MIGRATION_AUTHORIZED -> MIGRATION_ACCEPTED -> MIGRATION_COMMITTED -> MIGRATION_RECEIPT -> RECONCILED
These are distinct. A migration intent or reservation is not proof the transformation committed.

## Crash matrix
1. Crash before migration starts: recover intent; no assumption of completion.
2. Crash during transformation: classify partial/unknown unless the target transaction boundary proves atomicity.
3. Transformation commits but migration record is absent: authoritative target state may prove completion; otherwise UNKNOWN.
4. Migration record commits before actual transformation: record is intent/reservation, not completion, unless atomically bound to the transformation.
5. Transformation + migration record commit atomically: strongest local evidence; still not automatically external authority.
6. Receipt lost after commit: reconcile by migration identity; do not rerun blindly.
7. Worker retries after uncertain commit: same migration identity and target idempotency/atomic uniqueness are required.
8. Two workers migrate concurrently: target must serialize or reject stale/duplicate migration claims; local mutex is insufficient across processes/devices.

PostgreSQL WAL is a useful storage-level reference: data-file changes follow durable WAL records, allowing REDO recovery after crashes. Transactional visibility is all-or-nothing within a transaction. These properties are storage semantics, not proof of Nexo authority or external-effect correctness. citeturn0search4turn0search8

## Idempotency
Migration identity must remain stable across retry/recovery. Candidate identity:
(source_digest, migration_id, target_scope, target_incarnation, transformation_digest)
Same identity + same transformation should converge to one target state.
Same migration_id + different source/transformation digest is a collision and must quarantine.
Migration ID alone is not enough if it can be reused against a different source or target incarnation.

## Fencing
Migration worker A authorized under generation E7; security metadata advances to E8; A resumes.
Without target-side fencing, A may overwrite newer metadata.
Candidate protected acceptance:
presented authority generation/fence >= target current generation AND expected target version matches AND migration identity/source digest matches.
If the migration changes authority metadata itself, the authority transition must be included in the protected atomic boundary or separately ordered by an authenticated transition.

## Security-metadata race
Example:
R7 current -> migration M7 prepares -> root rotates to R8 -> M7 writes old authority metadata.
Result must not allow R7 metadata to become current again.
Possible classifications: STALE_MIGRATION, AUTHORITY_CONFLICT, ROLLBACK, QUARANTINE.
The critical point is that a migration cannot use its own historical authority as proof that it may replace current authority.

TUF is a useful external reference here: role separation limits which parties may sign which metadata; versions and expiration help reject stale/rollback state; Snapshot prevents mixing metadata from different repository states. citeturn0search0turn0search1

## Rollback and compensation
A schema migration rollback is not necessarily a security rollback.
Restoring bytes to an older representation can resurrect old authority metadata unless the current authority/freshness anchor remains monotonic.
Compensation should be treated as a new operation with its own identity and outcome; it is not proof that the original migration never happened.

## Migration receipt
Candidate receipt fields:
migration_id; source_digest; target_digest; source/target schema+semantic versions; target incarnation; authority root/epoch; target revision/linearization; transformation digest; result; issuer; freshness/continuity; retention.
A receipt can reconstruct migration state if it proves the target commit boundary. It never grants permission to execute an unrelated effect.

## Current prototype
No demonstrated migration executor, migration-specific fencing, atomic security-metadata migration boundary, or migration receipt/reconciliation mechanism exists in the inspected Nexo effect/recovery path. No implementation added.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.
AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
migration intent != migration commit; migration record != target completion unless atomically bound; local lock != distributed fence; migration identity without source/target binding != safe idempotency; compensation != erasure; rollback representation != rollback-safe authority; historical authority != current permission; no V21; no architecture implementation; no unsupported formal/CI/fault-injection claims.

## Exact next mission
AB104.243: investigate migration chains and dependency ordering — when multiple migrations touch authority, schema, target identity and effect contracts, determine safe topological ordering, dependency barriers, concurrent branches and how recovery detects an incompatible migration graph.