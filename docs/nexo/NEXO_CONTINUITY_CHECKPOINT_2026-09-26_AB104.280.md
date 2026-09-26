# NEXO CONTINUITY CHECKPOINT — AB104.280
Date: 2026-09-26
Canonical repo: snowdenxrp/aldea-ia
Branch: main
Research commit: fa8e9412de5929ecd5dd38a4a1df32d0f8949a3b

## Current state
AB104.280 completed as RESEARCH ONLY.
Topic: recovery frontier must be treated as multi-dimensional/coherent state, not one revision number.

## Key result
A single revision can establish order inside one domain but cannot generically establish current authority, target incarnation, resource state, operation/dedupe history, effect/evidence coverage, archival coverage, or semantic compatibility. Raft snapshots already combine index/term/configuration; etcd exposes global revision plus per-key creation/modification/version dimensions.

Candidate research tuple (NOT architecture):
(authority_root, authority_epoch/generation, authority_config_digest, target_id, target_incarnation, resource_version/CAS, operation_registry/dedupe frontier, effect-evidence frontier, archive/retention frontier, schema/semantic version, predecessor/lineage digest).

Recovery rule under study: valid components do not automatically form a valid joint frontier. Incomparable/contradictory/insufficiently covered frontiers must not synthesize executable permission; candidate RECOVERY_INCOHERENT/UNKNOWN.

## Carry-forward / do-not-lose
AB50→AB58 residuals unchanged:
TERNARY_MATH_GAP FOUND;
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS;
TERNARY_PAA_COLLISION UNKNOWN;
EVENTDAG_CLOSURE PARTIAL;
RECONSTRUCTION BOUNDED_ONLY;
SEMANTIC_FREEZE NOT DECLARED;
FORMAL_VERIFICATION/IMPLEMENTATION NOT PERFORMED.
AB55 bounded enumeration was not full UsedAdmissionContext/EventDAG/FutureObs_PAA; AB56 did not close FutureObs_PAA.

AB104.256/257/259 and other previously marked persistence/PENDING items remain unresolved unless separately proven. No implementation, architecture freeze, migration, overwrite, deletion, or silent closure occurred.

## Exact next action
AB104.281 — research partial-order/join semantics for multi-dimensional recovery frontiers: comparable, mergeable, conflicting, UNKNOWN; inspect authoritative systems and direct prototype evidence before any architecture step.

## DO-NOT-REPEAT
Do not restart from AB50/AB58. Do not treat a larger revision as sufficient authority/freshness/effect evidence. Do not convert research candidates into architecture decisions. Do not claim verification or implementation.
