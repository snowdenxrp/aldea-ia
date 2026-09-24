# NEXO ARCHITECTURE TOPOLOGY COMPARISON V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No topology selected. No V21 implementation.

## 1. Research basis

NIST SP 800-160 Rev. 1 treats security architecture as a system-level partitioning/trust problem and requires security functions to be defined across system states, modes, conditions, and transitions. NIST SP 800-160 Vol. 2 Rev. 1 emphasizes partitioning, controlled interfaces, and limiting shared resources to contain compromise and failure propagation. Therefore topology must be evaluated by protected claims, trust relationships, failure domains, and transition semantics—not by database count or process count alone.

## 2. Candidates

A — SINGLE AUTHORITATIVE STATE MACHINE
One canonical protected state machine/store provides the serialization point for safety-critical state.

B — PARTITIONED AUTHORITATIVE STORES + TRANSACTIONAL COMMIT
Multiple stores own different state domains; protected cross-domain transitions use an explicit transactional protocol.

C — PARTITIONED STORES + FENCING/EPOCHS/IDEMPOTENCY/RECONCILIATION
Multiple stores communicate through explicit fencing, epochs, durable intent, idempotency and reconciliation rather than assuming universal distributed atomicity.

These are architectural hypotheses, not implementations.

## 3. Evaluation dimensions

Each topology is evaluated against:
- claim-specific TCB;
- atomicity bundles B1-B11;
- protected transitions;
- race/interleaving inventory;
- crash/timeout semantics;
- partition semantics;
- stale-owner prevention;
- external-effect UNKNOWN;
- recovery;
- update/rollback;
- evidence invalidation;
- decommission;
- common-mode concentration;
- formalization burden;
- implementation verification burden.

## 4. A — Single authoritative state machine

### Natural strengths

A can make many internal protected transitions easier to serialize because a single authority can define the ordering of authorization, reservation, execution admission, revocation, stop state, recovery state and configuration activation.

It can reduce the number of cross-store atomicity protocols.

### Natural weaknesses

The central state machine becomes a large trust concentration.

Potential common-mode domains:
- state-store runtime;
- storage;
- host;
- trust root;
- policy/config;
- clock;
- recovery path;
- administration.

If one compromised mechanism can rewrite multiple safety domains, the TCB becomes broad.

### External effects

A cannot make an external world atomic merely because internal state is centralized.

After external request followed by crash/timeout, the state can still be UNKNOWN.

A therefore still needs exact EffectBinding, durable intent, idempotency and reconciliation.

### Recovery

Recovery is simpler only if the centralized store itself is trustworthy and recoverable.

If the store is corrupted or rolled back, recovery must not infer authority from restored state.

### Formal burden

Potentially lower for internal serialization.

Still requires modeling:
- external UNKNOWN;
- recovery;
- evidence freshness;
- common-mode failure;
- updates;
- decommission.

### Main architectural risk

centralized consistency → concentrated trust.

## 5. B — Partitioned authoritative stores + transactional commit

### Natural strengths

State ownership can align with semantic boundaries:
- authority;
- coordination;
- evidence;
- external reconciliation;
- configuration;
- recovery.

This can reduce the amount of state any one component must trust.

### Natural weaknesses

Cross-store transactions become safety-critical mechanisms.

A failure can occur after one participant commits but another does not.

Therefore transaction protocol correctness becomes part of the TCB for every claim crossing those boundaries.

### Required semantics

Every cross-domain protected transition needs:
- participant set;
- read/write set;
- commit/abort semantics;
- durable intent;
- crash recovery;
- fencing;
- retry semantics;
- timeout semantics;
- idempotency;
- evidence ordering.

### Formal burden

Higher than A because distributed atomicity must be modeled.

A correct transaction protocol can nevertheless reduce semantic coupling if the boundaries are well chosen.

### Main architectural risk

distributed ownership → distributed atomicity complexity.

## 6. C — Partitioned stores + fencing/epochs/idempotency/reconciliation

### Natural strengths

This topology does not pretend that all domains can be made atomically identical.

It explicitly represents:
- authority;
- coordination;
- external world;
- UNKNOWN;
- stale actors;
- reconciliation;
- fencing.

This aligns naturally with the existing Nexo semantic distinctions:
AUTHORITY ≠ COORDINATION ≠ WORLD TRUTH.

It can preserve safety under partial failure by refusing to infer unavailable facts.

### Natural weaknesses

Protocol complexity becomes substantial.

Safety depends on correct implementation of:
- epochs;
- fencing;
- effect identity;
- durable intent;
- retry/idempotency;
- reconciliation;
- evidence invalidation;
- takeover;
- recovery.

