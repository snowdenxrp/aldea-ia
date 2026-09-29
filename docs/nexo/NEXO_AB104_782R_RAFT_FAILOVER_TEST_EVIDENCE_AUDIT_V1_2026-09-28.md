# NEXO AB104.782R — concrete Raft failover and stale-replica test evidence
Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Scope
Inspect actual etcd/raft source and test surfaces for quorum loss, stale terms, leader transfer, delayed replication, and recovery. Separate directly exercised properties from protocol inference.

## 1. Current Raft source: higher-term and lower-term handling
The current etcd/raft `Step` path treats a higher incoming term as authoritative and moves the local node to follower for Append/Heartbeat/Snapshot messages. It also contains explicit handling for messages from lower-term leaders and documents the partition/stale-node case. citeturn0search0

Direct source evidence: a stale participant is not merely observed as stale; receiving newer consensus state changes its local role.

## 2. Quorum loss causes leader step-down
Current `stepLeader` checks `QuorumActive()`. If quorum is not active, the leader logs the condition and calls `becomeFollower`. This is receiver/local-state enforcement, not merely a monitoring metric. citeturn0search0

Important limitation: this prevents new Raft proposals from being safely committed through that old leader, but does not itself fence an arbitrary external side effect already issued by the process.

## 3. Concrete test evidence: election requires quorum
The current etcd/raft scenario-test catalogue includes `TestElectionRequiresQuorum`, which drops all vote messages and verifies that no `MsgApp` is produced. The same suite includes `TestAtMostOneLeaderPerTerm` and `TestPreVotePreventsTrumpByStaleNode`. citeturn0search1turn0search2

This is direct executable-test evidence for quorum and stale-node election properties.

## 4. Concrete test evidence: delayed / lagging leader transfer
The scenario catalogue includes `TestLeadershipTransferCatchesUpLaggingTarget`: it isolates the transfer target, advances the log, heals the link, and verifies that the current leader sends catch-up entries before issuing `MsgTimeoutNow`. citeturn0search1turn0search2

This matters because leadership transfer is not treated as simply changing a pointer. The target must first catch up sufficiently before being instructed to take leadership.

## 5. Concrete source evidence: transfer implementation
Current etcd/raft source shows the leader-transfer path. If the target already matches the leader's last index, `MsgTimeoutNow` can be sent immediately; otherwise the leader sends Append entries first. citeturn0search0

Current etcd server code waits until the local `Lead()` equals the transferee before reporting transfer completion. The source also contains a TODO noting that requests to the old leader are not necessarily drained or dropped as part of this transfer path. citeturn0search3

That TODO is a useful boundary finding: leadership transfer completion and draining every in-flight application request are distinct concerns.

## 6. Concrete test evidence: stale/newer logs
The current raft test suite includes `TestLeaderElectionOverwriteNewerLogs`. Its scenario intentionally creates different uncommitted histories across nodes, then verifies that the elected leader can overwrite higher-term uncommitted entries that were never committed. citeturn0search0

This directly demonstrates the distinction between:
- locally present state;
- replicated but uncommitted state;
- committed state.

Only the committed boundary has consensus durability meaning.

## 7. Delayed and reordered messages
The current etcd/raft scenario-test catalogue explicitly includes delayed, duplicated, dropped, and out-of-order message tests under `message_delivery_test.go`, alongside partition and log-replication suites. citeturn0search2

This gives direct test evidence that the protocol is exercised against message-delivery faults rather than only ideal delivery.

## 8. What this proves for Nexo — and what it does not
Directly supported:
1. quorum is required to elect/maintain a safe Raft leader;
2. higher terms fence older local roles;
3. stale/lagging replicas are expected and handled;
4. leadership transfer can require target catch-up;
5. delayed/out-of-order messages are explicitly tested;
6. uncommitted divergent logs may be overwritten after a new election.

Not established by these tests:
1. that every arbitrary external side effect is fenced by Raft;
2. that an application request already executing on an old leader is retroactively canceled;
3. that leadership-transfer completion drains every in-flight request;
4. that a resource outside the Raft state machine will reject stale authority without its own fence;
5. a formal proof of Nexo's future authority/fencing model.

## 9. Strong new boundary finding
Leader-transfer completion is not equivalent to an application-effect fence.

Formally, the studied sequence can be:
leader transfer begins → target catches up → new leader becomes authoritative → transfer API reports completion

while an application request may already be in flight on the old leader. The current etcd server source explicitly notes that request draining/dropping is not implemented in the shown transfer path. citeturn0search3

Therefore Nexo must not use `leadership_changed == all_old_effects_stopped` as an implicit assumption.

## Candidate invariant refinement
For protected namespace R, a leadership/authority transition must establish a new generation g2, and every effect crossing the protected acceptance boundary must be validated against the current accepted generation. Completion of the leadership-control operation alone is insufficient evidence that previously admitted effects have been canceled.

## Evidence ledger
RAFT_HIGHER_TERM_FENCES_LOCAL_ROLE SOURCE CONFIRMED
RAFT_QUORUM_LOSS_STEPDOWN SOURCE CONFIRMED
ELECTION_REQUIRES_QUORUM EXECUTABLE_TEST_CONFIRMED
AT_MOST_ONE_LEADER_PER_TERM EXECUTABLE_TEST_CONFIRMED
STALE_NODE_PREVOTE_PROTECTION EXECUTABLE_TEST_CONFIRMED
LAGGING_TRANSFER_TARGET_CATCHUP EXECUTABLE_TEST_CONFIRMED
TRANSFER_TIMEOUTNOW_AFTER_TARGET_READY SOURCE CONFIRMED
TRANSFER_COMPLETION_DRAINS_ALL_APPLICATION_REQUESTS NOT ESTABLISHED; SOURCE TODO SUGGESTS NO
UNCOMMITTED_DIVERGENT_LOG_CAN_BE_OVERWRITTEN EXECUTABLE_TEST_CONFIRMED
DELAYED_DUPLICATED_DROPPED_OUT_OF_ORDER_MESSAGES TEST_SURFACE CONFIRMED
RAFT_ALONE_FENCES_ARBITRARY_EXTERNAL_EFFECT FALSE
IN_FLIGHT_APPLICATION_EFFECT_RETROACTIVE_CANCELLATION NOT ESTABLISHED
FORMAL_UNIVERSAL_PROOF NOT ESTABLISHED
EXECUTED_EXTERNAL_FAILOVER_RACE BY THIS AUDIT NO
NEXO_IMPLEMENTATION NOT PERFORMED

## Exact next action
AB104.783R: study the application/request path around etcd leader transfer and proposal submission. Determine whether proposals accepted immediately before step-down can still commit, what the client observes on leader change, and which idempotency/reconciliation mechanisms are needed when a request times out or loses its leader. Contrast this with the protected-resource fencing model already established in AB104.778R.
## Additional current-source/test observations

The current raft source explicitly drops proposals when a leader has a pending leadership transfer, and it sends AppendEntries to the transferee until the transferee's Match index reaches the leader's last index before issuing TimeoutNow. This supports a staged transfer boundary rather than an instantaneous role flip. SOURCE CONFIRMED. citeturn0search0

The current raft test suite contains `TestLeaderElectionOverwriteNewerLogs`: a term-1 leader leaves an uncommitted entry on one node, a term-2 leader leaves another uncommitted entry elsewhere, and a later election is allowed to overwrite those uncommitted tails. This directly demonstrates that stale local state is not equivalent to committed state. SOURCE CONFIRMED. citeturn0search2

A current etcd/raft scenario-test PR catalogs explicit tests for election quorum, partitioned leaders, follower catch-up, majority commit, CheckQuorum stepdown, leadership transfer, delayed/duplicate/dropped/out-of-order messages, and snapshot recovery. Because this is a PR/test catalogue rather than a verified merged-state snapshot in this audit, its merge status is kept UNKNOWN; it is evidence of the intended test surface, not proof that every scenario is already in the canonical branch. citeturn0search3

## Refined boundary

Raft gives strong evidence for consensus-managed state: stale terms are rejected, non-quorum leaders step down, and uncommitted entries may be overwritten. It does not automatically fence a side effect that occurs outside the Raft commit/apply boundary.

The next research target is therefore not another leader-election abstraction. It is the exact `commit -> apply -> external effect -> acknowledgement` boundary, including process pause and timeout at each edge.

## Evidence additions

LEADERSHIP_TRANSFER_IS_STAGED SOURCE CONFIRMED
PROPOSALS_DROPPED_DURING_LEADERSHIP_TRANSFER SOURCE CONFIRMED
UNCOMMITTED_STALE_LOG_TAIL_CAN_BE_OVERWRITTEN SOURCE CONFIRMED BY TEST
SCENARIO_FAILURE_TEST_CATALOGUE EXISTS SOURCE CONFIRMED
SCENARIO_PR_MERGED_STATUS UNKNOWN
RAFT_COMMIT_APPLY_EXTERNAL_EFFECT_ATOMICITY NOT ESTABLISHED


## AB104.783R research — commit/apply/effect/acknowledgement boundary

### Source findings

Current etcd/raft explicitly separates committed entries from application: Ready exposes CommittedEntries, the application processes them, then calls Node.Advance. The raft README also states that a proposal may not be committed and may need reproposal after timeout. Therefore proposal submission, consensus commit, state-machine application, and client acknowledgement are distinct lifecycle points. [SOURCE: etcd/raft README and doc.go]. citeturn0search0turn0search1

The etcd server exposes separate CommittedIndex() and AppliedIndex(), confirming that commit and apply are observable as different states. citeturn0search2

etcd's API guarantee says completed KV operations are durable and linearizable, but this guarantee is for the etcd KV operation itself. It does not make an arbitrary side effect performed by an application after apply atomic with the KV commit. citeturn0search3

### Timeout/retry counterexample

A current etcd issue documents a concrete class of failure where the server may have successfully processed a request even though the client received an error/timeout, followed by client retry. The issue specifically notes that client retries can produce an additional successful mutation and that a failure response does not prove the previous operation did not succeed. This is issue/reproduction evidence, not a claim that etcd's core linearizability is broken. citeturn0search4

### Boundary model

For an external effect E:

P = proposal accepted
C = consensus commit
A = state-machine apply
E = external effect
K = client acknowledgement

The source supports that:

P -> C is not guaranteed immediately;
C -> A is a separate processing stage;
A -> E is application-defined;
E -> K is application-defined.

Therefore no generic exactly-once conclusion may be inferred from Raft commit alone.

### Failure windows

1. C before process crash, A never observed: committed command may still be recoverable from the replicated log and applied later.
2. A before E, then process crash: command may be replayed; external effect must be idempotent or deduplicated.
3. E before K, then process crash/network failure: client may retry despite the effect already occurring.
4. E after authority transition: if E is outside the consensus/fence boundary, Raft alone does not establish that the old authority is rejected.
5. E is idempotent but not fenced: duplicate safety may hold while stale-authority safety still fails.
6. E is fenced but not idempotent: stale operations are rejected, but legitimate retry semantics still require operation identity/reconciliation.

### Strong boundary finding

operation_id and authority_generation solve different problems.

- authority_generation answers: is this actor/operation still authorized for namespace R?
- operation_id answers: have I already accepted/executed this logical operation?

Neither substitutes for the other.

A timeout therefore yields an epistemic state of UNKNOWN about whether the effect occurred unless the protected resource exposes a query/reconciliation protocol.

### Candidate invariant

For external effect namespace R, a command is not considered safely completed merely because its Raft command committed. Completion requires an effect protocol that defines:
1. stale-authority rejection;
2. operation identity/idempotency or reconciliation;
3. durable observation of effect outcome;
4. explicit handling for ambiguous timeout.

### Evidence ledger

RAFT_COMMIT_AND_APPLY_ARE_DISTINCT SOURCE CONFIRMED
PROPOSAL_MAY_REQUIRE_REPROPOSAL_AFTER_TIMEOUT SOURCE CONFIRMED
ETCD_COMMITTED_INDEX_AND_APPLIED_INDEX_DISTINCT SOURCE CONFIRMED
KV_COMPLETION_DURABILITY SOURCE CONFIRMED
ARBITRARY_EXTERNAL_EFFECT_ATOMIC_WITH_RAFT_COMMIT NOT ESTABLISHED
CLIENT_ERROR_DOES_NOT_PROVE_SERVER_DID_NOT_EXECUTE SOURCE/ISSUE EVIDENCE CONFIRMED
RETRY_CAN_DUPLICATE_LOGICAL_MUTATION SOURCE/ISSUE EVIDENCE CONFIRMED
OPERATION_ID != AUTHORITY_GENERATION
TIMEOUT_EFFECT_STATUS_CAN_BE_UNKNOWN SOURCE-DERIVED
EXECUTED_EXTERNAL_EFFECT_RACE BY THIS AUDIT NO
FORMAL_EXACTLY_ONCE_PROOF NOT ESTABLISHED
NEXO_IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.784R: study concrete idempotency/deduplication and reconciliation patterns in etcd/Kafka transactional systems and external-effect coordinators. Determine what survives retries, crashes, leader changes, and ambiguous acknowledgements, and which guarantees require the external resource itself to participate.


