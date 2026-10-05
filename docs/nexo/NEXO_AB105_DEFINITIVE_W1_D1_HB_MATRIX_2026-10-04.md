# NEXO AB105 — Definitive W1→D1 HB Matrix — 2026-10-04

Kafka source pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Question
Can the inspected production path establish a Java Memory Model happens-before edge from incremental ACL mutation W1 to authorization D1?

## Edge matrix

| Edge | Status | Basis |
|---|---|---|
| MetadataLoader event sequencing → AclPublisher/W1 | 🟢 IDENTIFIED | MetadataLoader owns the event thread and synchronously invokes publisher callbacks. |
| W1 → D0_RETURN | 🔴 NOT IDENTIFIED | D0_RETURN reflects controller/metadata-log completion; no local target-broker W1 completion barrier established. |
| D0_RETURN → client request / ENQUEUE | 🟢 temporal/request flow only | A later request can be issued, but temporal order is not itself W1 publication. |
| W1 → ENQUEUE | 🔴 NOT IDENTIFIED | W1 runs in metadata execution domain; ENQUEUE runs in network Processor domain. |
| ENQUEUE → DEQUEUE | 🟢 IDENTIFIED | RequestChannel uses ArrayBlockingQueue put/poll; queue publication is a synchronization edge. |
| DEQUEUE → D1 | 🟢 IDENTIFIED | KafkaRequestHandler processes the dequeued request on the same handler thread. |
| Startup authorizer Future → request admission | 🟢 IDENTIFIED, startup-only | Endpoint readiness/initialLoadFuture gates broker startup, not incremental ACL updates. |
| W1 → SocketServer admission | 🔴 NOT IDENTIFIED | No per-update Future/offset/condition/lock dependency found. |
| W1 → AuthHelper | 🔴 NOT IDENTIFIED | AuthHelper directly invokes Authorizer; no metadata wait. |
| W1 → Authorizer D1 | 🔴 NOT IDENTIFIED | StandardAuthorizer reads data then delegates to StandardAuthorizerData; no per-call wait. |
| D1 → append/action continuation | 🟢 IDENTIFIED after authorization | Downstream synchronization occurs after D1 and cannot retroactively publish W1 to D1. |

## Critical implementation fact
StandardAuthorizer has volatile StandardAuthorizerData data, but incremental StandardAuthorizerData.addAcl/removeAcl replace the plain aclCache field inside the existing data object. StandardAuthorizer.authorize() reads data and then the nested plain cache through StandardAuthorizerData.authorize/findAclRule.

Therefore the volatile data access does not by itself establish publication of a later nested aclCache assignment when the same data object remains in use.

## What is established
- metadata callback execution reaches W1;
- RequestChannel provides ENQUEUE→DEQUEUE publication;
- request-handler program order reaches D1.

## What is NOT established
No inspected production mechanism closes the cross-domain gap:
W1 → [publication/readiness mechanism] → ENQUEUE/D1.

Searched mechanisms include MetadataLoader per-update Future, lastAppliedOffset request dependency, SocketServer request-admission wait, authorizer readiness Future after startup, AuthHelper authorization wait, and lock/condition around incremental ACL mutation.

No per-incremental-update dependency was identified.

## Epistemic status
HB(W1→D1): UNKNOWN / NOT IDENTIFIED.

This is a bounded source-audit conclusion, not proof that stale visibility is impossible.

Stale-read execution: NOT OBSERVED / NOT DISPROVEN.

Security vulnerability: NOT ESTABLISHED.

## Evidence separation
Do not merge PR92 in-process cache-identity diagnostics, PR94 real-broker temporal ordering witness, and PR93 production source/HB audit. They answer different questions.

## DO-NOT-REPEAT
- Do not rerun PR92.
- Do not rerun PR93.
- Do not rerun PR94/G0.
- Do not rerun TLC.
- Do not add volatile/latch/barrier/Future to force W1→D1 ordering.

## Next frontier
The source audit can move from path discovery to closure review: reconcile this matrix against all prior AB105 checkpoints and explicitly mark any earlier statement that overclaimed W1→D1 HB or stale-read proof. This is a documentation/epistemic reconciliation, not another experiment.