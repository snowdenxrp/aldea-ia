# NCS M0 — Cross-check Maestra / AB / P / NCS against current runtime

Date: 2026-10-18  
Branch: `ncs-clean-architecture`  
Status: ARCHITECTURAL CROSS-CHECK — PARTIAL ARCHIVE COVERAGE; IMPLEMENTATION DECISION PENDING

## Purpose

Prevent M0 from drifting into isolated fixes. Compare the current prepared-effect/replan path with already-established architectural constraints from the Maestra, the NCS checkpoint, recovery/common-mode research, custody/revocation research, and self-modification/Authority-of-Truth research. This is not a claim that every AB/P archive has been exhaustively reviewed.

## Sources inspected in this pass

- `NEXO_ARQUITECTURA_MAESTRA_CONTINUIDAD.md` (2026-09-23): Core, Constitution, Identity, Memory, Missions, Autonomy, Tool System, Governance, Observability, Replay, Temporal Model, Open Loops, Workflow, Disaster Recovery and Self-Reconstruction are already part of the target architecture. Do not create parallel sovereign engines for these responsibilities.
- `NCS_CHECKPOINT_2026-10-08.md`: explicit invariants including `CRASH != EXECUTION RESULT`, `UNKNOWN != RETRYABLE`, `RECONCILIATION != RETRY`, `CLAIM != EVIDENCE != VALIDATED EVIDENCE != VERIFIED EFFECT`; Operation Contract must specify reconciliation and verification for each capability.
- `NCS_RECOVERY_COMMON_MODE_AUDIT_2026-10-08.md`: assurance independence is a property of dependency chains, not number of components; recovery must identify surviving guarantees and common dependencies.
- `NCS_CONSTITUTIONAL_CUSTODY_REVOCATION_AUDIT_2026-10-08.md`: copy/signature/epoch/key continuity do not establish current constitutional authority or current authorization; freshness and causality are distinct.
- `NCS_SELF_MODIFICATION_AUDIT_2026-10-08.md`: authority-of-truth belongs to the domain; history reconstruction is not canonicalization; recovery, merge, consensus, integrity and provenance do not create authority.
- Historical constraints carried by the checkpoint: AB104.197 (reconstruct from CommitRecord, do not repeat uncertain action), AB104.212 (crash is not execution outcome), AB104.368 and GLOBAL-AUDIT-109. These are referenced as invariants, not re-investigated here.
- Current repository: `src/nexo/runtime.js`, `src/nexo/core/ownership.mjs`, `src/nexo/core/protected-transition.mjs`, `src/nexo/core/reconciliation.mjs`, `src/nexo/effect-adapter.js`, and their focused tests.

## Cross-check results

### 1. Maestra-to-code responsibility alignment

| Responsibility in Maestra | Current code evidence | Assessment |
|---|---|---|
| Missions / long-horizon / replanning | `runtime.js`, mission reconstruction and `replanPersistedNexoMission()` | Present, but must consume unresolved-effect state as a hard causal dependency. |
| Observability / Chronicle / Replay | persisted attempts, mission history and effect journal | Partial evidence. No claim of complete event-sourcing/causal reconstruction from these files alone. |
| Tool System / execution results | `effect-adapter.js` and effect journal | Caller-controlled reconciliation is blocked by M0.72; independent result verification is not connected. |
| Autonomy: observe → plan → act → verify → recover → replan | pieces exist across runtime/orchestrator/effect adapter/reconciliation | **Not proven as one end-to-end recovery loop.** |
| Governance / authority / authorization | ownership and protected-transition contracts | Does not establish that the current prepared-effect route has a real independent verifier/current fence/provenance source. Protected effects remain STOP. |
| Disaster Recovery / Self-Reconstruction | reconstruction helpers and persisted memory | Reconstruction exists in part; legitimate current-state reconciliation remains incomplete. |

### 2. Existing M0.71/M0.72 and new guard

- M0.71 rejects unauthenticated caller claims as reconciliation authority.
- M0.72 blocks caller-controlled `request.reconcile` from terminalizing an effect.
- The new replan guard checks the existing effect journal and prevents a successor mission when a matching effect remains `prepared`.
- These are compatible with AB104.197/AB104.212 and the checkpoint invariants.
- They are safety guards, not a positive reconciliation mechanism. They must not be described as PG-009 completion.

### 3. Root architectural gap — not a request to invent another core

A prepared effect can remain unresolved indefinitely because no independently grounded verifier/current fence/provenance source is wired into the runtime recovery path. The generic reconciler, ownership port, protected transition and effect adapter are not yet composed into one contract-grounded flow.

Before implementing a positive resolution, identify an existing Operation Contract/capability-specific source that can establish the effect outcome with declared provenance, integrity, freshness, causal relation and assurance. The executor's own callback or journal status alone is not sufficient.

