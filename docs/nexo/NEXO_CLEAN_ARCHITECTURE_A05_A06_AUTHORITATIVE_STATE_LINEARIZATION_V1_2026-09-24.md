# NEXO CLEAN ARCHITECTURE — A05-A06 AUTHORITATIVE STATE TOPOLOGY AND LINEARIZATION V1 — 2026-09-24

Status: ARCHITECTURE DESIGN / TECHNOLOGY-INDEPENDENT
Implementation: NOT STARTED
Formal verification: NOT STARTED

## Research basis

NIST describes state-machine replication and consensus as mechanisms for making distributed components emulate a centralized service despite faults. NIST SP 800-160 also treats distributed privilege as coordinated authorization rather than merely duplicated components. Lamport's TLA+ material models concurrent and distributed systems with state and next-state relations and distinguishes implementation from the higher-level specification it implements. Refinement mappings are therefore part of the architecture contract, not a later documentation exercise.

## A05 — Authoritative state topology

### Decision

The clean architecture adopts a HYBRID PROTECTED AUTHORITATIVE CORE:

1. A small protected semantic core owns state that can grant, revoke, fence, stop, release, activate, or close safety-relevant authority.
2. Semantic/control data may remain outside that core.
3. Partitioned stores are permitted outside the core only when stale, missing, duplicated, or reordered data cannot grant authority, erase UNKNOWN, clear a fence, or create a verified-world claim.
4. Cross-domain protected transitions use an explicit transaction/protocol contract rather than assuming a database transaction makes the whole system atomic.
5. External effects are never made authoritative by the internal store. Their outcome remains UNKNOWN until externally reconciled and verified.

This is a semantic architecture decision, not yet a choice of database, consensus implementation, cloud platform, or programming language.

### A05.1 Protected authoritative domain

The protected domain contains the minimum state necessary to answer:

- Who is acting?
- What exact effect is being requested?
- Is that actor authorized for that effect now?
- Which policy/invariant/version context applies?
- Which coordination fence is current?
- Is STOP blocking execution?
- Is recovery fencing execution?
- Which protected transition is being linearized?
- Has the system crossed the external-effect boundary?
- Is an unresolved UNKNOWN preventing release?
- Is a safety-relevant version/configuration admissible?
- Is decommissioning still fencing the identity?

Candidate protected state:

IdentityContext
AuthorityContext
EffectBinding
ProtectedOperationLifecycle
ControlFence
StopState
RecoveryFence
VersionSet
PolicyBaseline
InvariantBaseline
ExternalEffectIdentity
ExternalEffectState
CriticalEvidenceValidity
DecommissionState

### A05.2 Outside the protected core

The following remain outside unless a later audit proves that a specific field is authority-critical:

- natural-language planning;
- model inference;
- mission decomposition;
- ordinary memory;
- embeddings/indexes;
- analytics;
- UI state;
- telemetry aggregation;
- convenience caches;
- non-authoritative replicas;
- optimization metrics;
- ordinary scheduling;
- simulation;
- speculative plans.

These components can propose or inform. They cannot silently become an authority source by being colocated with the core.

### A05.3 Three consistency domains

C1 Authority consistency:
May this actor perform this exact protected effect now?

C2 Coordination consistency:
Which actor/process owns the current protected transition?

C3 World-truth consistency:
What actually happened outside Nexo?

No store is allowed to answer C3 merely because it answered C1 or C2.

### A05.4 State classification

Every state variable is classified as one of:

AUTHORITATIVE
PROTECTED_DERIVED
NON_AUTHORITATIVE
EXTERNAL_OBSERVATION
EVIDENCE
CACHE
HISTORY

Only AUTHORITATIVE and explicitly protected derived state may participate in authority decisions.

A CACHE can be stale.
An OBSERVATION can be wrong or outdated.
EVIDENCE can become invalid.
HISTORY can prove that something was recorded, but recording does not make the underlying proposition true.

### A05.5 Persistence tiers

P0 — safety-critical durable:
State whose loss, rollback or corruption could grant unauthorized authority, erase UNKNOWN, clear STOP/recovery fencing, or resurrect a decommissioned identity.

P0 requires protected durability and explicit rollback/recovery semantics.

P1 — operationally durable:
State needed for reconciliation, diagnostics, audit and recovery but which cannot itself grant authority.

P1 loss may cause HOLD/RESTRICT/REVALIDATE.

P2 — reconstructable:
Caches, indexes, derived analytics and convenience state.

P2 loss must not alter protected semantics.

### A05.6 Failure semantics

The core uses fail-closed semantics for authority-relevant uncertainty:

- missing protected state → HOLD/RESTRICT;
- stale protected state → HOLD/REVALIDATE;
- conflicting protected state → QUARANTINE;
- storage rollback detected → FENCE/REVALIDATE;
- lost linearization response → outcome determined by protocol, never guessed;
- unresolved external outcome → UNKNOWN;
- missing critical evidence → no safety-critical release;
- VersionSet mismatch → reject/revalidate;
- STOP state unavailable → assume blocking, not clear.

### A05.7 Why not a single global store?

A single store would simplify serialization but would concentrate nearly every trust dependency into one mechanism. It also would not solve external-world uncertainty.

The architecture therefore minimizes the authoritative domain rather than maximizing centralization.

### A05.8 Why not unrestricted partitioning?

Unrestricted partitioning creates dangerous cross-store questions:

- authority committed but fence not committed;
- STOP committed but executor sees stale state;
- revocation committed after execution admission;
- evidence invalidated in one store but still accepted in another;
- decommissioned identity restored from an older snapshot;
- UNKNOWN omitted from a reconstructed state.

Therefore partitioning is allowed only behind explicit protected-transition protocols.

## A06 — Linearization protocol selection

### Decision

