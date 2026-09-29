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

## AB104.802R — database-owned payment/inventory/job effects and authority-generation binding

### Job execution: durable claim is not durable effect completion

A current PostgreSQL-backed job-queue implementation demonstrates the exact worker-crash ambiguity. A worker claims a job transactionally, commits the claim before calling a remote dependency, and a crash can occur after the dependency has executed but before the job is marked successful. The replacement worker then cannot distinguish "remote effect happened" from "remote effect did not happen" without receiver-side idempotency/reconciliation. citeturn0search0

A separate current PostgreSQL workflow implementation reproduces a worker that completes the work and then loses its completion update: the job is reclaimed, runs twice, but a unique effect key leaves one durable result row. It explicitly distinguishes at-least-once execution from effectively-once effect recording. citeturn0search12

Evidence:
JOB_CLAIM_TRANSACTIONAL SOURCE CONFIRMED
WORKER_CRASH_AFTER_EXTERNAL_EFFECT_AMBIGUITY SOURCE CONFIRMED
UNIQUE_EFFECT_KEY_SUPPRESSES_DUPLICATE_LOCAL_RESULT SOURCE CONFIRMED
AT_LEAST_ONCE_EXECUTION != EXACTLY_ONCE_EXECUTION
EFFECTIVELY_ONCE_LOCAL_RESULT != ARBITRARY_EXTERNAL_EFFECT

### Atomic inbox/effect transaction: the database can close the local race

A concrete PostgreSQL pattern inserts a message receipt with a unique key and performs the business effect in the same database transaction. The unique index is the concurrency arbiter; a preliminary SELECT is explicitly not sufficient because two concurrent consumers can both observe absence. The source also warns not to commit the receipt in one transaction and the business effect in another. citeturn0search15

This gives a precise local receiver boundary:

unique operation identity + payload fingerprint + domain mutation + terminal outcome

all committed together.

This is stronger than a coordinator-level dedup cache because the database constraint remains the final authority under concurrent writers.

### Inventory/order systems: multiple effect owners expose the distributed boundary

A current failure-injection study of an order system reproduces inconsistencies when order creation, inventory reservation, payment authorization, and fulfillment are owned by different databases/services. It then adds outbox, inbox deduplication, optimistic versions, bounded retries, compensation, replay controls, and failure injection. citeturn0search11

The significance is not that this implementation is a universal proof. It is experimental evidence that once a business operation crosses effect-owner boundaries, each boundary needs its own correctness mechanism.

### Can authority_generation be included in the same local transaction?

Yes, conditionally, when the effect owner stores the authoritative generation/incarnation.

Conceptually:

UPDATE protected_state
 SET ..., accepted_generation = :g
 WHERE resource_id = :r
   AND accepted_generation <= :g
   AND incarnation = :i

and the operation record is uniquely bound to:

(namespace, operation_id, incarnation, payload_hash)

within the same transaction.

But the exact predicate depends on semantics:

- If g is a monotonic authority generation, stale lower generations must be rejected.
- If i is an object incarnation, equality to the current incarnation is usually required.
- Neither should be replaced by operation_id.
- An observation/version number from another subsystem must not be treated as an authority generation merely because it is numerically increasing.

This is a protocol design inference supported by the observed CAS/fencing systems, not a claim that the cited job systems already implement this complete contract.

### Critical retention finding

Current PostgreSQL queue examples use partial unique indexes that release a dedupe key after a job reaches terminal state. That is valid for a bounded queue lifecycle, but it proves that idempotency identity is a policy with explicit retention semantics. Reusing the same business key later is only safe if the protocol defines a new operation/incarnation or otherwise guarantees that the old operation can no longer be confused with the new one. citeturn0search1turn0search18

Therefore:

unique forever is not required,

but:

identity lifecycle must be explicit is required.

### Failure matrix

| Boundary | Local DB effect | External effect |
|---|---|---|
| claim transaction aborts | no claim | no effect implied |
| claim commits, worker dies before effect | recoverable intent | no effect implied |
| effect commits, worker dies before completion | terminal local result can be recovered if same transaction owns effect | external outcome UNKNOWN unless receiver supports identity/query |
| stale generation reaches DB before mutation | conditional update can reject | receiver must enforce equivalent fence |
| same operation retried | unique identity returns existing result | downstream must recognize same identity |
| old identity reused after retention | safe only under explicit new incarnation/namespace semantics | otherwise possible identity collision |
| authority changes after submission | local receiver can reject stale generation if encoded in commit predicate | external receiver must independently reject/fence |

### Evidence ledger

JOB_WORKER_CRASH_AMBIGUITY SOURCE CONFIRMED
LOCAL_UNIQUE_EFFECT_RECORDING SOURCE CONFIRMED
ATOMIC_RECEIPT_PLUS_DOMAIN_MUTATION SOURCE CONFIRMED
SELECT_THEN_INSERT_RACE SOURCE CONFIRMED
MULTI_EFFECT_OWNER_FAILURE_INJECTION SOURCE CONFIRMED
AUTHORITY_GENERATION_CAN_BE_ENCODED_AS_COMMIT_PREDICATE SOURCE-SUPPORTED
OBJECT_INCARNATION SHOULD REMAIN DISTINCT FROM OPERATION_ID
OBSERVATION_VERSION SHOULD REMAIN DISTINCT FROM AUTHORITY_GENERATION
DEDUPE_RETENTION_IS_EXPLICIT_PROTOCOL SEMANTICS SOURCE CONFIRMED
LOCAL_ATOMIC_EFFECT_OWNER != ARBITRARY_EXTERNAL_EFFECT_OWNER
UNIVERSAL EXACTLY-ONCE EXTERNAL EFFECT NOT ESTABLISHED
EXECUTED NEXO AUTHORITY-GENERATION RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.803R: investigate payment-specific state machines and database ledger invariants, including double-entry/ledger idempotency, concurrent authorization/capture/refund races, and crash recovery. Determine whether monetary state can be made atomic with operation identity and authority generation while external card-network settlement remains outside the transaction.

## AB104.803R — payment ledger invariants, authorization/capture races, and settlement boundary

### Payment API idempotency: receiver-side identity is concrete and bounded

Adyen documents a production payment API idempotency contract: the same idempotency key can be retried after a timeout and the first processed response is returned without charging twice. The key is scoped to the company account and valid for 7–14 days. Concurrent submissions with the same key can produce an explicit in-progress/conflict response rather than two successful operations. Adyen also documents accounting rules preventing captures from exceeding authorization and refunds from exceeding captured value. citeturn0search0

This is strong evidence for three distinct protections:

1. request identity / duplicate suppression;
2. monetary state invariants;
3. explicit lifecycle conflicts.

It is not evidence that an old authority generation can continue making payment mutations after revocation.

### Double-entry ledger: database can close monetary state atomically

A current PostgreSQL ledger implementation uses append-only entries, database-enforced balance invariants, an idempotency-key table, and row-level locking. Its test suite runs against real PostgreSQL and includes concurrent transfers and idempotent replay. citeturn0search1

Another current ledger implementation reports real PostgreSQL integration tests for idempotent replay, conflicting-key reuse, reversals, and a concurrent withdrawal race in which exactly one request succeeds. citeturn0search8

A separate implementation provides a larger executable suite: concurrent same-key retries, balance conservation, property-based fuzzing, multi-leg atomic postings, and transactional outbox integration. It explicitly keeps idempotency keys for a retention period while preserving ledger history indefinitely; active holds are not pruned. citeturn0search4

These examples are useful because they demonstrate that the money state itself can have a much stronger correctness boundary than a generic distributed workflow.

### Authorization/capture/refund lifecycle

The payment ledger examples model authorization holds and later capture/void/expire as distinct state transitions rather than treating the entire payment as one instantaneous operation. Concurrent attempts to consume the same funds are serialized/guarded by database constraints or row locks.

This reinforces an important Nexo distinction:

authority_generation answers "is this actor/version still authorized?"

while:

payment_state answers "what monetary lifecycle transition is currently valid?"

A payment state such as AUTHORIZED, CAPTURED, VOIDED, or REFUNDED must not be overloaded to represent authority freshness.

### Payment ledger vs external settlement

A local ledger can atomically record:

operation identity
+
authorized amount
+
debit/credit entries
+
current lifecycle state
+
idempotency result

inside one database transaction.

But card-network settlement, bank transfer settlement, or another PSP remains an external effect unless that network participates in the same atomic protocol.

Adyen's own idempotency documentation is instructive here: it recommends asynchronous server-to-server webhooks to track missing responses, while retaining idempotency for safe retries. citeturn0search0

Therefore the local ledger's CAPTURED state cannot, by itself, be interpreted as universal proof that an external settlement rail has durably completed.

### Failure matrix

| Event | Local ledger interpretation | External settlement interpretation |
|---|---|---|
| idempotent request accepted | operation identity reserved/processed | external effect may still be pending |
| duplicate same key | return prior result/conflict | do not create new logical payment |
| concurrent capture | one valid transition according to lifecycle/amount invariants | receiver must independently enforce equivalent semantics |
| local DB commit succeeds | monetary state durable | settlement may still be UNKNOWN |
| webhook missing | reconciliation required | not proof settlement failed |
| timeout after submission | UNKNOWN until receiver evidence | never blindly create a new payment |
| authority changes | stale local mutation can be rejected if generation is part of commit predicate | external rail needs its own fence/idempotency contract |
| idempotency key expires | same key may become a new operation under provider contract | operation identity lifecycle must be explicit |

### New finding: authority generation can coexist with payment state without replacing it

For a database-owned ledger, a transaction can carry both:

operation_id
authority_generation
payment_state transition

and enforce them separately.

Example conceptual acceptance:

operation_id must be new or match the exact prior request;
authority_generation must satisfy the current authorization predicate;
payment_state must allow the requested lifecycle transition.

This is stronger than using one "version" field for everything.

However, the external settlement rail still requires its own receiver-side identity/fencing semantics.

### Evidence ledger

ADYEN_PAYMENT_IDEMPOTENCY_SOURCE_CONFIRMED
ADYEN_IDEMPOTENCY_RETENTION_7_TO_14_DAYS_SOURCE_CONFIRMED
ADYEN_CONCURRENT_SAME_KEY_CONFLICT_SOURCE_CONFIRMED
ADYEN_CAPTURE/REFUND_ACCOUNTING_LIMITS_SOURCE_CONFIRMED
DOUBLE_ENTRY_DB_INVARIANTS_SOURCE_CONFIRMED
REAL_POSTGRES_CONCURRENCY_TESTS_SOURCE_CONFIRMED
PROPERTY_BASED_LEDGER_FUZZING_SOURCE_CONFIRMED
AUTHORIZATION_HOLD_LIFECYCLE_DISTINCT_FROM_IDEMPOTENCY_SOURCE_CONFIRMED
LOCAL_LEDGER_CAN_ATOMICALLY_BIND_PAYMENT_STATE_AND_OPERATION_ID SOURCE-SUPPORTED
PAYMENT_STATE != AUTHORITY_GENERATION
LOCAL_LEDGER_COMMIT != EXTERNAL_SETTLEMENT_COMPLETION
WEBHOOK/RECONCILIATION_REQUIRED_FOR_MISSING_EXTERNAL_RESPONSES SOURCE CONFIRMED
AUTHORITY_GENERATION_CAN_BE_A_SEPARATE_COMMIT_PREDICATE SOURCE-SUPPORTED
UNIVERSAL_EXTERNAL_SETTLEMENT_ATOMICITY NOT ESTABLISHED
EXECUTED NEXO PAYMENT AUTHORITY RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.804R: investigate settlement/reconciliation failures in payment systems: webhook duplication/out-of-order delivery, authorization reversal/capture races, provider timeout after accepted charge, and ledger-vs-provider reconciliation. Determine whether external payment rails expose a durable operation identity/version strong enough to close UNKNOWN without blind retry.

## AB104.804R — payment settlement reconciliation, webhook duplication/order, and UNKNOWN closure

### Adyen: missing API response is intentionally reconciled through idempotency + webhook

Adyen explicitly recommends combining API idempotency with asynchronous server-to-server webhooks to handle missing responses. The API contract says that retrying the same idempotency key after a timeout returns the result of the already-processed request rather than charging twice. The idempotency key is scoped to the company account and valid for 7–14 days. citeturn0search1

This gives a concrete recovery chain:

API timeout
-> retry same identity
-> receiver returns prior result

and, independently:

asynchronous webhook
-> synchronize local state.

Neither mechanism is an authority-generation fence.

### Webhook duplicates are expected, not exceptional

Adyen explicitly states that the same webhook may be delivered twice. Duplicate identification uses eventCode + pspReference, while eventDate/other fields may differ; their guidance says to use the latest webhook event. citeturn0search0turn0search7

This means webhook identity and payment operation identity must not be conflated automatically:

payment request idempotency key
!=
webhook delivery identity
!=
local observation version.

A receiver must define how a webhook event maps to the underlying payment resource and how duplicate/out-of-order observations are prevented from regressing state.

### Ordering is an explicit protocol concern

Adyen's webhook guidance says to inspect timestamps for chronological processing and notes that some webhook types expose sequenceNumber. Webhooks can also be delayed by seconds to minutes. citeturn0search0turn0search7

Therefore a webhook saying an older lifecycle state cannot safely overwrite a newer local state merely because it arrived later.

The reconciliation rule derived from the evidence remains:

accept observation only if its identity, resource namespace, event/version semantics, and state-transition rules permit it to advance or correct durable state.

A raw arrival timestamp is not an authority generation.

### Important settlement boundary: Adyen says there is no payment-settled webhook

Current Adyen webhook documentation states that a webhook event is not sent when a payment is settled. citeturn0search2

This is strong evidence that a local integration may observe payment lifecycle events without receiving a direct webhook that means "external settlement is durably complete."

Therefore:

local CAPTURED
does not automatically imply
external settlement CONFIRMED.

The settlement state may require separate reconciliation/reporting semantics.

### Reversals and lifecycle correction are distinct from ordinary retries

Adyen exposes lifecycle events including CAPTURE_FAILED, REFUND_FAILED, REFUNDED_REVERSED, EXPIRE, and technical cancellation. citeturn0search2

These are not merely duplicate versions of the same successful operation. They represent later lifecycle facts or corrections.

Nexo must therefore distinguish:

late duplicate observation
vs.
legitimate state transition/correction.

A monotonic numeric version alone cannot decide this; the state machine semantics matter.

### Failure matrix

| Situation | Safe interpretation |
|---|---|
| API timeout + same idempotency key retry | receiver can return original result |
| duplicate webhook | deduplicate by documented event identity |
| delayed webhook | process according to event/version semantics, not arrival order |
| old webhook arrives after newer state | reject/ignore if it would regress state |
| CAPTURED observed locally | not universal proof of settlement |
| missing settlement webhook | cannot infer failure solely from absence |
| REFUND_FAILED / CAPTURE_FAILED | explicit lifecycle failure event |
| REFUNDED_REVERSED | later correction/reversal event |
| idempotency key expired | old key no longer provides indefinite duplicate protection |

### New reconciliation rule

For a payment operation O, a terminal local state should be accepted only when:

1. the evidence identifies the exact payment/resource;
2. the evidence is authentic;
3. the evidence has sufficient ordering/version semantics;
4. the event is valid under the payment state machine;
5. retention/history is sufficient to interpret absence/presence;
6. the transition cannot silently regress a stronger terminal fact.

If any of these are missing, retain UNKNOWN or a non-terminal state rather than inventing success/failure.

### Evidence ledger