## AB104.784R research — idempotency, deduplication, reconciliation

### Kafka evidence

Kafka's documented idempotent producer semantics use a producer ID plus monotonically increasing sequence numbers per topic-partition. Brokers reject duplicate/lower sequence numbers and out-of-sequence higher numbers. This makes producer retries idempotent within the producer identity/session; the transactional producer extends recovery across application sessions through a stable transactional.id and producer epoch fencing. KIP-98 explicitly describes old producer generations being fenced and incomplete transactions being recovered/aborted before a new session proceeds. [SOURCE: Apache Kafka KIP-98 / FAQ]. citeturn0search5turn0search2

Kafka Streams' exactly-once guarantee is deliberately scoped to Kafka-managed state: input offsets, state stores, and output topics are committed atomically. Kafka documentation explicitly distinguishes this from arbitrary external systems; exactly-once with another destination requires cooperation from that destination. citeturn0search1turn0search10

KIP-618 applies the same lesson to source connectors: exactly-once requires atomically tracking source offsets and produced records and fencing zombie tasks. Its definition of fencing is disabling older generations from producing or committing further work. citeturn0search7

### Important distinction

Three mechanisms now have direct evidence:

1. Deduplication — identity/sequence prevents the same logical write from being accepted twice.
2. Fencing — generation/epoch prevents an obsolete actor from continuing to perform writes.
3. Reconciliation — after ambiguous failure, query durable state to determine whether the intended effect already happened and continue from the observed state.

Kafka's internal transactions can combine the first two inside Kafka, but the evidence does not extend that atomicity to arbitrary external effects. citeturn0search5turn0search9

### Failure matrix

| Failure point | Required property |
|---|---|
| before commit | safe retry / reproposal |
| after commit, before apply | durable replay from committed log |
| after apply, before external effect | replay must not create unsafe duplicate |
| after external effect, before ACK | operation identity or reconciliation |
| after authority generation changes | effect-time fencing |
| after crash/restart | durable identity + durable authority state |
| external resource unavailable | UNKNOWN/reconciliation, not blind retry |

### New conclusion

operation_id is necessary but not sufficient.

A robust external-effect protocol needs at least:

operation_id + authority_generation + resource-side acceptance state + reconciliation

If the external resource cannot atomically validate the generation and record/perform the operation, the coordinator cannot honestly claim Kafka/etcd-style exactly-once semantics for that external effect.

### Evidence ledger

KAFKA_IDEMPOTENT_PRODUCER_PID_SEQUENCE_SOURCE_CONFIRMED
KAFKA_TRANSACTIONAL_ID_CROSS_SESSION_RECOVERY_SOURCE_CONFIRMED
KAFKA_OLD_GENERATION_FENCING_SOURCE_CONFIRMED
KAFKA_EOS_SCOPED_TO_KAFKA_MANAGED_STATE_SOURCE_CONFIRMED
KAFKA_EXTERNAL_DESTINATION_REQUIRES_COOPERATION_SOURCE_CONFIRMED
CONNECTOR_ZOMBIE_FENCING_SOURCE_CONFIRMED
DEDUPLICATION != FENCING
FENCING != RECONCILIATION
OPERATION_ID_ALONE_INSUFFICIENT_FOR_AUTHORITY_SAFETY
EXTERNAL_EFFECT_EXACTLY_ONCE_WITHOUT_RESOURCE_COOPERATION_NOT_ESTABLISHED
EXECUTED_EXTERNAL_RESOURCE_RACE BY THIS AUDIT NO
FORMAL_UNIVERSAL_EXACTLY_ONCE_PROOF NOT ESTABLISHED
NEXO_IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.785R: investigate transactional outbox/inbox, idempotency keys, and durable effect journals in real systems. Focus on the exact atomic boundary and on the remaining failure window between committing the journal and performing the external effect.


## AB104.785R research — transactional outbox/inbox and the residual dual-write window

### Evidence from real systems

AWS Prescriptive Guidance describes transactional outbox as the remedy for a database-write + message-publish dual write: business state and an outbox row are committed in the same local transaction, after which a relay publishes asynchronously. It explicitly warns that relay delivery can be duplicated and therefore consumers should be idempotent. This establishes a durable intent boundary, not atomic execution of an arbitrary downstream effect. citeturn0search0

Debezium's Outbox Event Router captures only changes to the outbox table and routes them to the broker. This gives a concrete CDC implementation of the relay boundary, but the external consumer still owns its own effect semantics. citeturn0search9turn0search15

Kafka's own documentation states that exactly-once processing for Kafka-managed destinations is supported, while exactly-once delivery to other destination systems generally requires cooperation from those systems. The consumer position must be coordinated with the destination state; otherwise the default is at-least-once. citeturn0search19turn0search7

Stripe provides a concrete API-side idempotency implementation: an idempotency key identifies a retry-equivalent request, the first result is retained, and later requests with the same key return that result. Stripe also compares parameters for a reused key and errors on mismatch. The key can eventually be pruned, after which the same key may represent a new request. Therefore idempotency scope/retention is itself part of the safety contract. citeturn0search1turn0search17

### Residual window

Transactional outbox changes:

business transaction -> durable intent -> relay

but does not collapse:

relay -> external effect -> acknowledgement

into one atomic boundary.

If the relay publishes to an external destination and crashes before recording delivery, it can retry. That is safe only if the destination recognizes the same logical operation or the relay can reconcile the outcome. AWS explicitly calls out duplicate downstream delivery and recommends idempotent processing. citeturn0search0

### Nexo boundary model

For a protected external effect R:

T0 local durable commit:
  state change + effect intent(operation_id, authority_generation)

T1 relay obtains intent

T2 resource validates authority_generation

T3 resource atomically accepts/rejects operation_id

T4 external effect becomes durable

T5 outcome becomes queryable/reconcilable

The crucial question is whether T3 and T4 share an atomic boundary. If not, the protocol still has a dual-write window and cannot claim universal exactly-once semantics merely from the outbox.

### New distinction

OUTBOX_DURABLE_INTENT != EFFECT_EXECUTED

IDEMPOTENCY_KEY != AUTHORITY_FENCE

CDC_REDELIVERY != DUPLICATE_EFFECT when the sink is properly idempotent

ACK != PROOF_OF_EFFECT unless the acknowledgement semantics explicitly bind to the durable effect

IDEMPOTENCY_SCOPE_AND_RETENTION are part of the contract

A finite idempotency-key retention period means an old operation identifier can eventually become reusable; Nexo cannot assume an operation identifier is globally unique forever unless its namespace/retention/recovery rules guarantee that property.

### Failure matrix

| Window | Safe interpretation |
|---|---|
| DB commit fails | no durable intent |
| DB commit succeeds, relay dead | intent remains recoverable |
| relay sends, crashes before durable delivery mark | retry required; duplicate possible |
| sink accepts, ACK lost | outcome UNKNOWN; reconcile by operation identity |
| sink rejects stale generation | safe stale-operation rejection |
| sink accepts current generation then process dies | effect may exist; retry must dedupe/reconcile |
| idempotency record expires before late retry | old operation may be interpreted as new unless protocol prevents reuse |

### Evidence ledger

TRANSACTIONAL_OUTBOX_ATOMIC_LOCAL_INTENT SOURCE CONFIRMED
OUTBOX_RELAY_AT_LEAST_ONCE/DUPLICATE POSSIBILITY SOURCE CONFIRMED
DEBEZIUM_OUTBOX_CDC SOURCE CONFIRMED
KAFKA_EXTERNAL_EOS_REQUIRES_DESTINATION_COOPERATION SOURCE CONFIRMED
IDEMPOTENCY_KEY_RETRY_SUPPRESSION SOURCE CONFIRMED
IDEMPOTENCY_PARAMETER_BINDING SOURCE CONFIRMED
IDEMPOTENCY_RETENTION/PRUNING SOURCE CONFIRMED
OUTBOX_DURABLE_INTENT != EXTERNAL_EFFECT
OUTBOX_DOES_NOT_ATOMICALLY_COMMIT_ARBITRARY_EXTERNAL_EFFECT
IDEMPOTENCY_KEY != AUTHORITY_FENCE
ACK_SEMANTICS_MUST_BE_EXPLICIT
EXECUTED_EXTERNAL_EFFECT_RACE BY THIS AUDIT NO
FORMAL_UNIVERSAL_EXACTLY_ONCE_PROOF NOT ESTABLISHED
NEXO_IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.786R: inspect real inbox/idempotent-consumer implementations and failure tests, especially concurrent duplicate delivery, parameter mismatch, retention expiry, crash after sink commit, and reconciliation. Determine whether operation identity must be bound to payload hash, authority generation, resource namespace, and a durable epoch to prevent semantic key reuse.


## AB104.786R research — inbox/idempotent-consumer concurrency and external-effect limits

### Real implementation/documentation evidence

Microsoft's current Idempotent Consumer guidance explicitly identifies the dangerous check-then-process race: concurrent consumers can both observe that a key is absent. It recommends a database uniqueness constraint/atomic conditional write as the conflict arbiter. It also requires the deduplication marker and local business side effects to commit in the same transaction. SOURCE: Microsoft Architecture Center. citeturn1search0

The same guidance makes a critical boundary explicit for effects that cannot join that transaction (for example third-party APIs): persist an in-progress state, execute the external action, then persist completed/outcome state; redelivery of an in-progress record requires reconciliation rather than blind replay. citeturn1search0

A current Debezium JDBC connector documents the same practical rule: at-least-once delivery can repeat events after restart/rebalance, and upsert makes writes to the target database idempotent. citeturn0search7

A current Debezium Server document explicitly says its delivery is at-least-once and that a later batch failure can cause an earlier acknowledged group to replay; downstream deduplication is therefore required. citeturn0search3

### Real failure evidence

Wolverine issue #4202 reports a production-reproducible inbox partitioning bug where the same logical message identity could exist simultaneously in Incoming and Scheduled partitions, defeating the intended uniqueness boundary and causing a retry/polling stall. The issue includes a test sequence reproducing the duplicate state. This is strong evidence that an inbox's uniqueness scope must remain invariant across lifecycle states/partitions; merely having a UNIQUE constraint is not sufficient if the physical schema partitions the identity domain incorrectly. citeturn1search8

Wolverine issue #2639 reports duplicate Kafka delivery interacting with a uniqueness violation such that the offset was not committed and the partition stalled. This demonstrates a second lesson: duplicate detection itself must have an explicit recovery/acknowledgement path; a raw uniqueness exception is not a complete duplicate protocol. citeturn1search10

A current production-oriented PayFlow implementation documents the chosen guarantee as at-least-once plus idempotent consumers rather than claiming exactly-once across PostgreSQL and RabbitMQ; its inbox uses (consumer_name, message_id) as a unique key and places the domain operation and inbox record in one transaction. This is implementation evidence, not a universal proof. citeturn1search1

### Identity scope findings

The deduplication key must identify the logical operation across redelivery, but it must also be scoped to the consumer/resource namespace. A message identity alone can be too broad when multiple independent consumers must each process the same event. The current guidance recommends a composite such as (consumer identity, message identity). citeturn1search0

Payload binding is also important: current guidance describes comparing immutable fields/request hashes on an existing identity and treating a mismatch as an identifier reuse/corruption condition rather than overwriting the original receipt. citeturn1search0turn1search4

### External-effect limit

The inbox transaction can safely deduplicate a local database effect. It cannot make a third-party API/payment/email/device operation atomic with that database transaction.

The unsafe alternatives are symmetric:

- commit inbox first -> crash before external effect -> retry may be suppressed although effect never happened;
- external effect first -> crash before inbox commit -> retry may repeat the external effect.

Therefore an external effect requires either:
1. a downstream idempotency/conditional-acceptance contract;
2. an outbox/worker plus durable reconciliation;
3. a protocol that places the effect and the deduplication state inside one common atomic boundary.

### New candidate invariant

For a consumer namespace N and logical operation O:

Dedup(N,O) must be atomically coupled to the local effect it protects, and its identity scope must remain stable across all retry/lifecycle states.

For an external resource X:

Dedup(N,O) alone does not prove Effect(X,O).

