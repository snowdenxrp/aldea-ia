# NEXO CLEAN ARCHITECTURE — A12 FORMAL BOUNDARY AND CANONICAL MODEL V1 — 2026-09-24

Status: FORMALIZATION DESIGN / NOT MODEL-CHECKED
Implementation: NOT STARTED
SANY/TLC: NOT EXECUTED

## Purpose

A12 converts the clean architecture into a technology-independent formal boundary. It deliberately does not claim that the eventual implementation refines the model. The purpose is to define what the model must mean before any concrete TLA+ module is written.

NIST describes verification as producing objective evidence that an artifact fulfills specified requirements and characteristics, with traceability from verified system elements to that evidence. Therefore the formal model is treated as an artifact with its own verification scope and evidence, not as proof of the implementation merely because it exists. citeturn0search24turn0search0

Lamport's TLA+ material describes implementation as satisfying a higher-level state-machine specification under a refinement mapping; the lower-level specification may contain auxiliary variables while preserving the abstract behavior. citeturn0search3turn0search26

## A12.1 Formal boundary

The canonical model includes only semantics necessary to express:

1. identity and scoped authority;
2. exact effect identity;
3. protected transitions and ordering;
4. coordination fencing;
5. STOP;
6. recovery fencing/release;
7. VersionSet/policy/invariant context;
8. critical evidence validity;
9. external effect uncertainty;
10. decommission fencing;
11. safety invariants.

The model explicitly excludes implementation detail unless it affects one of these semantics.

Excluded from the abstract core:
- language/runtime internals;
- network libraries;
- database engine internals;
- UI;
- planner/model internals;
- embeddings;
- analytics;
- cache implementation;
- physical deployment details;
- cryptographic algorithm details unless represented as trust assumptions;
- telemetry formatting.

## A12.2 Canonical abstract state

The abstract state is the tuple:

S = (
  identities,
  authorityContexts,
  operations,
  effectBindings,
  coordination,
  stopState,
  recoveryState,
  versionSet,
  policyBaseline,
  invariantBaseline,
  effectStates,
  evidenceValidity,
  decommissionState,
  durableHistory
)

### Identity state

For each identity:
- identity_id
- identity_epoch
- status

Identity status includes ACTIVE, FENCED, REVOKED, DECOMMISSIONED.

### Authority state

For each authority context:
- authority_context_id
- subject
- scope
- issuer
- authority_epoch
- policy_version
- invariant_version
- version_set
- status

Authority status:
VALID, EXPIRED, REVOKED, SUPERSEDED.

### Operation state

For each operation:
- operation_id
- request_fingerprint
- lifecycle
- parent/delegation relation
- mission/goal relation

Lifecycle:
REQUESTED
NORMALIZED
FINGERPRINTED
ADMITTED
AUTHORIZED
RESERVED
PREPARED
EXECUTING
EXTERNAL_UNKNOWN
PARTIALLY_APPLIED
APPLIED
OBSERVED
RECONCILED
VERIFIED
COMMITTED
QUARANTINED
REJECTED
DECOMMISSIONED

The model must not allow a transition to skip required semantic boundaries.

### EffectBinding state

For each effect:
- effect_id
- operation_id
- target_fingerprint
- parameters_fingerprint
- preconditions
- expected_effect
- idempotency_key
- reversibility

EffectBinding is immutable after admission.

### Coordination state

For each protected scope:
- owner
- generation
- fence
- status

A stale owner must not satisfy a protected transition.

### STOP state

For each safety scope:
- stop_epoch
- requested
- enforcing
- verified
- release_authorized

The model explicitly prevents an executor from clearing STOP.

### Recovery state

For each recovery scope:
- recovery_epoch
- recovery_owner
- quarantine
- reconciled
- release_eligible
- explicitly_released

Release eligibility is derived; it is not an authority source.

### Version/policy state

The model carries a VersionSet fingerprint plus policy/invariant versions.

Any context change that affects a claim invalidates dependent evidence.

### External effect state

For each effect:

NOT_ATTEMPTED
EXECUTING
UNKNOWN
PARTIALLY_APPLIED
APPLIED
REVERSED
RECONCILED

The abstract model deliberately does not infer NOT_APPLIED from timeout.

### Evidence state

Evidence is represented by:
- evidence_id
- effect/claim scope
- context fingerprint
- provenance identity
- freshness state
- validity
- dependency closure
- assurance level

Evidence can transition to INVALIDATED or STALE.

### Decommission state

For each identity/system scope:
ACTIVE
QUIESCING
FENCED
RECONCILING
CLOSED

CLOSED is terminal for authority purposes.

## A12.3 Abstract actions

The canonical Next relation is composed from protected actions.

AUTHZ:
validates current authority, effect identity, VersionSet and safety state.

REVOKE:
revokes authority and advances the relevant context.

RESERVE:
acquires current coordination generation/fence.

EXECUTE_ADMIT:
performs final protected admission.

