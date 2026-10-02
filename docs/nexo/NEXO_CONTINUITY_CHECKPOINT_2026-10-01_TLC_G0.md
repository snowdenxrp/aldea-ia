# NEXO CONTINUITY CHECKPOINT — 2026-10-01 TLC/G0

## Canonical anchor
- AB105.116R remains canonical and unchanged.
- No AB105.117R is created.
- No Nexo architecture implementation is being promoted from this investigation.

## TLC
- Workflow run: 36781846063 — SUCCESS.
- Job: 110113752493.
- States explored/generated: 7,957,574,337.
- Distinct states: 251,910,656.
- Pending: 0.
- Depth: 31.
- Artifact: nexo-ab105-116r-tlc-evidence, ID 11134199332.
- Artifact SHA-256: ad053fdc48b490819281000cbbf40a8eae76af6bed780d40795a719068ad4f44.
- TLC completion does not by itself prove the Kafka race; historical UNKNOWN/PENDING semantic items remain preserved.

## Kafka G0 runtime witness
- PR #81 remains OPEN, DRAFT, UNMERGED.
- Corrected branch head tested: ab99ea78d7e883ba014a1184bb6b464a670c3fb9.
- Workflow run: 36938337030 — SUCCESS.
- Job: 110623769038 — SUCCESS.
- Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42.
- Java: 21.0.12.1 LTS.
- Artifact: nexo-ab105-g0-bootstrap-evidence, ID 11199086900.
- Artifact SHA-256: d43efa23640881711f188a17e1af2dfa890f801a04d0d5974945bc8cc9c343eb.

## Exact recoverable witness
G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1

The workflow log independently shows:
- real G0 harness compiled and executed;
- A1 was observed by the target authorization wrapper after the delegated ALLOW decision;
- D0 completed through Admin DeleteAcls;
- D1 used an independent fresh Kafka Producer and was denied with TopicAuthorizationException (unwrapped from ExecutionException);
- only after D1 did A1 release;
- D2 completed successfully;
- target broker UnifiedLog logEndOffset moved from 0 to 1;
- the witness was persisted to the CI artifact.

## Audit interpretation
This is the first complete A1 -> D0 -> D1 -> D2 -> E runtime witness recovered for the frozen G0 contract. It is evidence of the specified execution sequence on the pinned Kafka revision and isolated test harness.

Do NOT automatically translate this into exploitability, impact, or a broader real-world claim. Those require separate analysis.

## Current epistemic state
- G0_CONTRACT=FROZEN
- G0_RUNTIME=OBSERVED_SUCCESS
- A1=OBSERVED
- D0=OBSERVED
- D1=DENIED
- D2=SUCCESS
- E=OBSERVED (0 -> 1)
- EXACT_RACE=OBSERVED_WITNESS
- EXPLOITABILITY=UNKNOWN_PENDING_SEPARATE_ANALYSIS
- WITNESS=YES
- AB105.116R=INTACT

## Next action
Preserve the raw artifact and perform a separate witness-integrity / semantic audit before any exploitability or architectural conclusion. Do not rerun TLC unnecessarily and do not modify AB105.116R.

## Witness-integrity / semantic audit — 2026-10-01

### Verified against the executed harness
- A1 is not synthetic: TargetAuthorizer observes the real broker authorization call only after StandardAuthorizer returns ALLOWED for the original producer request, then blocks that in-flight path on A1_RELEASE.
- D0 is a real Admin DeleteAcls operation and the test waits on .all().get(), so the admin operation has completed before D1 begins.
- D1 is a fresh independent KafkaProducer using the same user credentials; it reaches the real broker path and fails with ExecutionException whose cause is TopicAuthorizationException naming the target topic.
- D1 completes before A1_RELEASE is called; therefore the denied observation is temporally between D0 completion and release of the earlier authorized request.
- D2 is the original producer request that was already authorized at A1 and was blocked before completion; it is released only after D1 denial and then completes successfully.
- E is read from the broker's actual UnifiedLog for partition 0 after D2; baseline is asserted 0 and after is asserted 1.

