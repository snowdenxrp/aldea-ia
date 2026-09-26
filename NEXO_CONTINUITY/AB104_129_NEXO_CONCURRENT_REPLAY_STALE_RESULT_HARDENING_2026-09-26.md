# AB104.129 — concurrent/replayed same-step frontier — 2026-09-26

Previous: AB104.128.

Audit finding:
- The typed effect adapter already protects the external side effect with a deterministic idempotency key (`missionId:stepId`) and returns the persisted execution result on replay.
- The remaining gap was in the durable outcome layer: `recordNexoOutcome` appended a new authoritative attempt on every replay, even when the same mission/step had already produced a verified outcome.
- Restart reconstruction also selected the last raw attempt by array order. A late stale failed/blocked record could therefore regress a previously verified completion.

Hardening applied:
- `recordNexoOutcome` now enforces one authoritative outcome per `missionId + stepId`. Replays and late results for the same mission step are ignored; retries are represented by a new missionId through the existing replan lineage.
- `reconstructNexoMission` now gives precedence to an existing verified completed outcome for a mission step over later stale failed/blocked records.
- Runtime regression now asserts that replaying a persisted successful step does not duplicate the outcome journal.
- Restart regression now injects a late stale failure after a verified completion and asserts reconstruction remains completed.

Persistence:
- Repair commit: 8a6d5a064ef05300de1388ba05a302cc330af89b
- Runtime regression commit: 00df6de32b18e682e9aa2a1a1370a1bf7eaf904d
- Restart stale-result regression commit: 92b16d2a92da28f0e2d0aecdcacf5995834c68cd
- Reconstruction hardening commit: 674b4f430792e02f7a5a8846ab2d7d4964ce60b8
- Subsequent automatic "Actualizar estado de Lúmina" commits exist after these changes (including 87cf362b22199aeace160c38476fbd4e15ef1643 and a3148746052994988ff5c4629f0aab99d85e2f41), indicating the repository's state-update automation continued after the repair.
- The available GitHub connector does not expose push-triggered workflow-run listing for these commits, so no run/job number is asserted here. Do not convert this indirect state-save evidence into a fabricated CI claim.

Epistemic status:
- SOURCE REPAIR: PERSISTED.
- TEST REGRESSIONS: PERSISTED.
- FRESH RUN-LEVEL VALIDATION: PENDING/NOT DIRECTLY RETRIEVABLE FROM THE AVAILABLE WORKFLOW INTERFACE.
- Do not declare the entire concurrent-recovery frontier closed yet.

Contract established:
- A mission step is single-attempt within a mission.
- Verified completion is terminal and authoritative for that mission/step.
- Replaying the same idempotency key may replay the external result but must not duplicate the authoritative outcome.
- A retry after failure/blocking belongs to a new missionId and must preserve parentMissionId/replanReason.
- Historical attempts remain preserved; stale results are prevented from becoming current state.

Next exact frontier:
- Validate this repair with a fresh workflow run/job and full test suite.
- Then audit concurrent calls that enter the same planned step before either caller observes the durable outcome: specifically, whether both callers can pass `beginNexoStep` and whether the durable outcome/side-effect ledger remains linearizable under truly overlapping invocation.
- Do not claim concurrency safety from sequential replay tests alone.

DO-NOT-REPEAT:
- Do not use raw attempt-array order as authoritative when a verified terminal completion already exists.
- Do not append duplicate authoritative outcomes for the same mission/step replay.
- Do not treat execution-journal presence as completion.
- Do not reuse the same missionId to model a legitimate retry after a failed/blocked step; create a new replan mission.
- Do not claim true concurrent linearizability from idempotency-key replay alone.

CONTINUITY:
Resume from AB104.129 at commit 674b4f430792e02f7a5a8846ab2d7d4964ce60b8. First verify fresh workflow/test evidence; then attack overlapping same-step invocation and durable linearization.
