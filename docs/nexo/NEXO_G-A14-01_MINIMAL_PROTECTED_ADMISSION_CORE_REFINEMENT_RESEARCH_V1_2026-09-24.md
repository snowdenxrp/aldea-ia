# NEXO G-A14-01 — Minimal Protected Admission Core
## Abstract State Machine + Refinement Decomposition Research Delta V1 — 2026-09-24

Status: RESEARCH / CODE STUDY / ADVERSARIAL DESIGN
No implementation. No SANY/TLC proof. No architecture gate closure.

## 1. Research question

Can the protected admission core be reduced to a minimal abstract state machine whose authority, capability, fencing, STOP, currentness and effect identity contracts can be independently refined and audited?

## 2. External evidence

seL4 provides a concrete precedent for layered refinement. Its proof repository separates abstract, design, C and binary-related specifications and contains refinement proofs between those layers. The repository explicitly describes the abstract specification, design specification, C semantics and refinement proof structure. [seL4 l4v README]

seL4's published verification story states that its C implementation is proven to refine its abstract specification, while binary correctness is a further refinement layer on supported configurations. This supports using an abstract state machine as the semantic anchor rather than making the concrete implementation the specification. [seL4 verification documentation]

TLA+ refinement mapping provides the corresponding specification-level mechanism: a lower-level specification can implement a higher-level specification through a mapping from concrete variables to abstract variables, while permitting internal representation differences. This is useful for Nexo, but only if safety-relevant state is not incorrectly hidden as stuttering. [Lamport TLA+ material]

CAmkES source also provides a practical warning: generated system configuration, capability distribution and build options materially affect the resulting system. Its build tooling contains an explicit CapDL verification option and static-allocation dependencies. Therefore the refinement context must include generated configuration/build identity, not merely source code identity.

## 3. Research result

YES — the protected admission core can be decomposed into a small abstract semantic kernel.

But it should NOT be decomposed into independent state machines that can commit independently.

The correct unit is:

ONE ABSTRACT SAFETY MACHINE
+
orthogonal state components
+
explicit shared transition guards
+
separate refinement obligations.

The components share the same protected transition/linearization boundary.

## 4. Minimal abstract state

Candidate minimal semantic state:

### Identity
IdentityState(identity, lifecycle_epoch, lifecycle_status)

### Authority
AuthorityState(authority_epoch, authority_status, scope)

### Effect
EffectBinding(operation_id, effect_key, target_fingerprint, parameter_fingerprint, expected_effect)

### Coordination
FenceState(scope, owner, generation, fence)

### STOP
StopState(scope, stop_epoch, phase)

### Currentness
CurrentnessState(anchor_identity, anchor_lineage, anchor_value, state_lineage, validity)

### Context
ContextState(VersionSet, PolicyBaseline, InvariantBaseline, footprint_epoch)

### External effect
ExternalEffectState(NOT_ATTEMPTED | ATTEMPTED | UNKNOWN | PARTIALLY_APPLIED | VERIFIED_OUTCOME)

### Recovery
RecoveryState(recovery_epoch, owner, quarantine, reconciled, release_state)

The key design question is whether evidence/dependency state must be in this minimal machine. Result: only the minimum protected predicates required to authorize a safety-relevant transition belong in the machine. Detailed evidence objects and dependency graphs may remain outside, provided the protected core receives a context-bound validity result that is itself part of the protected transition.

## 5. Derived predicates

The core should expose derived predicates, never writable authority booleans:

CurrentAuthority
CurrentFence
CurrentContext
CurrentCapability
CurrentnessValid
StopBlocking
EffectBindingValid
FootprintValid
RecoveryEligible
EvidenceEligible
ReleaseEligible

ReleaseEligible remains a conjunction of protected predicates.

## 6. Minimal transition families

The machine can be reduced to these semantic transition families:

1. AUTHORIZE
2. REVOKE
3. FENCE_ACQUIRE_OR_ADVANCE
4. EFFECT_BIND
5. EXECUTION_ADMIT
6. EFFECT_RECORD_INTENT
7. EFFECT_RECORD_OUTCOME
8. STOP_REQUEST
9. STOP_ENFORCE
10. STOP_VERIFY
11. RECOVERY_ENTER
12. RECOVERY_RECONCILE
13. RECOVERY_RELEASE
14. CONTEXT_ACTIVATE
15. EVIDENCE_INVALIDATE
16. LIFECYCLE_FENCE
17. LIFECYCLE_CLOSE

The important reduction is that capability issuance itself need not become a separate semantic authority state if it is modeled as a derived/issued representation of a successful protected admission. Capability implementation may then refine the abstract CurrentCapability predicate.

## 7. Critical shared boundary

The machine must preserve:

READ CONTEXT
→ VALIDATE
→ LINEARIZE
→ UPDATE PROTECTED STATE
→ DURABLE RESULT
→ CONTEXT-BOUND EVIDENCE

A concrete capability system cannot independently decide:
- current authority;
- current fence;
- STOP;
- currentness;
- VersionSet;
- exact EffectBinding.

Those are cross-domain safety predicates.

Therefore capability validation is a refinement of EXECUTION_ADMIT, not an alternative authority source.

## 8. Contract decomposition

Each contract can be independently audited while remaining subordinate to one protected transition protocol.

### Authority contract
Proves stale/revoked authority cannot pass admission.

### Capability contract
Proves possession/use of a capability is bounded by the protected authority context.

### Fence contract
Proves stale owners cannot perform protected transitions.

### STOP contract
Proves STOP cannot be cleared by the executor and blocks protected admission.

### Currentness contract
Proves restored/rolled-back state cannot claim current authority without an accepted currentness witness.

### Effect identity contract
Proves retries preserve operation/effect identity and cannot substitute a new identity to erase UNKNOWN.

### Context contract
Proves VersionSet/policy/invariant/footprint changes invalidate affected admissions.

### Evidence contract
Proves an accepted evidence result is scoped to the exact claim/context/effect and remains invalidated when dependencies change.

## 9. Why the contracts cannot be fully independent

Adversarial example:

Capability says VALID.
Authority epoch says STALE.
Fence says STALE.
STOP says ENFORCING.

A capability-only machine would accept.

Therefore:

CapabilityValid
AND CurrentAuthority
AND CurrentFence
AND NOT StopBlocking
AND CurrentContext
AND CurrentnessValid

must participate in the SAME protected admission decision.

This is the main architectural boundary between modular verification and unsafe decomposition.

## 10. Refinement decomposition

Candidate refinement chain:

R0 — Safety properties
R1 — Minimal Protected Admission Machine
R2 — Protected Transition Protocol
R3a — Capability enforcement
R3b — Currentness/fencing mechanism
R3c — Protected persistence
R3d — STOP enforcement
R3e — Effect gateway/provider adapter
R4 — Concrete executor/runtime
R5 — Deployment/hardware/provider environment

The branches at R3 are modular proof obligations, but they all refine R2.

No branch may independently redefine the meaning of authority.

## 11. Refinement obligations

For every R3 component:

A. State mapping
Concrete state maps to abstract state.

B. Action simulation
Every concrete safety-relevant action corresponds to an allowed abstract action.

C. No unauthorized extra behavior
Concrete execution cannot produce an abstract protected effect without the corresponding abstract admission.

D. Crash mapping
Concrete crash/restart maps to a permitted abstract state.

E. UNKNOWN preservation
Concrete ambiguity cannot map to an abstract successful outcome.

F. Context preservation
VersionSet/policy/invariant/fence/currentness changes cannot disappear during refinement.

G. Identity preservation
operation_id/effect_key cannot be silently substituted.

H. STOP preservation
A concrete STOP state cannot map to an abstract execution-enabled state.

