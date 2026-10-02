# NEXO CONTINUITY — AB105 G0 ORDERING ARCHAEOLOGY CHECKPOINT 2026-10-02

## USER CONTINUITY INSTRUCTION
If this chat ends, on the next chat the user may say exactly: CONTINUITY.
Resume from this document and the latest repository state. Do NOT restart the investigation, do NOT repeat completed diagnostics, and do NOT create AB105.117R unless the evidence chain explicitly reaches that point.

## CURRENT MISSION
Continue archaeology and validation of AB105 G0 ordering evidence until the investigation is exhausted.

Primary scientific question:
Can a real broker execution establish:
D0 → W1 → ENQUEUE → DEQUEUE → R1

Definitions:
- D0 = external Admin delete completion.
- W1 = target broker local completion of StandardAuthorizerData.removeAcl() after replacement of the immutable AclCache.
- ENQUEUE = real request enters RequestChannel.
- DEQUEUE = KafkaRequestHandler receives the request.
- R1 = real authorization entry/decision inside StandardAuthorizer.authorize().

Important:
- D0 is NOT W1.
- Timestamps are diagnostic only; never infer JMM happens-before from timestamps.
- RequestChannel publication can publish actions before enqueue, but global W1→R1 HB remains UNKNOWN unless the complete causal chain is demonstrated.
- Do not silently convert diagnostics into security conclusions.

## CANONICAL STATE
Repository: snowdenxrp/aldea-ia
Working branch: nexo-ab105-g0-ordering-witness
Canonical active anchor: AB105.116R — DO NOT MODIFY.
AB105.117R: NOT CREATED.
TLC: NOT RERUN.
PR #94: draft, not merged.
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.
Canonical ordering checkpoint: e567dc5429f563b3f57ec75c20a3ec22ca5192af.
Latest archaeology commits:
- 70d14698db09fa0875fd0325bc66cb2940fbffb5 — real-RPC candidate audit.
- 38850623273110f5e618be848a2bac900d3f9304 — archaeology pass 2.

## KEY RECOVERED FINDING
Historical G0 generations are not semantically equivalent.

### 🟢 nexo-ab105-g0-runtime-exec-corrected
Recovered source shows:
- real KafkaProducer D1;
- D1 uses producer.send(...).get();
- D1 reaches the broker TargetAuthorizer.authorize();
- override delegates to super.authorize() and observes the decision;
- no TARGET.authorize() direct call in this workflow.
Valid reusable real-RPC D1 behavioral base.
Limit: RequestChannel ENQUEUE/DEQUEUE are not instrumented here; historical raw execution/artifact for this corrected generation is NOT yet recovered.

### 🟢 nexo-ab105-g0-multibroker-discriminator
Recovered source shows:
- real Producer D1;
- target broker has TargetAuthorizer;
- target local ACL count is observed after D0;
- target broker is verified as effective leader;
- D1 is then sent through real Producer.
Useful for separating controller/admin completion, target-local revocation, and real request.
Still lacks RequestChannel ENQUEUE/DEQUEUE execution evidence.

### 🔴 nexo-ab105-g0-jmm-publication-discriminator
Contains a real Producer but also direct TARGET.authorize() D1 measurement.
Do not use it as clean real-RPC D1 evidence.

### 🔴 nexo-ab105-g0-runtime-api-fix-v2
Contains direct targetAuthorizer.authorize() D1.
Do not use it as the missing real-RPC ordering evidence.

### 🟢/🔴 nexo-ab105-g0-current-compile-gate
Useful compile/API infrastructure and authorization callback instrumentation.
Its evidence explicitly says G0_RUNTIME=NOT_EXECUTED and EXACT_RACE=UNKNOWN.
No runtime ordering evidence.

### 🟢 nexo-ab105-g0-compile-probe-ci
Useful compile-only infrastructure; explicitly no runtime execution.
Do not treat as runtime evidence.

## HISTORICAL REAL RUNTIME — SEMANTIC LIMIT
Recovered successful runtime:
run 36969192502
job 110719406205
commit 96aee422286b5602c3f188736e1910c1017112ab
Kafka pin 99b940733a9f6bc409457dba7108f08421d81e42
log:
G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1
artifact 11210977168
digest sha256:b0e6ae6499b76f1de0363805a58ae45635b9d661b169cb6338893338d2e31c54
CRITICAL LIMIT: D1 was direct TARGET.authorize(), so this is NOT RequestChannel/RPC ordering evidence.
Persisted semantic audit: docs/nexo/NEXO_AB105_G0_RECOVERED_RUNTIME_WITNESS_SEMANTIC_AUDIT_2026-10-02.md, commit b73efbbaebfb9f11992fefab5fae2c9af84ee1e4.

## CURRENT ORDERING WORK
PR #94: AB105 G0 real broker ordering witness (draft), not merged.
Planned raw events:
NEXO_ORDER ACL_W1
NEXO_ORDER ENQUEUE
NEXO_ORDER DEQUEUE
NEXO_ORDER AUTH_ENTER
NEXO_ORDER AUTH_DECISION
Target:
D0 → W1 → ENQUEUE → DEQUEUE → AUTH_ENTER → AUTH_DECISION