EFFECT_INTENT:
records exact external intent.

EFFECT_OUTCOME:
records APPLIED, PARTIALLY_APPLIED or UNKNOWN only according to permitted evidence/protocol semantics.

STOP_REQUEST:
creates a new STOP epoch.

STOP_ENFORCE:
blocks protected execution.

STOP_VERIFY:
records local STOP verification.

RECOVERY_QUARANTINE:
places scope into recovery quarantine.

RECOVERY_RECONCILE:
updates recovery state using valid reconciliation.

RECOVERY_RELEASE:
allows normal execution only after all release predicates hold.

EVIDENCE_ACCEPT:
accepts evidence at a defined assurance level.

EVIDENCE_INVALIDATE:
invalidates evidence after relevant context changes.

VERSION_ACTIVATE:
changes the admitted VersionSet under protected transition.

DECOMMISSION_FENCE:
fences the identity/scope.

DECOMMISSION_CLOSE:
closes lifecycle after required reconciliation.

## A12.4 Safety invariants

The canonical model must include at least:

INV-F01 No unauthorized protected effect.

INV-F02 No stale authority grants current protected execution.

INV-F03 No stale coordination owner passes the fence.

INV-F04 STOP cannot be cleared by executor or restart.

INV-F05 Recovery cannot self-authorize normal execution.

INV-F06 UNKNOWN cannot be resolved by timeout, retry, new operation identity, rollback or restart.

INV-F07 Invalidated evidence cannot satisfy a current protected claim.

INV-F08 Effect evidence cannot cross operation/effect identity boundaries.

INV-F09 Historical authorization does not become current authorization merely by restoring state.

INV-F10 Decommissioned identity cannot regain authority from stale state.

INV-F11 VersionSet mismatch blocks protected admission.

INV-F12 Recovery release requires explicit current-context conditions.

INV-F13 Local STOP does not imply external cancellation.

INV-F14 External observation does not automatically imply verified world truth.

INV-F15 Claim composition cannot combine incompatible context or contradictory evidence.

INV-F16 Protected transition failure cannot be interpreted as successful solely from missing response.

INV-F17 Trust/identity failure cannot silently elevate authority.

INV-F18 TCB-context changes invalidate affected assurance.

## A12.5 Liveness boundary

The initial model is primarily a SAFETY model.

It does not claim:
- every admitted action eventually completes;
- every UNKNOWN is eventually resolved;
- recovery always succeeds;
- external providers eventually respond;
- the network eventually heals.

Liveness may later be specified with explicit fairness and environment assumptions.

This separation is mandatory because safety and liveness require different assumptions and evidence.

## A12.6 Refinement boundary

The intended chain is:

R0 Safety/mission properties
→ R1 Canonical abstract state machine
→ R2 Protected protocol
→ R3 Concrete storage/fencing
→ R4 Runtime implementation
→ R5 Deployed system

Each refinement must define:
- abstract variables;
- implementation variables;
- auxiliary variables;
- state predicate;
- action correspondence;
- stuttering allowance;
- exceptional/crash states;
- environment assumptions;
- context fingerprint.

No refinement step may hide a safety-relevant state change as harmless stuttering.

## A12.7 Counterexample contract

Any model-checking counterexample must preserve:

- model version;
- model fingerprint;
- initial state;
- action trace;
- first violated invariant;
- first divergent state;
- refinement context if applicable;
- constants/configuration;
- fairness assumptions;
- symmetry/constraint settings;
- tool version;
- generated artifact identity.

A red result is evidence about a specific model/configuration, not a vague statement that “Nexo is broken.”

## A12.8 Model-checking gates

Before declaring formal evidence:

1. SANY parse/type checking must succeed.
2. TLC configuration must be explicit.
3. State-space bounds must be explicit.
4. Constants must be recorded.
5. Symmetry/constraints must be recorded and justified.
6. Invariants must be named and individually reported.
7. Deadlock handling must be explicit.
8. Liveness/fairness must be separated from safety.
9. Counterexamples must be preserved.
10. Re-run reproducibility must be demonstrated.

No TLC simulation run may be represented as exhaustive model checking.

## A12.9 Formal model ownership

The formal specification is itself versioned.

Any change to:
- state variable;
- action;
- invariant;
- assumption;
- context fingerprint;
- mapping;
- fairness condition;
- model constant;

creates a formal baseline change and requires impact analysis.

## A12.10 A12 result

FORMAL SEMANTIC BOUNDARY: DESIGNED
CANONICAL STATE VARIABLES: DESIGNED
SAFETY INVARIANTS: DESIGNED
LIVENESS BOUNDARY: DESIGNED
REFINEMENT CHAIN: DESIGNED
SANY/TLC EXECUTION: NOT DONE
CONCRETE TLA+ MODULE: NOT YET CREATED

Next:
A13 technology-independent deployment mapping
→ A14 complete architecture self-audit
→ then decide whether the architecture is complete enough to enter implementation preparation.
