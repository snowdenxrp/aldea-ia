# AB105 G0 ordering audit — 2026-10-04

## Canonical boundary
- AB105.116R: UNCHANGED.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- PR #94: draft/unmerged.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Corrected complete evidence classification
1. D0_RETURN is not W1. Admin deleteAcls future completion is tied to controller/metadata-log completion; local broker ACL publication is a separate MetadataLoader/AclPublisher path. The audit found no proof D0_RETURN -> W1.
2. Metadata commit -> W1 is real: MetadataLoader owns a KafkaEventQueue/event thread; committed metadata reaches publishers and AclPublisher applies the ACL delta to StandardAuthorizerData.
3. W1 -> ENQUEUE is not a demonstrated JMM happens-before edge. The harness records timestamps but does not perform a W1-derived synchronized handoff. RequestChannel's ArrayBlockingQueue establishes publication for ENQUEUE -> DEQUEUE, not a retroactive publication from W1.
4. PR #93 is valid bounded local runtime evidence. Run 37040412845, job 110948860837, artifact 11242611554: ITERATIONS=100 READERS=4 OBSERVATIONS=5935698 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=5770322 OVERLAP_ALLOWED=53444 OVERLAP_DENIED=121 POST_RETURN_PRE_REMOVE_CACHE=0 POST_RETURN_POST_REMOVE_CACHE=5770322 POST_RETURN_UNKNOWN_CACHE=0 POST_RETURN_PRE_REMOVE_SNAPSHOT=0 POST_RETURN_POST_REMOVE_SNAPSHOT=5770322 POST_RETURN_UNKNOWN_SNAPSHOT=0 POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE=0 UNEXPECTED=0.
5. PR #94 is the accepted bounded real-broker witness. Run 37081442555, artifact 11259107051: 10/10 cycles showed target W1 < D1 ENQUEUE < D1 DEQUEUE < AUTH_ENTER < AUTH_DECISION=DENIED. Two cycles showed D0_RETURN < target W1. This is real end-to-end temporal evidence, not JMM proof.
6. PR #87's 126692 STALE_ALLOWED_IN_POST_WINDOW labels are invalid as stale evidence because the window starts at scheduledRemove while removeAcl executes afterward. Correct classification: concurrent overlap observed; stale-after-writer-return not established.
7. PR #83 did not observe its intended pre-local-revocation state: target local ACL count was already 0 before D1. It cannot support that hypothesis.
8. PR #89 -> #92 -> #93 are methodological refinements, not independent samples to add together. #93 is the strongest local snapshot diagnostic.
9. PR #95 is execution-path unverified; its branch was not included in the relevant workflow trigger.
10. PR #96 prewarm is implementation-unverified for the claimed change: its workflow reconstructs the harness from an older control commit without the prewarm. Do not count it as prewarm runtime evidence.

## Final epistemic state
🟢 SOURCE-VERIFIED: controller completion, MetadataLoader/AclPublisher, RequestChannel, StandardAuthorizer/StandardAuthorizerData, authorize/findAclRule path.
🟢 EXECUTED: PR #93 local snapshot diagnostic; PR #94 real-broker ordering witness.
🟢 OBSERVED: no post-return pre-remove cache/snapshot in PR #93; no stale ALLOWED observed after the corrected writer-return boundary.
🟡 TEMPORAL: PR #94 W1 < ENQUEUE < DEQUEUE < AUTH in 10/10.
🟡 JMM W1 -> authorization snapshot: UNKNOWN.
🟡 Real-broker stale-read manifestation: NOT OBSERVED.
🟡 Production exploitability/generalization: UNKNOWN.
🔴 UNSUPPORTED: vulnerability proven; vulnerability disproven; PR87 labels treated as stale; PR95/96 treated as valid new runtime evidence; D0_RETURN treated as W1; timestamps treated as JMM causality.

## Conclusion
The complete retrospective audit does NOT demonstrate a stale-read vulnerability, and does NOT prove that stale reads are impossible. The strongest defensible result is:

**UNKNOWN / NOT OBSERVED.**

Kafka's incremental ACL publication has an asynchronous publication boundary. The strongest local diagnostic (#93) observed no post-return stale snapshot across 5.9M observations, while the real-broker witness (#94) observed the expected temporal ordering in all 10 cycles. Neither establishes a universal JMM happens-before edge from W1 to the authorization snapshot.

## Frozen state
AB105.116R = FROZEN / unchanged.
AB105.117R = NOT CREATED.
TLC = NOT RERUN.

## DO-NOT-REPEAT
- Do not rerun TLC.
- Do not create AB105.117R.
- Do not repeat PR #87/#89/#92/#93 as if they were independent evidence.
- Do not count PR #95/#96 as new runtime evidence for their claimed variants.
- Do not add W1-derived latch/volatile/barrier/future synchronization.
- Do not treat D0_RETURN as W1.
- Do not promote timestamps into JMM happens-before.
- Do not modify canonical Kafka source to repair Actions control-plane failures.
