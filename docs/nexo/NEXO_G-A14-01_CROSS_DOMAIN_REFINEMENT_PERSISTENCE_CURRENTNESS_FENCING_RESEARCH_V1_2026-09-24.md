# NEXO G-A14-01 — Cross-Domain Refinement of Persistence, Currentness and Fencing
## Research + Code Study Delta V1 — 2026-09-24

Status: RESEARCH / CODE STUDY / ADVERSARIAL DESIGN
No implementation. No SANY/TLC proof. Architecture-build gate remains closed.

## 1. Question

Can the single abstract EXECUTION_ADMIT transition be refined when its concrete ingredients live in separate domains:
- protected state store;
- monotonic/currentness anchor;
- crash recovery;
- fencing;
- capability issuance/use?

## 2. Research cross-check

TLA+ explicitly supports implementation by refinement mapping: a lower-level specification implements a higher-level specification when its behavior maps to the higher-level specification. Auxiliary variables may be required to construct that mapping. Stuttering is permitted, but the mapping must preserve the relevant abstract behavior. This supports one abstract admission transition refined by multiple concrete steps, provided the intermediate concrete states cannot expose an unauthorized abstract effect. [Lamport, TLA+ refinement materials]

etcd's current disaster-recovery documentation provides a concrete rollback lesson. A restored snapshot can move the visible revision backwards; etcd therefore provides a revision-bump restore mechanism and marks revisions compacted to prevent stale consumers from continuing against the old history. Restore also creates a new logical cluster identity. Integrity checking of a snapshot does not by itself establish that the snapshot is current. [etcd disaster recovery documentation]

The TCG currently lists TPM 2.0 Library Specification Version 185 (March 2026). The existence of a standardized monotonic NV mechanism establishes that a platform can provide monotonic state, but it does not make that state atomically identical to an independently stored Nexo state. [TCG TPM 2.0 Library Specification]

## 3. Central result

The abstract transition CAN be refined into multiple concrete steps, but only if the concrete protocol exposes explicit intermediate states and maps them to non-success abstract states.

The unsafe shortcut is:

STORE_COMMIT
→ ANCHOR_UPDATE
→ CAPABILITY_ISSUE
→ therefore ABSTRACT_EXECUTION_ADMITTED

That inference is rejected.

The safe shape is:

ABSTRACT:
EXECUTION_ADMIT

CONCRETE:
PREPARE_ADMISSION
→ DURABLE_INTENT
→ CROSS_DOMAIN_BIND
→ VERIFY_CURRENTNESS
→ ADVANCE/CONFIRM_FENCE
→ ISSUE_CAPABILITY
→ FINAL_ADMISSION_COMMIT

with explicit uncertainty states around every cross-domain boundary.

## 4. New semantic intermediate states

A concrete implementation needs states that do not necessarily appear in the minimal abstract machine:

- ADMISSION_PREPARED
- STORE_COMMITTED_ANCHOR_PENDING
- ANCHOR_ADVANCED_STORE_PENDING
- CROSS_DOMAIN_UNCERTAIN
- FENCE_PENDING
- CAPABILITY_PENDING
- CAPABILITY_ISSUED
- FINAL_ADMISSION_COMMITTED
- RECONCILIATION_REQUIRED

These are refinement states.

They must never map to abstract ExecutionEnabled unless the required proof obligations are satisfied.

## 5. Key refinement rule

A concrete intermediate state may be hidden as stuttering only if it does not change the abstract safety-relevant state.

Therefore:
CROSS_DOMAIN_UNCERTAIN
cannot stutter over
EXECUTION_ADMITTED.

It must map to a blocked/pending/unknown abstract condition or to a concrete state in which the abstract admission predicate remains false.

This is consistent with TLA+ refinement methodology: stuttering may hide internal steps, but not a safety-relevant semantic transition.

## 6. Cross-domain commit matrix

### Case A — Store commits, anchor does not

Observed:
STORE = NEW
ANCHOR = OLD/UNKNOWN

Result:
CROSS_DOMAIN_UNCERTAIN.