### Evidence ledger

INBOX_UNIQUE_CONSTRAINT_AS_CONCURRENCY_ARBITER SOURCE CONFIRMED
CHECK_THEN_ACT_RACE SOURCE CONFIRMED
INBOX_MARKER_PLUS_LOCAL_EFFECT_ATOMIC SOURCE CONFIRMED
IN_PROGRESS_EXTERNAL_EFFECT_REQUIRES_RECONCILIATION SOURCE CONFIRMED
DEBEZIUM_AT_LEAST_ONCE_REPLAY SOURCE CONFIRMED
DEBEZIUM_JDBC_UPSERT_IDEMPOTENCE SOURCE CONFIRMED
INBOX_IDENTITY_SCOPE_MUST_INCLUDE_CONSUMER_NAMESPACE SOURCE CONFIRMED
PAYLOAD/REQUEST_BINDING_ON_REUSED_ID SOURCE CONFIRMED
PARTITIONED_INBOX_IDENTITY_COLLISION REAL REPORTED TEST EVIDENCE
DUPLICATE_UNIQUE_VIOLATION_CAN_STALL_ACK/PROGRESS REAL REPORTED ISSUE
LOCAL_INBOX_ATOMICITY != EXTERNAL_EFFECT_ATOMICITY
IDEMPOTENCY_KEY != AUTHORITY_GENERATION
EXECUTED BY THIS AUDIT NO
FORMAL UNIVERSAL EXACTLY_ONCE PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.787R: investigate the external-effect reconciliation state machine itself: PENDING/SUBMITTED/CONFIRMED/UNKNOWN/FAILED, concurrent workers, lease expiry, stale workers, authority-generation changes, and whether reconciliation can safely distinguish a lost ACK from a failed effect. Seek real implementations and failure tests rather than designing Nexo yet.


## AB104.788R research — stale workers, cancellation, and authority changes during UNKNOWN/SUBMITTED

### Real systems evidence

Temporal's current Activity documentation states that cancellation is delivered to Activities through heartbeats; an Activity may accept or ignore cancellation. A worker can therefore continue executing after orchestration-level cancellation unless the Activity cooperates, and cancellation is not itself an external-effect fence. SOURCE: Temporal documentation. citeturn0search2turn0search3

Temporal's current long-running Activity pattern uses heartbeat state to resume after worker failure and explicitly warns that cancellation can be delayed until the next heartbeat. This demonstrates a distinction between worker-liveness detection and effect authorization. citeturn0search4

Temporal's current learning material gives a concrete failure case: an Activity performs an HTTP POST, the POST succeeds, and then the worker/network fails before the Activity reports completion; the Activity is retried and the receiver sees the request again. The documented protection is a stable receiver-side idempotency key. citeturn0search14

AWS Step Functions provides a different callback model. A task can wait for an external process through a task token; if the callback task times out, AWS generates a new random token. Heartbeats can detect a stuck callback task. This establishes explicit callback-attempt identity and timeout state, but it does not make the external action itself atomic or retroactively cancel a request already accepted by the external service. citeturn0search0turn0search13

AWS's callback integration example persists a mapping from an external/business identifier to the workflow task token, then uses the identifier on callback to locate the waiting task. This is concrete reconciliation plumbing: external completion is correlated with durable workflow state rather than inferred from the transport response alone. citeturn0search5

### Stale-worker conclusion

The evidence supports a two-layer stale-worker defense:

1. Orchestration/liveness layer: lease/heartbeat/cancellation detects workers that should no longer continue.
2. Effect-resource layer: idempotency and/or authority-generation validation rejects unsafe stale effects that still reach the receiver.

Layer 1 alone is insufficient because cancellation may be delayed or ignored by the worker. Layer 2 alone does not stop wasted work, so both solve different problems. citeturn0search2turn0search14

### Authority change while SUBMITTED/UNKNOWN

If an operation was submitted under authority generation g1 and the authority changes to g2 before its outcome is known, the old operation retains g1 as historical authorization context.

A reconciliation query may legitimately discover that g1's effect succeeded after the transition. That does not mean the old operation was re-authorized under g2; it means an already-submitted operation was later observed.

Conversely, an UNKNOWN result cannot be converted to a new submission under g2 merely because the old operation is unresolved. A new submission must have a new logical operation identity and pass current authorization.

Candidate separation:

reconcile(old_operation, g1) != authorize_and_submit(new_operation, g2)

### Callback/token evidence

AWS Step Functions' callback token model shows another useful boundary: workflow continuation is keyed by a durable callback token, while the external system performs its own work independently. A token timeout causes a new token for a subsequent attempt rather than retroactively proving the previous external attempt did not happen. citeturn0search0turn0search36

Therefore callback token, operation identity, authority generation, and worker lease are distinct state dimensions.

### Candidate transition constraints

After authority changes from g1 to g2:

- SUBMITTED(g1) -> CONFIRMED(g1) is valid if external evidence confirms the old operation.
- SUBMITTED(g1) -> FAILED(g1) is valid if the external resource durably reports failure.
- SUBMITTED(g1) -> UNKNOWN(g1) is valid when outcome cannot be established.
- UNKNOWN(g1) -> CONFIRMED(g1) is valid through reconciliation evidence.
- UNKNOWN(g1) -> FAILED(g1) is valid through reconciliation evidence.
- UNKNOWN(g1) -> SUBMITTED(g2) is NOT a retry of the same operation; it would constitute a new operation and must receive a new operation identity and fresh authorization.
- CANCELLED(g1) -> external effect cannot be assumed impossible unless the effect receiver enforces cancellation/epoch/idempotency semantics.

### Strong negative finding

No audited orchestration system establishes the universal proposition:

cancel/timeout/lease-expiry => previously submitted arbitrary external effect cannot later become durable

That proposition requires cooperation from the effect receiver or a shared atomic commit boundary.

### Evidence ledger

TEMPORAL_CANCELLATION_DELIVERED_VIA_HEARTBEAT SOURCE CONFIRMED
ACTIVITY_MAY_IGNORE_CANCELLATION SOURCE CONFIRMED
HEARTBEAT_LIVENESS != EFFECT_FENCE
TEMPORAL_POST_AFTER_SUCCESS_BEFORE_ACK_CAN_RETRY SOURCE/TEST MATERIAL CONFIRMED
RECEIVER_IDEMPOTENCY_REQUIRED SOURCE CONFIRMED
AWS_CALLBACK_TOKEN_DURABLE_CORRELATION SOURCE CONFIRMED
CALLBACK_TIMEOUT_GENERATES_NEW_TOKEN SOURCE CONFIRMED
CALLBACK_TIMEOUT != PROOF_OLD_EXTERNAL_EFFECT_ABSENT
WORKER_LEASE/HEARTBEAT != AUTHORITY_GENERATION
OLD_OPERATION_RECONCILIATION != NEW_AUTHORIZED_SUBMISSION
UNIVERSAL_CANCEL_RETROACTIVE_EXTERNAL_EFFECT_FENCE NOT ESTABLISHED
EXECUTED NEXO RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.789R: investigate the receiver-side protocol when an old worker races a new authority generation: conditional writes, fencing-token validation, operation-id reuse, status-query semantics, and real tests for stale submission after lease/epoch change. Focus on resource-side acceptance as the actual safety boundary.


## AB104.789R research — receiver-side acceptance under stale-worker / new-generation races

### Real receiver-side evidence

etcd's current transaction model provides a concrete receiver-side acceptance boundary: comparisons and mutations are evaluated atomically. Comparisons can inspect key presence, value, version, or revision; if the comparison fails, the success mutation is not applied. This is stronger than a prior read followed by a later write. SOURCE: etcd API documentation. citeturn0search11turn0search2

The resulting pattern is directly applicable to a protected resource that stores its current incarnation/generation: the operation carries the expected generation, the receiver compares it at the mutation boundary, and only a matching generation permits the mutation. This is source-supported as an etcd capability; it is not proof that an arbitrary external resource has such a capability.

Temporal's current 2026 standalone-Activity tutorial gives concrete receiver-side idempotency evidence: Activity execution is at-least-once, a POST can succeed before the worker reports completion, and retries can therefore duplicate delivery. A stable idempotency key derived from the logical event is required; a fresh random key per retry defeats deduplication. Temporal also separates scheduling-layer Activity-ID conflict handling from receiver-side idempotency. citeturn0search0

Temporal's same tutorial demonstrates an additional identity boundary: USE_EXISTING only suppresses duplicate Activity starts while the original execution is in flight; after completion, a separate ID-reuse policy controls whether a new execution may use the same ID. Therefore operation identity has a lifecycle/retention contract and cannot be assumed globally unique forever. citeturn0search0

Stripe's documented idempotency design provides another receiver-side pattern: the server associates the idempotency key with the request state/result and can return the prior result after a response failure. Its documented contract also requires the retry to use the same logical key rather than a newly generated key. citeturn0search1

### Stale-worker race

Consider:

g1 = accepted authority generation
g2 = newer generation
O1 carries g1

Race:

T0 O1 begins
T1 authority advances g1 -> g2
T2 O1 reaches receiver
T3 receiver compares O1.generation with current generation
T4 receiver rejects O1

This is the safety boundary.

If T2/T3 occurs before the authority transition is linearized, O1 may legitimately linearize under g1. Therefore "new generation exists somewhere" is not enough; the protected resource needs a defined acceptance linearization point.

### Operation identity vs generation

The receiver must not collapse these fields:

- operation_id: which logical operation is this?
- authority_generation: under which authority was it admitted?
- resource_namespace: which protected resource/domain is being mutated?
- payload_hash or immutable request binding: what exact operation does this identity represent?
- incarnation (where applicable): which lifetime of the resource/lock/object is being targeted?

An operation ID can prevent duplicate execution while still being authorized under an obsolete generation. A generation can reject stale authority while still allowing the same logical operation to be submitted twice. Both dimensions are therefore necessary for different safety properties.

### Operation-ID reuse / retention

Temporal's current Activity-ID model proves a practical lifecycle distinction: duplicate-start policy applies while an execution is in flight, while ID-reuse policy applies after completion. Thus a system must define how long an operation identity remains reserved and what happens after that interval. citeturn0search0

This reinforces the AB104.785R finding: finite idempotency retention is part of the safety contract. If an old identity can be reused after the deduplication record disappears, a late retry can become a new logical operation unless the protocol binds the identity to a durable namespace/epoch or otherwise prevents semantic reuse.

### Strong candidate receiver contract

For protected resource R:

ACCEPT(operation) iff
1. operation.resource_namespace == R
2. operation identity is valid for the operation's retention/epoch rules
3. request binding/payload identity matches any existing operation record
4. operation.authority_generation is not stale relative to R's current accepted authority state
5. the acceptance decision and protected mutation share an atomic/linearizable commit boundary where required

If any condition fails, the receiver must reject or return an explicitly reconcilable status rather than silently treating the request as a new operation.

### Evidence ledger

ETCD_ATOMIC_COMPARE_AND_MUTATE SOURCE CONFIRMED
ETCD_REVISION/VERSION_COMPARE SOURCE CONFIRMED
RECEIVER_SIDE_ACCEPTANCE_BOUNDARY SOURCE CONFIRMED FOR ETCD
TEMPORAL_AT_LEAST_ONCE_EXTERNAL_POST SOURCE CONFIRMED
TEMPORAL_STABLE_IDEMPOTENCY_KEY SOURCE CONFIRMED
SCHEDULER_ID_CONFLICT != RECEIVER_IDEMPOTENCY SOURCE CONFIRMED
OPERATION_ID_RETENTION/REUSE_POLICY SOURCE CONFIRMED
OPERATION_ID != AUTHORITY_GENERATION
OPERATION_ID != RESOURCE_NAMESPACE
OPERATION_ID != PAYLOAD_BINDING
OPERATION_ID != INCARNATION
STALE_WORKER_SAFETY REQUIRES RECEIVER ENFORCEMENT SOURCE-SUPPORTED
GENERIC_EXTERNAL_RESOURCE_FENCING NOT ESTABLISHED
EXECUTED NEXO RACE NO
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.790R: investigate receiver-side status-query/reconciliation semantics and the "already applied / not found / in progress / rejected as stale" ambiguity. Focus on whether status APIs themselves can be stale, whether a status query can be bound to operation identity and payload, and what evidence is sufficient to transition UNKNOWN to CONFIRMED or FAILED.


## AB104.790R research — status-query/reconciliation semantics

### Current external API evidence

