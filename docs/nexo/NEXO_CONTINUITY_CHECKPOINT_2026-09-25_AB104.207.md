# NEXO — CONTINUITY CHECKPOINT AB104.207
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

Canonical repository: snowdenxrp/aldea-ia / main.

AB104.207 research file:
docs/nexo/NEXO_AB104_207_FENCING_RECONCILIATION_EXTERNAL_EFFECTS_V1_2026-09-25.md
Commit: eb0f18c8785ec0cf47bdd691e162fafe9584519e

Core result:
The authority-to-effect boundary has two independent dimensions:
1. Idempotency identifies the same logical operation across retries.
2. Fencing establishes whether the executor is still authorized in the current ownership epoch.
Neither replaces the other.

A stale worker can retain a valid-looking lease locally after authority changes. Therefore the protected resource must enforce fencing where stale execution could cause harm. The fence must be checked against durable resource state, ideally atomically with the mutation.

Critical crash window:
External effect may commit -> worker crashes/network response is lost -> local CommitRecord absent or incomplete.
Absence of local evidence cannot prove NOT_COMMITTED. Correct classification is UNKNOWN_EXTERNAL until authoritative reconciliation.

Recovery rule strengthened:
UNKNOWN_EXTERNAL must NOT be converted into a new operation_id and blindly executed. Reconciliation should preserve stable operation_id/fingerprint. Only authoritative evidence can transition UNKNOWN to COMMITTED or NOT_COMMITTED.

External target without idempotency/fencing/reconciliation creates an assurance ceiling: exactly-once external effect cannot honestly be claimed across ambiguous crashes. Contract must expose UNKNOWN_EXTERNAL/UNVERIFIABLE.

Conceptual effect identity binds operation_id + fingerprint + authority epoch + fence epoch + target scope. Ordering remains separate from duplication and may require target-side sequence/version enforcement.

Code study:
Repository search did not establish a verified current implementation of these fencing/effect invariants. No runtime guarantee is claimed.

Historical residuals AB50→AB58 unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

DO-NOT-REPEAT:
- lease != durable effect authority
- lock != resource fencing
- idempotency != fencing
- missing CommitRecord != NOT_COMMITTED
- UNKNOWN_EXTERNAL != permission to retry with a fresh operation_id
- historical authority != current authority
- middleware cannot manufacture exactly-once semantics when target exposes no authoritative primitive
- no V21
- no unsupported verification claims

EXACT NEXT ACTION — AB104.208:
Study authoritative reconciliation:
1 target lookup;
2 fingerprint matching;
3 ambiguous/partial responses;
4 timeout/partition behavior;
5 same operation_id with different payload;
6 target idempotency retention/expiry;
7 compensation vs reconciliation;
8 exact conditions for UNKNOWN -> NOT_COMMITTED or COMMITTED.

CONTINUITY:
Next CONTINUITY resumes directly at AB104.208. Preserve all UNKNOWN/PENDING and AB50→AB58 residuals; do not restart AB104.207.
