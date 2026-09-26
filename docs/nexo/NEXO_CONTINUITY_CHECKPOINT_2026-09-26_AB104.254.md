# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.254

Research: docs/nexo/NEXO_AB104_254_TARGET_FENCING_RESOURCE_VERSION_INFLIGHT_EFFECTS_LEASE_EXPIRY_V1_2026-09-26.md
Commit: 6151e621e32d639d9d215aad370d05512b1d2927

Core: lease/worker authorization is insufficient; the protected target must enforce fencing at the mutation boundary. A stale worker can pause past lease expiry and later send a delayed request. Target-side fencing rejects the stale request. Kleppmann documents this exact pattern. etcd transactions demonstrate atomic conjunction of comparisons (value/revision/version) and success writes. citeturn0search0turn0search1

Fence and CAS are orthogonal: fence answers current authority generation; CAS answers whether resource state changed. Both may need to be checked atomically with the mutation when the target supports it.

Lease expiry is not target fencing. Restart must not lower the target's durable highest accepted fence. Otherwise a stale worker can be resurrected after restore.

In-flight transition race remains a critical UNKNOWN boundary unless the protocol defines an explicit linearization point ordering authority transition and target effect acceptance. Candidate mechanisms: atomic target transaction, authority-aware resource version, or effect registry ordered with the fence transition.

Fencing does not replace idempotency. Same operation+same fingerprint can potentially reuse a result; same operation+different fingerprint is collision; stale fence is STALE/FENCED; current fence + failed CAS is VERSION_CONFLICT/reconcile.

External APIs that cannot inspect fencing cannot be claimed as target-fenced; protection must terminate at an intermediary or retain residual uncertainty/risk.

Code search did not surface operation registry; not evidence of absence. No implementation.

AB50->AB58 residuals unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

Constraints preserved: research/study only; no V21; preserve UNKNOWN/PENDING/contradictions.

Exact next: AB104.255 — crash ordering around fence transition/effect boundary: transition-before-send, send-before-transition, target-accept-before-transition, transition-visible-before-target-durable, operation registry linearization, UNKNOWN classification, recovery/reconciliation.