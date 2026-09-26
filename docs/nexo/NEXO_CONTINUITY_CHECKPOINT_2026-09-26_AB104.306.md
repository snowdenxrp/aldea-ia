# NEXO CONTINUITY — AB104.306

## Canonical state
AB104.306 research persisted. No implementation performed.

## Finding
Fencing protects each target independently against stale authority; it does not create atomicity across multiple targets. A common authority epoch is not proof that all targets accepted the same epoch or committed the same effect.

## Required semantics
For multi-target effects, preserve per-target evidence. Aggregate COMMITTED only when the contract's complete commit boundary/evidence covers every required target. Otherwise preserve PARTIAL, UNKNOWN, or CONFLICT as applicable.

## Constraints carried forward
- Research/study before clean architecture.
- No V21 / no patching historical prototype.
- No unsupported security/correctness/verification claims.
- Preserve AB50–AB58 unresolved ternary/EventDAG/FutureObs_PAA findings.
- No overwrite/delete of historical continuity.

## Exact next action
AB104.307: study heterogeneous targets and the case where one target cannot enforce fencing; define what evidence can and cannot establish current authority/effect state.

## DO-NOT-REPEAT
Do not equate a shared epoch, coordinator decision, matching revision, or per-target success with atomic cross-target commitment unless the authenticated commit boundary actually covers the full participant set.