AWS EC2 provides unusually explicit idempotency semantics for asynchronous mutation: the original request may return before the operation is complete, and a later retry using the same client token and same parameters returns without performing the action again; the returned result can instead expose the current creation status. If parameters differ, the service can return IdempotentParameterMismatch. Regional idempotency also scopes the same token to a region. SOURCE: AWS EC2 documentation. citeturn0search2

AWS Proton documents the same pattern with a finite retention boundary: client tokens expire after eight hours; reuse after expiry can create a new resource. Its asynchronous delete APIs expose DELETE_IN_PROGRESS and then a completed/empty result on later idempotent retry. This is direct evidence that status and idempotency retention are part of the externally visible contract. citeturn0search5

AWS Well-Architected guidance describes the intended idempotent-service response model: repeat requests with the same idempotency token should return the response associated with the original completed request rather than create another side effect. citeturn0search1

Temporal's current documentation similarly separates task execution attempts from the durable workflow result. An Activity can have multiple task executions, while the workflow records the eventual completion/failure state; therefore the worker's local result is not itself the durable truth. citeturn0search0

### Status interpretation

The audit therefore distinguishes these receiver responses:

ALREADY_APPLIED / COMPLETED:
Strong evidence only when the receiver binds the response to the exact operation identity and request semantics.

IN_PROGRESS:
Evidence that the receiver knows about the operation, but not that the effect is durable yet.

NOT_FOUND:
Not sufficient by itself to prove "never executed". It is safe evidence of absence only under a documented linearizable/status contract and a namespace/retention model that rules out an already-expired or pruned record.

REJECTED_STALE:
Strong evidence that the receiver's authority fence rejected the submitted generation/epoch. This is different from transport failure.

PARAMETER_MISMATCH:
Strong evidence that the operation identity exists but the supplied request differs from the recorded request; this must not be silently treated as a new operation.

TIMEOUT / CONNECTION_LOST:
UNKNOWN about external effect unless the receiver contract explicitly makes the timeout outcome definitive.

### The critical NOT_FOUND problem

A query such as GET(operation_id) -> 404 is not universally equivalent to "operation never happened".

It can mean:
- operation never existed;
- operation record expired/pruned;
- operation exists in another namespace/region;
- record is not yet visible through a stale/non-linearizable read;
- operation was applied but durable status retention has ended.

AWS examples make the namespace and retention boundaries explicit: the same client token may be scoped regionally, and some idempotency records expire. citeturn0search2turn0search5

Therefore UNKNOWN -> FAILED cannot be justified from NOT_FOUND alone unless the receiver proves a sufficiently strong absence contract.

### Evidence threshold for UNKNOWN -> CONFIRMED

Minimum evidence should be receiver-authenticated evidence that:
1. the exact operation identity was accepted;
2. the request binding matches;
3. the operation reached the effect's durable success state;
4. the returned state is from the relevant resource/namespace;
5. the status observation has sufficient freshness/consistency for the claimed conclusion.

A transport-level 200 from a coordinator is not automatically equivalent to item 3.

### Evidence threshold for UNKNOWN -> FAILED

Minimum evidence should be:
1. exact operation identity or a resource state that proves the intended effect cannot have occurred;
2. receiver-defined terminal failure semantics;
3. sufficient retention/consistency to exclude a late-arriving successful operation;
4. no possibility that the observed failure applies to a different attempt or namespace.

If those conditions cannot be established, remain UNKNOWN.

### New distinction: query evidence vs fence evidence

A status query answers "what does the resource currently report about this operation?"

A fencing check answers "is this operation currently allowed to create the protected effect?"

They are not interchangeable.

A fresh CONFIRMED result can establish effect truth for an old operation without re-authorizing it. A stale worker still needs a current fence before attempting a new mutation.

### Evidence ledger

ASYNC_REQUEST_CAN_RETURN_BEFORE_OPERATION_COMPLETES SOURCE CONFIRMED
IDEMPOTENT_RETRY_CAN_RETURN_CURRENT_CREATION_STATUS SOURCE CONFIRMED
PARAMETER_MISMATCH_DETECTED SOURCE CONFIRMED
REGIONAL/RESOURCE NAMESPACE BINDING SOURCE CONFIRMED
FINITE IDEMPOTENCY RETENTION SOURCE CONFIRMED
ASYNC_DELETE_STATUS_TRANSITIONS SOURCE CONFIRMED
ALREADY_APPLIED REQUIRES EXACT OPERATION BINDING
IN_PROGRESS != CONFIRMED
NOT_FOUND != UNIVERSAL PROOF OF NEVER_EXECUTED
TIMEOUT/CONNECTION_LOST => UNKNOWN UNLESS CONTRACT SAYS OTHERWISE
QUERY_EVIDENCE != AUTHORITY_FENCE
UNKNOWN -> CONFIRMED REQUIRES DURABLE RECEIVER EVIDENCE
UNKNOWN -> FAILED REQUIRES STRONG ABSENCE/TERMINAL FAILURE EVIDENCE
EXECUTED NEXO RECONCILIATION RACE NO
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.791R: investigate linearizability/staleness of status queries themselves: strong vs eventual reads, operation-status visibility after commit, deletion/retention races, and whether a stale status response can cause unsafe UNKNOWN -> FAILED or UNKNOWN -> CONFIRMED transitions. Seek real APIs and tests.


## AB104.791R research — status-query consistency, staleness, and reconciliation safety

### Real consistency evidence

etcd explicitly distinguishes linearizable reads from serializable reads. Linearizable reads reflect the current consensus state; serializable reads may be stale because they are served locally. Therefore a status query used to close an UNKNOWN operation cannot be assumed authoritative merely because the query succeeded. SOURCE: etcd API guarantees. citeturn0search2turn0search6

Kubernetes exposes the same distinction through resourceVersion semantics. Its API documents that some reads may return arbitrarily stale data, while "most recent" reads provide a consistency guarantee; clients can also request data not older than a supplied resourceVersion. Historical versions may be compacted, producing 410 Gone, and clients must recover by establishing a newer state. citeturn0search0turn0search1

Kubernetes watch-cache source explicitly waits until its cache is at least as fresh as a requested resourceVersion when consistent-read support is available. This is direct implementation evidence that querying the API and querying sufficiently fresh state are separate properties. citeturn0search9

etcd also states that watch streams are ordered/reliable within the retained history window but do not themselves provide linearizable reads. Consumers must use revisions to reason about ordering relative to other operations. A compacted revision is no longer available for replay. citeturn0search2turn0search6

### Reconciliation hazard

Suppose:

R0 operation O is UNKNOWN.
R1 O actually commits at receiver.
R2 status query reaches a stale replica/cache and returns NOT_FOUND.
R3 coordinator records FAILED.

The protocol has now converted a successful effect into a false terminal failure.

The reverse hazard also exists:

R0 O never commits.
R1 stale/corrupted status data reports an old matching operation.
R2 coordinator records CONFIRMED.

Therefore reconciliation needs a defined consistency level, not merely a successful HTTP response.

### Stronger reconciliation evidence

A status observation is suitable for UNKNOWN -> CONFIRMED only when the receiver contract establishes all relevant properties:

- exact operation identity;
- exact resource namespace;
- request/payload binding;
- terminal state;
- freshness/linearizability or an equivalent monotonic version proof;
- status retention sufficient to interpret absence/presence.

A versioned status response can be useful even when the read itself is not globally linearizable, provided the protocol defines how the returned version relates to the required authority/effect boundary. This is a protocol condition, not a generic property of caches.

### UNKNOWN -> FAILED

The audit now distinguishes two cases:

1. Strong absence proof: the receiver guarantees that a read at a specified consistency/version point proves the operation was absent and cannot later appear under the same operation identity.
2. Weak absence observation: a cache/replica currently has no record.

Only (1) can justify a terminal FAILED conclusion for an operation whose external effect could have happened.

If only (2) is available, remain UNKNOWN or perform stronger reconciliation.

### Retention/compaction interaction

Finite history creates another trap. A query after idempotency/status retention expires may return NOT_FOUND even though the operation was previously executed. Kubernetes resourceVersion history and etcd compaction show the general form: once historical state is outside the retained window, the system can require a new synchronization point rather than reconstructing arbitrary old history. citeturn0search0turn0search2

Therefore not found after retention is not equivalent to never executed.

### New candidate rule

Reconciliation may close UNKNOWN only from evidence whose consistency, namespace, identity binding, freshness/version, and retention semantics are sufficient to exclude the opposite terminal outcome.

If those conditions are unavailable:

UNKNOWN remains UNKNOWN.

### Important safety distinction

A fresh status query does not itself fence a new effect.

Even a linearizable CONFIRMED(O,g1) says that old operation O completed; it does not authorize a new operation under g1 after authority has advanced to g2.

Conversely, a current authority fence does not prove whether an old UNKNOWN operation succeeded. The two questions remain orthogonal:

effect truth versus current authority.

### Evidence ledger

ETCD_LINEARIZABLE_READS_SOURCE_CONFIRMED
ETCD_SERIALIZABLE_READS_CAN_BE_STALE_SOURCE_CONFIRMED
K8S_STALE_READ_SEMANTICS_SOURCE_CONFIRMED
K8S_MOST_RECENT/RESOURCE_VERSION_CONSISTENCY_SOURCE_CONFIRMED
WATCH_CACHE_FRESHNESS_WAIT_SOURCE_CONFIRMED
WATCH != LINEARIZABLE_STATUS_READ_SOURCE_CONFIRMED
COMPACTION_LIMITS_HISTORICAL_EVIDENCE_SOURCE_CONFIRMED
STALE_NOT_FOUND_CAN_BE_UNSAFE SOURCE-SUPPORTED
STATUS_QUERY != AUTHORITY_FENCE
UNKNOWN -> CONFIRMED REQUIRES SUFFICIENT RECEIVER EVIDENCE
UNKNOWN -> FAILED REQUIRES STRONG ABSENCE/TERMINAL FAILURE EVIDENCE
RETENTION_BOUNDARY PART OF RECONCILIATION CONTRACT
EXECUTED NEXO RACE NO
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.792R: investigate versioned status evidence and monotonic reconciliation: whether a returned revision/sequence can prove that an operation was absent/present at a required point, how tombstones/deletions are represented, and how to prevent an old status response from overwriting a newer terminal state.


## AB104.792R research — versioned status evidence and monotonic reconciliation

### Real implementation evidence

etcd exposes a monotonic store revision on every response and uses revision comparisons inside transactions. A client can therefore bind a decision to a specific revision rather than treating an unversioned read as timeless truth. Its watch mechanism delivers ordered events with revisions, while compaction explicitly invalidates history older than the compacted revision. SOURCE: etcd API/watch/compaction documentation. citeturn0search0turn0search3

Kubernetes resourceVersion provides a similar optimistic-concurrency and freshness boundary. A write can specify the version it was based on; if the object changed first, the API rejects the stale update instead of silently overwriting the newer state. The API also exposes resourceVersionMatch/resourceVersion semantics for reads and watches, and a compacted historical version can no longer be used as if it were current history. citeturn0search1turn0search4

These systems demonstrate an important property: versioned evidence can prevent an old observation from overwriting newer state, but only when the consumer actually compares/guards the version. Merely returning a revision field is not sufficient.

### Reconciliation monotonicity

Suppose the durable reconciliation record has:

state = CONFIRMED, evidence_version = 120

A late response says:

state = UNKNOWN, evidence_version = 117

The late response must not regress the durable state.

Likewise:

FAILED@120 must not be overwritten by IN_PROGRESS@119.

A safe consumer needs an ordering rule for evidence, such as:

accept(new_evidence) only if it is compatible with or dominates current evidence

The exact dominance relation cannot be assumed to be numeric alone. A revision from one resource/namespace cannot dominate a revision from another namespace, and an operation-status version may not be comparable to an authority-generation version.

### Tombstones and absence

A deletion/tombstone event is stronger than an ordinary NOT_FOUND cache response because it can carry an ordering/version position. However, a tombstone only proves absence relative to its defined namespace and version history; after compaction/retention expiry, historical reconstruction may no longer be possible.

Therefore:

TOMBSTONE@v >= required_v can be meaningful evidence of absence at a defined point.

GET -> 404 without a freshness/version contract remains weak evidence.

### Out-of-order status responses

Even with versioned evidence, the coordinator must protect against:

R1 query returns version 121
R2 older query returns version 119
R3 older response arrives after R1

If state transitions are accepted blindly, R3 can regress the durable state.

The receiver/orchestrator therefore needs a monotonic state/evidence rule, not just versioned messages.

### Critical distinction: evidence version vs authority generation

The audit now has at least three independent version domains:

1. authority_generation: authorization/fencing epoch.
2. operation/effect_version: ordering of the operation's state at the receiver.
3. observation_version: freshness/order of the evidence returned to the reconciler.

