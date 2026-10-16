# NCS M0.8 — Reconciliation authority-marker limitation
Date: 2026-10-16
Branch: `ncs-clean-architecture`
Status: TRUST BOUNDARY LIMITATION CONFIRMED IN SOURCE / PRODUCTION IMPACT NOT ESTABLISHED

## Finding
In `src/nexo/core/reconciliation.mjs`, `createReconciler().reconcile()` selects the first evidence item satisfying:
- `item.authoritative === true`
- `typeof item.outcome === "string"`

It then returns `status: "RESOLVED"` and returns that item as evidence. The inspected implementation does not itself authenticate the producer, validate a signature, bind the item to a canonical authority decision, or verify provenance of the boolean marker.

The existing `tests/nexo/reconciliation.test.mjs` explicitly expects an item marked `authoritative: true` to resolve reconciliation. This tests current structural behavior, not legitimate authority.

## Correct interpretation
`RESOLVED` currently means that the local reconciler found an item matching its structural predicate. It must not be represented as proof that:
- the evidence is authentic;
- the marker was set by a legitimate authority;
- the outcome belongs to the same real protected transition;
- a constitutional decision was made;
- a protected effect is safe or authorized.

This source-level finding does not establish a production exploit or bypass. Production call paths, evidence producers, persistence, and consumers have not been exhaustively traced in this bounded pass.

## Decision / constraints
- Do not wire reconciliation output into authority approval or protected effects.
- Do not “fix” this by adding a new identity, signature, key, trust registry, queue, or generic proof framework without a root contract and owner review.
- Preserve fail-closed behavior at protected boundaries: absent a verifiable, legitimate source of authority evidence, result remains UNKNOWN/STOP rather than being promoted based on a caller-controlled flag.
- A future fix must begin by identifying the existing evidence producer and canonical authority source, if any, then specifying how provenance is bound and independently checked. If no such source exists, stop for a root-contract decision.

## Evidence
- Source: `src/nexo/core/reconciliation.mjs`, blob `be295ef681cac75b9b13228e30dd17c49c3023bd`.
- Existing test: `tests/nexo/reconciliation.test.mjs`, blob `4976309e9bb994978cfe07d0aeb8ac66f425b4d7`.
- The narrow M0 workflow currently includes observation, observation-equivalence, outcome-classifier, and core-isolation tests. It does **not** include reconciliation tests yet. No CI claim is made for reconciliation in this note.

## Next bounded action
Inspect existing reconciliation callsites and evidence producers on the current branch. Trace source -> creation/persistence -> reconciliation input -> consumer, using only existing fields and logs. Do not alter runtime or protected-transition wiring. If producer provenance cannot be demonstrated, retain this as an explicit unresolved trust boundary.

STEP 7 remains OPEN / STOP / UNKNOWN; Direction B / L2 remains the objective. No constitutional commissioning or protected effects.
