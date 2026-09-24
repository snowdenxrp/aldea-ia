# NEXO — CONTROL COMMIT / EFFECT COMMIT CROSS-DOMAIN ATOMICITY + ACK AMBIGUITY — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can Nexo define a universal abstract contract for the boundary where the external world commits before Nexo can durably observe that commit, without pretending a distributed transaction exists where it does not?

## External cross-check

AWS notes that distributed systems commonly face the gap between at-most-once and at-least-once execution, while exactly-once behavior is difficult; idempotency tokens can make repeated requests have the same effect, but the contract must be implemented by the service and propagated through downstream systems. citeturn0search2turn0search3 AWS also distinguishes an acknowledgement that a request was registered from knowledge that downstream work has completed. citeturn0search4turn0search7 TLA+ is explicitly aimed at precise modeling of asynchronous/concurrent systems, which supports treating these boundaries as separate abstract transitions rather than collapsing them into one state. citeturn0search5turn0search9

## Core result

There is no universal semantic meaning of ACK.

An ACK must be typed by the property it establishes.

Candidate hierarchy:

REQUEST_RECEIVED
REQUEST_ACCEPTED
REQUEST_DURABLY_RECORDED
EXECUTION_STARTED
EFFECT_COMMIT
EFFECT_OBSERVED
EFFECT_RECONCILED
CLAIM_VERIFIED

These are different claims.

Therefore:

ACK != EFFECT_COMMIT
ACK != OBSERVATION
ACK != VERIFIED_TRUTH

unless the provider contract explicitly defines that exact meaning and its assumptions are satisfied.

## 1. Canonical crash

Nexo:
CONTROL_COMMIT
→ sends external request

Provider:
EFFECT_COMMIT

Nexo:
crashes before recording EffectCommit

Recovery:
sees only ControlCommit + missing observation.

The world may already have changed.

The correct state is not NO_EFFECT.

It is:

EXTERNAL_EFFECT_UNKNOWN

until claim-adequate reconciliation/evidence resolves it.

## 2. The ACK taxonomy

Candidate ACK classes:

A0 RECEIVED:
provider/network accepted the message for processing.

A1 ACCEPTED:
provider accepted the request according to its API contract.

A2 DURABLE_INTENT:
provider durably retained the request.

A3 EXECUTION_STARTED:
provider reports execution began.

A4 EFFECT_COMMIT:
provider/resource says the protected effect reached its defined commit boundary.

A5 EFFECT_CONFIRMED:
provider/resource provides evidence sufficient for the specific effect outcome claim.

A6 RECONCILED:
Nexo independently reconciled current state/history sufficiently for the claim.

A7 VERIFIED:
an independent assurance process validates the exact claim under current context.

These levels must not be silently promoted.

## 3. Provider ACK is scoped

An ACK can prove only the provider-defined property.

For example:

RECEIVED does not prove STARTED.

STARTED does not prove COMMITTED.

COMMITTED does not necessarily prove the physical resource reached the intended state.

And a provider-level COMMITTED claim may still be insufficient for a Nexo-level claim if the claim includes another downstream resource or invariant.

Therefore:

PROVIDER_CLAIM != NEXO_CLAIM

without an explicit refinement/assurance contract.

## 4. EffectCommit must be effect-class-specific

There cannot be one universal EffectCommit definition.

For a database mutation, commit may be a durable transactional state transition.

For a physical actuator, commit may mean the resource accepted and applied a command.

For an asynchronous workflow, commit may mean a durable state-machine transition.

For a payment-like external effect, provider acceptance may still not prove final settlement.

Thus:

EffectClass defines its own commit semantics.

## 5. EffectCommit contract

Candidate fields:

effect_commit_id
effect_id
attempt_id
provider_execution_id
resource_incarnation
effect_class
provider_commit_definition
commit_linearization_reference
provider_evidence
observation_generation
causal/order context
freshness
dependency closure
boundary generation
reconciliation status
assumptions
claim scope

EffectCommit is evidence about a provider/resource-defined event, not automatic global truth.

## 6. External commit before local record

The fundamental failure window is:

EFFECT_COMMIT
→ CRASH
→ LOCAL_RECORD_MISSING

This is not necessarily fixable by making the local database transaction stronger.

The external system may not participate in that transaction.

Therefore the architecture needs:

STABLE_EFFECT_IDENTITY
+
PROVIDER_RECONCILIATION
+
CURRENT_RESOURCE_IDENTITY
+
HISTORY/STATUS QUERY
+
FENCING
+
RECOVERY PROTOCOL

where supported.

If these are unavailable, the outcome may remain UNKNOWN permanently or until the provider's proof boundary changes.

## 7. No fake two-phase commit

The architecture must not claim:

CONTROL_COMMIT + EFFECT_COMMIT = distributed atomic transaction

unless the participating systems actually provide the required protocol and guarantees.

Our abstract model instead represents:

CONTROL DOMAIN
↕
EFFECT DOMAIN

with an explicit uncertainty/reconciliation boundary between them.

## 8. Stable effect identity becomes the bridge

The safest bridge between domains is not a shared boolean.

It is a stable external effect identity:

EffectIdentity
→ ProviderExecution
→ ResourceIncarnation
→ EffectHistory

The identity allows Nexo to ask:

“What happened to this exact logical effect?”

rather than:

“What is the resource doing now?”

Those are different questions.

## 9. Current state is not historical outcome

A resource currently showing:

STATE = OFF

does not automatically prove:

EFFECT(E1) never occurred.

It could mean:

E1 occurred → later E2 changed state to OFF.

Therefore reconciliation must distinguish:

CURRENT_STATE
EFFECT_HISTORY
OBSERVATION_ABSENCE
CURRENT_INCARNATION

This extends the earlier post-commit/pre-observation research.

## 10. Resource replacement

Suppose:

E1 commits on R1
→ Nexo crashes
→ R1 replaced by R2
→ R2 currently shows the expected state.

That does not prove E1 affected R2.

R1 and R2 are distinct incarnations.

Therefore:

RESOURCE_NAME != RESOURCE_INCARCATION

and:

CURRENT_STATE(R2) != HISTORICAL_EFFECT(E1@R1)

without an explicit transfer/continuity contract.

## 11. Provider history compaction

Even if the provider supports history, history may have a retention/compaction boundary.

Then:

NO_RECORD_AFTER_COMPACTION

does not prove:

NO_EFFECT.

Instead it creates a proof boundary.

Candidate:

HISTORY_PROOF_BOUNDARY

After that boundary, strong historical claims may become impossible unless another independent evidence source exists.

## 12. Reconciliation is itself a protected effect path

A reconciliation query can be stale, routed to the wrong resource, served from cache, or executed under an outdated context.

Therefore:

RECONCILIATION != AUTOMATIC_TRUTH

A reconciliation record needs:

effect identity
resource incarnation
observation generation
context
freshness
provider semantics
source identity
dependency closure
conflict status

## 13. Conflicting evidence

Possible:

Observer A: COMMITTED

Observer B: NO_EFFECT

Observer C: UNKNOWN

Do not vote blindly.

Need:

EVIDENCE_CONFLICT

and a claim-specific resolution policy.

If no authoritative/refinement relation establishes which evidence can prove the claim:

CLAIM = UNKNOWN/DEGRADED

## 14. ACK after timeout

Sequence:

request sent
→ timeout
→ Nexo UNKNOWN
→ provider later ACKs

The late ACK is historical evidence.

It does not automatically authorize:

retry
continue
compensate
release
new downstream effect

The current authority/context must be revalidated independently.

## 15. ACK after STOP

STOP can occur after the request but before provider response.

Then:

STOP_REQUESTED
!= EXTERNAL_CANCELLATION
!= EFFECT_ABSENT

The late ACK may establish that the earlier request reached a provider boundary.

It does not clear STOP.

## 16. ACK after resource replacement

Late response bound to R1 must not be interpreted as evidence about R2.

Provider execution identity and resource incarnation must remain bound.

## 17. ACK after policy/invariant change

Historical provider success can remain valid as historical evidence while becoming insufficient for a current claim.

Therefore:

HISTORICAL_SUCCESS != CURRENT_AUTHORIZATION

and:

HISTORICAL_SUCCESS != CURRENT_CLAIM_VALIDITY

## 18. The four clocks

This round strengthens the previous multi-clock model:

CONTROL_ORDER
PROVIDER_ORDER
RESOURCE_ORDER
WORLD_EFFECT_ORDER

plus:

OBSERVATION_ORDER

There is no universal total order.

A claim requiring causal order must identify which ordering relation is actually required.

If:

WORLD_EFFECT_ORDER = UNKNOWN

then claims depending on that order cannot be promoted merely because control order is known.

## 19. New object: EffectCommitClaim

Candidate fields:

claim_id
effect_id
attempt_id
effect_class
target/resource incarnation
provider contract
required property
evidence set
context identity
freshness
dependency closure
causal-order requirement
assumptions
verification status
invalidation conditions

This is deliberately separate from EffectCommit itself.

EffectCommit = provider/resource event.

EffectCommitClaim = Nexo assertion about what that event proves.

## 20. New object: ReconciliationBoundary

Candidate fields:

boundary_id
effect identity
resource incarnation
provider/source
history availability
freshness boundary
query semantics
proof boundary
conflict policy
current context
required dependencies
reconciliation status

It defines how far the system can legitimately infer from external observation.

## 21. Claim promotion

Candidate chain:

OBSERVED
→ AUTHENTICATED
→ IDENTITY_BOUND
→ CONTEXT_BOUND
→ SEMANTICALLY_VALIDATED
→ CLAIM_VERIFIED

A provider ACK can enter this chain, but cannot skip directly to VERIFIED.

## 22. Universal abstract contract

The strongest candidate universal contract is not “exactly once.”

It is:

EXTERNAL_EFFECT_PROTOCOL(E) must define:

1. stable effect identity;
2. attempt identity;
3. target/resource identity and incarnation;
4. provider commit boundary;
5. acknowledgement semantics;
6. duplicate semantics;
7. retry semantics;
8. history/status query semantics;
9. cancellation/fencing semantics;
10. resource replacement semantics;
11. proof/observation boundary;
12. freshness/retention;
13. crash semantics;
14. recovery/reconciliation semantics;
15. uncertainty semantics;
16. compensation semantics;
17. dependency/assumption closure.

If an effect class cannot provide enough of these to support its required claim, Nexo must weaken the claim or contain the effect rather than invent a guarantee.

## 23. Three effect classes emerge

### E0 — Strongly reconcilable

Stable identity + durable history/status + current resource identity + sufficient fencing.

UNKNOWN can often be reduced by reconciliation.

### E1 — Bounded but not fully observable

Stable identity/fencing exists, but historical proof is limited.

Nexo can maintain safety but some historical claims remain UNKNOWN.

### E2 — Unreconciliable external effect

No stable identity, no trustworthy status/history, weak/no fencing, or open autonomous continuation.

Strong post-failure claims may be impossible.

Architecture consequence:

E2 effects require much stronger admission restrictions, containment, or explicit acceptance of permanent uncertainty.

## 24. New invariants INV-ECA-01..28