### Semantic boundary
The witness establishes the frozen G0 execution sequence A1 -> D0 -> D1 -> D2 -> E on the pinned Kafka revision and one-broker isolated harness.
It does NOT by itself prove that Kafka authorization caching is the mechanism: the harness deliberately blocks an already-authorized in-flight request. Therefore the precise demonstrated phenomenon is revocation occurring after authorization but before the authorized operation's effect, with a later independent request denied.
It also does not establish multi-broker behavior, persistence/restart behavior, production deployment conditions, attacker reachability, or exploitability in a Nexo deployment.

### Audit status
- WITNESS_INTEGRITY=SUPPORTED
- G0_SEQUENCE_SEMANTICS=SUPPORTED
- CACHE_MECHANISM=UNKNOWN_NOT_TESTED
- MULTI_BROKER_GENERALIZATION=UNKNOWN
- EXPLOITABILITY=UNKNOWN_PENDING_SEPARATE_ANALYSIS
- AB105.116R=INTACT
- NO_AB105.117R

Next: separate mechanism/exploitability analysis only; do not rerun TLC or alter AB105.116R unless new evidence requires it.

## Mechanism analysis checkpoint — 2026-10-01

Apache Kafka's authorizer API documents that authorization is a synchronous request-thread API designed for locally cached ACLs, while ACL create/delete operations are asynchronous update APIs with implementation-specific concurrent-update guarantees. StandardAuthorizer keeps current authorization data and snapshots that data for authorization reads. These facts support the existence of a local authorization-data boundary, but they do not establish that the observed G0 witness was caused by a stale authorization cache. citeturn1search3turn1search0

Therefore:
- OBSERVED: an already-authorized in-flight request can remain on its authorized path while a later independent request is denied after ACL deletion, producing exactly one append in the controlled one-broker harness.
- NOT ESTABLISHED: stale-cache use as the causal mechanism.
- NOT ESTABLISHED: a security vulnerability or exploitable condition in a production/deployed Nexo system.
- NEXT TESTABLE QUESTION: distinguish "in-flight authorization already completed" from "authorization result reused from stale cache after revocation". A valid mechanism test must create the second authorization decision after D0 while controlling whether that decision is served from pre-revocation state or current state; the present D1 already shows current denial and therefore cannot establish stale-cache reuse.

No rerun of TLC. AB105.116R remains untouched.


## Pinned-source mechanism audit — 2026-10-01

The exact pinned Kafka revision `99b940733a9f6bc409457dba7108f08421d81e42` was inspected directly.

### StandardAuthorizer / StandardAuthorizerData
- `StandardAuthorizer` stores a volatile `StandardAuthorizerData data` reference and `authorize()` snapshots that reference into `curData` before evaluating actions.
- `StandardAuthorizerData` owns the ACL cache. Its `addAcl()` and `removeAcl()` update the ACL-cache field on the same data object; `loadSnapshot()` replaces the data reference with a copied ACL cache.
- `authorize()` ultimately snapshots the current `aclCache` reference inside `findAclRule()` and evaluates that snapshot.
- This source structure does NOT support the simplistic claim that StandardAuthorizer has a separate per-request stale ACL cache that survives a completed local deletion. The demonstrated G0 witness is therefore better described as an already-authorized in-flight request unless a separate propagation race is demonstrated.

### New mechanism discriminator
A stronger test must use at least two brokers and separate the controller-side ACL deletion from the broker that receives a NEW authorization decision:
1. establish ALLOW ACL and verify the target follower authorizes a fresh producer;
2. issue real Admin DeleteAcls from the controller path;
3. immediately issue a NEW producer request to the target follower, before ACL deletion metadata has necessarily reached that follower;
4. independently observe whether that NEW post-D0 authorization is ALLOWED or DENIED;
5. record the follower's authorization/metadata state and the final append outcome.

Interpretation boundary:
- NEW request ALLOWED after D0 + evidence that follower had not yet applied the ACL deletion would support a metadata-propagation authorization window.
- NEW request DENIED after D0 would falsify that specific stale-state path for that execution.
- The existing one-broker G0 cannot distinguish these cases because D2's authorization decision is completed before D0.
- A multi-broker result still would not, by itself, establish attacker exploitability or a production security vulnerability.

