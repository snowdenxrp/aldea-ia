# AB104.76 — Exploration arrival completion repair

Date: 2026-09-25

## Evidence
Run 2084 (head c019baf) reproduced the failure after AB104.75. Diagnostic showed excursions=1, but agents retained movement/other intents and knownRegions stayed ["5:4"].

## Root cause
AB104.75 correctly prevented premature exploration, but introduced a completion deadlock: when movement reached an exploration target, stopMovement() ran while intent.target remained set; the subsequent exploration branch therefore returned again instead of completing discovery.

## Repair
Commit 4ab9dae2e9f4f05a5f2767132af8196c20cd8512 clears the exploration target in the current intent exactly when the movement target has been reached. The existing assertion remains unchanged.

## Verification
Pending GitHub Actions run for this repair commit. No pass is claimed yet.

## Next action
Inspect the new Actions run. Continue to the next concrete failure or full workflow success. AB65 remains separately NOT_VERIFIED.
