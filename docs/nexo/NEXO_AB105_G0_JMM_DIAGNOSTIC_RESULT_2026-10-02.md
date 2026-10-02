# AB105 G0 — JMM diagnostic result

Date: 2026-10-02 UTC

## Verified runtime evidence
- Branch: nexo-ab105-g0-jmm-publication-discriminator
- Commit: e97cf485eb207621e4d798826cbe4b7e9088078e
- Workflow run: 36950083282
- Job: 110660878156
- Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42
- Java: 21.0.12.1
- Compile: SUCCESS
- Runtime: SUCCESS
- Evidence/upload: SUCCESS
- Iterations: 200
- STALE_ALLOWED: 0
- DENIED_AFTER_FLAG: 200
- FLAG_TIMEOUTS: 0

## Epistemic status
JMM_DIRECT_DIAGNOSTIC=OBSERVED_NO_STALE_RESULT
STALE_ALLOWED_OBSERVED=NO_IN_200_ITERATIONS
PRODUCTION_RPC_VISIBILITY=UNKNOWN
JAVA_HAPPENS_BEFORE_PUBLISHER_TO_RPC=UNKNOWN
PRODUCTION_PATH_TEST=NOT_PERFORMED
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

## Scope limitation
The diagnostic directly invokes StandardAuthorizer from writer/reader threads. The plain completion marker is intentionally non-volatile. A zero stale count is evidence only for this diagnostic configuration; it does not prove a Java Memory Model happens-before edge from MetadataLoader/AclPublisher publication to unrelated RPC authorization threads.

## Next action
Design/execute a production-path discriminator covering MetadataLoader/AclPublisher publication through the actual RPC authorization path, preserving the existing G0 witnesses and AB105.116R. Do not create AB105.117R while the semantic/attainability audit remains open.
