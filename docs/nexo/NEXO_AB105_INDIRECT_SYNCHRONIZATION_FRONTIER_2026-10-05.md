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


## Continuity resumption — BrokerServer lifecycle lock / scheduler boundary — 2026-10-05

Exact AB105 Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

Inspected exact `BrokerServer.scala` lifecycle/startup synchronization around the metadata publisher and request-processing startup.

### Verified
- `BrokerServer` has a `ReentrantLock` and `Condition`, but `maybeChangeStatus` uses them only for broker process-status transitions and shutdown notification.
- The lock is not acquired by `AclPublisher.onMetadataUpdate`, MetadataLoader publication, RequestChannel admission, KafkaRequestHandler authorization, or AuthHelper in the inspected path.
- BrokerServer creates the `AclPublisher` as part of `BrokerMetadataPublisher`; this does not add a per-update lock handoff to request processing.
- `initialCatchUpFuture`, `firstPublishFuture`, and authorizer endpoint futures are explicitly awaited during startup before request processing is enabled. This is startup synchronization already classified as such, not a steady-state per-ACL-update edge.
- The broker's scheduler is started during startup, but no causal W1-derived scheduler submission into the request/authorization path was identified in this boundary.

### JMM interpretation
A lock/condition can establish happens-before only when the relevant threads actually release/acquire the same synchronizer in a causally connected path. Java's concurrency specification explicitly defines those release/acquire guarantees. citeturn0search0turn0search1 The BrokerServer lifecycle lock therefore cannot be promoted to W1→D1 HB merely because it exists.

### Epistemic state
- 🟢 BrokerServer lifecycle lock/condition are real, but their scope is status/shutdown.
- 🟢 Startup futures remain confirmed as startup-only synchronization.
- 🟡 No new post-startup cross-domain synchronization edge identified.
- 🔴 W1→D1 HB remains UNKNOWN / NOT IDENTIFIED.
- 🔴 stale ACL read remains NOT OBSERVED / NOT DISPROVEN.
- 🔴 vulnerability remains NOT ESTABLISHED.

### DO-NOT-REPEAT
Do not re-audit the BrokerServer lifecycle lock/startup-future boundary unless new source evidence shows W1 causally acquires/releases it or derives a request from it.

### Next frontier
Continue only with a concrete post-startup cross-domain executor submission, concurrent-collection handoff, synchronizer, or W1-derived callback that reaches request admission/authorization.


## Continuity resumption — metadataCache volatile ordering candidate — 2026-10-05

Exact AB105 Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

### New candidate audited
A potentially important indirect bridge was checked: `KRaftMetadataCache.currentImage` is `volatile`, and `KafkaApis` reads metadataCache during request handling. Because volatile publication can establish HB, this had to be tested against the exact publisher ordering rather than dismissed by search alone.

### Exact source result
In pinned `BrokerMetadataPublisher.onMetadataUpdate`:
1. `metadataCache.setImage(newImage)` executes first.
2. Only later in the same MetadataLoader callback does `aclPublisher.onMetadataUpdate(delta, newImage, manifest)` execute.
3. Therefore the volatile metadata-cache publication is **before W1**, not after W1.
4. A later request-thread read of `currentImage` can publish the metadata-image write to that reader, but it cannot retroactively publish the later ACL mutation W1, because program order is `metadataCache.setImage -> ... -> W1`.
5. `KafkaApis` performs direct `authHelper.authorize(...) ` calls; metadataCache accesses in request handlers are not an observed per-request ACL publication barrier.

### Critical conclusion
This candidate is **CLOSED as a W1→D1 HB bridge**.
It is not enough that both W1 and D1 touch metadata-related state. The exact ordering is the opposite of what would be required for transitive HB from W1 through the volatile cache publication.

Formally, the inspected path gives:
`metadataCache volatile write -> W1` (program order), and potentially `metadataCache volatile write -> later metadataCache read`; it does **not** give `W1 -> volatile write -> D1`.

