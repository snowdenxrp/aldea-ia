# NEXO AB104.781R — replica failover, quorum, stale leader, and effect acceptance
Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Scope
Study multi-replica failover: divergent/stale replicas, leader change, quorum, old leader resumption, and whether leadership alone prevents stale effects.

## Findings

1. Raft quorum is an effect-commit boundary, not merely leader observation. etcd/raft documents quorum-based linearizable reads and automatic leader step-down when quorum is lost. etcd failure documentation states writes during leader election cannot be processed; writes sent to the old leader but not yet committed may be lost, while committed writes are not lost. citeturn0search0turn0search3

2. A replica can lag without that alone being a safety failure. The critical boundary is whether a stale replica can independently make an effect durable or authoritative without consensus. Raft implementations define commitment as replication to a majority before applying entries to state machines. citeturn0search10

3. An old leader can remain alive. etcd/raft uses quorum checking and higher-term state to step down stale leaders. Therefore process liveness and authority validity are separate. citeturn0search0turn0search5

4. Higher terms fence stale participants. The etcd/raft documentation says incoming messages pass through a common Step path that checks terms and stale log state; higher-term messages cause an old leader/candidate to revert appropriately. citeturn0search5

5. etcd's election API explicitly exposes a LeaderKey that can be used to transactionally guard API requests on leadership still being held. This is stronger than observing who the leader is. citeturn0search4turn0search8

6. Lease-based observation is weaker than quorum-confirmed state. etcd/raft warns that lease-based linearizability depends on clock assumptions; ReadOnlySafe instead communicates with quorum. citeturn0search0

7. Critical external-resource gap: if an old leader directly calls an external database, device, or API after losing consensus leadership, Raft quorum safety does not automatically fence that external side effect. The external resource needs its own epoch/fencing validation or the effect must pass through an atomic consensus-protected intermediary.

## Candidate invariant
An authority transition is not sufficient by itself. After transition to generation g2, every protected effect path must either participate in the same consensus commit boundary that establishes g2, or independently reject operations carrying authority/incarnation state older than g2.

## Evidence ledger
RAFT_QUORUM_REQUIRED_FOR_COMMITTED_WRITE SOURCE CONFIRMED
UNCOMMITTED_OLD_LEADER_WRITE_MAY_BE_REWRITTEN SOURCE CONFIRMED
COMMITTED_WRITE_NOT_LOST_ON_LEADER_CHANGE SOURCE CONFIRMED
STALE_REPLICA_STATE_CAN_EXIST SOURCE CONFIRMED BY RAFT MODEL
OLD_LEADER_PROCESS_MAY_REMAIN_ALIVE SOURCE CONFIRMED
HIGHER_TERM_FENCES_STALE_PARTICIPANT SOURCE CONFIRMED
LEADERSHIP_CAN_BE_TRANSACTIONALLY_GUARDED SOURCE CONFIRMED
LEASE_BASED_READS_DEPEND_ON_CLOCK_ASSUMPTIONS SOURCE CONFIRMED
COORDINATOR_LEADERSHIP_ALONE_FENCES_ARBITRARY_EXTERNAL_EFFECT FALSE
EXTERNAL_RESOURCE_FENCE_REQUIRED_FOR_EXTERNAL_SIDE_EFFECTS SOURCE-DERIVED
FORMAL_UNIVERSAL_PROOF NOT ESTABLISHED
EXECUTED_MULTI_REPLICA_EXTERNAL_RACE BY AUDIT NO
NEXO_IMPLEMENTATION NOT PERFORMED

## Exact next action
AB104.782R: inspect concrete failover and stale-replica rejection tests in etcd/Raft, including quorum loss, leader transfer, higher-term messages, delayed replication, and recovery. Determine which properties are directly tested versus inferred from protocol source. Then contrast with a resource whose mutation is outside the Raft state machine.