ADYEN_TIMEOUT_RETRY_SAME_KEY_RETURNS_PRIOR_RESULT SOURCE CONFIRMED
ADYEN_IDEMPOTENCY_SCOPE_AND_RETENTION SOURCE CONFIRMED
ADYEN_DUPLICATE_WEBHOOKS SOURCE CONFIRMED
ADYEN_WEBHOOK_IDENTITY_EVENTCODE_PLUS_PSPREFERENCE SOURCE CONFIRMED
ADYEN_WEBHOOK_TIMESTAMP/SEQUENCE_ORDERING SOURCE CONFIRMED
ADYEN_WEBHOOK_DELAY SOURCE CONFIRMED
ADYEN_NO_PAYMENT_SETTLED_WEBHOOK SOURCE CONFIRMED
ADYEN_LIFECYCLE_CORRECTION_EVENTS SOURCE CONFIRMED
WEBHOOK_IDENTITY != PAYMENT_OPERATION_IDENTITY
OBSERVATION_VERSION != AUTHORITY_GENERATION
LOCAL_CAPTURED != UNIVERSAL_SETTLEMENT_CONFIRMED
ABSENCE_OF_WEBHOOK != PROOF_OF_FAILURE
UNKNOWN_REQUIRES_SUFFICIENT_RECONCILIATION_EVIDENCE
UNIVERSAL_EXTERNAL_SETTLEMENT_ATOMICITY NOT ESTABLISHED
EXECUTED NEXO PAYMENT SETTLEMENT RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.805R: research provider-side event history/query APIs and reconciliation reports after ambiguous payment requests. Determine whether a missing webhook or stale API response can be converted into strong terminal evidence by querying the provider, and identify the consistency/retention limits of that evidence.

## AB104.805R — provider-side status/query evidence after ambiguous payment requests

### Provider query can strengthen UNKNOWN, but only within the provider's own semantic boundary

Current Adyen documentation provides a concrete status-query path for point-of-sale transactions: even when the original Terminal API response is not received, a transaction status request can retrieve transaction details. Adyen also exposes PSP references as stable payment identifiers and uses them for reconciliation. citeturn0search5turn0search9

This is materially stronger than treating a missing response as failure:

timeout -> query exact PSP/payment identity -> obtain provider state

However, the query result proves only what the provider's status API contract says it proves. It does not automatically prove downstream bank/card-network settlement.

### Asynchronous operations have a deliberate two-step contract

Adyen's manual capture flow is explicit: the capture request returns status: received, processing continues asynchronously, and the eventual result arrives through a CAPTURE webhook. The webhook says whether the request was valid and submitted to the bank/third-party processor; a successful capture webhook therefore has a defined semantic boundary that is narrower than universal settlement completion. citeturn0search3

Likewise, reversal returns a unique PSP reference and status: received, while the final outcome arrives asynchronously through CANCEL_OR_REFUND; later REFUND_FAILED or REFUNDED_REVERSED events can still alter the lifecycle. citeturn0search1turn0search9

Therefore a provider response has to be classified by semantic strength:

- received = request accepted for asynchronous processing;
- CAPTURE success = provider validation/submission boundary reached;
- later lifecycle event = additional state transition/correction;
- external settlement = separate claim unless provider contract explicitly binds it.

### Idempotency status is not historical omniscience

Adyen retains idempotency keys for 7–14 days and scopes them to the company account; the same key can be used to recover a processed request within that contract. After the retention boundary, the old key no longer provides an indefinite identity guarantee. citeturn0search0

Thus:

provider knows operation O

does not imply:

provider can prove O forever.

Reconciliation evidence has a retention boundary just like operation deduplication.

### Report/reconciliation channel

Adyen also exposes report-available webhook events carrying merchant reference, original reference, PSP reference, event date and a report download location. This provides a separate reconciliation channel from ordinary payment webhooks. citeturn0search11

That distinction matters because reconciliation may need to compare:

local ledger
vs.
provider transaction state
vs.
provider report

rather than trusting one asynchronous notification as the complete history.

### UNKNOWN closure rule refined

For operation O in provider namespace P:

UNKNOWN -> CONFIRMED

is justified only when the provider evidence:

1. identifies the exact operation/payment;
2. is authenticated/authorized as provider evidence;
3. has semantics that actually mean the claimed terminal state;
4. is sufficiently current/ordered for the question being answered;
5. remains within the provider's retention/history guarantees;
6. is not contradicted by a later lifecycle event.

UNKNOWN -> FAILED requires equivalent evidence for a terminal failure or a documented guarantee that the requested effect cannot have occurred.

A successful API query returning request received does not satisfy terminal confirmation.

A missing webhook does not satisfy terminal failure.

### Strong new distinction: evidence depth

Provider evidence should be classified by depth:

E0 = transport observation
request/response/timeout only.

E1 = request accepted
provider says operation was received/queued.

E2 = provider lifecycle terminal
provider says the operation reached a documented terminal state.

E3 = downstream settlement evidence
provider explicitly proves the external settlement rail reached the claimed state.

The system must not promote E1 to E2 or E2 to E3 merely because the values look monotonic.

### Evidence ledger

PROVIDER_STATUS_QUERY_AFTER_LOST_RESPONSE SOURCE CONFIRMED
PSP_REFERENCE_AS_RECONCILIATION_ID SOURCE CONFIRMED
ASYNC_CAPTURE_RECEIVED != CAPTURE_TERMINAL SOURCE CONFIRMED
CAPTURE_SUCCESS_HAS_DOCUMENTED_PROVIDER_BOUNDARY SOURCE CONFIRMED
REVERSAL_RECEIVED != REVERSAL_FINAL_OUTCOME SOURCE CONFIRMED
LATER_REFUND/REVERSAL_CORRECTION EVENTS SOURCE CONFIRMED
IDEMPOTENCY_RETENTION_LIMIT SOURCE CONFIRMED
PROVIDER_REPORT_RECONCILIATION_CHANNEL SOURCE CONFIRMED
QUERY_RESULT_SEMANTICS_MUST_BE_CLASSIFIED SOURCE-SUPPORTED
E0_TRANSPORT != E1_ACCEPTED != E2_PROVIDER_TERMINAL != E3_EXTERNAL_SETTLEMENT
MISSING_WEBHOOK != FAILED
RECEIVED != CONFIRMED
PROVIDER_TERMINAL != AUTOMATICALLY_EXTERNAL_SETTLEMENT
UNIVERSAL_EXTERNAL_SETTLEMENT_PROOF NOT ESTABLISHED
EXECUTED NEXO PAYMENT RECONCILIATION RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.806R: investigate whether provider reports/history are authoritative enough to correct or supersede webhook observations, including report generation delay, event ordering, duplicate reports, and retention. Then test whether reconciliation evidence can itself become stale after a later reversal/correction.

## AB104.806R — provider reports/history as reconciliation authority and later corrections

Current Adyen documentation says the Payment accounting report contains payment lifecycle status changes, events, and modifications for transactions and is used for invoice reconciliation. The report carries a globally unique PSP reference and a booking date describing when the event entered Adyen's accounting system. citeturn0search1

Adyen recommends combining reports to track a transaction across its lifecycle and explicitly recommends automated ingestion for full reconciliation. citeturn0search2turn0search7

The Settlement Details Report contains transactions included in a payout batch and their costs and is part of full financial reconciliation. citeturn0search9turn0search4

Critically, Adyen distinguishes an External settlement detail report from proof that the external acquirer actually paid the funds: a transaction appearing in that report does not itself confirm that the external acquirer has paid the merchant. citeturn0search10

Adyen also documents SETTLED_REVERSED: captured funds were not received from the card scheme or payment method within 30 days after capture, with a corresponding debit in the Settlement Details Report. citeturn0search0

This is a counterexample to the simplistic rule that CAPTURED or SETTLED is forever terminal. The correct model is that terminal state cannot be overwritten by an arbitrary stale observation; legitimate lifecycle corrections require their own typed, ordered, authenticated evidence.

### Evidence precedence

For one payment namespace, distinguish at least:

1. webhook observation;
2. provider payment-accounting event;
3. settlement report entry;
4. external-settlement report entry;
5. bank/acquirer evidence, when available.

These are not automatically ordered by one integer. Each source has a different claim scope.

A later report can legitimately correct an earlier webhook, but an unrelated report must not overwrite an exact payment lifecycle state merely because its booking timestamp is newer.

### Reconciliation state machine

LOCAL_PENDING
-> PROVIDER_ACCEPTED
-> PROVIDER_TERMINAL
-> SETTLEMENT_RECONCILED
-> BANK_EXTERNAL_CONFIRMED

Correction edges can exist, for example:

SETTLED
-> SETTLED_REVERSED

and:

REFUNDED
-> REFUNDED_REVERSED

Each correction is a new evidence event, not a stale worker rewriting history.

### Failure matrix

| Evidence/event | What it can establish | What it cannot automatically establish |
|---|---|---|
| webhook | provider event occurred | final bank settlement |
| payment accounting report | lifecycle/accounting event recorded by provider | external bank receipt |
| settlement details report | payment included in provider settlement batch | external acquirer actually paid, where provider explicitly disclaims that implication |
| external settlement report | provider has recorded external-acquirer settlement information | universal bank-side finality |
| later SETTLED_REVERSED | provider recorded later settlement reversal | that the original event was never true |
| missing report/webhook | absence of observed evidence | proof operation never occurred |

### New rule: evidence cannot erase history

If an earlier evidence event was authentic and valid, a later correction should append a new event explaining the correction. It should not mutate historical evidence as though the earlier observation never existed.

This connects payment reconciliation directly with the Nexo event-sourcing work:

immutable evidence history
+
typed correction event
+
current-state projection
+
reconciliation state.

### Evidence ledger

ADYEN_PAYMENT_ACCOUNTING_REPORT_LIFECYCLE_HISTORY SOURCE CONFIRMED
ADYEN_PSP_REFERENCE_GLOBAL_UNIQUE_IN_REPORT SOURCE CONFIRMED
ADYEN_AUTOMATED_MULTI_REPORT_RECONCILIATION SOURCE CONFIRMED
ADYEN_SETTLEMENT_DETAILS_REPORT SOURCE CONFIRMED
ADYEN_EXTERNAL_SETTLEMENT_REPORT_NOT_PROOF_EXTERNAL_ACQUIRER_PAID SOURCE CONFIRMED
ADYEN_SETTLED_REVERSED_LATE_CORRECTION SOURCE CONFIRMED
TERMINAL_STATE != IMMUTABLE_REAL_WORLD_FACT
AUTHENTIC_EVIDENCE_SHOULD_REMAIN_IN_HISTORY SOURCE-SUPPORTED
CORRECTION_EVENT != STALE_OVERWRITE
REPORT_SCOPE != WEBHOOK_SCOPE != BANK_SCOPE
NUMERIC_TIMESTAMP_ALONE != EVIDENCE_PRECEDENCE
MISSING_REPORT/WEBHOOK != PROOF_OF_NONEXECUTION
UNKNOWN_CAN_REQUIRE_MULTI-SOURCE_RECONCILIATION
UNIVERSAL_EXTERNAL_SETTLEMENT_PROOF NOT ESTABLISHED
EXECUTED NEXO PAYMENT RECONCILIATION RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.807R: investigate concrete reconciliation failure tests/incident reports involving webhook duplication, delayed reports, late reversals, duplicate refunds/captures, and provider-vs-ledger divergence. Prefer executable tests and production incident evidence over documentation-only claims.

## AB104.807R — executable/reported payment reconciliation failures

### Real failure pattern: webhook replay can create duplicate business effects

A current 2026 incident report describes a production webhook replay race in which a payment provider retried a payment-captured webhook four times during a network problem and the receiver created four duplicate orders. The reported root cause was absence of event-id idempotency. This is third-party incident evidence, not independent proof of a universal payment vulnerability. citeturn0search4

The architectural lesson is reproducible even without trusting the incident's exact environment:

provider retry -> duplicate delivery -> handler side effect

is safe only if the receiver makes event identity an atomic concurrency boundary.

### Executable payment-resilience implementation

A public payment-resilience implementation explicitly models duplicate webhook handling with PostgreSQL row locks, unique identifiers, a refund worker, and a reconciliation cron that queries the simulated provider after dropped webhooks. Its README describes live end-to-end tests against a real database for idempotency collisions and duplicate webhook handling. citeturn0search1

This is executable design evidence, but not a formal proof or production-scale validation.

### Concurrent duplicate webhook test surface

Another public payment engine uses a unique webhook identity, row locking, and automated tests for duplicate webhook delivery. It documents that the unique constraint, not a Redis lock, is the final source of truth for concurrent duplicate insertion. citeturn0search7

This confirms a recurring pattern:

SELECT then INSERT is not enough under concurrency.

The database uniqueness constraint or equivalent atomic receiver operation must arbitrate the race.

### Multi-gateway timeout divergence

A current payment-orchestration implementation documents a concrete failure scenario:

T0 gateway request starts
T1 client/gateway HTTP response times out
T2 local service records timeout/failure
T3 retry path starts
T4 original gateway operation was actually successful
T5 delayed success webhook arrives

Its mitigation combines external gateway idempotency, webhook reconciliation, a pre-retry status check, and a reconciliation job. citeturn0search6

This is relevant to Nexo because a local FAILED produced by transport timeout can be epistemically weaker than later provider evidence.

### Webhook ordering and authenticity remain separate properties

Adyen's current webhook guidance requires signature verification and warns that duplicate deliveries can occur. It also recommends timestamps and, where available, sequence numbers for chronological processing. citeturn0search8

Therefore:

authentic != newest

and:

newest arrival != newest event.

An authenticated old event is still old. An unauthenticated new event is not admissible merely because it arrived later.

### Stripe idempotency has a concrete retention boundary

Stripe documents that the first result for an idempotency key is retained and reused for subsequent matching requests, but keys can be automatically removed after at least 24 hours. Reuse after pruning creates a new request, and mismatched parameters are rejected. Stripe also states that concurrent requests can conflict before an idempotent result is saved. citeturn0search0

This gives another concrete example that operation identity is a lifecycle contract, not an eternal property.

### Failure matrix

| Failure | Weak response | Stronger response |
|---|---|---|
| duplicate webhook | process twice | atomic event identity + no-op duplicate |
| concurrent duplicate webhook | SELECT then process | unique constraint/atomic insert |
| gateway timeout | mark FAILED immediately | UNKNOWN + provider query/reconciliation |
| retry after ambiguous timeout | create new operation | same provider idempotency identity |
| delayed old webhook | overwrite current state | validate event ordering/state transition |
| forged webhook | trust payload | authenticate signature first |
| idempotency key expired | assume eternal identity | explicit retention/operation lifecycle |
| Redis lock lost | assume no duplicate | durable DB/receiver arbitration |

### Strong negative result

The researched implementations repeatedly solve different pieces:

- event deduplication;
- operation idempotency;
- state-machine monotonicity;
- provider reconciliation;
- refund/reversal recovery.

No audited implementation establishes all of the following as one universal proof boundary for arbitrary external payment settlement:

authority generation fence
+
operation identity
+
payload binding
+
external effect atomicity
+
durable terminal evidence
+
post-failure reconciliation.

Therefore the evidence supports a layered protocol, not a claim of universal exactly-once external payment effects.

### Evidence ledger

