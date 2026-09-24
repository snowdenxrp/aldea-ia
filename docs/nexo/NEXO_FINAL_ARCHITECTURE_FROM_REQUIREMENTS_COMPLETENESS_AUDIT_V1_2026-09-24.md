# NEXO FINAL ARCHITECTURE-FROM-REQUIREMENTS COMPLETENESS AUDIT V1 — 2026-09-24

Status: COMPLETE AUDIT / ARCHITECTURE STILL BLOCKED
Baseline audited: NEXO_CANONICAL_REQUIREMENTS_INVARIANT_BASELINE_V1

## Executive result

The requirements baseline is broad enough to serve as the canonical input to architecture design, but it is NOT yet safe to declare “complete” in the stronger sense of fully implementable and verifiable.

The audit found 12 residual architecture gates. These are not hidden omissions; they are explicitly designated OPEN/EXTERNAL/IMPLEMENTATION-DEPENDENT.

NIST's current SP 800-160 Rev.1 treats trustworthy systems engineering as a lifecycle discipline covering requirements, architecture, implementation, integration, verification, validation, stakeholders and system-of-systems concerns. NIST's cyber-resilience guidance likewise treats anticipation, resistance, recovery and adaptation as system lifecycle concerns. This supports keeping these gates explicit rather than silently assuming them away. citeturn0search0turn0search4

## 1. Coverage matrix

### Mission / purpose
Status: COVERED.
Requirements M01–M04 distinguish mission, goal, proxy, metric and verified outcome.

Residual:
exact mission-owner and mission-change authority must be instantiated in architecture.

### Identity
Status: COVERED.
Operation/effect/target/request identity and replay semantics are explicit.

Residual:
identity primitive and trust-root implementation remain open.

### Authority
Status: COVERED.
Scope, epochs/versioning, revocation, delegation and fail-closed behavior are defined.

Residual:
authoritative storage/serialization is open.

### Coordination
Status: COVERED.
Lease, generation and fencing are semantically separated.

Residual:
minimum canonical representation of epoch/generation/fence remains open.

### State / transitions
Status: COVERED.
Read/write sets, ownership, atomicity and crash/partition semantics are required.

Residual:
cross-store topology and actual linearization protocol remain open.

### External effects
Status: COVERED.
UNKNOWN and exact effect identity are mandatory.

Residual:
provider-specific reconciliation contracts remain open.

### STOP
Status: COVERED.
Independent stop plane and verification semantics are explicit.

Residual:
physical/remote actuation boundary and independence from executor must be instantiated.

### Recovery
Status: COVERED.
Fencing, quarantine, recovery ownership and explicit release are defined.

Residual:
recovery-of-recovery and corrupted durable-state recovery remain implementation/open gates.

### Update / configuration
Status: COVERED.
VersionSet, compatibility, rollback and semantic-change governance are explicit.

Residual:
schema/data migration and trust-root rollover implementation remain open.

### Evidence
Status: COVERED.
Provenance, freshness, invalidation, negative evidence and claim binding are explicit.

Residual:
large-scale invalidation and durable evidence architecture remain open.

### Claims / assurance
Status: COVERED.
Claim composition, assumptions and assurance degradation are defined.

Residual:
composition algorithm and scalable dependency graph remain open.

### Dependencies / common mode
Status: COVERED.
Dependency closure and common-mode collapse are explicit.

Residual:
actual deployment/failure-domain topology remains open.

### TCB
Status: COVERED.
Claim-specific TCB and semantic concentration are defined.

Residual:
compromise containment behavior and exact trust-root implementation remain open.

### Information flow
Status: COVERED.
Information, capability, authority, effect and evidence flows are separated.

Residual:
actual enforcement mechanism remains open.

### Resources
Status: COVERED AT REQUIREMENT LEVEL.
Starvation and protected-resource requirements exist.

Residual:
resource budgets, admission policy and degraded-mode implementation are open.

### Humans / governance
Status: COVERED.
Human input classes, exact approvals, conflicts and emergency authority are defined.

