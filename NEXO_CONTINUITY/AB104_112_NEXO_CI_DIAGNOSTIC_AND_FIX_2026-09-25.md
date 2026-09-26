# AB104.112 — Nexo CI diagnostic and fixture correction — 2026-09-25

## Continuity
Previous implementation checkpoint: AB104.111.
Current correction commit: b378afb879cfbcce26f960fbe84005e6296c812d.

## Verified diagnostic
Run 2192 / ID 36203448659: FAILURE.
The failure was in `tests/nexo/runtime.test.mjs:35`: expected `LUMINA_ACTION_FAILED`, actual `EFFECT_EXCEPTION`.

Root cause: the regression fixture represented `world.resources.water` as scalar `0`, while the canonical Lúmina resource shape is an object with an `amount` field. The action engine therefore threw on malformed fixture state instead of returning the normal domain-level action failure.

## Repair
The fixture was corrected to `world.resources.water = { amount: 0 }`. Production action semantics were not changed.

Run 2193 / ID 36203512556 is IN PROGRESS on commit b378afb879cfbcce26f960fbe84005e6296c812d. It has reached the Lúmina validation suite; final conclusion is intentionally not claimed yet.

## Architectural finding
Keep these outcomes distinct:
1. domain action failure (`LUMINA_ACTION_FAILED`);
2. malformed simulation state causing an execution exception (`EFFECT_EXCEPTION`).

A future regression will deliberately exercise malformed state to ensure `EFFECT_EXCEPTION` cannot become success.

## Next exact action
1. Verify Run 2193 final conclusion.
2. If green, run multi-step dependency + failure + replan lineage coverage.
3. Add malformed-state exception coverage.
4. Continue crash/restart recovery using the persisted execution ledger.

## Boundary
Nexo remains bounded to registered Lúmina effects. No arbitrary OS/device/TV control is established. UNKNOWN/PENDING epistemic states remain unchanged.