REAL_2026_WEBHOOK_REPLAY_DUPLICATE_ORDER_INCIDENT_REPORTED
EXECUTABLE_PAYMENT_RECONCILIATION_IMPLEMENTATION_SOURCE_CONFIRMED
REAL_DATABASE_DUPLICATE_WEBHOOK_TEST_SURFACE_SOURCE_CONFIRMED
SELECT_THEN_INSERT_CONCURRENCY_RACE SOURCE CONFIRMED
GATEWAY_TIMEOUT_CAN_PRECEDE_REAL_SUCCESS SOURCE CONFIRMED
PROVIDER_IDEMPOTENCY_RETRY SOURCE CONFIRMED
WEBHOOK_SIGNATURE_AUTHENTICITY_SEPARATE_FROM_ORDERING SOURCE CONFIRMED
ARRIVAL_ORDER != EVENT_ORDER
STRIPE_IDEMPOTENCY_RETENTION_BOUNDARY SOURCE CONFIRMED
REDIS_LOCK != DURABLE_RECEIVER_ARBITRATION
LOCAL_TIMEOUT_FAILURE != EXTERNAL_EFFECT_FAILURE
LAYERED_RECONCILIATION_REQUIRED SOURCE-SUPPORTED
UNIVERSAL_EXTERNAL_PAYMENT_EXACTLY_ONCE NOT ESTABLISHED
EXECUTED NEXO PAYMENT RACE NO
FORMAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.808R: turn the observed payment failures into adversarial test cases and compare the strongest receiver-side patterns: unique-event CAS, operation-id idempotency, payload binding, payment-state transition guards, authority-generation predicates, and reconciliation after timeout. Do not implement Nexo; derive the minimum testable invariants first.

## AB104.808R — adversarial payment invariants derived from executable evidence

### 1. Duplicate-event identity must be an atomic receiver boundary

Current executable payment projects demonstrate PostgreSQL unique constraints as the correctness boundary for idempotency under high concurrency. One project reports tests at 100/1,000/10,000 concurrent requests sharing an idempotency key; another reports 20 simultaneous requests with one key producing one charge, and same-key/different-payload producing conflict rather than silent replay. citeturn0search1turn0search6

Minimum invariant:

For receiver namespace N and logical operation O, at most one incompatible payload may be accepted for O.

A cache or distributed lock can accelerate/reduce contention, but correctness must survive its loss.

### 2. Payment lifecycle transition must be guarded at commit time

Executable payment systems model transitions such as AUTHORIZED -> CAPTURED, AUTHORIZED -> VOID, and CAPTURED -> REFUNDED, and reject illegal transitions. Some use pessimistic row locks; others use optimistic version checks. citeturn0search3turn0search4

Minimum invariant:

A state transition is accepted only if the durable payment state still satisfies the transition precondition at the commit or linearization point.

A worker reading AUTHORIZED and later writing CAPTURED without a guarded commit is not sufficient.

### 3. Monetary invariants require the ledger, not a mutable balance cache

A payment-ledger implementation explicitly treats immutable double-entry postings as the financial source of truth and enforces debit/credit balance. Derived balances can be rebuilt from ledger history. citeturn0search1

Minimum invariant:

Every accepted monetary posting preserves the ledger accounting conservation rule.

A cached balance is an observation/projection, not the authoritative financial history.

### 4. Timeout must remain epistemically ambiguous

Adyen explicitly supports retrying the same idempotency key after timeout and returning the result of the first processed request. It also recommends asynchronous webhooks for missing responses. citeturn0search0

Minimum invariant:

Transport timeout alone cannot transition a payment to terminal FAILED when the external operation may already have been accepted.

The state should remain UNKNOWN/PENDING until provider evidence or a contractually strong failure result closes the uncertainty.

### 5. Webhook authenticity and ordering are independent predicates

Adyen requires webhook signature verification and separately recommends timestamps/sequence numbers for chronological processing; duplicate events can share eventCode and pspReference while other fields differ. citeturn0search8

Minimum invariant:

AcceptWebhook(e) requires both authentic source evidence and valid event/state ordering semantics.

Authenticity does not make an old event current. New arrival does not make an unauthenticated event valid.

### 6. Stale observations must not regress durable state

Executable payment engines include stale aggregate-version rejection and webhook ordering tests. One implementation explicitly rejects a lower aggregate version even when the event is genuine and correctly signed. citeturn0search1

Minimum invariant:

A valid but older observation cannot replace a newer durable projection unless the state machine defines an explicit correction transition.

### 7. Operation identity, authority generation, and payment version remain distinct

The evidence supports three separate domains:

operation_id = which logical attempt is this?
authority_generation = which authorization epoch may perform it?
payment_version = which lifecycle state/version is current?

No audited payment implementation justifies collapsing these into one integer.

### 8. Authority generation must be checked at the protected effect boundary

The audited payment implementations provide strong evidence for operation idempotency and payment-state concurrency, but none establishes a universal authority-generation fence across arbitrary payment-provider settlement.

Therefore the Nexo invariant remains:

If generation g2 supersedes g1 for protected resource R, an effect carrying g1 must be rejected at R after g2's acceptance boundary, unless the effect already linearized before that boundary.

This is an architectural requirement derived from the earlier fencing research, not a claim that current payment APIs universally implement it.

### 9. Reconciliation is a separate safety mechanism

Executable systems combine provider idempotency, webhook processing, refund/reversal workers, and reconciliation. Some explicitly model a mock external bank and classify provider-vs-ledger inconsistencies rather than assuming local state is authoritative for the external world. citeturn0search1turn0search12

Minimum invariant:

UNKNOWN may be closed only by evidence strong enough to exclude the opposite terminal outcome.

### 10. Exact test matrix for the future Nexo prototype

The following cases are candidates for the first formal adversarial suite, but are NOT yet executed by Nexo:

A. same operation, 2 concurrent submissions
B. same operation, same payload, 100+ concurrent retries
C. same operation, different payload
D. duplicate webhook, same event identity
E. duplicate webhook, concurrent handlers
F. newer webhook arrives before older webhook
G. authenticated old webhook after newer terminal state
H. timeout after provider accepted operation
I. retry after timeout
J. worker crash after provider effect but before local acknowledgement
K. worker crash after local ledger commit but before webhook enqueue
L. refund racing with capture
M. capture racing with void
N. two refunds racing against one captured amount
O. stale worker using old payment version
P. stale worker using old authority generation
Q. authority generation changes during in-flight operation
R. provider later emits reversal/correction
S. reconciliation observes provider state older than local state
T. reconciliation observes provider correction newer than local state
U. idempotency key retention expires
V. process restart with durable terminal state
W. lost response followed by duplicate response
X. forged/invalid webhook signature
Y. webhook valid but wrong namespace/merchant
Z. external settlement remains UNKNOWN after local CAPTURED

### Evidence ledger

POSTGRES_UNIQUE_CONSTRAINT_AS_IDEMPOTENCY_ARBITER SOURCE CONFIRMED
PAYMENT_STATE_COMMIT_GUARD SOURCE CONFIRMED
DOUBLE_ENTRY_LEDGER_AS_FINANCIAL_TRUTH SOURCE CONFIRMED
TIMEOUT_AMBIGUITY SOURCE CONFIRMED
WEBHOOK_AUTHENTICITY_AND_ORDERING_SEPARATE SOURCE CONFIRMED
STALE_EVENT_NONREGRESSION SOURCE CONFIRMED
OPERATION_ID != AUTHORITY_GENERATION != PAYMENT_VERSION
EFFECT_TIME_AUTHORITY_FENCE STILL REQUIRED
RECONCILIATION_SEPARATE_FROM_IDEMPOTENCY SOURCE CONFIRMED
ADVERSARIAL_TEST_MATRIX DERIVED
TEST MATRIX NOT YET EXECUTED BY NEXO
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.809R: investigate whether these 26 adversarial cases are complete or missing important classes. Cross-check against payment processor state machines, database isolation anomalies, message-delivery semantics, and previously audited fencing/reconciliation failures. Do not build; close the test-model gap first.

## AB104.809R — completeness audit of the adversarial payment test model

The 26-case matrix from AB104.808R is not yet complete. Cross-checking against PostgreSQL isolation semantics and an executable payment/ledger system exposes additional failure classes that must be represented explicitly.

### A. Database isolation is a separate failure dimension

PostgreSQL documents that Read Committed can permit serialization anomalies, while Serializable detects executions inconsistent with any serial ordering and aborts a transaction with serialization failure. The documentation also gives write-skew examples and requires applications to retry a serialization failure from the beginning. PostgreSQL's executable payment-ledger evidence reports a real lost update under Read Committed and a real write-skew overdraw that Repeatable Read misses but Serializable catches; it then compares Serializable retry against explicit locking. citeturn0search1turn0search0turn0search4

Therefore the matrix needs explicit isolation/admission cases, not only application-level races.

### B. New adversarial classes

AA. two transactions read the same available monetary amount and both authorize/capture;
AB. write-skew overdraw across different rows/accounts;
AC. lost update under Read Committed;
AD. serialization failure after external side-effect attempt;
AE. transaction retry after serialization failure with an external request already sent;
AF. unique-constraint conflict after two concurrent idempotency checks;
AG. deadlock/lock-timeout during payment transition;
AH. crash between database commit and acknowledgement;
AI. crash between external request and database commit;
AJ. recovery retry after serialization failure with same operation_id;
AK. replay after database rollback but provider accepted the operation;
AL. replica/read-path stale payment state followed by a write;
AM. failover/restart where local fencing/version state is stale;
AN. duplicate message plus transaction retry producing a second logical attempt;
AO. outbox row committed but ledger projection delayed;
AP. ledger committed but webhook/outbox publication unavailable;
AQ. correction event arrives while a stale transition transaction is open;
AR. provider event is valid but refers to a previous payment incarnation;
AS. refund amount race after a partial refund;
AT. currency/precision/rounding invariant race;
AU. multi-account transfer where one side commits and the other does not;
AV. reconciliation query observes one ledger projection before another;
AW. compensation/correction races with original operation;
AX. idempotency record retention expires while a delayed message remains in flight;
AY. authority-generation transition races with a transaction that has already passed its initial authorization check.

These are additions to the prior A-Z matrix, not replacements.

### C. Important newly discovered boundary: serialization retry is not an external-effect retry

PostgreSQL's Serializable contract says an aborted transaction must be retried from the beginning. That is safe for database-only work. It is NOT automatically safe when the transaction performed an external effect before the serialization failure or before its database commit.

Example:

T0 transaction reads payment state
T1 sends external capture
T2 concurrent DB transaction commits
T3 local transaction receives serialization failure
T4 generic retry sends capture again

Database serializability does not roll back T1.

Therefore:

DB transaction retry != external operation retry

and:

serialization failure != proof external effect did not occur.

This directly extends the earlier UNKNOWN/reconciliation findings.

### D. Multi-row monetary invariants must be explicit

A single-row version check is insufficient for rules spanning multiple accounts, balances, or ledger entries. PostgreSQL's documented write-skew example demonstrates why a transaction can make locally valid writes that are jointly inconsistent under weaker isolation. citeturn0search0turn0search1

For Nexo, the future test model must distinguish:

- row-local CAS;
- multi-row invariant;
- cross-account invariant;
- ledger conservation invariant;
- external-provider invariant.

A system passing row-local CAS tests has not therefore proved multi-row monetary correctness.

### E. New minimum invariants

INV-11: A serialization failure invalidates the transaction's database observations; retry must start from a new valid transaction snapshot.

INV-12: Retrying a database transaction must not blindly repeat an external operation whose execution status is UNKNOWN.

INV-13: Multi-row monetary invariants must be protected by an isolation/locking/constraint mechanism sufficient for the stated invariant.

INV-14: A durable ledger conservation rule must hold after every accepted committed monetary transition.

INV-15: A local database rollback does not imply rollback of an external provider effect.

INV-16: A provider operation accepted before a local serialization failure retains its original operation identity and requires reconciliation/idempotent retry, not a fresh unbound attempt.

INV-17: Projection/outbox lag must not be interpreted as loss of the committed ledger event.

INV-18: A stale read used to authorize a state transition must be rejected or revalidated at the protected commit boundary.

INV-19: A payment incarnation must remain distinct from a reused payment identifier.

INV-20: Authority-generation changes must be tested against transactions that have already passed admission authorization.

### F. Updated test-model status

The original 26 cases remain.

Added classes: AA through AY = 25 additional adversarial scenarios.

Total candidate adversarial scenarios: 51.

This is still a MODEL, not an executed Nexo suite.

### Evidence ledger

POSTGRES_READ_COMMITTED_CAN_PERMIT_SERIALIZATION_ANOMALIES SOURCE CONFIRMED
POSTGRES_SERIALIZABLE_DETECTS_AND_ABORTS_DANGEROUS_CONCURRENCY SOURCE CONFIRMED
POSTGRES_SERIALIZATION_FAILURE_REQUIRES_FULL_TRANSACTION_RETRY SOURCE CONFIRMED
EXECUTABLE_PAYMENT_PROJECT_REPORTS_LOST_UPDATE_AND_WRITE_SKEW SOURCE CONFIRMED
DB_SERIALIZATION_RETRY != EXTERNAL_EFFECT_RETRY
DB_ROLLBACK != EXTERNAL_ROLLBACK
MULTI_ROW_INVARIANT != ROW_LOCAL_CAS
STALE_READ_AUTHORIZATION_REQUIRES_COMMIT_BOUNDARY_GUARD
PAYMENT_INCARNATION != PAYMENT_IDENTIFIER
OUTBOX/PROJECTION_LAG != LOST_LEDGER_EVENT
51 CANDIDATE ADVERSARIAL SCENARIOS
MODEL NOT EXECUTED
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.810R: cross-check the 51-case model against message brokers and workflow engines, specifically duplicate/ack-loss/retry, partition rebalancing, redelivery, poison messages, exactly-once boundaries, and transaction-to-message atomicity. Then check whether additional classes are missing before freezing the adversarial model.

## AB104.810R — message-broker/workflow cross-check of the 51-case adversarial model

RabbitMQ current reliability documentation confirms several failure classes that were only implicit in the previous matrix. Manual consumer acknowledgements provide at-least-once delivery; if a consumer connection/channel fails before acknowledgement, unacknowledged messages are automatically requeued and can be redelivered. RabbitMQ explicitly says consumers must be prepared for redeliveries and should be idempotent. Publisher confirms also create a duplicate window: after a connection failure, a producer may retransmit a message for which the broker had already processed the publish but the confirmation did not reach the producer. citeturn0search0turn0search1

### Additional broker/workflow failure classes

BA. consumer performs local effect, crashes before ACK, broker redelivers;
BB. consumer ACK reaches broker after local effect but client loses confirmation;
BC. producer publish succeeds, publisher confirm is lost, producer retries;
BD. producer retransmission creates duplicate logical messages;
BE. message is requeued repeatedly and enters a redelivery loop;
BF. poison message repeatedly fails and blocks useful progress;
BG. multiple unacknowledged deliveries are in flight and complete/ACK out of original order;
BH. worker is cancelled/rebalanced while effect is in progress;
BI. message is delivered to consumer A, then redelivered to consumer B;
BJ. duplicate message has same logical operation but different transport delivery identity;
BK. broker reports redelivery but receiver's original delivery was never actually processed;
BL. delayed duplicate arrives after the local operation has already reached a terminal state;
BM. publisher confirms and consumer acknowledgements create separate durability boundaries;
BN. queue/broker restart changes which delivery attempt is visible to the worker;
BO. retry/dead-letter/requeue policy changes operation ordering;
BP. message is valid but belongs to a previous authority generation;
BQ. partition/rebalance moves ownership while old worker continues executing;
BR. workflow retry happens after the message was durably accepted but before local completion was recorded;
BS. workflow completion is durable but downstream publication is delayed;
BT. downstream publication occurs, but workflow acknowledgement is lost.

### New distinction: delivery identity is not operation identity

A broker delivery tag, message ID, event ID, workflow attempt ID, and Nexo operation_id are different domains.

RabbitMQ explicitly scopes delivery tags to a channel. The same logical operation may therefore have multiple delivery attempts while retaining one application-level operation identity. citeturn0search0

Nexo must not infer:

new delivery => new operation

nor:

redelivery => definitely previously processed.

The broker's redelivered flag is explicitly only a hint that the message may have been delivered before; RabbitMQ notes that a redelivery flag does not prove the previous consumer actually processed it. citeturn0search1

### New distinction: acknowledgement is not effect proof

