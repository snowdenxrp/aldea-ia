# NEXO CONTINUITY — G0 JMM snapshot audit checkpoint — 2026-10-04

## Scope
Audit historical PRs #87–#96 for evidence of a stale pre-W1 aclCache snapshot after removeAcl()/W1. No canonical Kafka change, no new AB105.117R, no TLC rerun.

## New verified evidence
- PR #93 head: 001367b6dc392ad15440cc98aebf282f6f14f3f5.
- GitHub Actions run 37040417803, job 110948877687, workflow "NEXO AB105 G0 JMM causal window discriminator": SUCCESS.
- Pinned Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42.
- Diagnostic executed 100 iterations with 4 readers; 4,071,307 observations.
- Raw result:
  CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=4071307 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=3941104 OVERLAP_ALLOWED=78521 OVERLAP_DENIED=87 POST_RETURN_PRE_REMOVE_CACHE=0 POST_RETURN_POST_REMOVE_CACHE=3941104 POST_RETURN_UNKNOWN_CACHE=0 POST_RETURN_PRE_REMOVE_SNAPSHOT=0 POST_RETURN_POST_REMOVE_SNAPSHOT=3941104 POST_RETURN_UNKNOWN_SNAPSHOT=0 POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE=0 UNEXPECTED=0
- Therefore this historical diagnostic did NOT observe a pre-remove cache/snapshot after measured removeAcl() return. It also observed no post-return ALLOWED result.
- This is strong negative evidence for this synthetic causal/JMM probe, but NOT proof of impossibility and NOT a real-broker R1 witness.

## Interpretation
🟢 Exact snapshot-read instrumentation executed successfully.
🟢 0/100 iterations produced POST_RETURN_PRE_REMOVE_SNAPSHOT.
🟢 0 POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE.
🔵 Real broker W1→aclCacheSnapshot JMM behavior remains UNKNOWN.
🔵 W1→R1 remains UNKNOWN.
🔴 Vulnerability/exploitability remains NOT ESTABLISHED.

## Deduplication
PR #88 and #89 are the same causal-window diagnostic family; #89 is a rebased v2, not independent evidence.
PR #90/#91 are compile/API validation only.
PR #92 is pre-authorize cache identity sampling; #93 is the stronger exact snapshot instrumentation and the run above.
PR #94/#95/#96 are real-broker ordering/visibility/latency families, but do not by themselves establish stale snapshot identity.

## DO NOT REPEAT
Do not rerun this exact 100-iteration JMM probe merely to reproduce the same negative result. Do not create another AB105.117R. Do not rerun TLC while ordering audit remains open.

## Next target
Historical archaeology for any execution that crosses from exact snapshot identity into real broker authorization/result (D1 ALLOWED with target local ACL still present), or any artifact that records pre-remove snapshot identity after W1 in a real-broker request.
