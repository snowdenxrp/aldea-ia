# NCS M0 — Learning memory snapshot isolation

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: IMPLEMENTED / FOCUSED CI PASS

## Defect

`learnFromReports()` obtains a new memory container through `createLearningMemory()`, but that constructor copies the `patterns` array shallowly. When a finding matches an existing signature, learning mutates the shared pattern object's `seen` and `lastSeen` fields. The caller's previous memory snapshot therefore changes as a side effect of producing the next snapshot.

## Change

- `learnFromReports()` now clones each pattern record before incrementing counters or updating timestamps.
- `tests/nexo/restart-reconstruction.test.mjs` now checks that the previous snapshot retains its old counter/timestamp, while the returned snapshot increments the counter and contains a distinct pattern object.
- No new IDs, queues, retry rules, or authority semantics were introduced.

## Verification

- Regression added to the existing focused mission-continuity workflow.
- Mission admission / restart continuity: [run 39084194889](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084194889) — success; job `mission-admission-continuity` explicitly passed both `tests/nexo/orchestrator.test.mjs` and `tests/nexo/restart-reconstruction.test.mjs`.
- STEP 4 semantic validation: [run 39084194898](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084194898) — success.
- STEP 5 outcome classification: [run 39084194895](https://github.com/snowdenxrp/aldea-ia/actions/runs/39084194895) — success.
- All three workflows ran on source/test commit `7723f38e901ccca75323aa92b6ccda2cf5c022ba`.

## Scope limits

This corrects local snapshot isolation for learning-pattern updates. It does not establish authenticated evidence provenance, the unresolved Proxy input boundary, the production protected-effect path, or constitutional authority. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
