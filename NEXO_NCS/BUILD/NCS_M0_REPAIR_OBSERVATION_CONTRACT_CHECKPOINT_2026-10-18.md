# NCS M0 — Read-only persisted repair observation checkpoint

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Code/test commit: [`8a89ef9b83b3126db3e83122a7876abe2a78819f`](https://github.com/snowdenxrp/aldea-ia/commit/8a89ef9b83b3126db3e83122a7876abe2a78819f)

## Implementation

Added `src/nexo/adapters/persisted-repair-observation.mjs`, a read-only, action-specific observer for the three candidate convergent repairs:

- `repair_agent_state`
- `repair_agent_needs`
- `repair_resource_state`

It classifies the invariant in a snapshot as `desired_state_present`, `desired_state_absent`, or `unknown`. It requires a non-negative safe `stateRevision`, a structurally plausible snapshot, a supported repair action, and an explicit target. Unknown life-state, missing target/resource, malformed collection shapes, and invalid snapshot revision fail closed. Evidence includes the source label and observed environment revision. The supplied snapshot is not mutated.

## Hard boundary

The observer does **not** return a `verified` boolean, settle the Nexo journal, authorize retry, or prove that this operation caused the state. It is diagnostic evidence only. The existing crash-cut test continues to prove that even when the desired state survives restart, the Nexo PREPARED journal remains unresolved until a separate settlement contract exists.

The observer assumes its caller obtained the snapshot through `loadStateStrict()`; it does not independently authenticate the file or make the observation atomic with later writes. The PREPARED record does not currently bind an authoritative environment revision, and Nexo continuity and Lúmina state remain separate commits. Therefore this change does not remove the settlement/concurrency gap.

## Regression coverage and exact-head CI

The existing mission/continuity test now checks present, absent, unknown, invalid-revision, and non-mutation cases alongside the durable repair crash cut.

- Mission/continuity: [39107811320](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811320) — PASS; log confirms the new test.
- Semantic validation: [39107811311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811311) — PASS.
- Outcome classification: [39107811306](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811306) — PASS.

## Next gate

Design and test the actual **repair-only settlement contract** without pretending this observer is atomic or authoritative by itself. Resolve:
1. Whether a satisfied repair invariant is enough to complete a *goal-state repair step* even if exact operation attribution is impossible.
2. How the environment revision observed at PREPARED is bound to a safe dispatch/reconciliation decision.
3. How stale environment state and concurrent writes are prevented from invalidating the observation before settlement.
4. How Nexo continuity revision conflicts preserve PREPARED and avoid partial settlement.

Do not wire runtime dispatch/outcomes or add a generic transaction wrapper before these points are resolved. Non-idempotent effects remain UNKNOWN and must not be replayed. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.
