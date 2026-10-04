# AB105 G0 ordering audit — 2026-10-04

## Canonical boundary
- AB105.116R: UNCHANGED.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- PR #92/#93/#94/#95/#96: diagnostic/draft only.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Final findings
1. D0_RETURN is not W1. DeleteAcls completion is tied to controller metadata-log commit/stable-offset completion; local broker ACL publication is a separate asynchronous MetadataLoader/AclPublisher path.
2. Metadata commit -> W1 is a real path through MetadataLoader/KafkaEventQueue/AclPublisher/StandardAuthorizerData.
3. RequestChannel ArrayBlockingQueue gives producer->consumer publication for actions before ENQUEUE, but does not establish a universal metadata-thread -> RPC-authorizer happens-before edge.
4. PR #93 executed the actual findAclRule() snapshot diagnostic at the pinned revision. Raw result: ITERATIONS=100 READERS=4 OBSERVATIONS=2939007 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=2845069 OVERLAP_ALLOWED=17769 OVERLAP_DENIED=81 POST_RETURN_PRE_REMOVE_CACHE=0 POST_RETURN_POST_REMOVE_CACHE=2845069 POST_RETURN_UNKNOWN_CACHE=0 POST_RETURN_PRE_REMOVE_SNAPSHOT=0 POST_RETURN_POST_REMOVE_SNAPSHOT=2845069 POST_RETURN_UNKNOWN_SNAPSHOT=0 POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE=0 UNEXPECTED=0.
5. Therefore no post-return stale snapshot and no post-return ALLOWED were observed in that diagnostic. This is executed evidence, not a formal JMM proof.
6. The real-broker ordering witness remains methodologically separate. Prior W1<ENQUEUE observations are temporal only; no fresh raw artifact currently inspected upgrades them to causal/JMM proof.
7. No identified production synchronization closes W1 -> authorization globally for incremental aclCache publication.

## Final epistemic state
🟢 Executed/source-verified: controller completion, MetadataLoader/AclPublisher, RequestChannel, authorize/findAclRule snapshot.
🟢 Observed: no post-return stale snapshot; no post-return ALLOWED in PR #93.
🟡 Temporal: prior W1<ENQUEUE observations.
🟡 JMM W1->authorize: UNKNOWN.
🟡 Stale-read: NOT OBSERVED, not formally excluded.
🟡 Security impact: UNKNOWN.
🔴 Unsupported: calling it proven vulnerable, proven safe, or treating D0_RETURN as W1.

## Conclusion
Audit complete at the current evidence boundary. The strongest defensible conclusion is: Kafka's incremental ACL publication path contains an asynchronous publication boundary, and existing experiments did not observe stale authorization after measured local ACL removal; however, no direct JMM happens-before proof from W1 to the authorization snapshot has been established.

Status: UNKNOWN / NOT OBSERVED — neither SAFE nor VULNERABLE.

## DO-NOT-REPEAT
- Do not rerun TLC.
- Do not create AB105.117R.
- Do not repeat PR #92/#93 cache/snapshot diagnostics.
- Do not add latch/volatile/barrier/future gates between W1 and authorization.
- Do not treat D0_RETURN as W1.
- Do not promote timing ordering into JMM causality.