### Current epistemic state
- PINNED_SOURCE_STRUCTURE=OBSERVED
- LOCAL_STALE_CACHE_AS_CAUSE=NOT_SUPPORTED_BY_CURRENT_EVIDENCE
- IN_FLIGHT_AUTHORIZATION_WINDOW=SUPPORTED
- MULTI_BROKER_PROPAGATION_WINDOW=UNKNOWN
- EXPLOITABILITY=UNKNOWN
- AB105.116R=INTACT
- NO_AB105.117R

Next: implement only the mechanism-discriminating multi-broker observation in the existing G0 research branch; preserve the original witness unchanged and do not rerun TLC.


## Mechanism-test implementation gate — 2026-10-01

Inspected PR #81 workflow and the pinned Kafka authorizer tests. The current G0 harness is intentionally one-broker and D2 reaches authorization before D0; therefore it cannot discriminate in-flight authorization from post-D0 stale/propagation state.

A multi-broker discriminator is now specified, but implementation is NOT yet claimed. Before changing the workflow, the exact pinned `KafkaClusterTestKit`/broker-selection API must be verified from the pinned source or an existing pinned-revision test. No guessed API, no speculative patch.

Required controlled observation remains:
- broker B1: authorization decision for a NEW producer request after D0;
- controller/admin path: real DeleteAcls completion;
- broker B2/B1 metadata state: establish whether ACL deletion has reached the target broker before the NEW decision;
- outcome: ALLOWED vs DENIED;
- append result and witness retained separately.

This gate prevents conflating a metadata-propagation delay with an authorization-cache mechanism.

STATE: MULTI_BROKER_TEST_DESIGN_READY / IMPLEMENTATION_PENDING_SOURCE_API_VERIFICATION


## Multi-broker discriminator implementation checkpoint — 2026-10-01

Implementation has now been created on a separate research branch/PR; the frozen anchor remains untouched.

- Research branch: `nexo-ab105-g0-multibroker-discriminator`
- Implementation commit: `c02b5e8940263628530a2ec521664756a6079bab`
- PR: #82 — OPEN / DRAFT / UNMERGED.
- Base: main at `638bd12d9aa7ea9d09a254f9fa44c204093db05a`.
- Kafka remains pinned to `99b940733a9f6bc409457dba7108f08421d81e42`.

### Implemented controls
- Two brokers, one controller.
- Target authorizer instrumentation is placed on broker 1 only.
- Partition 0 is explicitly assigned to broker 1 using the pinned Kafka `NewTopic(topic, Map<Integer,List<Integer>>)` API pattern.
- Effective leader is independently observed with `metadataCache().getLeaderAndIsr(topic, 0)` on both brokers and required to be broker 1.
- D0 is real Admin `DeleteAcls`.
- Before D1, the target broker's local `TargetAuthorizer.aclCount()` is required to reach zero, making local ACL-revocation observation explicit rather than inferred from controller completion.
- D1 remains a fresh independent Kafka Producer request.
- D2 remains the earlier request path held at A1.
- E remains the target broker's actual UnifiedLog end offset.

### Epistemic state
- MULTI_BROKER_IMPLEMENTATION = PERSISTED
- MULTI_BROKER_EXECUTION = PENDING
- MULTI_BROKER_RESULT = UNKNOWN
- PROPAGATION_WINDOW = UNKNOWN
- STALE_AUTHORIZATION_MECHANISM = UNKNOWN
- EXPLOITABILITY = UNKNOWN
- AB105.116R = INTACT
- NO AB105.117R

Important: this implementation deliberately waits for target-local ACL revocation before D1. Therefore an ALLOWED result after that wait would be materially stronger evidence than the original G0, while a DENIED result would show the tested local revocation state behaved consistently. It still would not, by itself, establish exploitability.

No TLC rerun.


## Multi-broker discriminator execution result — 2026-10-01

The corrected PR #82 harness executed successfully on the pinned Kafka revision.

