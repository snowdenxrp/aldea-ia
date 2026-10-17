# NCS M0.47 — Reject indeterminate/invalid reconciliation outcomes

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

The reconciliation contract considered any string outcome resolvable when an evidence item carried `authoritative: true`. That allowed `UNKNOWN`, `RECONCILE_REQUIRED`, or an arbitrary typo to be reported as `RESOLVED`. It also accepted whitespace-only reconciliation boundary and claim identifiers.

## Change

- A reconciliation result is now `RESOLVED` only for recognized determinate terminal outcomes: `SAFE_COMMIT`, `STALE_CANDIDATE`, `SEMANTIC_CONFLICT`, or `AUTHORITY_STOP`.
- `UNKNOWN`, `RECONCILE_REQUIRED`, and unrecognized outcomes remain `UNRESOLVED`.
- Boundary and optional claim ID reject whitespace-only values.
- Regression tests cover each condition.

## Evidence

- Source commit: `fb91418aa7902f4ffd48d4269a91ae583e98e5d8`; explicit-list cleanup: `9292973699a69c5166980ee6a69700acf4184b89`
- Regression-test commit: `d041ef859073622956a68a51e16d9a3c537710dd`
- STEP 6 reconciliation CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996626477 — success
- M0 non-authority core contracts CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996626469 — success
- STEP 5 outcome classification CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996626467 — success
- STEP 4 semantic validation CI: https://github.com/snowdenxrp/aldea-ia/actions/runs/38996626495 — success

## Explicit limitation

The reconciler still trusts a caller-supplied `authoritative: true` flag. This change does **not** authenticate the source or authority of reconciliation evidence, and it does not prove reconciliation correctness or protected-effect readiness. That authority boundary requires a coherent design; no replacement trust root is invented here. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
