# NEXO AB104.293 — Outbox/inbox, durable intent, and idempotent external protocols

Date: 2026-09-26
Status: RESEARCH ONLY.

## Sources studied
Transactional outbox atomically stores the local business update and outbound message in one database transaction, then relays separately; the relay can publish duplicates after a crash, so consumers must be idempotent. citeturn0search0turn0search1
The idempotent-consumer pattern records processed message IDs in the consumer's durable state so redelivery does not repeat the business mutation. citeturn0search2turn0search7

## Findings
1. Outbox solves the local dual-write problem: local state + intent/message can share one commit boundary.
2. Outbox does NOT prove the external target executed the message. Relay publication followed by crash still leaves historical uncertainty at the target boundary.
3. Inbox/idempotent-consumer state can suppress duplicate processing only if the target's deduplication record and mutation share an atomic boundary or equivalent authoritative protocol.
4. A durable intent log therefore proves intent persistence, not external effect.
5. At-least-once delivery plus target-side idempotency gives convergence potential, but not historical proof that a mutation occurred when the acknowledgement/receipt was lost.
6. For Nexo, operation identity must remain stable across relay retry/recovery and must bind target identity/incarnation and payload fingerprint; a bare message ID is insufficient for the previously studied restore/authority cases.
7. Outbox entries require retention/archival semantics. Deleting a sent entry without durable evidence can recreate the same uncertainty already identified with the prototype's bounded effect journal.
8. If target-side dedupe state is restored to an older incarnation, a prior operation may look unseen. Therefore restore must fence the old execution context before accepting replay.
9. Best candidate layering remains: durable local intent/outbox -> target-side current fence validation -> target operation registry/idempotency -> authoritative receipt/reconciliation. This is a research composition, not an architecture selection.
10. No messaging pattern eliminates the need to distinguish DECISION_COMMITTED, EFFECT_COMMITTED, EFFECT_OBSERVED, and UNKNOWN_EXTERNAL.

## Candidate invariants
`OUTBOX_COMMITTED != TARGET_EFFECT_COMMITTED`.
`DEDUPLICATED != HISTORICALLY_PROVEN_COMMITTED` unless the target registry is authoritative for the actual mutation boundary.
`OUTBOX_RELAY_RETRY` must preserve the same logical operation identity, not create a new operation merely because delivery is retried.

## Explicit non-claims
No architecture selected; no implementation; no formal verification; no semantic freeze.

## Next exact step
AB104.294 — investigate exactly-once/once-only claims at the broker, application, and external-resource layers, including where 'exactly once' stops being a valid end-to-end claim.