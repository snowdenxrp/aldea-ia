# NEXO — Temporal Safety Closure / Closure Generations Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Determine whether SafetyClosure remains meaningful across time when authority, dependencies, effect paths, enforcement boundaries, resources, policies, trust roots, or observations change after admission.

## 2. Central finding
A closure is not merely a set. It is a time-bound semantic context.
Therefore:
CLOSURE_AT_ADMISSION != CLOSURE_AT_EXECUTION != CLOSURE_AT_OBSERVATION != CLOSURE_AT_RECOVERY.
A closure that was sound at T0 can become stale without any local corruption.

## 3. Temporal closure context
Candidate TemporalSafetyClosureContext fields:
closure_id
closure_generation
claim_id
claim_scope_vector
authority_epoch
policy_generation
invariant_generation
dependency_generation
effect_path_generation
enforcement_generation
resource_incarnation_set
trust_root_generation
partition/reconciliation generation
continuity context
validity interval/causal boundary
invalidations.

## 4. Four moments
T0 ADMISSION_CLOSURE: context used to admit the effect.
T1 EXECUTION_CLOSURE: context required at the actual protected effect boundary.
T2 OBSERVATION_CLOSURE: context under which evidence is interpreted.
T3 RECOVERY_CLOSURE: context required before continuation/release.

These contexts may be related, but equality cannot be assumed.

## 5. Core temporal rule
VALID_AT_ADMISSION != VALID_NOW.
Historical validity is not current authority.
Historical closure is not current closure.
Historical enforcement evidence is not necessarily current enforcement truth.

## 6. Temporal invalidation classes
Authority change
policy change
invariant change
dependency relevance change
effect-path expansion
enforcement-boundary change
resource replacement
trust-root rotation
delegation revocation
provider contract change
partition/reconciliation generation change
schema/parser/verification profile change
environment assumption invalidation.

Each may invalidate only a subset of claims, but the invalidation boundary must be explicit.

## 7. Closure generations
Use independent generations rather than one universal clock:
CG-A authority generation
CG-D dependency/relevance generation
CG-E effect-path generation
CG-F enforcement generation
CG-R resource incarnation generation
CG-T trust generation
CG-P policy/invariant generation.

An assurance bundle records the exact generation vector it depends on.

## 8. Generation vector is not enough
Equal generation numbers do not prove semantic compatibility.
Generation identity must be bound to content/context fingerprints and causal/order context.
Therefore:
SAME_GENERATION_NUMBER != SAME_SEMANTIC_CONTEXT.

## 9. Temporal gap attack
Example:
T0 closure verified.
T1 effect begins.
T2 provider adds retry path.
T3 authority revoked.
T4 local executor observes revocation and stops.
T5 provider retry occurs.
T6 recovery sees local stop evidence.

Without effect-path and enforcement generation changes, recovery could incorrectly treat T0 assurance as current.

Correct result: stale continuation becomes UNKNOWN/blocked until the current provider path and enforcement boundary are revalidated.

## 10. Temporal closure as a safety property
Candidate safety property:
IF a protected claim is published at time t, THEN every protected transition relying on that claim must remain within the claim's verified closure context, OR the claim must be invalidated/degraded before the transition can rely on it.

This is a safety property because a violation can be witnessed by a finite bad transition: an effect crosses an invalidated boundary while relying on stale assurance.

Lamport's TLA+ material explicitly characterizes invariants as properties that must hold in every state of every behavior, while liveness addresses eventual progress. This supports modeling stale-closure prevention primarily as a safety property, while treating eventual reconciliation/revalidation as a separate liveness problem. citeturn0search0turn0search1

## 11. Temporal liveness must not weaken safety
A tempting design is:
stale closure → eventually revalidate.
This does not authorize execution during the gap.
Correct separation:
STALE → BLOCK/HOLD
and separately:
BLOCKED → eventually REVALIDATED
under explicit fairness/availability assumptions.

NIST's zero-trust architecture similarly describes continuous evaluation of session context and the possibility that updated information can make an ongoing session non-compliant. citeturn0search2turn0search12

## 12. Causal boundary vs wall clock
A wall-clock timestamp alone cannot establish ordering.
Closure transitions require an authoritative causal/order context or protected ordering domain.
Therefore:
TIMESTAMP != AUTHORITY_ORDER.
OBSERVATION_TIME != EFFECT_TIME.
EVENT_TIME != LINEARIZATION_ORDER.

## 13. Late evidence
Evidence arriving at T6 about T2 cannot retroactively make T2 authorization current at T6.
It may classify historical attribution or establish a historical effect, but current authority must be evaluated against the current context.

## 14. Resource incarnation
If resource R is replaced:
R@incarnation0 != R@incarnation1.
Old closure/evidence may remain valid for historical R0 but cannot silently authorize or describe R1.
Replacement therefore advances resource context and may force effect/enforcement closure recomputation.

## 15. Root rotation
Trust root rotation creates a new trust context.
Old closure certificates can remain historical evidence but cannot automatically establish current authority.
Root cutoff must propagate into closure invalidation and assurance recomputation.

## 16. Partition and healing
During partition:
LOCAL_CLOSURE_CURRENT != GLOBAL_CLOSURE_CURRENT.
Two partitions may independently derive locally consistent closures that are globally incompatible.
Therefore closure publication during partition must be provisional or bounded unless the SafetyOrderingDomain establishes authoritative order.

