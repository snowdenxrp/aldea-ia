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
