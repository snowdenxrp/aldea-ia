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