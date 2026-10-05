# NEXO AB105 — CONTINUITY Indirect Synchronization Frontier — 2026-10-05

## Purpose
Continue from the reconciled CONTINUITY state without repeating closed experiments. This checkpoint records the next bounded audit of possible indirect production synchronization between MetadataLoader W1 and independently generated request publication/D1.

## Evidence reviewed

### Repository search
Searches in `snowdenxrp/aldea-ia` for:
- `CompletableFuture AclPublisher MetadataLoader StandardAuthorizer`
- `MetadataLoader KafkaEventQueue executor AclPublisher`
- `StandardAuthorizerData aclCache lock synchronized`
- `AclPublisher executor submit Future`
- `BrokerMetadataPublisher executor metadata publisher`

returned no indexed matches. These negative search results are **not absence proofs**; GitHub code-search indexing limitations remain.

### Upstream Kafka source cross-check
Current Apache Kafka source was checked as a cross-check, not substituted for the pinned experimental source.

1. `StandardAuthorizer` still exposes:
   - `initialLoadFuture` as the future for reaching the initial metadata high watermark.
   - `start(...)` returns that future for non-early-start listeners.
   - `authorize(...)` synchronously snapshots `data` and performs authorization.
   - incremental `addAcl/removeAcl` directly delegate to `data.addAcl/removeAcl`.
   - no per-incremental-update Future is awaited by `authorize()`.

2. Kafka's `Authorizer` interface documents:
   - startup authorization readiness through `start(...)` futures;
   - synchronous `authorize(...)` for locally cached ACLs;
   - an explicit threading-model requirement that authorizer operations, including ACL updates, be thread-safe.
   This is an API contract, not proof of a particular JMM synchronization edge in StandardAuthorizer.

3. Broker/Controller startup code confirms the authorizer future is used to gate request-processing startup. That barrier is startup/readiness, not a per-ACL-update publication barrier.

## New epistemic finding

🟢 **VERIFIED / OBSERVED (source-level contract):**
Kafka's public Authorizer contract requires thread-safe authorizer operations and describes `start()` futures as listener readiness. `authorize()` is synchronous and intended for locally cached ACLs.

🟢 **VERIFIED / OBSERVED (source cross-check):**
The inspected current Kafka source still does not reveal a per-update Future/lock/condition/queue handoff from an incremental ACL update to each later request authorization.

🟡 **UNKNOWN / PENDING:**
Whether an indirect production synchronization edge exists outside the inspected call paths remains unresolved. Search non-results cannot prove absence.

🔴 **NOT ESTABLISHED:**
No stale read has been reproduced from this finding.
No security vulnerability has been proven.
No W1→D1 happens-before edge has been proven.

## Important distinction
The thread-safety requirement on the Authorizer interface must not be silently converted into a concrete JMM happens-before edge. A contract saying operations must be thread-safe is not itself evidence that W1 synchronizes-with D1.

Likewise, the startup `initialLoadFuture` proves only initial readiness. It must not be promoted to a steady-state ACL-update publication barrier.

## Reconciliation with canonical state
No prior accepted evidence is superseded.
No new runtime sample was created.
AB105.117R remains the canonical raw broker witness.
370778 remains HISTORICAL / UNRESOLVED and is not counted as another sample.

## DO-NOT-REPEAT
Do not rerun PR92, PR93, PR94/G0, TLC, or AB105.117R.
Do not introduce volatile/latch/barrier/Future synchronization into the experiment.
Do not treat temporal ordering, D1 DENIED, or the Authorizer thread-safety contract as proof of stale-read absence or HB(W1→D1).

## Next frontier
Continue only with production code paths that can actually carry a synchronization/publication relation from the MetadataLoader/AclPublisher domain into request admission or authorization. Priority:
1. concrete executor submission/completion crossing the two domains;
2. concrete concurrent-collection handoff crossing the two domains;
3. concrete lock/condition/semaphore handoff crossing the two domains;
4. any request-admission metadata-version/offset gate actually executed per request.