### Epistemic state
- 🟢 `KRaftMetadataCache.currentImage` volatile publication is real.
- 🟢 BrokerMetadataPublisher ordering is verified: cache publication precedes ACL publication.
- 🟢 This candidate does not establish W1→D1 HB.
- 🟡 Other post-W1 shared-state publications remain to be checked only if they are actually read before authorization.
- 🔴 stale ACL read not reproduced.
- 🔴 vulnerability not established.

### DO-NOT-REPEAT
Do not re-audit `KRaftMetadataCache.currentImage` ordering unless new source evidence changes the pinned publisher order.

### Next frontier
The remaining high-value question is narrower: **after W1, does any other publisher in the same metadata callback perform a synchronization/publication operation on state that the request path reads before D1?** If yes, trace that exact state and its synchronization semantics. If no, retain UNKNOWN.


## Continuation — post-W1 publishers audit — 2026-10-05

Inspected the exact pinned `BrokerMetadataPublisher.onMetadataUpdate` continuation after `aclPublisher.onMetadataUpdate(...)`.

Verified order:
`W1 ACL publisher` → `groupCoordinator.onMetadataUpdate` → `shareCoordinator.onMetadataUpdate` → feature/share-version handling → `firstPublishFuture.complete`.

No inspected operation in this post-W1 sequence is a request-admission/authorization callback. The request path enters `KafkaApis` independently and performs `authHelper.authorize(...)` directly. Therefore these post-W1 publisher calls do not, by themselves, create a demonstrated W1→D1 synchronization edge.

The `firstPublishFuture.complete` at the end is the already-closed startup readiness future; it is not a per-update future and is not awaited by steady-state request authorization.

### Status
- 🟢 Post-W1 callback order verified from exact pin.
- 🟢 Startup future remains startup-only.
- 🟡 A deeper synchronizer inside group/share coordinator code is only relevant if D1 reads the same state before authorization; no such causal path is established here.
- 🔴 No new W1→D1 HB edge identified.
- 🔴 stale ACL read not reproduced.
- 🔴 vulnerability not established.

### DO-NOT-REPEAT
Do not re-audit BrokerMetadataPublisher's post-W1 ordering unless a new candidate identifies a specific shared state read by D1.

### Next frontier
Inspect the exact request-side authorization boundary for any shared state produced after W1 that is actually consumed before `AuthHelper.authorize`; otherwise retain UNKNOWN.


## Continuation — request-side shared-state candidate audit — 2026-10-05

Exact pinned `KafkaApis.scala` was inspected at `99b940733a9f6bc409457dba7108f08421d81e42` around multiple direct authorization sites.

Verified: authorization is invoked directly through `authHelper.authorize(...)` from request-handler code. Some request handlers read `metadataCache` for topic/broker metadata, but the inspected authorization sites do not first perform a metadata-version/offset wait, ACL-publisher callback, or explicit synchronization with MetadataLoader/W1.

Important distinction: `KafkaApis` does contain unrelated `CompletableFuture`, `ConcurrentHashMap`, and `AtomicInteger` uses in other request operations. Their existence is not a W1→D1 edge. No inspected authorization path showed a Future.get, executor handoff, or concurrent-collection handoff causally originating at W1 before authorization.

### Result
- 🟢 Direct request-side authorization boundary verified.
- 🟢 MetadataCache reads can coexist with authorization, but no per-request ACL publication gate was identified.
- 🟢 Unrelated concurrent structures/futures are not promoted as evidence without a causal W1 path.
- 🟡 Other concrete shared state immediately surrounding `AuthHelper` remains the only worthwhile candidate if it can be traced to W1.
- 🔴 W1→D1 HB still UNKNOWN / NOT IDENTIFIED.
- 🔴 stale ACL read not reproduced.
- 🔴 vulnerability not established.

### DO-NOT-REPEAT
Do not treat arbitrary `CompletableFuture`, `ConcurrentHashMap`, or `AtomicInteger` instances in KafkaApis as synchronization evidence; only a structure causally connected to W1 and consumed before D1 qualifies.

### Next frontier
Audit `AuthHelper` and the concrete `AuthorizerPlugin` call boundary for any hidden executor/Future/lock/collection synchronization immediately before the authorizer invocation. Stop at the first actual W1-connected edge.


