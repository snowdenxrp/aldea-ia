# NEXO AB104.308 — Outbox intent vs accepted request vs external effect

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Transactional outbox closes the local dual-write gap between durable local state and an outbound message/intent. It does not by itself prove that the final external side effect occurred. The relay can publish more than once, and the external consumer must provide its own idempotency or transactional boundary. citeturn0search1turn0search6

## Nexo consequence
1. Separate at least three states: INTENT_DURABLE, REQUEST_ACCEPTED, EFFECT_COMMITTED/OBSERVED.
2. Outbox commit proves durable intent in the local transaction; it does not prove final-target commitment.
3. Relay delivery may be duplicated; stable operation identity and consumer-side idempotency are required where duplicate execution is unsafe. citeturn0search6turn0search15
4. If the final target times out after receiving a request, outcome can remain UNKNOWN_EXTERNAL even though the outbox/relay state is known.
5. An intermediary's acceptance is evidence about the intermediary boundary only; it must not be promoted automatically to evidence about the final target.
6. Reconciliation must query target-authoritative evidence or use a target-supported idempotent/receipt protocol before converting UNKNOWN_EXTERNAL to a terminal state.

## Candidate state separation
LOCAL_INTENT: durable local commitment to attempt delivery.
REQUEST_ACCEPTED: an intermediary/final target has durably accepted the operation under its own contract.
EFFECT_COMMITTED: target-side mutation/commit boundary is established.
EFFECT_OBSERVED: authoritative observation/receipt confirms the resulting state.
UNKNOWN_EXTERNAL: execution may have happened but the available evidence cannot establish its result.

## Explicit non-claims
Outbox is not universal exactly-once external execution and is not a substitute for target-side fencing, target-side idempotency, or authoritative reconciliation.

## Next
AB104.309 — investigate target-side idempotency + receipt protocols and the exact evidence needed to resolve UNKNOWN_EXTERNAL without unsafe replay.