The receiver can safely acknowledge only after the work required by its contract has been completed, but the acknowledgement itself remains a separate protocol boundary. RabbitMQ's reliability guide says applications should acknowledge after recording, forwarding, or performing the required operation; once acknowledged, the broker may remove the delivery. citeturn0search1

Therefore:

ACK(message) != universal proof of external effect

The meaning of ACK must be explicitly bound to the receiver's durable completion boundary.

### New distinction: publisher confirm is not receiver effect proof

A publisher confirm indicates broker responsibility for the message, but it does not by itself prove that a downstream consumer performed the business effect. Conversely, losing a confirm does not prove the publish failed, creating a retry/duplicate window. citeturn0search0turn0search1

### Updated invariant set

INV-21: Transport delivery identity must remain distinct from logical operation identity.

INV-22: Redelivery must be safe even when the receiver cannot know whether the previous delivery executed.

INV-23: Lost ACK/confirm must produce an explicit UNKNOWN/reconciliation path rather than an assumed failure.

INV-24: Broker-level at-least-once guarantees do not become exactly-once business effects without receiver-side idempotency/atomicity.

INV-25: A redelivery flag is evidence of possible prior delivery, not proof of prior execution.

INV-26: Poison-message retry must not create unbounded duplicate external effects or starvation; retry/dead-letter policy is part of the safety/liveness contract.

INV-27: Rebalance/cancellation of a worker must not be treated as an external-effect fence.

INV-28: ACK/confirm semantics must specify exactly which durable boundary they acknowledge.

INV-29: Broker message ordering must not be confused with business-event ordering.

INV-30: A message from an obsolete authority generation must be rejected at the protected effect boundary even if transport delivery is valid.

### Test-model expansion

Previous candidate scenarios: 51.

New broker/workflow classes: BA-BT = 20.

Updated candidate count: 71.

This is still a candidate adversarial model, not an executed Nexo suite.

### Important negative result

The broker layer can provide durable delivery semantics and retry/redelivery behavior, but it does not automatically solve:

- business operation identity;
- payment-state transition correctness;
- external authority fencing;
- external effect atomicity;
- reconciliation after ambiguous effect;
- monetary ledger invariants.

Therefore adding a broker does not collapse the previously separated layers into one guarantee.

### Evidence ledger

RABBITMQ_AT_LEAST_ONCE_ACK_REDELIVERY SOURCE CONFIRMED
RABBITMQ_PUBLISH_CONFIRM_DUPLICATE_WINDOW SOURCE CONFIRMED
RABBITMQ_REDELIVERY_FLAG_NOT_PROOF_OF_PRIOR_EXECUTION SOURCE CONFIRMED
ACK_BOUNDARY != EXTERNAL_EFFECT_PROOF
PUBLISH_CONFIRM != DOWNSTREAM_EFFECT_PROOF
DELIVERY_ID != OPERATION_ID
BROKER_REDELIVERY != BUSINESS_RETRY_SEMANTICS
BROKER_GUARANTEE != PAYMENT_LEDGER_GUARANTEE
POISON_RETRY/DEAD_LETTER IS SAFETY/LIVENESS CONCERN
WORKER_REBALANCE/CANCELLATION != EFFECT_FENCE
71 CANDIDATE ADVERSARIAL SCENARIOS
MODEL NOT EXECUTED
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.811R: cross-check the 71-case model against Kafka transactional producer/consumer semantics and workflow execution boundaries, then identify whether partition ownership, offset commits, transactional read-process-write, and external sink cooperation introduce additional classes or merely map to existing ones. Freeze only after deduplicating the model.

## AB104.811R — Kafka transactional boundaries, rebalance, offsets, and workflow mapping

Kafka 4.1 documents a precise exactly-once boundary: for Kafka-to-Kafka processing, partition assignment isolates current processing ownership, and producer transactions atomically commit produced records together with consumer offsets. Kafka explicitly states that exactly-once for other destination systems generally requires cooperation from those systems. citeturn1search1turn1search12

Kafka 4.1 also documents that consumer offset commits are used after rebalance/startup, and that a commit can time out without establishing a universal business-effect result. The current API documents CommitFailedException when the consumer no longer owns a partition, including after group changes. citeturn1search14

### Deduplication of the 71-case model

Several broker cases map to previously existing classes rather than being unique safety properties.

Merged classes:

- producer confirm loss + message retry -> existing ambiguous acknowledgement/retry class;
- consumer ACK loss + redelivery -> existing effect-before-ack crash class;
- duplicate delivery + concurrent handlers -> existing duplicate-operation concurrency class;
- rebalance + stale worker -> existing stale-worker/authority-generation class;
- delayed duplicate after terminal state -> existing stale-observation/nonregression class;
- poison-message retry -> distinct liveness/resource-exhaustion class and remains separate;
- partition ownership loss -> distinct ownership/fencing class and remains separate;
- transactional Kafka read-process-write -> distinct owned-atomic-domain class and remains separate;
- external sink after Kafka transaction -> existing external-effect/cooperation class.

Therefore 71 is an upper candidate count, not 71 independent invariants.

### Kafka-specific boundary

Kafka can atomically couple:

input offset
+
Kafka-produced output
+
Kafka state/transaction

within the Kafka transactional domain. This is materially stronger than ordinary at-least-once processing. But that atomicity stops at the external destination boundary unless the destination participates/cooperates. citeturn1search1turn1search4

Thus:

Kafka transaction
!= arbitrary external effect transaction.

### Rebalance/ownership finding

Kafka's consumer group model uses partition assignment as an ownership mechanism. A consumer that loses ownership cannot safely assume it may commit offsets for the lost partition; the current API documents commit failure when group ownership has changed. citeturn1search14

This is an important ownership fence, but it protects Kafka's offset/partition domain. It does not automatically fence a worker that has already sent an external request.

Nexo therefore needs to preserve:

transport/partition ownership
!= authority generation
!= external effect fence.

### Workflow comparison

Temporal records Workflow state in durable Event History and replays that history after Worker failure. Activity Task executions can have multiple attempts, while the Workflow records their resulting completion/failure events. Temporal explicitly describes Activities as operations on the external world and says handlers for Nexus operations should be idempotent because the service may issue multiple task attempts. citeturn0search0turn0search1turn0search4

This maps closely to the Nexo separation:

Workflow/Event History
= durable orchestration evidence

Activity attempt
= execution attempt

external receiver
= effect owner

receiver idempotency/fencing
= external safety boundary

reconciliation
= ambiguity resolver.

Temporal's replay durability does not itself make an external Activity effect atomic with Workflow history; the external receiver still needs the appropriate idempotency semantics. citeturn0search0turn0search3

### New minimum invariants

INV-31: A transactional boundary is only as strong as the state/effect domains participating in that transaction.

INV-32: Kafka exactly-once guarantees must not be generalized to arbitrary external sinks.

INV-33: Partition ownership loss is a transport/work-ownership signal, not by itself an external-effect fence.

INV-34: A commit failure caused by lost partition ownership must not be interpreted as proof that earlier external work did not happen.

INV-35: Workflow replay may reconstruct orchestration state without re-executing already-recorded workflow decisions, but external Activity effects require their own receiver contract.

INV-36: Multiple execution attempts of one logical operation must retain operation identity when they are retries of the same operation.

INV-37: A new workflow run/retry must not silently become a new external operation when the prior operation's outcome is UNKNOWN.

INV-38: Exactly-once claims must name their domain: Kafka, local DB, workflow history, receiver, or external settlement.

### Model normalization

The candidate model should no longer be described simply as 71 independent scenarios.

Current normalized classes:

1. operation identity collision
2. payload-binding conflict
3. duplicate delivery/retry
4. acknowledgement ambiguity
5. transaction isolation anomaly
6. commit/apply separation
7. stale observation/order
8. state-machine transition race
9. authority-generation/fencing race
10. worker ownership/rebalance race
11. external-effect ambiguity
12. reconciliation consistency/retention
13. ledger conservation/multi-account invariant
14. correction/reversal
15. idempotency retention/reuse
16. broker/workflow liveness and poison-message behavior
17. recovery/restart continuity
18. namespace/incarnation confusion
19. authentication/source-validity failure
20. cross-domain atomicity boundary

These 20 classes are not yet a frozen final taxonomy; they are the current normalized model.

### Evidence ledger

KAFKA_EOS_TRANSACTIONAL_OFFSET_PLUS_OUTPUT SOURCE CONFIRMED
KAFKA_EXTERNAL_DESTINATION_REQUIRES_COOPERATION SOURCE CONFIRMED
KAFKA_PARTITION_OWNERSHIP_COMMIT_FENCE SOURCE CONFIRMED
KAFKA_COMMIT_FAILURE_AFTER_OWNERSHIP_CHANGE SOURCE CONFIRMED
TEMPORAL_DURABLE_WORKFLOW_HISTORY SOURCE CONFIRMED
TEMPORAL_MULTIPLE_ACTIVITY_ATTEMPTS SOURCE CONFIRMED
TEMPORAL_EXTERNAL_ACTIVITY_REQUIRES_RECEIVER_SEMANTICS SOURCE SUPPORTED
71_SCENARIOS_NORMALIZED_INTO_20_FAILURE_CLASSES
TRANSACTION_DOMAIN_MUST_BE_EXPLICIT
PARTITION_OWNERSHIP != AUTHORITY_GENERATION
AUTHORITY_GENERATION != EXTERNAL_EFFECT_FENCE
WORKFLOW_REPLAY != EXTERNAL_EFFECT_ATOMICITY
MODEL NOT EXECUTED
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.812R: attack the normalized 20 classes for missing cross-products, especially combinations that are individually safe but unsafe together: fencing + retry, serialization failure + external effect, rebalance + delayed response, correction + stale evidence, retention expiry + redelivery, and recovery + namespace/incarnation reuse. Determine the minimum independent test set before freezing the adversarial model.

## AB104.811R — Kafka transactional/rebalance cross-check and model deduplication

Current Kafka design confirms the key boundary: exactly-once processing is achievable when consuming from Kafka and producing back to Kafka because offsets and produced records can participate in the same Kafka transaction. For external destinations, Kafka explicitly says stronger semantics require cooperation from the destination system. citeturn0search0turn0search4

Kafka also documents the consumer-failure window: a consumer can process records and crash before saving its position, causing the next consumer to receive already-processed records. This is the canonical at-least-once duplicate window. citeturn0search0

### Rebalance and ownership findings

Kafka's transactional pattern depends on partition assignment: the consumer group ensures one active consumer processes each assigned partition, while transactions atomically bind produced records and committed offsets. Restarted transactional producers can fence/abort an in-flight transaction through the transactional.id mechanism. citeturn0search4

The consumer API also makes the rebalance boundary explicit: committed offsets are used after rebalance/startup, and commit timeout/failure is observable. Leader epoch metadata can accompany committed offsets. citeturn0search1

This yields four distinct boundaries:

1. partition ownership;
2. offset durability;
3. Kafka transaction commit;
4. external effect completion.

Only the first three can be made part of Kafka's native transaction. The fourth remains outside unless the sink participates.

### Deduplication of the 71-case model

Several RabbitMQ cases map directly onto the Kafka consumer failure model and should not remain separate invariants:

- BA/BI/BL -> generic redelivery after processing/terminal state;
- BB/BT -> acknowledgement loss / completion uncertainty;
- BC/BD -> producer confirmation loss and retry;
- BQ -> ownership/rebalance race;
- BR -> accepted input but completion record not yet durable;
- BS -> durable completion but downstream publication lag.

They remain useful concrete scenarios, but they should map to common failure classes rather than inflate the formal invariant count.

### Canonical failure classes after deduplication

The model now has 14 canonical classes:

C1 Identity collision/reuse
C2 Payload/request binding violation
C3 Duplicate delivery/submission
C4 Lost acknowledgement/confirmation
C5 Reordering/stale observation
C6 Invalid lifecycle/state transition
C7 Isolation/concurrency anomaly
C8 Transaction abort/retry after partial work
C9 Crash/restart/recovery
C10 Ownership/rebalance/authority transition
C11 Stale authority/fencing failure
C12 External-effect ambiguity and reconciliation
C13 Retention/compaction/history loss
C14 Cross-domain atomicity boundary

### New Kafka-specific adversarial witnesses

BZ. consumer processes record, external effect succeeds, offset transaction fails;
CA. offset commits, external effect does not happen;
CB. rebalance occurs after effect but before offset commit;
CC. old consumer continues work after partition ownership changes;
CD. transactional producer restart fences old instance while old work is still in progress;
CE. Kafka transaction commits output and offset, but an external sink remains uncertain;
CF. external sink accepts effect, Kafka transaction aborts, then message is redelivered;
CG. offset commit timeout leaves commit status uncertain;
CH. external sink retries after Kafka transaction retry;
CI. sink accepts first request, response lost, second attempt arrives;
CJ. read_committed consumer sees only committed Kafka output while external effect remains separately ambiguous.

These are concrete witnesses, not new universal guarantees.

### Important distinction

Kafka's exactly-once transaction proves an atomic relationship among Kafka-managed records and offsets. It does not prove:

Kafka transaction committed => arbitrary external effect committed.

Likewise:

offset commit failed => external effect did not happen

is invalid.

### Updated model status

Concrete scenarios accumulated: 81 (71 + 10 Kafka-specific witnesses).

Canonical failure classes: 14.

The 81 scenarios should NOT be treated as 81 independent invariants. They are adversarial witnesses mapped to 14 failure classes.

The model remains UNFROZEN because coverage of workflow cancellation, poison-message liveness, retention boundaries, and cross-domain fencing still needs one final cross-check.

### Evidence ledger

KAFKA_EXACTLY_ONCE_KAFKA_TO_KAFKA_SOURCE_CONFIRMED
KAFKA_EXTERNAL_DESTINATION_REQUIRES_COOPERATION SOURCE CONFIRMED
KAFKA_CONSUMER_CRASH_BEFORE_OFFSET_COMMIT_CAN_DUPLICATE SOURCE CONFIRMED
KAFKA_PARTITION_ASSIGNMENT_OWNERSHIP SOURCE CONFIRMED
KAFKA_TRANSACTIONAL_ID_RESTART_FENCES_OLD_TRANSACTION SOURCE CONFIRMED
KAFKA_OFFSET_COMMIT_TIMEOUT_IS_NOT_EXECUTION_PROOF SOURCE CONFIRMED
KAFKA_OFFSET_COMMIT != EXTERNAL_EFFECT_PROOF
KAFKA_TRANSACTION_COMMIT != ARBITRARY_EXTERNAL_EFFECT_PROOF
81 CONCRETE ADVERSARIAL WITNESSES
14 CANONICAL FAILURE CLASSES
MODEL NOT EXECUTED
FORMAL UNIVERSAL PROOF NOT ESTABLISHED
NEXO IMPLEMENTATION NOT PERFORMED

## Exact next action

AB104.812R: final cross-check against workflow cancellation/timeout, poison-message liveness, retention/compaction, and fencing recovery. Determine whether any failure class is still absent; then produce a deduplicated coverage ledger before declaring the adversarial model frozen.


---

## AB104.811R-CORRECTION — CONTINUITY RECONCILIATION

**Date:** 2026-09-28

### Reason for correction

A continuity audit found that AB104.811R was written twice in this file. Both historical blocks are preserved intentionally; no prior text is deleted or overwritten.

The two blocks are not equivalent. The earlier AB104.811R block contains the more complete normalization into **20 failure classes** and explicitly defines the next cross-product audit. A later appended AB104.811R block compressed that model into **14 canonical classes** after adding Kafka-specific witnesses. That later 14-class list is therefore treated as an **intermediate compression**, not as the canonical taxonomy for the next audit.

### Canonical state restored

For the continuation of AB104, the working taxonomy is the earlier **20 normalized classes**:

