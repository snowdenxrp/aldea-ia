# NEXO CLEAN ARCHITECTURE — A07-A10 STOP, RECOVERY, EVIDENCE, DEPENDENCIES AND TCB V1 — 2026-09-24

Status: ARCHITECTURE DESIGN / TECHNOLOGY-INDEPENDENT
Implementation: NOT STARTED
Formal verification: NOT STARTED

## Research basis

NIST SP 800-160 treats trustworthy-system engineering as a lifecycle activity involving architecture, requirements, implementation and evidence, and states that assurance evidence is obtained through analysis, demonstration, inspection, testing and evaluation. NIST also describes cyber-resilient systems as needing to anticipate, withstand, recover from and adapt to adverse conditions. NIST SP 800-53 explicitly uses separation of duties and least privilege to limit abuse of authorized privileges. These principles reinforce the architecture's separation of STOP, recovery, evidence acceptance and authority. citeturn0search24turn0search6turn0search26

## A07 — STOP and recovery architecture

### A07.1 Independent STOP plane

STOP is an independent safety plane, not an executor command.

Canonical lifecycle:

STOP_REQUESTED
→ STOP_ENFORCING
→ EXECUTION_BLOCKED / ACTUATION_INTERRUPTED
→ STOP_VERIFIED
→ RECONCILIATION_REQUIRED
→ RECOVERABLE or QUARANTINED

The executor cannot:
- clear STOP;
- redefine STOP severity;
- replace the STOP gate;
- authorize its own restart;
- delete STOP evidence;
- convert STOP into an advisory event.

### A07.2 STOP semantics

These are distinct:

STOP_REQUESTED
LOCAL_STOPPED
REMOTE_CANCEL_REQUESTED
REMOTE_CANCEL_CONFIRMED
NO_EFFECT
EFFECT_REVERSED
VERIFIED_TERMINATED

A local STOP acknowledgement does not prove remote cancellation or reversal.

If STOP state cannot be established safely, execution remains blocked.

### A07.3 Recovery fence

Recovery begins in quarantine.

RESTARTED
→ QUARANTINED
→ IDENTITY_ATTESTED
→ ARTIFACT_CONFIG_VERIFIED
→ CURRENT_FENCE_OBSERVED
→ CURRENT_AUTHORITY_VALIDATED
→ RECOVERY_OWNER_ACQUIRED
→ RECOVERY_STATE_RECONCILED
→ RELEASE_ELIGIBLE
→ EXPLICIT_RELEASE
→ EXECUTION_ENABLED

Restart does not grant authority.
Checkpoint restoration does not grant authority.
Lease expiry does not grant recovery authority.
A new operation ID does not resolve an old UNKNOWN.

### A07.4 Recovery owner

Recovery ownership is separate from normal execution ownership.

The recovery owner cannot use recovery authority to:
- modify trust roots without change authority;
- erase UNKNOWN;
- bypass STOP;
- self-authorize normal execution;
- rewrite historical evidence;
- silently alter safety policy.

### A07.5 Recovery-of-recovery

Recovery itself can fail.

Therefore recovery has its own protected state:
- recovery epoch;
- recovery fence;
- recovery owner;
- recovery action identity;
- recovery evidence;
- unresolved effects;
- release state.

A failed recovery attempt cannot silently become a successful recovery merely because the process restarts.

## A08 — Evidence and claim architecture

### A08.1 Evidence is not truth

EvidenceRecord is a context-bound input to a claim.

Evidence must bind:
- exact claim/effect/target;
- observer;
- observation time;
- freshness;
- provenance;
- transformation history;
- dependency closure;
- trust-root context;
- policy/invariant context;
- VersionSet;
- integrity;
- authority to produce the evidence;
- invalidation state.

### A08.2 Trust promotion

Information flows through explicit promotion stages:

T0 UNKNOWN
→ T1 OBSERVED
→ T2 AUTHENTICATED
→ T3 CONTEXT_BOUND
→ T4 VALIDATED_FOR_PROPERTY
→ T5 VERIFIED_FOR_CLAIM

T5 is claim-specific. It is not a universal truth label.

### A08.3 Producer/verifier separation

The component producing evidence cannot unilaterally declare the evidence sufficient for a safety claim.

Conceptually:

EVIDENCE PRODUCER
→ EvidenceRecord
→ INDEPENDENT/APPROPRIATE VERIFIER
→ VerificationClaim
→ protected decision

Where independence is not technically possible, the architecture must explicitly record the common-mode limitation rather than calling the evidence independent.

### A08.4 Invalidation

Context changes can invalidate previously accepted evidence.

Invalidation triggers include:
- policy change;
- invariant change;
- VersionSet change;
- trust-root change;
- dependency change;
- observer compromise;
- target/effect identity change;
- freshness expiry;
- schema/semantic change;
- relevant STOP/recovery state change;
- migration that changes interpretation.

Required flow:

CONTEXT_CHANGE
→ IMPACT_ANALYSIS
→ EVIDENCE_INVALIDATION/STALE
→ CLAIM_REEVALUATION
→ RELEASE_RECOMPUTATION
→ HOLD / RESTRICT / REVALIDATE

