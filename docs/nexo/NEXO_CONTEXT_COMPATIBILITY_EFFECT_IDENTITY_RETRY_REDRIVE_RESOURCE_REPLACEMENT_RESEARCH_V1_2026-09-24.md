# NEXO CONTEXT COMPATIBILITY + EFFECT IDENTITY ACROSS UPDATE/ROLLBACK + RETRY/REDRIVE + RESOURCE REPLACEMENT RESEARCH V1 — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No formal/runtime correctness claim.

## External cross-checks

AWS Step Functions provides a concrete example of context-bound redrive: a redriven execution continues using the same state-machine definition and execution ARN as the original attempt; if the state-machine definition was updated, AWS requires starting a new execution rather than silently applying the new definition to the old execution. Successful-step history is preserved, while failed work may be rerun. This supports separating effect/execution identity from current definition/context and explicitly defining continuation semantics. citeturn0search1turn0search2

Kubernetes uses resourceVersion to detect stale writes and reject out-of-date updates with conflict; its documentation also warns that some reads/caches can expose older resource versions. This is a concrete analogue for binding protected transitions to current context rather than accepting an otherwise valid stale state. citeturn0search3

etcd recovery explicitly creates a new logical cluster identity when restoring a snapshot and provides revision-bump/compaction mechanisms so consumers do not mistake restored historical revisions for current continuity. citeturn0search5

## Research question

Can an effect preserve its identity across an update/rollback or provider retry/redrive without allowing historical authorization to become current authority?

## Core result

Yes, but only if identity and authority are separated.

A stable effect_id may survive retries/redrives and context transitions, while the authority to perform the next attempt must be freshly validated against the current context.

Therefore:

EFFECT_IDENTITY continuity != AUTHORITY continuity

RETRY identity != RETRY authorization

REDRIVE identity != REDRIVE authorization

HISTORICAL execution context != CURRENT execution context

This is now a central clean-architecture rule.

## Findings CC-01..CC-32

1. Stable effect identity can safely survive retries if duplicate detection/reconciliation uses it.
2. Stable effect identity must never itself grant authority.
3. Every new attempt is a new execution event bound to the same or a new effect identity according to the effect contract.
4. An idempotency key is not a universal semantic identity; its scope, expiry, provider behavior and collision semantics matter.
5. Retry after context change requires current authorization even when the effect identity is unchanged.
6. Redrive can preserve historical execution identity while using a specific historical definition; Nexo must model this explicitly rather than infer compatibility.
7. Updating a definition does not automatically authorize old executions to adopt the new semantics.
8. Rollback to an older definition is not permission to continue an old execution.
9. A stable execution ID can contain multiple attempts/generations.
10. Attempt identity must distinguish repeated delivery from a genuinely new semantic effect.
11. Provider retry counters may reset or change; they cannot be treated as globally monotonic authority epochs.
12. Provider-generated retries are part of effect-path closure.
13. A provider may preserve effect identity while changing infrastructure/resource incarnation; reconciliation must bind both.
14. Resource replacement invalidates old target bindings unless the provider contract explicitly transfers identity.
15. A resource name is not a resource incarnation.
16. An old attempt may be semantically compatible with a new context, but compatibility must be explicit.
17. Compatibility must be effect-class-specific.
18. Compatibility cannot be inferred merely from version ordering.
19. Compatibility cannot be inferred merely from equal configuration hashes if authority, dependency, topology or resource context changed.
20. A rollback may restore compatible semantics but still require a new authority generation.
21. A new authority generation may permit continuation of an old effect only through an explicit continuation transition.
22. Continuation is a protected transition, not a passive property.
23. A provider ACK for a retry proves only the provider-defined property represented by that ACK.
24. Successful history preserved by a redrive is historical evidence, not current authority.
25. A failed step rerun after redrive is a new external attempt and requires its own effect enforcement.
26. If the provider cannot distinguish duplicate attempts, UNKNOWN may remain after timeout.
27. If idempotency scope expires, a stable local effect identity may no longer prevent provider-side duplication.
28. Provider retry/redrive can create child effects not represented by the parent identity; these must be explicitly included or fenced.
29. Resource replacement during retry can produce two possible histories: old resource effect and new resource effect.
30. Late evidence from an old resource incarnation cannot automatically resolve a new resource outcome.
31. If context compatibility is UNKNOWN, strong continuation must be blocked.
32. A safe continuation rule must be proven for every allowed world/history relevant to the claim.

## New distinction: EffectIdentity vs AttemptIdentity

EffectIdentity:
- logical protected effect
- semantic target
- effect class
- original request identity
- stable identity domain
- lifecycle history reference

