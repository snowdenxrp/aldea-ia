# NEXO — EFFECT-CLASS MINIMAL CONTRACT / NON-IDEMPOTENT / UNRECONCILABLE / SAFE CONTAINMENT — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

What is the minimum external-effect contract required for Nexo to admit an effect safely, and what must happen when the external world does not provide stable identity, fencing, cancellation or reconciliation?

## External cross-checks

AWS describes the timeout problem directly: after a request times out, the caller may not know whether the side effect happened, and reconciliation may be required before retrying. AWS also describes client request identifiers and server-side idempotency records as mechanisms for making retries safe, including the requirement that recording the idempotency token and the mutation be handled atomically on the service side. citeturn0search3 AWS recommends verifying idempotency before implementing retries and limiting retry calls. citeturn0search9turn0search12 NIST SP 800-193 separates protection, detection and recovery rather than treating recovery as a single rollback operation; this is useful as an architectural analogy for keeping containment/recovery semantics distinct. citeturn0search1turn0search36

## Core result

There is no single universal minimum contract for every effect.

The minimum contract is **claim-dependent and effect-class-dependent**.

However, four capabilities form the strongest architectural boundary:

1. stable effect identity;
2. enforceable stale-effect rejection/fencing;
3. adequate outcome reconciliation;
4. bounded and explicit semantics for retries/duplicates.

If a required capability is absent, Nexo must either:

- weaken the claim;
- constrain the effect;
- require a stronger containment boundary;
- or refuse admission.

The key rule:

**NO REQUIRED ASSURANCE CAPABILITY → NO CORRESPONDING STRONG CLAIM**

## 1. Minimum contract dimensions

Candidate external-effect contract:

EFFECT_IDENTITY
TARGET_IDENTITY
RESOURCE_INCARCATION
EFFECT_CLASS
ATTEMPT_IDENTITY
DUPLICATE_SEMANTICS
RETRY_SEMANTICS
COMMIT_SEMANTICS
OBSERVATION_SEMANTICS
RECONCILIATION_CAPABILITY
FENCE/CANCELLATION_CAPABILITY
HISTORY_RETENTION
CONTEXT_COMPATIBILITY
DEPENDENCY_CLOSURE
CONTINUATION/QUEUE_SEMANTICS
RECOVERY_SEMANTICS

Not every effect requires every field at the same strength, but the required subset must be explicit.

## 2. Four assurance capabilities

### K1 — Identity

Can Nexo distinguish the exact logical protected effect from other requests?

Without stable identity:

duplicate analysis becomes much harder.

### K2 — Enforcement

Can stale authority be rejected by the effect boundary/resource?

Without enforcement:

Nexo may know that an old actor is stale while the resource still accepts its commands.

### K3 — Reconciliation

Can Nexo determine what happened after uncertainty?

Without reconciliation:

UNKNOWN may persist.

### K4 — Bounded continuation

Can Nexo account for retries, queues, child work, autonomous provider behavior and delayed messages?

Without bounded continuation:

the effect path may be open-ended.

## 3. Why identity alone is insufficient

An idempotency key can prevent duplicate side effects only under the provider's actual contract.

AWS explicitly describes idempotency as a service-side property and notes that the idempotency token and mutation need appropriate atomic treatment. citeturn0search3

Therefore:

IDEMPOTENCY_TOKEN != NEXO_AUTHORITY

and:

STABLE_IDENTITY != STABLE_WORLD_CONTROL

## 4. Why fencing alone is insufficient

A resource-side fence can reject stale future requests.

It cannot necessarily answer:

“Did the old request already change the world?”

Thus:

FENCE != HISTORY

and:

FENCE != RECONCILIATION

## 5. Why reconciliation alone is insufficient

A status query may tell us current state but not historical causality.

Example:

E1 sets X = ON
E2 sets X = OFF

Current state OFF does not prove E1 never occurred.

Therefore reconciliation must specify whether it provides:

CURRENT_STATE
EFFECT_HISTORY
CAUSAL_PROVENANCE
or only OBSERVATION.

## 6. Why cancellation alone is insufficient

A provider may support cancellation but cancellation may be:

- best effort;
- asynchronous;
- accepted but not enforced;
- effective only before execution;
- unable to cancel child work.

Therefore:

CANCEL_REQUESTED != EFFECT_STOPPED

and:

EFFECT_STOPPED != HISTORICAL_NO_EFFECT.

## 7. The non-idempotent effect problem

Suppose an effect has:

- no idempotency;
- no reliable status query;
- no stable effect identity;
- no resource fencing.

Then after timeout:

UNKNOWN.

Retry creates:

possible duplicate effect.

Compensation creates:

possible second effect.

Waiting does not resolve the uncertainty.

Therefore generic recovery cannot safely choose retry or compensation.

Possible result:

**HOLD / QUARANTINE / SAFE CONTAINMENT**

This is consistent with AWS guidance that retries should be used only when the operation's idempotency properties are understood. citeturn0search9

## 8. New principle: effect admission is capability-gated

Admission should not ask only:

“Is this action authorized?”

It must ask:

“Does the external effect contract provide enough assurance for the safety claim required by this action?”

Candidate:

ADMIT(E,C) only if
AUTHORITY(E)
AND
EFFECT_CONTRACT_SUPPORTS(E,C)
AND
SCOPE_COMPLETE
AND
CURRENT_CONTEXT
AND
REQUIRED_FENCE
AND
REQUIRED_RECONCILIATION_CAPABILITY
AND
REQUIRED_CONTINUATION_BOUNDARY.

If a required term is UNKNOWN:

HOLD / REVALIDATE / QUARANTINE.

## 9. Claim strength becomes explicit

Candidate claim levels:

C0 — REQUEST CLAIM
“the request was generated.”

C1 — CONTROL CLAIM
“Nexo admitted the protected transition.”

C2 — DELIVERY CLAIM
“the provider accepted/recorded the request.”

C3 — EXECUTION CLAIM
“execution reached the provider-defined execution boundary.”

C4 — EFFECT CLAIM
“the external effect reached its defined commit boundary.”

C5 — WORLD CLAIM
“the relevant external world state/history satisfies property P.”

C6 — SAFETY CLAIM
“property P remains protected under the defined current context and assumptions.”

Promotion from Cn to Cn+1 requires additional evidence/contracts.

## 10. Unreconcilable effects

If an effect has no reliable reconciliation:

Nexo must not pretend UNKNOWN means FAILURE.

Instead the system may establish a safety state that prevents future unsafe consequences.

Candidate sequence:

UNKNOWN_EFFECT
→ FENCE_STALE_PATHS
→ CONTAIN_EFFECT_PATH
→ ENTER_SAFE_ABSORBING_STATE (if proven)
→ PRESERVE_UNKNOWN_HISTORY
→ RELEASE ONLY WITH NEW PROTECTED TRANSITION

This reuses the previous absorbing-state research.

Critical distinction:

**CONTAINMENT CAN REDUCE FUTURE RISK WITHOUT RESOLVING PAST HISTORY.**

## 11. Safe containment is claim-relative

Containment is sufficient only for the claim it covers.

Example:

If the claim is:

“no additional actuator commands may be accepted”

a resource-side fence might be enough.

But if the claim is:

“the actuator never moved”

fencing after the fact is insufficient.

Therefore:

CONTAINMENT_CLAIM != HISTORY_CLAIM

## 12. Minimum containment boundary

For an unreconcilable effect, the minimum boundary must cover every path that can still produce a protected effect:

direct request
retry
queue
callback
child workflow
provider continuation
cached capability
delegated worker
offline/autonomous actor
compensation
recovery
replacement resource.

This reaffirms:

**EFFECT_PATH_CLOSURE**

## 13. Open-world external providers

If the provider is open-world and Nexo cannot enumerate all continuation paths, a strong global claim is not justified.

Candidate modes:

CLOSED_WORLD
BOUNDARY_BOUNDED
ASSUMED_WORLD
UNKNOWN_WORLD

For UNKNOWN_WORLD:

strong global claims are blocked unless an enforceable boundary closes the relevant effect path.

## 14. Contract classes

Candidate external-effect contract classes:

### EC0 — CONTROLLED

Stable identity
+ fencing
+ reconciliation
+ bounded continuation
+ explicit commit semantics.

Suitable for strong claims when implementation/refinement is verified.

### EC1 — RECONCILIABLE

Stable identity
+ reconciliation
+ bounded continuation
but limited fencing.

Safe only under effect-specific restrictions.

### EC2 — FENCEABLE

Stable identity
+ resource enforcement
but incomplete historical reconciliation.

