# NEXO AB105 G0 Runtime Evidence — 2026-10-01

## Execution
- Workflow run: 36938337030
- Job: 110623769038
- PR: #81
- Branch: nexo-ab105-g0-runtime-exec-corrected
- Tested merge SHA: 1ebd9a22a66aef75b8b12f904eadf781adc6b928
- Branch head under test: ab99ea78d7e883ba014a1184bb6b464a670c3fb9
- Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42
- Java: 21.0.12.1 LTS

## Result
The corrected real runtime harness completed successfully.

Recoverable artifact:
- name: nexo-ab105-g0-bootstrap-evidence
- artifact ID: 11199086900
- SHA-256: d43efa23640881711f188a17e1af2dfa890f801a04d0d5974945bc8cc9c343eb
- artifact contains the exact witness below.

## Exact witness
G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1

The runtime log also records the real Kafka rejection:
TOPIC_AUTHORIZATION_FAILED for nexo-g0-runtime.

D1 was a fresh independent Kafka Producer path. The corrected assertion unwraps ExecutionException and verifies its cause is TopicAuthorizationException for the target topic. No synthetic TARGET.authorize() invocation was used.

## Evidence interpretation
- A1: OBSERVED
- D0: OBSERVED
- D1: DENIED
- D2: SUCCESS
- E: OBSERVED, baseline 0 and after 1
- EXACT_RACE: OBSERVED_WITNESS
- EXPLOITABILITY: UNKNOWN_PENDING_SEPARATE_ANALYSIS

The exact race witness is now recoverable from the workflow artifact. This does not by itself establish exploitability or elevate claims beyond the modeled G0 scope.

## Integrity
- AB105.116R remains frozen and untouched.
- No Nexo architecture implementation was performed.
- PR #81 remains open/draft/unmerged.
- This record supersedes the prior UNKNOWN runtime state for G0 only; it does not alter historical evidence or the frozen anchor.
