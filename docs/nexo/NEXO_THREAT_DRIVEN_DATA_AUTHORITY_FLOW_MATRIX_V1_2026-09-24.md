# NEXO THREAT-DRIVEN DATA / AUTHORITY FLOW MATRIX V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation.

## 1. Research basis

NIST SP 800-160 Rev. 1 treats trustworthiness as a system property and emphasizes security requirements, architecture, verification and validation across the lifecycle. NIST SP 800-53 includes separation of duties, least privilege and controls for information-flow enforcement. These principles support evaluating each protected transition by both its authority path and its information/evidence path. citeturn0search0turn0search24

## 2. Canonical threat-flow tuple

For every protected transition:

THREAT
→ INPUT
→ TRUST STATE
→ TRANSFORMATION
→ AUTHORITY DEPENDENCY
→ PROTECTED STATE
→ EFFECT
→ EVIDENCE
→ CLAIM
→ INVALIDATION.

A transition is incomplete until both sides are mapped:

AUTHORITY PATH:
WHO MAY CAUSE IT?

INFORMATION PATH:
WHAT INFORMATION MAY JUSTIFY IT?

## 3. Threat classes

TF-01 forged identity
TF-02 stale authority
TF-03 replayed request
TF-04 wrong-target substitution
TF-05 parameter substitution
TF-06 planner/model injection
TF-07 poisoned observation
TF-08 compromised observer
TF-09 stale evidence
TF-10 provenance substitution
TF-11 common-mode corroboration
TF-12 compromised coordination owner
TF-13 stale lease/fence
TF-14 recovery authority escalation
TF-15 update/configuration substitution
TF-16 policy/invariant downgrade
TF-17 clock/time manipulation
TF-18 storage rollback
TF-19 external-effect ambiguity
TF-20 audit/evidence deletion
TF-21 telemetry corruption
TF-22 dependency compromise
TF-23 human instruction ambiguity
TF-24 decommission resurrection
TF-25 cross-operation evidence substitution
TF-26 proof-context mismatch
TF-27 migration semantic corruption
TF-28 partitioned stale state
TF-29 observer/verifier common-mode compromise
TF-30 malicious or accidental administrator.

## 4. Transition T-AUTH — Authorization admission

### Inputs
- normalized request;
- EffectBinding;
- Identity;
- AuthorityContext;
- PolicyBaseline;
- InvariantBaseline;
- StopState;
- RecoveryFence;
- VersionSet;
- current dependency/assurance state.

### Threats
TF-01, TF-02, TF-04, TF-05, TF-06, TF-13, TF-16, TF-22, TF-28, TF-30.

### Required controls
- exact effect binding;
- current authority epoch;
- scope check;
- policy/invariant compatibility;
- current safety fences;
- dependency closure;
- protected linearization.

### Forbidden flow
planner/model → direct authorization.

### Claim
AUTHORIZATION_ACCEPTED.

### Evidence
current authority context + exact EffectBinding + admission transition record.

### Invalidation
authority revoke, policy/invariant change, relevant VersionSet change, stop/recovery fence, identity invalidation, dependency assurance loss.

## 5. Transition T-RES — Reservation/fencing

### Inputs
- authorized EffectBinding;
- coordination state;
- lease/fence generation;
- current authority.

### Threats
TF-03, TF-12, TF-13, TF-28.

### Required controls
- generation/fence;
- atomic/equivalent reservation;
- stale-owner rejection;
- idempotency.

### Forbidden flow
lease ownership → authority escalation.

### Claim
RESERVATION_VALID.

### Invalidation
lease expiry, revocation, stop, generation change, authority epoch change.

## 6. Transition T-EXEC — Final execution gate

### Inputs
- authorized exact effect;
- reservation/fence;
- current authority;
- current StopState;
- RecoveryFence;
- active VersionSet.

### Threats
TF-02, TF-06, TF-12, TF-13, TF-14, TF-15, TF-16, TF-28.

### Required controls
- final current-context check;
- protected linearization;
- stop enforcement;
- recovery fence;
- stale actor rejection.

### Forbidden flows
executor → authority mutation;
executor → STOP clear;
executor → recovery release.

### Claim
EXECUTION_ADMITTED.

## 7. Transition T-EFFECT — External attempt

### Inputs
- immutable EffectBinding;
- durable intent;
- idempotency/replay policy;
- execution authorization.

