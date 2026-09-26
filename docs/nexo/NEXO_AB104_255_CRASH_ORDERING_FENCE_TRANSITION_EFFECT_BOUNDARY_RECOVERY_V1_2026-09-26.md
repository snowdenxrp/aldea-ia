# NEXO AB104.255 — Crash Ordering Between Authority Fence Transition and External Effect Boundary — V1 — 2026-09-26

## Scope
Research-only. No architecture implementation, migration, or prototype patch. Goal: study crash/interleaving orderings between an authority/fence transition, target-side effect acceptance, and the operation registry.

## Evidence studied
- Direct current code in src/nexo/effect-adapter.js, src/nexo/runtime.js, src/nexo/orchestrator.js.
- Raft/linearizability literature and formal-verification material.
- Fencing-token literature and target-side atomic transaction patterns.
- IETF Action Evidence Boundary draft as a recent independent reference for the distinction between local durable consume/reserve and unrelated remote effects.

## Direct prototype observations
1. effect-adapter.js records a prepared intent before handler invocation. Prepared is insufficient to prove non-occurrence and existing prepared requires reconciliation.
2. Handler exceptions return EFFECT_OUTCOME_UNKNOWN without calling persist(); therefore this branch is not demonstrated as a durable UNKNOWN record.
3. Successful completion is persisted only after handler return and postcondition verification. This is prototype evidence, not proof that external mutation and local record share one atomic commit point.
4. The current idempotency key is missionId:stepId; it does not itself bind target incarnation, authority epoch/fence, or payload fingerprint.
5. runtime.js records execution/outcome after adapter completion.
6. orchestrator.js requires verified evidence for completed steps, but this is mission-level evidence handling, not proof of target-side linearization.

## Crash/interleaving matrix

### A. Transition durable before send
Authority generation/fence T becomes durable before the effect request is sent.
- Old worker carrying prior fence should be rejected if the target actually enforces the new fence/high-water mark.
- If the target has not received/learned the new fence state, local durability alone does not prove target enforcement.
- Safe conclusion requires a target-side predicate or an intermediary that enforces the fence at the mutation boundary.
- If send occurs and target enforcement is ambiguous, outcome can still be UNKNOWN_EXTERNAL.

### B. Send/accept before transition durable
Target accepts effect under the currently valid authority, then authority transition T crashes before becoming durable.
- The effect is not retroactively invalid merely because transition was attempted locally.
- Recovery must distinguish historical effect acceptance from current authority.
- If T was never durably established, recovery cannot infer that the effect used the successor generation.
- If T's durable commit point exists but response was lost, reconcile against authoritative target/registry.

### C. Target accepts while coordinator has not observed transition
The target can be ahead of the coordinator's local view.
- Local absence of a transition record is not proof that target rejected the effect.
- Target-authoritative operation record/receipt can establish COMMITTED even when coordinator crashed before recording it.
- If target evidence is unavailable and both commit and non-commit executions remain consistent with observed evidence, classify UNKNOWN.

### D. Transition visible locally but not durably enforced at target
A coordinator may observe a new epoch/fence while target still accepts old fence.
- Local visibility != target enforcement.
- A stale worker remains dangerous until target's final mutation boundary rejects its old fence.
- Architecture needs an explicit propagation/linearization contract or must retain a residual uncertainty window.

### E. Operation registry says ACCEPTED but resource mutation is uncertain
ACCEPTED must not automatically mean COMMITTED.
- If registry acceptance and target mutation are not one atomic boundary, a crash between them leaves an UNKNOWN interval.
- A registry receipt reconstructs COMMITTED only if the contract defines it as authoritative evidence of the same target commit boundary.
- Otherwise ACCEPTED is evidence of admission/reservation, not proof of mutation.

### F. Resource mutation commits but registry record is lost
- Target-authoritative receipt/history can establish COMMITTED despite missing local registry data.
- If target cannot reconcile, local absence is not NOT_COMMITTED.
- Recovery must reuse the same operation identity and fingerprint rather than create a fresh operation that could duplicate the effect.

## Key invariant candidate
For any recovery observation E: if there exist two admissible executions H1 and H2 that produce indistinguishable E, where H1 has target effect committed and H2 has target effect not committed, recovery MUST NOT classify E as NOT_COMMITTED or COMMITTED. It remains UNKNOWN, or a more specific unresolved class such as PARTIAL or CONFLICT.

## Linearization requirement
The central unresolved architecture question is not simply which record is written first. It is whether there is a single authoritative linearization point that orders:
1. authority/fence transition,
2. target-side operation acceptance,
3. protected resource mutation,
4. authoritative operation receipt.

Raft-style linearizability shows why externally observable ordering must correspond to an authoritative state-machine order; committed state-machine commands are applied in a defined order. But Nexo cannot assume Raft/consensus semantics unless the eventual architecture actually chooses and implements them.

For a target inside one transactional domain, a candidate boundary is:
CHECK current fence + CHECK target incarnation + CHECK expected resource version + CHECK operation identity/fingerprint + APPLY mutation + RECORD operation receipt
as one atomic transaction.
For an unrelated external provider, that atomicity cannot be inferred merely from local journaling. A boundary/intermediary or explicit reconciliation contract is required.

## Recovery consequence
Recovery order candidate:
1. verify trusted authority context and current fence;
2. verify target incarnation;
3. locate authoritative operation record/receipt;
4. compare exact operation identity + payload fingerprint;
5. determine whether registry evidence is itself bound to target mutation;
6. reconcile UNKNOWN/partial cases;
7. only then decide whether a retry is admissible;
8. preserve original operation_id/fingerprint on retry where target idempotency exists.
A stale fence response is evidence about current admissibility, not by itself historical proof that the original operation never committed.

## Research conclusions
- Fencing, idempotency, CAS/resource version, and operation registry solve different failure dimensions; none substitutes automatically for the others.
- Authority transition ordering and external-effect ordering need an explicit linearization contract.
- Transition durable first is safer only if the protected target enforces the resulting fence before mutation; local durability alone is insufficient.
- Registry accepted is not equivalent to effect committed unless both share an authoritative commit boundary.
- Missing local records are not negative evidence.
- UNKNOWN is the correct epistemic result when commit/non-commit histories remain indistinguishable.
- No implementation was added. No architecture decision was finalized.

## External references
- Raft paper: linearizable state-machine ordering and state-machine safety.
- Verdi/formal verification work: proof obligations connecting state-machine safety to linearizability.
- Fencing-token references: stale workers must be rejected by the protected resource, not merely by the lock holder.
- IETF Action Evidence Boundary draft: durable consume/reserve must be atomic within its own relying-party domain and does not claim atomicity with an unrelated remote provider.

## Status
CLAIM_STATUS: RESEARCHED_NOT_FORMALLY_VERIFIED
IMPLEMENTATION: NOT_PERFORMED
ARCHITECTURE_SELECTION: NOT_PERFORMED
SEMANTIC_FREEZE: NOT_DECLARED
AB50_AB58_RESIDUALS: UNCHANGED