They may coincide in a particular implementation, but they must not be assumed equivalent.

Example:

authority_generation = 7
effect_version = 1042
observation_version = 1045

The number 1045 does not mean authority generation 1045.

### Candidate monotonic reconciliation rule

For protected operation O and resource namespace R:

accept(evidence E) only if:
- E is bound to O and R;
- E's request/payload binding is compatible with O;
- E is from a valid evidence source;
- E's version/consistency is sufficient for the transition;
- E cannot be older/inferior to already accepted evidence in a way that regresses terminal truth.

A terminal state should be monotonic unless an explicitly defined correction protocol exists.

### Failure case

If CONFIRMED@v120 is durable and a later reconciliation call receives NOT_FOUND@v121, the protocol cannot automatically declare FAILED merely because v121 is newer numerically. The meaning of v121 must establish that the operation was removed/expired and that such removal is authoritative for effect truth.

This is why numeric monotonicity alone is insufficient; the semantic type and namespace of the version matter.

### Evidence ledger

ETCD_MONOTONIC_STORE_REVISION SOURCE CONFIRMED
ETCD_VERSIONED_WATCH_EVENTS SOURCE CONFIRMED
ETCD_COMPACTION_INVALIDATES_OLD_HISTORY SOURCE CONFIRMED
K8S_RESOURCE_VERSION_STALE_WRITE_REJECTION SOURCE CONFIRMED
K8S_VERSIONED_READ/WATCH_SEMANTICS SOURCE CONFIRMED
VERSIONED_EVIDENCE_CAN_BLOCK_STALE_OVERWRITE SOURCE-SUPPORTED
TOMBSTONE_STRONGER_THAN_UNVERSIONED_NOT_FOUND SOURCE-SUPPORTED
OUT_OF_ORDER_RESPONSE REGRESSION HAZARD SOURCE-SUPPORTED
AUTHORITY_GENERATION != EFFECT_VERSION != OBSERVATION_VERSION
NUMERIC_VERSION_ALONE_INSUFFICIENT
TERMINAL_RECONCILIATION SHOULD BE MONOTONIC UNLESS CORRECTION PROTOCOL EXISTS
EXECUTED NEXO RACE NO
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.793R: investigate semantic version domains and cross-domain fencing: resource version vs operation version vs authority generation, including whether a single monotonic counter is ever sufficient, how namespace binding prevents cross-resource token reuse, and real failure tests involving delayed/out-of-order evidence.


## AB104.793R research — semantic version domains and cross-domain fencing

### Finding 1 — a single monotonic counter is not automatically a universal fence

etcd provides a single cluster revision that orders modifications within its key-value history, and transactions can compare key-specific create/modification revisions atomically with mutations. This is sufficient for etcd's own KV namespace, but the API defines those revisions in relation to that store/key history. It does not make the number a universal authority token for arbitrary external resources. SOURCE: etcd API. citeturn0search2turn0search13

The important distinction is:

monotonic(value) != universally meaningful(authority)

A counter becomes a fencing token only when the protected resource interprets it as such and enforces an ordering rule at its own acceptance boundary.

### Finding 2 — namespace binding is structural, not cosmetic

A token such as 42 is ambiguous without its authority/resource domain.

Unsafe conceptual comparison:

token=42 from namespace A versus token=41 from namespace B.

There is no basis to conclude that A's 42 supersedes B's 41.

A safe token identity is closer to:

(fence_namespace, authority_generation)

and the protected mutation must bind the namespace to the resource being protected.

Current independent fencing implementations make this explicit: disco stamps requests with a fencing token and its server-side Guard rejects stale tokens; another current implementation uses a separate fence namespace/key and requires the presented token to match that lease domain. citeturn0search5turn0search10

### Finding 3 — numeric monotonicity must be enforced at the receiver

A client-side check such as:

if token >= cached_high_water then write

is not a sufficient fence because the high-water value can change between the check and the write.

The safer pattern observed in implementations is:

compare current fence state + protected mutation -> one atomic acceptance boundary

etcd provides this primitive for its own KV state through atomic Compare/Txn operations. citeturn0search2

The independent disco implementation similarly places token checking/advancement in the resource guard rather than trusting an advisory IsLeader result. citeturn0search5

### Finding 4 — resourceVersion is an ordering/freshness mechanism, not automatically an authority epoch

Kubernetes documents resourceVersion as the version of an object/state in its persistence layer. Reads can have different consistency semantics, watches can start from a supplied resourceVersion, and clients that cannot tolerate rewinding must choose stronger semantics. citeturn0search4

Therefore:

resourceVersion = evidence/order

does not imply:

resourceVersion = permission/authority

It can participate in optimistic concurrency, but an authorization epoch should remain semantically distinct unless the system explicitly defines the same value as both.

### Finding 5 — version domains can be composed, but should not be collapsed

For Nexo the current evidence supports keeping at least:

AuthorityDomain = (namespace, authority_generation)

OperationIdentity = (namespace, operation_id, incarnation/retention context)

Evidence = (source, namespace, observation_version, consistency semantics, observed_state)

EffectState = (operation_id, effect_version, terminal_state, payload_binding)

A concrete implementation may optimize these into fewer fields, but semantic separation must survive. A single integer should only be reused across domains if the protocol explicitly proves equivalence, binding, persistence, and receiver enforcement.

### Cross-domain token reuse failure

Consider:

R1 has authority generation 51.
R2 has authority generation 3.

An operation carrying bare token 51 is later routed to R2. If R2 treats the number globally, it may accept a token that was never issued by R2's authority domain.

Conversely, a token 3 issued by R2 cannot be safely compared with token 50 from R1.

This establishes a concrete requirement:

token validity = namespace binding + generation validity

not numeric comparison alone.

### Delayed/out-of-order evidence

Kubernetes explicitly documents that weak read semantics may return data from an older resource version than one previously observed, particularly in HA configurations; clients that cannot tolerate this must not use those semantics. citeturn0search4

etcd's linearizable reads and ordered watch revisions provide stronger ordering guarantees, while serializable reads may be stale. citeturn0search12

Therefore a reconciler receiving:

E1 = CONFIRMED@R=120
E2 = NOT_FOUND@R=119

must not allow E2 to regress E1 merely because both are syntactically valid responses.

Even stronger:

E3 = NOT_FOUND@R=121

still does not automatically mean failure if the semantic meaning of R=121 is merely latest observation rather than an authoritative deletion/tombstone of this exact operation.

### Real failure evidence found

The disco implementation explicitly treats fencing at the protected-resource boundary and exposes stale-token rejection rather than trusting leadership observation. citeturn0search5

The etcd API gives a concrete atomic primitive for comparing a key's revision/version and mutating state in one transaction, which is the required shape for avoiding check-then-write races inside that resource. citeturn0search2

The audit did not find a universal test demonstrating that an arbitrary external resource can safely consume a bare etcd/Kubernetes revision as an authority fence. That remains NOT ESTABLISHED.

### Evidence ledger

ETCD_REVISION_SCOPE_IS_STORE_HISTORY SOURCE CONFIRMED
SINGLE_MONOTONIC_COUNTER_IS_NOT_AUTOMATIC_UNIVERSAL_FENCE SOURCE-SUPPORTED
TOKEN_NAMESPACE_BINDING REQUIRED
NUMERIC_TOKEN_CROSS_NAMESPACE_REUSE UNSAFE
RECEIVER_SIDE_FENCE REQUIRED FOR EFFECT SAFETY
ETCD_ATOMIC_COMPARE_AND_MUTATE SOURCE CONFIRMED
K8S_RESOURCE_VERSION_IS_STATE/FRESHNESS VERSION SOURCE CONFIRMED
RESOURCE_VERSION != AUTHORITY_GENERATION BY DEFAULT
AUTHORITY_DOMAIN SHOULD BE EXPLICIT
OPERATION_ID/INCARNATION SHOULD REMAIN DISTINCT
OBSERVATION_VERSION SHOULD REMAIN DISTINCT
OUT_OF_ORDER/STALE READS REAL DOCUMENTED BEHAVIOR
EXECUTED NEXO CROSS-DOMAIN RACE NO
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.794R: investigate real stale-response/out-of-order test suites and implementation paths that protect terminal reconciliation state, including whether systems use CAS/resourceVersion/sequence guards against late responses and whether those guards survive restart, failover, compaction, and namespace changes.

## AB104.794R research — stale/out-of-order response tests and terminal-state protection

### Concrete etcd failure/test evidence