Do not issue normal execution capability.

Recovery:
reconcile whether anchor update occurred;
if not, complete under the same logical transaction identity only if protocol permits;
otherwise quarantine/recover.

### Case B — Anchor advances, store does not

Observed:
ANCHOR = NEW
STORE = OLD

Result:
CROSS_DOMAIN_UNCERTAIN.

Do not manufacture state from the anchor.

The anchor proves only that its monotonic state advanced, not that the protected semantic state committed.

### Case C — Store and anchor both appear new

This is not sufficient by itself.

Need:
- exact operation identity;
- exact state lineage;
- exact anchor binding;
- VersionSet;
- recovery lineage;
- trusted context.

Otherwise two independently valid histories can appear internally consistent while being mutually unrelated.

### Case D — Anchor unavailable

Currentness required by the transition becomes UNKNOWN.

Protected release is blocked.

### Case E — Anchor reset/reprovisioned

Reset is not equivalent to continuity.

Create a new recovery/enrollment lineage.

Old authority cannot be inherited automatically.

## 7. Fencing interaction

Fence advancement must be treated as another protected state transition, not as a side effect of capability issuance.

Unsafe:
issue capability -> increment fence later

because a stale actor could remain valid during the gap.

Safer ordering:
establish current fence/context -> admit -> issue capability bound to exact fence

But even this does not solve crash ambiguity unless the capability issuance itself is bound to durable admission identity and currentness.

## 8. Capability interaction

Capability issuance should be a refinement output of successful protected admission.

Candidate binding:

Capability =
{
  capability_id,
  operation_id,
  effect_key,
  target_fingerprint,
  authority_epoch,
  fence,
  VersionSet,
  footprint_epoch,
  expiry/nonce,
  executor_identity
}

If issuance succeeds after the protected state commits but before the caller learns the result, retry must use the same logical identity.

NEW ATTEMPT != NEW EFFECT.

If issuance is ambiguous, the system must reconcile capability state rather than minting a new logical operation to escape uncertainty.

## 9. Crash matrix

### Crash before PREPARE
No protected effect.

### Crash after PREPARE before durable intent
No successful admission; recovery may discard uncommitted preparation.

### Crash after durable intent
Pending identity must survive.

### Crash after store commit before anchor
CROSS_DOMAIN_UNCERTAIN.

### Crash after anchor before store
CROSS_DOMAIN_UNCERTAIN.

### Crash after final admission before capability delivery
Admission may be committed; capability delivery is uncertain.
Recovery must reconstruct the capability from the durable identity or otherwise keep execution blocked until reconciliation.

### Crash after capability delivery
Capability use remains subject to current fence, authority, STOP and context.

### Crash after external attempt
External state may be UNKNOWN regardless of local admission status.

## 10. Rollback interaction

etcd's restore behavior is a useful concrete example: a snapshot is internally checkable for integrity while still representing an older revision. The system therefore uses explicit revision discontinuity/bump and new logical-cluster identity during restore.

For Nexo:
INTEGRITY_OK
does not imply
CURRENTNESS_OK.

A restored state must establish:
- recovery lineage;
- currentness witness;
- current fence;
- current STOP;
- current authority;
- compatible VersionSet;
- unresolved-effect continuity.

Otherwise recovery remains quarantined.

## 11. Stronger abstract mapping

The abstract state should expose a derived predicate:

AdmissionValid =
AuthorityValid
AND FenceValid
AND CurrentnessValid
AND ContextValid
AND StopNotBlocking
AND EffectBindingValid
AND RequiredEvidenceValid
AND NoCriticalUnknown

Concrete states may have additional protocol variables, but the mapping must preserve the truth of this predicate.

No concrete step may turn AdmissionValid true merely because a local component succeeded.

## 12. Cross-domain proof obligation

For every physical boundary B:

BOUNDARY_COMMIT(B) must have:
- operation identity;
- expected predecessor state;
- expected successor state;
- lineage;
- crash semantics;
- retry semantics;
- timeout semantics;
- reconciliation rule;
- evidence of actual completion.