### A08.5 Negative evidence

The architecture explicitly distinguishes:
- evidence that an effect occurred;
- evidence that an effect did not occur;
- absence of evidence;
- evidence that an effect remains UNKNOWN.

Absence of telemetry is not automatically evidence of absence.

### A08.6 Claim contract

A VerificationClaim contains:
claim_id
property_kind
exact_scope
required evidence
assumptions
context fingerprint
dependency closure
assurance state
validity
expiry/review
contradictions
verification method.

Claims cannot be composed merely because their text appears compatible.

Composition requires compatible scope, context, dependencies, assumptions and no contradiction.

## A09 — Dependency and common-mode architecture

### A09.1 Dependency closure

Every safety-relevant claim carries a dependency closure.

Dependencies include:
- code/artifact;
- runtime;
- configuration;
- policy;
- invariant;
- trust roots;
- identity;
- storage;
- clock/time source;
- network;
- external provider;
- model/provider;
- data source;
- verifier;
- recovery mechanism.

A dependency change triggers impact analysis.

### A09.2 Common-mode failure

The architecture does not treat these as independent merely because they are different processes:

different process != independent failure domain
different model != independent evidence
different service != independent authority
replicated state != independent state
second verifier != independent verifier

Failure-domain dimensions include:
hardware, host, kernel, storage, network, DNS, clock, identity/KMS, trust root, policy/configuration, artifact/update, builder/CI, package supply chain, model/provider, data source, operator/admin, control plane, observability, coordination store, recovery store, schema/state-machine semantics.

### A09.3 Independence descriptors

I0–I5 remain descriptive independence levels, not safety scores.

The architecture records which failure domains are shared.

If a claim's supposed independent evidence shares a decisive failure domain with the primary evidence, the claim's assurance must be reduced or the claim held for revalidation.

### A09.4 Failure composition

Failure combinations are analyzed explicitly.

At minimum:
F0 independent failure
F1 correlated infrastructure failure
F2 trust-root failure
F3 policy/configuration common-mode
F4 evidence/verifier common-mode
F5 recovery/update common-mode
F6 human/privileged common-mode
F7 unknown/unmodeled common-mode

The system must not infer safety merely because individual components appear healthy.

## A10 — TCB minimization

### A10.1 TCB is claim-specific

There is no universal TCB for every claim.

Candidate TCB domains:

T1 Trust/identity
T2 Authority validation
T3 Protected transition/linearization
T4 STOP enforcement
T5 Effect identity
T6 Evidence validity
T7 Version/configuration integrity
T8 Recovery release

A claim includes only the TCB domains required to support that claim.

### A10.2 Minimum TCB principle

Move all functionality that does not need authority out of the protected core.

Planner, model, memory, UI, analytics and optimization must not become TCB merely because they influence proposals.

### A10.3 TCB concentration risks

If one component simultaneously controls:
- authority;
- STOP;
- recovery;
- evidence acceptance;
- trust roots;
- update activation;

then compromise of that component becomes a multi-claim common-mode failure.

Therefore separation of duties is architectural where practical, consistent with least privilege. citeturn0search26

### A10.4 TCB change contract

Any change to a TCB element requires:
- affected claims;
- dependency impact;
- VersionSet change;
- formal correspondence impact;
- implementation test impact;
- evidence invalidation;
- rollback/recovery analysis;
- common-mode reassessment.

A TCB change is never treated as an ordinary cosmetic update.

## A10.5 Claim-specific release predicate

For operation o and context t:

ReleaseEligible(o,t) is true only when all required conditions hold:

LifecycleReady
AND ExactEffectBinding
AND CurrentAuthority
AND CurrentSafetyContext
AND FreshValidEvidence
AND NoBlockingDependency
AND NoSTOPFence
AND CurrentCoordinationFence
AND RequiredReconciliation
AND CompatibleVersionSet
AND NoUnresolvedCriticalUNKNOWN
AND RequiredTCBIntegrity.

This is a derived decision, not writable state.

## A10.6 Architecture consequence

The protected core now has four distinct responsibilities:

1. authority;
2. protected transition/linearization;
3. safety/recovery fencing;
4. acceptance of only context-valid critical evidence.

It does not become:
- planner;
- general-purpose database;
- model;
- telemetry warehouse;
- world simulator;
- universal verifier.

## A07-A10 gate

A07 STOP/recovery: DESIGNED
A08 evidence/claims: DESIGNED
A09 dependency/common-mode: DESIGNED
A10 TCB minimization: DESIGNED

Still open:
- exact implementation of STOP enforcement;
- external cancellation/reversal semantics;
- evidence invalidation propagation at scale;
- negative-evidence providers;
- exact independence/failure-domain measurements;
- recovery-of-recovery implementation;
- concrete TCB boundary;
- runtime/fault-injection verification.

Next:
A11 failure/interleaving matrix
→ A12 formal boundary and model variables
→ A13 technology-independent deployment mapping
→ A14 architecture completeness/self-audit.

Implementation remains blocked.
