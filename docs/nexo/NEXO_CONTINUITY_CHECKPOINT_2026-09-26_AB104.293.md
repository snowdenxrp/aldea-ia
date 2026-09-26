# NEXO CONTINUITY CHECKPOINT — AB104.293

Date: 2026-09-26
Canonical repo: snowdenxrp/aldea-ia
Branch: main

## Completed
- AB104.293 researched: transactional outbox/inbox, durable intent, idempotent consumers, and external target limits.
- Research commit: 0398560b1e7112a56ac257bce99c8c999cf6d929

## Carry-forward
- Outbox atomically persists local state + outbound intent, not external execution.
- Relay retry can duplicate delivery; target-side idempotency is required for duplicate-safe processing.
- Deduplication is not historical proof of external commit unless tied to the actual mutation boundary.
- Stable operation identity must survive retry/recovery and bind target incarnation + payload fingerprint.
- Outbox retention/archival must preserve unresolved evidence; deletion can recreate uncertainty.
- Restore of target dedupe state must not resurrect stale pre-restore execution context.
- Candidate layering: durable intent -> target fence validation -> target operation registry -> authoritative receipt/reconciliation. Research candidate only.

## Constraints
Research only. No architecture implementation, formal verification, semantic freeze, V21 patching, overwrite/delete, or silent migration. Preserve AB50→AB58 unresolved findings.

## Next exact action
AB104.294 — investigate exactly-once/once-only claims at broker, application, and external-resource layers and identify the boundary where end-to-end exactly-once stops being justified.

## DO-NOT-REPEAT
- Outbox commit != target effect commit.
- Deduplication != historical commit proof.
- Retry != new logical operation.