### Threats
TF-03, TF-04, TF-05, TF-19, TF-22, TF-28.

### Required controls
- exact target;
- exact parameters;
- durable intent;
- external effect identity;
- timeout/crash semantics.

### Critical rule

Response absence does not imply NOT_APPLIED.

Possible result:
APPLIED | NOT_APPLIED | UNKNOWN | PARTIALLY_APPLIED.

## 8. Transition T-OBS — Observation

### Inputs
- external observation;
- observer identity;
- operation/effect binding;
- timestamp;
- provenance;
- dependency closure.

### Threats
TF-07, TF-08, TF-09, TF-10, TF-11, TF-17, TF-21, TF-22, TF-29.

### Required controls
- exact effect/target binding;
- freshness;
- provenance;
- dependency closure;
- observer trust;
- common-mode analysis.

### Forbidden flow

observer → automatic verified truth.

### Claim

OBSERVATION_ACCEPTED.

This is not yet VERIFIED.

## 9. Transition T-RECON — Reconciliation

### Inputs
- exact EffectBinding;
- accepted observation(s);
- reconciliation authority;
- current reconciliation generation;
- current safety context.

### Threats
TF-08, TF-09, TF-10, TF-11, TF-19, TF-21, TF-22, TF-25, TF-29.

### Required controls
- exact identity;
- provenance/freshness;
- authority separation;
- conflicting-observation handling;
- common-mode assessment.

### Outputs

RECONCILED
or
UNKNOWN / CONFLICTED / REVALIDATION_REQUIRED.

### Forbidden flow

new operation_id → resolve old UNKNOWN.

## 10. Transition T-VERIFY — Claim verification

### Inputs
- reconciled effect;
- required evidence set;
- evidence validity;
- dependency closure;
- VersionSet;
- Policy/Invariant baseline;
- verification context.

### Threats
TF-09, TF-10, TF-11, TF-15, TF-16, TF-20, TF-22, TF-26, TF-29.

### Required controls
- claim-specific verification;
- proof/evidence context fingerprint;
- invalidation propagation;
- independence requirements;
- current safety context.

### Output

VERIFIED_FOR_CLAIM

not universal truth.

## 11. Transition T-RECOVER — Recovery release

### Inputs
- RecoveryFence;
- current authority;
- StopState;
- reconciliation state;
- VersionSet;
- dependency assurance;
- recovery owner.

### Threats
TF-02, TF-14, TF-15, TF-16, TF-18, TF-24, TF-28.

### Required controls
- quarantine;
- identity/artifact/config verification;
- current fence;
- recovery owner separation;
- reconciliation;
- explicit release.

### Forbidden flows

checkpoint → authority
restart → authorization
recovery owner → self-release.

## 12. Transition T-UPDATE — Safety-context activation

### Inputs
- candidate artifacts;
- provenance;
- signatures/attestation;
- builder/source policy;
- dependency closure;
- semantic compatibility;
- safety-property delta;
- VersionSet.

### Threats
TF-15, TF-16, TF-22, TF-26, TF-27.

### Required controls
- independent admission;
- complete VersionSet;
- staging;
- old-version fencing;
- control-plane verification;
- world/safety reconciliation.

### Forbidden flow

valid signature → automatic safety admission.

## 13. Transition T-DECOM — Decommission closure

### Inputs
- lifecycle authority;
- identity;
- active worker/lease/delegation state;
- pending effects;
- recovery/update state;
- secrets/data closure state.

### Threats
TF-18, TF-24, TF-28, TF-30.

### Required controls
- authority revocation;
- delegation revocation;
- worker termination;
- lease closure;
- pending-effect reconciliation;
- recovery/update closure;
- final durable closure.

### Forbidden flow

decommission → automatic restart.

## 14. Cross-transition threat propagation

Some threats cannot be solved locally.

### Identity compromise

Identity
→ Authority
→ Authorization
→ Execution
→ Evidence

Therefore identity is a cross-cutting TCB dependency.

### Policy/version change

Policy/VersionSet
→ Authorization
→ Execution
→ Evidence validity
→ Verification
→ Recovery

Therefore change management can invalidate previously valid claims.

### Storage rollback

Rollback
→ old authority/lease/config/evidence
→ stale actor
→ possible resurrection.

Therefore storage integrity and epoch protection are cross-domain safety requirements.

