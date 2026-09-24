# NEXO ATOMICITY / CONSISTENCY DEPENDENCY GRAPH V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. Architecture remains blocked.

## 1. Research basis

NIST SP 800-160 Rev. 1 treats trustworthy secure-system engineering as a lifecycle systems-engineering problem, emphasizing requirements, architecture, implementation, integration, verification and validation rather than isolated security mechanisms. NIST SP 800-160 Vol. 2 Rev. 1 frames cyber resilience around anticipating, withstanding, recovering and adapting to adverse conditions. These principles support analyzing Nexo as a graph of protected state transitions, dependencies and failure boundaries rather than assuming any individual store, lease or transaction is sufficient. citeturn0search0turn0search3

## 2. Graph rule

For every safety-relevant transition:

STATE VARIABLE → OWNER → READ SET → WRITE SET → ATOMICITY BUNDLE → LINEARIZATION/PROTOCOL → FAILURE MODES → RECOVERY → EVIDENCE → CLAIM

A dependency edge is safety-critical when stale, missing, reordered, duplicated or corrupted information can create authority, clear a safety fence, erase UNKNOWN, or produce a false verified-world claim.

## 3. Canonical dependency graph

### Trust / identity
TrustRoot
→ Identity
→ AuthorityContext

TrustRoot also constrains:
→ VersionSet
→ Evidence provenance
→ Recovery admission
→ Update admission

Therefore trust-root changes invalidate affected downstream assurance; they are not ordinary configuration changes.

### Authority
AuthorityContext
→ Authorization Admission B1
→ Reservation B2
→ Final Execution Gate B3
→ Recovery Release B9
→ Decommission

PolicyBaseline + InvariantBaseline
→ Authority validation
→ Execution gate
→ Verification
→ Update activation

Authority does NOT derive from:
Lease, EvidenceRecord, ModelOutput, Metric, Checkpoint, Telemetry, ProofCache.

### Coordination
Authorization
→ ControlLease/Fence
→ Final Execution Gate

ControlLease/Fence
→ stale-owner prevention

ControlLease does NOT imply:
Authorization
World truth
Recovery authority

### Safety plane
StopState
→ Final Execution Gate
→ Recovery Release

StopState is an independent safety dependency and cannot be subordinate to normal execution.

RecoveryFence
→ Final Execution Gate
→ Recovery Release

RecoveryFence cannot manufacture AuthorityContext.

### Configuration
VersionSet
→ Authorization
→ Final Execution Gate
→ Verification
→ Update activation
→ Recovery

Material VersionSet change
→ impact analysis
→ invalidate affected derived decisions
→ revalidation

### Evidence / verification
External effect
→ Observation
→ EvidenceRecord
→ Verification
→ Release/Commit

Evidence validity depends on:
Effect identity
Target
Observer
Freshness
Provenance
Dependency closure
Policy/invariant versions
Configuration/version context
Authority context where applicable

Verification depends on current context; it is not a permanent property of an old evidence record.

### External effects
EffectBinding
→ Durable Effect Intent
→ External Attempt
→ {APPLIED | PARTIALLY_APPLIED | UNKNOWN | NOT_APPLIED}
→ Observation
→ Reconciliation
→ VerifiedClaim

External attempt does NOT directly produce:
VerifiedClaim
Committed mission outcome

Timeout/crash/partition
→ UNKNOWN
→ durable identity retention
→ reconciliation

New operation_id cannot resolve an old UNKNOWN.

### Recovery
Restart
→ Quarantine
→ Identity/Artifact/Config verification
→ Current Fence
→ Current Authority
→ Recovery Owner
→ Reconciliation
→ Release Eligibility
→ Explicit Release
→ Execution

Checkpoint
→ state restoration only
NOT → authority restoration

### Update
Update artifact
→ identity/hash/provenance/signature
→ dependency closure
→ semantic compatibility
→ safety-property delta
→ common-mode review
→ independent admission
→ staging
→ old-version fencing
→ activation
→ control-plane verification
→ world reconciliation
→ commit

Signature validity is not semantic safety.

### Decommission
Decommission request
→ effect fencing
→ authority revocation
→ delegation revocation
→ worker termination
→ lease closure
→ pending-effect reconciliation
→ secret handling
→ recovery/update closure
→ final state

Final DECOMMISSIONED
cannot be reached while unresolved resurrection or effect paths remain.

## 4. Critical graph cuts

The following are identified as architectural cut sets: if their protection fails, multiple guarantees can fail simultaneously.

### CUT-01 — Trust root / identity
Affects authority, updates, recovery, evidence provenance.

### CUT-02 — Authority linearization
Affects authorization, execution, recovery release, decommission.

### CUT-03 — Final execution gate
Affects actual protected actuation.

### CUT-04 — Stop enforcement
Affects emergency containment independently of normal execution.

