# NEXO — ABSORBING STATE + CONCURRENT EFFECTS + HIDDEN DOWNSTREAM CONTINUATIONS RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL DESIGN ONLY
Verification: NOT SANY/TLC VERIFIED; NOT IMPLEMENTATION VERIFIED; NOT RUNTIME VERIFIED

## 1. Objective

Attempt to break the safe-tombstone / absorbing-state construction under:
- concurrent effects;
- delayed and duplicate messages;
- hidden downstream queues;
- child operations;
- retries/redrives;
- compensation;
- resource replacement;
- STOP/recovery races.

External cross-check: AWS documents that asynchronous work can remain queued after a caller receives a response, that duplicate delivery is possible, and that idempotency must be propagated through downstream calls. AWS also warns that stale queued work can remain relevant and that queues can accumulate work after processing stops. These are research inputs, not proof of Nexo semantics. citeturn0search0turn0search3turn0search6turn0search11

TLA+ provides the appropriate modeling frame: concurrent systems can be represented as state machines, and refinement can relate implementation behavior to an abstract specification. A finite model must therefore include the hidden continuation states that matter to the abstract safety property rather than modeling only the initiating process. citeturn0search2turn0search8

## 2. First break attempt: local absorption, remote continuation

Sequence:
E1 -> UNKNOWN
→ local resource R enters absorbing state
→ old capability fenced at R
→ hidden queue Q still contains E1 continuation
→ Q delivers to downstream D
→ D acts on shared footprint.

Conclusion:
Local absorption is invalid as a global claim unless Q/D are inside the containment/effect-path closure and are blocked, fenced, or proven irrelevant.

Rule:
LOCAL_ABSORPTION != GLOBAL_ABSORPTION.

## 3. Second break: concurrent E2

Sequence:
E1 -> UNKNOWN
E2 concurrently modifies the same footprint
E1 then enters absorbing state.

If E2 can change whether the absorbing transition is safe, E1's absorption proof was incomplete.

Therefore an absorbing action must consider concurrent effects that can interact with:
- its target;
- its fence;
- its queues;
- its physical footprint;
- its invariant;
- its uncertainty set.

Candidate requirement:
ABSORPTION_SCOPE includes all concurrent effects capable of invalidating the absorption proof.

## 4. Third break: compensation race

E1 -> UNKNOWN
→ containment A
→ recovery decides compensation C
→ E1's original delayed request arrives
→ C and E1 interact.

Compensation is a new protected effect. It cannot be treated as a consequence-free cleanup action.

If C is safe only in the world where E1 occurred, but unsafe where E1 did not occur, C is not SAFE_UNDER_UNCERTAINTY.

Absorption can therefore be safer than compensation when it blocks future harm without requiring historical classification.

## 5. Fourth break: duplicate/retry path

E1 -> UNKNOWN
→ absorbing fence activated
→ stale retry E1' arrives.

If the resource rejects E1' by current fence/effect identity, the retry path is contained.

If the retry reaches a downstream service that does not enforce the same identity/fence semantics, the absorption proof fails.

Idempotency reduces duplicate side effects, but it is not equivalent to global fencing, historical reconciliation, or commutativity. AWS explicitly treats idempotency as a mechanism for safe handling of duplicate requests and recommends propagating the idempotency token through downstream services. citeturn0search0

## 6. Fifth break: resource replacement

E1 -> UNKNOWN
→ R1 absorbed/fenced
→ R1 replaced by R2
→ external identifier remains R
→ old queue targets R
→ R2 accepts default state.

Conclusion:
Resource replacement creates a new incarnation. The old absorption proof does not automatically transfer.

Invariant:
RESOURCE_INCARNATION_CHANGE invalidates absorption/fence/evidence bindings unless the new incarnation explicitly inherits a protected safety state through a verified transition.

## 7. Sixth break: recovery-of-recovery

E1 -> UNKNOWN
→ absorption partially activated
→ crash
→ Recovery A begins
→ crash
→ Recovery B begins
→ A's delayed command arrives.

Recovery progress is not recovery authority.

A new recovery incarnation must acquire current ownership/fence and revalidate the absorbing state. Historical progress may guide recovery but cannot authorize it.

## 8. Seventh break: STOP ordering