A current etcd issue (#22086) documents a concrete ordering failure in the client wrapper: a mutable transaction can successfully execute and return a response whose revision is older than a previously observed revision. The wrapper must not automatically resubmit the mutable transaction merely because the response revision violates the wrapper's expected ordering. The issue includes a deterministic unit-test shape asserting that the mutable transaction is executed only once. citeturn0search9

This separates two facts that are often incorrectly conflated:

response ordering anomaly != proof that mutation did not execute

and:

detecting stale/older evidence != permission to replay a mutation

The reported test specifically guards against duplicate execution after an ordering violation.

### Kubernetes: stale-read and freshness tests are explicit

Current Kubernetes API documentation states that resourceVersion can establish watch/read position, and that weak Any semantics may return a version older than one previously observed. Clients that cannot tolerate rewinding must choose stronger semantics. NotOlderThan and Exact provide explicit version constraints, while unavailable historical versions can produce 410 Gone. citeturn0search0turn0search1

The Kubernetes watch-cache implementation contains an explicit waitUntilFreshLocked path that waits until its cache resourceVersion reaches the requested version before serving a consistency-sensitive read. The source also documents serialized resource-version updates through the cache update path. citeturn0search5

Kubernetes validation tests explicitly reject invalid combinations of watch/resourceVersionMatch/sendInitialEvents parameters, demonstrating that the consistency contract is treated as a protocol property rather than merely caller convention. citeturn0search6

### Important restart/failover limitation

The evidence above protects ordering while the relevant version domain remains valid. It does not automatically guarantee that a version remains meaningful after restart, snapshot restore, compaction, namespace migration, or identity replacement.

Kubernetes explicitly requires clients to handle 410 Gone when the requested historical version is no longer available and to relist/resynchronize. citeturn0search1

Therefore a reconciler must distinguish:

OLD_EVIDENCE_REJECTED

from:

HISTORY_UNAVAILABLE

The second is not evidence that the old operation failed; it is evidence that the system can no longer use that historical observation under the requested consistency contract.

### New race: terminal state versus late evidence

Consider durable state:

O = CONFIRMED@v120

A late worker returns:

FAILED@v119

A simple last-writer-wins database update is unsafe.

The durable state transition therefore needs a guard equivalent to:

UPDATE operation SET state=... WHERE operation_id=O AND accepted_evidence_version < incoming_version

but this is only a skeleton. The system must also define whether two evidence versions are comparable and whether the incoming state is semantically allowed to dominate the current state.

For example, FAILED@v121 cannot automatically overwrite CONFIRMED@v120 if v121 merely represents a newer observation that the operation record was later pruned. The evidence type must prove what happened to the actual effect.

### New race: restart with stale worker response

Before restart:

durable_state = CONFIRMED@v120

After restart, a worker holding an old response:

FAILED@v119

returns.

If recovery reconstructs state only from the worker response and lacks durable monotonic evidence state, the old worker can regress the terminal result.

Therefore the monotonicity guard itself must be durable or reconstructible from authoritative state. A process-local last_seen_version is insufficient.

### Namespace/failover interaction

A version can remain numerically monotonic while its authority meaning changes. A restored/new cluster, new resource identity, or new authority epoch can invalidate prior interpretation even when numbers continue increasing.

Thus recovery needs both:

version continuity

and

identity/namespace continuity

or an explicit new epoch that invalidates old evidence/credentials.

This matches the earlier AB104.779R recovery finding: preserving a number is not equivalent to preserving authority continuity.

### Evidence ledger

ETCD_MUTABLE_TXN_STALE_RESPONSE_DUPLICATE_RETRY REAL REPORTED FAILURE/TEST EVIDENCE
SUCCESSFUL_MUTATION_WITH_ORDERING_ANOMALY != NOT_EXECUTED
STALE_RESPONSE_DETECTION != SAFE_RETRY
K8S_STALE_READ_SEMANTICS SOURCE CONFIRMED
K8S_FRESHNESS_WAIT SOURCE CONFIRMED
K8S_VERSIONED_WATCH/READ_VALIDATION_TESTS SOURCE CONFIRMED
K8S_410_GONE_HISTORY_UNAVAILABLE SOURCE CONFIRMED
HISTORY_UNAVAILABLE != OPERATION_FAILED
TERMINAL_STATE_REQUIRES_DURABLE_MONOTONIC_GUARD SOURCE-SUPPORTED
PROCESS_LOCAL_LAST_SEEN_VERSION INSUFFICIENT_AFTER_RESTART
VERSION_CONTINUITY != AUTHORITY_CONTINUITY
NAMESPACE/IDENTITY CONTINUITY REQUIRED
EXECUTED NEXO STALE-RESPONSE RACE NO
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.795R: investigate durable terminal-state CAS/compare-and-set patterns in real workflow, database, and messaging implementations, including crash recovery and duplicate/out-of-order completion handling; determine whether a terminal state can ever be reopened and under what explicit correction protocol.

## AB104.795R research — durable terminal-state CAS and correction semantics

### Kubernetes: real stale-write race test

Kubernetes has a concrete test, TestPatchResourceWithRacingVersionConflict, where a patch is prepared against resourceVersion 2 but another write advances the persisted object to version 3 before the patch is committed. The expected result is a version conflict rather than silent overwrite. This is direct test evidence for a compare-at-commit boundary. citeturn0search13

The broader API contract likewise states that a stale resourceVersion produces HTTP 409 Conflict. citeturn0search1

This is stronger evidence than merely exposing a version field: the receiver uses the version to reject a stale mutation at the mutation boundary.

### Temporal: terminal execution identity and duplicate handling

Temporal current documentation separates scheduling-layer deduplication from receiver-side idempotency. Activity execution is at-least-once; stable idempotency keys are required for external effects. Activity-ID conflict policy handles duplicates while an execution is in flight, while reuse policy governs later reuse. citeturn0search5turn0search4

Temporal also exposes completed workflow identity/result semantics: a completed workflow with a reused identity can be observed rather than treated as an entirely new logical execution when the relevant reuse policy is configured. The architectural point is that terminal state is tied to durable workflow identity, not to a worker's last local observation. citeturn0search3

### Correction versus reopening

The audit found no basis for treating a terminal state as freely mutable by any later worker response.

A safer model is:

TERMINAL_STATE
  -> remains terminal for the original operation identity
  -> correction requires an explicit correction event/protocol
  -> correction must itself be authorized, versioned, and auditable

For example:

CONFIRMED(O,v120)
late FAILED(O,v119)
=> reject as stale

CONFIRMED(O,v120)
new evidence says external system issued a documented compensating/reversal event
=> this is not late worker changing CONFIRMED to FAILED; it is a new correction operation with its own identity/evidence.

This preserves the distinction between:
- correcting an authoritative record;
- discovering that a previous conclusion was wrong;
- executing a compensating external action.

They must not be collapsed into an ordinary last-writer-wins update.

### Durable guard requirement

A process-local sequence such as last_seen_version is insufficient after restart. The compare condition protecting terminal state must be durable or reconstructible from an authoritative durable source.

The Kubernetes racing-version test demonstrates the desired shape:

read version N
another actor commits N+1
attempted mutation conditioned on N
=> conflict; no stale overwrite. citeturn0search13

For Nexo, the analogous future primitive would be conceptually:

CAS(operation_id, expected_state/evidence_version, new_state)

but this remains a research-derived candidate, not an implemented Nexo primitive.

### Failure matrix

1. CONFIRMED@120 + FAILED@119 -> reject stale evidence.
2. CONFIRMED@120 + FAILED@121 -> do NOT automatically overwrite; determine what version 121 semantically represents.
3. UNKNOWN@120 + CONFIRMED@121 with exact durable receiver evidence -> potentially close UNKNOWN.
4. UNKNOWN@120 + NOT_FOUND@121 from weak/stale cache -> remain UNKNOWN.
5. CONFIRMED@120 + worker crash/restart -> terminal state remains durable.
6. CONFIRMED@120 + legitimate correction -> new correction event/operation, not arbitrary state regression.
7. history compacted -> mark evidence unavailable; do not reinterpret absence as failure.

### Evidence ledger

K8S_RACING_RESOURCE_VERSION_CONFLICT_REAL_TEST SOURCE CONFIRMED
K8S_STALE_VERSION_REJECTED_AT_MUTATION_BOUNDARY SOURCE CONFIRMED
TEMPORAL_ACTIVITY_AT_LEAST_ONCE SOURCE CONFIRMED
TEMPORAL_IDEMPOTENCY_KEY_FOR_EXTERNAL_EFFECT SOURCE CONFIRMED
TEMPORAL_ID_CONFLICT_AND_ID_REUSE_ARE_DISTINCT SOURCE CONFIRMED
TERMINAL_STATE_BOUND_TO_DURABLE_IDENTITY SOURCE-SUPPORTED
PROCESS_LOCAL_TERMINAL_GUARD_INSUFFICIENT_AFTER_RESTART
TERMINAL_LAST_WRITER_WINS UNSAFE SOURCE-SUPPORTED
CORRECTION != ORDINARY_REOPEN
CORRECTION_REQUIRES_EXPLICIT_IDENTITY/AUTHORITY/EVIDENCE CANDIDATE
UNKNOWN != FAILED
COMPACTION/HISTORY_LOSS != FAILURE
EXECUTED NEXO TERMINAL-CAS RACE NO
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.796R: investigate whether durable CAS alone is sufficient for terminal truth, or whether terminal reconciliation additionally requires immutable event history, fencing against obsolete workers, and atomic coupling of state transition with operation identity/evidence. Search real event-sourcing/workflow implementations and failure tests.

## AB104.796R research — durable CAS versus immutable history, fencing, and atomic identity/evidence

### Finding 1 — CAS protects the current state transition, not the complete causal history

Real event stores use expected-version concurrency. Rails Event Store documents that publishing with an expected stream version fails when another process has appended first; concurrent writers using the same expected version cannot both succeed. This is a concrete optimistic-concurrency boundary. citeturn0search7

That mechanism answers:

May this new event be appended after the state I observed?

It does not by itself answer:

What external effect actually happened before this event?

Therefore:

CAS(current_state) != proof_of_external_effect.

### Finding 2 — immutable event history adds recoverable causality

Temporal persists an append-only Event History for a Workflow Execution. Its history is used after worker crashes to replay and reconstruct workflow state, and the service records Activity completion/failure/timeout events durably. Temporal's server architecture also describes transactional persistence of mutable state together with history events and recovery from persistence when a write fails. citeturn0search0turn0search1turn0search3

This provides evidence for a stronger pattern:

durable history
+
derived current state
+
replay/reconstruction

rather than relying solely on the latest mutable status row.

However, Temporal itself still distinguishes durable workflow history from external Activity effects; Activity execution is at-least-once and external side effects need idempotency. citeturn0search9

### Finding 3 — immutable history does not replace fencing

An obsolete worker can still return a result after a newer authority generation exists. Durable history can record that late report, but recording it is not the same as accepting it as authoritative.

Therefore the acceptance boundary still needs identity/version/authority checks.

History answers:

what events were accepted into the authoritative record?

Fencing answers:

may this actor/effect still be accepted now?

These are complementary.

### Finding 4 — operation identity must be bound to accepted history

Temporal's history events identify the Workflow Execution and the event sequence; replay uses durable history to reconstruct which prior Activity result was recorded. citeturn0search1turn0search3

This supports a candidate Nexo rule:

A completion report must be bound to the exact logical operation/attempt it claims to complete. A late report for another attempt must not mutate the current attempt's terminal state merely because the payload says success or failure.

This is stronger than a global sequence number.

### Finding 5 — CAS + identity + fencing still do not make arbitrary external effects atomic

Temporal explicitly teaches that Activity execution is at-least-once and recommends a stable idempotency key at the receiver for external POSTs. If a request reaches the receiver and the worker fails before recording completion, the Activity may retry. citeturn0search9

Thus even if Nexo eventually had:

CAS + immutable history + operation_id + authority_generation

there remains a boundary:

external effect
      ||
durable Nexo history

If those are not one atomic transaction, an ambiguous window remains.

### Combined failure matrix

A. stale completion:
CONFIRMED(O,v120)
late FAILED(O,v119)
-> CAS/history guard rejects stale transition.

B. wrong operation identity:
CONFIRMED(O1)
completion report for O2
-> reject identity mismatch even if report version is newer.

C. stale authority:
O1 carries generation g1; current generation is g2
-> effect receiver must reject g1 if it reaches the protected boundary after g2 acceptance.

D. worker crash after external effect:
effect may exist, durable completion may not.
-> UNKNOWN/reconciliation; CAS cannot infer the external result.

E. durable history lost/compacted:
old evidence unavailable.
-> UNKNOWN or explicit history-unavailable state; not automatic FAILED.

F. legitimate correction:
terminal O remains immutable as historical fact; a separate correction/compensation event references O.
-> correction is auditable and does not rewrite the causal past.

### Important architectural deduction

The audit now has evidence for four distinct layers:

1. Event history — immutable accepted causal record.
2. Current-state CAS — prevents stale concurrent transitions.
3. Authority fencing — prevents obsolete actors/effects.
4. Reconciliation — resolves ambiguous external outcomes.

Removing any one can leave a different failure class uncovered.

This is still a research-derived model, not a finalized Nexo architecture.

### Evidence ledger

EXPECTED_VERSION_EVENT_APPEND SOURCE CONFIRMED
CONCURRENT_EXPECTED_VERSION_CONFLICT SOURCE CONFIRMED
TEMPORAL_DURABLE_APPEND_ONLY_HISTORY SOURCE CONFIRMED
TEMPORAL_REPLAY_AFTER_WORKER_CRASH SOURCE CONFIRMED
TEMPORAL_HISTORY/MUTABLE_STATE CONSISTENCY SOURCE CONFIRMED
IMMUTABLE_HISTORY != EXTERNAL_EFFECT_PROOF
IMMUTABLE_HISTORY != FENCING
CAS_CURRENT_STATE != EXTERNAL_EFFECT_ATOMICITY
OPERATION_IDENTITY MUST BIND COMPLETION TO LOGICAL OPERATION CANDIDATE
AUTHORITY_GENERATION MUST REMAIN DISTINCT FROM OPERATION_ID
UNKNOWN REMAINS VALID AFTER AMBIGUOUS EXTERNAL EFFECT
CORRECTION SHOULD BE EXPLICIT EVENT/OPERATION CANDIDATE
EXECUTED NEXO COMBINED RACE NO
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.797R: investigate atomic coupling boundaries in real event-sourced/workflow systems: history append + current-state update + outbox/task creation, and identify exactly where external effects remain outside the atomic boundary. Include crash/failure tests and determine whether any system actually closes all four layers without relying on an external idempotent/fenced receiver.

## AB104.797R research — atomic boundaries: history + state + outbox + external effect

### Finding 1 — transactional outbox closes the local intent boundary, not the arbitrary external-effect boundary

The transactional outbox pattern commits business state and an outbox record in one local transaction. A relay later reads the durable outbox and delivers the message. AWS explicitly describes duplicate delivery as possible and requires downstream consumers to be idempotent. Debezium's Outbox Event Router similarly captures committed outbox records and publishes them asynchronously; it does not make the downstream side effect part of the original database transaction. citeturn0search0turn0search2

Therefore the atomic boundary is:

local state + durable intent

not:

local state + arbitrary external effect.

### Finding 2 — CDC/relay introduces a durable handoff, not exactly-once external execution

Debezium documents at-least-once delivery behavior and replay after failures/restarts. A sink can therefore receive the same logical event more than once. Idempotent sink writes can make the resulting state converge, but that is a receiver property, not proof that the physical external action happened exactly once. citeturn0search3turn0search4

The distinction is:

delivery-once
!=
effect-once

and:

duplicate message suppression
!=
external-effect atomicity.

### Finding 3 — the four-boundary model

The audit can now represent a typical durable external operation as:

T0 = local transaction commits state + operation intent
T1 = relay/worker obtains intent
T2 = receiver validates identity + authority generation
T3 = receiver accepts operation identity
T4 = external effect becomes durable
T5 = durable outcome becomes queryable
T6 = coordinator records/reconciles outcome

Outbox closes T0.

Idempotency closes repeated logical submission at T3.

Fencing closes stale-authority submission at T2.

Reconciliation closes uncertainty between T4 and T5/T6.

If T3 and T4 are not one atomic receiver boundary, an additional dual-write window remains.

### Finding 4 — concrete database receiver can close more than a generic API

When the protected effect is itself a database mutation, a receiver can combine identity/authority checks with the mutation in one database transaction. The same atomic commit can update the business row and a deduplication/operation record.

That can eliminate a check-then-write race inside that database.

It still does not automatically cover an external action performed after the database commit, such as sending a physical command to another system.

### Finding 5 — Kafka's exactly-once boundary is explicitly scoped

Kafka documents exactly-once semantics for Kafka-to-Kafka processing and states that external systems require cooperation to obtain equivalent guarantees. Kafka Connect's exactly-once support likewise depends on the source/sink connector and destination semantics rather than making arbitrary external systems transactional. citeturn0search5turn0search6

This independently reinforces the boundary discovered with Temporal and outbox systems.

### Finding 6 — a stronger receiver contract

For a receiver capable of participating atomically in the protected effect:

ACCEPT(operation) iff:
1. namespace/resource identity matches;
2. operation identity is valid and not conflicting;
3. request/payload binding matches;
4. authority generation is current enough;
5. acceptance record and protected mutation commit atomically.

Then:

DUPLICATE(operation_id, same binding) -> return prior durable result.

CONFLICT(operation_id, different binding) -> reject.

STALE_AUTHORITY -> reject.

UNKNOWN -> query/reconcile; do not silently create a new logical operation.

This is stronger than an outbox-only design.

### Finding 7 — arbitrary external side effects remain outside the local atomic boundary

For a third-party API, physical actuator, email/SMS provider, device, or other system that cannot join the same transaction, the coordinator cannot atomically commit both its own history and that external effect.

The safe contract therefore becomes:

durable intent + fenced/idempotent submission + queryable outcome + reconciliation

rather than an unsupported universal exactly-once claim.

### Evidence ledger

TRANSACTIONAL_OUTBOX_LOCAL_STATE_PLUS_INTENT_ATOMIC SOURCE CONFIRMED
OUTBOX_RELAY_ASYNC SOURCE CONFIRMED
OUTBOX_DUPLICATE_DELIVERY_POSSIBLE SOURCE CONFIRMED
DEBEZIUM_OUTBOX_CDC SOURCE CONFIRMED
DEBEZIUM_AT_LEAST_ONCE_REPLAY SOURCE CONFIRMED
DELIVERY_ONCE != EFFECT_ONCE
DEDUPLICATION != EXTERNAL_EFFECT_ATOMICITY
RECEIVER_DB_ATOMIC_MUTATION_CAN_CLOSE_LOCAL_DUAL_WRITE SOURCE-SUPPORTED
KAFKA_EOS_EXTERNAL_SYSTEM_REQUIRES_COOPERATION SOURCE CONFIRMED
FENCING_AT_RECEIVER_REQUIRED FOR STALE-AUTHORITY SAFETY
RECONCILIATION_REQUIRED AFTER AMBIGUOUS EXTERNAL EFFECT
UNIVERSAL_EXTERNAL_EXACTLY_ONCE NOT ESTABLISHED
EXECUTED NEXO EXTERNAL EFFECT RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.798R: investigate concrete receiver-side atomic/idempotent APIs and failure tests: Stripe-style idempotency, database unique/CAS constraints, Kafka transactional sinks, and cloud APIs with client-token semantics. Determine exactly what their guarantees cover, retention limits, stale-authority behavior, and ambiguous-response recovery.

## AB104.798R — receiver-side idempotency, atomic conflict handling, and guarantee scope

### Stripe: strong retry identity, but bounded retention and no authority fencing

Stripe's current idempotency contract stores the first result associated with an idempotency key and returns that result on later retries. It also compares later parameters with the original request and rejects mismatches. However, keys may be automatically removed after at least 24 hours; after pruning, reuse of the same key creates a new request. Stripe's mechanism therefore protects retry duplication only within its documented retention/identity scope. It is not an authority-generation fence. citeturn1search0

Evidence:
STRIPE_IDEMPOTENCY_RETURNS_PRIOR_RESULT SOURCE CONFIRMED
STRIPE_PARAMETER_BINDING SOURCE CONFIRMED
STRIPE_IDEMPOTENCY_RETENTION_FINITE SOURCE CONFIRMED
STRIPE_REUSE_AFTER_PRUNING_CAN_CREATE_NEW_REQUEST SOURCE CONFIRMED
STRIPE_IDEMPOTENCY != AUTHORITY_FENCE

### AWS EC2: client-token idempotency is explicitly scoped

EC2 documents client-token idempotency with regional or zonal scope. A retry with the same token and same parameters does not perform the action again; parameter mismatch can produce IdempotentParameterMismatch. The same token can represent an independent request in another Region, demonstrating that operation identity is namespace-scoped rather than globally meaningful. citeturn0search1turn1search13

Evidence:
AWS_CLIENT_TOKEN_IDEMPOTENCY SOURCE CONFIRMED
AWS_PARAMETER_BINDING SOURCE CONFIRMED
AWS_IDEMPOTENCY_SCOPE_REGIONAL_OR_ZONAL SOURCE CONFIRMED
AWS_SAME_TOKEN_DIFFERENT_NAMESPACE_CAN_BE_DISTINCT_OPERATION SOURCE CONFIRMED
CLIENT_TOKEN != UNIVERSAL_OPERATION_ID

### PostgreSQL: atomic conflict arbitration inside one database

Current PostgreSQL documents ON CONFLICT DO UPDATE as an atomic INSERT-or-UPDATE outcome under concurrency. A unique index/constraint acts as the conflict arbiter. This can provide a concrete receiver-side atomic boundary for a local database effect: identity reservation/deduplication and the protected row mutation can participate in one transaction. citeturn0search2

But this boundary ends at the PostgreSQL transaction. A subsequent network call, device command, payment request, or other external side effect is not automatically included.

Evidence:
POSTGRES_ON_CONFLICT_ATOMIC_CONFLICT_ARBITRATION SOURCE CONFIRMED
UNIQUE_CONSTRAINT_AS_CONCURRENCY_ARBITER SOURCE CONFIRMED
LOCAL_DB_DEDUP_PLUS_MUTATION_CAN_SHARE_TRANSACTION SOURCE-SUPPORTED
POSTGRES_TRANSACTION != ARBITRARY_EXTERNAL_EFFECT_ATOMICITY

### Kafka: exactly-once is strongest when the destination participates in Kafka's transaction boundary

Kafka's current design explicitly states that exactly-once processing is achieved for Kafka-managed input/output/state, while external destination systems generally require cooperation. Kafka describes the core limitation as coordinating the consumer position with the actual stored output; where the destination can participate in the necessary coordination, stronger semantics are possible. citeturn1search3turn1search5

This is a useful architectural boundary: exactly-once is not a property of the worker alone. It is a property of the complete commit/effect protocol.

Evidence:
KAFKA_EOS_KAFKA_MANAGED_STATE_AND_OUTPUT SOURCE CONFIRMED
KAFKA_EXTERNAL_DESTINATION_REQUIRES_DESTINATION_COOPERATION SOURCE CONFIRMED
KAFKA_EOS_IS_PROTOCOL_BOUNDARY_PROPERTY NOT WORKER_ONLY

### Cross-system comparison

| System | Duplicate protection | Request binding | Scope/retention | Authority fencing | Arbitrary external effect atomicity |
|---|---|---|---|---|---|
| Stripe | idempotency key | yes | finite/keys pruned | not established | no |
| AWS EC2 | client token | yes | regional/zonal | not established | no |
| PostgreSQL | unique/CAS/transaction | schema-defined | DB transaction/state | can be encoded as condition, not automatic | no |
| Kafka Streams | transactional IDs/offsets/state | protocol-defined | Kafka transaction/state | producer epochs/fencing in Kafka paths | external destination requires cooperation |

### Important refinement

A receiver can satisfy all of the following for a local protected resource:

identity + payload binding + authority condition + mutation

inside one atomic transaction.

That is stronger than a coordinator doing:

check -> send -> record.

However, the receiver must actually own the protected effect. If the final effect occurs outside that atomic resource, the dual-write/ambiguous-outcome boundary returns.

### Evidence ledger

RECEIVER_SIDE_IDEMPOTENCY_IS_STRONGER_THAN_COORDINATOR_RETRY_LOGIC
OPERATION_IDENTITY_IS_NAMESPACE_SCOPED
PAYLOAD_BINDING_PREVENTS_SILENT_IDENTITY_REUSE
FINITE_RETENTION_IS_PART_OF_IDEMPOTENCY_CONTRACT
LOCAL_DB_ATOMIC_DEDUP_PLUS_MUTATION SOURCE-SUPPORTED
KAFKA_EOS_REQUIRES DESTINATION COOPERATION FOR EXTERNAL SYSTEMS
IDEMPOTENCY != AUTHORITY_FENCING
AUTHORITY_FENCING != RECONCILIATION
LOCAL_ATOMICITY != ARBITRARY_EXTERNAL_EFFECT_ATOMICITY
UNIVERSAL_EXTERNAL_EXACTLY_ONCE NOT ESTABLISHED
EXECUTED NEXO EXTERNAL-EFFECT RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.799R: research concrete failure tests and bug reports for idempotency receivers and transactional sinks: lost-response-after-commit, stale retry after retention, concurrent same-key submissions, sink offset/effect divergence, and whether receiver-side authority fencing is independently tested under crash/restart.

## AB104.799R — failure evidence for idempotency, retries, and sink/effect divergence

### EC2 documents the ambiguous-response problem directly

AWS EC2 states that a mutating request can return before asynchronous work completes, and that a timeout or server issue can occur even though the request has already been accepted. Retrying without idempotency can therefore create multiple resources. With a client token, a successful retry with identical parameters performs no further action; parameter changes produce an idempotency mismatch. This is concrete protocol evidence that the receiver, not the client retry loop, owns duplicate suppression. citeturn0search0

Important boundary:
\`same token + same parameters\` is safe only inside the documented idempotency namespace and lifecycle. It does not prove that an old authority generation is rejected.

### etcd provides concrete negative failure evidence

Current etcd issue #22086 reports a mutable transaction whose successful response can have an older observed revision. The wrapper may reissue the transaction even though the first transaction may already have mutated state; the issue explicitly warns that this can duplicate effects or execute a different branch after intervening state changes. citeturn0search6

This is direct evidence for:

\`ordering anomaly != execution failure\`

and:

\`stale response != safe retry\`.

A separate current etcd issue #22082 reports a stale \`Mutex.Unlock\` retry deleting a newer same-session lock because the unlock deletion is keyed by the mutex key rather than the old ownership incarnation. citeturn0search11

Together these are stronger than a purely hypothetical race: real distributed clients can have a durable operation occur, lose or misinterpret the response, retry, and mutate newer state unless the receiver binds the mutation to the correct identity/incarnation.

### Kafka sink boundary: offset commit is not automatically the external effect

Kafka's sink API documentation explicitly notes that a sink can request offset commits after flushing data to the destination, but the commit request is only a hint and no timing guarantee should be assumed. It also describes connectors that manage offsets in the external system when stronger delivery semantics are required. citeturn0search7turn0search9

Kafka's design documentation states that exactly-once requires cooperation with the destination storage system. Kafka Streams achieves a stronger guarantee specifically because input offsets, state-store updates, and Kafka output writes are completed atomically inside Kafka's integrated storage boundary. citeturn0search3turn0search14

Therefore:

\`Kafka transaction != arbitrary sink effect\`

but:

\`Kafka-integrated state/output transaction = a real atomic boundary\`.

This is important for Nexo: the architecture must identify the actual effect owner and cannot infer effect atomicity from the coordinator alone.

### Concurrent same-key submissions

AWS's idempotency contract defines the receiver behavior for repeated identical requests and rejects parameter mismatches. The important architectural property is that the receiver arbitrates the identity conflict; two clients do not safely implement this by independently reading "key absent" and then both writing. citeturn0search0

The audit therefore retains the stronger receiver rule:

\`identity reservation + payload binding + protected mutation\`
must share an atomic conflict boundary when duplicate suppression is part of the safety claim.

### Receiver-side authority fencing under restart

The researched systems provide concrete fencing for their own protocol domains (Kafka producer/leader epochs, etcd conditional transactions, Kubernetes resource-version conflicts, EtcFS generations), but the audit has not found a generic external receiver that simultaneously proves:

1. durable authority-generation continuity across receiver restart;
2. stale-generation rejection at the same linearization point as the protected external effect;
3. operation identity deduplication at that same point;
4. durable/queryable outcome after ambiguous response;
5. universal applicability to arbitrary external effects.

This remains **NOT ESTABLISHED**, not "impossible".

### Refined failure model

\`O1(g1)\` accepted/submitted
→ receiver commits effect
→ response lost
→ authority changes to \`g2\`
→ worker retries \`O1(g1)\`

Safe receiver:
\`reject duplicate OR return prior result\`
and/or
\`reject stale g1\`.

Unsafe receiver:
\`treat retry as a new mutation\`.

A system can solve the first problem with idempotency and the second with fencing. Solving only one does not imply the other.

### Evidence ledger

EC2_AMBIGUOUS_ASYNC_RESPONSE_SOURCE_CONFIRMED
EC2_CLIENT_TOKEN_DUPLICATE_SUPPRESSION_SOURCE_CONFIRMED
EC2_PARAMETER_BINDING_SOURCE_CONFIRMED
ETCD_MUTABLE_TXN_STALE_RESPONSE_DUPLICATION_REAL_REPORTED_SOURCE_CONFIRMED
ETCD_STALE_MUTEX_UNLOCK_NEWER_INCARNATION_REAL_REPORTED_SOURCE_CONFIRMED
KAFKA_SINK_OFFSET_COMMIT_IS_NOT_TIMING_GUARANTEE_SOURCE_CONFIRMED
KAFKA_EXTERNAL_EXACTLY_ONCE_REQUIRES_DESTINATION_COOPERATION_SOURCE_CONFIRMED
KAFKA_INTEGRATED_STATE_OFFSETS_OUTPUT_ATOMIC_BOUNDARY_SOURCE_CONFIRMED
CONCURRENT_SAME_KEY_ARBITRATION_MUST_BE_RECEIVER_SIDE
RECEIVER_IDEMPOTENCY != AUTHORITY_FENCING
RECEIVER_FENCING != RECONCILIATION
UNIVERSAL_RECEIVER CLOSURE OF ALL FOUR LAYERS NOT ESTABLISHED
EXECUTED NEXO RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.800R: investigate whether any production system provides a single durable receiver-side record that combines operation identity, authority generation/incarnation, payload binding, terminal effect state, and recovery/reconciliation evidence; compare this against Kafka transactional state, Kubernetes resourceVersion, EtcFS generation, and payment/API idempotency records.

## AB104.800R — can one production receiver combine identity, authority, payload binding, terminal outcome, and recovery?

### Result: no universal closure found; several systems close subsets inside their own atomic domain

The research was expanded specifically to find a production protocol whose single durable receiver record simultaneously binds:

1. operation identity;
2. authority generation/incarnation;
3. immutable request/payload binding;
4. terminal effect state;
5. recovery/reconciliation evidence;

at the same linearization point as the protected effect.

No such generic, arbitrary-external-effect system was established.

This is a research result, not a proof of impossibility.

### Kafka: complete closure inside Kafka's own domain

Kafka Streams can atomically couple consumed offsets, state-store updates, and produced Kafka records. Kafka explicitly attributes this to integrating all of those operations with Kafka storage rather than treating Kafka as an external system. Exactly-once for another destination requires cooperation from that destination. citeturn0search1turn0search3

Therefore Kafka supplies a strong example of a closed effect domain, but not a universal external-effect receiver.

Its producer/transactional epochs also provide fencing within Kafka's protocol domain, but that does not automatically become a fencing token accepted by a third-party resource.

### etcd: atomic identity/state predicates, but no arbitrary external effect

etcd transactions atomically evaluate comparisons and apply the success branch. Comparisons can use value, key presence, revision, and version. This is enough to construct a durable operation record whose acceptance is conditional on the currently stored state. citeturn0search6turn0search13

However, the atomic transaction ends at etcd's KV state. It cannot atomically include a physical actuator, remote HTTP server, payment network, or other independently committed system.

Thus etcd can be the authoritative receiver for an etcd-owned effect, but it is not automatically the owner of a subsequent external effect.

### Kubernetes: strong state-version conflict control, not a universal effect record

Kubernetes resource-version mechanisms provide optimistic concurrency/freshness semantics for API objects. This is useful for rejecting stale mutations to Kubernetes-owned state, but resourceVersion is not itself a universal authority epoch for arbitrary external resources.

Therefore Kubernetes demonstrates durable stale-state rejection, not universal external-effect closure.

### Temporal: durable execution and Activity lifecycle, but external effects remain Activity responsibility

Temporal explicitly defines Activities as work that touches the outside world, including API calls, databases, email, and payments. Activities can execute more than once, including after a Worker succeeds externally but crashes before reporting completion. Temporal therefore recommends idempotency and identifies receiver-side idempotency keys as the mechanism that prevents duplicate external effects. citeturn0search2turn0search5turn0search16

This is particularly strong negative evidence for the desired universal closure: a mature durable-execution platform still treats external-effect idempotency as a responsibility of the external service, rather than claiming that the workflow engine itself atomically fences arbitrary outside effects.

### AWS Durable Execution: same boundary appears independently

AWS's current Durable Execution guidance states that at-least-once retry can execute a step more than once, and recommends idempotency keys for external services. It explicitly distinguishes retry semantics from exactly-once execution across the entire workflow. citeturn0search0

Again, durable orchestration does not remove the external receiver's responsibility.

### Composite conclusion

The strongest currently evidenced composition is:

durable intent/history
+
receiver-side atomic identity + payload binding
+
receiver-side authority/incarnation check
+
receiver-side durable outcome
+
reconciliation

But these pieces must be owned by the same effect domain to become one atomic guarantee.

For an arbitrary external effect, the architecture remains distributed:

Coordinator -> external receiver -> physical/system effect

and therefore retains a boundary requiring receiver cooperation.

### New architectural distinction

There are now two classes of protected effects:

**Class A — owned atomic domain**

The effect owner can atomically validate identity/authority and commit the effect.

Potentially closed by one transactional protocol.

**Class B — independent external effect**

The coordinator and effect owner commit separately.

Requires:
- durable intent;
- operation identity;
- authority/incarnation fencing;
- receiver idempotency or conditional acceptance;
- queryable outcome;
- reconciliation;
- explicit UNKNOWN state.

Nexo must not silently treat Class B as Class A.

### Evidence ledger

KAFKA_STREAMS_INTERNAL_STATE_OFFSETS_OUTPUT_ATOMIC SOURCE CONFIRMED
KAFKA_EXTERNAL_DESTINATION_REQUIRES_COOPERATION SOURCE CONFIRMED
ETCD_ATOMIC_COMPARE_AND_MUTATE SOURCE CONFIRMED
ETCD_EXTERNAL_EFFECT_ATOMICITY NOT PROVIDED
KUBERNETES_STALE_STATE_REJECTION SOURCE CONFIRMED
KUBERNETES_RESOURCE_VERSION != UNIVERSAL_AUTHORITY_EPOCH
TEMPORAL_EXTERNAL_EFFECTS_REQUIRE_ACTIVITY_IDEMPOTENCY SOURCE CONFIRMED
AWS_DURABLE_EXECUTION_EXTERNAL_IDEMPOTENCY_REQUIRED SOURCE CONFIRMED
SINGLE_GENERIC_RECEIVER_RECORD_CLOSING_ALL_LAYERS NOT ESTABLISHED
NOT_ESTABLISHED != IMPOSSIBLE
EXECUTED NEXO CROSS-SYSTEM EFFECT RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.801R: investigate whether a single effect-owner database transaction can formally/empirically close identity + payload binding + authority generation + terminal state, and what remains when the physical effect is emitted after that commit. Search concrete payment, inventory, and job-execution implementations and their failure tests; do not infer closure from documentation alone.

## AB104.801R — effect-owner transaction: how far can one atomic database boundary close the protocol?

### PostgreSQL/local database effect: strong closure inside the database

A database transaction can atomically reserve an operation identity and mutate the protected database state. PostgreSQL's conflict-handling semantics provide a concrete commit-time concurrency arbiter, so a receiver can encode a uniqueness/identity condition together with the business mutation.

This creates a substantially stronger boundary than:

check identity -> perform mutation -> record result.

The mutation and its identity decision can share one commit.

However, the physical effect must actually be the database state being protected. A later email, HTTP call, device command, payment-provider call, or other external effect is outside that transaction.

### Transactional outbox: concrete failure test confirms the remaining seam

A current PostgreSQL outbox implementation publishes an especially useful executable demonstration. Its demo_atomicity verifies that business state and the outbox event either both roll back or both commit. Its demo_relay then deliberately models the failure where the sink accepts an event, the relay process dies before marking it published, and recovery delivers the same event again. The demonstrated result is explicitly at-least-once delivery and requires the downstream consumer to deduplicate. citeturn0search7

This is exactly the failure window predicted by the earlier model:

DB commit
-> relay
-> sink accepts
-> worker crash before acknowledgement
-> redelivery

The outbox closes the local intent boundary but intentionally leaves the sink boundary to the receiver.

### Stripe: response-loss recovery is receiver-side, not coordinator-side

Stripe documents that its idempotency layer stores the first result and returns the same result for subsequent requests with the same key. Its engineering explanation explicitly describes the response-failure case: the operation may have executed successfully while the client cannot obtain the result; the retry is answered from the cached result. citeturn0search0turn0search6

This is a concrete example of a receiver making an ambiguous response recoverable.

But Stripe's documented idempotency mechanism is still not an authority-generation fence. Its retention is finite, and it is designed around retry identity rather than stale-authority rejection.

### Temporal: production failure guidance independently confirms the external boundary

Temporal's current tutorial states that Activities are at-least-once: if the POST reaches the receiver and the worker then fails, Temporal retries the Activity and the receiver sees the delivery twice. The documented fix is a stable receiver-side idempotency key. Temporal also explicitly separates scheduling-layer Activity-ID deduplication from receiver-side effect idempotency. citeturn0search12turn0search8

This is direct evidence from a durable-execution system that its own retry/history machinery does not atomically encompass arbitrary external effects.

### A stronger single-receiver transaction

For a database-owned effect, the strongest currently evidenced receiver operation is conceptually:

BEGIN
  validate namespace
  validate operation_id
  validate payload_hash
  validate authority_generation/incarnation
  atomically reserve/recognize operation
  mutate protected state
  write terminal outcome
COMMIT

If all of these predicates and mutations are within the same serializable/appropriate transactional boundary, the receiver can close identity + payload binding + authority condition + local effect + terminal state together.

But this does not prove universal closure. The moment the physical effect is:

COMMIT -> send command externally

the ambiguity window returns.

### Failure matrix

| Failure point | Local DB-owned effect | External effect |
|---|---|---|
| before commit | no durable mutation | no external effect |
| commit succeeds, response lost | effect durable; query/retry can recover | receiver may need idempotency/reconciliation |
| after commit, process crashes | durable state survives | external effect may be unknown |
| stale authority reaches receiver before commit | conditional mutation can reject | receiver must enforce fence |
| effect occurs after DB commit | not applicable | dual-write ambiguity |
| operation record expires | identity reuse hazard | receiver contract must define retention |
| restart | durable transaction state survives | receiver must preserve its own identity/fence state |

### Important conclusion

The strongest evidence now supports:

single effect-owner transaction can close the protocol for effects that are themselves represented by that transaction.

It cannot transform a subsequent arbitrary external effect into an atomic part of the same transaction.

Therefore Nexo should reason from the effect owner outward, rather than from the coordinator inward.

### Evidence ledger

DB_TRANSACTION_CAN_ATOMICALLY_BIND_IDENTITY_AND_LOCAL_MUTATION SOURCE-SUPPORTED
POSTGRES_CONFLICT_ARBITRATION SOURCE CONFIRMED
OUTBOX_ATOMICITY_DEMO SOURCE CONFIRMED
OUTBOX_SINK_CRASH_REDELIVERY_REAL_EXECUTABLE_DEMO SOURCE CONFIRMED
STRIPE_RESPONSE_LOSS_RECOVERABLE_BY_RECEIVER_IDEMPOTENCY SOURCE CONFIRMED
TEMPORAL_EXTERNAL_POST_CRASH_DUPLICATION SOURCE CONFIRMED
TEMPORAL_SCHEDULER_DEDUP != RECEIVER_IDEMPOTENCY SOURCE CONFIRMED
SINGLE_EFFECT_OWNER_TRANSACTION_CAN_CLOSE_LOCAL_LAYERS SOURCE-SUPPORTED
EXTERNAL_EFFECT_AFTER_COMMIT_REMAINS_DUAL_WRITE
AUTHORITY_FENCE_MUST_BE_EFFECT_OWNER_ENFORCED
RETENTION_IS_PART_OF_IDENTITY_SAFETY
UNIVERSAL_ARBITRARY_EXTERNAL_EFFECT_ATOMICITY NOT ESTABLISHED
EXECUTED NEXO EFFECT RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.802R: investigate payment/inventory/job systems where the effect owner is a database: inspect concrete schemas, unique constraints, transaction boundaries, crash tests, and recovery logic. Determine whether authority generation can be safely included in the same commit without confusing it with operation identity or observation version.
