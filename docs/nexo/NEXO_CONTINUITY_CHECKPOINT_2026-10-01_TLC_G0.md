# NEXO CONTINUITY CHECKPOINT — 2026-10-01 TLC/G0

## Canonical anchor
- AB105.116R remains canonical and unchanged.
- No AB105.117R is created.
- No Nexo architecture implementation is being promoted from this investigation.

## TLC
- Workflow run: 36781846063 — SUCCESS.
- Job: 110113752493.
- States explored/generated: 7,957,574,337.
- Distinct states: 251,910,656.
- Pending: 0.
- Depth: 31.
- Artifact: nexo-ab105-116r-tlc-evidence, ID 11134199332.
- Artifact SHA-256: ad053fdc48b490819281000cbbf40a8eae76af6bed780d40795a719068ad4f44.
- TLC completion does not by itself prove the Kafka race; historical UNKNOWN/PENDING semantic items remain preserved.

## Kafka G0 runtime witness
- PR #81 remains OPEN, DRAFT, UNMERGED.
- Corrected branch head tested: ab99ea78d7e883ba014a1184bb6b464a670c3fb9.
- Workflow run: 36938337030 — SUCCESS.
- Job: 110623769038 — SUCCESS.
- Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42.
- Java: 21.0.12.1 LTS.
- Artifact: nexo-ab105-g0-bootstrap-evidence, ID 11199086900.
- Artifact SHA-256: d43efa23640881711f188a17e1af2dfa890f801a04d0d5974945bc8cc9c343eb.

## Exact recoverable witness
G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1

The workflow log independently shows:
- real G0 harness compiled and executed;
- A1 was observed by the target authorization wrapper after the delegated ALLOW decision;
- D0 completed through Admin DeleteAcls;
- D1 used an independent fresh Kafka Producer and was denied with TopicAuthorizationException (unwrapped from ExecutionException);
- only after D1 did A1 release;
- D2 completed successfully;
- target broker UnifiedLog logEndOffset moved from 0 to 1;
- the witness was persisted to the CI artifact.

## Audit interpretation
This is the first complete A1 -> D0 -> D1 -> D2 -> E runtime witness recovered for the frozen G0 contract. It is evidence of the specified execution sequence on the pinned Kafka revision and isolated test harness.

Do NOT automatically translate this into exploitability, impact, or a broader real-world claim. Those require separate analysis.

## Current epistemic state
- G0_CONTRACT=FROZEN
- G0_RUNTIME=OBSERVED_SUCCESS
- A1=OBSERVED
- D0=OBSERVED
- D1=DENIED
- D2=SUCCESS
- E=OBSERVED (0 -> 1)
- EXACT_RACE=OBSERVED_WITNESS
- EXPLOITABILITY=UNKNOWN_PENDING_SEPARATE_ANALYSIS
- WITNESS=YES
- AB105.116R=INTACT

## Next action
Preserve the raw artifact and perform a separate witness-integrity / semantic audit before any exploitability or architectural conclusion. Do not rerun TLC unnecessarily and do not modify AB105.116R.

## Witness-integrity / semantic audit — 2026-10-01

### Verified against the executed harness
- A1 is not synthetic: TargetAuthorizer observes the real broker authorization call only after StandardAuthorizer returns ALLOWED for the original producer request, then blocks that in-flight path on A1_RELEASE.
- D0 is a real Admin DeleteAcls operation and the test waits on .all().get(), so the admin operation has completed before D1 begins.
- D1 is a fresh independent KafkaProducer using the same user credentials; it reaches the real broker path and fails with ExecutionException whose cause is TopicAuthorizationException naming the target topic.
- D1 completes before A1_RELEASE is called; therefore the denied observation is temporally between D0 completion and release of the earlier authorized request.
- D2 is the original producer request that was already authorized at A1 and was blocked before completion; it is released only after D1 denial and then completes successfully.
- E is read from the broker's actual UnifiedLog for partition 0 after D2; baseline is asserted 0 and after is asserted 1.

### Semantic boundary
The witness establishes the frozen G0 execution sequence A1 -> D0 -> D1 -> D2 -> E on the pinned Kafka revision and one-broker isolated harness.
It does NOT by itself prove that Kafka authorization caching is the mechanism: the harness deliberately blocks an already-authorized in-flight request. Therefore the precise demonstrated phenomenon is revocation occurring after authorization but before the authorized operation's effect, with a later independent request denied.
It also does not establish multi-broker behavior, persistence/restart behavior, production deployment conditions, attacker reachability, or exploitability in a Nexo deployment.

### Audit status
- WITNESS_INTEGRITY=SUPPORTED
- G0_SEQUENCE_SEMANTICS=SUPPORTED
- CACHE_MECHANISM=UNKNOWN_NOT_TESTED
- MULTI_BROKER_GENERALIZATION=UNKNOWN
- EXPLOITABILITY=UNKNOWN_PENDING_SEPARATE_ANALYSIS
- AB105.116R=INTACT
- NO_AB105.117R

Next: separate mechanism/exploitability analysis only; do not rerun TLC or alter AB105.116R unless new evidence requires it.