1. operation identity collision
2. payload-binding conflict
3. duplicate delivery/retry
4. acknowledgement ambiguity
5. transaction isolation anomaly
6. commit/apply separation
7. stale observation/order
8. state-machine transition race
9. authority-generation/fencing race
10. worker ownership/rebalance race
11. external-effect ambiguity
12. reconciliation consistency/retention
13. ledger conservation/multi-account invariant
14. correction/reversal
15. idempotency retention/reuse
16. broker/workflow liveness and poison-message behavior
17. recovery/restart continuity
18. namespace/incarnation confusion
19. authentication/source-validity failure
20. cross-domain atomicity boundary

The 81 concrete witnesses remain evidence witnesses; they are **not** 81 independent invariants. The 14-class compression remains historical evidence and may be used as a mapping aid, but it must not replace the 20-class coverage model.

### Research checkpoint

Fresh source review for the pending AB104.812R dimensions confirms the gaps are real and materially distinct:

- RabbitMQ documents at-least-once delivery, redelivery after unacknowledged processing, and explicitly warns that requeue/redelivery can form loops; quorum queues expose delivery counts and can drop or dead-letter messages after a delivery limit. citeturn0search0turn0search1turn0search2
- Temporal documents automatic task retry and separate workflow execution retry histories; Nexus operations can be attempted multiple times and handlers are expected to be idempotent. citeturn0search3
- etcd documents that compaction makes older revisions inaccessible and that snapshot restore may require revision bumps/invalidating watcher caches, demonstrating that recovery/history continuity is distinct from simply restoring data. citeturn0search4turn0search8

These sources do not constitute a universal proof of the Nexo model. They provide concrete implementation evidence for the pending adversarial dimensions.

### Exact continuation point

**AB104.812R is NOT yet declared complete.** Its required work is now:

1. cross-product fencing + retry;
2. serialization/isolation failure + external effect;
3. rebalance/ownership change + delayed response;
4. correction/reversal + stale evidence;
5. retention/compaction expiry + redelivery/retry;
6. recovery/restart + namespace/incarnation reuse;
7. workflow cancellation/timeout + external effect;
8. poison-message liveness + terminal/UNKNOWN state;
9. construct the minimum independent witness set covering the 20 classes;
10. only then assess whether the adversarial taxonomy can be frozen.

**Status:** RECONCILED_CONTINUITY / RESEARCH_IN_PROGRESS / MODEL_UNFROZEN / NO_IMPLEMENTATION.


---

## AB104.812R — CROSS-PRODUCT ADVERSARIAL AUDIT

**Date:** 2026-09-28
**Scope:** cross-products required by the reconciled 20-class taxonomy.
**Status:** RESEARCHED / ANALYZED / UNFROZEN / NO IMPLEMENTATION.

### 1. Fencing + retry

A retry cannot be treated as a new authorization merely because the transport attempt is new. The adversarial witness is:

- O1 acquires authority generation G1;
- O1 begins an external-capable operation;
- authority advances to G2 or ownership moves;
- O1 times out/crashes;
- retry R1 arrives under G1 or under a newly minted operation identity;
- the system must distinguish stale G1 work from a legitimately new G2 operation.

This crosses classes 3, 9, 10, 11, 17 and 20. Kafka's rebalance protocol makes ownership transitions explicit, while transactional producer fencing demonstrates that some systems actively prevent an old transactional instance from continuing a fenced transaction. That is evidence for a real fencing mechanism, not evidence that arbitrary external effects are fenced. citeturn0search1turn0search2

**Required invariant:** retry identity and authority generation must be independently checked at the protected effect boundary.

### 2. Isolation/serialization failure + external effect

Witness:

- transaction T1 reads state and sends external request E;
- T1 later loses a serialization/locking race and aborts or retries;
- external E may already have been accepted;
- automatic DB retry must not imply automatic external retry.

This crosses classes 5, 7, 8, 11, 13 and 20. Temporal's Activity model provides an independent real-world analogue: an Activity may execute successfully and the worker can crash before the service learns of completion, after which the Activity can be retried; Temporal therefore recommends idempotent Activities. citeturn0search3turn0search5

**Required invariant:** database rollback/serialization failure is not evidence that an external effect was absent.

### 3. Rebalance/ownership change + delayed response

Witness:

- worker W1 owns work;
- ownership changes to W2;
- W1's already-running request receives a delayed response after ownership changed;
- W1 attempts completion or an external effect using stale ownership state.

RabbitMQ explicitly notes that cancelling a consumer does not erase deliveries already in flight; previously unconfirmed deliveries remain unaffected unless the channel is closed. Kafka similarly exposes partition ownership/rebalance as a distinct boundary. citeturn0search10turn0search1

**Required invariant:** cancellation/rebalance is not itself an effect fence; the protected resource must reject stale ownership/authority.

### 4. Correction/reversal + stale evidence

Witness:

- local state reaches terminal-looking S1;
- provider/source later emits a valid correction or reversal C2;
- stale S1 evidence arrives after C2;
- reconciliation must append/interpret the correction without regressing to stale state.

This crosses classes 7, 12, 14, 17 and 20.

**Required invariant:** historical evidence remains immutable; current state is derived with explicit precedence/correction semantics rather than stale overwrites.

### 5. Retention/compaction expiry + redelivery/retry

Witness:

- original operation/message is delayed beyond the normal deduplication or history-retention horizon;
- its old identity returns through redelivery/retry;
- the receiver no longer has the historical dedup record;
- the same identifier may collide with a reused identity or be treated as a new operation.

RabbitMQ quorum queues explicitly track failed delivery attempts and can enforce a delivery limit for poison messages. etcd documents that compaction makes older revisions unavailable and that snapshot restore can require revision bumping plus marking revisions compacted to invalidate stale watchers/caches. citeturn0search0turn0search7

**Required invariant:** retention expiry must never silently convert UNKNOWN historical identity into proof of non-execution or authorize identifier reuse without an explicit incarnation/namespace boundary.

### 6. Recovery/restart + namespace/incarnation reuse

Witness:

- incarnation I1 executes or partially executes O1;
- system restores/restarts from durable state;
- namespace/incarnation I2 reuses identifiers or restores an older observation point;
- delayed I1 message arrives;
- I2 must not accept it as fresh work.

etcd's recovery documentation explicitly describes restore as starting a new logical cluster and supports revision bumping so revisions do not decrease after restore. This is direct evidence that recovery continuity requires more than restoring bytes. citeturn0search7turn0search4

**Required invariant:** recovery must establish a distinguishable incarnation/epoch boundary before accepting delayed work.

### 7. Workflow cancellation/timeout + external effect

Temporal documents that an Activity can time out after being lost or after a worker failure and may subsequently be retried; cancellation is delivered through heartbeats and an Activity may accept or ignore cancellation. The consequence for the adversarial model is important: a control-plane cancellation/timeout does not itself prove that application work stopped at the external boundary. citeturn0search5turn0search9

**Required invariant:** cancellation/timeout creates an epistemic state transition; it is not, by itself, evidence of external-effect absence.

### 8. Poison-message liveness + terminal/UNKNOWN state

RabbitMQ's quorum-queue delivery-limit mechanism is concrete evidence that repeated redelivery can become a liveness problem and therefore needs an explicit terminal/dead-letter policy. citeturn0search0

For Nexo, the safety problem is coupled to epistemics: after repeated failures, the system cannot simply mark the operation FAILED if an external effect may have happened. The correct model therefore needs a distinction such as FAILED-with-evidence versus UNKNOWN-with-reconciliation, while separately bounding endless retry.

**Required invariant:** liveness controls must not collapse uncertainty into a false terminal claim.

### Cross-product result

The eight required cross-products do **not** reveal a missing top-level failure family. Instead, they expose important intersections among the existing 20 classes. The strongest repeated dependency is:

**authority/ownership state + operation identity + incarnation + external-effect uncertainty + durable reconciliation.**

This is a structural observation, not a proof that the 20 classes are complete.

### Minimum independent witness set — provisional

A provisional reduced set can cover the major cross-products without treating every concrete scenario as a separate invariant:

- W1 stale authority retry after generation change;
- W2 serialization abort after external acceptance;
- W3 ownership transfer with old worker delayed completion;
- W4 correction after terminal-looking state plus stale event;
- W5 retention expiry followed by delayed duplicate;
- W6 recovery with old incarnation message arriving in new incarnation;
- W7 timeout/cancellation after external acceptance;
- W8 poison retry exhaustion while external outcome remains UNKNOWN;
- W9 same operation concurrent submissions with conflicting payloads;
- W10 authenticated old-source event from a previous namespace/incarnation;
- W11 multi-account/ledger conservation race under concurrent correction/refund;
- W12 durable local completion followed by downstream publication uncertainty.

This is **provisional coverage**, not a minimality proof. No claim is made that 12 is mathematically minimal.

### New derived invariants

**INV-31 — Retry does not refresh authority:** a new attempt must not inherit permission merely from retry lineage.

**INV-32 — Transaction failure does not negate external effect:** local abort/rollback cannot prove external non-execution.

**INV-33 — Ownership loss is not effect cancellation:** rebalance/cancel requires resource-side rejection of stale work.

**INV-34 — Correction dominates stale observation without deleting history:** current state must explicitly account for later valid corrections.

**INV-35 — Retention expiry is epistemic, not semantic:** absence of old evidence is not proof that old work never occurred.

**INV-36 — Recovery creates an incarnation boundary:** restored state must prevent delayed prior-incarnation work from becoming fresh work.

**INV-37 — Timeout/cancellation preserves uncertainty:** control-plane timeout does not prove external-effect absence.

**INV-38 — Liveness termination must preserve epistemic uncertainty:** dead-letter/retry exhaustion cannot manufacture a FALSE terminal fact.

### Coverage ledger — current

C1 Identity collision/reuse: COVERED
C2 Payload/request binding: COVERED
C3 Duplicate delivery/submission: COVERED
C4 Lost acknowledgement/confirmation: COVERED
C5 Reordering/stale observation: COVERED
C6 Invalid lifecycle/state transition: COVERED
C7 Isolation/concurrency anomaly: COVERED
C8 Transaction abort/retry after partial work: COVERED
C9 Crash/restart/recovery: COVERED
C10 Ownership/rebalance/authority transition: COVERED
C11 Stale authority/fencing: COVERED
C12 External-effect ambiguity/reconciliation: COVERED
C13 Ledger conservation/multi-account invariant: COVERED
C14 Correction/reversal: COVERED
C15 Idempotency retention/reuse: COVERED
C16 Broker/workflow liveness/poison behavior: COVERED
C17 Recovery/restart continuity: COVERED
C18 Namespace/incarnation confusion: COVERED
C19 Authentication/source validity: COVERED
C20 Cross-domain atomicity boundary: COVERED

**Coverage meaning:** each class has at least one adversarial witness in the accumulated research. This does **not** prove pairwise or higher-order completeness, implementation correctness, or formal sufficiency.

### AB104.812R disposition

The required eight cross-products have been researched and mapped. The provisional witness reduction is recorded, but the taxonomy remains **UNFROZEN** because minimum-set independence has not been demonstrated and the cross-product space is not exhaustively enumerated.

**No Nexo architecture implementation. No formal verification claim. No universal security/correctness claim.**

### Exact next action

**AB104.813R:** adversarially challenge the provisional 12-witness set for redundancy and missing higher-order interactions. Specifically test triples involving **authority generation × retention × incarnation**, **correction × stale evidence × reconciliation**, **serialization failure × retry × external effect**, and **ownership change × delayed response × duplicate delivery**. Then produce a dependency/coverage matrix and identify genuinely independent witnesses before any taxonomy freeze.


---

## AB104.813R — HIGHER-ORDER CROSS-PRODUCT CHALLENGE

**Date:** 2026-09-28
**Status:** RESEARCHED / ANALYZED / UNFROZEN / NO IMPLEMENTATION.

### Evidence cross-check

The new source pass strengthens four important conclusions.

**A. Authority generation × retry × fencing**

Kafka provides a concrete implementation witness for persistent producer epochs: a new transactional initialization can advance the producer epoch and fence an older producer, and Kafka's transaction coordinator contains explicit handling for retries around epoch changes. This demonstrates that retry/fencing interactions are not hypothetical. It also remains bounded to Kafka-managed effects; it does not establish arbitrary external-effect fencing. citeturn1search3turn1search8turn1search13

**B. Serialization failure × retry × external effect**

PostgreSQL explicitly requires applications to retry the *complete transaction* after a serialization failure and does not provide an automatic retry facility because correctness depends on application logic. Therefore a transaction retry is a new execution of the database logic; it cannot by itself serve as evidence about an external request that may already have escaped the failed transaction. citeturn1search0 Temporal independently documents the same practical boundary: Activities are at-least-once and can be retried after a worker crash, so external Activities need stable idempotency keys. citeturn0search3turn0search10

**C. Ownership change × delayed response × duplicate delivery**

RabbitMQ explicitly permits deliveries to remain in flight after consumer cancellation, and unacknowledged deliveries can later be requeued/redelivered after connection or channel failure. Its redelivered flag is only a hint that the message may have been seen before; it is not proof that the previous delivery reached a consumer. citeturn1search1turn1search4turn1search6

This produces a three-way witness in which ownership/cancellation, delayed completion and duplicate delivery cannot be collapsed into one boolean state such as DONE/FAILED.

**D. Recovery × retention/compaction × incarnation**

etcd's recovery procedure explicitly creates a new logical cluster identity and recommends revision bumping/marking revisions compacted so consumers and caches do not continue operating from stale revision history. This provides concrete evidence that restored bytes, historical revision continuity, and active consumer validity are separate concerns. citeturn0search1turn0search0

### Higher-order challenge results

#### H1 — authority × retention × incarnation

A delayed operation O1 from incarnation I1 can outlive the deduplication/observation retention horizon and arrive after recovery under I2. If the identity is reused without an incarnation boundary, the receiver can either falsely accept O1 as new or falsely conclude that O1 never occurred.

**Result:** genuine higher-order interaction. Covered jointly by C1, C9, C15, C17 and C18. Not a new top-level class.

#### H2 — correction × stale evidence × reconciliation

A terminal-looking state S1 can be followed by valid correction C2, while delayed S1 evidence arrives later. Treating arrival order as semantic order can regress current state; treating history as mutable destroys auditability.

**Result:** genuine interaction. Covered jointly by C5, C12, C14 and C17. Not a new top-level class.

#### H3 — serialization × retry × external effect

T1 sends or may send external effect E, then aborts locally due to serialization failure. Retry T2 repeats the logical transaction. The database's guarantee concerns its own state; E can remain uncertain outside it.

**Result:** genuine interaction. Covered jointly by C7, C8, C11, C12 and C20. Not a new top-level class.

#### H4 — ownership × delayed response × duplicate delivery

W1 loses ownership while a response or effect from its old delivery remains in flight. W2 or a redelivery path may process the same logical operation. Without a protected effect boundary, both paths can appear locally valid.

**Result:** genuine interaction. Covered jointly by C3, C4, C10, C11 and C20. Not a new top-level class.

### Provisional dependency matrix

| Witness | Identity | Payload | Duplicate | ACK | Isolation | Stale | Lifecycle | Authority | Ownership | External | Retention | Correction | Recovery | Incarnation | Auth | Atomicity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| W1 stale-authority retry | X | X | X | X |  | X | X | X | X | X |  |  |  |  |  | X |
| W2 serialization abort + effect |  | X | X | X | X | X | X | X |  | X |  |  | X |  |  | X |
| W3 ownership transfer + delayed completion | X | X | X | X |  | X | X | X | X | X |  |  | X | X |  | X |
| W4 correction + stale event | X | X | X |  |  | X | X |  |  | X | X | X | X |  | X | X |
| W5 retention expiry + delayed duplicate | X | X | X | X |  | X | X | X |  | X | X |  | X | X |  | X |
| W6 recovery + old incarnation | X | X | X | X |  | X | X | X | X | X | X |  | X | X | X | X |
| W7 timeout/cancel + external effect | X | X | X | X |  | X | X | X | X | X |  |  | X | X |  | X |
| W8 poison exhaustion + UNKNOWN | X | X | X | X |  | X | X | X | X | X | X | X | X | X |  | X |
| W9 concurrent conflicting submissions | X | X | X | X | X | X | X | X |  | X | X |  |  |  | X | X |
| W10 old authenticated source/incarnation | X | X | X | X |  | X | X | X | X | X | X | X | X | X | X | X |
| W11 ledger correction/refund race | X | X | X |  | X | X | X | X |  | X | X | X | X | X | X | X |
| W12 local completion + downstream uncertainty | X | X | X | X |  | X | X | X | X | X | X | X | X | X | X | X |

