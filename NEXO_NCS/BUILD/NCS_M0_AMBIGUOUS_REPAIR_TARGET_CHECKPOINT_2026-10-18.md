# NCS M0 — Ambiguous repair targets fail closed

Date: 2026-10-18  
Code/test commit: [`f6ad72da4f0caff056a21dbdf8835391844c6b0c`](https://github.com/snowdenxrp/aldea-ia/commit/f6ad72da4f0caff056a21dbdf8835391844c6b0c)

## Finding and fix

The persisted repair observer previously selected the first matching agent ID. A malformed snapshot containing duplicate IDs could therefore make an ambiguous target appear uniquely verified. The observer now requires exactly one matching agent for both `repair_agent_state` and `repair_agent_needs`; zero matches and multiple matches remain UNKNOWN with distinct reasons. Resource lookup now requires an own property, preventing inherited object members from being treated as persisted resource records.

This is a narrow fail-closed correction to the read-only observer. It does not alter Lúmina's repair handlers, settle PREPARED, authorize redispatch, or claim a global schema validator.

## Exact-head CI

All three workflows passed at the exact code/test commit:

- [STEP 4 semantic validation — 39132380744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380744)
- [STEP 5 outcome classification — 39132380742](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380742)
- [Bounded mission admission / restart continuity — 39132380735](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380735)

The mission workflow includes `tests/nexo/simulation-restart-persistence.test.mjs`, which covers the observer and durable repair crash cut.

## Remaining limits

- The observer still expects a strict-loaded persisted snapshot and does not itself authenticate provenance.
- A matching revision is only a point-in-time observation; it does not lock the environment against a later writer.
- PREPARED still does not bind the authoritative persisted environment revision.
- The continuity store and environment snapshot are separate persistence boundaries; no atomic cross-store transaction is claimed.

Next: explicitly design and test the PREPARED environment-revision binding and dispatch/recovery fence before any terminal settlement API. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.
