# NEXO CONTINUITY CHECKPOINT — AB104.294

Date: 2026-09-26
Canonical repo: snowdenxrp/aldea-ia
Branch: main

## Completed
- AB104.294 researched: exactly-once semantics and end-to-end scope limits.
- Research commit: 81345212377a122ee378f21adcb8caa574a3ba74

## Carry-forward
- Exactly-once is a scoped protocol guarantee, not a universal property.
- Kafka can provide strong exactly-once processing inside its transactional domain; external systems require their own cooperation. citeturn0search2turn0search4
- Idempotency can prevent duplicate logical application but does not prove the historical outcome when acknowledgment is lost.
- Restore/expiry of dedupe state can destroy replay-prevention evidence; retention and anti-rollback are semantic requirements.
- Nexo must distinguish delivery, processing, target mutation, and evidence/observability semantics.
- UNKNOWN_EXTERNAL remains valid even when transport/processing has exactly-once guarantees.

## Constraints
Research only. No architecture implementation, formal verification, semantic freeze, V21 patching, overwrite/delete, or silent migration. Preserve AB50→AB58 unresolved findings.

## Next exact action
AB104.295 — study idempotency-key scope, retention, expiry, and collision semantics in concrete protocols/APIs, including target incarnation and payload-fingerprint binding.

## DO-NOT-REPEAT
- EOS transport != EOS external mutation.
- Idempotency != historical observability.
- Lost acknowledgement != NOT_COMMITTED.