These mechanisms themselves become TCB elements.

### External effects

C explicitly acknowledges that external atomicity is not controlled by Nexo.

This makes:
APPLIED | NOT_APPLIED | UNKNOWN | PARTIALLY_APPLIED
a first-class contract rather than an exceptional error.

### Recovery

Recovery must reconcile the exact effect identity before release.

No restart, lease expiry or new operation ID resolves UNKNOWN.

### Formal burden

Highest.

The model must cover:
- multiple stores;
- epochs;
- fencing;
- crash windows;
- stale actors;
- partial commits;
- external UNKNOWN;
- reconciliation;
- recovery;
- update;
- evidence invalidation.

### Main architectural risk

distributed protocol complexity → verification/implementation burden.

## 7. Comparative matrix

| Dimension | A: Single State | B: Transactional Stores | C: Fencing/Reconciliation |
|---|---|---|---|
| Internal serialization | centralized | transactional | protocolized |
| Cross-store atomicity | low need | explicit | deliberately limited |
| TCB concentration | high | medium/distributed | distributed but protocol-heavy |
| External atomicity | impossible | impossible | explicitly modeled |
| UNKNOWN handling | required | required | first-class |
| Stale actor fencing | centralized state can help | protocol required | explicit epochs/fences |
| Recovery complexity | medium | high | high |
| Common-mode visibility | potentially high | partitionable | partitionable |
| Formal complexity | lower internally | high | highest |
| Runtime protocol complexity | lower | high | high |
| Risk of hidden coupling | high if central | high at transaction layer | high if protocol semantics incomplete |
| Failure semantics | centralized | partial commit/abort | explicit partial/unknown |
| Evidence/reconciliation | still required | still required | core mechanism |
| Update complexity | medium | high | high |
| Decommission | centralized coordination | distributed closure | distributed closure + fencing |

This matrix is descriptive. It does not select a winner.

## 8. Important finding: A/B/C are not mutually exclusive

The research indicates the final architecture may combine their properties.

Possible pattern:
- a small strongly authoritative protected core for critical linearization;
- partitioned semantic stores outside that core;
- explicit fencing/epochs across domains;
- external effects handled through identity + durable intent + reconciliation;
- independent stop/recovery boundaries;
- claim-specific TCB rather than one universal TCB.

This is a hypothesis only. It must not be promoted to architecture until the remaining gates are closed.

## 9. TCB comparison

A:
Largest concentration of authority/linearization risk.

B:
Smaller local trust domains, but transaction protocol becomes a cross-domain TCB.

C:
Small semantic domains are possible, but fencing/reconciliation protocol becomes a major cross-domain TCB.

Thus:
smaller store ≠ smaller TCB
and
more stores ≠ more security.

The relevant metric is:
claim protection capability / trusted semantics / common-mode exposure.

## 10. Failure interpretation

Crash before protected linearization:
All topologies should reject or retry according to durable intent rules; no ambiguous authority may be inferred.

Crash after external request:
All topologies must preserve UNKNOWN unless independently reconciled.

Revoke concurrent with authorization:
All topologies require a defined linearization ordering.

Stop concurrent with execution:
All topologies require the final execution gate to recognize the current stop fence.

Restart after stop:
All topologies require quarantine and explicit recovery release.

Store rollback:
All topologies require epoch/version protection against resurrection of stale authority.

Dependency compromise:
All topologies require claim-specific TCB/common-mode invalidation.

## 11. New architecture gate

Before selecting A/B/C or hybridizing them, we must produce:

TOPOLOGY
→ STATE OWNERS
→ READ/WRITE SETS
→ ATOMICITY BUNDLES
→ LINEARIZATION/PROTOCOL
→ FAILURE DOMAINS
→ TCB CLOSURE
→ EVIDENCE
→ RECOVERY
→ UPDATE
→ DECOMMISSION
→ FORMAL MODEL
→ IMPLEMENTATION TEST PLAN.

Any topology that cannot complete this chain remains a research candidate.

## 12. Current conclusion

No candidate has been selected.

The research does establish three facts:

1. A cannot make external effects atomic by centralizing internal state.
2. B moves safety into distributed transaction semantics.
3. C makes partial failure and UNKNOWN explicit, but transfers substantial trust into fencing/reconciliation protocols.

Therefore the next research gate is not “pick A, B or C.”

It is:

derive the minimum authoritative core and determine which semantics must cross its boundary.

That is the point at which a hybrid topology can be evaluated without prematurely designing V21.

Architecture remains blocked.