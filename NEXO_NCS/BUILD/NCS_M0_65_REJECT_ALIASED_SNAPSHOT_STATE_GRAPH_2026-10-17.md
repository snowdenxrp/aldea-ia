# NCS M0.65 — Reject aliased snapshot state graphs
Date: 2026-10-17
Branch: `ncs-clean-architecture`
Final implementation and regression commit: `fe110e94dafde031f832bd19efe203b930dee1e7`

## Defect demonstrated

The protected-transition boundary previously treated any non-`undefined` snapshot-isolator result as isolated. A shallow-copy adapter could return a new root record while retaining a nested object reference from canonical state. The candidate executor could then mutate canonical state before conditional commit, violating the isolation boundary.

## Correction

Before candidate execution, the core now validates the isolated state record and compares object identities throughout the original and isolated object graphs. If any object node is shared, it fails closed as `UNKNOWN`. The check is cycle-safe and traverses own data-property values without invoking getters; existing input contract validation rejects accessors and unsupported object graphs.

## Regression

A shallow-copy isolator returns `{ ...state }` while sharing `state.nested`. The test proves:
- the transition returns `UNKNOWN`;
- canonical nested state remains unchanged;
- candidate executor is not called;
- conditional commit is not called.

## Focused CI evidence — all success on final commit

- [M0 non-authority Core contracts — run 39076971359](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076971359) — success
- [STEP 4 semantic validation — run 39076971377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076971377) — success
- [STEP 5 outcome classification — run 39076971375](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076971375) — success
- [STEP 3A/3B/3C verification — run 39076971406](https://github.com/snowdenxrp/aldea-ia/actions/runs/39076971406) — success

These are focused workflow results, not a claim that the full repository suite ran.

## Limits

This closes a state-graph aliasing defect at the protected-transition boundary. It does not prove that a production isolator is authentic, that the state is a complete authoritative snapshot, or that authority/commit paths are properly bound. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP.
