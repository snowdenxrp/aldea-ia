# NEXO — CONTINUITY CHECKPOINT AB104.200
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

Canonical repository: snowdenxrp/aldea-ia / main.

AB104.200 research file:
docs/nexo/NEXO_AB104_200_ROOT_TRANSITION_CRASH_FRESHNESS_PERSISTENCE_ATTACK_V1_2026-09-25.md
Commit: 6006df0e29d8553ff0cecb25579bd508ccc172d3

Core finding:
Root transition cannot be considered safe merely because root metadata and signatures are valid. Crash recovery must prevent durable evidence from disagreeing about which root is current.

Critical asymmetric case:
If freshness F(n+1) is durably advanced but R(n+1) metadata is missing, recovery must NOT silently fall back to R(n). The durable freshness advance is security evidence; recovery is blocked until the newer root can be independently recovered and verified.

Conversely:
R(n+1) present + old freshness does not prove the transition committed; classify as pending/uncommitted unless transition evidence is durable.

Torn root writes must never replace the last complete verified root.

A root transition conceptually needs one logical durable commit boundary binding:
anchor epoch, previous-root digest, new-root digest/version, scope, transition authorization, freshness epoch, device/incarnation scope, and commit identity. Exact physical implementation remains OPEN.

Backup/restore and cloning show that ordinary mutable freshness is insufficient if it can be rolled back together with the state. Device incarnation and/or an external protected anchor may be required.

Code study:
Repository inspection remains research/documentation oriented for this line. No trust-anchor implementation is claimed. Future claims require tracing actual persistence/recovery/fencing/verification code and fresh execution evidence.

Historical residuals AB50→AB58 remain unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

DO-NOT-REPEAT:
- root presence != committed transition
- never discard durable freshness advancement
- never roll back to older root when protected freshness is newer
- reject torn roots
- local mutable freshness alone is insufficient for rollback resistance
- no silent competing recoverers
- no silent backup rollback or clone canonicalization
- no effects during root uncertainty
- no V21
- no unsupported verification claims

EXACT NEXT ACTION — AB104.201:
Attack the minimum durable freshness anchor itself:
1. journaling vs transactional storage;
2. atomic commit marker;
3. rollback-resistant counters/epochs;
4. backup/restore;
5. clone detection/device incarnation;
6. multi-device quorum/authority;
7. evidence that must live outside ordinary mutable state.

CONTINUITY RULE:
Next CONTINUITY resumes at AB104.201, preserving all UNKNOWN/PENDING states and historical residuals. Do not restart AB104.200 or implement prematurely.
