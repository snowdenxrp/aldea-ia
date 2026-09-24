# NEXO SAFETY ORDERING DOMAIN LOSS, QUORUM LOSS, SAFETY-ONLY MODE AND EMERGENCY ROOT RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## External evidence
Raft requires majority agreement for election/commit safety and restricts leadership so committed entries are preserved. citeturn0search12turn0search14
etcd requires quorum for linearizable operations and rejects unsafe membership changes that would bypass consensus; permanent quorum loss requires a controlled recovery/recreation path rather than forced removal that bypasses normal committing. citeturn0search1turn0search2turn0search9
etcd also documents that stale local reads can differ from quorum state, reinforcing that local availability is not equivalent to current authoritative state. citeturn0search0turn0search7

## Core result
Loss of the SafetyOrderingDomain does not require Nexo to become globally inert, but it does require a hard separation between:
SAFETY-PRESERVING ACTIONS
and
AUTHORITY-CREATING / EFFECT-CREATING ACTIONS.

Candidate rule:
NO_AUTHORITATIVE_ORDER -> NO_NEW_UNBOUNDED_PROTECTED_AUTHORITY

The system may continue operations whose safety does not require a new global order, provided their scope is independently fenced and their claims are explicitly limited.

## 1. Three availability states
Candidate protected modes:

NORMAL
- current SafetyOrderingDomain available;
- protected ordering can advance;
- normal authority/effects may proceed subject to admission.

SAFETY_ONLY
- authoritative ordering unavailable or quorum lost;
- no new transitions requiring that ordering;
- existing effects may be fenced/interrupted where independently controllable;
- reconciliation and evidence collection may continue if they cannot create protected authority/effects;
- claims are degraded to the verified scope.

QUARANTINED
- required fence, identity, trust, or ordering state is ambiguous;
- no protected effect creation;
- recovery/reconciliation operate only under explicitly defined recovery authority.

This extends earlier NORMAL/DEGRADED/SAFETY_ONLY/QUARANTINED modes.

## 2. Quorum loss is not automatically total shutdown
Quorum loss blocks operations that require the unavailable ordering domain, but not necessarily every local observation or safety action.

Examples potentially allowed in SAFETY_ONLY:
- local emergency stop;
- local effect interruption where the resource-side boundary is independently controllable;
- evidence capture;
- immutable logging;
- local containment;
- status transition to UNKNOWN;
- reconciliation preparation;
- health observation.

Examples blocked:
- granting new mission authority;
- issuing unbounded delegated capabilities;
- root rotation without a pre-established emergency contract;
- publishing globally current assurance;
- destructive compaction whose validity requires global closure;
- releasing a conflicting recovery owner;
- creating external effects whose admission depends on unavailable global order.

## 3. Independent resource-side fence
A key candidate for safety during quorum loss is an enforcement mechanism at the last effect-capable boundary.

Rule:
CONTROL_PLANE_UNAVAILABLE + RESOURCE_SIDE_FENCE_ACTIVE
may preserve a bounded containment claim.

But:
INTERNAL_STOP_ONLY cannot prove external quiescence if the provider can still act independently.

This reinforces the previous EnforcementBoundary research.

Candidate IndependentSafetyFence fields:
- fence_id
- effect scope
- resource/provider identity
- resource incarnation
- fence generation
- activation proof
- enforcement domain
- bypass closure
- verification source
- expiry/revalidation
- trust/dependency context.

## 4. Fence is not authority
An independent fence can block effects without granting anyone authority to resume.

Therefore:
FENCE_ACTIVE != AUTHORITY_AVAILABLE

This allows Nexo to preserve safety while the ordering domain is unavailable.

## 5. Emergency root without quorum
An emergency root can only be safe if its authority was established before quorum loss or through an independent mechanism whose semantics are explicitly defined.

Unsafe:
NO_QUORUM -> LOCALLY_GENERATE_NEW_ROOT -> BECOME_CURRENT

Candidate safe patterns:
A. Pre-established emergency authority envelope with fixed scope and expiry.
B. Resource-side safety authority limited to STOP/fence/containment.
C. Independent external ordering service that remains within the trust model.
D. Human/manual recovery authority, if explicitly modeled and independently authenticated.

Even these do not automatically restore normal mission authority.

## 6. Emergency root restrictions
Candidate emergency root must be:
- scope-bounded;
- effect-bounded;
- time/generation-bounded;
- non-amplifying;
- incapable of delegating beyond its envelope;
- unable to declare itself current normal root;
- unable to override unresolved split-brain conflicts;
- unable to erase history;
- unable to perform destructive compaction unless its ordering assumptions are independently satisfied.

This follows the earlier anti-amplification/delegation work.

## 7. Two emergency roots
Suppose partition creates E1 and E2.

E1_ACTIVE + E2_ACTIVE

must not become:
TWO_CURRENT_AUTHORITIES.

Without an authoritative ordering domain, both may perform only disjoint, pre-authorized safety operations.

If their scopes overlap:
OVERLAP_UNKNOWN -> HOLD/QUARANTINE.

