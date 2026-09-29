# NEXO AB104.780R — failover, leader change, and stale-authority fencing

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Scope

Study whether leader/failover transitions create a window in which an old authority can continue producing effects, and identify concrete epoch/generation checks and tests that fence stale participants.

## Evidence A — Kafka broker epoch fencing

Kafka's KIP-380 defines a broker generation/epoch carried by control requests. A broker receiving a request with an outdated broker epoch returns STALE_BROKER_EPOCH; the mechanism was specifically introduced to detect outdated requests and bounced broker generations. citeturn0search5

Current Kafka source also contains the explicit stale-broker-epoch check before processing a LeaderAndIsr request: when the request epoch is smaller than the broker's current epoch, the request is rejected rather than applied. citeturn0search11

This is direct evidence of receiver-side fencing during restart/re-registration, not merely leader observation.

## Evidence B — Kafka leader epochs

Kafka's protocol defines current_leader_epoch as an epoch used to fence consumers/replicas with old metadata. A lower supplied epoch produces FENCED_LEADER_EPOCH; a higher unknown epoch produces UNKNOWN_LEADER_EPOCH. citeturn0search12

Thus the receiver distinguishes three states:

- supplied epoch < current: stale and reject;
- supplied epoch == current: potentially valid;
- supplied epoch > current: receiver lacks the newer authority state.

The third state is important for Nexo: "not stale" is not equivalent to "known current authority."

## Evidence C — real failure/race history

Kafka issue KAFKA-14154 documents a controller soft-failure where an old controller continued receiving AlterPartition requests after another controller had become authoritative. The stale controller had not yet realized it was no longer controller. The newer validation returned FENCED_LEADER_EPOCH instead of allowing the old controller to process the request. citeturn0search1

Kafka issue KAFKA-7786 documents another concrete race involving an outstanding request carrying an older leader epoch while partition state had already advanced to a newer epoch. The stale request was answered with FENCED_LEADER_EPOCH, and the test scenario occurred during broker bouncing and partition reassignment. citeturn0search0

These are useful because they show that epoch fencing must handle messages already in flight, not only newly generated requests.

## Evidence D — Kafka tests

Current Kafka controller tests explicitly test broker fencing and stale broker epochs. The ReplicationControlManager test suite contains a test named testAlterPartitionShouldRejectBrokersWithStaleEpoch and constructs an AlterPartition request using brokerEpoch - 1, expecting StaleBrokerEpochException. The same test suite exercises fencing/unfencing broker state and re-registration. citeturn0search7

Current QuorumController tests also wait for brokers to become fenced and then assert that fenced brokers are no longer unfenced before continuing with cluster operations. citeturn0search6

This gives actual test evidence for the state transition, although these tests do not by themselves prove that every arbitrary external side effect is fenced.

## Failover model extracted

The studied systems support this sequence:

F0 = old authority A exists
F1 = new authority B / newer epoch becomes committed
F2 = old participant A receives or attempts an operation carrying old epoch
F3 = protected receiver compares supplied epoch against current authority
F4 = stale operation rejected

The critical safety boundary is F3/F4, not merely F1.

A stale process may continue running after F1. Safety does not require immediate physical termination if every protected effect path rejects its stale epoch.

## Split-brain distinction

Leader election alone is not enough to establish effect safety.

The stronger pattern is:

authority transition
→ durable/new epoch
→ operation carries epoch
→ effect receiver validates epoch
→ stale epoch rejected

If the transition exists only in the coordinator but an old leader can still mutate the protected resource without presenting a checked epoch, split-brain protection is incomplete.

## Important negative finding

The Kafka evidence is strongest for Kafka-managed control/data paths. It does NOT establish a universal guarantee for arbitrary external resources. A Nexo effect such as an external API call, physical device action, or independently stored database mutation needs its own acceptance/fencing boundary unless the operation is routed through an intermediary that provides that guarantee.

## Evidence ledger

BROKER_EPOCH_FENCING_SOURCE_CONFIRMED
LEADER_EPOCH_STALE_REJECTION_SOURCE_CONFIRMED
IN_FLIGHT_STALE_EPOCH_RACE_REAL_FAILURE_EVIDENCE_CONFIRMED
STALE_BROKER_EPOCH_TEST_SOURCE_CONFIRMED
BROKER_FENCING_STATE_TEST_SOURCE_CONFIRMED
NEW_EPOCH_MEANS_OLD_PROCESS_IMMEDIATELY_STOPS_FALSE
COORDINATOR_ONLY_FENCE_SUFFICIENT_FOR_EXTERNAL_EFFECTS_FALSE
ARBITRARY_EXTERNAL_EFFECT_FENCING_NOT_ESTABLISHED
FORMAL_UNIVERSAL_PROOF_NOT_ESTABLISHED
NEXO_IMPLEMENTATION_NOT_PERFORMED

## Nexo implication

authority_epoch and fencing_epoch should not be treated as mere metadata labels. For a protected namespace, the authoritative transition must be coupled to an effect-side acceptance predicate that rejects older generations.

A candidate formulation:

For protected namespace R, once generation g2 is authoritative, an operation carrying generation g1 < g2 cannot cross the protected effect acceptance boundary.

This still needs refinement around:
- multiple resource replicas;
- failover during an in-flight effect;
- persistence of the acceptance floor;
- quorum loss;
- recovery from snapshots;
- and external effects that cannot participate in the same atomic commit.

## Exact next action

AB104.781R: study failover with multiple resource replicas and delayed replication. Focus on whether a stale replica can accept an old fenced operation after leadership changes, and what quorum/replica acknowledgment semantics are required before an authority transition can safely reclaim the namespace.
