# NEXO — CONTINUITY CHECKPOINT AB104.206
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

Canonical repository: snowdenxrp/aldea-ia / main.

AB104.206 research:
docs/nexo/NEXO_AB104_206_AUTHORITY_TO_EXTERNAL_EFFECT_ATTACK_V1_2026-09-25.md
Commit: cd9832b6f0def8fabb454f34d2352d4e9212b542

Core result:
The boundary between authority and external effect must be explicit. Three facts are distinct:
1. DECISION_AUTHORIZED — accepted under a specific authority epoch/config/freshness.
2. EFFECT_ATTEMPTED/COMMITTED — local effect protocol durably recorded a transition.
3. EFFECT_OBSERVED — external boundary independently confirms the intended outcome.
One must not be inferred from another unless an explicit contract proves the implication.

AB104.206 attacks:
- replay of a valid historical QC after authority advances;
- revocation between authorization and effect;
- external success followed by local crash before CommitRecord;
- CommitRecord present while external completion is uncertain;
- stale worker after authority epoch rotation;
- duplicate operation_identity;
- different identities representing the same logical retry;
- restored historical authorization used to produce a new external effect.

Key rule carried from AB104.197:
CommitRecord is recovery evidence, never permission to re-execute the original effect.

Candidate Decision Contract fields: decision_identity, authority_epoch, authority_config_digest, root_digest, freshness/expiry, scope, operation_identity, predecessor/state digest, effect class, replay binding, fencing epoch.

Candidate Effect Contract fields: operation_identity, decision_identity, required authority epoch, target/resource, effect-parameter digest, idempotency/dedup identity, validity window, external acknowledgment/reconciliation method, completion evidence, UNKNOWN/compensation policy.
Exact schemas OPEN.

Recovery implication:
- old authorization during recovery -> reconstruct historical state only; no new external effect solely from presence.
- uncertain external completion -> UNKNOWN_EXTERNAL; reconcile before deciding whether another attempt is safe.
- stale authority -> STALE_AUTHORITY; fence worker; no external effect.
- if external boundary accepts stale authority, that is an unresolved architecture weakness.

Code study:
Canonical repository search for Effect Contract, Decision Contract, CommitRecord and effect_identity did not establish a verified complete implementation. No implementation/security guarantee claimed.

Historical residuals AB50→AB58 remain unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

DO-NOT-REPEAT:
- valid historical QC != current authorization;
- attestation evidence != eternal authorization;
- CommitRecord != retry permission;
- missing CommitRecord != proof external effect did not happen;
- local commit != external completion unless independently evidenced;
- random request ID != necessarily stable logical operation identity;
- stale worker cannot cross effect boundary;
- never guess away UNKNOWN_EXTERNAL;
- no V21;
- no unsupported verification claims.

EXACT NEXT ACTION — AB104.207:
Study concrete effect-boundary fencing/reconciliation mechanisms:
1 conditional writes/version checks, leases, fencing tokens;
2 idempotency keys/conditional mutation APIs;
3 crash after external acceptance before local acknowledgment;
4 crash after local commit before external acceptance;
5 partitions and delayed duplicates;
6 stale worker after authority rotation;
7 minimum evidence for COMMITTED / NOT_COMMITTED / UNKNOWN.

CONTINUITY:
Next CONTINUITY resumes directly at AB104.207. Preserve all UNKNOWN/PENDING and AB50→AB58 residuals. Do not restart AB104.206 or implement prematurely.