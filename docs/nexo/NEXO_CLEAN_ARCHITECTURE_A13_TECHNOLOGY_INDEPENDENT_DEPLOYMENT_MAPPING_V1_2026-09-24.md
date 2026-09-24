# NEXO CLEAN ARCHITECTURE — A13 TECHNOLOGY-INDEPENDENT DEPLOYMENT MAPPING V1 — 2026-09-24

Status: ARCHITECTURE / DEPLOYMENT DESIGN
Implementation: NOT STARTED
Technology selection: NOT STARTED

## Purpose

A13 maps the semantic architecture into deployable trust and failure domains without choosing a specific vendor, database, cloud, language or framework.

NIST SP 800-160 treats trustworthy engineering as a system-of-systems lifecycle problem and emphasizes architecture, requirements, implementation, verification and validation across the lifecycle. The deployment design therefore preserves semantic boundaries rather than allowing deployment topology to redefine them. citeturn0search0turn0search2

## A13.1 Deployment zones

### D0 Trust foundation

Contains:
- boot/trust assumptions;
- cryptographic primitives;
- identity/attestation interface;
- protected host/runtime assumptions.

Rule:
D0 must not inherit authority from the planner or executor.

### D1 Protected authority core

Contains only:
- AuthorityContext validation;
- EffectBinding;
- protected transition ordering;
- fencing;
- STOP enforcement interface;
- recovery fence;
- VersionSet admission;
- critical evidence validity gate;
- decommission fence.

D1 is the primary safety TCB boundary.

### D2 Control/semantic plane

Contains:
- mission;
- goals;
- planner;
- model;
- memory;
- policy interpretation;
- coordination proposals;
- UI;
- analytics.

D2 can request/propose but cannot directly mutate D1 protected state.

### D3 Execution plane

Contains:
- normal executors;
- adapters;
- external API clients;
- device controllers.

D3 receives only admitted effect identities and current execution capabilities.

D3 cannot:
- grant authority;
- clear STOP;
- release recovery;
- rewrite EffectBinding;
- resolve UNKNOWN by declaration.

### D4 Observation/reconciliation plane

Contains:
- sensors;
- telemetry;
- provider responses;
- reconciliation workers;
- evidence production.

D4 produces candidate observations/evidence. It does not unilaterally accept its own evidence as a safety claim.

### D5 External world

Contains:
- physical systems;
- remote services;
- humans;
- third-party providers;
- external state.

D5 is not assumed to obey Nexo's internal transaction semantics.

## A13.2 Deployment trust boundaries

TB-D01 D0→D1:
identity/trust boundary.

TB-D02 D2→D1:
proposal-to-authority boundary.

TB-D03 D1→D3:
authorized-effect boundary.

TB-D04 D3→D5:
external-effect boundary.

TB-D05 D5/D3→D4:
observation boundary.

TB-D06 D4→D1:
evidence acceptance boundary.

TB-D07 Change/update→D1:
VersionSet activation boundary.

TB-D08 Recovery→D1:
recovery release boundary.

TB-D09 Decommission→all domains:
anti-resurrection boundary.

## A13.3 Failure-domain rule

Deployment separation only counts as independence when failure domains actually differ.

Separate containers on one kernel are not independent.
Separate processes on one host are not independent.
Separate services sharing one identity provider are not fully independent.
Separate replicas sharing one storage system are not independent.
Two verifiers sharing one compromised data source are not independent evidence.

The deployment model records:
hardware domain,
host domain,
kernel/runtime domain,
storage domain,
network domain,
identity domain,
trust-root domain,
policy/config domain,
artifact/build domain,
operator/admin domain,
model/provider domain,
data-source domain,
observability domain,
coordination domain,
recovery domain.

## A13.4 Protected-core deployment rule

D1 may be physically replicated, but semantic authority remains one protected ordering domain for each scope.

Replication must preserve:
- one authoritative ordering semantics;
- fencing;
- epoch/generation correctness;
- durable P0 state;
- anti-rollback;
- anti-resurrection;
- STOP state;
- recovery fence;
- VersionSet integrity.

