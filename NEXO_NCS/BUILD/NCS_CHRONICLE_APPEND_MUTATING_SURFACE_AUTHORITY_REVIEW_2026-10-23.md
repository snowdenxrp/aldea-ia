# NCS — Chronicle append: mutating surface and authority separation

Date: 2026-10-23
Status: SOURCE REVIEW — NO RUNTIME CHANGE

## Confirmed reachable mutation path

Current source inspection confirms the independent CLI `scripts/nexo.mjs` accepts `chronicle-append` and routes it through `scripts/nexo-chronicle-session.mjs` to `runNexoChronicleAppend` in `src/nexo/application/chronicle-append.mjs`.

The application path:
1. Opens continuity and Chronicle stores using caller-supplied filesystem paths.
2. Builds Chronicle effect contracts and opens the continuity owner with those verifiers.
3. Admits a one-step `chronicle_append` mission.
4. Creates an effect adapter with the Chronicle handler/verifier registry.
5. Calls `executeNexoStepWithContinuityOwner`.
6. The Chronicle handler calls `store.append(...)`; a successful store result is represented as `status: "completed"` with `verified: false` at handler level. The public result can report `dispatchAttempted: true`.

The CLI test `tests/nexo/entrypoint.test.mjs` runs this path with temporary files and expects the append to complete. This is therefore not merely a theoretical or unreachable code path.

## Crucial distinction

This narrow Chronicle append is a real local file mutation. It must not be described as “no effects are possible” or conflated with the blocked M0 product repair path.

At the same time, its public response explicitly preserves `authorization: "NOT_EVALUATED"`, and the effect handler's result marks `verified: false`. Therefore the successful local append does not establish legitimate owner authority, constitutional authorization, or general permission for protected effects.

The current `STATUS.md` label `protected effects: STOP` needs to be interpreted narrowly as “no constitutional/protected action is authorized by verified owner authority”; it is not evidence that every local mutation route is disabled. If the intended policy is instead to block all mutating Nexo CLI commands until authority is established, that policy is not currently enforced by this Chronicle CLI path and requires an explicit architectural decision before code changes.

## Boundary and trust notes

- The CLI has a narrow allowlist; generic commands such as `execute`, `run`, `effect`, and `repair` are rejected.
- The explicit `chronicle-append` route remains available and can create or append to the paths supplied through CLI arguments, subject to its store and mission checks.
- The operation is local Chronicle persistence, not proof of a legitimate identity root or authorization to execute arbitrary external effects.
- Reflective checks in JavaScript still cannot rule out Proxy traps from hostile in-process callers.
- Do not “fix” this by adding an isolated guard or silently changing established CLI behavior. First decide whether Chronicle append is an intentionally permitted, low-authority local capability or must be gated by the same root authority as all mutations.

## Decision needed from architecture, not assumed here

Recommended default: classify Chronicle append as a **narrow, explicitly exposed local persistence capability**, distinct from protected external effects, while keeping authority explicitly `NOT_EVALUATED`. Add a clear constitutional contract specifying whether it may mutate local audit/continuity data before owner-root commissioning. If Constitution requires no mutation whatsoever before that point, then the current CLI path must be disabled at the application boundary and tested as such. This document does not silently choose or implement either policy.

## Current state

- M0: `INCOMPLETO`
- Authorization: `NOT_EVALUATED`
- Legitimate root: `PENDING/UNKNOWN`
- Protected effects: `STOP`
- Runtime changed: no
- CI claimed for this document: none until independently observed
