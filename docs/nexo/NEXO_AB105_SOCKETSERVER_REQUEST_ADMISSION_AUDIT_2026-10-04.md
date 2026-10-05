# NEXO AB105 — SocketServer/Request Admission Audit (2026-10-04)

Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## 🟢 Verified
SocketServer.enableRequestProcessing(authorizerFutures) uses authorizer futures only to gate startup of acceptors/processors. Each acceptor starts when its associated authorizer future completes; the all-authorizer future is likewise a startup gate.

After startup, the inspected SocketServer path contains no per-metadata-update wait, offset check, ACL future, condition, or lock before accepting requests.

KafkaApis performs authorization through AuthHelper.authorize(...) during request handling. The inspected KafkaApis source contains no call to MetadataLoader.lastAppliedOffset() as a prerequisite to authorization; lastAppliedOffset() is supplied to BrokerLifecycleManager for lifecycle/catch-up purposes.

## 🔵 HB consequence
Startup authorizer Future → request admission is real, but only establishes initial readiness.
There is no identified steady-state edge:
W1 (incremental AclPublisher mutation) → SocketServer admission → D1.

RequestChannel ENQUEUE → DEQUEUE remains valid, but it begins in the request/network domain and does not acquire W1 publication by itself.

## Current result
HB(W1→D1) = UNKNOWN / NOT IDENTIFIED.
Stale-read execution = NOT OBSERVED / NOT DISPROVEN.
Security vulnerability = NOT ESTABLISHED.

This closes the SocketServer/request-admission hypothesis to the extent of the inspected production path.

## DO-NOT-REPEAT
Do not rerun PR92/PR93/PR94 or TLC.
Do not add synchronization to the experiment.

## Remaining frontier
Only inspect whether a hidden per-request metadata-readiness dependency exists inside AuthHelper/authorization itself or an immediately enclosing request-handler path. If absent, the source audit can be closed as bounded NOT-IDENTIFIED HB.


## 2026-10-04 continuation — AuthHelper → Authorizer

### 🟢 Direct invocation confirmed
At the pinned Kafka source, AuthHelper.authorize(...) performs no wait, Future join, condition, lock acquisition, metadata-offset check, or MetadataLoader consultation. It constructs the Action and directly calls authorizer.get().authorize(requestContext, actions).

### 🟢 StandardAuthorizer readiness is startup-only
StandardAuthorizer.start() returns initialLoadFuture for non-early-start listeners. That future represents initial ACL loading only. After startup, StandardAuthorizer.authorize() reads the current data reference and immediately delegates to StandardAuthorizerData.authorize().

### 🟢 Incremental ACL mutation has no per-request completion dependency
StandardAuthorizerData.addAcl/removeAcl mutate the plain aclCache field by assigning a newly returned cache. authorize/findAclRule subsequently reads that plain field. No per-call synchronization was identified between these operations.

### 🔵 Important JMM consequence
The volatile StandardAuthorizer.data read/write is not, by itself, a publication mechanism for later writes to the nested plain aclCache when the same StandardAuthorizerData instance is retained during incremental mutation. Therefore the inspected source still does not identify an HB edge from incremental W1 mutation to D1 authorization.

This is consistent with the earlier PR93 source finding and does not prove that a stale read will occur in production.

## Frontier status
Inspected chain:
MetadataLoader → AclPublisher → StandardAuthorizerData.removeAcl (W1)
Request/network → RequestChannel → KafkaRequestHandler → KafkaApis → AuthHelper → Authorizer.authorize (D1)

Known edges remain on each execution domain, but W1→D1 publication is not identified.

Result: HB(W1→D1) = UNKNOWN / NOT IDENTIFIED; stale-read execution = NOT OBSERVED / NOT DISPROVEN; vulnerability = NOT ESTABLISHED.

No runtime experiment was repeated. No artificial synchronization was added.