**Important:** this matrix is a research coverage map, not a formal independence proof. Several rows are deliberately broad because the underlying witness can instantiate multiple concrete races.

### Redundancy findings

The challenge did **not** justify deleting any of the 12 provisional witnesses yet. Some are strongly overlapping, especially W5/W6 and W3/W7, but their epistemic triggers differ: retention/recovery concerns history validity, while cancellation/ownership concerns current authority and effect execution. They should remain separate until a formal dependency reduction demonstrates substitutability.

### New finding: two different meanings of “stale”

The audit identifies a distinction that must remain explicit:

1. **stale authority/ownership** — the actor is no longer authorized to act;
2. **stale evidence/observation** — the information may no longer describe the current state.

They can coexist in one incident but are not the same predicate. Conflating them risks accepting an operation because its evidence is fresh while its authority is stale, or rejecting valid reconciliation because the observation is old even though it is authenticated historical evidence.

### Current disposition

The 20-class taxonomy survives this higher-order challenge without a demonstrated missing top-level family. However, this is still **not a completeness proof**. The dependency matrix shows that the 12-witness provisional set is highly cross-coupled, so the next step must be an explicit reduction test rather than declaring minimality by inspection.

**No architecture implementation. No formal verification. No universal security/correctness claim.**

### Exact next action

**AB104.814R:** perform a structured reduction of the 12 provisional witnesses: for each witness, attempt to remove it and determine whether its required failure predicates remain represented by other witnesses. Preserve any witness whose removal creates a unique uncovered predicate or unique higher-order interaction. Then audit whether any of the 20 classes currently marked COVERED has only a witness that is itself redundant.


---

## AB104.814R — STRUCTURED WITNESS REDUCTION

**Date:** 2026-09-28
**Status:** ANALYZED / PROVISIONAL IRREDUCIBILITY / UNFROZEN / NO IMPLEMENTATION.

### Method

Each provisional witness W1-W12 was challenged by removal. A witness is retained when removing it leaves at least one predicate, boundary, or higher-order interaction that is not represented with the same semantics by the remaining witnesses.

This is a **coverage-reduction test**, not a mathematical minimum-set proof.

### Removal results

| Witness | Removal result | Reason for retention |
|---|---|---|
| W1 stale-authority retry | RETAIN | Unique direct authority-generation × retry × protected-effect interaction. |
| W2 serialization abort + external effect | RETAIN | Unique DB-abort/serialization × external-effect ambiguity boundary. |
| W3 ownership transfer + delayed completion | RETAIN | Exercises ownership transition independently of generic timeout and retention. |
| W4 correction + stale event | RETAIN | Unique correction/reversal × stale evidence × reconciliation ordering. |
| W5 retention expiry + delayed duplicate | RETAIN | Unique expiry of dedup/history evidence while delayed work remains live. |
| W6 recovery + old incarnation | RETAIN | Unique post-recovery incarnation boundary; not equivalent to ordinary retention expiry. |
| W7 timeout/cancel + external effect | RETAIN | Control-plane cancellation/timeout distinct from ownership transfer and DB failure. |
| W8 poison exhaustion + UNKNOWN | RETAIN | Unique liveness termination coupled to unresolved external outcome. |
| W9 concurrent conflicting submissions | RETAIN | Direct identity/payload binding race under concurrency; not reducible to delayed redelivery. |
| W10 authenticated old-source/incarnation | RETAIN | Authentication/source validity combined with historical incarnation; a validly authenticated but obsolete source must still be rejected where required. |
| W11 ledger correction/refund race | RETAIN | Multi-account monetary conservation invariant is semantically distinct from generic state transitions. |
| W12 local completion + downstream uncertainty | RETAIN | Explicit cross-domain atomicity boundary after local durable completion. |

### Why apparent pairs were not merged

**W5 vs W6:** retention expiry concerns loss/expiry of historical deduplication or evidence; recovery creates a new logical incarnation/epoch. They can coincide but neither predicate implies the other.

**W3 vs W7:** ownership transfer is a change in who may act; timeout/cancellation is a control-plane signal about execution. Neither is proof that the other occurred.

**W1 vs W10:** stale authority and source/authentication validity are distinct. A source can be authentic but obsolete, or an actor can possess valid credentials while lacking the current authority generation.

**W2 vs W12:** local transaction abort/retry versus local completion followed by downstream uncertainty exercise opposite sides of the local/external boundary.

### Coverage stress test

All 20 normalized classes retain at least one witness after the attempted reductions. The most weakly isolated classes remain those around recovery, retention, authority, and cross-domain effect ambiguity because several witnesses touch them simultaneously.

No witness removal produced a demonstrated uncovered class or removed one of the four required higher-order interactions from AB104.813R.

### Important limitation

The result is **12 retained provisional witnesses**, not “12 is the minimum possible.” A smaller encoding could exist if one witness were redesigned to cover two unique predicates without losing semantic separation. Establishing mathematical minimality would require a formal set-cover/independence model with explicitly defined predicates and equivalence criteria; that has not been performed.

### New distinction preserved

The reduction confirms three different axes must not collapse:

1. **authority validity** — may this actor act now?
2. **evidence validity** — is this observation authentic and semantically usable as historical evidence?
3. **effect knowledge** — do we know whether the external effect happened?

These axes can be correlated but are not interchangeable.

### AB104.814R disposition

The 12-witness set is **provisionally irreducible under the current semantic predicates**. The 20-class taxonomy remains unfrozen because the next step is to test whether the classes themselves can be safely merged, and whether any uncovered interaction appears when the three axes above are composed.

**No implementation. No formal proof. No universal security/correctness claim.**

### Exact next action

**AB104.815R:** attack the 20-class taxonomy itself using equivalence tests. For each candidate class pair, ask whether one can be removed without losing a distinct safety, liveness, provenance, authority, recovery, or external-effect predicate. Pay special attention to possible merges among identity/incarnation, authority/ownership, stale observation/reconciliation, and retention/history. Do not merge merely because two classes frequently co-occur.


---

## AB104.815R — TAXONOMY EQUIVALENCE / MERGE ATTACK

**Date:** 2026-09-28
**Status:** ANALYZED / NO MERGE ACCEPTED / UNFROZEN / NO IMPLEMENTATION.

### Method

Each plausible class merge was challenged against the current semantics. A merge is accepted only if the two classes have the same relevant predicates, same failure boundary, same remediation/fence semantics, and no witness loses discriminating information. This follows the general lesson from specification-based testing: coverage must be defined against explicit fault models, and test-suite reduction is only meaningful relative to those requirements; structural co-occurrence alone is insufficient. citeturn0search0turn0search8

### Candidate merge results

| Candidate | Result | Reason |
|---|---|---|
| C1 Identity collision/reuse + C18 Namespace/incarnation confusion | **KEEP SEPARATE** | Identity uniqueness is operation-level; incarnation is lifecycle/namespace validity. Reuse can occur without recovery, and incarnation change can occur without identifier reuse. |
| C9 Crash/restart/recovery + C17 Recovery/restart continuity | **KEEP SEPARATE** | Crash/restart describes execution interruption; continuity describes whether durable authority/history/incarnation remains semantically valid across recovery. Same trigger, different predicate. |
| C10 Ownership/rebalance/authority transition + C11 Stale authority/fencing | **KEEP SEPARATE** | Ownership/authority transition is the change event; fencing is the resource-side rejection property. Transition can happen without stale work reaching the resource; fencing can fail despite a correct transition. |
| C5 Reordering/stale observation + C12 External-effect ambiguity/reconciliation | **KEEP SEPARATE** | Stale observation concerns information order/freshness; reconciliation concerns unresolved real-world effect state. One can exist without the other. |
| C12 External-effect ambiguity + C20 Cross-domain atomicity boundary | **KEEP SEPARATE** | Ambiguity is epistemic outcome; atomicity boundary is structural cause/limit. A system can have an atomic boundary without current ambiguity, and ambiguity can arise from ACK loss even where no transaction boundary exists. |
| C15 Idempotency retention/reuse + C18 Namespace/incarnation | **KEEP SEPARATE** | Retention governs how long identity evidence is remembered; incarnation governs which logical world/epoch an identity belongs to. |
| C4 Lost acknowledgement/confirmation + C12 External-effect ambiguity | **KEEP SEPARATE** | Lost ACK is one cause of uncertainty, but external uncertainty also arises from provider async state, timeout, crash windows and reconciliation divergence. |
| C16 Broker/workflow liveness/poison behavior + C8 Transaction abort/retry | **KEEP SEPARATE** | Liveness exhaustion concerns progress/termination; transaction abort concerns atomic local state and retry semantics. |
| C13 Ledger conservation/multi-account invariant + C6 Invalid lifecycle/state transition | **KEEP SEPARATE** | A lifecycle transition may be valid while violating monetary conservation, and a ledger can remain conserved while a lifecycle transition is semantically invalid. |
| C19 Authentication/source validity + C11 Stale authority/fencing | **KEEP SEPARATE** | Authentication establishes source validity; fencing establishes current authorization/epoch validity. An authenticated obsolete source is a valid adversarial witness. |

### Missing-class attack

We also attacked the opposite direction: could a class be absent because another class accidentally absorbed it?

No new top-level class was demonstrated. However, three predicates remain cross-cutting rather than class-local:

1. **incarnation/namespace binding**;
2. **authority-generation binding**;
3. **external-effect epistemic state**.

They recur across multiple classes and therefore should not be represented as single isolated “failure classes.” They behave more like invariants/fields that must be preserved across transitions.

### Important research finding: coverage is not minimality

The literature supports a stricter distinction: a complete test suite is complete only relative to an explicit specification/fault model and its observation assumptions. Test-suite minimization is a set-cover/hitting-set problem only after requirements and equivalence are defined. citeturn0search0turn0search8

Therefore the present claim is intentionally bounded:

**20 classes have survived the current semantic merge attack.**

This does **not** mean 20 is mathematically minimal or universally complete.

### Taxonomy disposition

**No class merge accepted.** The 20-class taxonomy remains the working taxonomy because every tested merge currently loses a distinct predicate, boundary, or semantic interpretation.

The next necessary step is no longer “find another merge by intuition.” It is to construct an explicit **class × predicate matrix**, identify each class's unique predicates, and test the matrix for uncovered cells and accidental duplicate predicates.

### Exact next action

**AB104.816R:** construct the formalized-but-not-yet-formal-proof **20-class × predicate matrix**. Define for each class its safety/liveness/provenance/authority/recovery/external-effect predicates, required evidence, invalidation trigger, protected boundary, and corresponding witness(es). Then attack the matrix for duplicate and uncovered predicates before any freeze decision.

**No architecture implementation. No formal verification. No universal completeness claim.**


---

## AB104.816R — 20-CLASS × PREDICATE MATRIX / GAP ATTACK

**Date:** 2026-09-28
**Status:** ANALYZED / MATRIX PROVISIONAL / NO FREEZE / NO IMPLEMENTATION.

### Research basis

Distributed-system testing literature supports defining coverage relative to an explicit fault model and requirements rather than treating raw test count or structural coverage as completeness. Fault taxonomies are useful precisely because they drive systematic fault injection, while interaction coverage must be specified explicitly when higher-order combinations matter. citeturn0search25turn0search11turn0search24

### Predicate model

The 20 working classes were projected onto seven predicate families:

- **S** = safety / invariant preservation
- **L** = liveness / progress / termination
- **P** = provenance / authenticity / evidence validity
- **A** = authority / ownership / fencing
- **R** = recovery / incarnation continuity
- **E** = external-effect knowledge / reconciliation
- **X** = cross-domain atomicity boundary

This is a semantic analysis aid, not yet a formal specification.

### Matrix

| Class | S | L | P | A | R | E | X | Distinct core predicate |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| C1 operation identity collision | ✓ |  | ✓ | ✓ |  | ✓ | X | operation identity must bind one semantic operation/payload |
| C2 payload-binding conflict | ✓ |  | ✓ | ✓ |  | ✓ | X | same identity cannot silently acquire a different payload |
| C3 duplicate delivery/retry | ✓ | ✓ | ✓ | ✓ |  | ✓ | X | repeated transport/workflow delivery must not duplicate effect |
| C4 acknowledgement ambiguity | ✓ | ✓ | ✓ |  |  | ✓ | X | loss of confirmation does not prove effect absence |
| C5 stale observation/order | ✓ |  | ✓ | ✓ | ✓ | ✓ |  | observation order/freshness must not regress durable truth |
| C6 state-machine transition race | ✓ | ✓ | ✓ | ✓ |  | ✓ | X | legal transition predicate must hold at commit/effect boundary |
| C7 transaction isolation anomaly | ✓ | ✓ |  |  |  | ✓ | X | concurrency control must preserve declared transaction invariant |
| C8 commit/apply separation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | X | committed/accepted state is distinct from applied/effect state |
| C9 authority-generation/fencing race | ✓ |  | ✓ | ✓ | ✓ | ✓ | X | stale authority must be rejected at protected resource boundary |
| C10 worker ownership/rebalance race | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | X | ownership transfer must not permit obsolete worker effect |
| C11 external-effect ambiguity | ✓ | ✓ | ✓ | A |  | ✓ | X | external outcome can remain UNKNOWN despite local state |
| C12 reconciliation consistency/retention | ✓ | ✓ | ✓ |  | ✓ | ✓ | X | reconciliation must preserve history and epistemic uncertainty |
| C13 ledger conservation/multi-account invariant | ✓ |  | ✓ |  |  | ✓ | X | conservation must hold across concurrent multi-record mutation |
| C14 correction/reversal | ✓ |  | ✓ |  | ✓ | ✓ | X | correction is new typed history, not silent mutation of old truth |
| C15 idempotency retention/reuse | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | X | expiry/reuse cannot cause semantic identity collision |
| C16 broker/workflow liveness/poison behavior | ✓ | ✓ | ✓ | ✓ |  | ✓ | X | retry/dead-letter policy must preserve progress without unsafe repetition |
| C17 recovery/restart continuity | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | X | recovery must establish a distinguishable valid continuity boundary |
| C18 namespace/incarnation confusion | ✓ |  | ✓ | ✓ | ✓ | ✓ | X | old incarnation must not be accepted as current incarnation |
| C19 authentication/source validity | ✓ |  | ✓ | ✓ | ✓ | ✓ | X | source authenticity does not imply current authority |
| C20 cross-domain atomicity boundary | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | X | local atomic commit cannot be extended implicitly to arbitrary external effect |

### Matrix findings

**1. No class is currently uncovered.** Every class has at least one declared predicate and an explicit distinct-core predicate.

**2. The matrix exposes heavy overlap.** Most classes touch S, P, E and/or X. This is expected for distributed effects and does not by itself justify merging them.

**3. Three predicates behave as cross-cutting invariants:**

- identity/incarnation binding;
- authority-generation binding;
- epistemic external-effect state (CONFIRMED / FAILED / UNKNOWN, where the semantics permit those states).

They should be tested across multiple classes rather than assigned to a single class.

