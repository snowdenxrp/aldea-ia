# NEXO CLEAN ARCHITECTURE — SYSTEM BOUNDARY AND SEMANTIC TOPOLOGY V1 — 2026-09-24

Status: ARCHITECTURE DESIGN / NO IMPLEMENTATION
Source baseline: NEXO_CANONICAL_REQUIREMENTS_INVARIANT_BASELINE_V1
Completeness gate: PASSED AT REQUIREMENTS LEVEL
Architecture verification: NOT PERFORMED

## 1. Design principle

This is the first clean architecture artifact. It is derived from the canonical requirements rather than from V1–V20 code or models.

NIST's systems-security engineering guidance explicitly treats trustworthy architecture as a lifecycle engineering problem involving stakeholder needs, system elements, system-of-systems boundaries, verification, validation, and evolving architectural characteristics. citeturn0search0turn0search25

The architecture therefore begins with semantic boundaries and authority, not frameworks, databases or programming languages.

TLA+ remains the later formalization language; refinement will require explicit mappings and may use auxiliary/stuttering variables rather than equating implementation steps with abstract steps. citeturn0search24turn0search9

## 2. System boundary

Nexo is modeled as a system-of-systems boundary with five semantic zones:

Z0 TRUSTED FOUNDATION
- hardware/boot integrity assumptions;
- trust roots;
- identity primitives;
- cryptographic primitives;
- minimal secure runtime assumptions.

Z1 AUTHORITATIVE SAFETY CORE
- authority admission;
- protected transition semantics;
- exact effect identity;
- fencing;
- STOP enforcement;
- recovery release;
- safety-relevant VersionSet admission;
- critical evidence validity gate.

Z2 CONTROL / SEMANTIC PLANE
- mission/goal management;
- planner/model;
- policy interpretation;
- coordination services;
- memory/knowledge;
- ordinary orchestration;
- human interface;
- claim composition;
- analytics.

Z3 EFFECT / OBSERVATION PLANE
- executors;
- external providers;
- sensors/telemetry;
- reconciliation;
- evidence production;
- world observations.

Z4 EXTERNAL WORLD
- physical environment;
- remote systems;
- third-party services;
- humans;
- external state;
- effects not directly controlled by Nexo.

Core rule:
Z2 may propose and request.
Z1 decides protected authority.
Z3 may execute only admitted effects and produce observations.
Z4 is never assumed to be identical to internal state.

## 3. Trust boundaries

TB-0: Trust-root boundary
Controls identity/trust primitives.

TB-1: Authority boundary
Separates authority admission from planners, executors and ordinary services.

TB-2: Protected-transition boundary
Contains the serialization/linearization mechanism for safety-critical transitions.

TB-3: Safety boundary
Contains STOP enforcement and its independent control path.

TB-4: Recovery boundary
Contains recovery fencing and release authority.

TB-5: Evidence boundary
Separates evidence production from claim acceptance.

TB-6: External-effect boundary
Separates internal intent/outcome records from external-world effects.

TB-7: Change boundary
Separates update/configuration admission from the active safety baseline.

TB-8: Decommission boundary
Prevents lifecycle closure from being reversed by ordinary restart/recovery paths.

## 4. Authoritative semantic core

The minimum authoritative core is:

1. Identity/Trust interface
2. AuthorityContext
3. EffectBinding
4. ProtectedTransition/Linearization
5. SafetyGate/STOP Fence
6. RecoveryFence
7. VersionSet/Policy/Invariant admission
8. Critical evidence validity gate

The core does NOT own:
- general intelligence;
- planner/model;
- ordinary memory;
- optimization;
- UI;
- telemetry aggregation;
- convenience orchestration.

The core may consume outputs from those systems, but those outputs cannot directly mutate protected authority.

## 5. Canonical object ownership

### Trust / identity
IdentityContext → trust/identity authority.

### Authority
AuthorityContext → authority service/authority holder.

### Policy/invariant
PolicyBaseline / InvariantBaseline → safety/policy authority.

### Mission
Mission/Goal/Intent → mission/control plane.

### Operation
Operation lifecycle → mission/control plane under protected transitions.

### Effect
EffectBinding → admission boundary; immutable after binding.

### Coordination
ControlLease/Fence → coordination authority, with fencing semantics enforced by core.

### STOP
StopState → independent stop authority.

### Recovery
RecoveryFence → recovery authority.

### External world
ExternalEffectState → reconciliation authority.

### Evidence
EvidenceRecord → evidence subsystem; acceptance remains outside producer authority.

### Claims
VerificationClaim / ReleaseEligibility → derived by verification/admission logic.

### Configuration
VersionSet → configuration/change authority, admitted by safety core.

### Decommission
DecommissionState → decommission authority.

