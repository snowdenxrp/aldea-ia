# M0 — Persisted UNKNOWN effect blocks replan after reconstruction
Date: 2026-10-18

## Regression added
An integrated runtime regression now drives a mission step into `EFFECT_OUTCOME_UNKNOWN` by simulating a handler exception after dispatch. It verifies:
1. Runtime returns blocked with `EFFECT_OUTCOME_UNKNOWN`.
2. The effect journal retains the original `missionId:stepId` entry in `prepared`.
3. Memory normalization and mission reconstruction preserve the UNKNOWN evidence.
4. A caller-supplied reason requesting a new operation cannot cause `replanPersistedNexoMission()` to create a successor mission.
5. The effect handler is not called again, and the prepared entry remains unresolved.

## Scope
This closes a regression gap across the runtime → memory normalization → reconstruction → persisted replan guard seam. It does not implement reconciliation or prove remote effect state. The original operation remains unresolved, and replan remains blocked.

## Required next step
Implement an explicit, non-overwriting reconciliation record bound to the original effect key and the existing PG-009 binding contract. Do not transition a blocked attempt to completed merely because a caller callback returns `verified: true`. Runtime currently lacks an independent authoritative source for recovery owner/fence, authority epoch, provenance, freshness, target and policy-version bindings; missing inputs must fail closed.

## Gate
STEP 7 remains OPEN / STOP / UNKNOWN. Protected effects remain STOP.
