# P112 BOUNDED_CAP_REPLAN_DISPOSITION_AUDIT_V1_2026-10-07

## Question
Does the existing replan protocol provide a durable continuation mechanism for mission candidates excluded by the eight-step bound?

## Recovered evidence

### 1. Existing replan is failure-driven, not overflow-driven
Current runtime/tests define replan around a mission step outcome:
- a failed step transitions mission to `needs_replan`;
- objective becomes `replan_after_failure`;
- a new mission is created with a new `missionId`;
- `parentMissionId` and `replanReason` preserve lineage.

Historical AB104.115/116/129 and current tests validate this failure/restart lineage.

### 2. No evidence found that the eight-step overflow itself creates a replan obligation
Searches for the combination of `slice(0,8)`, replan, overflow/deferred/not-admitted/continuation semantics did not recover a dedicated overflow transition.

The existing replan path is therefore semantically distinct from the bounded-cap decision.

### 3. Important consequence
A candidate beyond index 7 is not a failed mission step. It was never admitted into `mission.steps`.

Therefore the existing `recordNexoOutcome()`, `advanceNexoMission()`, and failure-driven `parentMissionId/replanReason` machinery cannot by itself provide a durable receipt for candidate 9+.

### 4. Fresh-observation possibility remains open
Because `buildNexoMission()` consumes specialist reports each run, an omitted candidate could theoretically reappear in a later fresh report. But current evidence does not establish:
- that the same observation is retained;
- that the omitted claim is intentionally re-evaluated;
- that repeated observation has a stable identity;
- that disappearance from a later report means resolution.

This directly connects to the previously recovered finding that planner deduplication lacks observation/freshness identity.

## New semantic boundary

The correct distinction is now:

**FAILED/NEEDS_REPLAN**
= admitted mission step reached a terminal failure and has durable outcome/lineage semantics.

**NOT_ADMITTED_BY_BOUND**
= candidate never became a mission step; current system has no equivalent durable disposition proven.

This is not evidence that the bound is unsafe. It is evidence that its continuation semantics are OPEN.

## Status
🟢 Failure-driven replan protocol recovered and already audited.
🟢 New missions preserve parentMissionId/replanReason.
🟢 Existing replan does not appear to cover bounded-cap overflow.
🔵 Whether fresh assistant cycles intentionally re-evaluate omitted candidates OPEN.
🔵 Whether omitted candidates need explicit NOT_ADMITTED/DEFERRED evidence OPEN.
🔵 Whether a continuation cursor/overflow ledger is necessary OPEN.
🔴 No implementation/TLC/JMM-HB/exactly-once/power-loss claim.

## DO-NOT-REPEAT
Do not treat omitted candidates as failed.
Do not reuse failure-replan semantics as proof of overflow continuation.
Do not invent a deferred queue before tracing the report/run lifecycle.
Do not remove the historical eight-step bound.

## Exact next
Trace the full assistant report lifecycle across consecutive runs: report generation → mission construction → persistence → next run inputs. Determine whether prior reports/findings survive anywhere outside the truncated mission and whether an existing run/sample identifier can distinguish a re-observation from a new observation.
