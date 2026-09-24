# NEXO CANONICAL REFINEMENT CONTRACT V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation.

## 1. Purpose

This contract defines what must be supplied before any claim that a concrete Nexo mechanism refines the canonical protected-transition model.

NIST SP 800-160 Rev. 1 emphasizes secure, insecure and indeterminate states, secure state transitions, protective failure and trusted recovery. This directly supports treating recovery, degraded states and indeterminate outcomes as part of the refinement contract rather than as implementation exceptions. citeturn0search25turn0search24

## 2. Refinement claim identity

Every refinement claim MUST have:

- refinement_claim_id
- abstraction_level_from
- abstraction_level_to
- abstract_spec_id/version
- concrete_spec_id/version
- mapping_id/version
- protocol_id/version
- implementation_id/version, when applicable
- dependency_graph_fingerprint
- failure_domain_context
- trust_root_context
- policy/invariant context
- assumptions_fingerprint
- toolchain/version
- model/configuration fingerprint
- evidence status
- review/expiry metadata.

A refinement claim is stale when any safety-relevant input to the mapping changes.

## 3. Canonical contract

Each claim has:

### A. Abstract pre-state

Exact abstract state predicate.

### B. Concrete pre-state

Exact implementation state predicate.

### C. Read set

Every safety-relevant input read by the concrete transition.

### D. Guard

Exact condition under which the concrete transition may proceed.

### E. Linearization correspondence

The concrete event/interval that corresponds to the abstract transition.

### F. Concrete write set

Every authoritative state changed.

### G. Abstract post-state

Exact abstract predicate after the transition.

### H. Stuttering allowance

Concrete internal steps that may occur without changing mapped abstract safety state.

### I. Forbidden mapped behaviors

Concrete behaviors that may not map to an allowed abstract state.

### J. Crash semantics

Mapping for crash before, during and after linearization.

### K. Partition semantics

Mapping for loss of authority, coordination or communication.

### L. Retry semantics

Identity, replay and idempotency behavior.

### M. Evidence requirements

Evidence needed to establish the transition's postcondition.

### N. Assumptions

Storage, timing, identity, cryptographic, scheduler, external-system and failure assumptions.

### O. Verification method

Formal proof, model checking, trace correspondence, fault injection, runtime test, or other explicitly named evidence.

## 4. Contract status

A claim must distinguish:

UNSPECIFIED
→ MAPPING_DEFINED
→ STRUCTURALLY_CHECKED
→ MODEL_CHECKED
→ PROOF_CHECKED
→ IMPLEMENTATION_CORRESPONDENCE_TESTED
→ RUNTIME_EVIDENCE.

These are lifecycle states, not scores.

Any dependency change may invalidate a previous status.

## 5. Six critical refinement contracts

### RC-01 Authorization ↔ Revocation

Abstract:
AUTHORIZATION_ACCEPTED or AUTHORIZATION_REJECTED.

Concrete must bind:
AuthorityContext + PolicyBaseline + InvariantBaseline + StopState + RecoveryFence + VersionSet + EffectBinding.

Linearization:
the protected admission event.

Required races:
- authorize before revoke;
- revoke before authorize;
- concurrent policy change;
- concurrent stop;
- concurrent recovery;
- stale cached authority.

Required property:
No stale authority context may produce a protected authorization.

Crash:
If admission commits before response, recovery must preserve the decision.

Partition:
No current authority → reject/hold, never authorize from stale cache.

### RC-02 Execution ↔ STOP

Abstract:
execution admitted only while the applicable STOP fence permits it.

Concrete:
final execution gate must read the current effect binding, authority, fence, STOP context, recovery context and VersionSet.

Linearization:
final execution admission.

Required races:
- execution before STOP;
- STOP before execution;
- execution observes old STOP state;
- delayed execution after STOP;
- restart after STOP.

Critical distinction:
local stop enforcement does not prove external cancellation.

Crash:
after STOP activation, restart must not silently clear the stop fence.

### RC-03 Execution ↔ Recovery

Abstract:
EXECUTION and RECOVERY_RELEASE cannot authorize conflicting contexts.

Concrete:
RecoveryFence + current AuthorityContext + StopState + ExternalEffectState + VersionSet.

Linearization:
explicit recovery release.

Required races:
- execution vs recovery;
- recovery vs UNKNOWN;
- recovery vs STOP;
- checkpoint restore vs current authority;
- stale recovery owner.