Healing sequence:
freeze affected admission
identify closure contexts
detect conflicting generations/dependencies
establish authoritative order
invalidate stale closures
fence effects
reconcile external state
recompute closures
recompute assurance
explicit release.

## 17. Compaction
Compaction cannot discard historical closure generations required to explain why a claim was valid or invalidated.
Therefore retained causal summary must preserve:
closure generation
dependency relevance basis
effect-path boundary
enforcement boundary
authority/root cutoff
resource incarnation
invalidation reason
claim scope.

History compaction is safe only if the retained summary preserves every claim-relevant distinction required by the surviving claims.

## 18. Temporal closure fixed point
The earlier cross-closure fixed point must now become temporal:
At each protected transition, compute or validate a closure context that is current enough for the claim.
If dynamic discovery occurs, the fixed point is invalidated and recomputed.
Do not attempt to prove one timeless global closure for an open dynamic system.

## 19. Candidate object
TemporalSafetyClosureCertificate:
certificate_id
claim_id
closure_generation_vector
claim_scope_vector
authority context
dependency/relevance closure
effect-path closure
enforcement closure
resource incarnations
trust-root context
causal/order context
assumptions
exclusions
freshness/validity rule
invalidation triggers
verification method
independent support root
publication boundary.

The certificate is evidence/assurance, not authority.

## 20. Candidate publication gate
Publish/continue only if:
current authority is valid
required closure generations match or are explicitly compatible
no relevant invalidation is pending
effect identity is current
resource incarnations match
enforcement boundary is current and verified
required dependencies are known/acceptable
claim scope does not exceed verified scope
causal ordering context is current
no unresolved partition/split-brain condition exists.

Otherwise HOLD/QUARANTINE/DEGRADE according to the claim contract.

## 21. Temporal claim lattice
Candidate states:
CURRENT
CURRENT_WITH_BOUNDED_UNCERTAINTY
STALE
INVALIDATED
UNKNOWN
CONFLICTED
QUARANTINED.

Transitions must be monotone with respect to discovered invalidation unless a protected revalidation transition establishes a new context.

## 22. Formal modeling implication
The future formal model should not encode closure as a single static set. It should model closure context/generations and adversarial transitions that mutate dependencies, effect paths, enforcement, resources, roots, and policy between any two protected actions.
TLC can check safety and liveness properties of an executable finite-state TLA+ model, but any result applies to the modeled state space and assumptions. It does not by itself prove that the implementation or real world has no omitted dependency. citeturn0search8turn0search0

## 23. Candidate invariants
TC-01 CLOSURE_IS_CONTEXTUAL_AND_TIME-BOUND
TC-02 ADMISSION_VALIDITY_DOES_NOT_IMPLY_CURRENT_VALIDITY
TC-03 EVERY_PROTECTED_USE_OF_ASSURANCE_REQUIRES_CURRENT_OR_EXPLICITLY_COMPATIBLE_CLOSURE_CONTEXT
TC-04 CLOSURE_GENERATION_VECTOR_IS_BOUND_TO_SEMANTIC_CONTEXT
TC-05 GENERATION_NUMBER_ALONE_DOES_NOT_ESTABLISH_COMPATIBILITY
TC-06 EFFECT_PATH_EXPANSION_INVALIDATES_AFFECTED_CLOSURE_CONTEXT
TC-07 ENFORCEMENT_BOUNDARY_CHANGE_INVALIDATES_AFFECTED_PREVENTION_CLAIMS
TC-08 RESOURCE_REPLACEMENT_INVALIDATES_OLD_RESOURCE_CONTEXT_FOR_NEW_EFFECTS
TC-09 ROOT_ROTATION_INVALIDATES_AFFECTED_CURRENTNESS_CLAIMS
TC-10 PARTITIONED_LOCAL_CLOSURE_CANNOT_SILENTLY_BECOME_GLOBAL_CURRENTNESS
TC-11 LATE_EVIDENCE_CANNOT_RESTORE_CURRENT_AUTHORITY
TC-12 STALE_CLOSURE_BLOCKS_OR_DEGRADES_PROTECTED_USE
TC-13 REVALIDATION_IS_A_NEW_PROTECTED_CONTEXT
TC-14 COMPACTION_MUST_RETAIN_CLAIM-RELEVANT_CLOSURE_HISTORY
TC-15 TEMPORAL_LIVENESS_CANNOT_OVERRIDE_SAFETY_DURING_STALE_INTERVAL
TC-16 DERIVED_CLOSURE_CERTIFICATE_IS_NOT_AUTHORITY

## 24. Open gaps
TG1. Exact compatibility relation between two closure generations.
TG2. Formal temporal semantics for partial closure invalidation.
TG3. Minimal retained causal summary for closure history.
TG4. Dynamic open-world closure with bounded temporal claims.
TG5. Efficient computation of current closure at high effect rates.
TG6. Formal relation between closure generations and SafetyOrderingDomain.
TG7. TLA+ state-space reduction without hiding relevant temporal races.
TG8. Refinement mapping from implementation closure discovery to abstract temporal closure.
TG9. Fault-injection matrix for every generation transition.
TG10. Long-duration generation rollover and compaction safety.

## 25. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.