AttemptIdentity:
- attempt_id
- effect_id
- attempt_generation
- context_id
- authority_epoch
- boundary_generation
- resource_incarnation
- provider_execution_id
- retry/redrive lineage
- admission evidence
- outcome state

Thus:

effect_id = same does not imply attempt_id = same.

And:

attempt_id = different does not necessarily imply a different semantic effect.

## Context compatibility relation

Introduce:

Compatible(C_old, C_new, E, claim)

It must answer whether an existing in-flight effect E can continue under C_new without violating the effect's contract or the claim.

Candidate compatibility dimensions:

- effect semantics
- target identity
- resource incarnation
- authority scope
- policy version
- invariant version
- boundary generation
- dependency closure
- topology
- STOP/recovery state
- continuity anchor
- provider contract
- effect interaction with concurrent operations

A simple version comparison is insufficient.

## Compatibility classes

C0 INCOMPATIBLE
- old effect must not continue.

C1 FENCE-COMPATIBLE
- old effect may continue only if the resource validates the current fence/generation.

C2 SEMANTICALLY-COMPATIBLE
- new context is explicitly proven equivalent/safe for this effect class.

C3 PROVIDER-CONTINUOUS
- provider guarantees stable effect identity and continuation semantics across the transition.

C4 UNKNOWN
- no adequate compatibility proof.

C4 => HOLD/QUARANTINE unless a separate action is proven safe under the uncertainty set.

## Retry/redrive contract

A retry/redrive operation must bind:

effect_id
attempt_id
current_context_id
authority_epoch
boundary_generation
resource_incarnation
retry/redrive policy version
effect-class contract
idempotency semantics
current STOP/recovery constraints
required evidence

The operation is a new protected transition.

It cannot inherit authority from the original attempt.

## Provider retry hazard

Example:

E1 / Attempt A1 under C1
→ timeout
→ provider continues A1
→ Nexo sees UNKNOWN
→ context changes C1 → C2
→ Nexo retries E1 as A2
→ provider later completes A1
→ A2 reaches same resource
→ resource replaced R1 → R2
→ A1 late observation arrives.

Possible world states include:

W1: only A1 happened
W2: only A2 happened
W3: both happened
W4: A1 happened on R1, A2 happened on R2
W5: A1 happened and A2 is queued
W6: provider history is incomplete.

Therefore:

UNKNOWN(E1) + retry != simple binary choice

The uncertainty set must include concurrent provider continuation.

## Redrive history rule

Historical successful steps may legitimately be preserved during redrive, as AWS Step Functions demonstrates, while unsuccessful work is rescheduled. That means a workflow can have mixed historical status: some steps are historical facts, others are new attempts. Nexo therefore needs per-effect/per-attempt state rather than one scalar execution status. citeturn0search1

Candidate rule:

HISTORICAL_SUCCESS(step) != CURRENT_AUTHORIZATION(next_step)

## Resource replacement rule

If:

logical_resource_id = X

but:

resource_incarnation = R1 → R2

then an old effect binding to R1 cannot silently bind to R2.

Required transition:

R1_RETIRED/FENCED
→ R2_ATTESTED/IDENTIFIED
→ R2_BOUNDARY_VERIFIED
→ R2_EFFECT_IDENTITY_POLICY_VALIDATED
→ R2_RECONCILIATION
→ R2_RELEASE_ELIGIBLE

The old R1 history remains historical.

## Rollback rule

Rollback must create a new continuity context:

C2 → rollback → C3

even if the artifact content becomes identical to C1.

Therefore:

artifact_equal(C3,C1) != context_equal(C3,C1)

This prevents an authentic old artifact from resurrecting old authority semantics.

## Candidate ContinuationTransition

New protected object:

ContinuationTransition:
- continuation_id
- effect_id
- previous_attempt/context
- proposed current context
- compatibility class
- affected resources/incarnations
- boundary set
- authority basis
- STOP/recovery constraints
- dependency closure
- uncertainty set
- linearization point
- enforcement verification
- reconciliation requirement
- result: CONTINUE / FENCE / RETRY / RECONCILE / HOLD / QUARANTINE

Continuation is therefore explicit and auditable.

## Candidate invariants INV-CC-01..20

