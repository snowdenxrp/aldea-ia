# NEXO AB105 G0 — ordering harness recovery checkpoint — 2026-10-03

## New finding
Exact PR #94 ordering workflow and v2 workflow are now recovered from the PR head itself (a3aaae3a7839b2ab079b90991231fd42f622e2f1).

Confirmed files:
- .github/workflows/nexo-ab105-g0-ordering-witness.yml
- .github/workflows/nexo-ab105-g0-ordering-witness-v2.yml

Run 37081442555 is confirmed:
- workflow: NEXO AB105 G0 ordering witness runner v2
- head: a3aaae3a7839b2ab079b90991231fd42f622e2f1
- conclusion: SUCCESS
- event: push
- PR: #94

## Harness semantics recovered
The v2 workflow:
1. clones Kafka at pinned revision 99b940733a9f6bc409457dba7108f08421d81e42;
2. installs ACL_W1 immediately after the plain aclCache = aclCacheSnapshot write;
3. instruments RequestChannel ENQUEUE and DEQUEUE;
4. writes the real-broker test into the pinned Kafka checkout;
5. runs the real broker witness.

The test itself:
- uses 1 broker + 1 controller;
- creates the ACL;
- waits for an ALLOWED produce;
- deletes the ACL;
- performs a post-delete produce;
- records D1 result.

No W1 signal, latch, volatile flag, Future, or wait on W1 is present in the recovered v2 harness. Therefore the previously raised concern that the v2 harness itself gates D1 on W1 is NOT supported by the source recovered here.

## Important boundary
The test's produce(producer) call is the real network-client path. RequestChannel ENQUEUE is instrumented inside Kafka's broker-side Processor path. This is materially different from the older bootstrap test, where D1 used a direct TARGET.authorize(...) call.

The recovered v2 source therefore validates that the 10/10 W1 < ENQUEUE < DEQUEUE < AUTH observations came from the intended real-broker/network path.

## Remaining UNKNOWN
Source recovery removes the harness-gating uncertainty, but it does not prove JMM happens-before:
- W1 -> ENQUEUE JMM edge remains UNKNOWN;
- W1 -> authorization-reader visibility remains UNKNOWN;
- stale read remains UNKNOWN;
- incorrect authorization consequence remains UNKNOWN;
- exploitability/generalization/production impact remain UNKNOWN.

The temporal witness remains valid as temporal evidence, not as a JMM proof.

## Frozen state
- AB105.116R: UNCHANGED
- AB105.117R: NOT CREATED
- TLC: NOT RERUN
- PR #94: draft/unmerged
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Next exact action
Continue source-level causal audit from the real network request publication path toward the authorization read. Do not add W1 gating. Do not repeat the same v2 run merely to reproduce 10/10 temporal ordering.