E1 -> UNKNOWN
→ absorption requested
→ STOP requested concurrently
→ absorption commits
→ old effect arrives.

The final safety state must reflect the protected ordering of STOP and absorption, not message arrival order.

Candidate:
If STOP invalidates the transition, the absorption result cannot be used for release without revalidation.
If absorption linearizes first and remains compatible with STOP, the resulting state must still satisfy the newer STOP constraint.

STOP is therefore part of the absorption context, not an external boolean.

## 9. Eighth break: hidden child effect

E1 launches child E1-child.
Parent enters absorbing state.
Child remains capable of external effect.

Parent absorption is not global absorption.

The effect footprint must include child-effect paths whenever they can affect the protected claim.

## 10. Ninth break: queue semantics

A queue may contain:
- pending original effects;
- retries;
- compensation;
- stale messages;
- callbacks;
- delayed work;
- redrives.

Therefore:
QUEUE_EMPTY is not required for every absorption claim, but the claim must establish what happens to every queued effect capable of violating it.

Possible mechanisms:
- queue fencing;
- message epoch;
- effect identity;
- consumer-side rejection;
- durable cancellation;
- bounded expiry;
- quarantine;
- provider-specific reconciliation.

No generic queue mechanism is assumed sufficient.

## 11. Tenth break: stale observer

After absorption, an observer reports the old resource state and recovery interprets it as proof that absorption failed or succeeded.

Observation must be bound to:
- resource incarnation;
- fence generation;
- effect identity;
- observation generation;
- context identity;
- freshness.

A stale observation cannot reopen or close a safety claim.

## 12. Eleventh break: concurrent scope reduction

CCD = {A,B,C}.
C is locally absorbed.
Scope reduction begins.
A new E2 enters C before reduction linearizes.

If E2 can interact with A/B or invalidate the absorption proof, the reduction is stale.

Therefore:
SCOPE_REDUCTION must serialize against all interactions that can invalidate the absorption certificate.

## 13. Twelfth break: hidden shared physical footprint

C appears logically isolated but shares:
- power;
- actuator;
- storage;
- network path;
- scheduler;
- provider quota;
- physical resource;
- control plane

with A.

Logical object separation is insufficient.

Absorption must use the shared-footprint graph, not merely object identifiers.

## 14. Thirteenth break: autonomous resource

The coordinator fences all known controllers, but the resource itself can continue an autonomous operation.

Then:
CONTROLLER_FENCED != RESOURCE_QUIESCENT.

Absorption requires resource-specific semantics for autonomous behavior.

## 15. Fourteenth break: downstream idempotency mismatch

A upstream service preserves E1's idempotency identity.
Downstream service creates a new request identity.
Retry occurs downstream.

Now duplicate suppression may fail.

Therefore effect identity must survive the complete protected effect path, or the downstream boundary must establish an equivalent safe identity mapping.

## 16. Fifteenth break: absorption changes the uncertainty set

E1 -> UNKNOWN with U={W1,W2}.
Absorption A is safe in both.
During A, hidden dependency Q is discovered.
Q creates additional possible histories.

Therefore:
U may expand during recovery/containment.

The architecture must not assume uncertainty monotonically decreases.

Candidate invariant:
NEW_MATERIAL_FOOTPRINT => RECOMPUTE_UNCERTAINTY_OR_BLOCK.

## 17. Stronger concept: Effect-Path Closure

The earlier scope closure needs a dedicated protected subset:

EPC(E) =
all reachable paths that can still create, modify, cancel, compensate, retry, redrive, or otherwise produce a protected external effect causally related to E.

It includes:
- initiating process;
- queues;
- child workers;
- callbacks;
- provider continuations;
- retries;
- compensation paths;
- failover;
- autonomous resource behavior;
- replacement resources where continuity is relevant.

This is not identical to the dependency graph.

A dependency can affect authorization without itself being capable of producing the external effect.

Therefore:
DEPENDENCY_CLOSURE != EFFECT_PATH_CLOSURE.

## 18. New object: EffectPathClosure

Candidate object:

EffectPathClosure {
  closure_id
  effect_id
  claim_id
  reachable_effect_paths
  queue_paths
  child_effects
  provider_continuations
  retry_paths
  compensation_paths
  failover_paths
  autonomous_paths
  resource_incarnations
  closure_version
  completeness_status
  context_identity
  invalidation_triggers
}

