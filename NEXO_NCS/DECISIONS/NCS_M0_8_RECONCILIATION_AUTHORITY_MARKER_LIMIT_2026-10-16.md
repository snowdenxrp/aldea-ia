# NCS M0.8 — Reconciliation authority-marker limitation
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: CALLER-TRUST BOUNDARY CONFIRMED / NO NEW CORE INTEGRATION FOUND IN BOUNDED SCAN

## Finding
In `src/nexo/core/reconciliation.mjs`, `createReconciler().reconcile()` selects the first evidence item satisfying:
- `item.authoritative === true`
- `typeof item.outcome === "string"`

It then returns `status: "RESOLVED"` and returns that item as evidence. The inspected implementation does not itself authenticate the producer, validate a signature, or verify provenance of the boolean marker. This is consistent with the historical STEP 6 runtime proof, which explicitly says the implementation accepts the evidence outcome as supplied by the owning caller and that STEP 6 did not define an authentication mechanism. Therefore this is a trust assumption at the reconciliation interface, not a newly discovered contradiction with the documented STEP 6 contract.

The existing `tests/nexo/reconciliation.test.mjs` explicitly expects an item marked `authoritative: true` to resolve reconciliation. This tests current structural behavior, not legitimate authority.

## Correct interpretation
`RESOLVED` currently means that the local reconciler found an item matching its structural predicate. It must not be represented as proof that:
- the evidence is authentic;
- the marker was set by a legitimate authority;
- the outcome belongs to the same real protected transition;
- a constitutional decision was made;
- a protected effect is safe or authorized.

This source-level finding does not establish a production exploit or bypass. A bounded scan of 17 JavaScript/module files under `src/nexo` and `scripts` on the current branch found no callsite invoking the new-Core `createReconciler()`; the only `reconciliation.reconcile` occurrence is the default capability-separated port in `src/nexo/core/ownership.mjs`. The separate legacy `src/nexo/effect-adapter.js` uses its own request-supplied `reconcile` callback and must not be conflated with the new-Core reconciler. This is not an exhaustive repository-wide call graph or bypass audit.

## Decision / constraints
- Do not wire reconciliation output into authority approval or protected effects.
- Do not “fix” this by adding a new identity, signature, key, trust registry, queue, or generic proof framework without a root contract and owner review.
- Preserve fail-closed behavior at protected boundaries: absent a verifiable, legitimate source of authority evidence, result remains UNKNOWN/STOP rather than being promoted based on a caller-controlled flag.
- A future fix must begin by identifying the existing evidence producer and canonical authority source, if any, then specifying how provenance is bound and independently checked. If no such source exists, stop for a root-contract decision.

## Evidence
- Source: `src/nexo/core/reconciliation.mjs`, blob `be295ef681cac75b9b13228e30dd17c49c3023bd`.
- Prior contract: `NEXO_NCS/BUILD/STEP_6_RECONCILIATION_BOUNDARY_2026-10-08.md`, blob `a143992ebded9d078937db9451a65caec81b4bde`.
- Prior proof: `NEXO_NCS/PROOF/STEP_6_RUNTIME_VERIFICATION_2026-10-08.md`, blob `2e1d46b41f19e10e63a3fa58186fde412198fc52`.
- Existing test: `tests/nexo/reconciliation.test.mjs`, blob `4976309e9bb994978cfe07d0aeb8ac66f425b4d7`.
- The narrow M0 workflow currently includes observation, observation-equivalence, outcome-classifier, and core-isolation tests. It does **not** include reconciliation tests yet. No CI claim is made for reconciliation in this note.

## Next bounded action
Do not reopen the closed STEP 6 work. Preserve the documented scope: the owning caller is responsible for supplying evidence sufficient to establish the outcome. Before any future production integration, that caller must be identified and its provenance guarantee demonstrated; absent that guarantee, the caller must not feed a caller-controlled `authoritative` flag as sufficient evidence. No new-Core production caller was found in the bounded scan, so no runtime patch is justified now.

STEP 7 remains OPEN / STOP / UNKNOWN; Direction B / L2 remains the objective. No constitutional commissioning or protected effects.
