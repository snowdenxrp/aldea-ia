# NEXO MINIMUM AUTHORITATIVE CORE BOUNDARY V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. This document defines semantic boundary candidates only. No implementation and no V21 architecture declaration.

## 1. External cross-check

NIST defines architecture as system properties embodied in elements, relationships, and principles of design/evolution, and security architecture as partitioning into security domains with explicit trust relationships and interactions. NIST SP 800-53 also identifies minimized security elements and least privilege: trusted components should be minimized because trust relationships increase analysis cost, while each component should receive only the privileges needed for its function. citeturn0search4turn0search5turn0search22

This supports a boundary based on **semantic authority and protected transitions**, not on process count.

## 2. Boundary question

The question is not:

“What services does Nexo need?”

It is:

“What is the smallest set of semantics that must remain authoritative and mutually consistent so that no external component can create a protected outcome without satisfying the canonical safety contract?”

## 3. Candidate minimum authoritative core

### CORE-1 — Identity / Trust Root Interface

Must establish:
- identity binding;
- trust-root validity;
- authentication/attestation result;
- credential/trust context version.

Does NOT need:
- planner;
- mission reasoning;
- natural-language interpretation.

Boundary rule:
identity evidence enters the core as typed, provenance-bound input; the model cannot manufacture identity authority.

### CORE-2 — Authority Context

Must own or validate:
- authority_context_id;
- authority epoch;
- scope;
- issuer/basis;
- expiry;
- revocation;
- policy/invariant versions;
- delegation limits.

It must answer only:
“Is this exact requested effect currently authorized under this context?”

It must not infer authorization from:
- reward;
- confidence;
- planner output;
- previous success;
- lease ownership;
- checkpoint state.

### CORE-3 — Effect Binding / Identity

Must establish immutable:
- effect_id/effect_key;
- operation linkage;
- exact target identity/fingerprint;
- normalized parameter fingerprint;
- preconditions;
- expected effect;
- idempotency/replay semantics;
- reversibility/compensation semantics.

This is a core boundary because without stable effect identity the system cannot safely interpret retry, timeout, recovery or external reconciliation.

### CORE-4 — Protected Transition / Linearization

Must enforce:
- declared read/write sets;
- protected transition preconditions;
- fencing;
- stale-actor exclusion;
- atomic/equivalent serialization semantics;
- durable ordering where required.

This is the semantic heart of the authoritative core.

A database is not automatically the linearization mechanism. The architecture must specify the semantic primitive and then choose an implementation.

### CORE-5 — Safety Gate / STOP Fence

Must ensure:
- current stop state is considered by protected admission;
- stop enforcement cannot be cleared by the executor;
- safety-critical execution is blocked when required;
- local stop verification is distinguished from external cancellation.

The core cannot claim external-world stop merely because local execution was blocked.

### CORE-6 — Recovery Fence / Release

Must enforce:
- quarantine after restart;
- current fence observation;
- current authority validation;
- recovery-owner separation;
- reconciliation requirements;
- explicit release.

Checkpoint restoration is input to recovery, not authority.

### CORE-7 — Version / Policy / Invariant Admission

Must establish the active safety context:
- complete VersionSet;
- policy baseline;
- invariant baseline;
- schema/state-machine compatibility;
- dependency closure;
- trust-root versions;
- artifact/config integrity.

Authentication of an artifact is not equivalent to semantic safety.

## 4. What does NOT belong in the minimum core by default

### Planner / model
Produces proposals, goals and plans.

It cannot directly authorize a protected effect.

### Natural-language interface
Converts human input into structured requests.

Interpretation is not authority.

### Memory / knowledge
Supplies context.

It cannot rewrite authority, safety fences or verified-world truth.

### Reward / optimization
Measures or optimizes objectives.

A metric is not authorization.

### UI
Displays and collects information.

It cannot establish a protected transition merely because a human clicked an interface element.

### Ordinary analytics / telemetry aggregation
Can inform cognition and diagnosis.

It cannot independently establish critical world truth unless its exact evidence role is explicitly admitted.

### Proof cache
Can accelerate verification.

It cannot be a writable source of truth for current proof status.

## 5. Borderline responsibilities

### Evidence validity

Partially core.

The core must enforce the rule that invalid/stale/unbound evidence cannot authorize a protected outcome.

The expensive evidence production, storage and analysis may live outside the smallest core.

Therefore:

EVIDENCE PRODUCTION ≠ EVIDENCE ADMISSION.

### External reconciliation

Partially core.

The core need not own every connector or external API.

It must own the semantics deciding:
- exact effect identity;
- acceptable observation;
- freshness;
- provenance;
- reconciliation authority;
- UNKNOWN handling;
- whether reconciliation permits the next protected transition.

Therefore:

RECONCILIATION DATA PLANE ≠ RECONCILIATION AUTHORITY.

