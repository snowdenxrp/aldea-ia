# NEXO ROOT PARTITION, SPLIT-BRAIN COMPACTION, RECOVERY HEALING AND SAFETY ORDERING RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## External anchors
Raft's safety argument makes committed state survive leadership changes through an ordering/selection mechanism: a future leader must contain committed entries. This illustrates the broader principle relevant to Nexo: after partition/healing, a new authority context cannot simply be selected from a stale local view; authoritative ordering must preserve already-committed safety state. citeturn0search27turn0search5
TLA+ proof obligations are valid relative to their current assumptions/context; therefore a root-transition or compaction proof cannot silently reuse assumptions from a partitioned predecessor context after healing. citeturn0search0turn0search8

## Core result
The combined attack shows that ROOT_GENERATION alone is insufficient to establish global authority order.

Required distinction:
ROOT_GENERATION != GLOBAL_AUTHORITY_ORDER

A root generation can identify a trust lineage, but it does not by itself establish which conflicting transition linearized first across a partition.

Therefore Nexo needs a protected SafetyOrderingDomain for conflicting protected transitions.

## 1. Partition scenario
Consider:
- Side A has Root A and compaction certificate CA.
- Side B has Root B or begins transition to B.
- Network partition prevents global ordering.
- A commits summary/reclamation locally.
- B changes root, invalidates A, or issues a competing certificate.
- Recovery occurs on one or both sides.
- Partition heals.

The dangerous assumption is:
LATEST_ROOT_GENERATION = WINNER.

That is not sound unless generation advancement itself is serialized by an authoritative ordering mechanism.

## 2. Minimum SafetyOrderingDomain
Candidate definition:

SafetyOrderingDomain = the smallest protected domain that can authoritatively order every mutually conflicting transition required by the safety claim.

It must cover at least:
- root cutoff/activation;
- authority epoch transitions;
- compaction/reclamation boundary;
- recovery ownership transitions;
- fence activation;
- assurance invalidation;
- any external effect boundary whose outcome can alter the claim.

It need not encompass unrelated operations.

This follows the earlier minimal coordination-domain research: coordination scope should be claim/interaction driven, not globally maximal.

## 3. Why two local commits do not compose
A-side:
COMPACTION_COMMIT_A

B-side:
ROOT_CUTOFF_COMMIT_B

If neither commit has a common authoritative order, their local validity does not establish a safe global order.

Possible real orders:
1. A compacted before B cutoff.
2. B cutoff before A compacted.
3. Actual order is unknowable due partition.

Case 3 must not be guessed.

Therefore:
UNKNOWN_ORDER != A_BEFORE_B
and
UNKNOWN_ORDER != B_BEFORE_A.

Safe result: HOLD / QUARANTINE / RECONCILE.

## 4. Root overlap is not authority overlap
During healing, both sides may present apparently valid roots.

But:
VALID_LOCAL_ROOT != VALID_GLOBAL_AUTHORITY

The system needs:
- root lineage;
- cutoff relation;
- transition ordering;
- conflict set;
- authoritative winner/serialization;
- descendant invalidation;
- enforcement verification.

A root can remain historically authentic while being prohibited from current authority.

## 5. Compaction after partition
Suppose A compacted under Root A while B could still issue effects derived from A-era authority.

Then A's local AUTHORITY_CLOSURE was incomplete.

The compaction certificate must therefore include an assumption/claim that the relevant authority domain was closed.

If that closure cannot be proven after healing, the compacted result becomes:
- historical-only;
- claim-degraded;
- unknown;
- quarantined.

It cannot silently become current assurance.

## 6. Healing protocol candidate

PARTITION_DETECTED
→ FREEZE_PROTECTED_ADMISSION
→ ENTER_DEGRADED/SAFETY_ONLY
→ IDENTIFY_ROOT_CONTEXTS
→ IDENTIFY_COMPACTION_CONTEXTS
→ BUILD_CONFLICT/DEPENDENCY_CLOSURE
→ ESTABLISH_SAFETY_ORDERING
→ SELECT_CURRENT_TRUST_CONTEXT
→ INVALIDATE_STALE_ROOT/ASSURANCE_DESCENDANTS
→ FENCE_STALE_EFFECT_PATHS
→ RECONCILE_EXTERNAL_EFFECTS
→ REVALIDATE_COMPACTION_SUMMARIES
→ RECOMPUTE_CLAIMS
→ EXPLICIT_RELEASE

No normal execution release occurs merely because network connectivity returned.

## 7. Recovery during partition
Recovery authority must not infer that the partition has ended from local connectivity.