If no such source exists for the capability, record that capability as unreconcilable under its current contract and preserve UNKNOWN/STOP. Do not add a universal reconciliation service, new trust root, invented epoch/token, queue, retry, tombstone or transaction wrapper as a substitute.

### 4. Additional audit requirement carried forward

The NCS checkpoint's explicit next audit is conflicting verification results and different assurance levels. M0 must not use majority, recency, or model preference as truth. The contract must define how contradictory evidence is evaluated and when the result stays UNKNOWN. This must be integrated into the existing Assurance/domain contract, not a new global conflict-resolution engine.

### 5. Retrieved AB/P/GLOBAL-AUDIT evidence — existing research, not rerun

The following original persisted artifacts were subsequently located and read:

- [GLOBAL-AUDIT-109 — STOP/revocation authority retention](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/docs/nexo/NEXO_GLOBAL_AUDIT_109_STOP_REVOCATION_AUTHORITY_RETENTION_2026-09-28.md): the audit explicitly leaves dependency completeness, TCB completeness, evidence-reducer completeness, independence proof, quorum semantics, and retention/reconstruction soundness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED. Its boundary requires downstream authorization/fencing outside the model and states that a cancellation acknowledgement or restored checkpoint does not prove effect absence/current authority.
- [AB104.999R — evidence-coverage reason/scope](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/docs/nexo/AB104_999R_evidence_coverage_reason_scope_audit_2026-09-29.md): UNKNOWN/NOT_CHECKED must retain cause, scope, authority, observation time and coverage; aggregate terminal state cannot promote an unresolved subset.
- [AB105.000R — aggregate evidence coverage boundary](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/docs/nexo/AB105_000R_aggregate_evidence_coverage_boundary_audit_2026-09-29.md): a completed check proves only its supported population/properties; aggregate evidence must retain its denominator and scope.
- [MASTER P112 checkpoint](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_CONTINUITY/MASTER_P112_CHECKPOINT_2026-10-07.md) and [P112 mutation-boundary trace V2](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_CONTINUITY/P112_AUTHORITATIVE_MUTATION_BOUNDARY_TRACE_V2_2026-10-07.md): protected validation needs a claim-specific transition footprint, including authoritative ReadSet/WriteSet/DependencySet, predicate/range/aggregate dependencies, derived provenance, incarnations and relevant versions; complete dependency capture remains OPEN. Existing stateRevision/spatial version-like fields are not demonstrated complete fences.

#### Direct implications for current M0 code

1. The runtime guard blocks a bare `completed` label when verification fields are absent/false and records `UNVERIFIED_COMPLETION_RESULT` with an explicit reason and operation scope (`missionId`, `stepId`, `action`, `target`) in attempt evidence, applying AB104.999R's reason/scope requirement. This is still self-reported adapter input at the boundary; it is not proof of independent source authenticity.
2. A prepared effect cannot be resolved from the effect journal's `prepared` status, a caller callback, a terminal mission aggregate, a restored checkpoint, or a late receipt alone. This follows GLOBAL-AUDIT-109 and AB104.212.
3. No current global revision, stateRevision, or local spatial version may be promoted to a universal effect fence. P112 explicitly records distributed writers and incomplete dependency closure.
4. These artifacts support the current fail-closed direction; they do not supply the missing independent verifier/current fence/provenance source or prove an integrated PG-009 recovery path.

Archive coverage is improved but remains **PARTIAL**: this pass retrieved these exact records, not every historical AB/P artifact or a definitive all-archive audit index. Do not rerun closed probes and do not claim exhaustive coverage.

## Next implementation sequence

1. Existing evidence retrieval is now partially complete: AB104.150/.151, P112 lifecycle/eviction, GLOBAL-AUDIT-109, AB104.999R and AB105.000R were read. Do not rerun those probes; archive coverage remains partial.
2. Define the narrow execution-owner boundary from the existing canonical state/persistence owner and mission runtime; the new gate report records requirements.
3. Specify the legitimate permission/admission input. If no legitimate source exists, protected execution remains STOP; do not create an executor that bypasses authority.
4. Implement the owner only after that contract is grounded, then add crash/restart, revision-conflict, PREPARED-before-dispatch, terminal-snapshot, and no-redispatch/no-successor fault-injection tests.
5. Run CI on each exact source+test head and preserve run IDs. The current runtime guard has exact-head STEP 4/STEP 5/mission-continuity PASS; the full PG-009 recovery architecture remains unverified.
6. Do not restart Step 7 research; it remains OPEN / STOP / UNKNOWN.

## Current truth

M0 is still the functional-core integration goal: observation/evidence → interpretation/decision → planning with permission controls → permitted execution → result verification → persistence/restart/recovery/replan. The current implementation has meaningful parts and several fail-closed guards, but end-to-end recovery is not proven. This is the actual blocker, not a reason to restart the whole architecture.
