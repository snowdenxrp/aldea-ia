# NCS M0.43 — Reject mutable exotic values in immutable Core contracts

Date: 2026-10-17  
Branch: `ncs-clean-architecture`

## Finding

The Core contract helper detached inputs with `structuredClone()` and recursively applied `Object.freeze()`. That does not make every cloned object immutable: `Map` and `Set` can still mutate internal slots, and `Date` can change its time value despite being frozen. This conflicted with the constructors' immutable-contract guarantee.

The existing Observation contract already guarded against this class by restricting immutable data to arrays and plain objects; the shared Core contract helper did not.

## Change

`src/nexo/core/contracts.mjs` now validates each detached clone before freezing it. Contract values may contain arrays and plain objects (including null-prototype objects), but exotic object instances are rejected with a clear `TypeError`. The validation is applied consistently wherever the shared `detachedImmutable()` helper is used: claim envelopes, policy context, validation results, outcomes, and authority results.

Regression tests reject:
- a `Map` supplied as a claim target;
- a nested `Set` in dependency data;
- a `Date` nested in validation evidence.

This deliberately narrows the data contract to deeply-freezable JSON-like structures. It does not establish evidence authenticity or constitutional authority.

## Evidence

- Source commit: `4bdc7767105d6241e8c004bfc284389e723fca2a`
- Regression-test commit: `376e32753c897b394e0333831380dcd16dc443b8`
- M0 non-authority Core contracts CI at test commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994569863 — success
- STEP 4 CI at test commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994569750 — success
- STEP 5 CI at test commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994569763 — success
- STEP 7 policy-context contract CI at test commit: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994569738 — success
- Core isolation workflow trigger update: `06f8a2b36da6d37826f413dd0f5e2a16d48ff753`
- Focused STEP 3A/3B/3C workflow: https://github.com/snowdenxrp/aldea-ia/actions/runs/38994594903 — pending at report creation; do not treat as PASS until it completes successfully.

## Limits

This is a data-shape/immutability boundary fix, not a proof of runtime reachability, bypass closure, authority provenance, or durable external-effect reconciliation. No full-repository or device test is claimed. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