## 6. Authority topology

Authority is intentionally split:

A0 Trust Authority
→ establishes trusted identity roots.

A1 Safety/Policy Authority
→ establishes safety invariants and policy baselines.

A2 Operational Authority
→ grants scoped authority for specific effects.

A3 Coordination Authority
→ controls ownership/fencing of transitions.

A4 Emergency Stop Authority
→ constrains execution independently.

A5 Recovery Authority
→ controls release from recovery.

A6 Change Authority
→ governs safety-relevant updates.

A7 Decommission Authority
→ closes lifecycle and prevents resurrection.

No single ordinary runtime component should automatically hold A0–A7.

Ownership of state does not imply authority over all other state.

## 7. Capability topology

Capabilities are monotonic in restriction, not in privilege:

OBSERVE
→ PROPOSE
→ PREPARE
→ COORDINATE
→ AUTHORIZE
→ EXECUTE
→ RECONCILE
→ VERIFY
→ RECOVER
→ STOP
→ CHANGE
→ DECOMMISSION

These are capability classes, not an inheritance chain.

Examples:
- planner: OBSERVE + PROPOSE;
- executor: PREPARE + EXECUTE for already admitted effects;
- evidence producer: OBSERVE/PRODUCE;
- verifier: VERIFY;
- recovery service: RECOVER;
- stop service: STOP;
- update authority: CHANGE;
- decommission authority: DECOMMISSION.

A capability does not imply authority to obtain the next capability.

## 8. Protected transition domain

The architecture treats these as L3/L4 protected semantics:

P01 authorization admission
P02 authorization revocation
P03 reservation/fencing
P04 final execution admission
P05 STOP enforcement
P06 recovery release
P07 VersionSet activation
P08 decommission closure
P09 external effect intent
P10 external outcome/reconciliation
P11 evidence invalidation
P12 verification/release decision

Each transition must later receive:
- exact read set;
- exact write set;
- owner;
- authority basis;
- atomicity class;
- linearization point/protocol;
- crash semantics;
- partition semantics;
- timeout semantics;
- retry semantics;
- evidence requirements.

## 9. Data-flow topology

The architecture has five non-interchangeable flows:

INFORMATION FLOW:
data/state/observations.

CAPABILITY FLOW:
what a component is technically able to invoke.

AUTHORITY FLOW:
what protected action a principal is permitted to perform.

EFFECT FLOW:
attempts that may change the external world.

EVIDENCE FLOW:
observations/proofs used to support bounded claims.

No flow can silently substitute for another.

Critical promotion points:

Information
→ validated/context-bound evidence
→ verified claim
→ protected admission.

Never:

Information
→ authority.

Never:

Telemetry
→ truth.

Never:

Planner output
→ authorization.

## 10. Effect boundary

Every protected effect has:

operation_id
effect_id/effect_key
target_fingerprint
normalized_params_fingerprint
authority_context
policy_version
invariant_version
VersionSet
coordination fence where required
idempotency/replay policy
expected effect
reversibility/compensation semantics.

Internal lifecycle:

REQUESTED
→ NORMALIZED
→ FINGERPRINTED
→ ADMITTED
→ AUTHORIZED
→ RESERVED
→ PREPARED
→ EXECUTING
→ UNKNOWN / PARTIALLY_APPLIED / APPLIED
→ OBSERVED
→ RECONCILED
→ VERIFIED
→ COMMITTED.

No restart, timeout, lease expiry or new operation identity may bypass UNKNOWN.

## 11. STOP topology

STOP is not an executor flag.

Dedicated semantic path:

STOP AUTHORITY
→ STOP FENCE
→ EXECUTION GATE
→ EXECUTOR.

Executor feedback flows back as evidence; it does not control the stop decision.

Local stop and remote cancellation are separate:
LOCAL_FENCE
REMOTE_CANCEL_REQUEST
REMOTE_CANCEL_CONFIRMED
EFFECT_RECONCILIATION.

This prevents an executor's own ACK from becoming its own safety proof.

## 12. Recovery topology

Recovery is separated from normal execution:

DURABLE STATE
→ RECOVERY VERIFIER
→ RECOVERY FENCE
→ RECOVERY OWNER
→ RECONCILIATION
→ RELEASE ELIGIBILITY
→ EXPLICIT RELEASE
→ NORMAL CORE.

Checkpoint restoration never directly reaches AUTHORIZED or EXECUTING.

Recovery must re-establish:
identity;
artifact/configuration integrity;
current VersionSet;
current authority;
STOP state;
coordination fence;
external effect state;
required evidence.

## 13. Evidence topology

Evidence production and evidence acceptance are separate.

