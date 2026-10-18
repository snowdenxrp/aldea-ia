# NCS M0 — Block successor replanning while a prepared effect remains unresolved

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: IMPLEMENTED — CI VERIFICATION PENDING

## Architectural basis reviewed

This change follows existing research, not a new trust mechanism:

- `NCS_CHECKPOINT_2026-10-08.md`: `UNKNOWN EFFECT` requires reconciliation before repetition; crash is not an execution result; reconciliation is not retry.
- `NCS_EFFECT_VERIFICATION_2026-10-08.md`: effect closure requires contract-specific evidence, provenance, integrity, freshness, causal relation and sufficient assurance; no universal source may close `EFFECT_UNKNOWN`.
- `NCS_RECOVERY_COMMON_MODE_AUDIT_2026-10-08.md`: recovery must preserve surviving guarantees and return `UNKNOWN/STOP` when no sufficient independent basis survives.
- Historical AB invariant AB104.212: crash does not establish execution outcome. AB104.197: reconstruct from CommitRecord; do not repeat an uncertain operation.
- P/P112 constraints retained: evidence freshness/provenance and authority cannot be inferred from a snapshot or a caller's positive assertion.

## Concrete gap

M0.71/M0.72 correctly leave an uncertain external effect in the durable effect journal with `status: "prepared"`. However, `replanPersistedNexoMission()` previously made its replan decision from the reconstructed mission's status/evidence only. If mission outcome persistence was stale or lost the specific `EFFECT_OUTCOME_UNKNOWN` marker while the effect journal still retained the prepared operation, a caller-supplied replan reason could potentially create a successor mission with a new operation identity.

This is a crash-window consistency gap between Decision & Action's effect journal and mission continuity, not a missing retry feature.

## Change

Before creating or persisting a successor, `replanPersistedNexoMission()` now checks the existing `memory.nexo.effectJournal` for a `prepared` entry whose `missionId` matches the mission being replanned. If found, it returns:

- `status: "not_replanned"`
- `code: "EFFECT_RECONCILIATION_REQUIRED"`
- `mission: null`
- unchanged input memory

It creates no successor and does not mutate the unresolved journal. This uses existing operation identity and journal state; it adds no IDs, queue, retry, tombstone, authority epoch, or new trust root.

## Regression

The runtime test simulates a stale/generic mission outcome while retaining the matching prepared journal entry. Even with an explicit caller reason requesting a successor, replanning must remain blocked and no child mission may be persisted.

## Verification

- Source commit: `57ccbe1bd3a6070c69f67e321b9432c0c188a755`.
- Regression test commit: `db8e6259a172d556f9311329df6942770938d04a`.
- Exact-head focused CI: pending; do not treat as PASS until the workflow completes on the tested source/test head.

## Limits

This prevents successor replanning while the same mission has a prepared unresolved effect. It does **not** provide an independent reconciliation verifier, determine whether the external effect occurred, or complete PG-009 recovery. A prepared effect still requires a real contract-grounded verifier/fence/provenance boundary; until then its outcome remains UNKNOWN and it must not be redispatched.

M0 remains a non-authoritative functional Core. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