Residual:
actual authority administration and separation-of-duties mechanism are open.

### Decommission
Status: COVERED.
Fencing, delegated-work closure, pending effects, secrets and recovery/update closure are defined.

Residual:
provider-side delayed effects and snapshot resurrection require implementation tests.

### Formal model
Status: COVERED.
Abstract model, refinement, stuttering, linearization, crash/partition and evidence correspondence are required.

Residual:
actual formal model and SANY/TLC execution remain open.

### Verification / observability
Status: COVERED.
Evidence lifecycle, traces, counterexamples, fault injection and bidirectional traceability are required.

Residual:
runtime implementation correspondence is open.

### Lifecycle / change
Status: COVERED.
Change impact and re-verification are defined.

Residual:
baseline activation and migration tooling remain open.

## 2. Stakeholder completeness

Required stakeholder classes are now represented:

- mission owner;
- safety authority;
- security/trust authority;
- policy authority;
- normal operator;
- emergency authority;
- recovery authority;
- update/change authority;
- decommission authority;
- verifier/auditor;
- data owner/controller;
- infrastructure/platform authority;
- external provider;
- affected third parties.

No stakeholder class is currently missing from the baseline.

Open question is implementation of separation of duties, not stakeholder identification.

## 3. Lifecycle completeness

Covered lifecycle states:

BOOTSTRAP
NORMAL
DEGRADED
RESTRICTED
HOLD
QUARANTINED
STOP
RECOVERY
UPDATE
ROLLBACK
MIGRATION
DECOMMISSION
ARCHIVAL.

Important finding:
The requirements cover lifecycle transitions, but the architecture must make lifecycle authority explicit. No lifecycle state transition may be inferred from process existence, timeout, restart or telemetry silence.

## 4. Failure-composition audit

Required combined scenarios are covered conceptually:

1. STOP + partition + stale actor
2. UPDATE + crash + storage rollback
3. RECOVERY + UNKNOWN + observer loss
4. DECOMMISSION + delayed message + snapshot restore
5. trust-root rollover + evidence invalidation + recovery
6. policy change + verification race + cached evidence
7. lease expiry + partition + delayed command
8. resource exhaustion + emergency stop
9. migration + concurrent write + rollback
10. common-mode collapse + independence claim.

No scenario currently has an unclassified safety meaning.

Implementation/fault-injection evidence remains OPEN.

## 5. External-boundary audit

The strongest non-controllable boundaries are explicitly identified:

- external effect providers;
- remote cancellation;
- external world observations;
- network;
- clocks;
- storage;
- identity providers;
- model providers;
- package/update sources;
- humans;
- physical/environmental conditions.

Rule:
An external dependency can be an assumption/contract/evidence source, but it cannot silently become a trusted internal invariant.

This is consistent with NIST's systems view that system-of-systems, system elements, stakeholders and operational environments must be considered in the engineering lifecycle. citeturn0search0

## 6. Requirement-to-enforcement test

Question:
Does every safety requirement have a future architectural enforcement or verification point?

Result:

ENFORCEABLE IN CORE:
- authority scope;
- effect identity;
- protected transitions;
- fencing;
- STOP;
- recovery release;
- VersionSet admission;
- critical evidence validity;
- stale actor rejection.

ENFORCEABLE BY SUPPORTING SYSTEM + CORE GATE:
- reconciliation;
- claim composition;
- dependency closure;
- observability;
- formal evidence;
- migration.

EXTERNAL/CONTRACTUAL:
- actual external-world truth;
- remote provider behavior;
- physical effect;
- third-party availability;
- human response.

OPEN:
- exact mechanism for every boundary.

No requirement was found that is logically impossible under the current model, but several cannot be guaranteed internally and must remain explicit external assumptions/contracts.

## 7. Hidden requirement test

Potentially hidden requirements checked:

- uniqueness;
- ordering;
- freshness;
- provenance;
- replay;
- stale actor;
- clock trust;
- storage rollback;
- schema compatibility;
- resource starvation;
- human delay;
- common-mode;
- evidence invalidation;
- negative evidence;
- decommission resurrection;
- recovery-of-recovery;
- trust-root rollover;
- long-duration rollover;
- model/provider drift.