## KNOWN BLOCKERS
Original ordering workflow had TOPIC/topic-name compile collision. Correct form:
TOPIC_NAME = "..."
new NewTopic(TOPIC_NAME, 1, (short) 1)
new ResourcePattern(TOPIC, TOPIC_NAME, LITERAL)
Persisted: docs/nexo/NEXO_ORDERING_WITNESS_COMPILE_FAILURE_2026-10-02.md, commit 7cbdef4da5915064a965854e002d658a9eab4d94.

v2 workflow has a separate blocker: Python reads literal '$' + '{GITHUB_WORKSPACE}/...' inside <<'PY' instead of expanding the environment variable. Persisted: docs/nexo/NEXO_ORDERING_WITNESS_V2_HARNESS_BLOCKER_2026-10-02.md, commit b9c2b8c870c5cda3bc9d1c3467fcb718e0610754.
Do not claim v2 executed.

fetch_commit_workflow_runs filters to PR-triggered runs only. Zero there does NOT prove no push-triggered run occurred.

## EXISTING DIAGNOSTICS — DO NOT REPEAT
Cache identity: run 37036029543, job 110934345861, artifact 11240635939, digest sha256:a5b002fc723256e45b36d79d1af1797ed50d305cf7f8ff20bad4388f32a30250. POST_RETURN_ALLOWED=0; overlap allowed=14392; unexpected=0.
Authorize snapshot: run 37037323460, job 110938623014, artifact 11240801816, digest sha256:6acacf4881843b194ca3c3782b5b5b267184023565daac13f045e813ac3cb18b. POST_RETURN_ALLOWED=0; overlap allowed=17769; unexpected=0.
Do not rerun these.

## OTHER HISTORICAL EVIDENCE
- One-broker corrected witness: A1 OBSERVED, D0 OBSERVED, D1 DENIED, D2 SUCCESS, E 0→1; artifact 11199086900; digest d43efa23640881711f188a17e1af2dfa890f801a04d0d5974945bc8cc9c343eb.
- Multi-broker PR #82: target local ACL after D0 = 0; D1 DENIED; D2 SUCCESS; E 0→1.
- PR #86 propagation witness: D0 controller-complete, D1 DENIED while target local ACL count at decision was 1; stale propagation authorization NOT OBSERVED; security conclusion UNKNOWN.
- Timing run 36960926363: STALE_ALLOWED_IN_POST_WINDOW=75844; completed-remove-then-allowed NOT established.
- Publication diagnostic 36950083282: STALE_ALLOWED=0; limited diagnostic only.
- Persistence audits: c72f4bffcf5b281d8414c22c7a8d2814650e0742 and 7541d32134a35d60aae7a4f6426f1540d96eddd3; verification runs 37029467724 and 37029467755 succeeded; UNKNOWN external result remains UNKNOWN.

## SOURCE FACTS VERIFIED
- StandardAuthorizer.data is volatile.
- Steady-state removeAcl() calls data.removeAcl(); it does not replace StandardAuthorizer.data.
- StandardAuthorizerData.aclCache is plain and replaced by a new immutable AclCache.
- StandardAuthorizerData is documented as not thread-safe.
- authorize() snapshots volatile data.
- findAclRule() snapshots plain aclCache to a local variable.
- AclPublisher applies metadata ACL deltas synchronously and calls ClusterMetadataAuthorizer → StandardAuthorizer.removeAcl().
- MetadataLoader uses KafkaEventQueue.
- KafkaEventQueue has its own ReentrantLock/event thread; RPC authorization does not acquire that same queue lock.
- RequestChannel: sendRequest→put; receiveRequest→poll/take; KafkaRequestHandler→apis.handle().
- RequestChannel publication exists, but global W1→R1 HB remains NOT IDENTIFIED.

## NEXT INVESTIGATION — START HERE
1. Recover raw execution/run/job/artifact for:
   a) nexo-ab105-g0-runtime-exec-corrected
   b) nexo-ab105-g0-multibroker-discriminator
2. Verify actual execution matches recovered source.
3. Extract exact D0, target-local revocation/W1 proxy, real D1 Producer request, authorization callback, and completion.
4. Search historical workflows/commits for RequestChannel, KafkaRequestHandler, AUTH_ENTER, AUTH_DECISION, NEXO_ORDER, real RPC/RPC.
5. If prior workflow already instrumented RequestChannel, reuse it rather than inventing another experiment.
6. Compare recovered real-RPC harness with PR #94 ordering instrumentation.
7. Only after evidence is exhausted, decide whether a minimal corrected ordering run is needed.
8. Persist every meaningful finding in docs/nexo/ on the working branch with commit SHA.
9. Keep AB105.116R untouched.
10. Do not create AB105.117R.
11. Do not rerun TLC.
12. Never claim W1→R1 HB, stale visibility, exploitability, or security impact without direct causal evidence.

## USER PREFERENCE
Continue autonomously until evidence search is exhausted. Keep user-facing updates short; persist detailed continuity in GitHub. If blocked, repair the blocker and continue rather than stopping at status. Never invent a successful run or evidence.
