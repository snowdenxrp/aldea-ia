# NEXO — CONTINUITY CHECKPOINT AB104.208
Date: 2026-09-26
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

Research file:
docs/nexo/NEXO_AB104_208_AUTHORITATIVE_EFFECT_RECONCILIATION_V1_2026-09-26.md
Commit: 3b3dd879ac71889029a578f30761576b7150579d

Core finding:
UNKNOWN_EXTERNAL must be evidence-bearing and must not be converted to NOT_COMMITTED by absence of a local CommitRecord.

Authoritative reconciliation hierarchy:
A target authoritative operation record/query;
B target durable receipt bound to operation_id + fingerprint + result;
C cryptographically verifiable intermediary receipt with trusted authority;
D local transport evidence;
E local intent/CommitRecord.
Only A-C normally suffice to definitively classify the external result.

Critical collision:
Same operation_id + different payload fingerprint = OPERATION_ID_COLLISION / PAYLOAD_MISMATCH, not retry.

Same operation_id + same fingerprint only proves identity continuity if the target actually records/enforces idempotency. Otherwise result may remain UNKNOWN.

A new operation_id after UNKNOWN is dangerous because it can create a second effect. It should require authoritative NOT_COMMITTED evidence or explicitly duplicate-tolerant semantics.

Idempotency retention must cover the maximum reconciliation horizon, or an alternative durable target-side lookup/receipt must exist.

Reconciliation must append evidence; it must not rewrite uncertainty history.

Code study:
Repository search for operation_idempotency/effect_identity/CommitRecord/reconciliation returned no matching implementation evidence in the searched surface. This is not proof that no related code exists elsewhere. No implementation claim.

Historical residuals AB50→AB58 unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

DO-NOT-REPEAT:
UNKNOWN != NOT_COMMITTED; UNKNOWN != permission to retry; same key + different fingerprint is conflict; local CommitRecord != external proof; revocation does not erase historical effects; never rewrite uncertainty history; no V21; no unsupported verification claims.

EXACT NEXT ACTION — AB104.209:
Study authoritative negative evidence, absence guarantees, key expiration/reuse, partial effects, missing receipts, target rollback/restore, cross-system receipt trust, and the minimum evidence graph needed to classify UNKNOWN without guessing.

CONTINUITY:
Next CONTINUITY resumes at AB104.209.
