# NEXO — SPLIT-BRAIN, ROOT ROTATION, RECOVERY AND CONCURRENT AUTHORITY
Date: 2026-09-24
Status: RESEARCH ONLY — CLEAN ARCHITECTURE DESIGN — NOT IMPLEMENTED — NOT SANY/TLC VERIFIED

## 1. Research question

Attack the combined failure:
ROOT ROTATION + RECOVERY + MULTI-ROOT + NETWORK PARTITION + SPLIT-BRAIN + CONCURRENT AUTHORITY.

Question:
Can two isolated Nexo partitions both believe they possess current authority and independently rotate roots, recover, delegate capabilities, or release protected effects?

## 2. External cross-check

Raft uses monotonically increasing terms as a logical clock; stale leaders/requests are rejected when their term is older, and a partitioned minority cannot safely behave as the current committed cluster. etcd similarly relies on quorum-backed consensus and states that a partitioned minority becomes unavailable rather than forming a second authoritative cluster. These mechanisms are useful patterns, not proof for Nexo. citeturn0search37turn0search8

etcd also distinguishes linearizable operations from serializable/stale reads: local cached state can be stale, while linearizable operations require the consensus path. This reinforces the Nexo rule that cached authority state cannot itself be authoritative. citeturn0search5

NIST SP 800-193 treats roots/chains of trust as foundational for protection, detection and recovery, and notes that recovery can depend on another trusted component; this supports separating recovery trust from the compromised or unavailable mission authority. citeturn0search36

## 3. The newly identified hazard

A partition can create:

P1: believes RootGeneration = G+1, AuthorityEpoch = A+1
P2: believes RootGeneration = G, AuthorityEpoch = A

If both can authorize protected effects, the system has not merely stale data. It has **concurrent authority**.

The critical distinction is:

STALE OBSERVATION != SPLIT AUTHORITY

A stale observer is safe if the effect boundary rejects it.

Split authority is dangerous because both sides can pass their own local checks.

## 4. Root generation alone is insufficient

A monotonically increasing RootGeneration only solves stale-state rejection if every effect-capable boundary can determine the current authoritative generation.

During a partition, P1 can claim G+1 while P2 can claim G+1 independently.

Therefore:

ROOT_GENERATION != GLOBAL AUTHORITY ORDER

unless generation advancement itself is protected by an authoritative ordering mechanism whose safety survives the partition.

## 5. Authority requires a unique serialization domain

Candidate invariant:

For every protected authority scope S, there must be at most one currently valid authority serialization domain that can produce an admissible transition for S.

Define:

SafetyOrderingDomain(S) =
the authoritative mechanism that orders mutually conflicting authority transitions for S.

Examples of conflicting transitions:
- root rotation;
- authority revocation;
- delegation;
- recovery ownership;
- safety release;
- capability widening;
- scope widening;
- resource-side fence activation.

If two disconnected domains can independently linearize conflicting transitions for the same scope, neither can claim global authority without an explicit partition-tolerant protocol.

## 6. Why leases alone are insufficient

A lease based only on local time can expire differently across partitions.

Therefore:

CLOCK TIMEOUT != PROOF OF GLOBAL AUTHORITY LOSS

A lease can be useful for coordination, but protected safety claims require an authoritative fence/epoch mechanism whose stale side cannot continue producing accepted effects.

If the resource itself rejects stale epochs, the system can preserve a safety-only claim even when the control plane is partitioned.

If the resource cannot reject stale authority, Nexo must not claim that the partitioned side is harmless merely because its local lease expired.

## 7. The strongest architecture candidate

For a protected scope S:

AUTHORITY ORDER
→ FENCE GENERATION
→ RESOURCE/EFFECT BOUNDARY
→ EXTERNAL EFFECT

The authoritative control plane determines which generation may act.

The final effect boundary accepts only a currently valid generation/fence.

This yields:

old partition:
G_old → rejected

current partition:
G_current → accepted

But this only works if the boundary can independently establish currentness. If it cannot, the claim must weaken to UNKNOWN/QUARANTINE.

## 8. Root rotation during partition

Attack:

1. Partition occurs.
2. P1 and P2 both believe they are recoverable.
3. P1 rotates root to G+1.
4. P2 also rotates root to G+1 but with different trust material.
5. Both issue capabilities under G+1.
6. Partition heals.

This is an ABA-like authority collision.

Therefore RootGeneration must not be merely an integer. Candidate identity:

RootGeneration =
(epoch, trust_set_fingerprint, transition_id, authoritative_order_position)

Two sides cannot legitimately produce the same generation identity for different transitions.