**4. A genuine matrix gap remains:** higher-order interaction coverage is not encoded by the 20×7 projection. Two classes can each be covered individually while their composition remains untested. This is consistent with combinatorial-testing literature: interaction strength must be specified separately when interaction faults matter. citeturn0search11

### Gap attack

The following interaction cells remain mandatory candidates for explicit coverage:

- authority × retry × identity;
- authority × incarnation × retention;
- correction × stale observation × reconciliation;
- transaction abort × external effect × retry;
- ownership transfer × delayed response × duplicate delivery;
- authentication × obsolete incarnation × authority;
- poison termination × UNKNOWN external effect;
- ledger correction × concurrent refund/capture.

These are not new top-level classes. They are **interaction requirements** over the existing taxonomy.

### Important correction to prior status

The statement “all 20 classes are covered” must now be interpreted narrowly as:

> every working class has at least one mapped witness/predicate.

It does **not** mean pairwise, t-way, temporal, causal, or implementation coverage is complete.

### Disposition

The 20-class taxonomy survives the predicate-matrix attack **without demonstrated duplicate class** and without a demonstrated missing top-level class. However, the taxonomy remains **UNFROZEN** because interaction coverage has not yet been reduced to a defensible independent set.

### Exact next action

**AB104.817R:** construct the interaction matrix over the eight mandatory higher-order interactions above. For each interaction, identify: constituent classes, required temporal ordering, authority/evidence/effect predicates, observable failure condition, minimum witness, and whether an existing W1-W12 witness actually exercises the full interaction. This will test whether the current 12-witness set truly spans the cross-products rather than merely touching each constituent class separately.

**No implementation. No formal verification. No universal completeness/security claim.**

---
## AB104.817R — HIGHER-ORDER INTERACTION MATRIX / W1-W12 SPAN ATTACK

**Date:** 2026-09-28
**Status:** ANALYZED / CROSS-PRODUCT COVERAGE PARTIAL / UNFROZEN / NO IMPLEMENTATION.

### Fresh evidence cross-check

Kafka's producer semantics provide a concrete reference for why identity, retry, session/epoch and fencing remain distinguishable: a transactional.id spans producer sessions, producer fencing can reject an older producer/epoch, and application-level re-sends are not automatically deduplicated merely because Kafka producer idempotence is enabled. These are implementation witnesses, not proof that Nexo should copy Kafka's model. citeturn0search3turn0search11

### Interaction matrix

| Interaction | Constituent classes | Full temporal predicate | Existing witness | Span status |
|---|---|---|---|---|
| I1 authority × retry × identity | C1,C3,C9,C15 | old authority retries same operation after generation changes; protected boundary rejects obsolete attempt without accepting a new semantic operation | W1 | **FULL** |
| I2 authority × incarnation × retention | C9,C15,C17,C18 | identity evidence expires/recovery occurs; old incarnation/authority attempt arrives after retention boundary | W5,W6 | **PARTIAL — no single witness currently spans all three** |
| I3 correction × stale observation × reconciliation | C5,C12,C14 | correction is durably appended; stale observation arrives; reconciliation must not regress/collapse history | W4 | **FULL** |
| I4 transaction abort × external effect × retry | C7,C8,C11,C20 | local transaction failure occurs after external acceptance; retry must not infer absence from rollback | W2 | **FULL** |
| I5 ownership transfer × delayed response × duplicate delivery | C3,C10,C11,C16 | owner changes; old worker response/delivery arrives later and may be duplicated; resource/effect boundary must reject or reconcile safely | W3 | **PARTIAL — W3 lacks explicit duplicate-delivery dimension** |
| I6 authentication × obsolete incarnation × authority | C9,C18,C19 | authentic source from obsolete incarnation presents otherwise valid operation; current authority boundary rejects it | W10 | **FULL** |
| I7 poison termination × UNKNOWN external effect | C11,C16 | retry/dead-letter exhaustion occurs while external effect outcome remains unresolved | W8 | **FULL** |
| I8 ledger correction × concurrent refund/capture | C6,C13,C14 | concurrent monetary transitions and correction must preserve conservation and legal lifecycle state | W11 | **FULL** |

### Critical result

The 12-witness set **does not yet span every required higher-order interaction as a single executable witness**.

Two concrete gaps remain:

- **I2:** W5 and W6 together cover retention and recovery/incarnation, but no current witness proves the complete composition of retention expiry, recovery/incarnation change, and delayed old operation.
- **I5:** W3 covers ownership transfer plus delayed completion, but does not explicitly add duplicate delivery/redelivery to that same temporal sequence.

Therefore the previous statement that the 12 witnesses provisionally span the cross-products would be too strong and is hereby narrowed: **12 witnesses cover all individual classes and most interaction predicates, but two mandatory higher-order interactions remain only partially witnessed.**

### New witness requirements

Rather than immediately increasing the set, the correct next question is whether two existing witnesses can be **refined** without changing their semantic identity:

- **W5/W6 refinement candidate:** combine retention expiry and recovery/incarnation transition into one temporal witness while preserving the distinction between retention and recovery.
- **W3 refinement candidate:** add duplicate delivery to the ownership-transfer/delayed-response sequence.

This is test-model refinement, not implementation.

### Negative result preserved

No evidence currently justifies claiming that W1-W12 is a minimal independent test basis for the 20 classes plus higher-order interactions.

### Disposition

**20-class taxonomy:** UNFROZEN.

**W1-W12:** historical set retained; two interaction gaps explicitly recorded.

**No deletion/overwrite:** this section narrows prior claims without rewriting historical results.

### Exact next action

**AB104.818R:** attempt semantic refinement of W5/W6 and W3 to cover I2 and I5 without adding new top-level witness identities. If refinement changes witness semantics materially, create new witness IDs instead of silently mutating the old definition. Then rerun the eight-interaction matrix and attack whether any resulting witness becomes redundant.

**No implementation. No formal verification. No universal completeness/security claim.**

---
## AB104.818R — SEMANTIC REFINEMENT OF I2/I5

**Date:** 2026-09-28
**Status:** ANALYZED / REFINEMENT ACCEPTED WITH NEW TEMPORAL VARIANTS / UNFROZEN / NO IMPLEMENTATION.

### Evidence cross-check

RabbitMQ documents two facts directly relevant to I5: cancelling a consumer does not erase already in-flight deliveries, and unacknowledged deliveries may later be requeued/redelivered. Its reliability guidance also states that publisher-confirm loss can cause retransmission and duplication, so consumers need idempotent handling or deduplication. citeturn0search0turn0search1turn0search2

This is concrete evidence that ownership/control-plane transition and duplicate delivery are separable temporal events that can overlap.

### I2 refinement: retention × recovery/incarnation × old operation

W5 and W6 cannot be silently merged because their original predicates remain distinct:

- W5 = retention/deduplication evidence has expired while delayed work remains possible.
- W6 = recovery establishes a new incarnation/continuity boundary and old-incarnation work arrives.

To exercise the complete interaction, a new temporal variant is required:

**W13 — Retention-expiry + recovery/incarnation + delayed-old-operation**

Sequence:
1. operation O is accepted under incarnation I1;
2. the deduplication/evidence retention boundary for O expires;
3. system recovers into distinguishable incarnation I2;
4. delayed O from I1 arrives;
5. protected boundary evaluates both identity retention state and incarnation/authority state;
6. result is explicitly classified as reject / reconcile / UNKNOWN according to the model, never inferred solely from absence of retained evidence.

**Why W13 is new:** the combined sequence is not semantically equivalent to W5 or W6 individually. Creating W13 preserves historical witness meanings instead of mutating them.

### I5 refinement: ownership × delayed response × duplicate delivery

W3 remains:
- ownership transfer;
- old worker delayed completion.

RabbitMQ evidence demonstrates that in-flight deliveries can survive cancellation and unacked deliveries can be redelivered, so duplicate delivery must be explicitly represented in the composite sequence. citeturn0search2turn0search1

A new temporal variant is therefore required:

**W14 — Ownership-transfer + delayed-response + duplicate-delivery**

Sequence:
1. worker A owns operation O;
2. ownership transfers to worker B;
3. A's in-flight work continues;
4. B receives/starts O or an equivalent redelivery;
5. A's delayed response arrives, potentially duplicated;
6. protected effect boundary accepts at most the semantically current operation and rejects/reconciles obsolete ownership;
7. final state distinguishes confirmed effect from UNKNOWN where confirmation is incomplete.

**Why W14 is new:** adding duplicate delivery changes the failure interaction, not merely the description of W3.

### Re-run of interaction matrix

| Interaction | Result after refinement |
|---|---|
| I1 authority × retry × identity | FULL — W1 |
| I2 authority × incarnation × retention | **FULL — W13** |
| I3 correction × stale observation × reconciliation | FULL — W4 |
| I4 transaction abort × external effect × retry | FULL — W2 |
| I5 ownership × delayed response × duplicate delivery | **FULL — W14** |
| I6 authentication × obsolete incarnation × authority | FULL — W10 |
| I7 poison termination × UNKNOWN external effect | FULL — W8 |
| I8 ledger correction × concurrent refund/capture | FULL — W11 |

### Consequence for witness count

The working witness set is now **W1-W14**.

This is **not** evidence that 14 is minimal. In fact, W13 and W14 may later be decomposed into smaller tests or shown to be derivable from a stronger formal interaction model. They are retained because the current goal is to avoid claiming coverage that has not actually been exercised.

### New distinction

The reduction work exposes a useful separation:

- **class coverage** = every failure family has a witness;
- **predicate coverage** = each declared invariant/predicate has evidence;
- **interaction coverage** = required combinations have a witness with explicit temporal ordering;
- **implementation coverage** = the actual system demonstrates the expected behavior.

Only the first three are being modeled here, and the third is now provisionally complete for the eight mandatory interactions. **Implementation coverage remains zero because implementation has not started.**

### Disposition

**20 classes:** UNFROZEN.

**W1-W14:** working witness set, not minimal.

**Eight mandatory higher-order interactions:** provisionally FULL under the current semantic model.

**Formal verification:** NOT PERFORMED.

**Universal completeness/security:** NOT CLAIMED.

### Exact next action

**AB104.819R:** attack W13/W14 for redundancy and decomposition. Determine whether either can be reduced to existing witnesses plus a formally specified temporal composition without losing an observable predicate. Then search for additional higher-order interactions generated by the newly explicit dimensions: retention × incarnation × authority, ownership × duplicate × acknowledgement ambiguity, and recovery × delayed external effect.

**No implementation. No silent mutation. No deletion/overwrite.**

---
## AB104.819R — REDUNDANCY ATTACK ON W13/W14 + NEW INTERACTION GENERATION

**Date:** 2026-09-28
**Status:** ANALYZED / W13-W14 RETAINED / NEW INTERACTIONS IDENTIFIED / UNFROZEN / NO IMPLEMENTATION.

### Research cross-check

Combinatorial-testing research treats interaction coverage as an explicit property of a test set, and distributed fault-injection research shows that special timing combinations can expose recovery bugs that naive exploration misses.

RabbitMQ provides a concrete witness for W14: cancelled consumers can still have in-flight deliveries, and unacknowledged deliveries can be requeued/redelivered. Kafka likewise distinguishes transactional identity/session continuity from application-level re-sends.

### W13 redundancy/decomposition attack

**Question:** Can W13 be removed and represented by W5 + W6 without losing the required interaction?

**Result: NO, under the current interaction specification.**

W5 proves retention expiry with delayed work. W6 proves recovery/incarnation transition with old-incarnation work. Neither alone specifies the combined temporal ordering:

retention expiry -> recovery/incarnation transition -> delayed old operation.

Because the protected boundary must evaluate both evidence-retention state and incarnation/authority state in the same causal sequence, W13 remains a distinct interaction witness.

This does not prove W13 is mathematically necessary in every future formal model; it establishes only that the current explicit interaction requirement is not covered by W5 or W6 separately.

### W14 redundancy/decomposition attack

**Question:** Can W14 be removed and represented by W3 plus generic duplicate-delivery semantics?

**Result: NO, under the current interaction specification.**

W3 establishes ownership transfer plus delayed obsolete work. Generic duplicate delivery establishes duplication independently. But I5 requires duplicate delivery to occur inside the ownership-transition/delayed-response window. The causal placement matters because ownership may change between original delivery and duplicate delivery.

W14 therefore remains a distinct interaction witness.

### New interaction generation

The attack produced three additional candidate interactions:

**I9 — retention × incarnation × authority**
- retention evidence expires;
- incarnation changes;
- authority generation changes;
- delayed old operation arrives;
- acceptance must not derive current authority solely from retained identity evidence.

**I10 — ownership × duplicate × acknowledgement ambiguity**
- ownership transfers;
- old and new deliveries overlap;
- acknowledgement/confirmation is lost;
- effect state may become UNKNOWN;
- retry must not create an additional effect.

**I11 — recovery × delayed external effect**
- local recovery/restart occurs;
- a pre-recovery external request may already have been accepted;
- local state lacks definitive confirmation;
- post-recovery retry/reconciliation must distinguish old operation/incarnation from a new semantic operation.

### Why these are not new classes

I9-I11 are compositions of existing classes. They are interaction requirements, not new top-level failure families.

### Coverage status

The eight previous interactions remain provisionally covered. The three newly generated interactions are **UNTESTED**:

- I9 = UNTESTED
- I10 = UNTESTED
- I11 = UNTESTED

Therefore the prior statement that the interaction set was complete is narrowed: the eight explicitly required interactions are covered, but the interaction-generation attack has produced three additional candidates that must be evaluated before freeze.

### Disposition

**W1-W14:** retained; no redundancy demonstrated under current semantics.

**20 classes:** UNFROZEN.

**Interaction ledger:** 8 covered + 3 newly identified/untested.

**No implementation. No formal verification. No universal completeness/security claim.**

### Exact next action

**AB104.820R:** specify I9-I11 with temporal predicates and determine whether each is independent or derivable from existing interactions. Then search systematically for additional interaction candidates using the seven predicate axes and the 20-class matrix, rather than adding interactions by intuition alone.

**No deletion/overwrite. No silent witness mutation.**

---
## AB104.820R — I9-I11 FORMAL INTERACTION SPECIFICATION / BOUNDED CLOSURE ATTACK

**Date:** 2026-09-28
**Status:** ANALYZED / BOUNDED INTERACTION MODEL EXPANDED / UNFROZEN / NO IMPLEMENTATION.

### Research basis

NIST distinguishes ordinary combinatorial coverage from ordered combinations for stateful systems: when behavior depends on system state, the order of inputs can be decisive and interaction strength/order must be specified explicitly. FaultFuzz likewise reports that special timing combinations can expose distributed recovery bugs that random or brute-force exploration may miss. citeturn0search11turn0search3

### I9 — retention × incarnation × authority

Required ordered predicate:

R0: operation O has identity evidence under incarnation I1.
R1: retention for the relevant dedup/evidence record expires.
R2: recovery or authority transition establishes I2/G2, distinguishable from I1/G1.
R3: delayed O from I1/G1 arrives.
R4: protected boundary evaluates incarnation and authority independently of whether old identity evidence is still retained.
R5: outcome is explicit: reject, reconcile, or UNKNOWN according to the declared state machine; absence of retained evidence is not treated as proof that O never existed.

**Result:** I9 is a genuine interaction requirement. It is not equivalent to I2 because I2 did not require the authority-generation change as a distinct predicate.

**Witness:** W13 is retained.

### I10 — ownership × duplicate × acknowledgement ambiguity

Required ordered predicate:

R0: worker A owns O.
R1: ownership transfers to B.
R2: an in-flight delivery/response from A remains possible.
R3: O is delivered again to B or another eligible consumer.
R4: one confirmation/acknowledgement is lost or delayed.
R5: the system must prevent an additional semantic effect while preserving UNKNOWN when effect knowledge is insufficient.