Future effects can be contained, but historical claims may remain UNKNOWN.

### EC3 — OBSERVABLE

Good observation but weak enforcement.

Useful for evidence; insufficient for stale-actor safety.

### EC4 — NON-RECONCILIABLE

No stable identity or trustworthy history.

Requires strong containment or restricted admission.

### EC5 — OPEN/UNKNOWN

Unknown effect path or unknown provider semantics.

Strong admission prohibited unless a boundary contract reduces the unknown.

These are design classes, not rankings.

## 15. The dangerous anti-pattern

Bad architecture:

if authorized(action):
    execute(action)
    retry_on_timeout()
    assume_success_if_provider_responds()

This collapses:

authority
identity
effect semantics
retry
world truth.

The clean architecture instead requires:

AUTHORITY
→ EFFECT CONTRACT
→ PROTECTED ADMISSION
→ FENCE
→ EXECUTION
→ EFFECT OUTCOME
→ RECONCILIATION
→ CLAIM.

## 16. New object: EffectInteractionContract extension

The existing interaction contract should include effect-contract constraints:

effect_id
effect_class
identity_scope
target_scope
resource_incarnation
commutativity
ordering
duplicate_semantics
retry_semantics
compensation_semantics
fence_semantics
reconciliation_semantics
continuation_scope
history_retention
proof_boundary
claim_strength_supported

## 17. New object: AdmissionContract

Candidate:

AdmissionContract:
- effect class
- required claim strength
- required identity
- required fencing
- required reconciliation
- required continuation closure
- required resource incarnation
- required dependencies
- required assumptions
- allowed uncertainty
- forbidden uncertainty
- recovery policy
- compensation policy
- expiry/invalidation rules

This makes admission a safety contract, not just an authorization check.

## 18. New object: ContainmentClaim

Candidate:

ContainmentClaim:
- containment_id
- effect/transaction scope
- covered effect paths
- boundary set
- resource incarnations
- fence generations
- assumptions
- enforcement evidence
- verification status
- claim strength
- invalidation triggers
- release conditions.

## 19. Safe handling of EC4/EC5

When external semantics are insufficient:

1. stop new admissions;
2. preserve UNKNOWN;
3. establish the strongest available fence;
4. close known effect paths;
5. identify unknown paths;
6. establish a bounded containment claim if possible;
7. prevent generic retry/compensation;
8. create a new recovery context;
9. release only through a protected transition.

If no bounded containment is possible:

**strong safety claim cannot be published.**

This is not failure of the architecture; it is an explicit boundary of what the architecture can prove.

## 20. Important distinction: safety vs recoverability

An unreconcilable effect may still be safely contained even though it cannot be historically reconstructed.

Thus:

SAFE_CONTAINMENT != RECOVERED_HISTORY

and:

RECOVERABLE != VERIFIED_HISTORY.

## 21. New invariants INV-ECM-01..30

INV-ECM-01 Admission requires effect-contract support for the required claim.
INV-ECM-02 Stable identity is necessary where duplicate/history claims require it.
INV-ECM-03 Identity does not grant authority.
INV-ECM-04 Fencing does not classify historical outcome.
INV-ECM-05 Reconciliation does not automatically prove causality.
INV-ECM-06 Cancellation does not imply absence of effect.
INV-ECM-07 Non-idempotent UNKNOWN cannot be generically retried.
INV-ECM-08 Non-idempotent UNKNOWN cannot be generically compensated.
INV-ECM-09 Unreconcilable effects preserve UNKNOWN.
INV-ECM-10 Strong claims require claim-adequate external contracts.
INV-ECM-11 Containment claims are claim-relative.
INV-ECM-12 Containment must cover relevant effect-path closure.
INV-ECM-13 Unknown external paths block strong global containment claims.
INV-ECM-14 Safe containment may reduce future risk without resolving historical uncertainty.
INV-ECM-15 Safe containment is not historical proof.
INV-ECM-16 Resource replacement invalidates old resource-bound assumptions.
INV-ECM-17 Provider continuation is part of effect-path closure.
INV-ECM-18 Recovery cannot invent provider semantics.
INV-ECM-19 Retry policy is effect-class-specific.
INV-ECM-20 Compensation policy is effect-class-specific.
INV-ECM-21 Claim strength is explicit.
INV-ECM-22 Claim promotion requires additional evidence/contracts.
INV-ECM-23 UNKNOWN_WORLD blocks strong admission absent an enforceable boundary.
INV-ECM-24 AdmissionContract must define allowed and forbidden uncertainty.
INV-ECM-25 AdmissionContract is not itself authority.
INV-ECM-26 ContainmentClaim is not world-history truth.
INV-ECM-27 Recovery of an unreconcilable effect requires a new protected transition.
INV-ECM-28 Permanent UNKNOWN is an allowed architectural state.
INV-ECM-29 Release requires current containment/fence/authority validation.
INV-ECM-30 No strong guarantee may exceed the external effect contract and its verified assumptions.

