# NEXO Canonical Core V3 Audit — 2026-09-23

V3 was drafted to expose critical transitions and then immediately audited for semantic contradictions.

## Findings

### V3-F01 — Release authorization is not consumed
AuthorizeRelease increments a nonce, but Commit independently calls ReleaseEligible. Therefore authorization is currently observational rather than a required state transition.

Required correction: represent release authorization as an operation-bound record containing authorization epoch, evidence identity/version, owner generation and nonce; Commit must consume a still-valid authorization.

### V3-F02 — STOP is modeled as a global boolean/epoch
A global stop may be appropriate for a global emergency plane, but the model currently lacks target/effect scope and enforcement state. It cannot yet distinguish STOP_REQUESTED, STOP_ENFORCING, and STOP_VERIFIED.

Required correction: separate global emergency epoch from operation/effect stop fence and model enforcement state.

### V3-F03 — Authority epoch is globally scoped
A single authorityEpoch can invalidate unrelated operations. The architecture requires authority epochs to be scoped to the authority domain/context that actually changed.

Required correction: model authority context per operation/domain and define which changes fence which operations.

### V3-F04 — Version invalidation is incomplete
The current transition only detects mismatched versions when invoked; it does not define materiality, automatic invalidation on version transition, or trust-root/dependency-state invalidation.

Required correction: make evidence validity a derived condition plus explicit invalidation transitions where durable state requires them.

### V3-F05 — Freshness has no time model
The fresh flag is a placeholder, not a proof of temporal freshness.

Required correction: add logical time/deadline and a transition or predicate showing freshness at decision time.

### V3-F06 — Reconciliation generation is operation-global
A single reconciliationGeneration can unnecessarily couple unrelated operations and does not represent the generation owned by a particular lease.

Required correction: generation must be scoped to the operation/lease record.

### V3-F07 — External effect state is still absent
The canonical core contains evidence but no first-class external-effect state/identity lifecycle. Evidence alone cannot represent UNKNOWN/PARTIAL/APPLIED/REVERSED.

Required correction: add EffectState bound to EffectBinding and keep it distinct from EvidenceRecord.

### V3-F08 — Linearization points are still implicit
The actions imply atomic assignments but do not explicitly define or test the ordering semantics of competing actions.

Required correction: define the canonical state transition relation and adversarial pair orderings, then check mutual exclusion and stale-owner properties.

### V3-F09 — TLA+ syntax/typing is not yet execution-ready
V3 remains a design draft and contains illustrative schema references such as evidenceTemplate and record-shaped fields without finite constants/definitions sufficient for immediate model checking.

Status: SANY/TLC NOT RUN.

## Decision

Do not patch V3 incrementally. The findings show the canonical model needs one more structural pass: operation-scoped records for authority, generations and effect state; explicit release-authorization consumption; scoped STOP; logical freshness; and executable finite fixtures.

This audit is intentionally a gate before evaluator implementation.