**Result:** I10 is genuine. It combines ownership transition, duplicate delivery and confirmation ambiguity in one causal window.

**Witness status:** no existing W1-W14 currently proves all five predicates in one sequence. W14 covers R0-R3, but not explicit lost acknowledgement at R4.

Therefore **I10 = PARTIAL**, not FULL.

### I11 — recovery × delayed external effect

Required ordered predicate:

R0: operation O is initiated before recovery.
R1: external provider may accept O.
R2: local worker/process recovers before definitive confirmation is durable.
R3: post-recovery state establishes a distinguishable incarnation.
R4: retry/reconciliation encounters the old operation.
R5: system must not infer external absence from local pre-recovery uncertainty or create a second semantic operation merely because the local record is incomplete.

**Result:** I11 is genuine and distinct from W2. W2 covers transaction failure after external acceptance, but not the recovery/incarnation boundary.

**Witness status:** no existing W1-W14 currently proves all six predicates in one sequence. **I11 = PARTIAL.**

### Interaction-generation boundary

A systematic search over the seven predicate axes does not justify enumerating every possible Cartesian product. Many combinations are semantically invalid, redundant, or subsumed by stronger ordered interactions. NIST's ordered-combination work supports explicitly specifying which ordered interactions are relevant rather than assuming all combinations are required. citeturn0search11

For the current model, the newly explicit dimensions generate at least two additional mandatory interaction candidates:

- **I12 — authentication × incarnation × acknowledgement ambiguity:** authentic obsolete source, incarnation transition, lost confirmation.
- **I13 — correction × recovery × delayed external effect:** correction/reversal becomes durable around a recovery boundary while an older external operation remains unresolved.

These are currently **UNTESTED**.

### Closure status

Current interaction ledger:

- I1-I8: provisionally FULL
- I9: FULL — W13
- I10: PARTIAL
- I11: PARTIAL
- I12: UNTESTED
- I13: UNTESTED

Therefore there is **no defensible interaction closure yet**.

### Important methodological result

We now have evidence that a fixed list of hand-picked interactions can keep growing when new dimensions are introduced. The correct next phase is therefore not indefinite manual enumeration.

The next phase must define a **bounded interaction grammar**:

1. allowed predicate axes;
2. allowed temporal relations;
3. admissible class combinations;
4. semantic invalid/duplicate combination rules;
5. explicit stopping criterion;
6. coverage metric over the resulting finite interaction universe.

Until that grammar exists, “complete interaction coverage” is not a well-defined claim.

### Disposition

**20 classes:** UNFROZEN.

**W1-W14:** retained.

**Interaction closure:** NOT ACHIEVED.

**Formal proof:** NOT PERFORMED.

**Implementation:** NOT STARTED.

### Exact next action

**AB104.821R:** define the bounded interaction grammar and finite interaction universe before adding more witnesses. Use ordered predicates, admissible combinations and explicit invalid-combination rules. Then calculate which interactions are mandatory, redundant, or impossible under the model. This is the prerequisite for a defensible coverage percentage and eventual freeze.

**No implementation. No deletion/overwrite. No universal completeness/security claim.**

---
## AB104.821R — BOUNDED INTERACTION GRAMMAR

**Date:** 2026-09-28
**Status:** ANALYZED / BOUNDED MODEL DEFINED / FINITE UNIVERSE ENUMERATION PENDING / UNFROZEN / NO IMPLEMENTATION.

### Research basis

NIST treats stateful interaction coverage as ordered coverage because event order can determine resulting state and failure. Its sequence-covering work also supports defining a finite interaction target instead of exhaustively enumerating every possible event sequence. citeturn0search0turn0search9

### Working grammar

Define the interaction model as G = (A,T,Q,B,O,E):

- A = predicate axes: safety, liveness, provenance, authority, recovery, external-effect knowledge, cross-domain boundary.
- T = temporal relations: BEFORE, AFTER, OVERLAPS, DURING, CONCURRENT, RETRY-AFTER, RECOVERY-BETWEEN.
- Q = admissible arity: 2 or 3 semantic dimensions by default; arity 4+ requires a demonstrated causal dependency that cannot be represented by an ordered 3-way interaction.
- B = protected acceptance/effect boundary.
- O = observable outcome such as ACCEPT, REJECT, RECONCILE, FAILED, CONFIRMED, UNKNOWN, or an explicit terminal state.
- E = evidence condition at the decision point.

### Exclusion rules

A candidate is excluded when it has no distinct temporal/causal relation, is semantically equivalent to an existing interaction, is implied by another under the model, cannot reach an observable protected boundary, or is only a duplicate projection of a stronger ordered interaction.

These are model rules, not claims about every distributed system.

### Current admissible families

The current model explicitly admits pairwise families such as identity/authority, identity/incarnation, authority/ownership, observation/reconciliation, acknowledgement/effect, recovery/incarnation, retention/identity, correction/history, transaction/external effect, and authentication/authority.

It also admits the current mandatory ordered 3-way families I1-I13, including the newly identified I10-I13.

### Arity rule

We do not enumerate every higher Cartesian product. A higher-arity interaction becomes mandatory only when the additional dimension changes the protected-boundary decision or adds a causal predicate that cannot be preserved by a lower-arity ordered interaction.

### Coverage metric

Coverage will be defined only after enumeration:

**covered admissible interactions / total admissible interactions**

with states FULL, PARTIAL, UNTESTED, EXCLUDED, DUPLICATE, or IMPOSSIBLE.

No percentage is reported until the denominator is explicitly enumerated.

### Important limitation

The grammar is a bounded modeling convention, not a formal completeness proof. The finite universe has not yet been exhaustively generated or independently checked.

### Disposition

20 classes remain UNFROZEN.
W1-W14 remain retained.
Interaction grammar is provisionally defined.
Finite-universe enumeration is PENDING.
No implementation and no formal verification.

### Exact next action

**AB104.822R:** enumerate the admissible interaction universe generated by G, deduplicate semantic equivalents, record exclusions with reasons, and map each surviving interaction to W1-W14 or identify a missing witness. Only then calculate a defensible coverage denominator.

**No deletion/overwrite. No silent witness mutation.**

---
## AB104.822R — FINITE INTERACTION UNIVERSE ENUMERATION

**Date:** 2026-09-28
**Status:** ENUMERATION V1 / UNFROZEN / NO IMPLEMENTATION.

### Research cross-check

NIST's combinatorial coverage work supports measuring the portion of an explicitly defined interaction space covered by a test set; for stateful systems, ordered t-way combinations are needed because the order can affect reachable state and failure. citeturn0search4turn0search0

This means our denominator must be defined from the model, not inferred from the number of witnesses.

### Enumeration V1

Using the AB104.821R grammar, the admissible interaction universe is decomposed into four finite buckets:

**U1 — Core pairwise relations**
1 identity × authority
2 identity × incarnation
3 authority × ownership
4 observation × reconciliation
5 acknowledgement × effect
6 recovery × incarnation
7 retention × identity
8 correction × history
9 transaction × external effect
10 authentication × authority

**U2 — Mandatory ordered 3-way interactions**
I1 authority × retry × identity
I2 authority × incarnation × retention
I3 correction × stale observation × reconciliation
I4 transaction abort × external effect × retry
I5 ownership × delayed response × duplicate delivery
I6 authentication × obsolete incarnation × authority
I7 poison termination × UNKNOWN external effect
I8 ledger correction × concurrent refund/capture
I9 retention × incarnation × authority
I10 ownership × duplicate × acknowledgement ambiguity
I11 recovery × delayed external effect
I12 authentication × incarnation × acknowledgement ambiguity
I13 correction × recovery × delayed external effect

**U3 — Required temporal variants**

For every interaction in U1/U2, a temporal variant is admissible only when changing the order changes either:
(a) reachable state,
(b) authority validity,
(c) evidence validity, or
(d) external-effect knowledge.

This prevents multiplying equivalent permutations that cannot alter the protected-boundary decision.

**U4 — Escalation candidates**

A 4-way candidate is admitted only when removal of one dimension causes loss of a causal predicate that cannot be represented by an ordered 3-way interaction. No U4 candidate is frozen by this revision.

### Semantic deduplication

The following are NOT treated as independent interactions merely because their names differ:

- stale authority vs obsolete authority when the same authority-generation predicate is tested;
- retry vs redelivery when the same operation identity and boundary semantics apply;
- delayed response vs lost acknowledgement when no distinct state/evidence condition is introduced;
- recovery vs restart when no new incarnation/epoch boundary is created.

However, these can become distinct when their timing introduces a different causal boundary. This is why W5/W6, W3/W7, W13/W14 remain separate.

### Current universe count

The frozen count is **not yet declared**.

Reason: U1/U2 are enumerated conceptually, but U3 temporal instantiations still require explicit admissibility evaluation against each candidate. A premature numeric denominator would be another overclaim.

### Witness mapping status

- I1 → W1
- I2 → W13
- I3 → W4
- I4 → W2
- I5 → W14
- I6 → W10
- I7 → W8
- I8 → W11
- I9 → W13
- I10 → W14 (PARTIAL: explicit ACK ambiguity still required)
- I11 → W2 (PARTIAL: explicit recovery/incarnation boundary still required)
- I12 → no witness yet
- I13 → no witness yet

### New important finding

**W13 currently covers two distinct interaction requirements (I2 and I9), but that does not make I2 and I9 duplicates.**

I2 emphasizes retention + authority/incarnation interaction.

I9 emphasizes the protected-boundary authority decision after retention and incarnation transition.

Their semantic predicates overlap, but their decision-point emphasis differs. They remain separate until a formal equivalence rule proves otherwise.

### Disposition

**U1:** conceptually enumerated.

**U2:** I1-I13 enumerated.

**U3:** admissibility rules defined but not instantiated exhaustively.

**U4:** no candidate frozen.

**Coverage denominator:** NOT FROZEN.

**I12/I13:** still UNTESTED.

**W1-W14:** retained.

### Exact next action

**AB104.823R:** instantiate U3 temporal variants against U1/U2, explicitly enumerate only orderings that change state/authority/evidence/effect knowledge, then deduplicate and produce the first numeric finite denominator. Separately determine whether I12 and I13 require W15/W16 or can be represented by existing witnesses without loss of causal predicates.

**No deletion/overwrite. No silent witness mutation.**

---
## AB104.823R — U3 TEMPORAL INSTANTIATION + I12/I13 REDUCTION

**Date:** 2026-09-28
**Status:** ANALYZED / TEMPORAL UNIVERSE PARTIALLY ENUMERATED / I12-I13 STILL UNFROZEN / NO IMPLEMENTATION.

### Research basis

NIST explicitly notes that fault detection in state-based systems can depend on the specific order of inputs, and provides ordered t-way and sequence-covering methods for measuring relevant ordered combinations. This supports treating temporal ordering as part of the interaction definition rather than multiplying every possible permutation. citeturn0search0turn0search14

### U3 admissibility rule

For each U1/U2 interaction, temporal variants are retained only if changing the order can change at least one of:

1. reachable state;
2. authority/ownership validity;
3. evidence freshness/authenticity/availability;
4. knowledge of an external effect;
5. terminal/reconciliation state.

A mere lexical permutation is not a new interaction.

### Temporal relation normalization

The raw grammar relations were reduced to the following causal forms:

- **PRE:** A must occur before B to create the vulnerable state.
- **POST:** B must occur after A to expose stale/obsolete state.
- **OVERLAP:** A remains in flight while B changes ownership/authority/state.
- **RETRY:** same operation is reintroduced after an uncertain outcome.
- **RECOVERY:** a new incarnation/epoch exists between two related events.
- **CORRECTION:** a later authoritative event changes the interpretation of an earlier state.

This is a semantic normalization, not a claim that all distributed systems expose these relations identically.

### Instantiated mandatory temporal variants

The currently admissible ordered interactions are:

- I1: authority → retry → identity
- I2: operation identity → retention expiry → incarnation/authority transition → delayed old operation
- I3: correction → stale observation → reconciliation
- I4: transaction abort → external effect acceptance → retry
- I5: ownership transfer → delayed response → duplicate delivery
- I6: authentication → obsolete incarnation → authority decision
- I7: poison retry exhaustion → UNKNOWN external effect
- I8: ledger correction/refund/capture concurrency
- I9: retention expiry → incarnation transition → authority decision
- I10: ownership transfer → duplicate delivery → acknowledgement ambiguity
- I11: recovery → delayed external effect → retry/reconciliation
- I12: authentication → incarnation transition → acknowledgement ambiguity
- I13: correction → recovery → delayed external effect

### Important result: U3 is finite only after semantic projection

If every raw temporal permutation were retained, the universe would expand combinatorially without a defensible causal stopping rule. After projection onto PRE/POST/OVERLAP/RETRY/RECOVERY/CORRECTION, the mandatory ordered families are finite at the current model boundary.

However, this does **not** yet prove that every possible real-world temporal relation has been represented.

### I12 reduction attack

I12 requires all three dimensions simultaneously:

**authentication validity + obsolete incarnation + acknowledgement ambiguity.**

Existing W10 covers authentication + obsolete incarnation + authority, but does not contain the ACK ambiguity state. W14 contains duplicate delivery + ownership transfer + delayed acknowledgement, but does not establish authentication/incarnation validity.

**Result: W10 + W14 cannot be merged into a single witness without losing a required predicate.**

Therefore I12 remains **UNTESTED** and requires a new witness candidate **W15** unless a later witness is explicitly shown to preserve all three predicates.

### I13 reduction attack

I13 requires:

**correction + recovery/incarnation transition + delayed external effect.**

W4 covers correction + stale observation + reconciliation, but not recovery plus an in-flight external effect.

W2 covers transaction failure + external acceptance + retry, but not correction/recovery.

W13 covers retention + recovery/incarnation + delayed old operation, but not a correction event affecting interpretation of the external effect.

No existing witness preserves all required predicates.

**Result: I13 remains UNTESTED and requires new witness candidate W16.**

### Candidate W15

**W15 — AUTHENTICATED OBSOLETE INCARNATION + ACK AMBIGUITY**

R0 operation/event is authenticated under source S1.
R1 S1/incarnation I1 becomes obsolete.
R2 a new incarnation I2 is active.
R3 a valid message from I1 arrives or is redelivered.
R4 its ACK/confirmation is lost, delayed, or ambiguous.
R5 protected boundary must distinguish source authenticity from current authority/incarnation and must not infer effect absence from ACK uncertainty.

### Candidate W16

**W16 — CORRECTION + RECOVERY + DELAYED EXTERNAL EFFECT**

R0 operation O begins under incarnation I1.
R1 external provider may accept O.
R2 local recovery creates I2 before definitive external outcome is durable.
R3 a correction/reversal/authoritative provider event changes the interpretation of O.
R4 delayed result from I1 arrives after recovery/correction.
R5 boundary must preserve history and reconcile without treating local uncertainty as proof of external absence or silently creating a second semantic operation.

### Current coverage disposition

I1-I9: FULL under current witness mapping.

I10: PARTIAL — W14 lacks explicit ACK ambiguity as a separately represented predicate.

I11: PARTIAL — W2 lacks explicit recovery/incarnation boundary.

I12: UNTESTED — W15 candidate.

I13: UNTESTED — W16 candidate.

### Important methodological boundary

W15/W16 are **candidate witnesses**, not yet accepted as required additions. They must undergo the same redundancy/equivalence attack used for W1-W14.

### Finite denominator status

Still **NOT FROZEN**. The semantic temporal projection gives a finite candidate family, but the complete U3 instantiation and equivalence/exclusion audit are not yet independently enumerated.

### Exact next action

**AB104.824R:** attack W15 and W16 for redundancy; then audit every I1-I13 witness mapping against the normalized temporal predicates and determine whether any mapped interaction is actually only PARTIAL. Do not freeze the denominator until this audit is complete.

**No deletion/overwrite. No silent witness mutation.**
