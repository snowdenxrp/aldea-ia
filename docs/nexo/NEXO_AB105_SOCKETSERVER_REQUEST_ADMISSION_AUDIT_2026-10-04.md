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
