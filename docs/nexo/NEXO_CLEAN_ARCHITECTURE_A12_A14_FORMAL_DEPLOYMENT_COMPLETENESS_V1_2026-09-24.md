# NEXO CLEAN ARCHITECTURE — A12-A14 FORMAL BOUNDARY, DEPLOYMENT MAPPING, COMPLETENESS AUDIT V1 — 2026-09-24

Status: ARCHITECTURE DESIGN / PRE-IMPLEMENTATION GATE
Implementation: NOT STARTED
Formal verification: NOT STARTED

## Research basis

NIST defines architecture in terms of system elements, relationships and design/evolution principles, and treats architecture, implementation, verification, validation, operation and disposal as lifecycle activities. TLA+ models concurrent systems using an initial predicate and next-state relation; refinement mappings connect lower-level implementations to higher-level specifications, and auxiliary variables may support that mapping without changing actual behavior. These principles are used here to keep the formal model smaller than the implementation while preserving semantic correspondence. citeturn0search9turn0search24turn0search25

# A12 — Formal boundary and canonical model

## A12.1 What the abstract model represents

The canonical model represents only safety-relevant semantic state and transitions.

It MUST represent:
- identity validity;
- authority context;
- operation lifecycle;
- exact effect identity;
- coordination fence;
- STOP state;
- recovery fence;
- VersionSet/policy/invariant context;
- critical evidence validity;
- external-effect uncertainty;
- reconciliation state;
- decommission fencing.

It MUST NOT model:
- natural-language generation;
- embeddings;
- UI rendering;
- ordinary telemetry volume;
- database implementation details unless they affect semantic behavior;
- network packet structure;
- cache internals;
- model weights;
- application framework internals.

Those become implementation variables or external assumptions only when they affect a protected semantic transition.

## A12.2 Canonical variables

Primary abstract variables:

IdentityCtx
AuthorityCtx
PolicyCtx
InvariantCtx
VersionCtx
Operation
Effect
CoordinationFence
Stop
Recovery
ExternalEffect
EvidenceCtx
ClaimCtx
Decommission

Auxiliary variables may include:

LinearizationIndex
EventHistory
AttemptHistory
RetryCounter
CrashMarker
MessageQueue
StorageVersion
ImplementationTxnId
ObserverSequence
TraceIndex

Auxiliary variables cannot grant authority or change the abstract meaning of a protected state.

## A12.3 Canonical states

Operation:
REQUESTED → NORMALIZED → FINGERPRINTED → ADMITTED → AUTHORIZED → RESERVED → PREPARED → EXECUTING → {UNKNOWN | PARTIALLY_APPLIED | APPLIED} → OBSERVED → RECONCILED → VERIFIED → COMMITTED

STOP:
NORMAL → STOP_REQUESTED → STOP_ENFORCING → BLOCKED/INTERRUPTED → STOP_VERIFIED → RECONCILIATION_REQUIRED

Recovery:
RESTARTED → QUARANTINED → ATTESTED → CONFIG_VERIFIED → FENCE_VALIDATED → AUTHORITY_VALIDATED → RECOVERY_OWNER_ACQUIRED → RECONCILED → RELEASE_ELIGIBLE → EXPLICIT_RELEASE

Decommission:
ACTIVE → CLOSURE_REQUESTED → FENCED → EFFECTS_RECONCILED → DELEGATIONS_CLOSED → TERMINATED → VERIFIED_CLOSED

## A12.4 Core safety invariants

FORMAL-01: Unauthorized protected effects never occur.
FORMAL-02: Stale fences cannot pass protected admission.
FORMAL-03: STOP cannot be cleared by restart.
FORMAL-04: Recovery cannot self-authorize normal execution.
FORMAL-05: UNKNOWN cannot be erased by timeout/retry/restart/rollback/new operation ID.
FORMAL-06: Evidence invalidated by current context cannot authorize current release.
FORMAL-07: Exact EffectBinding cannot be silently substituted.
FORMAL-08: Decommissioned identity cannot regain protected authority from stale state.
FORMAL-09: Protected transitions cannot bypass required VersionSet/policy/invariant context.
FORMAL-10: Historical commitment does not imply current authority.
FORMAL-11: Local STOP does not imply external cancellation.
FORMAL-12: Observation does not imply verified external truth.
FORMAL-13: A failed protected transition cannot become successful solely from an ambiguous response.
FORMAL-14: Claim composition requires compatible context/dependencies/assumptions.
FORMAL-15: TCB compromise invalidates affected assurance claims until re-evaluated.

## A12.5 Action classes

AUTH_ADMIT
AUTH_REVOKE
RESERVE
EXECUTE_ADMIT
EFFECT_INTENT
EFFECT_OUTCOME
STOP_REQUEST
STOP_ENFORCE
RECOVERY_ADMIT
RECOVERY_RELEASE
VERSION_ACTIVATE
EVIDENCE_ACCEPT
EVIDENCE_INVALIDATE
RECONCILE
VERIFY
DECOMMISSION_CLOSE

Every action has:
precondition,
read set,
write set,
authority basis,
affected objects,
linearization semantics,
forbidden concurrency,
crash behavior.

## A12.6 External boundary

The formal model does not pretend to control the external world.

It models an abstract external boundary:

INTERNAL_INTENT
→ EXTERNAL_ATTEMPT
→ {APPLIED, NOT_APPLIED, UNKNOWN, PARTIALLY_APPLIED}
→ OBSERVATION
→ RECONCILIATION
→ CLAIM