The architecture adopts a COMPOSED LINEARIZATION PROTOCOL, not one universal mechanism.

The protocol stack is:

Protected authoritative ordering
→ conditional state guards
→ fencing/epochs
→ durable intent
→ idempotent exact effect identity
→ reconciliation

The implementation mechanism for each layer remains technology-independent.

### A06.1 Ordering authority

Every L3 protected transition has one authoritative ordering point or an equivalent protocol whose semantics are demonstrably equivalent.

Candidate mechanisms include:
- serialized state-machine command;
- serializable transaction;
- consensus-backed ordering;
- atomic conditional write for a genuinely local transition.

The architecture does not assume these are interchangeable.

### A06.2 CAS / conditional guard

CAS-style guards are permitted for transitions whose correctness depends on a bounded set of authoritative variables.

Example:
expected_epoch = E
expected_state = S
expected_fence = F

The transition succeeds only if all protected preconditions still hold at the atomic guard.

CAS does not by itself provide distributed consensus or external-world truth.

### A06.3 Serialized protected command

For transitions spanning multiple protected variables, the preferred abstract mechanism is a serialized protected command:

READ CURRENT PROTECTED STATE
→ VALIDATE
→ APPLY ONE PROTECTED TRANSITION
→ DURABLY RECORD RESULT
→ EMIT CONTEXT-BOUND TRACE

The command is rejected if any required context has changed before its linearization point.

### A06.4 Fencing

Every coordination owner receives a fence/generation that the protected boundary can enforce.

A stale owner may still exist physically, but its protected action must be rejected.

LEASE = coordination
FENCE = enforcement

### A06.5 Durable intent

For an external effect, Nexo first records the exact intent:

operation_id
effect_id
target_fingerprint
parameters_fingerprint
authority_context
VersionSet
fence
idempotency_key
expected_effect
retry_policy

After durable intent, a crash before external response leaves the effect potentially UNKNOWN.

### A06.6 Exact effect identity

Retries reuse the same effect identity when they represent the same intended external effect.

A retry must not create a new semantic effect merely because a process restarted.

NEW ATTEMPT != NEW EFFECT

A genuinely new effect requires a new EffectBinding and independent admission.

### A06.7 External reconciliation

The internal linearization point ends at the boundary of Nexo's protected state.

After that:

EXTERNAL ATTEMPT
→ OUTCOME
→ OBSERVATION
→ RECONCILIATION
→ VERIFIED CLAIM

The architecture never collapses these steps into a single transaction.

## A06.8 Linearization obligations

For each protected transition the implementation must later provide:

1. abstract pre-state;
2. implementation read set;
3. guard/precondition;
4. exact linearization event;
5. implementation write set;
6. abstract post-state;
7. crash behavior;
8. retry behavior;
9. concurrent-transition exclusions;
10. refinement mapping;
11. trace evidence.

A database commit timestamp, request ID, sequence counter or process completion event cannot be substituted for this contract without proof.

## A06.9 Critical linearization points

LP-01 Authorization admission
LP-02 Revocation
LP-03 Reservation/fence acquisition
LP-04 Final execution admission
LP-05 STOP enforcement
LP-06 Recovery release
LP-07 VersionSet activation
LP-08 Decommission closure
LP-09 Critical evidence invalidation
LP-10 Verified release/commit

Each LP receives a unique semantic definition.

## A06.10 Concurrency rule

The following pairs require an explicit order:

Authorization ↔ Revocation
Authorization ↔ Policy change
Reservation ↔ Reservation
Execution ↔ STOP
Execution ↔ Recovery
Execution ↔ Decommission
Evidence ↔ Invalidation
Verification ↔ VersionSet change
Recovery ↔ UNKNOWN
Update ↔ Execution
Decommission ↔ Restart
Delegation ↔ Revocation
Migration ↔ Concurrent write

The architecture must later enumerate both A→B and B→A interleavings plus crash points.

## A06.11 Formal correspondence boundary

The future formal model must represent the same protected semantic transitions.

Required refinement chain:

R0 mission/safety
→ R1 canonical abstract state machine
→ R2 protected transition protocol
→ R3 concrete storage/fencing
→ R4 runtime implementation
→ R5 deployed environment

A refinement mapping must identify implementation variables that realize each abstract variable. Auxiliary variables may record history, ordering or implementation detail without changing the abstract semantics.

Formal agreement with the abstract model is not runtime verification.

## A06.12 Technology selection gate

No database, consensus engine, queue, cache, language, cloud service or framework is selected as an architectural authority mechanism until it is mapped against:

- LP-01..LP-10;
- P0/P1 durability;
- stale actor fencing;
- crash/retry semantics;
- partition behavior;
- snapshot/rollback behavior;
- VersionSet integrity;
- STOP;
- recovery;
- decommission;
- external UNKNOWN;
- refinement mapping;
- common-mode failure domains.

## A06.13 A05-A06 result

Architecture-level decision:

SMALL PROTECTED AUTHORITATIVE CORE
+
PARTITIONED NON-AUTHORITATIVE SEMANTIC/OPERATIONAL STORES
+
EXPLICIT SERIALIZATION/CONDITIONAL GUARDS
+
ENFORCED FENCING
+
DURABLE EXACT EFFECT INTENT
+
EXTERNAL RECONCILIATION

This is now the baseline topology.

Still OPEN:
- exact storage technology;
- exact consensus/transaction mechanism;
- trusted time source and time semantics;
- provider-specific reconciliation;
- concrete failure detectors;
- implementation refinement;
- actual SANY/TLC execution;
- runtime fault injection.

## Gate

A05: DESIGNED
A06: DESIGNED
Implementation: BLOCKED
Technology selection: BLOCKED pending protocol-level feasibility audit
Formal verification: BLOCKED pending concrete model