### Coordination lease

Partially core.

The core needs fencing semantics and stale-owner rejection.

A coordination service may implement the lease, but lease ownership alone cannot grant authority.

Therefore:

COORDINATION MECHANISM ≠ AUTHORITY.

## 6. Candidate core boundary

The semantic minimum currently appears to be:

TRUST/IDENTITY
→ AUTHORITY
→ EFFECT IDENTITY
→ PROTECTED LINEARIZATION
→ STOP/SAFETY FENCE
→ RECOVERY FENCE
→ VERSION/POLICY/INVARIANT ADMISSION

with narrow interfaces to:

EVIDENCE
COORDINATION
RECONCILIATION
UPDATE
DECOMMISSION
PLANNER/MODEL
HUMAN INTERFACE
EXTERNAL WORLD.

This is a boundary hypothesis, not yet a final architecture.

## 7. Why the core cannot be reduced further

### Remove authority
Then no trustworthy mechanism determines whether an effect is authorized.

### Remove effect identity
Then retries, UNKNOWN and reconciliation can lose exact-effect correspondence.

### Remove protected linearization
Then concurrent revoke/authorize/execute/stop races can bypass otherwise correct policy.

### Remove STOP
Then emergency containment depends on ordinary execution semantics.

### Remove recovery fence
Then restart becomes a possible authority-resurrection path.

### Remove version/policy admission
Then a valid component can operate under an invalid or incompatible system context.

### Remove identity/trust
Then authority and provenance cannot be grounded.

## 8. Why the core should not grow unnecessarily

Every added trusted responsibility increases:
- trusted code;
- interfaces;
- state;
- failure modes;
- proof obligations;
- common-mode reach;
- update/recovery complexity.

This matches NIST's minimized-security-elements and least-privilege principles. citeturn0search22turn0search1

Therefore a function should enter the core only if at least one is true:

1. it directly gates a protected outcome;
2. its corruption can create authority;
3. its corruption can clear a safety fence;
4. its corruption can erase/resolve UNKNOWN;
5. its corruption can substitute effect identity;
6. its corruption can invalidate the active safety context;
7. its correctness is necessary for the protected transition's serialization.

## 9. Core boundary and common-mode

The core itself must not automatically be treated as one failure domain.

Candidate subdomains:
- trust/identity;
- authority;
- transition/linearization;
- safety stop;
- recovery;
- configuration/version.

For each, determine:
- physical separation;
- process separation;
- administrative separation;
- trust-root separation;
- storage separation;
- update-path separation;
- recovery-path separation.

Only explicit analysis establishes independence.

## 10. Core boundary and A/B/C

### A
Naturally supports a small semantic core because one authoritative machine can implement many protected transitions.

Risk:
the implementation can become a monolithic TCB.

### B
May place the core across multiple transactional participants.

Risk:
the transaction protocol itself becomes part of the core.

### C
Can keep semantic domains smaller.

Risk:
the cross-domain fencing/reconciliation protocol becomes part of the core.

Therefore the design objective is not “one process” or “many services.”

It is:

**minimum trusted semantics with minimum unnecessary trust relationships while preserving explicit failure semantics.**

## 11. New invariants

CORE-01: protected authority is established only through the authoritative core boundary.
CORE-02: no outside component can independently produce a protected outcome.
CORE-03: planner/model output is advisory until admitted by the protected core.
CORE-04: effect identity is immutable after admission.
CORE-05: protected transitions declare their safety-relevant read/write set.
CORE-06: stale coordination ownership cannot create authority.
CORE-07: STOP can constrain execution independently of the planner.
CORE-08: restart cannot restore authority without recovery admission.
CORE-09: VersionSet/policy/invariant changes can invalidate current authorization or evidence where applicable.
CORE-10: external reconciliation data cannot directly become verified-world truth without the core's admission rules.
CORE-11: adding a component to the trusted core is a safety-relevant architecture change.
CORE-12: core reduction is valid only if the removed responsibility cannot independently violate a protected guarantee.
CORE-13: core interfaces must be typed/bound to exact operation/effect context where safety-relevant.
CORE-14: no component may both define a safety claim and unilaterally supply all evidence required to validate that same claim when independence is required.
CORE-15: core recovery mechanisms cannot grant themselves release authority.

## 12. Research result

The minimum authoritative core is becoming identifiable as a **semantic kernel**, not a monolithic application:

IDENTITY/TRUST
AUTHORITY
EFFECT IDENTITY
PROTECTED TRANSITION
SAFETY/STOP
RECOVERY FENCE
SAFETY-CONTEXT ADMISSION

Everything else should be forced through explicit contracts into or out of this kernel.

The next question is now precise:

**What information and operations must cross each kernel boundary, and what must be impossible at each interface?**

That requires an interface capability/authority matrix before implementation.

Architecture remains blocked.