The model must permit UNKNOWN indefinitely unless an explicit fairness/timeout assumption is intentionally introduced and documented.

## A12.7 Refinement obligation

The implementation must later supply a mapping:

Abstract variable
→ concrete state contributors
→ auxiliary variables
→ validity condition
→ context/version fingerprint.

And for every protected transition:

Abstract prestate
→ concrete guard
→ concrete linearization
→ concrete writes
→ abstract poststate.

A refinement result is not a runtime safety certificate by itself.

# A13 — Technology-independent deployment mapping

## A13.1 Logical deployment zones

D0 Trust/boot boundary
D1 Protected authoritative core
D2 Control/semantic services
D3 Execution/observation services
D4 External providers/world

A physical deployment may place several logical zones on one host only if their trust boundaries and enforcement semantics remain explicit.

Physical separation alone does not establish independence.

## A13.2 Core deployment rule

The protected core must expose only narrow interfaces:

AUTHORIZE
RESERVE
FENCE
EXECUTE_ADMIT
STOP
RECOVER
VERSION_ADMIT
EVIDENCE_VALIDATE
RECONCILE
DECOMMISSION

It must not expose a generic arbitrary-state mutation API.

## A13.3 Interface classes

INFORMATION:
read-only or advisory information.

CAPABILITY:
ability to request an operation.

AUTHORITY:
permission to perform a protected operation.

EFFECT:
request crossing the external boundary.

EVIDENCE:
observation/proof input.

A capability interface cannot be silently upgraded into an authority interface.

## A13.4 Deployment failure domains

The deployment description must explicitly map:
host,
process,
container/VM,
kernel,
storage,
network,
identity,
KMS/trust root,
clock,
control plane,
recovery plane,
provider,
operator,
build/update pipeline.

A separate process that shares the same failure domain is not independent for assurance purposes.

## A13.5 Technology selection contract

A future technology is admissible only if its behavior can be mapped to:
- protected linearization;
- fencing;
- durability;
- crash recovery;
- stale-reader/actor behavior;
- snapshot rollback behavior;
- version binding;
- observability;
- fault injection;
- refinement evidence.

Technology must adapt to the architecture, not redefine the architecture implicitly.

# A14 — Full architecture completeness and self-audit

## A14.1 Requirements traceability

Every canonical requirement must map:

Stakeholder need
→ Requirement
→ Invariant/constraint
→ Architectural boundary
→ Object
→ Protected transition
→ Implementation element
→ Verification method
→ Evidence
→ Claim
→ Change impact

Reverse tracing is also mandatory:

Observed failure
→ Evidence
→ Affected claim
→ Requirement/invariant
→ Boundary/object/transition
→ Corrective change
→ Reverification
→ Updated baseline

## A14.2 Completeness categories

Every requirement is exactly one of:
IMPLEMENTED BY ARCHITECTURE
EXTERNAL DEPENDENCY
DEFERRED WITH EXPLICIT ASSUMPTION
NOT APPLICABLE WITH RATIONALE
OPEN

No silent omission is permitted.

## A14.3 Residual gates

The architecture is conceptually complete enough to enter technology feasibility analysis, but these are still OPEN:

G-A01 exact authoritative storage protocol
G-A02 trusted time/failure detector model
G-A03 external reconciliation contracts
G-A04 migration/version coexistence
G-A05 resource exhaustion/degradation
G-A06 evidence invalidation propagation at scale
G-A07 common-mode measurement
G-A08 concrete STOP enforcement
G-A09 recovery-of-recovery implementation
G-A10 actual SANY/TLC execution
G-A11 concrete implementation refinement
G-A12 fault injection and long-run testing

## A14.4 Self-verification of the architecture

The architecture itself is subject to the same principles it imposes on Nexo.

A change to:
- authority semantics;
- protected transitions;
- STOP;
- recovery;
- EffectBinding;
- VersionSet;
- evidence acceptance;
- TCB;
- decommission;

must trigger:
impact analysis,
contradiction scan,
traceability update,
formal-model impact,
implementation impact,
test impact,
evidence invalidation,
common-mode review.

No architectural document may declare its own correctness without independent review/evaluation evidence.

## A14.5 Final pre-implementation gate

PASSED:
- requirements completeness at architecture level;
- system boundary;
- authority/ownership;
- canonical objects;
- protected transitions;
- authoritative topology;
- linearization semantics;
- STOP/recovery;
- evidence/claims;
- dependency/common-mode;
- TCB;
- adversarial interleaving audit;
- formal boundary;
- deployment abstraction;
- traceability contract.

NOT YET PASSED:
- technology feasibility;
- actual formal execution;
- implementation refinement;
- runtime enforcement;
- fault injection;
- migration;
- external provider contracts;
- resource exhaustion tests;
- long-run rollover;
- deployed common-mode validation.

Therefore:

ARCHITECTURE STATUS = PRE-IMPLEMENTATION BASELINE

IMPLEMENTATION STATUS = BLOCKED UNTIL TECHNOLOGY FEASIBILITY + FORMAL BASELINE GATES

NEXT PHASE:
B01 Technology-neutral feasibility matrix
B02 Exact storage/ordering candidates
B03 Trusted time and failure detector design
B04 External reconciliation contract
B05 Migration/version coexistence
B06 Resource/degradation architecture
B07 Formal TLA+ canonical model draft
B08 Toolchain/SANY/TLC execution plan

No V21 runtime implementation is authorized by this document.
