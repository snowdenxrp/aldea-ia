# NEXO CONTINUITY — AB104.758

Date: 2026-09-28

Canonical handoff remains `docs/nexo/NEXO_CONTINUITY_HANDOFF_2026-09-24.md`. This addendum preserves the exact next state without rewriting or deleting prior history.

## AB104.758R
Commit: `db5b9d01ffb109f7850ae647009a9a5ec74e70c7`

Research target: `SocketServer.processChannelException()` and the boundary between channel invalidation, pending responses, and already-enqueued requests.

Findings:
- `processChannelException()` closes the affected open/closing channel, then records the exception through `processException()`.
- `close(connectionId)` removes the selector channel, decrements quota, notifies disconnect listeners, and removes any pending `inflightResponses` entry while updating metrics.
- `processCompletedReceives()` explicitly closes the receive buffer if request/header construction has not completed.
- If a `Request` has already been created and sent to `RequestChannel`, channel closure does not by itself prove that the already-enqueued logical request disappears. RequestChannel/connection-identity handling is a separate lifecycle and remains to be audited.
- The processor isolates per-channel failures and continues its processing loop; an outer Throwable guard prevents ordinary unexpected exceptions from terminating the processor thread.

Evidence classification:
`CHANNEL_CLOSE_ON_PROCESSING_ERROR=SOURCE_CONFIRMED`
`SELECTOR_CHANNEL_REMOVAL=SOURCE_CONFIRMED`
`INFLIGHT_RESPONSE_DROP_ON_CLOSE=SOURCE_CONFIRMED`
`PRE_REQUEST_BUFFER_RELEASE=SOURCE_CONFIRMED`
`ALREADY_ENQUEUED_REQUEST_AUTO_REMOVAL_BY_CLOSE=NOT_ESTABLISHED`
`PER_CHANNEL_EXCEPTION_ISOLATION=SOURCE_CONFIRMED`
`EXACT_RUNTIME_FENCE_QUEUE_TEST=NOT_EXECUTED`

Architecture implication: transport/channel closure is a local invalidation/fence, but it must not be treated as automatic revocation of already-enqueued logical work or as proof that an external effect cannot occur. This directly reinforces Nexo's separate identities for authority, queued operation, transport/resource incarnation and external effect.

## Exact next action
AB104.759R: inspect `RequestChannel` and the request/response lifecycle after a channel closes, especially whether queued requests can still be processed after their connection has been invalidated, what identity/fence check prevents stale work from producing an effect, and what tests actually execute that behavior.

No Nexo implementation. No V21. No formal/runtime correctness claim.