Stop at the first real edge. If none is identified, retain **HB(W1→D1) = UNKNOWN / NOT IDENTIFIED**.


## Continuity resumption — metadata-offset candidate — 2026-10-05

Exact AB105 pin: 99b940733a9f6bc409457dba7108f08421d81e42.

Verified: BrokerLifecycleManager receives highest applied metadata offset/provenance and reports it as currentMetadataOffset in BrokerHeartbeatRequestData. During STARTING/RECOVERY, controller heartbeat responses drive initial catch-up/unfence futures. BrokerServer waits for initial unfencing before enabling inbound request processing. Once RUNNING, a successful heartbeat response only schedules the next heartbeat; no per-update ACL metadata-offset wait was identified in RequestChannel, KafkaRequestHandler, AuthHelper, or StandardAuthorizer authorization. KafkaApis authorization calls are direct authHelper.authorize calls inside request handling; no metadata-version/offset wait was identified immediately before authorization.

Conclusion: metadata offset is a real lifecycle/provenance signal and startup gate, but NOT a per-ACL request-admission/authorization gate. It does not establish W1 -> D1 happens-before.

State: W1 -> D1 HB = UNKNOWN / NOT IDENTIFIED; stale ACL read = NOT OBSERVED / NOT DISPROVEN; vulnerability = NOT ESTABLISHED; metadata-offset/lifecycle candidate = CLOSED.

DO-NOT-REPEAT: metadata-offset/lifecycle candidate. Next frontier remains only post-startup cross-domain executor submission, concurrent-collection handoff, synchronizer, callback, or explicit per-request metadata-version check not already audited.


## Continuity resumption — request-handler callback/executor boundary — 2026-10-05

Exact AB105 Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

Inspected exact `KafkaRequestHandler.scala` at the pinned source.

### Verified
- Request handlers are dedicated Kafka threads started directly by `KafkaThread.daemon(...).start()`; this is request-pool startup, not a W1-derived submission edge.
- `KafkaRequestHandler.run()` receives requests through `RequestChannel.receiveRequest(...)`, then executes `apis.handle(request, requestLocal)` in the handler thread.
- `wrapAsyncCallback` can reschedule an asynchronous callback onto a request thread through `requestChannel.sendCallbackRequest(...)`, but the wrapper is explicitly required to be created from an existing request thread and captures that request's channel/current request. It is therefore a request-originated callback bridge, not a MetadataLoader/AclPublisher-to-request publication primitive.
- The only `CountDownLatch` in this handler is `shutdownComplete`; it coordinates shutdown completion and is unrelated to ACL publication.
- The request handler pool's `synchronized` methods protect thread-pool resize/shutdown bookkeeping; they do not synchronize MetadataLoader W1 with authorization.
- KafkaApis at the same pin contains no `wrapAsyncCallback` use, so this generic callback mechanism does not provide an observed W1→D1 path in the inspected authorization path.

### JMM interpretation
An executor submission, concurrent-collection handoff, Future.get, or synchronizer acquire could establish HB when causally connected to W1; Java documents those guarantees. cite turn0search0 turn0search1 turn0search3 No such W1-derived operation was identified in this request-handler boundary.

### Epistemic state
- 🟢 Request-thread callback machinery is real, but its causal origin is request-side, not W1.
- 🟢 Request handler startup/thread creation is not a per-ACL synchronization edge.
- 🟢 Shutdown latch/pool synchronization is unrelated to steady-state ACL authorization.
- 🟡 Other post-startup cross-domain bridges remain to be checked.
- 🔴 No stale ACL read reproduced.
- 🔴 No vulnerability established.
- 🟡 HB(W1→D1) remains UNKNOWN / NOT IDENTIFIED.

### DO-NOT-REPEAT
Do not re-audit the request-handler callback/shutdown-latch boundary unless new evidence shows MetadataLoader/AclPublisher causally invokes it.

### Next frontier
Continue with concrete cross-domain executor submission, concurrent-collection publication, lock/condition/semaphore handoff, or a W1-derived callback into request admission. Stop at the first actual synchronization edge; otherwise retain UNKNOWN.
