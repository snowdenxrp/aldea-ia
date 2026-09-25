# AB104.80 — VILLAGE RESIDENTIAL LAYOUT REPAIR — 2026-09-25

## Evidence
Lúmina Actions run 2092 (ID 36194760253), head dbe13aa05c381ccdaec01062aad24fd2e007c1c5, verified the humanoid visual-fidelity audit PASS.

Next concrete failure:
`tests/village-visual-audit.test.mjs:52`
`la fila residencial norte debe tener cinco casas`
actual 7, expected 5.

## Root cause
The visual layout counted four western neighborhood houses as `type:"house"`, so the north/south filters included them. The east residential rows also used z=±16.5 while the contract requires ±16.3.

## Repair
Commit `97002551311265b8dc771de93018130c79447862`.

- Western neighborhood houses are now `house-west`; the renderer already treats non-farm structures through the house mesh path, so their visual presence is retained while their semantic layout category is separated.
- East residential rows are aligned to z=16.3 and z=-16.3 as required.
- No test was weakened.

## Verification
Pending next Lúmina Actions run.

## Next action
Inspect the next run and continue from the first concrete failure.
