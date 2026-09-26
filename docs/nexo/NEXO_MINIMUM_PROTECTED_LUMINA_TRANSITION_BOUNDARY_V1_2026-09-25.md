# NEXO — MINIMUM PROTECTED LUMINA TRANSITION BOUNDARY V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21 implementation.

## Boundary result
The minimum protected local transition is not the filesystem lock and not stateRevision. It is a protected control record whose final admission operation atomically validates the current authority context against the prepared effect binding.

Minimum conceptual records:
- OwnerFence: owner_identity, owner_generation, recovery_incarnation, authority_epoch.
- StopContext: stop_epoch, stop_state.
- ResourceBinding: resource_id, resource_incarnation, capability_class, fence_scope.
- EffectBinding: operation_id/effect_identity, mission_id, step_id, retry_generation.
- PreparedIntent: all above contexts plus policy/invariant versions, participant set, preconditions and durability marker.
- Admission: a protected linearization record proving the exact binding was admitted under the current context.

## Minimum admission predicate
A prepared effect is admissible only if, in one protected authoritative boundary:
1. owner_identity is current;
2. owner_generation matches the current owner fence;
3. recovery_incarnation is current/valid;
4. authority_epoch is current;
5. stop_epoch/context is still valid and execution is not blocked;
6. resource_incarnation matches the bound resource;
7. capability class and fence scope cover the requested mutation;
8. effect_identity is unique/compatible with prior history;
9. required policy/invariant versions remain valid;
10. the prepared intent itself is still current.

The critical property is that these checks are part of the same protected admission ordering. A separate read followed later by a handler call recreates the TOCTOU race.

## Execution meaning
CONTROL_ADMITTED means only that the control plane admitted the effect.
EFFECT_FENCED means the resource/intermediary accepted the current fence where the capability class requires it.
EFFECT_ATTEMPTED means dispatch may have occurred.
OUTCOME_CONFIRMED/REJECTED/UNKNOWN describe evidence about the external effect.
These states must not be inferred transitively.

## Local Lúmina consequence
Current stateRevision + filesystem lock can remain useful for serialized world-state persistence and optimistic concurrency. They cannot be promoted to the universal OwnerFence or external EffectFence.
Current nexoEffectRevision is an in-memory mutation counter and cannot serve as durable authority across restart.
A future bounded local Lúmina implementation could use the same protected persistence boundary only if the admission record, owner/fence context, prepared intent and world-state mutation share a clearly defined atomic/linearization contract. That is not currently proven.

## Crash cuts
P0 before protected admission: no effect admitted; intent may remain prepared.
P1 after admission before handler: admission is historical evidence; recovery must determine whether the local effect was dispatched/committed.
P2 after handler mutation before durable world-state commit: local state may have changed while durable state has not; recovery cannot infer the external/local durable outcome from the admission alone.
P3 after durable commit before response: response loss means outcome is not necessarily unknown to the system; recovery must reconcile against durable state using operation/effect identity.
P4 STOP or owner transfer after preparation but before admission: admission must reject stale context.
P5 STOP/owner transfer after admission: prior admission does not authorize a new retry; retry/compensation needs a new protected admission.
P6 resource replacement: old ResourceBinding is invalid unless continuity is explicitly proven.
P7 intermediary crash after accepting admission but before dispatch status: UNKNOWN until reconciliation.
P8 A confirmed/B unknown: preserve participant-level outcomes; aggregate only if a documented transaction boundary covers both.

## Key research support
etcd documents that lease ownership alone does not provide mutual exclusion; version validation at the protected mutation is what prevents stale owners, and external resources need their own version-validation mechanism. citeturn0search0turn0search1
etcd also documents that a client can be uncertain about an operation after timeout/network disruption, reinforcing that ambiguous completion cannot be treated as an automatic abort. citeturn0search3
Its authentication design provides a useful analogous TOCTOU lesson: stale authorization metadata must be checked at the state-machine/apply boundary rather than relying on an earlier check. citeturn0search5

## Decision
The clean architecture should define a ProtectedTransition/Admission boundary before implementation. The current code is evidence and prototype material, not the final authority contract.

## Historical residuals
AB50→AB58 remain unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED

## DO-NOT-REPEAT
Do not make stateRevision an OwnerFence by renaming it.
Do not treat a filesystem lock as an external fence.
Do not treat prepared intent as proof of execution.
Do not let a retry inherit old authority after STOP/transfer/restart.
Do not collapse UNKNOWN.
Do not implement V21 before the contract is formally refined and attacked.
Do not claim CI/test PASS without fresh evidence.

## EXACT NEXT ACTION
Attack this minimum boundary with exhaustive crash/race cases and determine whether one local persistence linearization can actually cover OwnerFence + PreparedIntent + local effect commit, or whether the architecture must separate control admission from effect commit even for Lúmina.