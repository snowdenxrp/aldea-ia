# NEXO LINEARIZATION PROTOCOL OPTIONS AND IMPLEMENTATION CORRESPONDENCE V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation and no protocol selected.

## 1. Research basis

NIST SP 800-160 Rev. 1 frames trustworthy system engineering as a lifecycle discipline and emphasizes that security is a system property requiring rigorous requirements, architecture, verification and validation. NIST IR 8460 describes state-machine replication/consensus as a way to emulate a centralized service in a fault-tolerant distributed setting, while highlighting the security and performance considerations of those protocols. NIST material on secure states also distinguishes secure, insecure and indeterminate states, supporting conservative handling when protocol state cannot be established. citeturn0search1turn0search0turn0search19

These sources inform the comparison; they do not prescribe Nexo's implementation.

## 2. Protocol candidates

P1 — Compare-and-swap / atomic conditional update.
P2 — Serializable transaction / database transaction.
P3 — Consensus-backed replicated state machine.
P4 — Epoch/fencing protocol.
P5 — Hybrid protected-core protocol combining a small authoritative state machine with conditional writes, durable epochs/fences and explicit external reconciliation.

No selection is final.

## 3. P1 — Compare-and-swap

Concept:

READ current_version
→ compare expected_version
→ conditional WRITE
→ success/failure.

Strengths:
- simple primitive;
- explicit linearization point if the underlying primitive is truly atomic;
- low conceptual overhead;
- excellent for single authoritative object transitions.

Limitations:
- CAS on one object does not atomically update multiple independent objects;
- application-level read sets can become stale between reads and commit;
- replication semantics matter;
- ABA/reuse hazards require non-reusable versioning;
- a CAS success does not establish external-world truth.

Safety requirement:
the primitive must be linearizable for the authoritative object and its version/fence must be durable enough for the required crash model.

## 4. P2 — Serializable transaction

Concept:

BEGIN
→ read/write set
→ SERIALIZABLE COMMIT
→ linearization at commit/serialization point.

Strengths:
- natural multi-object atomicity inside one authoritative store;
- conflict detection;
- simpler implementation mapping when storage provides a real serializable guarantee;
- useful for authorization + effect + fence bundles.

Limitations:
- serialization applies only to the transaction's consistency domain;
- distributed stores may weaken or change guarantees;
- transaction commit does not make external effects atomic;
- failover/storage recovery semantics become part of the trust argument;
- transaction isolation must be explicitly verified rather than assumed from product labels.

Critical distinction:
SERIALIZABLE TRANSACTION != SYSTEM-WIDE LINEARIZABILITY.

## 5. P3 — Consensus-backed state machine

Concept:

clients submit commands
→ replicas agree on ordered command
→ deterministic state-machine transition
→ committed sequence.

Strengths:
- explicit total ordering for the replicated state machine;
- crash/failure tolerance depending on protocol assumptions;
- clean formal abstraction;
- maps naturally to protected transition commands.

Limitations:
- consensus protocol and implementation become TCB;
- quorum/identity/trust-root/common-mode assumptions are critical;
- availability under partition is constrained by consistency/failure model;
- deterministic state-machine requirements can constrain design;
- does not make external effects atomic.

NIST IR 8460 describes SMR as emulating a centralized service by having distributed processes agree on client commands, illustrating the exact benefit and cost relevant here. citeturn0search0

## 6. P4 — Epoch/fencing

Concept:

AUTHORITY/FENCE = epoch E

Actor executes only if:
actor_epoch == current_epoch
and fence is current.

Revocation/reauthorization increments or replaces protected fencing context.

Strengths:
- stale workers can be rejected without synchronously updating every worker;
- useful across process/store boundaries;
- naturally supports invalidation;
- compact semantic mechanism;
- good fit for stale-owner and restart problems.

Limitations:
- fence verification must exist at every protected execution boundary;
- the epoch source must itself be authoritative;
- fencing does not serialize arbitrary multi-object mutations;
- does not by itself provide external-world truth;
- rollback/reuse protection is essential.

Key result:
FENCING can replace synchronous fan-out for stale-actor prevention, but cannot replace all atomicity.

## 7. P5 — Hybrid protected core

