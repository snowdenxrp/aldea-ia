# NEXO AB105 G0 — Production StandardAuthorizer discriminator result

Date: 2026-10-02 UTC
Canonical anchor: AB105.116R (unchanged)
Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## Execution evidence
- Workflow run: 36958014786 (run #8)
- Head commit: ec12f67db238196778733c1c0af6aa966ab33614
- Job: 110685238774 (production-discriminator)
- Job conclusion: SUCCESS
- Artifact: nexo-ab105-g0-production-standard-authorizer-evidence
- Artifact ID: 11207231395
- Artifact ZIP SHA-256: 5c9dcbca7e2bc2b532ee7ddfae4791c0a9e440719eedeb5fcbb684fd7cafbd66
- Java: 21.0.12.1 LTS

## Exact production-path witness
G0_PRODUCTION_WITNESS ITERATIONS=10 D1_DENIED=10 D1_ALLOWED=0 D1_UNEXPECTED=0 STANDARD_AUTHORIZER=REAL RPC_REQUEST_AFTER_D0=REAL

Each iteration used the real KafkaClusterTestKit KRaft path with real StandardAuthorizer and a real client/RPC request after controller-side WRITE ACL deletion. D1 was a new producer whose metadata was warmed before D0; D0 deleted only WRITE; D1 then attempted a new WRITE request after D0 completion.

## Epistemic interpretation
- PRODUCTION_PATH_TEST: EXECUTED_SUCCESSFULLY
- REAL_STANDARD_AUTHORIZER: OBSERVED
- REAL_RPC_REQUEST_AFTER_D0: OBSERVED
- D1_POST_D0_BYPASS: NOT_OBSERVED (10/10 denied)
- STALE_PROPAGATION_AUTHORIZATION: NOT_OBSERVED_IN_THIS_PRODUCTION_TEST
- IN_FLIGHT_AUTHORIZATION_WINDOW: OBSERVED independently in prior G0 witness
- JAVA_HAPPENS_BEFORE_PUBLISHER_TO_RPC: UNKNOWN
- PRODUCTION_JMM_BUG: UNKNOWN
- EXPLOITABILITY: UNKNOWN
- GENERALIZATION: UNKNOWN
- PRODUCTION_IMPACT: UNKNOWN
- SECURITY_CONCLUSION: NOT_ESTABLISHED

This result must not be described as proof of universal safety or as resolution of the Kafka authorization question. It specifically records that the controlled real StandardAuthorizer/RPC discriminator did not reproduce a post-D0 stale WRITE authorization in 10 iterations.

## Continuity constraints
- AB105.116R remains the canonical audit anchor.
- Do NOT create AB105.117R from this result.
- Do NOT rerun TLC solely because of this result.
- Preserve prior source/JMM UNKNOWN states; this production result does not establish a Java Memory Model happens-before edge.
- Historical G0 in-flight authorization witness remains valid and distinct from stale propagation authorization.