### Clock failure

Clock
→ freshness
→ lease expiry
→ authority expiry
→ evidence validity.

Therefore clock trust must be claim-specific and cannot be silently assumed.

### Common-mode observer compromise

Observer A + Observer B
→ same source/domain
→ apparent corroboration
→ false verification.

Therefore diversity of observer identity alone is insufficient.

## 15. Threat-driven forbidden-flow matrix

| Flow | Default |
|---|---|
| Model → Authorization | FORBIDDEN |
| Model → Execute | FORBIDDEN |
| Reward → Authority | FORBIDDEN |
| Lease → Authority | FORBIDDEN |
| Checkpoint → Authority | FORBIDDEN |
| Observer → Verified truth | FORBIDDEN |
| Evidence producer → Claim acceptance | FORBIDDEN when independence required |
| Signature → Safety admission | INSUFFICIENT |
| New operation ID → old UNKNOWN resolution | FORBIDDEN |
| Restart → execution | FORBIDDEN without recovery release |
| Recovery → self-authorization | FORBIDDEN |
| Executor → STOP clear | FORBIDDEN |
| Executor → policy/invariant rewrite | FORBIDDEN |
| Audit log → proof truth | FORBIDDEN |
| Cached authority → current authority during partition | FORBIDDEN |
| Telemetry timestamp → trusted time | INSUFFICIENT without time contract |
| Human request → unrestricted authority | FORBIDDEN |
| External response → authorization | FORBIDDEN |

## 16. Threat-driven positive-flow matrix

| Flow | Required gate |
|---|---|
| Planner → Proposal | schema + provenance |
| Proposal → EffectBinding | normalization + exact target/params |
| EffectBinding → Authorization | current authority/policy/invariant |
| Authorization → Reservation | protected transition + fencing |
| Reservation → Execution | final current-context gate |
| External attempt → Outcome | exact effect identity + durable intent |
| Observation → Reconciliation | provenance + freshness + identity |
| Reconciliation → Verification | claim-specific evidence contract |
| Verification → Commit/Release | current safety context + protected transition |
| Restart → Recovery | quarantine + fence + reconciliation |
| Update candidate → Active VersionSet | independent admission + staged verification |
| Decommission request → Closure | revocation + reconciliation + lifecycle closure |

## 17. New invariants

TFLOW-01: every protected transition has both an authority path and an information/evidence path.
TFLOW-02: no information path can bypass the protected authorization gate.
TFLOW-03: every safety-critical input has explicit trust/provenance semantics.
TFLOW-04: trust promotion is explicit and claim-scoped.
TFLOW-05: stale/replayed inputs cannot silently enter current protected state.
TFLOW-06: effect identity remains stable across retries/recovery.
TFLOW-07: external outcome ambiguity remains UNKNOWN until reconciled.
TFLOW-08: evidence cannot become verification without claim-specific admission.
TFLOW-09: verification cannot silently bypass current policy/VersionSet.
TFLOW-10: common-mode dependencies are part of claim assurance.
TFLOW-11: context changes propagate invalidation to dependent claims.
TFLOW-12: no recovery path may restore authority merely by restoring state.
TFLOW-13: decommission closure prevents resurrection through restart/recovery/update paths.
TFLOW-14: forbidden flows are architectural constraints, not conventions.
TFLOW-15: every protected transition has an explicit failure result.
TFLOW-16: information provenance must survive transformations required by downstream claims.
TFLOW-17: a component cannot self-upgrade its output trust classification.
TFLOW-18: threat mitigation is incomplete if an alternative flow can produce the same protected outcome.

## 18. Result

The combined model now has enough structure to identify a key property:

A threat is not closed merely because one path is protected.

For every protected outcome, Nexo must prove:

NO_ALLOWED_ALTERNATIVE_FLOW
can produce the same outcome while bypassing the intended gate.

This is stronger than ordinary access control. It is a **closed authority-flow property**.

The next research gate is therefore to build an **alternative-path / bypass closure analysis** for each critical outcome:
AUTHORIZATION
EXECUTION
STOP
RECOVERY RELEASE
VERIFIED CLAIM
VERSION ACTIVATION
DECOMMISSION CLOSURE.

Only when every alternative path is classified as allowed, blocked, or explicitly assumed can the kernel boundary be considered closed enough for architectural construction.

Architecture remains blocked.