LOCAL_REACHABILITY != GLOBAL_CONVERGENCE

Recovery can operate in safety-only mode, but protected release requires current safety ordering and current authority context.

This preserves:
RECOVERY_AUTHORITY != MISSION_AUTHORITY.

## 8. Partially completed compaction
Important crash/partition cases:

### P0
Summary not committed.
Safe default: retain raw history.

### P1
Summary committed, reclamation not committed.
Safe recovery: keep both.

### P2
Reclamation committed locally, global ordering unknown.
The raw history may be unavailable, so the system must treat the compacted result as conditional on the local certificate and wait for authoritative reconciliation.

### P3
Reclamation committed and later root invalidation discovered.
Affected claims must be revalidated using retained summary + root reliance metadata. Unsupported claims degrade or quarantine.

### P4
Partition healing reveals that a stale side continued effect-capable execution.
The compacted closure is invalid for any claim affected by that continuation.

## 9. Root transition ordering
Candidate RootTransitionOrdering record:
- transition_id
- predecessor_root
- successor_root
- safety_order_position
- cutoff_position
- activation_position
- affected authority epochs
- affected capability lineage
- affected compaction generations
- dependency/common-mode context
- enforcement verification
- reconciliation status.

The key is not merely root generation but its position in the authoritative safety order.

## 10. Merge rule
When A and B meet, do not simply merge sets.

Compute:
ConflictClosure(A,B)

including:
- conflicting roots;
- certificates;
- claims;
- authority contexts;
- fences;
- recovery ownership;
- resource incarnations;
- external effect identities;
- compacted summaries;
- unknown effects;
- dependency assumptions.

Then establish an authoritative order before publishing a merged current state.

## 11. Compaction certificate after root conflict
Candidate states:
CURRENT
HISTORICAL_ONLY
PENDING_REVALIDATION
INVALIDATED
CLAIM_DEGRADED
QUARANTINED

A certificate remains CURRENT only if:
- its root context is current;
- its ordering position is valid;
- its closure assumptions remain true;
- no conflicting transition invalidates it;
- its compacted summary is still sufficient for the claim;
- enforcement remains current.

## 12. New invariants
SO-01: Root generation alone cannot establish global authority order.
SO-02: Every mutually conflicting protected transition must belong to one authoritative SafetyOrderingDomain.
SO-03: Local commit on a partitioned side cannot by itself establish global safety ordering.
SO-04: Unknown order must not be resolved by timestamp, message arrival, or root generation alone.
SO-05: Network healing is not equivalent to authority convergence.
SO-06: A stale root may remain historically authentic while being invalid for current authority.
SO-07: Compaction performed under an unclosed authority domain cannot support a stronger post-healing claim than its verified closure permits.
SO-08: Recovery during partition may preserve safety but cannot self-promote to normal authority.
SO-09: Root transition ordering must bind compaction/reclamation and authority invalidation when they can conflict.
SO-10: After healing, merged state must be derived from authoritative conflict resolution, not naive union.
SO-11: A stale snapshot cannot restore a root or assurance context that has been cut off.
SO-12: If authoritative order cannot be established, the safe state is HOLD/QUARANTINE.

## Architecture consequence
SafetyOrderingDomain becomes a cross-cutting primitive joining:
- root trust;
- authority;
- compaction;
- recovery;
- fencing;
- assurance;
- external-effect reconciliation.

This does not mean one giant global consensus domain is required. The domain should be minimal for the protected claim.

## Important formal boundary
This is an architectural semantic result, not a proof.

A future formal model must specify:
- the SafetyOrderingDomain;
- admissible partitions;
- root transitions;
- compaction;
- recovery;
- fences;
- external effects;
- claim publication;
- refinement mapping.

Then SANY/TLC/TLAPS or equivalent verification must establish the actual properties. No such execution is claimed here. TLA+ proof obligations are explicitly contextual, so the model must include the same assumptions it relies upon. citeturn0search0turn0search3

## Next unresolved attack
Next target:
SAFETY ORDERING DOMAIN FAILURE / QUORUM LOSS / ROOT TRANSITION WITHOUT GLOBAL AVAILABILITY.

Questions:
- Can safety be preserved if the SafetyOrderingDomain loses quorum?
- What independent resource-side fence is required?
- Can a partitioned side continue safety-only operations without accidentally creating current authority?
- What is the exact boundary between safety-preserving refusal and liveness-preserving progress?
- Can root rotation proceed without quorum under a pre-established emergency contract?
- Can two emergency roots remain safe without a common ordering service?

No correctness guarantee is claimed.
