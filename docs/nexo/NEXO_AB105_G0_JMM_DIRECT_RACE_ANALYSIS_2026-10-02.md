# NEXO AB105 G0 — Direct JMM Race Analysis — 2026-10-02

## Verified result
Workflow 36960926363 / job 110694206822 succeeded on Kafka revision 99b940733a9f6bc409457dba7108f08421d81e42.

Witness:
JMM_DIRECT_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=2598444 STALE_ALLOWED_IN_POST_WINDOW=75844 DENIED_IN_POST_WINDOW=1746509 UNEXPECTED=0

## Critical interpretation correction
The 75,844 ALLOWED observations are NOT yet evidence of an authorization result occurring after completed removeAcl().

The diagnostic defines the post window from a scheduled timestamp. The writer waits until that timestamp, then calls removeAcl(). Readers classify observations using the same scheduled timestamp. Therefore an ALLOWED observation can fall inside the measured post window while the writer is still waiting to run, is executing removeAcl(), or has not yet returned.

This means the result is valid evidence that the timing-defined overlap produces many ALLOWED observations, but it cannot causally distinguish:
1. authorization completed before removeAcl(),
2. authorization overlapped removeAcl(),
3. authorization completed after removeAcl().

## Epistemic state
- DIRECT_RACE_EXECUTION=SUCCESS
- TIMING_WINDOW_NONZERO=OBSERVED
- COMPLETED_REMOVE_THEN_ALLOWED=NOT_ESTABLISHED
- STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0/PRODUCTION
- JAVA_HAPPENS_BEFORE_PUBLISHER_TO_RPC=UNKNOWN
- PRODUCTION_JMM_BUG=UNKNOWN
- EXPLOITABILITY=UNKNOWN
- GENERALIZATION=UNKNOWN
- PRODUCTION_IMPACT=UNKNOWN
- SECURITY_CONCLUSION=NOT_ESTABLISHED

## Next discriminator
Design a narrower causal discriminator that records reader authorization interval and writer removeAcl interval using timestamps without using a completion flag/latch/volatile gate to release readers. The discriminator must classify only observations whose authorization interval can be placed strictly after the measured removeAcl return interval. Even then, timing evidence is not formal JMM proof; preserve that limitation.

Do not promote the 75,844 count to stale authorization.
Do not create AB105.117R.
Do not modify AB105.116R.
Do not rerun TLC.
