# NCS M0.12 — Observation deep-immutability boundary

Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: IMPLEMENTED / FOCUSED CI PASS

## Finding

The previous observation contract used `structuredClone()` followed by recursive `Object.freeze()`. That does not make internal state of `Map` and `Set` immutable, and freezing a `Date` does not disable its mutator methods. The envelope therefore claimed stronger immutability than it guaranteed for structured-cloneable non-plain objects.

## Change

- `src/nexo/core/observation.mjs`: before freezing detached payload data, validate recursively that object nodes are arrays or plain objects. Reject non-plain object instances with a `TypeError`.
- `tests/nexo/observation.test.mjs`: add rejection tests for a top-level `Map`, a `Date`, a nested `Set`, and a `Map` inside a candidate claim.
- Existing plain-object/array detachment, freezing, and UNKNOWN admission behavior remains covered.
- No runtime, orchestrator, authority gate, claim identity, commit, persistence, or protected-effect wiring changed.

## Exact evidence

- Source commit: `854235380c2f21f7a8f0fda7203aa5d73b6cf0aa`
- Test commit / CI head: `470636145a2ed4ab553c7d972abeeee41e77f445`
- Workflow run: https://github.com/snowdenxrp/aldea-ia/actions/runs/38979481395
- Job `observation-contract`: success.
- All seven configured commands succeeded on that exact head:
  1. `node tests/nexo/observation.test.mjs`
  2. `node tests/nexo/observation-equivalence.test.mjs`
  3. `node tests/nexo/outcome-classifier.test.mjs`
  4. `node tests/nexo/core-contracts.test.mjs`
  5. `node tests/nexo/protected-transition.test.mjs`
  6. `node tests/nexo/reconciliation.test.mjs`
  7. `node tests/nexo/orchestrator.test.mjs`

## Boundaries / non-claims

- This is a focused contract fix, not proof of the full `npm test` suite.
- Plain-data validation is structural only; it does not authenticate producer provenance, establish freshness, or make an observation truthful.
- It does not resolve the missing legitimate claim identity, constitutional owner authority, production runtime-to-gate wiring, or bypass closure.
- No authority or protected effect is enabled by this change.

STEP 7 remains OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective.
