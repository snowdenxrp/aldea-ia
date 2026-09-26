# NEXO AB104.241 — MIGRATION RECORD AUTHORITY NON-ESCALATION ATTACKS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
A migration is a transformation of evidence. It must not be allowed to manufacture stronger authority, fresher provenance, a newer target incarnation, or a more permissive decision than its source evidence supports.

## Migration capability boundary
Candidate invariant:
MIGRATED_RECORD authority <= SOURCE_RECORD authority, subject to explicitly authorized policy transitions.
More precisely, migration may change representation and semantics only within an authenticated migration contract. It cannot silently increase authority, freshness, scope, signer eligibility, target incarnation, or effect permission.

## Attack matrix
1. Malicious migration: attacker substitutes a transformation that turns UNKNOWN into COMMITTED. Reject unless migration identity, code/grammar digest, authorization and source/target semantics are verified.
2. Default escalation: missing field becomes ALLOW/CURRENT/TRUSTED. Reject permissive security defaults.
3. Double migration: v1->v2 applied twice. Same migration identity + same source digest must converge; applying it again must not create a new authority event.
4. Migration fork: same source transformed into two valid v2 records. Preserve both as conflicting branches unless an explicit authority rule selects one.
5. Partial migration: source durable, target partially written. Recovery must resume/reconcile from migration identity and source digest; partial target is not proof of completion.
6. Crash after target migration but before migration receipt/changelog. Do not blindly rerun if transformation has side effects; recover from authoritative target/migration evidence.
7. Rollback migration metadata: an older migration state is restored after a newer migration was accepted. Anti-rollback continuity must prevent the old state from becoming current.
8. Concurrent migrations: two workers migrate the same source. A durable claim/fence or target atomic uniqueness must serialize or make duplicate transformation converge.
9. Source deletion before migration proof: missing source does not prove migration completed; retain source commitment/evidence until the migration boundary is durable.
10. Authority escalation by schema rewrite: migration changes old authority epoch/root to current root without an explicit authority transition. Reject.
11. Target-incarnation substitution: migration binds an old operation to a newly recreated resource. Reject unless an explicit reincarnation transition authorizes the mapping.
12. Expired/obsolete migration: historical transformation remains reconstructable, but cannot revive current permission after its authority has been superseded.

## Migration record candidate
migration_id
source_record_digest
source_schema_version
source_semantic_version
target_schema_version
target_semantic_version
transformation_digest
migration_executor_identity
authority_root/epoch
target_incarnation
predecessor_migration
source_generation
target_generation
status
evidence/receipt reference
policy/version

These fields are a research candidate, not an implementation specification.

## Safe state progression
UNSEEN -> CLAIMED -> TRANSFORMING -> TRANSFORMED -> VERIFIED -> ADMISSIBLE_FOR_RECONSTRUCTION
Separate failure states:
CONFLICT, SOURCE_MISSING, PARTIAL, ROLLBACK, AUTHORITY_MISMATCH, SEMANTIC_MISMATCH, QUARANTINED.
Importantly, VERIFIED migration does not imply CURRENT_EXECUTABLE permission.

## Migration monotonicity
A transformation can preserve authority or explicitly consume/retire authority. It must not silently mint a higher generation.
Examples:
- E7 decision -> v2 representation retaining E7: allowed historically if semantic mapping is proven.
- E7 -> E8 merely because v2 is newer: not allowed without an independent E8 authority transition.
- UNKNOWN_EXTERNAL -> COMMITTED: not allowed merely by migration; requires new authoritative effect evidence.
- REVOKED -> CURRENT: not allowed by schema conversion.
- old target incarnation -> new target incarnation: not allowed by representation migration alone.

## Crash recovery
Migration recovery should prefer reconstruction over re-execution where the target transformation is already durably evidenced. A valid migration record is not permission to rerun the original external effect.
This preserves the established Nexo rule: CommitRecord/receipt/recovery evidence can reconstruct state; it never grants permission to repeat an effect.

## External cross-check
Martin Fowler's evolutionary database design emphasizes keeping migrations as first-class version-controlled artifacts, unique identifiers and explicit sequencing/audit history. This is useful evidence for traceability, but it does not itself establish Nexo's authority or security semantics. citeturn0search5
TUF separates roles and signing authority, protects against rollback, and requires coherent metadata views; these provide useful analogies for migration authority and anti-rollback, not a prescribed Nexo mechanism. citeturn0search0turn0search1

## Current prototype
No migration engine, migration journal, schema authority binding or migration fence was demonstrated in the inspected Nexo effect/recovery path. No implementation added.

## AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.
AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
migration != authorization; transformation != execution; newer schema != newer authority; successful parse != semantic validity; migration completion != external effect completion; UNKNOWN -> COMMITTED cannot occur by migration alone; old incarnation != new incarnation; historical migration != current permission; no V21; no architecture implementation; no unsupported formal/CI/fault-injection claims.

## Exact next mission
AB104.242: study the migration executor as an effect itself — migration side effects, idempotency, crash boundaries, fencing, rollback/compensation, and whether a migration can safely change security metadata without creating an authorization race.