Concept:

SMALL AUTHORITATIVE CORE
= protected state machine/conditional transactions
+ durable epochs/fences
+ exact EffectBinding
+ STOP/Recovery fences
+ VersionSet admission.

Outside:
partitioned semantic stores.

External:
effect boundary + reconciliation.

Strengths:
- confines strongest consistency to the smallest semantic surface;
- fencing handles stale distributed actors;
- core transactions handle multi-variable protected transitions;
- external UNKNOWN remains explicit;
- formal model can focus on a bounded protected state machine.

Costs:
- interface contracts become safety-critical;
- hybrid protocol has more moving parts than a single store;
- core must have durable recovery semantics;
- every external caller must be prevented from bypassing the core;
- formal/runtime correspondence burden remains significant.

This is a candidate architecture pattern, not a final decision.

## 8. Protocol capability matrix

| Property | CAS | Serializable TX | Consensus SMR | Epoch/Fence | Hybrid |
|---|---|---|---|---|---|
| Single-object linearization | Yes, if primitive is linearizable | Yes within store | Yes at committed command | Not by itself | Yes in core |
| Multi-object atomicity | Limited | Strong within domain | State-machine transition | Limited | Strong in core |
| Cross-process stale actor fencing | Limited | Limited | Possible | Strong | Strong |
| Partition tolerance | Conservative | Store-dependent | Protocol-dependent | Strong for stale rejection | Conservative core |
| External effect atomicity | No | No | No | No | No |
| UNKNOWN support | Yes by application | Yes by application | Yes by state machine | Yes | First-class |
| Protocol TCB | Small primitive | DB/transaction semantics | Consensus + replication | Fence authority | Core + fence |
| Formal complexity | Low/medium | Medium | High | Medium | Medium/high |
| Recovery burden | Medium | Medium/high | High | High if rollback | High but localized |
| Common-mode concerns | Underlying store | DB/infra | Quorum/infra/trust | Fence source | All core dependencies |

## 9. The hidden requirement: linearization must be observable

It is insufficient to say:

“the database transaction is atomic.”

For Nexo, we need an explicit mapping:

FORMAL TRANSITION
→ IMPLEMENTATION OPERATION
→ LINEARIZATION EVENT
→ DURABLE RECORD
→ OBSERVABLE TRACE
→ VERIFICATION EVIDENCE.

For example:

AUTHORIZATION_ACCEPTED
must map to an exact implementation commit/serialization event.

STOP_EFFECTIVE
must map to an exact protected fence state.

RECOVERY_RELEASED
must map to an exact release transition.

VERSION_ACTIVATED
must map to an exact VersionSet activation event.

If no implementation event can be identified, the formal claim is not yet connected to reality.

## 10. Linearization versus durability

These are different properties.

LINEARIZABILITY:
operations appear to take effect at one point consistent with real-time ordering.

DURABILITY:
the committed result survives the specified crash/recovery model.

A system can have one without fully having the other.

Therefore every protected transition requires both:
- linearization semantics;
- durability semantics.

## 11. Linearization versus external world

Another hard boundary:

INTERNAL LP
!=
EXTERNAL EFFECT TIME.

Example:
LP_EXECUTE = 10:00:00
external provider applies effect = unknown
response = lost.

Nexo must record:
control transition committed;
external outcome UNKNOWN.

It cannot infer external application from the internal LP.

## 12. CAS hazards requiring explicit treatment

### ABA
A state changes A→B→A and a stale actor sees A again.

Mitigation:
non-reusable version/epoch/fingerprint.

### Stale read set
Actor reads policy epoch 8, policy changes to 9, actor attempts commit.

Mitigation:
conditional commit includes all safety-relevant context.

### Partial multi-object update
CAS succeeds on object A but fails on B.

Mitigation:
same linearization domain or explicit protocol.

### Retry after crash
Actor cannot tell whether CAS/transition committed.

Mitigation:
durable operation identity + idempotent query/retry semantics.

## 13. Transaction hazards

### Isolation mismatch
Implementation offers snapshot isolation while architecture assumes serializability.

### Write skew
Two transactions read disjoint data and make individually valid changes that jointly violate an invariant.

