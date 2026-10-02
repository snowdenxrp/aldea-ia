# NEXO CONTINUITY — AB105 G0 Ordering Witness — 2026-10-02

## Canonical state
- Active anchor: AB105.116R — DO NOT MODIFY.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- PR #94: ordering witness, DRAFT / NOT MERGED.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.
- Canonical ordering branch: nexo-ab105-g0-ordering-witness.
- Auxiliary execution branch: nexo-ab105-g0-ordering-witness-run.

## Current scientific boundary
Next distinct diagnostic is the real-broker ordering witness:
D0 → W1 → RequestChannel ENQUEUE → DEQUEUE → R1.

D0 = external Admin delete completion.
W1 = target broker local completion of StandardAuthorizerData.removeAcl(), after replacement of plain aclCache with the new immutable AclCache.
ENQUEUE = real request enters RequestChannel ArrayBlockingQueue via put().
DEQUEUE = KafkaRequestHandler receives it via poll()/take().
R1 = real authorization entry/decision.

Critical ordering:
- W1 < ENQUEUE < DEQUEUE < R1: queue publication can provide HB for W1 to that request.
- ENQUEUE/DEQUEUE < W1 < R1: RequestChannel cannot publish a later W1.
- D0 is NOT local W1 and must never be used as a substitute.

## Exact source findings
- StandardAuthorizer.data is volatile, but steady-state removeAcl() does not replace data; it calls data.removeAcl().
- StandardAuthorizerData.aclCache is plain and replaced by a new immutable AclCache.
- StandardAuthorizerData is documented as not thread-safe.
- authorize() snapshots volatile data.
- findAclRule() snapshots plain aclCache into a local variable.
- AclPublisher applies metadata ACL deltas synchronously and calls ClusterMetadataAuthorizer → StandardAuthorizer.removeAcl().
- MetadataLoader uses KafkaEventQueue.
- KafkaEventQueue has its own ReentrantLock/event thread; RPC authorization does not acquire that same queue lock.
- RequestChannel uses ArrayBlockingQueue: sendRequest→put; receiveRequest→poll/take; KafkaRequestHandler→apis.handle().
- Therefore RequestChannel gives publication for actions before enqueue, but global W1→R1 HB remains NOT_IDENTIFIED.

Persisted audits:
- 6f9ebdaf515deb22664b12fee263425da9c8fd99 — publication boundary
- 00c2de0a0b12fcbf5a578111feba5977192fe3f3 — real publication call chain
- b791e2eeb76ea3a96c49c7e14bce8e26a113d162 — executor boundary
- 001367b6dc392ad15440cc98aebf282f6f14f3f5 — exact RequestChannel ordering
- db2ea6bf4291ff1c6ac012f0d873f91c5577798b — steady-state visibility closure
- 94e16c477dd949d45c47924597266fc845ba48d5 — ordering witness checkpoint

## Ordering witness implementation
PR #94 is the canonical draft. Instrumentation is workflow-local and timing-affecting; it adds no synchronization.
Planned raw events:
NEXO_ORDER ACL_W1
NEXO_ORDER ENQUEUE
NEXO_ORDER DEQUEUE
NEXO_ORDER AUTH_ENTER
NEXO_ORDER AUTH_DECISION
Real KafkaClusterTestKit + StandardAuthorizer + SASL_PLAINTEXT + real KafkaProducer.

Auxiliary branch trigger was corrected in commit 336208d86a925e4693190abe87ca9ae2386a0280 by adding nexo-ab105-g0-ordering-witness-run to the push trigger.

After correction, workflow-run retrieval for that commit returned ZERO runs. The available GitHub connector can retrieve runs but does not expose workflow dispatch/write-ref. Therefore:
EXECUTION = NOT YET EXECUTED / TOOLING-BLOCKED.
This is NOT a scientific failure and no result may be inferred.

## Existing diagnostics — DO NOT REPEAT
Cache identity run 37036029543/job 110934345861:
POST_RETURN_ALLOWED=0; POST_RETURN_PRE_REMOVE_CACHE=0; POST_RETURN_POST_REMOVE_CACHE=6262072; POST_RETURN_UNKNOWN_CACHE=0; OVERLAP_ALLOWED=14392; UNEXPECTED=0. Artifact 11240635939; digest sha256:a5b002fc723256e45b36d79d1af1797ed50d305cf7f8ff20bad4388f32a30250.

Authorize snapshot run 37037323460/job 110938623014:
POST_RETURN_ALLOWED=0; POST_RETURN_PRE_REMOVE_CACHE=0; POST_RETURN_POST_REMOVE_CACHE=2845069; POST_RETURN_UNKNOWN_CACHE=0; POST_RETURN_PRE_REMOVE_SNAPSHOT=0; POST_RETURN_POST_REMOVE_SNAPSHOT=2845069; POST_RETURN_UNKNOWN_SNAPSHOT=0; OVERLAP_ALLOWED=17769; UNEXPECTED=0. Artifact 11240801816; digest sha256:6acacf4881843b194ca3c3782b5b5b267184023565daac13f045e813ac3cb18b.

Interpretation: overlap observed; post-return ALLOWED not observed; stale read UNKNOWN; exact mechanism UNKNOWN; security conclusion NOT ESTABLISHED.

## Historical evidence to preserve
- G0 corrected one-broker witness: A1 OBSERVED, D0 OBSERVED, D1 DENIED, D2 SUCCESS, E 0→1; artifact 11199086900; digest d43efa23640881711f188a17e1af2dfa890f801a04d0d5974945bc8cc9c343eb.
- G0 multi-broker PR #82: target broker local ACL count after D0 = 0; D1 DENIED; D2 SUCCESS; E 0→1.
- PR #86 propagation witness: D0 controller-complete, D1 DENIED while target local ACL count at decision was 1; D2 SUCCESS; in-flight authorization window observed; stale propagation authorization NOT OBSERVED; security conclusion UNKNOWN.
- Historical run 36958014786/job 110685238774 reported D1_DENIED=10, D1_ALLOWED=0. IMPORTANT: currently fetched bootstrap source uses direct TARGET.authorize() for D1, not a real network RPC despite historical REAL-RPC label. Preserve but mark RPC claim requiring re-verification.
- Historical timing run 36960926363 had STALE_ALLOWED_IN_POST_WINDOW=75844, but completed-remove-then-allowed was NOT established.
- Historical publication diagnostic 36950083282 had STALE_ALLOWED=0; limited diagnostic only.
- Preserve all checkstyle/compile/unrelated harness failures as non-results.

## Main persistence audit
- c72f4bffcf5b281d8414c22c7a8d2814650e0742: preserve prepared journal after ambiguous effect exception.
- 7541d32134a35d60aae7a4f6426f1540d96eddd3: persist serializable effect intent metadata without callbacks.
- Verification runs 37029467724 and 37029467755 succeeded.
- UNKNOWN external result remains UNKNOWN; prepared intent remains recoverable until reconciliation.

## NEXT ACTION
1. Obtain an actual ordering-witness workflow execution.
2. Audit raw NEXO_ORDER timestamps.
3. Classify each cycle as:
   A) W1 < ENQUEUE < DEQUEUE < R1
   B) ENQUEUE/DEQUEUE < W1 < R1
   C) other/ambiguous
4. Do not infer W1 from D0.
5. Do not collapse overlap into stale visibility.
6. Do not modify AB105.116R, create AB105.117R, rerun TLC, or merge PR #94.
7. If execution tooling remains unavailable, preserve status as EXECUTION_BLOCKED_BY_TOOLING.

CONTINUITY RULE: recover this file and the referenced commits first; GitHub evidence outranks chat memory.