If they are provably disjoint:
they may operate under separate containment envelopes, but this is not global authority.

Candidate EmergencyAuthorityEnvelope and EmergencyConflictClosure.

## 8. Quorum restoration
When the ordering domain becomes available again, do not immediately resume.

Candidate:
ORDERING_RETURNED
→ VERIFY_CURRENT_MEMBERSHIP
→ ESTABLISH_AUTHORITATIVE_ORDER
→ IDENTIFY_EMERGENCY_CONTEXTS
→ CLOSE_CONFLICTS
→ INVALIDATE_STALE_EMERGENCY_AUTHORITY
→ VERIFY_FENCES
→ RECONCILE_EXTERNAL_EFFECTS
→ REVALIDATE_ASSURANCE
→ RECOMPUTE_CLAIMS
→ EXPLICIT_NORMAL_RELEASE

etcd's design similarly treats quorum-backed ordering as the basis for linearizable state and requires careful sequential membership changes rather than bypassing consensus. citeturn0search1turn0search9

## 9. Emergency authority and compaction
Destructive compaction must be blocked in SAFETY_ONLY unless all of its safety obligations are independent of unavailable ordering.

Reason:
compaction can erase information needed to resolve the partition later.

Therefore:
SAFETY_ONLY + COMPACTION
defaults to:
RETAIN / NO_DESTRUCTIVE_RECLAMATION.

Lossless representation compaction may still be possible if it does not remove information required by future conflict resolution.

## 10. Emergency authority and root rotation
Root rotation is generally blocked during quorum loss unless a pre-established emergency transition contract exists.

If such a contract exists, it must define:
- exact scope;
- predecessor/successor relation;
- cutoff semantics;
- descendant invalidation;
- conflict behavior;
- recovery owner;
- resource-side enforcement;
- revalidation after quorum restoration.

No emergency root may silently convert into normal root authority.

## 11. Safety vs liveness boundary
This research sharpens the architecture's fundamental tradeoff:

When authoritative ordering is unavailable, Nexo should sacrifice progress before sacrificing protected safety.

But not every operation needs the same ordering.

Thus:
LIVENESS LOSS != GLOBAL SYSTEM FAILURE.

The correct behavior is claim-specific:
- operations requiring unavailable ordering -> HOLD;
- independently safe containment -> continue;
- observations -> continue with bounded evidence;
- normal effect creation -> blocked;
- ambiguous scope -> quarantine.

## 12. New invariants
QO-01: Loss of the SafetyOrderingDomain cannot create new unbounded protected authority.
QO-02: SAFETY_ONLY may preserve bounded safety without granting normal authority.
QO-03: A resource-side fence may preserve containment but does not grant authority to resume.
QO-04: Local reachability cannot substitute for authoritative ordering.
QO-05: Emergency authority must be pre-bounded, non-amplifying and unable to self-promote to normal authority.
QO-06: Two emergency authorities with overlapping scope cannot both be current.
QO-07: Destructive compaction requires an ordering/closure proof not dependent on unavailable quorum.
QO-08: Quorum restoration is not automatic release.
QO-09: Recovery after quorum loss must invalidate stale emergency contexts before normal execution.
QO-10: Unknown overlap between emergency scopes requires HOLD/QUARANTINE.
QO-11: Safety-preserving operations and authority-creating operations must be explicitly typed.
QO-12: Permanent quorum loss requires a controlled recovery transition that does not bypass the protected ordering contract.

## Candidate objects
- IndependentSafetyFence
- EmergencyAuthorityEnvelope
- EmergencyConflictClosure
- SafetyOnlyContext
- QuorumLossContext
- OrderingRecoveryContext
- RootTransitionEmergencyContract
- SafetyOrderingLease
- OrderingRejoinCertificate

## Architecture consequence
The SafetyOrderingDomain is not necessarily always available.

Therefore the clean architecture must treat ordering availability itself as a safety-relevant dependency with explicit modes.

The minimum protected core now appears to include:
1. authoritative safety ordering;
2. independent effect enforcement/fencing;
3. root/trust transition state;
4. recovery ownership;
5. durable invalidation/reliance metadata.

These components must not all fail together if the system is expected to preserve a bounded safety claim during control-plane loss.

## Important boundary
This research does not prove that any particular quorum algorithm, emergency contract, or fence implementation is safe. It identifies the semantic requirements. Formal modeling, implementation refinement, and fault injection remain open.

## Next unresolved attack
Next target:
RESOURCE-SIDE FENCE FAILURE / BYPASS DURING QUORUM LOSS.

Attack:
- ordering domain unavailable;
- Nexo activates independent fence;
- provider has an alternate effect path;
- fence reports active;
- resource is replaced;
- old fence identity remains present;
- stale provider callback arrives;
- Nexo later regains quorum.

Need to determine whether a fence can be treated as a true safety root, or whether it must itself be modeled as a protected external-effect contract with incarnation, bypass closure and verification semantics.

No correctness guarantee is claimed.
