# NEXO AB104.770R — Fencing failure modes: epoch persistence, delayed operations, failover

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation; no executed ACL race.

## Scope

Study failure modes around a real epoch fence in Kafka and contrast them with ZooKeeper's consistency/lock semantics. Focus on delayed stale operations, retries, failover, and persistence of the fencing state.

## Findings

1. Kafka producer fencing is not merely an in-memory comparison. TransactionMetadata contains producerId/producerEpoch state and prepares epoch-fence transitions that are written through the transaction log. Current source explicitly handles the case where an epoch fence log write fails: it records `hasFailedEpochFence` and avoids incrementing the epoch again until the previous fence state is safely handled. This is evidence that the fence's correctness depends on durable state transitions, not only on a local counter.

2. The TransactionCoordinator validates the producer identity/epoch against coordinator-owned TransactionMetadata and returns `PRODUCER_FENCED` when the request's epoch is stale or mismatched. The validation occurs inside the transaction metadata state machine before the operation transition is accepted.

3. Kafka's producer API documents that an old producer epoch can cause `InvalidProducerEpochException`, while a producer fenced by another instance receives `ProducerFencedException`. Thus stale delayed operations are explicitly rejected rather than silently accepted after a newer producer takes ownership.

4. Retry semantics matter. Kafka's source distinguishes legitimate retries from stale epochs and preserves previous producer information for some recovery cases. Therefore a fencing token cannot simply be treated as a monotonically increasing number with no protocol around retry ambiguity.

5. ZooKeeper demonstrates a different failure boundary: writes are linearizable, while ordinary reads can be stale. Its documentation explicitly warns that `sync` does not itself provide a strict up-to-date guarantee in every theoretical scenario. This is direct evidence that observing replicated state and obtaining a strong synchronization/linearization point are different operations.

6. ZooKeeper lock recipes use ephemeral/sequential nodes and watches for lock ownership/order. Those mechanisms coordinate ownership, but the recipe itself is not equivalent to an arbitrary side-effect fence: a protected resource must still honor the ownership protocol. Therefore a lease/lock observation alone cannot prove that an external effect is fenced.

## Failure-mode table

| Failure mode | Kafka producer epoch evidence | Research lesson |
|---|---|---|
| delayed stale operation | rejected when epoch is stale | stale messages need explicit rejection |
| concurrent successor | successor bumps/fences epoch | ownership transition must change authority state |
| fence persistence failure | `hasFailedEpochFence` handling | fence state must survive/coordinate with durable commit |
| retry after timeout | special retry/previous-epoch handling | timeout != proof that operation did not execute |
| replica/read staleness | ZooKeeper documents stale reads | observation != linearization/fence |
| lock ownership loss | ZK ephemeral node/watches | external effect must actually check/obey fence |

## Important limits

This is not evidence that Kafka ACL revocation has the same guarantees. Producer fencing is a separate protocol. The comparison is useful because it gives a tested real-world example of how stale authority is rejected at a protected state transition.

No deterministic ACL revocation race was executed.
No claim of Kafka ACL vulnerability is made.

## Evidence ledger

DURABLE_PRODUCER_EPOCH_FENCE_STATE: SOURCE CONFIRMED
STALE_PRODUCER_EPOCH_REJECTION: SOURCE CONFIRMED
FAILED_FENCE_TRANSITION_HANDLING: SOURCE CONFIRMED
RETRY/PREVIOUS_EPOCH_SEMANTICS: SOURCE CONFIRMED
ZK_READS_CAN_BE_STALE: SOURCE CONFIRMED
ZK_WRITES_LINEARIZABLE: SOURCE CONFIRMED
LOCK_RECIPE_AS_GENERIC_EXTERNAL_EFFECT_FENCE: NOT ESTABLISHED
ACL_REVOCATION_EFFECT_FENCE: NOT FOUND IN AUDITED PATH
EXECUTED_ACL_RACE: NO

## Nexo research implication

The evidence now suggests four distinct properties that must not be collapsed during later distillation:

1. authority version exists;
2. version transition is durably committed;
3. operation carries/binds to a version and stale versions are rejected;
4. protected effect is ordered after that validation.

A system can have (1) and (2) without having (3) or (4). Conversely, a local check can provide (3) but fail to survive restart if (2) is missing.

## Exact next action

AB104.771R: investigate an actual distributed lease/fencing implementation with explicit fencing tokens (for example a database/coordination pattern) and examine its failure/recovery tests. Compare whether the token is checked by the resource itself, not merely by the lock service. This will test the hypothesis that a control-plane lease without resource-side enforcement is insufficient for protected effects.