All are either explicit requirements or explicit OPEN gates.

## 8. Architecture self-verification test

Requirement:
The architecture must not be able to alter its own verification criteria and thereby produce its own PASS.

Status: COVERED.

Remaining:
independent review/verifier authority must be physically/logically separated in implementation.

## 9. Residual gates

### G-A01 — authoritative storage topology
Choose and formally define the minimum authoritative state domain.

### G-A02 — linearization protocol
Select/prove CAS, serializable transaction, consensus, fencing protocol or hybrid semantics for each L3 transition.

### G-A03 — external reconciliation
Define provider-specific semantics for APPLIED / NOT_APPLIED / UNKNOWN / PARTIALLY_APPLIED.

### G-A04 — trusted time
Define what happens when time becomes unavailable, contradictory, rolled back or untrusted.

### G-A05 — evidence invalidation
Define scalable propagation from context changes to affected claims.

### G-A06 — negative evidence
Define proof obligations for NO_EFFECT, NOT_APPLIED, NO_ACTIVE_WORK and equivalent claims.

### G-A07 — TCB compromise
Define containment and safe degradation if a candidate TCB component is compromised.

### G-A08 — migration
Define schema/data/formal-model migration while preserving or invalidating authority and evidence correctly.

### G-A09 — resource protection
Define minimum protected budgets for STOP, recovery, verification, fencing and durable safety history.

### G-A10 — recovery-of-recovery
Define what happens if recovery itself fails, becomes partitioned or restores corrupted state.

### G-A11 — actual formal execution
Run and validate SANY/TLC and later refinement evidence in the clean model.

### G-A12 — runtime correspondence/fault injection
Prove implementation traces correspond to the abstract model under crash, partition, retry, stale actor and combined failures.

## 10. Classification

CLOSED AT REQUIREMENT LEVEL:
mission semantics;
identity;
authority semantics;
coordination semantics;
external-effect identity;
STOP semantics;
recovery semantics;
update semantics;
evidence semantics;
claim semantics;
dependency/common-mode semantics;
TCB semantics;
information-flow semantics;
human/governance semantics;
decommission semantics;
formal/refinement requirements;
traceability.

DESIGNATED EXTERNAL:
physical world;
third-party providers;
human response;
environmental conditions.

OPEN IMPLEMENTATION/ARCHITECTURE:
G-A01 through G-A12.

REJECTED:
all historical shortcuts already listed in the V1–V20 reconciliation.

## 11. Gate decision

The requirements baseline passes the **completeness-at-requirements-level gate**.

It does NOT pass an implementation-verification gate, because implementation does not exist and several architecture-level mechanisms are intentionally still open.

Therefore:

REQUIREMENTS BASELINE → READY FOR ARCHITECTURE DESIGN

ARCHITECTURE IMPLEMENTATION → BLOCKED

FORMAL IMPLEMENTATION → BLOCKED

RUNTIME CLAIMS → BLOCKED

The next phase is now legitimately allowed to be architecture design, not code.

## 12. Architecture design constraint

The first architecture artifact must not choose technology prematurely.

It must derive:

1. system boundary;
2. trust boundaries;
3. authoritative state domain;
4. object ownership;
5. protected transitions;
6. atomicity/linearization per transition;
7. TCB boundary;
8. independent STOP/recovery boundaries;
9. evidence and claim boundary;
10. dependency/common-mode boundary;
11. external-world boundary;
12. lifecycle/change boundary;
13. formal abstraction boundary;
14. implementation/refinement boundary.

Only after these are explicit should technology/storage/runtime choices be selected.

## Final status

The research-first gate is now passed at the requirements level.

The project may proceed to **CLEAN ARCHITECTURE DESIGN FROM THE BASELINE**.

Still prohibited:
- V21 patching;
- migration of old code before architecture;
- declaring architecture verified;
- treating historical PASS as current evidence;
- hiding G-A01..G-A12.

