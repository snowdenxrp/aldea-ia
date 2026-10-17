# NCS M0.66 — Require canonical state record before protected transition
Date: 2026-10-17
Branch: `ncs-clean-architecture`
Implementation and regression-test commit: `921f6dfaf269a80effbcdaaf12b64d64dc398355`

## Defect demonstrated

`executeProtectedTransition()` validated the outer transition input, but did not require its `state` field itself to be a record. Because the contract validator accepts undefined/null as leaf values inside an otherwise valid input record, missing, null, array, or primitive canonical state could reach port code. A permissive isolator could replace absent or malformed input with a record and allow the transition to continue against a state not supplied by the caller.

## Correction

The Core now calls `assertContractInput(state, "state")` immediately after extracting the transition input, before checking/invoking any port. Canonical state must be a non-array record with valid plain contract data. Invalid state is rejected at the boundary rather than silently repaired by an adapter.

## Regression

Tests pass `undefined`, `null`, an array, and a string as state. For each case, transition rejects with `state must be a record`, and a counter spanning claim building, authority, isolation, execution, validation, and commit remains zero.

## Focused CI evidence — all success on final commit

- [M0 non-authority Core contracts — run 39077156247](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077156247) — success
- [STEP 4 semantic validation — run 39077156238](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077156238) — success
- [STEP 5 outcome classification — run 39077156250](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077156250) — success
- [STEP 3A/3B/3C verification — run 39077156258](https://github.com/snowdenxrp/aldea-ia/actions/runs/39077156258) — success

Focused workflows only; this is not a full-repository test-suite claim.

## Limits

This establishes the shape of the supplied canonical state at the transition boundary. It does not prove the state is complete, current, authoritative, durably versioned, or protected from restore/rollback. It does not establish legitimate constitutional authority or production protected-effect reachability. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
