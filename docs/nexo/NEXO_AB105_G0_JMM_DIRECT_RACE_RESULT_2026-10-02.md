# NEXO AB105 G0 — Direct JMM Race Diagnostic Result — 2026-10-02

## Evidence
- Workflow run: 36960926363
- Job: 110694206822
- Branch: nexo-ab105-g0-jmm-direct-race-corrected
- Head SHA: f0d08bd25ddbf85f518e62e2231b5a4b63616901
- Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42
- Java: 21.0.12.1
- Artifact: nexo-ab105-g0-jmm-direct-race-evidence
- Artifact ID: 11207703791
- Artifact SHA-256: b2992d95c0ac3bccdb54cec526424f7e3e65fe77539db7a04fc6e9c8c75ba107

## Exact runtime witness
JMM_DIRECT_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=2598444 STALE_ALLOWED_IN_POST_WINDOW=75844 DENIED_IN_POST_WINDOW=1746509 UNEXPECTED=0

## Interpretation
- DIRECT_RACE=EXECUTED
- TIMING_ONLY_DIAGNOSTIC=TRUE
- A non-zero count of ALLOWED observations occurred in the timing-defined post-remove window: 75,844.
- This is material escalation evidence for the source-level concurrency boundary, but it is NOT by itself proof of a Java Memory Model violation, because the diagnostic intentionally avoids an inter-thread completion signal that would establish a formal happens-before edge.
- The timing window does not prove that every counted ALLOWED result occurred after the writer's removeAcl() method had actually returned; it establishes only the diagnostic's scheduled post-window.
- Therefore: STALE_PROPAGATION_AUTHORIZATION remains NOT_OBSERVED_IN_G0/production, while DIRECT_JMM_RACE_DIAGNOSTIC=NONZERO_TIMING_WINDOW_OBSERVED.
- PRODUCTION_JMM_BUG=UNKNOWN
- EXPLOITABILITY=UNKNOWN
- GENERALIZATION=UNKNOWN
- PRODUCTION_IMPACT=UNKNOWN
- SECURITY_CONCLUSION=NOT_ESTABLISHED

## Continuity protections
- AB105.116R=UNCHANGED
- AB105.117R=NOT_CREATED
- TLC=NOT_RERUN
- No historical result overwritten.

## Next discriminator
Do not promote the 75,844 observations to a vulnerability finding. Next work should determine whether a reproducible ALLOWED authorization can be causally placed after completed removeAcl() without introducing an artificial happens-before edge, or otherwise instrument the real publication/request boundary. Any escalation must preserve the distinction between timing evidence and formal JMM proof.