## 12. Important new finding: refinement boundary is itself safety state

A refinement proof is invalid for a deployment if:
- implementation version differs;
- generated configuration differs;
- capability distribution differs;
- hardware configuration differs;
- policy/invariant baseline differs;
- assumptions differ.

Therefore the refinement context belongs in the same VersionSet/claim context machinery already designed by Nexo.

## 13. Concrete mapping candidate

Example:

Concrete:
cap_table[slot] = capability
authority_epoch = 42
fence = 17
stop_epoch = 8
version_digest = V7
anchor = A1009

maps to:

Abstract:
CurrentCapability = valid
CurrentAuthority(epoch=42)
CurrentFence(generation=17)
StopState(epoch=8, phase=not-blocking)
Context(V7)
CurrentnessValid(A1009)

The proof obligation is not that these fields have the same representation. It is that every concrete execution visible at the safety boundary corresponds to an allowed abstract behavior.

## 14. Adversarial attacks

1. Capability table restored from old snapshot.
Expected: concrete state maps to invalid currentness/recovery state, not current authority.

2. Fence counter rolls back.
Expected: currentness/fence mapping fails; protected admission blocked.

3. STOP state restored old.
Expected: mismatch with current STOP witness/context blocks release.

4. New VersionSet with old capability.
Expected: context mismatch blocks admission.

5. New operation_id for old UNKNOWN effect.
Expected: EffectBinding continuity blocks substitution.

6. Executor reports success before durable transition.
Expected: concrete success cannot map to abstract committed effect.

7. Capability gateway bypassed through IPC.
Expected: effect-path coverage/refinement obligation fails.

8. Provider adapter changes semantics without VersionSet change.
Expected: artifact/provider identity must be included in refinement context.

9. Generated code changes capability wiring.
Expected: generated configuration identity changes and invalidates old refinement evidence.

10. Hardware/IOMMU configuration differs from verified configuration.
Expected: deployment is outside the proven refinement context.

## 15. What can become independently auditable

The following are suitable proof/audit units:

- abstract transition safety;
- capability enforcement;
- fence monotonicity;
- currentness witness;
- STOP enforcement;
- persistence semantics;
- effect identity;
- provider reconciliation;
- build/deployment closure.

But they must compose through explicit assumptions and shared context.

## 16. What cannot be claimed yet

This research does NOT establish:
- that a minimal concrete implementation exists;
- that the proposed state is truly minimal;
- that all transitions are complete;
- that currentness can be implemented atomically with protected state;
- that a capability mechanism provides all required enforcement;
- that IPC/device paths are closed;
- that provider effects are verifiable;
- that SANY/TLC accepts the future formal model;
- that refinement proofs are mechanically feasible for the complete Nexo system.

## 17. Mini-audit

Result: hypothesis strengthened.

No contradiction with A12.

Important correction to architecture language:

Do NOT create:
AuthorityMachine + CapabilityMachine + StopMachine + FenceMachine
as independently authoritative machines.

Create:
One Protected Admission Machine
with modular state components and modular refinement proofs.

This preserves a single semantic authority while keeping proof/audit work decomposable.

## 18. Status

Minimal abstract machine: DESIGN REFINED.
State decomposition: DESIGN REFINED.
Transition decomposition: DESIGN REFINED.
Independent refinement obligations: DESIGN REFINED.
Capability as authority source: REJECTED.
Capability as refinement of admission: DESIGN REFINED.
Currentness/fence independent from admission: REJECTED.
Formal model implementation: NOT STARTED.
SANY/TLC: NOT RUN.
Mechanical refinement proof: NOT PROVEN.

Next research target:
Study the hardest remaining composition boundary: protected persistence/currentness/fencing. Determine whether one abstract transition can refine into a concrete protocol when state storage, monotonic anchor, crash recovery and capability issuance are physically separate domains, without hiding cross-domain uncertainty.
