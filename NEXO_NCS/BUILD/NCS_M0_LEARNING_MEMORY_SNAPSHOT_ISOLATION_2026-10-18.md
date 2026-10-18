# NCS M0 — Learning memory snapshot isolation

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: IMPLEMENTED IN SOURCE + REGRESSION ADDED; FOCUSED CI PENDING

## Defect

`learnFromReports()` obtains a new memory container through `createLearningMemory()`, but that constructor copies the `patterns` array shallowly. When a finding matches an existing signature, learning mutates the shared pattern object's `seen` and `lastSeen` fields. The caller's previous memory snapshot therefore changes as a side effect of producing the next snapshot.

## Change

- `learnFromReports()` now clones each pattern record before incrementing counters or updating timestamps.
- `tests/nexo/restart-reconstruction.test.mjs` now checks that the previous snapshot retains its old counter/timestamp, while the returned snapshot increments the counter and contains a distinct pattern object.
- No new IDs, queues, retry rules, or authority semantics were introduced.

## Verification

- Regression added to the existing focused mission-continuity workflow.
- CI result: PENDING at commit creation; do not treat this as verified until the workflow result is fetched.

## Scope limits

This corrects local snapshot isolation for learning-pattern updates. It does not establish authenticated evidence provenance, the unresolved Proxy input boundary, the production protected-effect path, or constitutional authority. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