OBSERVERS / EXECUTORS / PROVIDERS
→ Evidence Intake
→ provenance/context validation
→ freshness validation
→ dependency/common-mode evaluation
→ evidence validity
→ claim evaluation
→ protected decision.

Evidence validity is claim-relative.

Context changes can invalidate evidence:
authority;
policy;
invariant;
VersionSet;
trust root;
dependency closure;
target/effect;
observer;
freshness;
reconciliation generation;
common-mode;
migration;
rollback;
recovery.

## 14. VersionSet topology

Safety-relevant activation is based on a complete compatible set:

runtime
safety gate
verifier
policy
invariants
configuration
schema
state-machine semantics
trust roots
dependency graph
recovery protocol
formal/evidence context where applicable.

A valid component does not imply a valid system combination.

Activation is itself a protected transition.

## 15. External-world boundary

Nexo internally represents intent and evidence.

It does not assume:
internal state = external state.

The boundary is:

INTERNAL INTENT
→ EXTERNAL ATTEMPT
→ EXTERNAL OUTCOME / UNKNOWN
→ OBSERVATION
→ RECONCILIATION
→ VERIFIED CLAIM.

The external world remains outside the internal atomicity domain.

## 16. TCB topology

Candidate claim-specific TCB domains:

T1 trust/identity
T2 authority admission
T3 protected transition/linearization
T4 STOP
T5 recovery fence
T6 effect identity
T7 evidence validity
T8 VersionSet admission.

TCB is evaluated per claim, not globally.

The architecture should minimize semantic authority in TCB rather than merely minimizing process count.

## 17. Failure-domain topology

Every critical boundary records dependencies across:

hardware
host/VM
kernel/runtime
container/orchestration
storage
network
DNS
clock
identity provider
credentials/KMS
trust root
policy/config source
artifact/update source
builder/CI
package dependencies
model/provider
data/source
operator
administration
observability
coordination store
recovery store
schema/semantic model.

Independence is claim-specific and must be evidenced.

## 18. Architecture invariants

ARCH-01:
Only the authoritative core can grant protected authority.

ARCH-02:
Planner/model cannot directly authorize or execute protected effects.

ARCH-03:
Executor cannot alter admission, STOP, recovery or safety policy.

ARCH-04:
Evidence producer cannot accept its own critical claim.

ARCH-05:
Lease/fence cannot create authority.

ARCH-06:
Restart/checkpoint cannot create authority.

ARCH-07:
UNKNOWN cannot be cleared without valid effect-specific evidence.

ARCH-08:
STOP cannot be cleared by the executor.

ARCH-09:
Recovery cannot resurrect stale/decommissioned authority.

ARCH-10:
Safety-relevant VersionSet activation is protected.

ARCH-11:
External-world truth is not inferred from internal transaction success.

ARCH-12:
Common-mode assumptions cannot be implicit in independence claims.

ARCH-13:
Claim composition cannot increase authority or truth scope.

ARCH-14:
A component cannot rewrite the criteria by which its own safety claim is accepted.

ARCH-15:
Every safety-critical state variable has one authoritative owner or explicit serialization protocol.

ARCH-16:
Every protected transition declares its read/write set and failure semantics.

## 19. Architecture views to produce next

The clean architecture is now defined at semantic-topology level but not yet at deployable component level.

Next design artifacts, in order:

A01 System context and boundary view
A02 Authority/ownership matrix
A03 Canonical object model
A04 Protected-transition contracts
A05 Authoritative-state topology
A06 Linearization protocol selection
A07 STOP/recovery topology
A08 Evidence/claim topology
A09 Dependency/common-mode topology
A10 TCB minimization
A11 Failure/interleaving model
A12 Formal abstraction/refinement boundary
A13 Technology-independent deployment model
A14 Architecture completeness review

Only after A14 may technology-specific implementation begin.

## 20. Architecture status

SEMANTIC ARCHITECTURE: DEFINED
SYSTEM BOUNDARY: DEFINED
TRUST BOUNDARIES: DEFINED
AUTHORITATIVE CORE: DEFINED AS CANDIDATE
OBJECT OWNERSHIP: DEFINED
AUTHORITY TOPOLOGY: DEFINED
CAPABILITY TOPOLOGY: DEFINED
EFFECT BOUNDARY: DEFINED
STOP/RECOVERY: DEFINED
EVIDENCE: DEFINED
TCB: DEFINED
COMMON-MODE: DEFINED

AUTHORITATIVE STORE: OPEN
LINEARIZATION PROTOCOL: OPEN
EXTERNAL RECONCILIATION: OPEN
TECHNOLOGY CHOICES: NOT STARTED
IMPLEMENTATION: NOT STARTED
FORMAL MODEL: NOT STARTED
VERIFICATION: NOT STARTED

Architecture implementation remains blocked.