Checkpoint data may restore state but cannot restore authority.

### RC-04 Execution ↔ Update

Abstract:
execution uses one admitted compatible VersionSet.

Concrete:
VersionSet activation + final execution gate.

Linearization:
protected VersionSet activation and subsequent execution admission.

Required races:
- execute during staging;
- execute during activation;
- rollback vs UNKNOWN;
- policy change during activation;
- dependency closure change.

A valid artifact signature is not enough to prove semantic safety compatibility.

### RC-05 Decommission ↔ Recovery

Abstract:
DECOMMISSIONED identity cannot regain protected authority.

Concrete:
identity/lifecycle fence + authority revocation + delegation closure + lease closure + recovery/update closure.

Linearization:
decommission closure.

Required races:
- restart vs decommission;
- recovery vs decommission;
- delegated worker vs decommission;
- update vs decommission;
- pending external effect vs decommission.

Restored application state cannot resurrect a decommissioned authority context.

### RC-06 Evidence ↔ Invalidation

Abstract:
claim acceptance uses only current valid evidence.

Concrete:
EvidenceRecord + dependency/context versions + invalidation state + verification claim.

Linearization:
claim acceptance or equivalent protected verification commit.

Required races:
- evidence write vs invalidation;
- verification vs policy change;
- verification vs dependency change;
- observer revocation;
- stale/replayed observation.

Evidence becoming stale or invalid must conservatively invalidate dependent claims.

## 6. Mapping completeness

For every abstract state variable, declare one of:

DIRECT
DERIVED
COMPOSITE
ABSTRACTED
NOT_REPRESENTED_WITH_REASON.

For every abstract transition, declare:

DIRECTLY_IMPLEMENTED
COMPOSED
ABSTRACTED
NOT_IMPLEMENTED_WITH_REASON.

No silent omissions.

## 7. Transition correspondence matrix

Minimum fields:

abstract_transition
concrete_transition_set
abstract_precondition
concrete_precondition
read_set
write_set
linearization_event
abstract_postcondition
stuttering_steps
forbidden_interleavings
crash_mapping
partition_mapping
retry_mapping
evidence_requirements
assumptions
verification_method
status
context_fingerprint.

## 8. Counterexample protocol

When correspondence fails, preserve:

- concrete trace;
- abstract mapped trace;
- first divergence;
- operation/effect identity;
- context fingerprint;
- violated invariant;
- failure domain;
- assumption state;
- whether defect is abstract model, mapping, protocol, implementation or environment.

A failed refinement attempt must not be converted into a generic PASS/FAIL flag without classification.

## 9. Evidence boundary

A refinement result does not itself prove:
- external-world truth;
- absence of unmodeled failures;
- deployment independence;
- liveness;
- operational availability.

Those require separate claims and evidence.

NIST's cyber-resilience guidance treats resilience as an engineering concern spanning architecture, implementation, maintenance and operation, including the ability to anticipate, withstand, recover and adapt. citeturn0search1turn0search3

## 10. Six mandatory adversarial scenarios

Each critical contract must eventually exercise:

1. stale actor after revocation;
2. crash at every boundary around the linearization event;
3. delayed/replayed message;
4. partition during protected transition;
5. dependency/common-mode failure;
6. context invalidation immediately before/after acceptance.

## 11. No hidden authority rule

The concrete implementation must not obtain protected authority from:

- model confidence;
- reward/metric;
- planner output;
- telemetry timestamp;
- checkpoint restoration;
- lease possession alone;
- internal ACK;
- cached policy;
- new operation ID;
- successful local execution;
- proof-cache status.

Any such information can influence a protected decision only through an explicit, verified promotion contract.

## 12. Result

The refinement contract is now concrete enough to become a gate for the clean architecture.

The architecture will not be declared complete merely because:
- formal states exist;
- a protocol exists;
- tests pass;
- or a mapping file exists.

The claim must progress through the evidence lifecycle and preserve its assumptions and context.

## 13. Next research gate

Next research target:

**IMPLEMENTATION OBSERVABILITY + TRACE CORRESPONDENCE**

We need to determine exactly what production/runtime events must exist so that a future implementation can prove:

implementation event trace
→ protected transition
→ linearization point
→ abstract state transition
→ safety evidence.

This includes event identity, ordering, durability, clock semantics, trace loss, duplicate events, observer independence, crash boundaries and privacy/security constraints.

Architecture remains blocked.