- PR: #82 — OPEN / DRAFT / UNMERGED.
- Workflow run: 36942363431 — SUCCESS.
- Job: 110636586589 — SUCCESS.
- Tested merge commit: beb5593b92a947f4df70f8fa4e6a6847b40fe114.
- Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42.
- Java: 21.0.12.1 LTS.
- Artifact: nexo-ab105-g0-bootstrap-evidence, ID 11200284372.
- Artifact ZIP SHA-256: b315df46a5c2f3080434e336d5fd10611c4c2d47288383d9cd8b6582387f917f.

### Recoverable witness

`G0_MULTI_WITNESS TARGET_BROKER=1 LEADER_TARGET=1 LEADER_OTHER_VIEW=1 D0=OBSERVED TARGET_LOCAL_ACL_COUNT_AFTER_D0=0 D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1`

### What this establishes

- The two-broker/one-controller cluster started successfully.
- The target partition's effective leader was broker 1, and both broker views observed leader 1.
- D0 was a real Admin DeleteAcls operation.
- The target broker's local instrumented authorizer reached ACL count 0 before D1.
- D1 was a NEW independent producer request and was denied.
- D2 was the earlier authorization path and succeeded after release.
- The target broker's UnifiedLog advanced exactly from 0 to 1.

### Critical semantic boundary

This execution does NOT demonstrate a stale authorization result surviving completed local ACL revocation.

In fact, D1 was deliberately issued only after `TARGET_LOCAL_ACL_COUNT_AFTER_D0=0`, and it was denied. Therefore the tested condition is consistent with current local authorization state after revocation.

The result therefore:
- SUPPORTS: the controlled in-flight authorization window remains reproducible in a two-broker KRaft test when the target broker is the effective leader.
- DOES NOT ESTABLISH: a post-D0 stale-cache authorization path.
- DOES NOT ESTABLISH: a metadata-propagation authorization window, because D1 was intentionally delayed until target-local ACL revocation was observed.
- EXPLOITABILITY remains UNKNOWN.

### Updated epistemic state

- MULTI_BROKER_IMPLEMENTATION = EXECUTED_SUCCESS
- MULTI_BROKER_RESULT = D1_DENIED_AFTER_TARGET_LOCAL_REVOCATION
- IN_FLIGHT_AUTHORIZATION_WINDOW = SUPPORTED
- POST_D0_STALE_AUTHORIZATION = NOT_OBSERVED
- METADATA_PROPAGATION_WINDOW = UNKNOWN_NOT_TESTED_BY_THIS_RUN
- EXPLOITABILITY = UNKNOWN
- AB105.116R = INTACT
- NO AB105.117R

### Next discriminator

If mechanism analysis continues, the next distinct experiment is a tightly controlled NEW-request timing test where D1 is issued after controller-side D0 completion but BEFORE target broker local ACL revocation is observed. That experiment must independently record target-local ACL state at the authorization decision, rather than inferring it from controller completion.

No TLC rerun. The original G0 witness remains unchanged.



## Next mechanism discriminator prepared — 2026-10-01

A distinct research branch/PR was created to test the unresolved metadata-propagation window without altering PR #82 or AB105.116R.

- Branch: `nexo-ab105-g0-propagation-window`
- PR: #83 — OPEN / DRAFT / UNMERGED.
- Head: `e86053b9e7e3674d8160962277466bbfaa049827`
- Base: main at `6c753fceb4f186c07efb77fcb0955ef781a58d59`.
- Kafka revision remains `99b940733a9f6bc409457dba7108f08421d81e42`.

### Controlled change

After real controller-side D0 (`DeleteAcls(...).all().get()`) completes, D1 is now issued immediately as a NEW independent producer request. The harness deliberately does NOT wait for target-local ACL revocation.

It records:
- `TARGET_LOCAL_ACL_COUNT_BEFORE_D1`
- D1 outcome: ALLOWED or DENIED
- `TARGET_LOCAL_ACL_COUNT_AFTER_D1`
- D2 success and final UnifiedLog append count.