### CUT-05 — Effect identity
Affects retry safety, UNKNOWN preservation, reconciliation and verification.

### CUT-06 — Version-set integrity
Affects policy, verifier, safety gate, recovery and execution compatibility.

### CUT-07 — Evidence validity/invalidation
Affects verification and release.

### CUT-08 — Recovery fence
Affects restart and resurrection prevention.

### CUT-09 — External reconciliation authority
Affects conversion from UNKNOWN/observed state to verified world claim.

### CUT-10 — Decommission closure
Affects whether supposedly terminated identities can retain authority/effects.

These cuts must later receive explicit failure-domain and common-mode analysis.

## 5. Race-to-bundle mapping

| Race | Primary bundle | Required protection |
|---|---|---|
| Authorize ↔ Revoke | B1 | same authority linearization |
| Reserve ↔ Reserve | B2 | fencing generation |
| Reserve ↔ Revoke | B2/B1 | authority + reservation serialization |
| Execute ↔ Stop | B3/B8 | stop-dominant final gate |
| Execute ↔ LeaseExpiry | B2/B3 | stale-owner fencing |
| Takeover ↔ OldOwner | B2 | generation/fence |
| Commit ↔ Revoke | B7/B14 | historical semantics + current authority |
| Verify ↔ PolicyChange | B7 | invalidation/re-evaluation |
| EvidenceWrite ↔ Invalidation | B7 | protected evidence versioning |
| Retry ↔ ExternalEffect | B4/B5 | stable effect identity/idempotency |
| Timeout ↔ Response | B5 | UNKNOWN |
| Recovery ↔ UNKNOWN | B6/B9 | reconciliation before release |
| Update ↔ Execute | B3/B10 | VersionSet + old-version fencing |
| Rollback ↔ UNKNOWN | B5/B10 | no unsafe automatic resolution |
| Decommission ↔ Restart | B11/B9 | closure fence |
| Delegation ↔ Revoke | Authority/B11 | current authority serialization |
| ConfigActivation ↔ Evidence | B7/B10 | context invalidation |
| DependencyChange ↔ Release | B7/B10 | dependency closure |
| ClockChange ↔ Lease | B2 | trusted-time assumptions |
| SnapshotRestore ↔ Delegation | Authority/B11 | snapshot cannot resurrect authority |

## 6. New critical observation

The graph exposes three different consistency domains:

### C1 — Authority consistency
Question: “May this actor perform this exact effect now?”

Requires strong current-context semantics.

### C2 — Coordination consistency
Question: “Which actor currently owns the right to coordinate this transition?”

Lease/fence semantics answer this, not authority.

### C3 — World-truth consistency
Question: “What actually happened outside Nexo?”

Cannot be established by C1 or C2. Requires external observation and reconciliation.

Therefore:

AUTHORITY ≠ COORDINATION ≠ WORLD TRUTH

Combining them in one state variable would create a hidden authority channel.

## 7. New invariant family

GRAPH-ATOM-01: every protected transition has an explicit dependency path to all safety-critical inputs.

GRAPH-ATOM-02: no dependency edge may silently grant authority merely because its state is present.

GRAPH-ATOM-03: authority, coordination and world truth remain separate consistency domains.

GRAPH-ATOM-04: every critical graph cut has an identified owner, failure mode and recovery behavior.

GRAPH-ATOM-05: material context changes propagate invalidation to affected derived claims.

GRAPH-ATOM-06: external UNKNOWN propagates through recovery and release until reconciled.

GRAPH-ATOM-07: stale actors cannot cross a protected graph cut after fencing/revocation.

GRAPH-ATOM-08: a dependency unavailable during a protected decision produces DENY/HOLD/RESTRICT rather than silent fallback.

GRAPH-ATOM-09: graph diversity does not imply independence; common-mode dependencies remain explicit.

GRAPH-ATOM-10: every external-boundary edge preserves exact effect identity.

## 8. Architecture consequence

The clean architecture should not be a stack alone. It needs:

1. object domains;
2. state machines;
3. atomicity bundles;
4. dependency graph;
5. failure-domain graph;
6. authority graph;
7. evidence/provenance graph;
8. lifecycle/change graph.

The architecture is therefore better modeled as a constrained multi-graph whose nodes are canonical state objects and whose edges are typed dependencies.

## 9. Next research gate

Before choosing the final storage/topology model:

- complete variable-to-bundle coverage;
- derive all read/write conflicts automatically;
- map every race to graph edges;
- overlay common-mode failure domains;
- identify which graph cuts require independence;
- define availability behavior when a cut dependency is unavailable;
- determine whether each cut needs single-store atomicity or an equivalent protocol;
- map the graph to the unified formal model;
- then compare topology A/B/C against the actual graph.

No implementation or V21 runtime construction is authorized.