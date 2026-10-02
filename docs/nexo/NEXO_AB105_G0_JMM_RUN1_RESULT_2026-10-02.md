# AB105 G0 JMM diagnostic run 1

Run 36948275923, job 110655209267, Kafka revision 99b940733a9f6bc409457dba7108f08421d81e42.

Result: HARNESS_COMPILE_FAILURE. No JMM execution occurred.

The injected diagnostic test failed compilation because the StandardAcl and ResourcePattern construction used a topic-name String where Kafka expects ResourceType.TOPIC. Therefore there is no runtime evidence and no change to the epistemic state.

Preserve: IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED; STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0; JAVA_MEMORY_VISIBILITY_BUG=UNKNOWN; EXPLOITABILITY=UNKNOWN; GENERALIZATION=UNKNOWN; PRODUCTION_IMPACT=UNKNOWN; SECURITY_CONCLUSION=NOT_ESTABLISHED.

Next action: correct the harness API usage, compile again, then execute. Do not treat this failed run as evidence for or against Kafka behavior. AB105.116R remains frozen; no AB105.117R; no TLC rerun.
