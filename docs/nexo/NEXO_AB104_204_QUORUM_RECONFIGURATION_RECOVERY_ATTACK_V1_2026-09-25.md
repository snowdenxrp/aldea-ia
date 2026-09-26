# NEXO — AB104.204 QUORUM RECONFIGURATION / RECOVERY ATTACK V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Attack membership changes and recovery after quorum loss. The question is how Nexo can add, remove, replace, or recover devices without ever allowing two incompatible authorities to become canonical.

## External evidence studied

### Raft joint consensus
Raft's membership-change design uses an intermediate joint configuration containing both old and new memberships. During the transition, commitment requires majorities from both configurations. This prevents old and new configurations from independently making conflicting decisions. The original Raft paper describes overlapping majorities as the safety mechanism for membership changes. cite-source:turn0search2turn0search0

### Threshold cryptography
NIST describes threshold cryptographic schemes in which a secret operation can require cooperation from a configured threshold of participants, providing security even when some components are compromised. This supports separating 'number of signatures' from the stronger question of whether authority is independently distributed. cite-source:turn0search1turn0search15

### TUF root rotation
TUF requires threshold signatures for trusted metadata and treats root-key compromise as a special recovery case; if the threshold of root keys is compromised, root recovery must occur out-of-band. This reinforces that quorum membership and root transition authority are themselves security state. cite-source:turn0search12turn0search7

## Findings

### 1. Membership changes are authority changes
Adding/removing a device is not merely inventory management. It changes who can authorize future canonical state. Therefore membership transitions must themselves be committed under the currently authoritative configuration and must preserve quorum intersection with the next configuration.

### 2. Direct old -> new switching is unsafe
If devices independently switch from C_old to C_new, network partition can leave two groups believing they have sufficient authority. The safe reference pattern is a transition state C_joint or an equivalent rule that guarantees every valid old quorum intersects every valid new quorum.

Nexo does not have to implement Raft, but it must preserve the underlying invariant if it adopts quorum authority.

### 3. Newly added devices must not immediately gain equal authority
A new device may be:
- enrolled;
- authenticated;
- synchronized to the canonical history;
- attested/proven eligible;
- transitional/non-voting;
- finally enfranchised.

Granting vote/authority before the device has caught up creates a state where it can authorize a history it does not actually possess.

### 4. Removal and compromise are different
A device can be removed because it is obsolete/lost, or because it is suspected/confirmed compromised. A compromised member may require immediate revocation semantics rather than ordinary graceful removal.

The protocol must preserve enough evidence to distinguish:
- VOLUNTARY_REMOVE;
- REPLACEMENT;
- LOSS;
- SUSPECTED_COMPROMISE;
- CONFIRMED_COMPROMISE;
- RECOVERY_REVOKE.

### 5. Quorum loss must block authority, not invent authority
If the surviving devices cannot satisfy the current authority threshold, they may retain and inspect existing state, but they must not locally declare a new canonical root merely to regain availability.

A separate recovery authority may restore liveness, but that is a distinct authority transition requiring explicit evidence.

### 6. Recovery after quorum restoration
When connectivity returns, divergent branches must be compared before any promotion. A device with an older valid history must not overwrite a newer canonical history merely because it reconnects first. A device with a conflicting valid branch must enter reconciliation/quarantine until the canonical authority is proven.

### 7. Reconfiguration must be monotonic
A membership/configuration transition should carry at least:
- authority scope;
- configuration identifier/version;
- predecessor configuration digest;
- new member identities/incarnations;
- transition authorization/quorum certificate;
- root/epoch binding;
- effective state;
- revocation/removal reasons where applicable.

Exact data model remains OPEN.

### 8. Quorum compromise threshold is separate from availability threshold
For a configuration C=(N,Q), the number of failures tolerated for availability is not the same as the number of compromised members tolerated for safety. Threshold cryptography and Byzantine quorum research make this distinction explicit. Nexo must not write a single 'quorum size' field and assume it captures both properties.

### 9. Split-brain must be an explicit state
If two configurations both appear locally valid but lack evidence of a safe transition, the result is:
CONFLICT / QUARANTINE,
not 'choose the newest',
not 'choose the majority seen locally',
and not 'merge both'.

### 10. Device replacement needs continuity evidence
Legitimate replacement must prove a transition from old device incarnation to new device incarnation. Otherwise cloning and replacement are indistinguishable from the authority layer.

## Candidate state machine

STABLE(C_old)
 -> TRANSITION(C_old,C_new)
 -> COMMITTED(C_new)
 -> STABLE(C_new)

Failure/ambiguity:
PENDING_TRANSITION
QUORUM_LOST
CONFLICT
QUARANTINE
RECOVERY_AUTH_REQUIRED

A transition cannot skip from STABLE(C_old) to STABLE(C_new) without evidence equivalent to the required safe transition.

## Recovery matrix

1. Old quorum + signed transition to new config -> transition eligible if quorum evidence is valid.
2. New config present but old/new transition evidence missing -> PENDING/UNVERIFIED.
3. Old and new configs both claim current -> CONFLICT until transition proof resolves it.
4. No quorum but complete old history -> HISTORICALLY_VALID / NO_NEW_AUTHORITY.
5. Quorum restored with divergent histories -> reconcile against canonical authority; no arrival-order winner.
6. New device enrolled but not synchronized -> NON_VOTING/TRANSITIONAL.
7. Removed/compromised device signs after revocation effective point -> reject for current authority; retain as evidence.
8. Threshold compromised -> ordinary member recovery is insufficient; invoke separate root/recovery authority.

## Important distinction

QUORUM SAFETY != QUORUM LIVENESS.

Safety means conflicting canonical decisions cannot both be accepted.
Liveness means an authorized configuration can continue making progress.
During partition, preserving safety may require intentionally sacrificing liveness.

This is acceptable for Nexo's safety boundary; 'offline' must not silently mean 'canonical'.

## Code/repository study
Canonical repository remains snowdenxrp/aldea-ia / main. The current code/research inspection does not establish a verified Nexo quorum/reconfiguration implementation. No implementation claim is made. The eventual code audit must trace membership persistence, vote/authorization checks, epoch transitions, recovery and external-effect gates.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

## DO-NOT-REPEAT
- Do not treat device count as independent authority count.
- Do not switch old/new membership directly without quorum-intersection evidence.
- Do not enfranchise a new device before required synchronization/eligibility evidence.
- Do not equate safety threshold with availability threshold.
- Do not invent canonical authority after quorum loss merely to regain liveness.
- Do not resolve conflicting branches by timestamp/arrival order.
- Do not silently merge divergent configurations.
- Do not treat replacement and compromise as identical events.
- Do not claim Raft itself is Nexo's selected architecture.
- No V21.
- No unsupported formal/CI/fault-injection claims.

## EXACT NEXT ACTION — AB104.205
Attack Byzantine/equivocation behavior inside the quorum itself:
1. one device signs conflicting roots for different peers;
2. equivocation detection and evidence propagation;
3. threshold signature vs individually signed quorum certificates;
4. compromised minority vs compromised threshold;
5. conflicting recovery authorities;
6. offline device returning with stale authority;
7. determine the minimum evidence needed to prove that a quorum certificate represents one coherent decision.

Status: research-only.
