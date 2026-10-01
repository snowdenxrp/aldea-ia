# NEXO CONTINUITY CHECKPOINT — 2026-10-01 TLC/G0

## Canonical anchor
- AB105.116R remains canonical and unchanged.
- Do NOT create AB105.117R or silently alter the historical meaning of AB105.116R.

## Real TLC evidence
- Workflow run: 36781846063
- Job: 110113752493
- Result: SUCCESS
- States explored/generated: 7,957,574,337
- Distinct states: 251,910,656
- Pending: 0
- Depth: 31
- Artifact: nexo-ab105-116r-tlc-evidence
- Artifact ID: 11134199332
- SHA-256: ad053fdc48b490819281000cbbf40a8eae76af6bed780d40795a719068ad4f44
- TLC semantic UNKNOWN/PENDING items remain preserved; TLC completion is not equivalent to proving the Kafka race.

## Kafka G0 current execution state
- PR #81: OPEN, DRAFT, NOT MERGED.
- PR head: 01cf9d7872329450f501861b75463ef6a5245426
- Workflow run: 36936028499
- Job: 110616388141
- Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42
- Java 21 bootstrap/compile path executed.
- The real G0 runtime harness DID execute far enough to run the frozen test. This is execution evidence, not a race witness.

## Latest observed failure
The runtime test reached D1 and Kafka actually returned TOPIC_AUTHORIZATION_FAILED for nexo-g0-runtime. The failure was in the harness assertion, not evidence of a successful/failed race outcome:
- Expected directly TopicAuthorizationException from the assertion around producer.send(...).get().
- Actual outer exception was ExecutionException.
- Cause was TopicAuthorizationException: Not authorized to access topics: [nexo-g0-runtime].
- Repeated broker/client logs independently show TOPIC_AUTHORIZATION_FAILED.
Therefore D1 authorization denial is observed at runtime, but the test did not complete the frozen A1→D0→D1→D2→E tuple.

## Epistemic status
- G0_CONTRACT=FROZEN
- G0_RUNTIME=EXECUTED_PARTIALLY
- A1=NOT_YET_PROVEN_AS_COMPLETE_TUPLE
- D0=REACHED/OBSERVED BY TEST FLOW, but do not promote to broker-global freshness
- D1=RUNTIME_DENIAL_OBSERVED; exact harness assertion needs correction
- D2=NOT_COMPLETED
- E=NOT_COMPLETED
- EXACT_RACE=UNKNOWN
- EXPLOITABILITY=UNKNOWN
- WITNESS=NO
- No race conclusion may be inferred from the failure.

## Exact next action
Correct only the D1 assertion/unwrapping so the harness recognizes the observed ExecutionException whose cause is TopicAuthorizationException, then rerun the same isolated harness without changing the frozen G0 semantics. Capture raw evidence. If D1 passes, continue to A1 release, D2, and E. Do not change AB105.116R.

## DO-NOT-REPEAT
- Do not rerun TLC 36781846063 merely because G0 failed; TLC is already complete.
- Do not treat TOPIC_AUTHORIZATION_FAILED alone as the race witness.
- Do not infer D2/E from the D1 denial.
- Do not create AB105.117R.
