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

### 5. AB/P archive coverage caveat

The library search in this pass surfaced the Maestra and several NCS audits, and confirmed AB104.197/212/368 plus GLOBAL-AUDIT-109 references in the checkpoint. It did **not** surface the underlying full AB/P source records or a definitive named cross-archive audit report. Therefore this report does not claim exhaustive AB/P review. Next archive retrieval should target the exact audit report and relevant AB/P source records, especially the already-cited AB anchors and P112 active material, before treating the cross-check as complete. Do not rerun closed probes; retrieve their existing evidence.

## Next implementation sequence

1. Recover the exact existing AB/P audit report and relevant original records; map their conclusions to the above gap without reopening closed investigations.
2. Trace the capability-specific Operation Contract from mission step → prepared effect → effect journal → verifier/reconciliation → verified result → mission continuation.
3. Prove the source of outcome evidence and its dependencies. If no source exists, leave the effect UNKNOWN and specify the missing contract input; do not fake a verifier.
4. Add an integrated end-to-end regression for crash/restart, stale mission state, unresolved effect, conflicting reports, and no redispatch/no successor.
5. Run CI on the exact source+test head and attach run IDs/logs. Until then, tests are unverified.
6. Only after the existing route is contract-grounded, integrate it through runtime/orchestrator. Do not restart Step 7 research; it remains OPEN / STOP / UNKNOWN.

## Current truth

M0 is still the functional-core integration goal: observation/evidence → interpretation/decision → planning with permission controls → permitted execution → result verification → persistence/restart/recovery/replan. The current implementation has meaningful parts and several fail-closed guards, but end-to-end recovery is not proven. This is the actual blocker, not a reason to restart the whole architecture.
