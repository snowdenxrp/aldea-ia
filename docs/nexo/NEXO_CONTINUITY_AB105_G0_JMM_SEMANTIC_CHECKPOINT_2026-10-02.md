# NEXO CONTINUITY — AB105 G0 / JMM SEMANTIC CHECKPOINT
Fecha: 2026-10-02
Repo canónico: snowdenxrp/aldea-ia
Ancla: AB105.116R — NO MODIFICAR
AB105.117R: NOT_CREATED
TLC: NO_RERUN

## Semantic discriminator review
The causal-v2 harness records writer removeAcl enter/return timestamps and reader authorize enter/return timestamps, then classifies POST_RETURN only after all joins. Reader observations remain local during the race; no completion latch, volatile gate, shared counter, or barrier is used to release the readers.

The predicate `readerEnter > writerRemoveReturn` is a temporal discriminator only. `System.nanoTime()` provides monotonic timing comparison; it does NOT create or prove Java Memory Model happens-before.

Therefore:
- POST_RETURN_ALLOWED > 0 would be evidence that an ALLOWED authorization was observed with reader-enter timestamp after the measured writer-return timestamp. It would NOT by itself prove a JMM stale read.
- POST_RETURN_ALLOWED = 0 does NOT prove that stale visibility is impossible.
- OVERLAP_ALLOWED > 0 demonstrates temporal concurrency/overlap in the harness, not stale visibility.

## Existing successful causal runs
Run 36965213770 / job 110707365331:
CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=2531489 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=2466195 OVERLAP_ALLOWED=18300 OVERLAP_DENIED=62 UNEXPECTED=0

Run 36965213781 / job 110707365140:
CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=5556071 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=5457434 OVERLAP_ALLOWED=29225 OVERLAP_DENIED=68 UNEXPECTED=0

Interpretation:
- CAUSAL TEST EXECUTED successfully in both runs.
- No POST_RETURN_ALLOWED observation occurred in either run.
- Overlap ALLOWED observations occurred, confirming the harness can observe authorization while removeAcl is in progress.
- JMM happens-before: UNKNOWN.
- Stale read: UNKNOWN.
- Stale allowed after completed removeAcl: NOT_OBSERVED_IN_THESE_RUNS.
- Exploitability: UNKNOWN.
- Generalization: UNKNOWN.
- Production impact: UNKNOWN.
- Security conclusion: NOT_ESTABLISHED.

## Source-level causal boundary
Pinned Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42.

W1 = plain assignment of a new immutable AclCache reference to StandardAuthorizerData.aclCache during steady-state addAcl/removeAcl.
R1 = plain read of aclCache by findAclRule()/authorization.

Verified:
- MetadataLoader publisher callbacks run on a dedicated metadata/event execution context.
- KafkaEventQueue provides synchronization into event.run(), but that lock edge ends in the metadata execution domain.
- RequestChannel synchronization publishes the Request object to request handlers; it does not publish ACL state.
- Broker startup futures establish startup readiness only; they do not repeat for every ACL mutation.
- StandardAuthorizer.data is volatile, but steady-state addAcl/removeAcl do not reassign data, so that volatile reference is not a per-mutation publication edge.
- StandardAuthorizerData is explicitly not thread-safe.
- AclCache is immutable; the remaining question is reference visibility/publication, not structural mutation corruption.
- No synchronized/ReentrantReadWriteLock/common wrapper was identified between incremental ACL mutation and unrelated RPC authorize().
- Plugin.get() returns the same authorizer reference and introduces no synchronization.

## Important unresolved discrepancy
StandardAuthorizer comments mention a read-write lock, but the pinned implementation inspected at 99b940733a9f6bc409457dba7108f08421d81e42 contains no such lock. This is a comment-versus-implementation discrepancy and must not be resolved by assumption.

## Next action
Do not create AB105.117R yet. Do not rerun TLC. The next work item is to formally map the exact JMM claim that the causal harness can establish, and then determine whether a version/cache identity witness can be obtained without introducing synchronization that changes the race. Any such witness must remain local to the reader and be classified post-hoc.

## DO-NOT-REPEAT
- Do not interpret timing order as happens-before.
- Do not interpret overlap as stale visibility.
- Do not interpret zero POST_RETURN_ALLOWED as proof of safety.
- Do not add a latch, completion flag, volatile gate, or join before the observation interval as a causal release mechanism.
- Do not modify AB105.116R.
- Do not create AB105.117R.
- Do not rerun TLC.