INV-ECA-01 ACK semantics are typed.
INV-ECA-02 Provider ACK cannot be promoted beyond its contract.
INV-ECA-03 Provider claim and Nexo claim are distinct.
INV-ECA-04 EffectCommit is effect-class-specific.
INV-ECA-05 ControlCommit does not imply EffectCommit.
INV-ECA-06 EffectCommit does not imply local observation.
INV-ECA-07 Missing local record does not prove no external effect.
INV-ECA-08 Stable effect identity is required where reconciliation depends on exact-effect history.
INV-ECA-09 Resource incarnation is part of effect binding where relevant.
INV-ECA-10 Current state does not prove historical outcome.
INV-ECA-11 History compaction creates a proof boundary.
INV-ECA-12 Reconciliation is evidence, not automatic truth.
INV-ECA-13 Conflicting evidence prevents unjustified claim promotion.
INV-ECA-14 Late ACKs are historical evidence until current context validates their use.
INV-ECA-15 STOP is not cleared by late ACK.
INV-ECA-16 Resource replacement invalidates old resource-bound evidence for new incarnation.
INV-ECA-17 Policy changes can invalidate claim sufficiency without erasing history.
INV-ECA-18 Control order does not establish world-effect order.
INV-ECA-19 Observation order does not establish causal effect order.
INV-ECA-20 Unknown causal order blocks claims requiring known order.
INV-ECA-21 EffectCommitClaim is separate from EffectCommit.
INV-ECA-22 ReconciliationBoundary is claim-specific.
INV-ECA-23 Claim promotion requires identity/context/freshness/semantics adequate to the property.
INV-ECA-24 No universal exactly-once guarantee is assumed without an actual protocol.
INV-ECA-25 Compensation/retry remain new protected effects.
INV-ECA-26 External effect classes require explicit recovery contracts.
INV-ECA-27 Unreconcilable effects may require containment or permanently degraded claims.
INV-ECA-28 Strong claims cannot exceed provider/resource contract and environment assumptions.

## 25. Formal model direction

Abstract domains:

CONTROL
PROVIDER
RESOURCE
WORLD
OBSERVATION
CLAIM

Transitions:

ControlCommit
RequestSent
ProviderAccepted
ProviderCommit
WorldEffect
Observe
Reconcile
ClaimPromote

Possible crash edges exist between all transitions.

Candidate safety property:

CLAIM_VERIFIED(E,C) ⇒ provider/resource evidence satisfies C under current context and assumptions.

Candidate uncertainty property:

EFFECT_COMMIT ∧ ¬OBSERVED_LOCAL ⇒ EFFECT_OUTCOME may remain UNKNOWN.

Candidate non-inference:

PROVIDER_ACK(A0..A3) does not imply EFFECT_COMMIT unless provider contract defines that equivalence.

Candidate refinement:

CONCRETE_PROVIDER_PROTOCOL ⊑ ABSTRACT_EFFECT_PROTOCOL

must be demonstrated per effect class.

## 26. Major architectural consequence

The architecture now has a formal **External Effect Contract Boundary**.

Inside Nexo:

AUTHORITY
CONTROL_COMMIT
DURABLE_INTENT
FENCE
RECOVERY

Outside:

PROVIDER
RESOURCE
WORLD_EFFECT

Between them:

EFFECT_IDENTITY
EFFECT_PROTOCOL
ACK_SEMANTICS
EFFECT_COMMIT
RECONCILIATION
EVIDENCE
UNCERTAINTY

This boundary is not a distributed transaction by default.

It is an explicit epistemic and causal boundary.

## 27. Remaining gaps

G-ECA-01 effect-class taxonomy and minimum contracts.
G-ECA-02 provider-specific commit semantics.
G-ECA-03 stable effect identity collision/expiry.
G-ECA-04 resource incarnation continuity.
G-ECA-05 history retention/proof boundaries.
G-ECA-06 conflicting observer resolution.
G-ECA-07 causal-order formalization.
G-ECA-08 external commit before local recording fault injection.
G-ECA-09 formal refinement per effect class.
G-ECA-10 actual TLC/SANY execution.
G-ECA-11 implementation refinement.
G-ECA-12 long-duration provider retry/history tests.

## Conclusion

The research does not find a universal way to make Nexo and an arbitrary external system atomic.

Instead it finds a stronger and more honest abstraction:

Nexo must define exactly what external protocol it has, exactly what each acknowledgement means, exactly what can be reconciled, and exactly what remains UNKNOWN.

The architectural rule is:

NO ACK PROMOTION WITHOUT CONTRACT.

And:

NO NEXO CLAIM BEYOND THE EXTERNAL EFFECT PROTOCOL.

## Next attack

**EFFECT-CLASS CONTRACT MINIMALITY + NON-IDEMPOTENT PROVIDERS + UNRECONCILABLE EFFECTS + SAFE CONTAINMENT**

Question: what is the minimum contract an external effect must satisfy for Nexo to safely admit it, and what should happen when the external world cannot provide stable identity, fencing, cancellation or reconciliation?
