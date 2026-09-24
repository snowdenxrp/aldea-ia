# NEXO — RECOVERY + STOP + EXTERNAL EFFECT RACE RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL PRECONDITION
Implementation: BLOCKED. No V21.

## Scope
STOP activates while Recovery A reconciles; Recovery B acquires after ownership expiry; an external effect remains in flight; stale A/B messages arrive; resource-side fencing changes; release and compensation race.

## Research inputs
AWS Step Functions exposes Stop and Redrive as distinct lifecycle operations and documents that redrive preserves successful execution history while rerunning unsuccessful portions. Its Distributed Map documentation also notes child work can remain active after a parent stop/timeout. Kubernetes leader election uses a shared Lease with optimistic concurrency. AWS DescribeExecution states its results are eventually consistent. These are research inputs, not compliance claims. citeturn0search1turn0search4turn0search3turn0search7

## Findings
RSE-01: STOP activation must invalidate pending execution release, even if recovery previously computed RELEASE_ELIGIBLE.
RSE-02: STOP does not automatically cancel an already-issued external effect; downstream work may continue.
RSE-03: Recovery may reconcile under STOP while execution remains fenced.
RSE-04: Recovery must not clear STOP merely because reconciliation completes; STOP release is its own protected transition.
RSE-05: If STOP changes context during reconciliation, pre-STOP progress/evidence may require invalidation or revalidation.
RSE-06: Recovery ownership transfer does not change effect identity or erase UNKNOWN external outcomes.
RSE-07: Stale recovery messages after ownership transfer must be rejected at the protected mutation boundary.
RSE-08: A stale recovery compensation request is itself a protected effect and must be freshly authorized.
RSE-09: Compensation is a new effect with its own binding, authority, fence and reconciliation.
RSE-10: STOP and compensation can conflict; allowed emergency compensation must be defined per effect class.
RSE-11: Resource fence advancement can invalidate execution and compensation capabilities carrying the old fence.
RSE-12: Fence ACK does not prove all downstream work observed the new fence.
RSE-13: Provider queues can contain old work after STOP/fence update; protected sinks must validate currentness where required.
RSE-14: Resource-side enforcement is required to claim stale-actor prevention at that resource.
RSE-15: Release must be linearized against STOP, recovery ownership and resource fencing.
RSE-16: STOP_REQUESTED is distinct from STOP_ENFORCED.
RSE-17: STOP_ENFORCED is distinct from EXTERNAL_QUIESCENCE.
RSE-18: EXTERNAL_QUIESCENCE is distinct from HISTORICAL_NO_EFFECT.
RSE-19: A single stopped boolean cannot represent these distinct claims.
RSE-20: Recovery release requires the STOP state appropriate to the claim, not merely absence of a stop request.
RSE-21: STOP and recovery authority need explicit conflict semantics.
RSE-22: Global STOP must dominate affected protected releases; domain-scoped STOP needs explicit cross-domain semantics.
RSE-23: Compensation after an UNKNOWN original effect may create duplicate/reversal risk; admissibility under uncertainty must be explicit.
RSE-24: A STOP-induced HOLD prevents further effects but does not resolve external UNKNOWN.
RSE-25: STOP is not evidence that an external effect was absent.
RSE-26: Recovery ownership is not evidence that the external world is quiescent.
RSE-27: Late ACK from an old owner/fence is historical evidence, not current enforcement.
RSE-28: Evidence collected before STOP/fence change may require revalidation after the protected change.
RSE-29: Recovery checkpoints created before STOP cannot automatically authorize post-STOP release.
RSE-30: Resource restart during the race must re-establish fencing before protected effects.
RSE-31: UNKNOWN resource fencing blocks protected execution/compensation until re-established.
RSE-32: STOP/recovery/fence state is a safety context, not a single timestamp.
RSE-33: Message arrival order is not protected ordering.
RSE-34: Release must bind current owner, STOP state, recovery fence, resource fence/incarnation, effect identity/state and required evidence.
RSE-35: UNKNOWN at a required release predicate defaults to HOLD/QUARANTINE unless the claim explicitly tolerates it.
RSE-36: Break-glass approval is bounded input, not a bypass.
RSE-37: STOP, recovery and external fencing are separate planes that must converge at protected effect boundaries.

## Semantic chain
STOP_REQUEST -> STOP_ENFORCING -> EXECUTION_FENCE -> EXTERNAL_CANCELLATION/QUIESCENCE (if supported) -> RECONCILIATION -> HISTORICAL_OUTCOME_CLASSIFICATION -> RELEASE_ELIGIBILITY -> EXPLICIT_RELEASE.
No arrow may be collapsed merely because an API returned success.

## Candidate invariants
INV-RSE-01..20 correspond to the findings above: pending release invalidation; STOP request/enforcement/quiescence separation; compensation as new protected effect; stale-owner rejection; current fencing; provider sink validation; protected release linearization; explicit STOP scope; UNKNOWN blocking; and joint context binding.

## Architectural consequence
The protected boundary is not a single STOP service, recovery service, or resource fence. The protected release/effect transition must jointly validate their current contexts. A derived SafetyReleaseContext (name provisional) may be needed rather than independently cached booleans.

## Open
- STOP vs emergency compensation policy by effect class.
- Cross-domain STOP scope.
- Joint validation atomicity/equivalence.
- Formal partial-order model for epochs.
- Provider cancellation guarantees.
- Fault injection of STOP/fence/recovery races.
- Refinement to concrete enforcement sinks.

## Next attack
EFFECT OUTCOME AMBIGUITY + COMPENSATION SELECTION: original effect UNKNOWN; STOP occurs; recovery must choose retry, wait, reconcile, compensate, or quarantine while the external resource may have partially committed. Analyze whether any safe compensating action exists without resolving world state, and identify effect classes where compensation under uncertainty can be bounded.
