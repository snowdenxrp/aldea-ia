# NEXO CLEAN ARCHITECTURE — A13-A14 DEPLOYMENT MAPPING AND COMPLETENESS SELF-AUDIT V1 — 2026-09-24

Status: ARCHITECTURE DESIGN / TECHNOLOGY-INDEPENDENT DEPLOYMENT
Implementation: NOT STARTED

## A13 — Deployment mapping

The deployment model maps semantic zones to deployable trust boundaries without assuming a specific vendor or database.

### D0 — Trusted foundation

Contains:
- boot/attestation assumptions;
- trust-root interface;
- identity primitives;
- minimal protected runtime.

Rule:
D0 must not contain planner/model behavior.

### D1 — Protected authoritative core

Contains:
- AuthorityContext;
- EffectBinding;
- protected transitions;
- fencing;
- STOP;
- recovery fence;
- VersionSet admission;
- critical evidence validity;
- decommission fencing.

D1 is the smallest deployment domain allowed to make safety-relevant authority decisions.

### D2 — Control/semantic plane

Contains:
- mission management;
- planner;
- model;
- memory;
- human interface;
- coordination proposals;
- analytics;
- ordinary scheduling.

D2 may request, propose and observe. It cannot bypass D1.

### D3 — Execution/observation plane

Contains:
- effect executors;
- provider adapters;
- sensors/telemetry;
- evidence producers;
- reconciliation adapters.

D3 cannot promote its own evidence into authority.

### D4 — External world

Contains:
- physical environment;
- remote systems;
- third-party services;
- humans;
- external state.

D4 is not assumed to obey Nexo's internal state machine.

## A13.1 Deployment rules

1. D1 must be independently identifiable from D2.
2. D2 compromise must not directly mutate D1 protected state.
3. D3 compromise must not grant D1 authority.
4. D4 responses are untrusted until effect-specific reconciliation.
5. UI is never a protected-state write path.
6. Logs/telemetry are not authority stores.
7. Cache loss cannot change protected semantics.
8. Replica freshness must be explicit.
9. Recovery components cannot silently become execution authorities.
10. Update components cannot bypass D1 safety admission.

## A13.2 Network boundary rules

Every D1 boundary crossing must carry:
identity,
operation/effect identity,
scope,
authority context,
VersionSet context,
fence,
request fingerprint,
correlation identity,
freshness where relevant.

Protected calls must fail closed when required context cannot be validated.

## A13.3 Storage mapping

P0:
authoritative protected state and anti-resurrection/fence state.

P1:
critical reconciliation/evidence/audit state.

P2:
reconstructable state.

No P2 source may be promoted into P0 semantics merely because it contains a copy of the data.

## A13.4 Deployment failure classes

The deployment architecture must model:
- D1 crash;
- D2 crash;
- D3 crash;
- network partition;
- storage rollback;
- stale D3 worker;
- compromised D2;
- compromised D3;
- stale replica;
- delayed provider response;
- recovery crash;
- update interruption.

Each must map to:
CONTINUE,
HOLD,
RESTRICT,
QUARANTINE,
RECOVER,
or RECONCILE.

No deployment failure may create an implicit authority transition.

## A13.5 Technology-neutral portability

A future concrete deployment may use:
- one process or multiple processes;
- local storage or distributed storage;
- synchronous or replicated persistence;
- hardware-backed trust;
- software-only trust boundaries;

but only if the implementation demonstrates equivalence to the semantic contracts.

Physical separation is evidence of isolation only when the failure-domain analysis supports the claimed independence.

## A14 — Complete architecture self-audit

### A14.1 Requirement coverage

Every canonical requirement must map to:
Requirement
→ invariant/constraint
→ architectural boundary
→ object
→ protected transition
→ implementation element
→ verification method
→ evidence.

Reverse trace:
Observed failure
→ evidence
→ affected claim
→ requirement/invariant
→ boundary/object
→ corrective change
→ reverification.

No requirement may terminate at a prose paragraph.

### A14.2 Architecture completeness classes

Each requirement is now assigned one of:

IMPLEMENTED BY ARCHITECTURE
EXTERNAL DEPENDENCY
DEFERRED TO IMPLEMENTATION
VERIFICATION-DEPENDENT
OPEN
N/A WITH RATIONALE

The architecture is not declared complete merely because every item has a label. OPEN and external dependencies remain visible.

### A14.3 Coverage audit

Covered by architecture:
- identity;
- authority;
- capability separation;
- exact effect identity;
- protected transitions;
- linearization;
- fencing;
- STOP;
- recovery;
- VersionSet;
- evidence validity;
- invalidation;
- reconciliation boundary;
- common-mode;
- TCB;
- decommission;
- formal boundary;
- deployment boundaries.

### A14.4 Explicit external dependencies

Still external/contractual:
- actual external-world truth;
- provider-specific idempotency/cancellation;
- physical actuator behavior;
- hardware trust guarantees;
- clock guarantees beyond the selected trust model;
- external identity infrastructure;
- cryptographic primitive security;
- provider availability;
- human correctness;
- environmental assumptions.

External does not mean ignored. Each must have an assumption, boundary, failure mode and claim impact.

### A14.5 Residual architecture gates

G-A01 Authoritative storage implementation.
G-A02 Concrete linearization protocol.
G-A03 Trusted time semantics.
G-A04 External reconciliation contracts.
G-A05 Evidence invalidation propagation.
G-A06 Negative-evidence mechanisms.
G-A07 Resource protection.
G-A08 Migration and schema evolution.
G-A09 TCB compromise/recovery.
G-A10 Actual SANY/TLC execution.
G-A11 Runtime refinement tests.
G-A12 Fault injection/adversarial testing.
G-A13 Long-run epoch/generation rollover.
G-A14 Decommission closure under failure.
G-A15 Supply-chain/update implementation.
G-A16 Privacy/data lifecycle implementation.
G-A17 Claim composition implementation.
G-A18 Assumption-budget verification.

### A14.6 Architecture completeness verdict

The architecture is COMPLETE AT THE SEMANTIC DESIGN LEVEL.

It is NOT complete at the implementation-assurance level.

That distinction is mandatory.

The next phase is not “start coding blindly.” It is a technology-feasibility and implementation-contract phase in which each residual gate is resolved without changing the semantic baseline.

### A14.7 Pre-implementation gate

Before any protected implementation begins, all of the following must exist:

- concrete storage choice and failure contract;
- concrete linearization protocol;
- concrete fence mechanism;
- STOP enforcement mechanism;
- recovery implementation contract;
- external reconciliation adapter contract;
- trusted-time contract;
- schema/migration contract;
- resource-protection contract;
- TLA+ model;
- actual SANY/TLC results;
- refinement map from implementation to formal model;
- fault-injection plan;
- trace/evidence schema;
- CI/reproducibility contract;
- supply-chain/update contract;
- rollback/recovery test plan.

### A14.8 What remains forbidden

Until the pre-implementation gate:
- no V21 runtime;
- no patching V20 into the new architecture;
- no silent migration;
- no “temporary” authority bypass;
- no proof cache used as authority;
- no model/planner direct protected writes;
- no executor-controlled STOP release;
- no automatic UNKNOWN resolution;
- no claim of verified safety from architecture documents alone.

## Final architecture status

A01 Context: COMPLETE
A02 Authority/Ownership: COMPLETE
A03 Canonical Objects: COMPLETE
A04 Protected Transitions: COMPLETE
A05 Authoritative State Topology: COMPLETE
A06 Linearization Architecture: COMPLETE
A07 STOP/Recovery: COMPLETE
A08 Evidence/Claims: COMPLETE
A09 Dependencies/Common Mode: COMPLETE
A10 TCB: COMPLETE
A11 Adversarial Interleavings: COMPLETE AT DESIGN LEVEL
A12 Formal Boundary: COMPLETE AT DESIGN LEVEL
A13 Deployment Mapping: COMPLETE AT SEMANTIC LEVEL
A14 Completeness Self-Audit: COMPLETE AT SEMANTIC LEVEL

Implementation assurance: OPEN
Concrete technology: NOT SELECTED
Formal execution: NOT DONE
Runtime verification: NOT DONE
