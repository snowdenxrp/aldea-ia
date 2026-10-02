# NEXO CONTINUITY DELTA — 2026-10-01 — PR85/PR86

## Canonical protection
- AB105.116R remains frozen and intact.
- No AB105.117R created.
- No TLC rerun.
- Original G0 witness and PR #82 witness remain unchanged.

## PR #85 result — invalid discriminator execution
PR #85 head `349d0197300ab87f7744452be2d6e2e861fc2c03` executed as workflow `36943841895`, job `110641254716`, and FAILED during the real harness.

Observed:
- Kafka infrastructure compiled successfully.
- Harness generation succeeded.
- D1 authorization decision was not observed.
- Producer emitted repeated `TOPIC_AUTHORIZATION_FAILED` metadata responses.
- No G0 propagation witness was emitted.

Interpretation:
- This is NOT D1=DENIED.
- `D1_AUTHORIZATION_DECISION=UNKNOWN`.
- `POST_D0_NEW_REQUEST=NOT_OBSERVED`.
- The failure exposed that the D1 producer's metadata authorization path was not isolated from the post-D0 WRITE test.

## Correction reasoning
A producer needs valid topic metadata before the post-D0 WRITE decision can be isolated. The correction therefore must not simply grant extra WRITE permission or classify the metadata failure as a WRITE denial.

PR #86 adds a separate topic DESCRIBE ACL before D0, warms D1 producer metadata while WRITE is still present, then D0 removes ONLY the WRITE ACL. DESCRIBE remains solely to permit metadata access; the actual NEW WRITE request is still issued after controller-side D0. D1 runs on its own executor, separate from the blocked A1/D2 executor.

This makes the experiment distinguishable:
- metadata path is pre-warmed;
- WRITE authorization is the post-D0 event under test;
- D0 revokes WRITE only;
- D1 authorization result is recorded at the target authorizer;
- target-local ACL count at that decision is recorded;
- D2 remains the previously authorized in-flight request;
- E remains the target UnifiedLog outcome.

## PR #86
- PR: #86
- Branch: `nexo-ab105-g0-describe-isolation`
- Head: `ffc722dda8ef9ecff69c75ce57acfac09206e907`
- Status: OPEN, READY FOR REVIEW, UNMERGED.
- Workflow run: `36944673580`.
- Job: `110643915608`.
- Current status at checkpoint: IN_PROGRESS, still compiling Kafka test infrastructure.
- Kafka revision remains `99b940733a9f6bc409457dba7108f08421d81e42`.

## Current epistemic state
- `G0_RUNTIME=OBSERVED_SUCCESS` for original frozen witness.
- `IN_FLIGHT_AUTHORIZATION_WINDOW=SUPPORTED`.
- `MULTI_BROKER_POST_D0_STALE_AUTHORIZATION=UNKNOWN`.
- `PR85_PROPAGATION_RESULT=INVALID_HARNESS_PATH`.
- `PR86_PROPAGATION_RESULT=PENDING_EXECUTION`.
- `D1_AUTHORIZATION_DECISION=PENDING_EXECUTION`.
- `EXPLOITABILITY=UNKNOWN`.

## Do-not-repeat
Do not reinterpret PR85 as a denial. Do not alter AB105.116R. Do not rerun TLC. Do not merge PR86 until its workflow produces a recoverable witness and that witness has been independently audited.