If any required relation is unknown, the composed transition cannot be mapped to successful abstract admission.

## 13. Candidate implementation classes

### A. Single protected replicated state machine

Store, fence and admission identity live inside one consensus-backed state machine.

Advantage:
strongest semantic atomicity.

Residual:
external TPM/device/provider cannot automatically become atomic participants.

### B. Protected store + external monotonic anchor

Requires explicit cross-domain uncertainty protocol.

Advantage:
can use hardware anti-rollback.

Residual:
two-domain commit ambiguity remains.

### C. Protected store + independent witness + journal

Adds a durable cross-domain journal.

Advantage:
better recovery evidence.

Residual:
journal itself becomes another protected dependency.

### D. Hardware-backed transactional primitive

Potentially strongest if the platform provides exactly the needed atomic binding.

But this is a platform assumption, not something Nexo may assume universally.

No option is selected yet.

## 14. Important negative result

We cannot eliminate cross-domain uncertainty merely by adding more IDs, hashes or signatures.

These provide:
- identity;
- integrity;
- provenance.

They do not automatically provide:
- atomicity;
- currentness;
- common lineage;
- effect completion.

Therefore:
CRYPTOGRAPHICALLY_VALID != CURRENTLY_AUTHORIZED.

## 15. Code-study consequence

The concrete executor must not contain an independent "success" path such as:
store_success || anchor_success || capability_success.

Success must be produced only by the protected protocol's final admission condition.

Any implementation API that returns success from an individual component must be treated as a lower-level result, not as Nexo admission success.

## 16. New contracts

PSC-121 — Cross-Domain Intermediate-State Exposure
PSC-122 — Cross-Domain Uncertainty Preservation
PSC-123 — Refinement Stuttering Safety
PSC-124 — Fence-before-Capability Binding
PSC-125 — Capability Admission Derivation
PSC-126 — Crash-Reconstructable Admission Identity
PSC-127 — Currentness-vs-Integrity Separation
PSC-128 — Cross-Domain Commit Evidence

## 17. New invariants

INV-GA14-01-134:
A concrete cross-domain uncertain state cannot map to successful abstract admission.

INV-GA14-01-135:
Anchor advancement alone cannot establish protected-state commitment.

INV-GA14-01-136:
Protected-state commitment alone cannot establish required anchor continuity.

INV-GA14-01-137:
A capability cannot become a new authority source merely because issuance succeeded.

INV-GA14-01-138:
Fence state used by a capability must be bound to the admitted operation/effect context.

INV-GA14-01-139:
Integrity-valid restored state is not necessarily current state.

INV-GA14-01-140:
A refinement mapping cannot hide a safety-relevant cross-domain transition as stuttering.

INV-GA14-01-141:
If final admission status is uncertain after crash, the system must preserve admission identity and reconcile rather than infer success/failure from missing response.

## 18. Mini-audit

Result: the proposed one-machine abstract model survives, but its concrete refinement requires explicit intermediate uncertainty states.

Important correction:
The minimal abstract machine may remain small, while the concrete implementation is allowed to be substantially more complex.

The complexity must live in refinement machinery, not be erased from the safety semantics.

No contradiction found with A01-A14 or previous G-A14-01 research.

## 19. Status

Abstract EXECUTION_ADMIT: DESIGN REFINED.
Cross-domain intermediate states: DESIGN REFINED.
Store/anchor binding: OPEN.
Concrete atomicity: OPEN.
Fencing/capability ordering: DESIGN REFINED.
Crash recovery mapping: DESIGN REFINED.
Rollback/currentness: DESIGN REFINED.
Concrete implementation feasibility: OPEN.
Formal refinement proof: NOT PROVEN.
SANY/TLC: NOT RUN.
Architecture-build gate: CLOSED.

Next research target:
Study whether a single protected replicated state machine can absorb the minimum required admission/currentness/fence state while treating hardware anchors and external providers as explicit non-atomic participants, and identify the smallest state that must actually be inside the linearization domain.
