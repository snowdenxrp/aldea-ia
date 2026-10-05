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
