# NEXO CANONICAL OBJECT × OWNERSHIP × AUTHORITY × MUTABILITY × PERSISTENCE MATRIX V1
Date: 2026-09-24
Status: RESEARCH/CONSOLIDATION — ARCHITECTURE STILL BLOCKED

## External basis
NASA treats configuration identification, traceability, change control, and configuration audits as lifecycle controls; NASA also distinguishes verification from validation and requires end-to-end/system-level V&V. This supports treating object identity, ownership, baseline/version context, and evidence as first-class architecture concerns rather than implementation details. citeturn0search3turn0search4turn0search26

## 1. Canonical object matrix

| Object | Authoritative owner | Who may create | Who may mutate | Persistence | Authority implied? | Critical dependencies |
|---|---|---|---|---|---|---|
| Operation | Mission/control plane | admitted request path | lifecycle transition protocol | durable | No | authority, policy, effect binding |
| EffectBinding | admission boundary | authorized admission | immutable after bind | durable | No | operation, target identity, normalized params |
| AuthorityContext | authority domain | authority issuer | governed authority transition | durable/versioned | Yes, bounded | identity, policy, trust root, time |
| ControlLease | coordination domain | coordination protocol | linearizable lease protocol | durable or recoverable | No | identity, coordination store, clock |
| EvidenceRecord | evidence domain | observer/collector | lifecycle transition only | durable | No | observer, provenance, freshness, dependency graph |
| VerifiedClaim | verification domain | verifier | derived/recomputed | durable evidence reference | No | exact evidence, policy/invariant version |
| RecoveryFence | recovery domain | recovery protocol | recovery transition protocol | durable | No | stop epoch, authority epoch, artifact/config |
| StopState | independent stop domain | stop authority/path | stop protocol | durable | Safety-specific | independent enforcement path |
| VersionSet | configuration domain | change authority | controlled configuration transaction | durable | No | artifact provenance, dependency closure |
| PolicyBaseline | policy/safety domain | policy authority | governed change | durable/versioned | Defines policy | trust root, change authority |
| InvariantBaseline | safety/formal domain | safety authority | governed change | durable/versioned | Defines protected properties | formal model, verification |
| ProofStatus | verification pipeline | derived process | derived only | durable evidence | No | obligation graph, toolchain/context fingerprint |
| DependencyGraph | assurance domain | build/runtime discovery | controlled update | durable/versioned | No | provenance, runtime inventory |
| ReconciliationRecord | reconciliation domain | reconciliation owner | append/transition protocol | durable | No | external observation, effect identity |
| Checkpoint | recovery/history domain | controlled persistence path | immutable snapshot | durable | No | state version, schema, provenance |
| MigrationRecord | migration authority | migration protocol | controlled lifecycle | durable | No | source/target schema, semantic checks |
| Delegation | authority domain | authorized delegator | governed revoke/expiry | durable/versioned | Bounded child authority | parent authority, scope, expiry |
| DecommissionRecord | lifecycle authority | decommission authority | lifecycle closure protocol | durable | Terminates authority | effects, workers, leases, secrets |

## 2. Authority implications

Only these object classes may directly participate in granting or constraining authority:
- Trust/identity state
- AuthorityContext
- Policy/Invariant baseline
- Delegation
- Emergency-stop state
- RecoveryFence where explicitly scoped to recovery authority

The following must NOT grant authority merely by existing:
- Operation
- EffectBinding
- EvidenceRecord
- VerifiedClaim
- Checkpoint
- Lease
- Metric/reward
- Model output
- Telemetry
- Update artifact
- Proof cache

## 3. Mutability rule

Immutable after binding:
- EffectBinding
- operation fingerprint
- target fingerprint
- critical evidence identity
- checkpoint content
- historical audit records

Versioned rather than overwritten:
- AuthorityContext
- PolicyBaseline
- InvariantBaseline
- VersionSet
- DependencyGraph
- Delegation

Derived rather than manually set:
- ReleaseEligibility
- ProofStatus
- assurance ceiling
- affected-claim set where computable from dependency graph

Mutable only through protected transition:
- Operation lifecycle
- ControlLease
- StopState
- RecoveryFence
- ReconciliationRecord
- MigrationRecord

## 4. Persistence classes