- INV-CC-01: Effect identity never grants authority.
- INV-CC-02: Every attempt has explicit current context.
- INV-CC-03: Retry/redrive is a new protected transition.
- INV-CC-04: Historical execution identity cannot substitute for current authorization.
- INV-CC-05: Stable effect identity may survive attempts only within a defined identity domain.
- INV-CC-06: Provider retry/redrive paths belong to effect-path closure.
- INV-CC-07: Resource incarnation is part of target identity where required.
- INV-CC-08: Context compatibility is explicit and effect-class-specific.
- INV-CC-09: Version ordering alone cannot establish semantic compatibility.
- INV-CC-10: Rollback cannot restore historical authority.
- INV-CC-11: New authority generation is required after safety-relevant context transition.
- INV-CC-12: Continuation across a context transition requires protected admission.
- INV-CC-13: Historical successful work does not authorize new work.
- INV-CC-14: Provider ACK semantics remain provider-scoped.
- INV-CC-15: Idempotency does not prove semantic safety of retry.
- INV-CC-16: Provider continuation can enlarge the uncertainty set.
- INV-CC-17: Resource replacement invalidates incompatible old bindings.
- INV-CC-18: Late old-incarnation evidence remains historically bound.
- INV-CC-19: UNKNOWN compatibility blocks strong continuation.
- INV-CC-20: Safe continuation must hold across all allowed relevant worlds.

## Formal model candidates

Objects:
EffectIdentity
AttemptIdentity
ContinuityContext
ContinuationTransition
ResourceIncarnation
ProviderExecution
RetryLineage
CompatibilityClaim

Relations:
SameEffect
SameAttempt
Continues
Retries
Redrives
TargetsIncarnation
CompatibleWith
InvalidatedBy
Reconciles

Candidate state:
effect_status
attempt_status
context_id
resource_incarnation
provider_execution_id
compatibility_status
uncertainty_set
boundary_generation
authority_epoch

Candidate safety property:

ADMIT(attempt) => CURRENT_CONTEXT(attempt) AND COMPATIBLE_CONTEXT(attempt) AND CURRENT_BOUNDARY(attempt) AND CURRENT_RESOURCE(attempt)

Stronger:

CONTINUE(effect,C_new) => SAFE_UNDER_JOINT_UNCERTAINTY(CONTINUE, U_effect, C_new)

## Adversarial mini-audit

Attack A: same effect ID + stale authority. Result: DENY.

Attack B: same provider execution + changed policy. Result: REVALIDATE; no automatic continuation.

Attack C: retry after resource replacement. Result: new attempt; R1 binding invalid; R2 admission required.

Attack D: rollback to byte-identical old artifact. Result: new context/generation; old authority not restored.

Attack E: provider redrive after Nexo revocation. Result: provider path must enforce current effect/fence contract; otherwise strong revocation claim fails.

Attack F: successful historical step + changed downstream policy. Result: history retained; downstream admission independently evaluated.

Attack G: late completion from old resource incarnation. Result: historical evidence; cannot automatically classify current incarnation.

Attack H: idempotency key expired. Result: duplicate protection may be lost; uncertainty expands.

Attack I: provider retries autonomously after STOP. Result: STOP at Nexo is insufficient unless provider/resource boundary enforces cancellation/fencing.

Attack J: two attempts share a physical footprint. Result: interaction contract required; separate effect IDs do not imply disjoint effects.

## Major conclusion

The architecture now has a cleaner separation:

EFFECT_IDENTITY
answers which logical protected effect this is.

ATTEMPT_IDENTITY
answers which execution attempt this is.

CONTINUITY_CONTEXT
answers under which coherent safety context this attempt is occurring.

AUTHORITY_CONTEXT
answers whether this actor may perform this transition now.

BOUNDARY_GENERATION
answers which enforcement generation must accept/reject it.

RESOURCE_INCARNATION
answers which concrete incarnation is the target.

COMPATIBILITY_CLAIM
answers whether this old effect can legitimately continue under the new context.

This is stronger than treating retries as copies of the original authorization.

## Remaining gaps

G-CC-01 formal semantics of effect identity domains.
G-CC-02 provider-specific idempotency lifetime and collision semantics.
G-CC-03 context compatibility proof/refinement.
G-CC-04 autonomous provider retries after STOP/revocation.
G-CC-05 resource replacement preserving or changing effect identity.
G-CC-06 retry under joint uncertainty.
G-CC-07 formal mixed-attempt model.
G-CC-08 actual TLC/SANY.
G-CC-09 implementation refinement.
G-CC-10 fault-injection evidence.

## Next attack

Next target:

MULTIPLE ATTEMPTS OF THE SAME EFFECT + CONCURRENT COMPENSATION + PROVIDER REDRIVE + SHARED FOOTPRINT + UNKNOWN ORDER

The objective is to test whether stable effect identity remains safe when several attempts, retries and compensations overlap in the same external world.