Even this does not solve simultaneous authority by itself; the generation must be issued by the authoritative serialization domain.

## 9. Recovery during partition

Recovery is especially dangerous because recovery is already a privileged transition.

Forbidden pattern:

PARTITION
→ local recovery
→ local root activation
→ local authority issuance

without an independent ordering/fencing mechanism.

Candidate rule:

RECOVERY_PROGRESS != RECOVERY_AUTHORITY

A recovery node may reconstruct state locally but cannot become authoritative merely because it completed its local recovery procedure.

## 10. Multi-root trust does not automatically solve split-brain

Suppose P1 uses roots A+B and P2 uses roots C+D.

If the trust sets were independently authorized by the previous authority, both may look cryptographically valid.

Therefore:

VALID_ROOT_SET != CURRENT_ROOT_SET

The current root set must itself be bound to the authoritative trust-transition history.

Changing membership, threshold, role, or root composition is a protected transition.

## 11. Partition-safe modes

Candidate modes:

### NORMAL
Current authority established and effect boundary verified.

### DEGRADED
Control state may be incomplete, but independently enforced fences preserve a bounded safety claim.

### SAFETY_ONLY
No new mission authority; existing effects may only be reconciled/fenced under explicit safety rules.

### QUARANTINED
Authority currentness cannot be established.

### SPLIT_BRAIN_DETECTED
Conflicting authority contexts are detected or strongly suspected.

Important:
DEGRADED != NORMAL.
SAFETY_ONLY != AUTHORITY.
QUARANTINED != FAILURE OF HISTORY.
UNKNOWN != NO_EFFECT.

## 12. Partition healing is not automatic authority reconciliation

When connectivity returns:

Do NOT simply merge state.

Required sequence:

PARTITION_DETECTED
→ FREEZE PROTECTED ADMISSION
→ IDENTIFY AUTHORITY CONTEXTS
→ IDENTIFY CONFLICTING ROOT/LEASE/EPOCH TRANSITIONS
→ ESTABLISH AUTHORITATIVE ORDER
→ INVALIDATE STALE/CONFLICTING CONTEXTS
→ FENCE EFFECT BOUNDARIES
→ RECONCILE EXTERNAL EFFECTS
→ RECOMPUTE ASSURANCE
→ EXPLICIT RELEASE

A node returning from partition must prove currentness; it does not regain authority by reconnecting.

## 13. Concurrent root rotations

Two root rotations R1 and R2 cannot both become committed for the same protected scope unless a composition contract explicitly permits them.

Candidate invariant:

AT MOST ONE SUCCESSOR TRUST CONTEXT PER SERIALIZED ROOT TRANSITION POSITION

If R1 and R2 conflict:
- one becomes authoritative;
- the other becomes stale/invalid;
- descendants of the stale transition are invalidated;
- effects issued under both must be reconciled if they reached external boundaries.

No “last writer wins” based solely on wall-clock timestamps.

## 14. Concurrent recovery

Two recovery owners cannot independently release the same safety scope.

Candidate:

ONE CURRENT RECOVERY OWNER PER CRITICAL COORDINATION DOMAIN

Transfer requires:
old owner invalidation/fencing
→ new owner acquisition
→ current context validation
→ reconciliation continuity
→ explicit release.

A recovery lease is coordination state, not proof that the old owner's external effects stopped.

## 15. Snapshot + partition attack

Attack:

P1 has newer authority.
P2 is partitioned.
P2 restores an older snapshot and believes it is current.
P2 reconnects and attempts to publish old authority.

Protection:
- snapshot carries historical RootGeneration/AuthorityEpoch;
- current authority domain rejects stale generation;
- resource boundary rejects stale fence;
- old claims are invalidated;
- P2 remains quarantined until revalidated.

Thus:

SNAPSHOT ROLLBACK + PARTITION != AUTHORITY RESURRECTION

## 16. Hidden split-brain through descendants

Even if the root controller is fenced, descendants may continue:
- worker processes;
- queued commands;
- delegated tokens;
- retries;
- provider callbacks;
- external scheduled jobs;
- cached capabilities.

Therefore split-brain containment must close the **effect path**, not only the controller process.

Candidate closure:

AUTHORITY
→ DELEGATION
→ QUEUE
→ RETRY
→ PROVIDER
→ RESOURCE
→ EFFECT

If any edge is outside the enforcement boundary, the claim must explicitly exclude it.

## 17. Common-mode consequence

Two partitions using the same:
- KMS;
- identity provider;
- policy store;
- configuration;
- update channel;
- clock;
- coordination store;
- trust root