## Continuation — AuthHelper / Plugin / Authorizer boundary — 2026-10-05

Exact AB105-pinned `AuthHelper.java`, `Plugin.java`, and `Authorizer.java` were inspected at Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42`.

Verified:
- `AuthHelper.authorize()` constructs the Action and directly calls `authorizer.get().authorize(...)`; no Future wait, executor submission, lock, condition, metadata-offset check, or queue handoff occurs in this boundary.
- `Plugin.get()` simply returns the wrapped authorizer instance; it introduces no synchronization.
- The Authorizer contract states that `authorize()` is a synchronous API invoked on the request thread using locally cached ACLs.
- The Authorizer threading contract requires authorization and ACL updates to be thread-safe, but that contract does not itself create a W1→D1 happens-before edge.
- The `start()` futures are explicitly readiness/startup futures for accepting requests; they are not per-ACL-update waits.

### Result
- 🟢 AuthHelper → Authorizer invocation boundary verified as direct.
- 🟢 Plugin wrapper does not bridge W1 to D1.
- 🟢 Thread-safety requirement confirmed as a contract, not a publication proof.
- 🔴 No new W1→D1 HB edge identified.
- 🟡 HB(W1→D1) remains UNKNOWN / NOT IDENTIFIED.
- 🔴 stale ACL read not reproduced.
- 🔴 vulnerability not established.

### DO-NOT-REPEAT
Do not re-audit `AuthHelper → Plugin.get() → Authorizer.authorize()` unless a new implementation or call-site evidence changes the pinned path. The remaining question is now implementation-specific synchronization/state inside the concrete authorizer, already narrowed to `StandardAuthorizerData` cache visibility.

### Next frontier
Reconcile the Authorizer thread-safety contract against the exact pinned `StandardAuthorizer` / `StandardAuthorizerData` implementation and any alternate authorizer implementation actually used by the experiment. Stop if no additional publication edge exists.


## Continuation — final StandardAuthorizer reconciliation — 2026-10-05

Exact AB105 pin `99b940733a9f6bc409457dba7108f08421d81e42` was re-inspected against the Authorizer thread-safety contract.

### Definitive source facts
- `StandardAuthorizer.data` is `volatile`.
- `authorize()` performs a volatile read of `data` into `curData`, then calls `curData.authorize()`.
- Incremental `addAcl/removeAcl` mutate the existing `StandardAuthorizerData` through `data.addAcl/removeAcl`; they do not replace the outer volatile `data` reference.
- `StandardAuthorizerData.aclCache` is plain, and the class explicitly says it is not thread-safe.
- `removeAcl/addAcl` replace that plain `aclCache` reference inside the same `StandardAuthorizerData` object.
- `findAclRule()` later reads the plain `aclCache` into `aclCacheSnapshot`.
- The comment claiming a read-write lock exists is not matched by an actual lock field/import/use in this exact pinned implementation. This is source/comment inconsistency, not evidence of a hidden lock.
- `start()` / `initialLoadFuture` remain startup readiness only.

### Consequence
The outer volatile read can publish the `StandardAuthorizerData` object/reference, but the incremental W1 mutation occurs later inside that already-published object. There is no identified synchronization edge from that nested plain `aclCache` replacement to D1's later plain `aclCache` read. Under the JMM, volatile HB applies to a write/read of the same volatile field; HB is formed by program order plus synchronization edges. It cannot be inferred merely from the presence of the volatile outer reference. citeturn0search12

### Epistemic state
- 🟢 Exact implementation shape verified.
- 🟢 Authorizer thread-safety contract verified.
- 🟢 Comment-vs-implementation lock discrepancy verified.
- 🔴 No hidden W1→D1 synchronization edge identified in this implementation.
- 🟡 HB(W1→D1) = UNKNOWN / NOT IDENTIFIED.
- 🟡 stale ACL read = NOT OBSERVED / NOT DISPROVEN.
- 🔴 vulnerability/security impact = NOT ESTABLISHED.

### DO-NOT-REPEAT
The exact `StandardAuthorizer` / `StandardAuthorizerData` lock hypothesis is CLOSED for this pin. Do not substitute a later Kafka implementation containing a read-write lock, and do not interpret the stale comment as an implemented synchronization primitive.

### Next frontier
Only a genuinely new causal edge outside the already audited path can change the conclusion. The remaining high-value check is alternate authorizer configuration/implementation actually used by the witness; if the witness uses StandardAuthorizer, the source-side HB investigation is exhausted and the remaining question is empirical stale-read reproduction, which current evidence has not achieved.


## Continuation — concrete authorizer used by G0 witness — 2026-10-05

The G0 v2 workflow and AB105.117R raw-evidence checkpoint were reconciled against the authorizer question.

The workflow checks out the exact Kafka pin `99b940733a9f6bc409457dba7108f08421d81e42` and injects the `ACL_W1`, `AUTH_ENTER`, and `AUTH_DECISION` probes directly into `metadata/.../StandardAuthorizerData.java`. The successful AB105.117R artifact reports the expected ACL_W1 and authorization markers. Therefore the real-broker witness is exercising the pinned `StandardAuthorizerData` implementation rather than an unexamined alternate authorizer implementation.

This closes the alternate-authorizer ambiguity for G0. It does not convert the ordering witness into JMM proof: the raw witness still lacks an R1/downstream-effect marker and does not establish W1→D1 happens-before. The JMM requires an actual happens-before chain built from program order and synchronization edges; timestamps/temporal observation alone are insufficient. citeturn0search13

### Result
- 🟢 Concrete authorizer implementation used by G0 witness: pinned `StandardAuthorizerData`.
- 🟢 Source-side implementation and runtime instrumentation refer to the same class.
- 🟢 Alternate-authorizer ambiguity for this witness CLOSED.
- 🟡 HB(W1→D1) remains UNKNOWN / NOT IDENTIFIED.
- 🟡 stale ACL read remains NOT OBSERVED / NOT DISPROVEN.
- 🔴 vulnerability/security impact remains NOT ESTABLISHED.

### DO-NOT-REPEAT
Do not reopen alternate-authorizer configuration for the G0 witness unless a new raw artifact shows a different authorizer class. Do not infer HB from the successful runtime ordering witness.

### Next frontier
The source-side W1→D1 investigation is now exhausted for the concrete G0 authorizer path. The remaining high-value question is empirical: whether the existing real-broker harness can observe the actual authorization cache identity/value used by D1 without introducing synchronization or changing the experiment semantics. Any such probe must preserve the existing witness and must not add a W1-derived barrier.


## Continuation — AB105.117R raw-artifact inspection and stale-cache probe boundary — 2026-10-05

The preserved artifact `11265332252` (SHA-256 `d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c`) was downloaded and inspected directly. It contains only `nexo-ordering.log` and `nexo-ordering-evidence.txt`.

The raw trace confirms the existing witness markers but contains no cache identity/cache-membership observation at D1. In the observed cycles, D1 authorization decisions are DENIED after ACL_W1; this is an observed result, not proof that D1 necessarily observed the post-removal cache under the JMM.

The exact harness source was also recovered from the pinned commit/workflow. It explicitly configures:
`ServerConfigs.AUTHORIZER_CLASS_NAME_CONFIG = org.apache.kafka.metadata.authorizer.StandardAuthorizer`.
Thus the concrete-authorizer conclusion is independently confirmed by the harness configuration, not only by probe placement.

### Safe empirical probe constraint
A useful next experiment must observe the cache state actually used by D1 without creating a W1→D1 synchronization edge. In particular, extending the existing `System.err.println` instrumentation at D1 would be unsafe as a proof mechanism because W1 already prints to the same `System.err` stream; a shared PrintStream synchronization path could itself create an artificial publication chain.

A candidate diagnostic therefore must keep the W1 marker and D1 cache observation on distinct publication mechanisms (for example, separate output streams) or otherwise prove that the observation mechanism itself does not connect W1 to D1. The observation may change timing, so it remains a diagnostic experiment rather than a proof by itself. It must not add volatile/latch/barrier/Future synchronization derived from W1.

### Result
- 🟢 AB105.117R raw artifact independently inspected.
- 🟢 No D1 cache identity/membership observation exists in 117R.
- 🟢 Exact witness harness explicitly configures pinned StandardAuthorizer.
- 🟢 Existing D1 DENIED observations remain valid temporal evidence only.
- 🟡 Actual D1 cache identity/value remains unobserved.
- 🟡 stale-read reproduction remains NOT OBSERVED / NOT DISPROVEN.
- 🟡 HB(W1→D1) remains UNKNOWN / NOT IDENTIFIED.
- 🔴 vulnerability/security impact remains NOT ESTABLISHED.

### DO-NOT-REPEAT
Do not rerun 117R unchanged. Do not use the existing shared `System.err` marker as proof of cache visibility. Do not add a W1-derived synchronization primitive.

### Next frontier
Design/inspect one **new diagnostic-only cache observation** that records the exact `AclCache` identity and whether the target ACL is still present at D1, while avoiding any synchronization path from W1 to that D1 read. First validate the instrumentation itself for absence of an artificial HB edge; only then consider execution.


## Continuation — cache probe design resolved — 2026-10-05

Exact pinned `AclCache` and `StandardAuthorizerData.findAclRule()` were inspected.

A safe diagnostic point exists **inside the same D1 snapshot** that authorization uses: `findAclRule()` assigns `AclCache aclCacheSnapshot = aclCache` and then passes that exact snapshot to both `checkSection(...)` calls. `AclCache` is immutable; its ACL set is exposed through `aclsByResource()`. Therefore a probe can inspect that already-selected snapshot without publishing or changing authorizer state.

The target ACL can be identified structurally (exact TOPIC name + expected principal/operation/permission), avoiding any W1→D1 shared variable carrying the ACL ID. The probe can record:
- D1 thread/correlation id;
- `System.identityHashCode(aclCacheSnapshot)` as a diagnostic identity token;
- snapshot ACL count;
- whether the target ACL is present in that exact snapshot.

### Instrumentation safety constraint
The observation must occur **after the local snapshot read** and before/alongside the existing scan, and it must not write to any state later consumed by W1/D1. For output, W1 and D1 must not share the same `PrintStream`/logger publication mechanism. A separate output stream (or an independent per-thread file record) is acceptable only as an observation sink; the cache read must happen before the sink operation. The sink is not evidence of W1→D1 HB.

This is materially stronger than merely logging at AUTH_ENTER: it observes the exact `AclCacheSnapshot` from which the authorization decision is computed. It still remains a diagnostic experiment, not a JMM proof, because instrumentation can affect timing. The JMM defines HB from program order plus synchronization edges; an observation must not manufacture the edge under investigation. citeturn0search12turn0search13

### Expected diagnostic classifications
- **POST_W1_CACHE**: D1 snapshot lacks the target ACL → direct empirical evidence that D1 used a cache after removal.
- **PRE_W1_CACHE**: D1 snapshot still contains the target ACL → direct empirical stale-cache evidence for that authorization attempt, provided the cycle's W1 is independently established.
- **AMBIGUOUS**: probe cannot uniquely classify the target snapshot/cycle.

Important: even repeated PRE_W1_CACHE observations would establish an observed stale-cache behavior under the diagnostic setup, but would not by themselves prove a general vulnerability or generalize beyond the exact pinned configuration/workload.

### Result
- 🟢 Exact D1 cache snapshot point identified.
- 🟢 No W1-shared variable is required to identify the target ACL.
- 🟢 Cache is immutable, so inspection does not mutate the observed state.
- 🟡 Runtime stale-cache behavior remains unobserved.
- 🟡 HB(W1→D1) remains UNKNOWN.
- 🔴 vulnerability remains NOT ESTABLISHED.

### DO-NOT-REPEAT
Do not instrument before `AclCache aclCacheSnapshot = aclCache` and call that D1-cache evidence. Do not use the shared W1/D1 `System.err` sink. Do not add volatile/latch/barrier/Future synchronization. Do not rerun 117R unchanged.

### Next frontier
Implement only this diagnostic probe, validate the probe has no W1→D1 synchronization path, then run it as a distinct evidence generation step. Preserve 117R unchanged as the baseline.