It is evidence/context, not authority.

## 19. New object: AbsorptionBoundary

Candidate:

AbsorptionBoundary {
  boundary_id
  claim_id
  protected_scope
  effect_path_closure
  allowed_future_effect_classes
  forbidden_effect_classes
  fence_set
  resource_incarnations
  enforcement_points
  exit_protocol
  continuity_requirements
  invalidation_state
}

The boundary is valid only if every protected path crosses an enforcement point covered by the claim.

## 20. New distinction: absorption vs quiescence

ABSORBING_SAFE_STATE means future transitions preserve the claim.

QUIESCENT means no relevant effect is currently executing or admitted.

A system can be absorbing without being quiescent if its allowed future operations are all claim-preserving.

Conversely, a system can appear quiescent while stale queued work remains.

Therefore:
QUIESCENCE != ABSORPTION.

## 21. New distinction: absorption vs cancellation

CANCELLATION attempts to stop a particular effect.

ABSORPTION establishes a state in which the protected invariant remains safe regardless of the remaining historical uncertainty.

Cancellation can fail while absorption still succeeds if a broader fence/containment state prevents harmful future effects.

Thus:
CANCELLATION != ABSORPTION.

## 22. New distinction: absorption vs reconciliation

Reconciliation determines external-world state.

Absorption constrains future admissible effects.

Therefore:
ABSORPTION != RECONCILIATION.

They can occur independently or sequentially.

## 23. Absorption and safe non-convergence

A strong safety outcome can be:

UNKNOWN HISTORY
+ VERIFIED ABSORBING BOUNDARY
+ NO SAFE EXIT
= SAFE NON-CONVERGENCE.

This is preferable to guessed convergence when resolving the history would require an unsafe effect.

## 24. Candidate absorption protocol

REQUEST
→ EFFECT-PATH-CLOSURE
→ UNCERTAINTY-CLOSURE
→ CONFLICT ANALYSIS
→ PREPARE ABSORPTION
→ PROTECTED ABSORPTION LINEARIZATION
→ FENCE/ENFORCEMENT ACTIVATION
→ ENFORCEMENT VERIFICATION
→ INVALIDATE OLD SCOPE
→ PUBLISH ABSORPTION CLAIM
→ OPTIONAL RECONCILIATION
→ OPTIONAL SCOPE REDUCTION.

Critical:
PREPARED != ABSORBED != ENFORCED != VERIFIED.

## 25. Candidate release after absorption

ABSORBING
→ EXIT_REQUEST
→ CURRENT_EFFECT_PATH_CLOSURE
→ CURRENT_CONSTRAINT_CLOSURE
→ CURRENT_AUTHORITY
→ CURRENT_FENCES
→ RESOURCE_INCARNATIONS
→ RECONCILIATION_REQUIRED_BY_CLAIM
→ NEW_SCOPE
→ PROTECTED_EXIT_LINEARIZATION
→ NEW_EFFECT_ADMISSION.

Old scope/capabilities do not return automatically.

## 26. Finite-model reduction candidate

For future TLC work, the hidden distributed system can initially be reduced to:

Resources: A,B
Incarnations: 0,1
Effects: E1,E2,C1
Actors: owner, stale_owner, recovery
Queues: Q1,Q2
Fence epochs: 0,1,2
STOP: off,on
Absorption: false,true
Outcome: unknown,confirmed,rejected
Scope: full,reduced
Recovery epoch: 0,1,2

Abstract actions:
Admit
Execute
Enqueue
Deliver
Duplicate
Retry
Compensate
Stop
Fence
Absorb
ReplaceResource
Crash
Restart
Recover
ReduceScope
Release
Observe
Reconcile

The model should initially target safety invariants, not performance.

## 27. Candidate TLC invariants

ABS-TLC-01:
No forbidden effect occurs after a verified absorbing boundary.

ABS-TLC-02:
A stale actor cannot produce a protected effect after its fence is current and enforced.

ABS-TLC-03:
Resource replacement invalidates old absorption/fence context.

ABS-TLC-04:
Scope reduction cannot occur while a required effect path remains unfenced/uncovered.

