# NEXO AB104.761R — Kafka effect-boundary authorization audit

Date: 2026-09-28
Kafka source commit audited: abf522e1ca5d7f4375baddc4da004da9fcb6e9ca
Status: RESEARCH ONLY; no Nexo implementation; no runtime execution by this audit.

## Scope
Concrete Kafka operation with an externally meaningful effect: Produce. Goal: determine whether authorization is bound to current connection/session at the execution boundary or is evaluated from request-local context.

## Direct source findings
### Produce path
KafkaApis.handleProduceRequest builds the request's topic/partition set, then calls authHelper.filterByAuthorized(request.context, WRITE, TOPIC, ...). Unauthorized partitions are excluded from authorizedRequestInfo. The source then calls replicaManager.handleProduceAppend(...) using that authorizedRequestInfo.

This establishes a real authorization gate before the append call, but the authorization input is the already-created request.context. The audited source does not show a second generic authorization check immediately before replicaManager.handleProduceAppend, nor a generic revalidation that the originating transport/session is still current.

The source also shows that for acks=0, errors can cause requestChannel.closeConnection(request,...). That is transport/error handling after request processing; it is not evidence that an already-started append is canceled or rolled back.

### Fetch comparison
The Fetch path similarly uses authHelper authorization against request.context before selecting interesting partitions. This confirms that request-context authorization is a recurring handler pattern, not evidence of current-session revocation.

## Test evidence
Search of Kafka repository test names/content for dedicated Produce authorization execution at the exact adversarial boundary did not yield a test establishing:
`authorize(request) -> disconnect/revoke -> execute append -> assert append prevented`.
No runtime test was executed by this audit.

## Epistemic boundary
SOURCE_CONFIRMED: Produce has an authorization gate before replicaManager.handleProduceAppend.
SOURCE_CONFIRMED: gate consumes request.context from the queued Request.
NOT_ESTABLISHED: authorization is revalidated after disconnect/revocation but before append.
NOT_EXECUTED: exact disconnect/revocation interleaving.
NOT_ESTABLISHED: rollback/cancellation of an append already admitted to ReplicaManager.

## Nexo implications
`REQUEST_CONTEXT_AUTHORIZATION != CURRENT_AUTHORITY`
`AUTHORIZATION_CHECK != REVOCATION_RECHECK`
`TRANSPORT_CLOSE != APPEND_CANCELLATION`
`ACK/RESPONSE_BEHAVIOR != EFFECT_ABSENCE`

For Nexo, an external-effect boundary must bind execution to current authority/fencing independently of stale request context. A request that was authorized when created must not automatically remain authorized merely because it remains queued or reaches a handler later.

## State
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED

## Next mission
AB104.762R: audit the concrete authorization implementation used by authHelper.filterByAuthorized, including caching/memoization and identity/session inputs, then determine whether authorization can become stale relative to revocation or credential changes. Preserve UNKNOWN where source evidence does not close the race.
