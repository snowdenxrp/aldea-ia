# NEXO AB104.311 — Atomic idempotency + mutation + receipt boundary

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
The strongest target-side idempotency design is one where claiming the operation, applying the target mutation, and recording the authoritative result share the same atomic transaction boundary. This is possible only when the target controls all of those state changes in one transactional domain. Stripe documents storing the first result for an idempotency key and replaying it on retry; distributed-systems guidance warns that a separate dedupe check followed by a separate side effect leaves a crash race. citeturn0search0turn0search1turn0search9

## Nexo consequence
1. Candidate strongest boundary: `claim operation -> validate semantics -> mutate target state -> persist authoritative receipt` atomically.
2. If the mutation and idempotency/receipt registry are in different transactional domains, the boundary is split and `UNKNOWN_EXTERNAL` can remain possible after a crash.
3. A cached response is evidence only when it is bound to the target's actual committed mutation boundary.
4. Atomicity inside one target does not extend automatically to another target, broker, filesystem, device, or external API.
5. If no shared atomic boundary exists, retain explicit intermediate states and reconcile; do not manufacture exactly-once claims.
6. Same operation identity with changed effect semantics must remain CONFLICT, not a new execution under the old key.

## Candidate evidence strength
- ATOMIC_TARGET_COMMIT: operation registry + mutation + receipt share one authoritative transaction.
- TARGET_RECEIPT: target exposes an authoritative durable receipt tied to its commit.
- INTERMEDIARY_RECEIPT: evidence covers only intermediary acceptance.
- OUTBOX_INTENT: durable intent only.
- UNKNOWN_EXTERNAL: no evidence sufficient to establish target outcome.

## Explicit non-claims
This does not prove that heterogeneous external systems can share such a boundary. It identifies the boundary needed when a single target owns the relevant state.

## Sources studied
Stripe idempotency documentation and distributed-systems material on atomic deduplication/effect writes. citeturn0search0turn0search1turn0search9

## Next
AB104.312 — investigate crash points around the atomic target boundary and whether recovery can safely reconstruct the receipt without re-executing the effect.
