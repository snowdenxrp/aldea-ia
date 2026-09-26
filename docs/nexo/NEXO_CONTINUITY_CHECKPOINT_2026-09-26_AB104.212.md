# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.212

AB104.212 completed: crash-interleaving and reconciliation state-machine study.

Research-only. No implementation, V21, or formal verification.

Core result:
A crash does not determine whether an external effect happened. Recovery must classify using evidence from the actual boundary crossed.

Per-child states:
UNSEEN -> INTENDED -> SENT_UNKNOWN -> ACCEPTED -> PROCESSING -> COMMITTED
with FAILED/CANCELLED/PARTIAL/UNKNOWN branches.

Recovery:
UNKNOWN -> RECONCILING -> COMMITTED | NOT_COMMITTED | PARTIAL | UNKNOWN_PERMANENT.

Important cases:
- response lost after target acceptance => reconcile, never infer absence;
- receipt durable but local checkpoint lost => reconstruct, do not re-execute;
- child committed before checkpoint => reconcile before replay;
- parent checkpoint does not prove every child unless atomically bound;
- cancellation/compensation are new effects;
- restore can erase visible history without erasing historical occurrence;
- concurrent recovery actors need fencing/authority, not permission to repeat;
- child identity plus different fingerprint => collision/quarantine.

External evidence: RFC 9110, RFC 9113, AWS idempotency guidance.

Code-search limitation remains unchanged: broad keyword searches returned no exact matches in the available GitHub code-search surface.

AB50->AB58 residuals unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

Exact next AB104.213:
Authoritative negative-result protocols / explicit not-processed guarantees; map to Claim/Decision/Effect Contracts; then structural repository navigation.

DO-NOT-REPEAT: crash != absence; missing response != failure; checkpoint != effect proof; cancellation != rollback; compensation != erasure; no V21.
