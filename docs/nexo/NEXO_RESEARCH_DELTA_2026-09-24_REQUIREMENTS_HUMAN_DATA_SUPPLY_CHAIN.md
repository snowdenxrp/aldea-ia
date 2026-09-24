# NEXO RESEARCH DELTA — SYSTEM COMPLETENESS: REQUIREMENTS, HUMAN, DATA, SUPPLY CHAIN
Date: 2026-09-24
Status: RESEARCHED / ARCHITECTURE BLOCKED

## Purpose
This pass expands the pre-architecture completeness audit. It does not define the final architecture and does not authorize implementation.

The objective is to find classes of requirements, actors, lifecycle states, dependencies, evidence, and failure modes that could be omitted if Nexo were designed only as a safety/control kernel.

## Sources contrasted
- NIST SP 800-160: trustworthy systems engineering must begin from stakeholder requirements/protection needs and carry them through the lifecycle.
- NASA Systems Engineering Handbook / HSI guidance: the system boundary includes hardware, software, people, processes and procedures; human considerations belong in system engineering, not as an afterthought.
- NIST SSDF SP 800-218: secure development and supplier/software lifecycle practices must be integrated into the SDLC.
- NIST Privacy Framework: data actions span collection, retention, logging, generation, transformation, use, disclosure/sharing, transmission and disposal.

## 1. Requirements completeness
A requirement inventory must distinguish at least:
- mission/function requirements;
- safety constraints and safety invariants;
- security/trust requirements;
- privacy/data-governance requirements;
- reliability, availability and recoverability;
- performance, latency, capacity and resource ceilings;
- maintainability, diagnosability and observability;
- usability and human-operability;
- interoperability/protocol/interface requirements;
- deployment/platform/environment requirements;
- auditability, provenance and evidence requirements;
- update, migration and compatibility requirements;
- legal/policy/compliance constraints where applicable;
- decommissioning and residual-effect requirements.

New architectural consequence:
A single generic “policy” object is insufficient as the universal representation of all requirements. Requirements have different owners, scopes, lifetimes, verification methods, and failure semantics.

Required distinction:
REQUIREMENT != POLICY != INVARIANT != AUTHORITY != EVIDENCE != TEST.

Every critical requirement needs:
owner, scope, rationale, source, version, applicability conditions, conflict/precedence rule, verification method, evidence class, lifecycle status, dependencies and invalidation conditions.

## 2. Requirements traceability
Traceability must work in both directions:
stakeholder need -> requirement -> design element -> implementation -> test/evidence -> operational claim
and
observed failure -> affected requirement -> design/implementation/evidence -> corrective action.

A green test result cannot imply complete requirements coverage.

Coverage must expose:
- unimplemented requirements;
- requirements with no verification method;
- tests that verify no current requirement;
- requirements whose assumptions changed;
- conflicting requirements;
- requirements whose owner/authority is missing;
- evidence generated under obsolete versions.

Potential future object: RequirementRecord, but final object boundaries remain blocked pending distillation.

## 3. Stakeholder and authority completeness
The system boundary must account for more roles than “user” and “AI”:
- mission owner;
- policy authority;
- safety authority;
- security/trust authority;
- operator;
- maintainer;
- recovery authority;
- update authority;
- auditor/verifier;
- data owner/controller where applicable;
- infrastructure/platform authority;
- external service/provider;
- affected third parties;
- emergency authority.

Roles may conflict. Separation of duties must therefore be explicit rather than inferred.

New requirement:
A role existing in documentation is not equivalent to an authorized capability. Authority must remain scoped, versioned, revocable and auditable.

Human input must be classified:
instruction, authorization, delegation, preference, consent, observation/report, emergency intervention, or ambiguity.
Inference from behavior/preferences must never silently become authority.

## 4. Human-system integration
NASA's HSI material treats humans, hardware, software, data and processes as integrated system elements. This supports a stronger boundary rule:

NEXO SYSTEM = CONTROLLED SOFTWARE + TRUSTED SUPPORTING ELEMENTS + HUMAN ROLES + EXTERNAL DEPENDENCIES + OPERATIONAL PROCEDURES, to the extent each participates in a claimed safety/security property.

Human factors to model:
- misunderstanding;
- confirmation bias / automation bias;
- fatigue and attention limits;
- unavailable operator;
- conflicting human instructions;
- delayed approval;
- accidental approval;
- emergency override;
- operator training/competence assumptions;
- UI ambiguity;
- unsafe default interpretation;
- handoff between operators.

A human approval is evidence of authorization only if the approval itself is authenticated, bound to the exact operation/effect scope, current authority context, and relevant versioned policy.

## 5. Data lifecycle completeness
Data must not be modeled only as “memory.”

At minimum distinguish:
- input/source data;
- operational state;
- mission state;
- evidence;
- execution history;
- audit records;
- secrets/credentials;
- model/prompt/configuration data;
- derived knowledge;
- external-world observations;
- backups/checkpoints;
- archived/decommissioned data.

For each class:
collection -> validation -> use -> transformation -> sharing/transmission -> retention -> archival -> deletion/disposal.

Critical distinction:
DELETION REQUESTED != DELETION ENFORCED != DELETION VERIFIED.

Likewise:
DATA INTEGRITY != DATA TRUTH != DATA AUTHORIZATION.

Retention/deletion can affect future evidence, recovery, legal obligations, and reproducibility; therefore deletion itself can be a controlled effect requiring authority and verification.

## 6. Supply chain and dependency completeness
The previous dependency/common-mode work must expand from runtime dependencies to lifecycle supply-chain dependencies:
- source repositories;
- builders/CI;
- package registries;
- base images;
- operating system/runtime;
- model providers;
- data providers;
- signing/attestation services;
- key-management/trust roots;
- update channels;
- configuration distribution;
- monitoring/telemetry providers.

New rule:
DEPENDENCY PRESENT != DEPENDENCY TRUSTED != DEPENDENCY SAFE != DEPENDENCY AVAILABLE.

A signed artifact can still be semantically incompatible or unsafe for the current safety context.

Dependency closure therefore belongs to:
build admission, update admission, runtime assurance, evidence validity, recovery admission, and formal verification context.

## 7. Environment/platform assumptions
Every critical claim needs an explicit assumption boundary for:
- clock/time source;
- storage durability;
- network behavior;
- DNS/service discovery;
- identity provider;
- cryptographic primitives;
- hardware/platform;
- virtualization/container runtime;
- resource availability;
- external APIs;
- model/provider behavior;
- operator availability;
- observability integrity.

Unknown or violated assumptions must produce an assurance transition, not merely a log entry.

ASSUMPTION VIOLATED -> CLAIM STALE/INVALIDATED -> RESTRICT/HOLD/REVALIDATE according to impact.

## 8. Resource exhaustion and cost
A system can remain logically safe while becoming operationally unusable.

Need explicit treatment of:
CPU, memory, storage, bandwidth, API quotas, model tokens/cost, queue depth, concurrency, energy/power where relevant, and human attention.

Resource admission must not allow a mission to consume the resources required by emergency stop, recovery, verification, logging, or security control.

Safety-critical resources require protected budgets/reservations and denial semantics.

## 9. Interoperability and migration
Version coexistence is a first-class state.

Potential states:
OLD_ONLY, MIXED_COMPATIBLE, MIXED_RESTRICTED, MIGRATION_REQUIRED, MIGRATION_FAILED, ROLLBACK_RESTRICTED, DECOMMISSION_PENDING.

Never infer:
NEW_VERSION_PRESENT -> OLD_STATE_SAFE_TO_DELETE.

Migration requires semantic compatibility, data/state transformation verification, effect reconciliation, rollback strategy, and evidence continuity.