### Failover semantics
A failover path may alter ordering/durability guarantees.

### Replica lag
A read from a stale replica cannot participate in authority admission.

### Commit acknowledgment
ACK semantics must be bound to actual durable commit semantics.

Therefore:
PRODUCT FEATURE NAME != VERIFIED SEMANTIC GUARANTEE.

## 14. Consensus hazards

Consensus does not automatically solve:
- external effects;
- incorrect state-machine specification;
- compromised quorum/trust roots;
- common-mode dependencies;
- unsafe client authorization;
- bad command semantics;
- stale external observations.

Consensus can establish an ordered command history; it cannot make an incorrect command safe.

Therefore:

CONSENSUS != SAFETY BY ITSELF.

## 15. Fencing hazards

Fencing fails if:
- executor does not actually check the fence;
- one protected path bypasses the gate;
- epoch can roll back;
- old epoch is reused;
- storage snapshot restores old epoch;
- fence authority shares the same failure domain as the stale worker and loses current state;
- external provider accepts an effect without identity/fence semantics where such enforcement is required.

Therefore every protected effect path needs a demonstrable fence enforcement point.

## 16. Hybrid hazards

The hybrid approach creates a new class of risk:

BYPASS PATH.

If any outer service can:
- write authority;
- modify EffectBinding;
- clear STOP;
- release recovery;
- activate VersionSet;
- resolve UNKNOWN;
- accept a safety claim;

without passing through the protected core, the claimed boundary is false.

Therefore the architecture needs a machine-checkable capability boundary, not merely documentation.

## 17. Required implementation contract

For each protected transition:

1. exact operation/effect identity;
2. complete safety-relevant read set;
3. complete write set;
4. authority context;
5. policy/invariant/VersionSet fingerprints;
6. current fence/epoch;
7. explicit preconditions;
8. exact linearization event;
9. durable outcome;
10. retry/idempotency semantics;
11. crash semantics;
12. partition semantics;
13. timeout semantics;
14. evidence/trace event;
15. correspondence mapping to formal transition.

## 18. Protocol selection constraint

The architecture should choose the least powerful mechanism that satisfies the required semantics.

Examples:

- single authoritative scalar/fence → CAS may suffice;
- multiple protected variables in one store → serializable transaction may suffice;
- replicated authoritative core requiring fault tolerance → consensus-backed state machine may be justified;
- stale workers across boundaries → fencing required;
- external world → reconciliation required regardless.

This is not a ranking. It is a capability-to-requirement mapping.

## 19. New invariants

LINPROTO-01: every protected transition has an explicit implementation-level linearization point.
LINPROTO-02: linearization and durability are specified separately.
LINPROTO-03: implementation acknowledgment semantics cannot exceed verified durability semantics.
LINPROTO-04: serializability assumptions must match the actual storage guarantee.
LINPROTO-05: stale reads cannot participate in protected authorization.
LINPROTO-06: non-reusable epochs/fences prevent ABA-style authority reuse.
LINPROTO-07: external-effect timing remains distinct from internal linearization.
LINPROTO-08: consensus ordering cannot substitute for correct command semantics.
LINPROTO-09: every protected effect path enforces the current fence.
LINPROTO-10: no outer component may bypass the protected authority boundary.
LINPROTO-11: retries preserve effect identity and cannot erase UNKNOWN.
LINPROTO-12: failover/recovery preserves or deliberately re-establishes protected ordering.
LINPROTO-13: storage rollback cannot reuse an older authoritative epoch.
LINPROTO-14: implementation traces expose the events required for formal correspondence.
LINPROTO-15: a protocol guarantee is claim-specific and depends on its stated failure/trust assumptions.
LINPROTO-16: protocol selection is derived from required semantics, not technology preference.

## 20. Result

The research narrows the likely implementation pattern but does not yet select it.

The key separation is:

**Atomic conditional state transition**
+
**durable protected fencing**
+
**exact effect identity**
+
**external reconciliation**

rather than attempting to force the external world into an internal transaction.

The next decisive gate is to construct a concrete **protected-core protocol state machine** and test it against every previously catalogued race/interleaving and crash window.

Only after that can we ask whether a particular implementation primitive is sufficient.

Architecture remains blocked.