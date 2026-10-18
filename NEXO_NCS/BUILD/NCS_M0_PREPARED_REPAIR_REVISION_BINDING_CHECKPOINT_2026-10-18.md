# NCS M0 — PREPARED repair revision binding checkpoint

Date: 2026-10-18  
Code/test head: [`d0e38809992be291262153b527ec21a4793ac3d6`](https://github.com/snowdenxrp/aldea-ia/commit/d0e38809992be291262153b527ec21a4793ac3d6)

## Implemented

`createNexoContinuityOwner().recordPrepared()` now requires a valid non-negative safe integer `operation.environmentStateRevision` for new `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state` intents. It stores that revision on the PREPARED journal entry.

For an existing PREPARED repair:
- missing/invalid historical revision is preserved as unresolved and reported as `NEXO_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`;
- an attempted rebind to another revision is blocked as `NEXO_PREPARED_ENVIRONMENT_REVISION_MISMATCH`;
- omission of the required revision is blocked before any journal write.

Regression coverage checks that a repair can be prepared with revision 0, a request omitting the revision is rejected, and a second request cannot silently rebind that existing operation to revision 1.

## Important limits

This is an explicit historical binding in the Nexo intent record, **not yet an end-to-end dispatch fence**. The owner receives a revision supplied by its caller; this patch does not independently load/authenticate Lúmina's state, does not condition the adapter's mutation on the durable revision, and does not make the two stores atomic. Do not claim that stale dispatch is prevented yet.

Legacy PREPARED entries without the field remain loadable and unresolved so recovery does not discard historical obligations. No runtime cutover or settlement API was added. Non-repair actions retain their existing contract.

## Exact-head CI

The three workflows were triggered on the code/test head; record final outcomes before claiming PASS:
- Mission/restart: [39132557480](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132557480)
- Outcome classification: [39132557474](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132557474)
- Semantic validation: [39132557453](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132557453)

## Next gate

1. Add a Nexo-owned preparation path that loads the strict persisted environment snapshot itself and derives the bound revision from that exact snapshot, rather than trusting a caller-provided integer.
2. Add a conditional adapter entry that refuses to mutate if the durable environment revision is no longer the prepared revision. Reuse the existing `persistState(expectedRevision, stateRevision)` boundary; do not equate it with the in-memory `nexoEffectRevision`.
3. Preserve PREPARED on a stale revision or a commit conflict.
4. Add crash cuts at strict-load → PREPARED commit → dispatch guard → environment persist → recovery observation. Only after these are proven should terminal settlement be considered.

M0 remains incomplete. Protected effects STOP. STEP 7 OPEN / STOP / UNKNOWN.
