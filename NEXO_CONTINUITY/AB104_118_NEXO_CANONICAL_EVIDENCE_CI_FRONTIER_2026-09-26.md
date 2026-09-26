# AB104.118 — Nexo CI canonical-evidence regression frontier — 2026-09-26

Previous: AB104.117.

## Verified recovery state

Canonical repository: snowdenxrp/aldea-ia
Current implementation HEAD: 57e19d7894523941cf6170d599a63d63da933206
Parent: d372edfaf9eae9047c0dc8a105a438200308262e

The second CI correction is persisted in GitHub:
- Commit: 57e19d7894523941cf6170d599a63d63da933206
- Message: Nexo: verify rest from canonical effect evidence
- Changed file: src/nexo/simulation-adapter.js
- Repair: the `rest` evidence predicate now verifies canonical physical effect evidence (`effectResult.effect === "energy_recovered"`) rather than using `currentActivity === "resting"` as the primary proof.

## CI evidence

Fresh CI exists for 57e19d7894523941cf6170d599a63d63da933206.
- Lúmina simulation run: 2211
- Run ID: 36204454980
- Result: FAILED
- Failed job: simulate
- Failed step: Validar asistentes de Lúmina
- The build, deploy, and report-build-status checks completed successfully.
- Historical failure evidence must remain preserved.

Important: AB104.117 is therefore NOT CLOSED. The second correction was persisted, but its first fresh validation failed in the validation step. No claim of a clean CI result is permitted.

## Epistemic status

AB104.117 = OPEN / FAILED-VALIDATION-FRONTIER
Latest implementation correction = PERSISTED
Fresh validation = FAILED
Root cause of run 2211 = NOT YET RECOVERED FROM AVAILABLE JOB METADATA; exact validator assertion/log evidence still needs retrieval through an allowed GitHub route.

## Exact next action

1. Recover the precise failure evidence for run 2211, especially the failing assertion/output from `Validar asistentes de Lúmina`.
2. Determine whether the failure is another verification-contract mismatch or a real Lúmina mutation defect.
3. Preserve the failure as evidence before repairing.
4. Apply the smallest evidence-backed correction.
5. Trigger/observe fresh CI.
6. Only close AB104.117 after a fresh clean validation of the complete simulation workflow.
7. After clean validation, resume the recovery/restart boundary audit.
8. Do not skip directly to later roadmap work while this validation frontier is open.

## DO-NOT-REPEAT

- Do not treat 57e19d7 as CI-passing; run 2211 is explicitly failed.
- Do not revert the canonical `energy_recovered` evidence correction merely because the run failed.
- Do not replace physical/effect evidence with secondary activity-state evidence.
- Do not delete run 2211 or overwrite prior failures.
- Do not close AB104.117 before fresh clean evidence.
- Do not claim persistence unless GitHub read-back verifies it.

## CONTINUITY recovery rule

A future chat receiving `CONTINUITY` must resume from AB104.118 and commit 57e19d7894523941cf6170d599a63d63da933206, inspect run 2211's failed validation evidence, and continue the repair/verification loop. GitHub remains canonical; chat text is not authoritative over repository evidence.