## 10. Multi-agent / system-of-systems boundary
If Nexo later coordinates multiple agents/services:
- local authority must not become global authority;
- one agent's evidence is not automatically independent from another's;
- shared infrastructure creates common-mode failure;
- cross-agent effects need exact identity and ownership;
- delegation must preserve parent scope and authority bounds;
- disagreement must have explicit resolution/revalidation semantics.

This extends the existing principle:
DIFFERENT PROCESS != INDEPENDENT AUTHORITY != INDEPENDENT EVIDENCE.

## 11. Incident response and degraded operation
Degraded operation must be designed before implementation.

Candidate assurance states:
NORMAL
ASSURANCE_DEGRADED
RESTRICTED
HOLD
QUARANTINED
RECOVERY
DECOMMISSION_PENDING

Transitions require explicit causes and recovery conditions.

A degraded mode must specify:
- what remains allowed;
- what becomes forbidden;
- which evidence remains trusted;
- which dependencies are mandatory;
- who can restore normal operation;
- what must be reconciled first;
- expiry/review conditions.

## 12. Mission/proxy completeness
The system needs a formal distinction between:
MISSION OBJECTIVE
GOAL
SUBGOAL
PROXY
METRIC
LOCAL SUCCESS
WORLD EFFECT
VERIFIED MISSION OUTCOME.

A proxy can improve while the actual mission deteriorates.

Therefore no metric/score/reward/result may by itself authorize a critical external effect unless the effect is separately admitted under current authority, policy, safety context and world evidence.

This is a specification-completeness issue, not merely a model-alignment issue.

## 13. Decommissioning
Decommissioning is a controlled lifecycle phase, not process termination.

Checklist:
- stop and fence execution;
- revoke authority/capabilities;
- terminate delegated work;
- reconcile external effects;
- preserve required evidence/history;
- handle secrets/credentials;
- handle retained data;
- handle backups;
- disable recovery paths;
- disable update/bootstrap paths if required;
- remove integrations/webhooks;
- verify no active lease/worker;
- verify no pending external effect;
- record final state.

TERMINATED PROCESS != DECOMMISSIONED SYSTEM.

## 14. New completeness invariants to carry into distillation
C-01: Every critical claimed property has an explicit system boundary.
C-02: Every critical requirement has owner, scope, version, verification method and evidence status.
C-03: Requirement, policy, authority, invariant, evidence and test are distinct concepts.
C-04: Human roles are explicit system elements when they participate in control or assurance.
C-05: Human approval cannot expand authority beyond its authenticated scope.
C-06: Data lifecycle includes disposal semantics and verification where required.
C-07: Dependency trust and dependency availability are distinct.
C-08: Critical resource budgets protect safety/recovery/verification functions from starvation.
C-09: Version coexistence and migration have explicit compatibility and reconciliation states.
C-10: Violated assumptions invalidate or degrade affected claims according to defined impact.
C-11: Degraded operation has explicit allowed/forbidden actions and recovery authority.
C-12: Mission outcome is not equivalent to proxy/metric/local completion.
C-13: Decommissioning requires external-effect, authority, data, secret and recovery-path closure.
C-14: No lifecycle transition creates authority merely because a process restarted, artifact changed, lease expired, or a metric improved.

## 15. Research status
This pass materially closes a previously under-modeled category: system completeness beyond the safety/control kernel.

It does NOT close:
- formal unification;
- actual SANY/TLC execution;
- implementation linearizability/CAS equivalence;
- runtime enforcement;
- fault injection/adversarial runtime validation;
- implementation-to-formal correspondence;
- evidence freshness/invalidation implementation;
- original semantic/data migration integrity.

Architecture construction remains BLOCKED until this and prior research are distilled into the canonical ledger.

## Evidence boundary
The cited standards/guidance support the engineering principles above; they do not prove any future Nexo implementation correct. Nexo-specific claims remain design/research obligations.
