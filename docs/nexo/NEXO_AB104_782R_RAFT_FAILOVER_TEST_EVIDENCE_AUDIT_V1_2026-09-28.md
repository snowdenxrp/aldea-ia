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