are not independent authority domains merely because they run on different hosts.

Therefore:

PROCESS SEPARATION != AUTHORITY INDEPENDENCE

and:

NETWORK SEPARATION != TRUST SEPARATION

## 18. New candidate object

### AuthorityContinuityContext

Binds:
- authority serialization domain;
- root generation;
- root trust-set fingerprint;
- authority epoch;
- recovery epoch;
- stop epoch;
- fence generation;
- policy/invariant generation;
- capability lineage;
- resource incarnation;
- partition/reconciliation generation;
- dependency/common-mode fingerprint.

A protected effect is admissible only if all required continuity dimensions are current for its claim.

This unifies the prior root, recovery, fencing and capability-continuity work without collapsing their semantics.

## 19. New invariants

SB-01 — Unique authority order:
Conflicting protected transitions for the same scope require one authoritative serialization domain.

SB-02 — No local promotion:
Local recovery completion cannot create global authority.

SB-03 — Stale partition rejection:
A partitioned/stale context must be rejected at the effect boundary or the claim must be weakened.

SB-04 — Root transition uniqueness:
Conflicting root transitions cannot both become authoritative for the same serialized position.

SB-05 — Reconnection is not authorization:
Network healing does not restore authority.

SB-06 — Snapshot non-resurrection:
Historical snapshots cannot restore current authority.

SB-07 — Descendant closure:
Fencing the root/controller is insufficient if descendants can still reach an effect-capable boundary.

SB-08 — Lease limitation:
Lease expiration alone cannot prove external quiescence.

SB-09 — Multi-root anti-amplification:
Changing root membership/composition cannot silently increase authority.

SB-10 — Partition uncertainty:
If authoritative ordering cannot be established, protected authority moves to HOLD/SAFETY_ONLY/QUARANTINE according to claim requirements.

## 20. Adversarial fixtures added

SB-A01: partition + simultaneous root rotation.
SB-A02: partition + simultaneous recovery.
SB-A03: partition + delegated capability issuance.
SB-A04: old partition retains provider continuation.
SB-A05: snapshot restore during partition.
SB-A06: partition + threshold trust-set divergence.
SB-A07: conflicting root rotations heal simultaneously.
SB-A08: old recovery owner returns after new owner acquired.
SB-A09: stale worker acts after root cutoff.
SB-A10: stale queue item redrives after healing.
SB-A11: shared KMS creates false independence.
SB-A12: local lease expires while resource remains externally active.
SB-A13: resource accepts both old and new fence generations.
SB-A14: root transition commits internally but fence propagation fails.
SB-A15: partition heals after external effects occurred under both contexts.

## 21. Important result

The combined attack reveals a stronger abstraction than RootGeneration alone:

**AUTHORITY CONTINUITY**

Authority is current only when its root, serialization domain, epochs, fences, recovery ownership, capability lineage, resource incarnation, and dependency context are mutually coherent.

Therefore:

CURRENT ROOT != CURRENT AUTHORITY

and:

CURRENT AUTHORITY != ENFORCED EFFECT

Both transitions require explicit evidence.

## 22. Open gaps

- Exact SafetyOrderingDomain formalization.
- Partition-tolerant root-transition protocol.
- Formal proof of unique authority order.
- Exact relationship between RootGeneration, AuthorityEpoch, FenceGeneration and RecoveryEpoch.
- Resource-side enforcement protocol.
- Multi-root quorum/threshold formal model.
- Split-brain detection when partitions cannot communicate.
- SANY/TLC execution.
- Implementation refinement and fault injection.
- Real external-provider behavior under simultaneous conflicting authority.

## 23. Distillation

CARRY_FORWARD:
- logical monotonic epochs;
- authoritative serialization;
- resource-side stale rejection;
- recovery/mission authority separation;
- descendant effect-path closure;
- partition-aware quarantine;
- snapshot non-resurrection.

REWORK:
- AuthorityContinuityContext;
- SafetyOrderingDomain;
- root-transition protocol;
- multi-root quorum semantics.

REJECT:
- wall-clock last-writer-wins;
- local recovery as authority;
- network reconnection as authorization;
- root integer alone as global ordering;
- process isolation as authority independence.

OPEN:
- formal proof, SANY/TLC, implementation and runtime validation.

## 24. Status

RESEARCH COMPLETE FOR THIS ATTACK ROUND.
DESIGN CANDIDATE ONLY.
NO V21 IMPLEMENTATION.
NO FORMAL CORRECTNESS CLAIM.
NO RUNTIME CORRECTNESS CLAIM.