Interpretation:
- D1 ALLOWED while target-local ACL count is still 1: supports a metadata-propagation authorization window for this execution.
- D1 DENIED while target-local ACL count is still 1: does not support that simple stale-state path and requires deeper mechanism analysis.
- D1 ALLOWED with target-local ACL count already 0: unexpected relative to the local state and requires source/mechanism inspection.
- If target-local ACL count is already 0 before D1, the run is not sufficient to demonstrate the propagation window; the exact state remains recorded.

No claim of exploitability is permitted from this discriminator alone. Original G0 and PR #82 witnesses remain unchanged. No TLC rerun. AB105.116R remains intact. AB105.117R is not created.


## Next mechanism discriminator implementation — 2026-10-01

A distinct timing experiment was prepared without changing the frozen anchor or rerunning TLC.

- Research branch: `nexo-ab105-g0-propagation-window-discriminator`
- PR: #84 — OPEN / DRAFT / UNMERGED.
- Head: `c4ebe094282d7315a0d57c2ae83c256dbe08588e`
- Base: main.
- Kafka remains pinned to `99b940733a9f6bc409457dba7108f08421d81e42`.

### Experimental distinction
Unlike PR #82, D1 is now a NEW independent producer request issued immediately after controller-side D0 completion, without waiting for target-local ACL revocation.

The target authorizer records:
- D1 authorization result;
- target-local ACL count at the authorization decision;
- D1 append outcome;
- D2 completion and final UnifiedLog offset.

Interpretation is intentionally bounded:
- D1 ALLOWED while target-local ACL count is still pre-revocation/nonzero would support a metadata-propagation authorization window.
- D1 DENIED before local revocation is observed would weaken that specific propagation-window hypothesis for the execution.
- D1 ALLOWED after local ACL count is already zero would require deeper mechanism analysis and would be materially stronger evidence.
- No result is yet claimed until the workflow produces a recoverable witness.

### Epistemic state
- PROPAGATION_WINDOW = PENDING_EXECUTION
- POST_D0_NEW_REQUEST = PENDING_EXECUTION
- STALE_AUTHORIZATION_MECHANISM = UNKNOWN
- EXPLOITABILITY = UNKNOWN
- AB105.116R = INTACT
- NO AB105.117R
- NO TLC RERUN


## Continuity integrity review — critical harness issue found — 2026-10-01

A line-by-line review of the newly prepared PR #84 discriminator found a concurrency flaw BEFORE execution:

- D2 is submitted to a single-thread executor and intentionally blocks at A1.
- The first PR #84 draft also submitted NEW D1 to that same single-thread executor.
- Therefore D1 could remain queued behind blocked D2 and never reach the target authorizer until A1 is released.
- That would invalidate the intended "D1 after controller D0 but before target-local ACL revocation" timing discriminator and could create a deadlock/timeout.

### Corrective requirement
D1 must execute on a SEPARATE executor/thread from the blocked D2 path. The discriminator must not be executed until this correction is persisted and the resulting workflow run is inspected.

### Integrity state
- PR #84 = OPEN / DRAFT / UNMERGED.
- PR #84 execution = MUST NOT BE TREATED AS VALID until executor correction is confirmed.
- PROPAGATION_WINDOW = PENDING_EXECUTION.
- POST_D0_NEW_REQUEST = PENDING_EXECUTION.
- No result from PR #84 may be elevated from this draft.
- AB105.116R = INTACT.
- Original G0 witness = UNCHANGED.
- PR #82 witness = UNCHANGED.
- No TLC rerun.
- No AB105.117R.

This review is intentionally additive: it preserves the prepared experiment while marking the exact pre-execution defect so it cannot silently contaminate the evidence chain.


## PR #84 correction persisted — 2026-10-01

Pre-execution audit finding was corrected on the research branch.

- PR #84 head before correction: c4ebe094282d7315a0d57c2ae83c256dbe08588e
- Corrected head: a80b4191b550c4c4a855b1576751546c80dc9f9b
- Correction: D1 now uses a separate single-thread executor from the intentionally blocked D2 path.
- This removes the identified queue/deadlock contamination from the propagation discriminator.
- The branch workflow is configured for pull_request execution against main.
- No workflow result is claimed yet for corrected head; commit workflow lookup currently returns no run.
- Therefore PROPAGATION_WINDOW remains PENDING_EXECUTION.
- AB105.116R remains intact.
- PR #82 and original G0 witness remain unchanged.
- No TLC rerun.
- No AB105.117R.

