# NEXO CLEAN ARCHITECTURE — A13 TECHNOLOGY-INDEPENDENT DEPLOYMENT MAPPING V1 — 2026-09-24

Status: ARCHITECTURE DESIGN / DEPLOYMENT CONTRACT
Implementation: NOT STARTED
Technology selection: NOT STARTED

## Purpose

A13 maps the abstract architecture to physical/runtime deployment without selecting products yet. The central rule is that deployment topology must preserve the semantic boundaries already defined in A01-A12.

NIST SP 800-160 treats trustworthy engineering as a lifecycle discipline spanning architecture, implementation, integration, verification and validation. Its current Rev. 1 also emphasizes trustworthiness as a system property rather than a single security component. NIST SP 800-160 Vol. 2 Rev. 1 frames cyber-resilience as the ability to anticipate, withstand, recover from and adapt to adverse conditions. Therefore deployment is treated as part of the assurance argument, not merely infrastructure. citeturn0search0turn0search9

## A13.1 Deployment planes

The clean deployment is divided into planes:

### P1 — Intelligence / cognition plane
Contains:
- model inference;
- planning;
- memory retrieval;
- simulation;
- goal decomposition;
- optimization;
- non-authoritative learning.

P1 can propose actions but cannot directly cross a protected effect boundary.

### P2 — Policy / decision preparation plane
Contains:
- normalization;
- candidate action construction;
- policy evaluation preparation;
- evidence requests;
- mission-state interpretation.

P2 produces proposals and context packages.

### P3 — Protected authority plane
Contains the minimum mechanisms necessary for:
- identity;
- authority;
- EffectBinding;
- protected transition ordering;
- fences;
- STOP;
- recovery fencing;
- VersionSet admission;
- critical evidence acceptance;
- decommission state.

P3 is the primary TCB boundary.

### P4 — Effect boundary plane
Contains:
- effect adapters;
- exact idempotency/effect identity handling;
- external request execution;
- provider-specific response handling.

P4 is not allowed to redefine authority.

### P5 — Reconciliation / observation plane
Contains:
- external observations;
- provider state retrieval;
- reconciliation;
- contradiction detection;
- claim construction.

P5 can establish evidence according to its trust assumptions but cannot directly grant protected authority.

### P6 — Recovery / administration plane
Contains:
- recovery orchestration;
- decommission operations;
- controlled maintenance;
- emergency procedures;
- artifact/version activation workflows.

P6 must use protected recovery and change-authority boundaries rather than privileged bypasses.

### P7 — Evidence / audit plane
Contains:
- immutable or append-oriented evidence records;
- model-checking artifacts;
- trace records;
- verification claims;
- dependency manifests;
- provenance.

P7 is not itself authoritative merely because it stores evidence.

## A13.2 Trust boundary rules

Crossing P1/P2 → P3 requires explicit protected admission.

Crossing P3 → P4 requires an exact EffectBinding and current fence.

P4 → P5 carries observation, not authority.

P5 → P3 carries a bounded claim/evidence result and must pass current-context validation.

P6 → P3 requires explicit recovery/change authority.

P7 → P3 requires evidence validation; stored text cannot become a trusted fact merely by retrieval.

## A13.3 Process isolation

The architecture does not require every plane to be a separate machine or process. It requires that authority boundaries remain enforceable if components are co-located.

Preferred deployment property:
- protected authority has a smaller privilege surface than cognition;
- cognition cannot invoke protected storage through ambient credentials;
- effect adapters cannot mutate authority state except through defined protected commands;
- evidence stores cannot mutate protected state directly;
- recovery cannot share unrestricted credentials with ordinary execution.

Co-location is therefore permitted only when isolation assumptions remain explicit and testable.

## A13.4 Credential topology

Credentials are scoped to capability, not component identity alone.

At minimum:

CRED-I — identity verification
CRED-A — authority transition
CRED-F — fence management
CRED-S — STOP enforcement
CRED-R — recovery
CRED-E — effect execution
CRED-O — observation
CRED-V — verification/claim processing
CRED-U — update/version activation
CRED-D — decommission

No ordinary execution credential should possess all of these.

A credential compromise analysis must identify which claims and transitions become unsafe.

## A13.5 Network topology

The network is treated as hostile/unreliable unless a specific link is part of a trust assumption.

Required properties:
- authenticated protected commands;
- replay resistance;
- effect identity preservation;
- bounded authority context;
- no implicit trust from network location;
- explicit timeout semantics;
- partition behavior defined;
- stale-message rejection where relevant.

A successful TCP/HTTP response is not by itself evidence of semantic success.

## A13.6 Storage topology

P0 state requires a protected persistence path whose failure semantics are explicitly modeled.

P1 state supports recovery/reconciliation but cannot independently grant authority.

P2 state is reconstructable.

Any replica used for a protected decision must be classified as authoritative or non-authoritative. There is no implicit middle category.

Snapshots require generation/epoch compatibility checks before restoration.