Replication count is not itself an assurance argument.

## A13.5 Control-plane degradation

D2 may fail while D1 remains safe.

Required behavior:
- existing protected semantics remain enforced;
- new proposals may be rejected or queued;
- no stale planner state grants authority;
- execution does not infer permission from cached D2 state.

This creates graceful degradation without authority leakage.

## A13.6 Execution-plane degradation

D3 may fail:
- before effect intent;
- after intent;
- during external attempt;
- after external response but before observation.

The protected state must distinguish these cases.

A D3 crash after external intent can produce UNKNOWN.
A D3 crash before intent cannot be used to infer an external effect.

## A13.7 Observation-plane degradation

D4 failure cannot create positive or negative world claims.

If critical observation is unavailable:
- claim becomes unsupported;
- release may be blocked;
- reconciliation may remain pending.

Missing telemetry is not automatically NOT_APPLIED.

## A13.8 Recovery deployment

Recovery components must not share unrestricted authority with ordinary execution.

At minimum:
- recovery ownership is distinct;
- recovery state is protected;
- release is explicit;
- old execution fences remain enforced;
- rollback cannot erase UNKNOWN;
- restored snapshots require current-context validation.

## A13.9 Update deployment

A deployment update is modeled as a VersionSet transition, not merely an image replacement.

Required sequence:

PROPOSE
→ IDENTIFY
→ VERIFY INTEGRITY/PROVENANCE
→ DEPENDENCY CLOSURE
→ SEMANTIC COMPATIBILITY
→ SAFETY DELTA
→ INDEPENDENT ADMISSION
→ STAGE
→ FENCE OLD CONTEXT
→ ACTIVATE
→ VERIFY
→ RECONCILE
→ COMMIT

The exact mechanism remains open.

## A13.10 Observability deployment

Observability is outside the authority path unless a specific signal is promoted through the evidence contract.

Logging does not itself prove:
- event ordering;
- effect occurrence;
- STOP enforcement;
- external cancellation;
- world truth.

Critical traces must carry operation/effect/context/fence/version provenance.

## A13.11 Data placement rules

P0:
protected authority, fences, STOP/recovery state, exact effect identity, critical VersionSet and anti-resurrection state.

P1:
reconciliation, evidence, audit and recovery diagnostics.

P2:
caches, indexes, analytics and convenience data.

A lower tier cannot overwrite a higher-tier semantic state.

## A13.12 Deployment anti-patterns

Forbidden as architectural shortcuts:

1. Planner directly writes executor command state.
2. Executor directly writes authorization state.
3. UI directly clears STOP.
4. Recovery process directly grants normal authority.
5. Audit log is treated as authority.
6. Cache is treated as current authority.
7. Telemetry absence is treated as negative evidence.
8. New deployment version silently changes safety semantics.
9. Snapshot restore silently restores authority.
10. Replicas are called independent without failure-domain analysis.
11. A second verifier is called independent while sharing the same decisive dependency.
12. Process restart is treated as reauthorization.

## A13.13 Technology-selection criteria

Any concrete technology must demonstrate, against its exact configuration:

- atomic/serialized transition semantics required by each LP;
- durable P0 guarantees;
- stale-writer fencing;
- snapshot/rollback behavior;
- failure recovery;
- partition behavior;
- observability without authority leakage;
- identity integration;
- VersionSet integrity;
- migration behavior;
- backup/restore semantics;
- common-mode dependencies;
- reproducible evidence.

Technology is selected after semantic fit, not before.

## A13.14 Deployment-to-formal correspondence

Every deployed component must map to:
- abstract state it contributes to;
- abstract actions it implements;
- auxiliary state;
- failure modes;
- trust boundary;
- dependency closure;
- failure domain;
- evidence source.

No component may acquire a semantic role merely because it exists in the deployment.

## A13.15 A13 result

Deployment zones: DEFINED
Trust boundaries: DEFINED
Failure domains: DEFINED
Degradation behavior: DEFINED
Recovery/update deployment contracts: DEFINED
Technology choice: BLOCKED

Next:
A14 complete architecture self-audit and closure matrix.