ABS-TLC-05:
UNKNOWN history is never converted to NO_EFFECT solely by absorption.

ABS-TLC-06:
Recovery cannot authorize release from historical progress alone.

ABS-TLC-07:
A hidden downstream continuation cannot bypass the absorbing boundary.

ABS-TLC-08:
A compensation effect is independently authorized.

ABS-TLC-09:
STOP invalidates incompatible release transitions.

ABS-TLC-10:
Every published absorption claim has a corresponding protected transition/enforcement state.

## 28. Refinement boundary

The future formal model should have at least three levels:

L0 ABSTRACT:
Uncertainty set + safety invariant + absorbing state.

L1 COORDINATION:
Scopes + fences + ownership + queues + resource incarnations.

L2 IMPLEMENTATION:
Stores + processes + messages + APIs + concrete providers.

Refinement must show that an L2 execution maps to an L1 behavior and L1 preserves the L0 safety property.

This is aligned with TLA+'s state-machine/refinement approach. citeturn0search2turn0search8

## 29. Major new result

The safe-tombstone idea survives the adversarial round, but only after becoming substantially stricter:

SAFE_TOMBSTONE =
  claim-specific
  + uncertainty-safe
  + effect-path-complete
  + enforcement-backed
  + incarnation-bound
  + context-bound
  + crash/restart-safe
  + exit-protected.

Without these properties, "absorbing" is merely a local label.

## 30. New invariants

INV-EPC-01:
Effect-path closure includes every reachable protected continuation capable of affecting the claim.

INV-EPC-02:
Dependency closure and effect-path closure are distinct.

INV-EPC-03:
A local absorption claim cannot be promoted to global absorption without complete relevant effect-path closure.

INV-EPC-04:
Hidden queues/children/retries are not excluded merely because the initiating process stopped.

INV-EPC-05:
Resource replacement invalidates relevant absorption boundaries.

INV-EPC-06:
A stale effect identity cannot bypass a current absorbing boundary.

INV-EPC-07:
Downstream identity must preserve or safely transform protected effect identity.

INV-EPC-08:
Scope reduction must serialize against absorption-invalidating concurrent effects.

INV-EPC-09:
Absorption does not imply quiescence.

INV-EPC-10:
Absorption does not imply cancellation.

INV-EPC-11:
Absorption does not imply reconciliation.

INV-EPC-12:
A verified absorbing boundary may support safe non-convergence.

INV-EPC-13:
Material new effect-path discovery invalidates or reopens the absorption proof.

INV-EPC-14:
An absorbing boundary cannot rely exclusively on stale or rollback-vulnerable state.

INV-EPC-15:
Recovery-of-recovery must revalidate the current absorption boundary.

## 31. Distillation

CARRY_FORWARD:
- SAFE_UNDER_UNCERTAINTY.
- Absorbing state as transition property.
- Safe tombstone.
- Effect-path closure.
- Resource incarnation binding.
- Scope reduction as protected transition.
- Safe non-convergence.

REWORK:
- EffectPathClosure schema.
- AbsorptionBoundary schema.
- Formal hidden-continuation semantics.
- Queue/retry/redrive model.
- Downstream identity propagation.
- Concurrent absorption/scope-reduction protocol.

OPEN:
- Complete provider-specific effect-path discovery.
- Formal TLC model.
- Runtime enforcement.
- Crash/replay fault injection.
- Multi-resource effect-path composition.
- Formal refinement to implementation.

REJECTED:
- Local disable as global absorption.
- Queue disappearance as proof of no effect.
- Idempotency as global fencing.
- Parent process termination as child-effect termination.
- Absorption as historical reconciliation.

## 32. Next attack

Next:
**EFFECT-PATH CLOSURE COMPLETENESS / OPEN-WORLD PROVIDERS**

Question:
Can Nexo ever prove that it has found every path capable of producing a protected external effect when providers, plugins, delegated agents, queues, autonomous resources, or future dependencies are open-ended?

If not, define the exact boundary at which Nexo must refuse a strong safety claim rather than pretending closure is complete.

Gate remains:
NO V21 IMPLEMENTATION.
NO RUNTIME CORRECTNESS CLAIM.
NO FORMAL VERIFICATION CLAIM.
