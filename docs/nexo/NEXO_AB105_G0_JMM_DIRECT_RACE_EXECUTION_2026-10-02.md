# NEXO AB105 G0 — Direct JMM race execution checkpoint

Date: 2026-10-02 UTC
Pinned Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42
Canonical anchor: AB105.116R (unchanged)

## Attempt 1
Branch: nexo-ab105-g0-jmm-direct-race
Commit: 33ccb4e8712555c432adbb356c38d77fa46a4798
Workflow run: 36960745158
Job: 110693654532
Conclusion: FAILURE

The failure occurred at :metadata:compileTestJava before runtime. Exact compiler issue: MockAuthorizableRequestContext.Builder construction can throw Exception and the diagnostic helper had not declared/caught it.

Therefore:
- RUNTIME_RESULT=UNKNOWN
- STALE_ALLOWED=UNKNOWN
- NO_D1_OR_PRODUCTION_CLASSIFICATION
- NO_SECURITY_CONCLUSION

## Correction
A corrected source was persisted on branch nexo-ab105-g0-jmm-direct-race-corrected:
docs/nexo/NEXO_AB105_G0_JMM_DIRECT_RACE_TEST_CORRECTED.java.txt
Commit: 54005b759a18c67578843f60d6c15601c57e7345

The correction only fixes the diagnostic harness declaration. It does not change the JMM test semantics.

## Important limitation
The direct race uses a timing-defined post-remove window and intentionally has no completion flag, latch, volatile marker, or reader gate after removeAcl(). This is a stress diagnostic, not a formal happens-before proof. A zero stale count would mean only "not observed" in this configuration.

## Protected state
AB105.116R=UNCHANGED
AB105.117R=NOT_CREATED
TLC=NOT_RERUN
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED
