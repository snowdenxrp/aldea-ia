# NEXO AB105 G0 — archaeology pass 3: recovered real-RPC execution boundaries

Date: 2026-10-02

## Finding 1 — historical successful G0 bootstrap is NOT a real-RPC ordering witness

PR #91 workflow source was recovered directly. The successful run 36969192502 / job 110719406205 / commit 96aee422... executed the harness, but its D1 measurement calls `targetAuthorizer.authorize(userContext(), ...)` directly after D0. Therefore its successful witness
`G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1`
is valid historical runtime behavior for that harness, but NOT RequestChannel/RPC ordering evidence.

## Finding 2 — PR #84 is a genuine real-Producer D1 candidate, but execution failed before R1 observation

PR #84 head: c4ebe094282d7315a0d57c2ae83c256dbe08588e.
Workflow run: 36943032652.
Job: 110638707860.
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

The recovered PR #84 patch changes D1 to a NEW `KafkaProducer` request:
`d1Producer.send(new ProducerRecord<>(TOPIC_NAME, 0, null, new byte[] {2})).get()`
and observes D1 only through the target broker's `TargetAuthorizer.authorize()` callback. No direct `TARGET.authorize()` D1 call remains in that discriminator.

Execution facts from the raw job:
- Kafka source clone and pinned checkout succeeded.
- Test infrastructure compilation succeeded.
- The real runtime test executed.
- The test failed at the assertion `D1 authorization decision was not observed`.
- Producer repeatedly received `TOPIC_AUTHORIZATION_FAILED`.
- No recoverable `G0_PROPAGATION_WITNESS` artifact was emitted because the test did not reach the witness-writing path.

Therefore:
- 🟢 real Producer/network D1 path: EXECUTED.
- 🟢 target-local authorization callback instrumentation: PRESENT.
- 🔴 R1 callback observation in that run: NOT OBSERVED.
- 🔴 propagation-window witness: NOT ESTABLISHED.
- W1→R1: UNKNOWN.

## Finding 3 — PR #94 contains the missing queue probes, but no successful raw execution has been recovered

PR #94 workflow explicitly instruments:
- `StandardAuthorizerData.removeAcl()` after `aclCache = aclCacheSnapshot`: `NEXO_ORDER ACL_W1`
- `RequestChannel.sendRequest()`: `NEXO_ORDER ENQUEUE`
- `RequestChannel.receiveRequest()`: `NEXO_ORDER DEQUEUE`
- authorization entry: `NEXO_ORDER AUTH_ENTER`
- authorization result: `NEXO_ORDER AUTH_DECISION`

Its intended chain is:
D0 → W1 → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION.

The harness uses a real Producer, but the currently recovered PR #94 workflow source has compile defects around the topic-name/type collision; the earlier run 37042188881 captured those failures. No successful raw NEXO_ORDER event stream has been recovered.

## Important correction to earlier archaeology

The strongest previously described 'historical real-RPC runtime' is more precisely:
- PR #84: real-RPC D1 source + actual execution, but D1 authorization callback was NOT observed; runtime failed.
- PR #91: actual successful runtime, but D1 is direct `authorize()`, so it cannot establish RequestChannel ordering.

This distinction is now persisted and must not be collapsed again.

## Next action

1. Continue historical search for any run that combines a real Producer D1 with successful target authorization callback observation.
2. Search for prior RequestChannel/KafkaRequestHandler instrumentation before creating new probes.
3. Compare any recovered callback-success harness against PR #94's queue probes.
4. If no historical combination exists, repair only the known PR #94 compile defect(s), then run the minimal corrected ordering witness.
5. Preserve AB105.116R; do not create AB105.117R; do not rerun TLC.

## Epistemic state

- D0 observed historically: YES.
- W1 local revocation behavior: YES as source/diagnostic evidence; exact cross-thread HB remains UNKNOWN.
- Real Producer D1 executed historically: YES (PR #84), but successful R1 callback not observed in that run.
- Successful direct authorize D1 runtime: YES (PR #91), semantically unsuitable for queue ordering.
- ENQUEUE/DEQUEUE execution evidence: NOT RECOVERED.
- W1→ENQUEUE→DEQUEUE→R1 causal chain: UNKNOWN.
- Stale authorization after completed W1: NOT ESTABLISHED.
- Exploitability/security impact: UNKNOWN.
- AB105.116R: unchanged.
- AB105.117R: not created.
- TLC: not rerun.