## 22. Formal direction

The formal model can now define:

EffectClass
EffectContract
ClaimStrength
AdmissionContract
ContainmentClaim
EffectPathClosure
UncertaintySet
RecoveryDecision

Candidate admission predicate:

ADMIT(E,C) =>
CURRENT_AUTHORITY
∧ CURRENT_CONTEXT
∧ CONTRACT_SUPPORTS(E,C)
∧ REQUIRED_SCOPE_COMPLETE
∧ REQUIRED_FENCE_VALID
∧ REQUIRED_BOUNDARY_COVERAGE
∧ REQUIRED_RECONCILIATION_CAPABILITY
∧ ALLOWED_UNCERTAINTY_ONLY

Candidate containment predicate:

CONTAIN(E,C) =>
ALL_RELEVANT_EFFECT_PATHS_COVERED
∧ FENCES_ENFORCED
∧ RESOURCE_INCARNATIONS_CURRENT
∧ NO_UNCONTROLLED_BYPASS
∧ CLAIM_ASSUMPTIONS_VALID

Candidate strong claim:

STRONG_CLAIM(E,C) =>
CONTRACT_SUPPORTS(E,C)
∧ EVIDENCE_VALID
∧ DEPENDENCY_CLOSURE_VALID
∧ EFFECT_PATH_CLOSURE_VALID
∧ CURRENT_CONTEXT_VALID

## 23. Architectural consequence

Nexo's effect system is no longer simply:

AUTHORIZATION → EXECUTION.

It becomes:

INTENT
→ EFFECT_CLASS
→ EFFECT_CONTRACT
→ CLAIM_REQUIREMENT
→ EFFECT_PATH_CLOSURE
→ ADMISSION_CONTRACT
→ PROTECTED_ADMISSION
→ ENFORCEMENT
→ EFFECT
→ OUTCOME
→ RECONCILIATION
→ CLAIM.

This is a major clean-architecture boundary.

## 24. Remaining gaps

G-ECM-01 formal minimality of effect contracts.
G-ECM-02 effect-class completeness.
G-ECM-03 provider contract verification.
G-ECM-04 non-idempotent resource containment patterns.
G-ECM-05 open-world boundary proofs.
G-ECM-06 dynamic effect-path closure.
G-ECM-07 containment/refinement correspondence.
G-ECM-08 permanent UNKNOWN lifecycle.
G-ECM-09 safe release from containment.
G-ECM-10 actual TLC/SANY execution.
G-ECM-11 implementation refinement.
G-ECM-12 fault-injection validation.

## Conclusion

The research does not produce a universal minimum number of capabilities for every external effect.

It produces a stronger rule:

**THE MINIMUM CONTRACT IS THE SET OF CAPABILITIES REQUIRED TO PROVE THE CLAIM THAT ADMISSION IS ASKED TO SUPPORT.**

If an effect cannot provide those capabilities, Nexo must not silently lower the proof standard.

It must explicitly:

**WEAKEN CLAIM → CONTAIN → HOLD → OR REFUSE ADMISSION.**

And for non-reconcilable effects:

**UNKNOWN MAY BE PERMANENT.**

The architecture must be able to remain safe without pretending that the past has been reconstructed.

## Next attack

**EFFECT CONTRACT MINIMALITY UNDER COMPOSITION: TWO OR MORE EFFECTS WITH DIFFERENT CONTRACT CLASSES SHARING RESOURCES, QUEUES, AUTHORITY, RECOVERY OR COMPENSATION.**

Question:

Can individually admissible effects compose into an inadmissible transaction?

If yes, the next major object is likely a **Composite Effect Contract / Contract Closure**, which may connect directly with CCD, interaction graphs, joint uncertainty, containment and mission-level invariants.