P0 — must survive restart for safety semantics:
- authority revocation/version context;
- stop state/stop epochs;
- unresolved critical external-effect identity/state;
- decommission state;
- critical audit/evidence needed to prevent unsafe replay.

P1 — must survive or be reconstructable with integrity:
- operation lifecycle;
- EffectBinding;
- RecoveryFence;
- VersionSet;
- Policy/Invariant baselines;
- Delegations;
- migration state.

P2 — reconstructable/non-authoritative:
- planner caches;
- optimization state;
- convenience telemetry;
- derived analytics.

A P2 loss cannot silently alter a P0/P1 safety decision.

## 5. Hidden authority channels to prohibit

H-01 checkpoint restoration creates authority.
H-02 lease possession creates mission permission.
H-03 proof cache creates proof truth.
H-04 model confidence creates authorization.
H-05 metric improvement creates release.
H-06 telemetry presence creates world truth.
H-07 update signature creates safety admission.
H-08 restart creates fresh delegation.
H-09 process ownership creates policy authority.
H-10 recovery ownership creates execution authority.
H-11 evidence storage location creates evidence validity.
H-12 version number alone creates compatibility.

## 6. Cross-object invariants

OBJ-01: EffectBinding cannot be mutated after authorization without creating a new governed operation/effect identity.
OBJ-02: AuthorityContext cannot be derived from Operation, Lease, Evidence, Checkpoint or Model output.
OBJ-03: ReleaseEligibility is derived only from current canonical inputs.
OBJ-04: Evidence validity depends on exact claim/effect/context/freshness/dependency binding.
OBJ-05: RecoveryFence cannot clear an emergency stop without explicit release authority.
OBJ-06: ControlLease cannot establish external-world truth.
OBJ-07: Checkpoint restoration cannot restore expired/revoked authority.
OBJ-08: Policy/Invariant/Version changes invalidate affected derived decisions.
OBJ-09: Decommissioning invalidates active delegations and prevents resurrection.
OBJ-10: Historical evidence remains historical; it does not become current merely by replay.
OBJ-11: Cross-object references must identify exact version/epoch where semantics are safety-relevant.
OBJ-12: No object may acquire authority solely by being persisted.

## 7. Cross-store atomicity problem

The matrix exposes a central implementation problem:

A protected transition may need to update:
- Operation lifecycle;
- ControlLease;
- Authority epoch/context;
- Effect state;
- Evidence/reconciliation state.

If these live in independent stores, ordinary multi-step writes can create inconsistent intermediate states.

Therefore the architecture must choose and prove one of:
1. a single linearizable authoritative state machine;
2. a transaction mechanism with sufficient atomicity;
3. a protocol with explicit fencing/idempotency/reconciliation whose safety properties are formally demonstrated.

A sequence of successful API calls is not automatically equivalent to an atomic transition.

Status: OPEN.

## 8. Evidence invalidation propagation

When any material context changes, the system must determine affected evidence/claims:
- authority epoch/revocation;
- policy/invariant version;
- dependency/trust root;
- artifact/version set;
- observer trust;
- freshness deadline;
- target/effect identity;
- world-state assumptions.

Required semantic flow:

CONTEXT_CHANGE
→ IMPACT_ANALYSIS
→ EVIDENCE_INVALIDATION/STALE
→ CLAIM_REEVALUATION
→ RELEASE_ELIGIBILITY_RECOMPUTATION
→ HOLD/RESTRICT/REVALIDATE if required

No old positive result should remain authoritative merely because its stored status says PASS.

## 9. New open gates

1. Decide authoritative state-store topology.
2. Define exact linearization point for each protected cross-object transition.
3. Define durability guarantees for P0/P1 state.
4. Define evidence invalidation propagation mechanism.
5. Define object schema versioning and migration semantics.
6. Define multi-agent ownership and fencing.
7. Define independent implementation/verification boundaries for TCB.
8. Define exact decommission proof obligations.
9. Define external reconciliation trust chain.
10. Execute formal and runtime tests against the resulting contracts.

## 10. Conclusion
The object matrix exposes a likely architectural principle:

The clean architecture should be organized around **authoritative state and protected transitions**, not around traditional software feature modules.

Feature modules can propose work, compute plans, collect observations and provide evidence. They must not silently become authorities because they own a process, store a record, hold a lease, or produce a model result.

Architecture construction remains BLOCKED until the cross-store atomicity, durability, invalidation and TCB gates are resolved.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.
