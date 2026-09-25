# AB104.110 — Nexo failure → replan after environment change — 2026-09-25

## Continuity
Previous checkpoint: AB104.109 / automatic action-specific evidence verification.
Implementation commit: `32ff8b04a6de912b941a9a91e2e05298157405fd`.

## Verification
GitHub Actions run 2182 (`36203029918`) completed **SUCCESS**. All simulation workflow steps completed successfully, including assistant validation, diagnosis, simulation advancement and state persistence.

## Structural advance
The Nexo runtime now has an explicit regression proving the complete bounded failure/replan transition:

1. A valid `LUMINA_ACTION` mission is created.
2. The underlying canonical Lúmina action fails because the environment has no water.
3. The effect adapter returns `LUMINA_ACTION_FAILED`; no effect revision is incremented.
4. The runtime converts that failure into mission state `needs_replan` with objective `replan_after_failure`.
5. The failed attempt is recorded in Nexo memory as `failed`.
6. The environment is then changed (water becomes available).
7. A fresh mission is constructed from the new observation instead of silently retrying the stale execution.
8. The new mission has a distinct mission identity and a valid bounded `drink` action intent.

This establishes real failure detection followed by observation-driven replanning, rather than blind retry.

## Evidence boundary
Automatic action-specific postconditions remain strict. A completed effect is not accepted without verified boolean evidence. The effect adapter also retains state-version invalidation and idempotency protections.

## Important limitation
Mission identity is currently durable only when the mission/memory state is persisted by the surrounding system; the effect adapter's idempotency map itself is process-local. No claim of crash-proof cross-process idempotency is made here.

## Next exact action
1. Add explicit mission lineage (`parentMissionId` / `replanReason`) so replans are structurally linked instead of merely inferred from timestamps.
2. Persist an execution ledger containing missionId + stepId + idempotencyKey + state revisions + evidence.
3. Test restart/recovery semantics against that ledger before claiming durable cross-process idempotency.
4. Continue multi-step replan tests after verified environmental changes.

P_AA/AB65 and UNKNOWN/PENDING boundaries remain unchanged.