## A13.7 Clock topology

Time is divided into:

T-physical — wall-clock observation.
T-monotonic — local duration measurement.
T-authority — whatever ordering/expiry semantics the protected protocol actually trusts.

Wall-clock time must not be treated as an authority oracle.

Lease expiration semantics remain OPEN until the trusted-time/failure model is finalized.

## A13.8 Update topology

Updates are treated as protected state transitions.

Required sequence:

candidate artifact
→ provenance/identity validation
→ dependency closure
→ compatibility evaluation
→ VersionSet construction
→ protected admission
→ staged activation
→ health/evidence checks
→ release or rollback

Rollback must not erase UNKNOWN or resurrect decommissioned authority.

## A13.9 Recovery topology

Recovery must be able to operate when ordinary execution is unhealthy.

Therefore the recovery path cannot depend entirely on the same failure domain it is supposed to recover from.

At the same time, recovery must not become an unrestricted superuser path.

Required properties:
- distinct recovery identity/context;
- recovery fence;
- current VersionSet validation;
- checkpoint compatibility validation;
- explicit reconciliation;
- explicit release.

## A13.10 Observability topology

Observability has three classes:

O1 operational telemetry;
O2 protected transition evidence;
O3 assurance evidence.

O1 may be lossy.
O2 is required to reconstruct protected semantics.
O3 supports claims and verification.

O1 failure must not silently destroy O2/O3 requirements.

## A13.11 Deployment failure domains

The deployment manifest must classify shared failure domains for:

- compute;
- kernel/host;
- storage;
- network;
- DNS/service discovery;
- clock/time source;
- identity/KMS/trust roots;
- policy/configuration;
- build/update pipeline;
- artifact registry;
- model provider;
- data provider;
- protected authority store;
- recovery store;
- observation source;
- verification source;
- operator/admin plane.

Redundancy claims must reference these domains rather than node counts.

## A13.12 Blast-radius contract

For every component, document:

1. what it can read;
2. what it can write;
3. what capability it can exercise;
4. which protected transitions it can request;
5. which transitions it can never perform;
6. what happens if compromised;
7. what happens if unavailable;
8. which evidence becomes invalid;
9. which identities/fences must be rotated;
10. whether the failure can create a common-mode condition.

## A13.13 No ambient authority

No deployment component receives authority merely because it is inside the trusted network, container, cluster, namespace, host, VPC, or process tree.

Authority must be explicit, scoped, current, and context-bound.

## A13.14 Side-channel and covert coupling review

The deployment audit must consider hidden coupling through:
- shared filesystem;
- shared environment variables;
- inherited credentials;
- shared caches;
- shared queues;
- shared clocks;
- shared admin accounts;
- shared CI/CD;
- shared observability/control plane;
- shared model/provider;
- shared package/build chain.

If two supposedly independent safety mechanisms share a decisive dependency, the common-mode relationship must be recorded.

## A13.15 Technology-selection gate

A concrete technology may be selected only after it is mapped to:

- A05 topology;
- A06 linearization;
- A07 STOP/recovery;
- A08 evidence/claims;
- A09 dependency/common-mode rules;
- A10 TCB;
- A11 failure/interleaving matrix;
- A12 formal variables/refinement;
- P0/P1/P2 durability;
- update and rollback semantics;
- deployment failure domains.

The product name is not the architecture.

## A13.16 Deployment invariants

DEP-01 Cognition cannot directly grant protected authority.
DEP-02 Effect adapters cannot directly rewrite authority.
DEP-03 Observation cannot directly authorize execution.
DEP-04 Recovery cannot bypass STOP.
DEP-05 Evidence storage cannot create truth by persistence.
DEP-06 Co-location cannot silently expand privileges.
DEP-07 Restart cannot clear protected fencing.
DEP-08 Replica count cannot be used as a proxy for independence.
DEP-09 Network reachability cannot be used as authority.
DEP-10 Rollback cannot erase UNKNOWN or decommission state.
DEP-11 Update activation is version-bound and protected.
DEP-12 Critical observability is separated from ordinary telemetry.
DEP-13 Credential compromise has a bounded, documented blast radius.
DEP-14 Shared failure domains are explicit.
DEP-15 Concrete deployment must refine the abstract model without hiding safety-relevant transitions.

## A13.17 A13 result

Deployment planes: DESIGNED
Trust boundaries: DESIGNED
Credential topology: DESIGNED
Storage/network/clock contracts: DESIGNED
Recovery/update topology: DESIGNED
Failure-domain mapping: DESIGNED
Technology choice: BLOCKED
Concrete infrastructure: BLOCKED

OPEN ITEMS carried forward:
- trusted-time model;
- concrete P0 durability semantics;
- migration protocol;
- exact recovery independence boundary;
- quantitative/common-mode analysis;
- resource exhaustion controls;
- provider-specific reconciliation.

Next:
A14 full architecture completeness/self-audit.
No implementation starts before A14 and the final distillation gate are complete.
