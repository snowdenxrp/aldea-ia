# NCS M0.67 — Reject unsafe reconciliation evidence before reading or cloning
Date: 2026-10-17
Branch: `ncs-clean-architecture`
Implementation and regression-test commit: `37d0f12649a9ffe3c93344dc7d77d2156742bd79`

## Defect demonstrated

The reconciliation boundary searched caller-owned `reconciliationCase` and `evidence` before validating their complete data-property shape. Accessing `boundary`, `authoritative`, or `outcome` could execute attacker-controlled getters. The evidence clone also occurred before checking the original graph, so structured cloning could execute accessors or omit symbol-keyed data before the contract examined the copy.

## Correction

- Reconciliation preflights the original reconciliation case before reading `boundary`; malformed/accessor-backed cases return `INVALID`.
- It preflights the evidence graph before searching it; malformed evidence returns `UNRESOLVED`.
- The recursive data validator rejects symbol keys, non-enumerable properties and accessors without reading them, while supporting cycles and arrays.
- `detachedImmutable()` validates the caller-owned graph before `structuredClone`, then validates the detached clone again.

## Regression evidence

- Getter on evidence `authoritative` is never invoked; result is `UNRESOLVED`.
- Getter on reconciliation-case `boundary` is never invoked; result is `INVALID`.
- Symbol-keyed evidence cannot be silently omitted during cloning and accepted as a valid resolution.

## Focused CI — all success on final commit

- [STEP 6 reconciliation — run 39077316684](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077316684) — success
- [STEP 4 semantic validation — run 39077316662](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077316662) — success
- [M0 non-authority Core contracts — run 39077316636](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077316636) — success
- [STEP 5 outcome classification — run 39077316629](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077316629) — success

Focused workflows only; not a full-repository test-suite claim.

## Limits

This closes a local unsafe-data-reading/cloning defect in the reconciliation contract. It does not authenticate the `authoritative: true` assertion, prove evidence provenance or freshness, or establish legitimate constitutional authority. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