Next: wait/inspect the workflow associated with corrected head a80b4191b550c4c4a855b1576751546c80dc9f9b. Only a recoverable workflow witness may elevate the propagation-window state.


## PR #84 execution result — harness timing discriminator did NOT produce a valid D1 decision — 2026-10-01

PR #84 corrected head `a80b4191b550c4c4a855b1576751546c80dc9f9b` did execute.

- Workflow run: `36943184415` — FAILURE.
- Job: `110639182169` — FAILURE.
- Kafka revision: `99b940733a9f6bc409457dba7108f08421d81e42`.
- Compile Kafka test infrastructure: SUCCESS.
- Write temporary G0 runtime harness: SUCCESS.
- Compile/execute harness: FAILURE.

### Observed failure
The harness failed at: `D1 authorization decision was not observed ==> expected: <true> but was: <false>`.
The producer log shows repeated `TOPIC_AUTHORIZATION_FAILED` metadata responses for `nexo-g0-runtime` before the timeout. No `G0_PROPAGATION_WITNESS` was emitted and the evidence-upload step was skipped.

### Critical interpretation
This run is NOT a valid propagation-window result. It must not be classified as D1=DENIED, because the harness never captured the intended D1 WRITE authorization decision in `TargetAuthorizer`.

The current working hypothesis is a harness-level metadata-path issue: the NEW D1 producer has no warmed metadata state and its initial metadata path encounters topic authorization before the instrumented WRITE authorization decision. The current ACL grants WRITE only. This remains a hypothesis requiring verification, not a source-level conclusion.

Therefore:
- `PROPAGATION_WINDOW = PENDING_HARNESS_CORRECTION`
- `POST_D0_NEW_REQUEST = NOT_OBSERVED`
- `D1_AUTHORIZATION_DECISION = UNKNOWN`
- `D1_APPEND = UNKNOWN`
- `G0_PROPAGATION_WITNESS = NO`
- `EXPLOITABILITY = UNKNOWN`
- `AB105.116R = INTACT`
- `NO AB105.117R`
- `NO TLC RERUN`

### Required next correction
Inspect the pinned Kafka request/authorization path and adjust the harness so D1 has valid topic metadata before D0 while the actual NEW produce request/authorization occurs after D0. Do not add permissions merely to force the test through unless separately justified and recorded. Preserve the distinction between metadata authorization and WRITE authorization.

The failed run is retained as evidence of a harness limitation, not as evidence for or against the propagation-window hypothesis.


## PR #85 — metadata warmup correction persisted — 2026-10-01

PR #84's failure was traced to the NEW D1 producer reaching the metadata authorization path after D0, where the ACL had already been deleted. The intended discriminator requires the producer to have valid topic metadata before D0 while deferring the actual NEW WRITE authorization until after D0.

- PR #85: OPEN / DRAFT / UNMERGED.
- Branch: `nexo-ab105-g0-propagation-window-metadata-warmup`.
- Head: `349d0197300ab87f7744452be2d6e2e861fc2c03`.
- Base: main `4af8d8a0edd0edf4b8460d488684eede28e85201`.
- Correction: instantiate D1 producer before D0 and call `partitionsFor(TOPIC_NAME)` to warm partition metadata while the WRITE ACL still exists; no record is sent, so baseline E remains zero. D1's actual `send(...).get()` remains after D0 on the separate D1 executor.
- No additional ACL permission was introduced.
- Workflow run: `36943841895` — QUEUED at checkpoint time.

Epistemic state remains:
- `PROPAGATION_WINDOW = PENDING_EXECUTION`
- `D1_AUTHORIZATION_DECISION = PENDING_EXECUTION`
- `EXPLOITABILITY = UNKNOWN`
- `AB105.116R = INTACT`
- `NO AB105.117R`
- `NO TLC RERUN`

The PR #84 failure remains preserved as a harness limitation and is not converted into a D1 denial result.
