# NEXO — AB104.203 MULTI-DEVICE CONTINUITY / QUORUM / EQUIVOCATION ATTACK V1
Date: 2026-09-26
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Study whether multiple Nexo devices can establish one canonical authority without silently accepting forks, especially during offline operation and network partitions.

## External evidence studied

### Raft / replicated consensus
Raft separates leader election, log replication and safety. Its membership-change mechanism uses overlapping majorities to preserve safety during configuration changes. The important lesson for Nexo is that quorum membership changes are themselves a security/safety transition; adding or removing devices cannot be treated as a metadata edit. Raft also makes the availability tradeoff explicit: a majority can make progress, but a partition without a majority must stop rather than invent a conflicting decision. citeturn0search26turn0search2

### Certificate Transparency / RFC 9162
RFC 9162 shows that signed tree heads plus Merkle consistency proofs can prove append-only continuity between two views. It also explicitly identifies a remaining problem: a log can present inconsistent views to different clients, so consistency across observers requires additional auditing/gossip. For Nexo this maps directly to equivocation: each device can possess individually valid evidence while disagreeing about the canonical root. citeturn0search0

### NIST Byzantine / federated quorum research
NIST's state-machine-replication survey covers Byzantine adversaries and federated Byzantine quorum systems, where participants may choose different trust sets. NIST's threshold-cryptography work also distinguishes threshold schemes from ordinary single-key signatures: the secret can be distributed so that compromise of a subset does not immediately reveal the signing authority. citeturn0search5turn0search3

NIST's 2026 threshold-scheme call confirms that threshold cryptography remains an active standards/evaluation area, including distributed signing and key generation. This is research evidence, not a recommendation that Nexo use threshold signatures. citeturn0search1turn0search7

## Core findings

### 1. Multiple devices do not automatically create a quorum
Three devices each signing the same root does not prove three independent authorities exist. If the same authority key is cloned, three signatures may represent one compromised authority copied three times.

A meaningful quorum needs independently bounded authority identities/incarnations and an explicit membership/trust configuration.

### 2. Quorum safety and availability are in tension
If devices partition into groups, allowing either partition to promote a new canonical root can create two histories. A safety-first canonical authority therefore needs a rule equivalent to:
- sufficient authorized quorum -> may commit;
- insufficient quorum -> may continue local non-canonical work, but may not promote canonical authority.

This is a protocol property, not a UI/network behavior.

### 3. Offline operation needs two classes of state
A device may safely record local observations/work while disconnected, but it must distinguish:
- LOCAL_PENDING / OFFLINE_BRANCH
from
- CANONICAL_AUTHORITY_COMMIT.

Offline work must not automatically become canonical merely because it has a higher local epoch or timestamp.

### 4. Equivocation is different from ordinary divergence
Ordinary divergence can happen because devices have not synchronized yet.
Equivocation occurs when an authority produces incompatible statements for the same scope/epoch, or when two supposedly exclusive canonical roots are both authorized.

Evidence should preserve both branches and identify the conflict rather than merging them.

### 5. Fork detection needs a comparable commitment
A device can prove:
- root digest;
- epoch/version;
- predecessor digest;
- transition authorization;
- signer/incarnation set.

Two devices can compare these commitments. If the same authority scope/epoch has different root digests with incompatible authorization, the result is a fork/conflict.

### 6. Consistency proof is not authority proof
A Merkle consistency proof can establish that one committed structure extends another. It cannot by itself decide which of two independently signed but conflicting structures is canonical.

Therefore Nexo needs both:
- history consistency evidence;
- authority/quorum evidence.

### 7. Membership changes are security transitions
Adding Device C or removing Device A changes who can authorize future roots. A membership change must therefore be committed under the previous authority and have explicit activation/finality semantics.

A simple mutable `devices[]` list is insufficient as a security boundary.

### 8. Device replacement needs incarnation identity
Device A lost -> replacement Device A2.
A2 must not inherit A's authority merely from copied storage.
Likewise, A's old credentials must not remain simultaneously authoritative after replacement.

Conceptual transition:
A/incarnation_i -> authorized replacement -> A/incarnation_(i+1)
with explicit revocation/retirement of the old incarnation.

### 9. Quorum compromise threshold must be explicit
A future design must state what happens if f devices are compromised and what minimum independent authorities are required for a root transition.
It is not enough to say "majority" without defining:
- membership set;
- quorum function;
- overlap property;
- compromise threshold;
- reconfiguration rule;
- partition behavior.

### 10. Canonical authority model is still OPEN
Two broad models remain:
A. Single canonical authority with replicated witnesses/devices.
B. Explicit federated authority where trust is defined by device-specific quorum rules.

No choice is made at this stage.

## Candidate state classification

DEVICE_STATE:
- UNSEEN
- ENROLLED
- ACTIVE
- OFFLINE
- PENDING_REPLACEMENT
- RETIRED
- REVOKED
- QUARANTINED

AUTHORITY_EVIDENCE:
- LOCAL_ONLY
- QUORUM_PENDING
- CANONICAL_COMMITTED
- CONFLICTING
- STALE
- REVOKED
- UNVERIFIED

A device may hold valid local data while still having no authority to promote it to canonical state.

## Attack matrix

A. Network partition A/B
Expected: neither side without required quorum may promote a conflicting canonical root.

B. A/B both have majority due to stale membership views
Expected: membership/epoch overlap rule must prevent two canonical commits; otherwise protocol is unsafe.

C. Same key cloned onto A/B/C
Expected: apparent 3-of-3 signatures are not treated as independent authority.

D. One device signs R8a, later signs conflicting R8b for same scope/epoch
Expected: equivocation evidence; quarantine/revocation according to future authority grammar.

E. Device A offline advances local work
Expected: local branch remains non-canonical until explicit reconciliation/authority commit.

F. Device replacement A -> A2
Expected: explicit authorized incarnation transition; old A retired/revoked.

G. Device restored from stale backup
Expected: stale incarnation/epoch evidence prevents canonical rollback.

H. Membership change during partition
Expected: cannot silently change quorum membership on one side and authorize a conflicting root.

I. Quorum member compromised
Expected: safety depends on defined compromise threshold; if threshold exceeded, enter authority recovery rather than guessing.

## New invariant

CANONICAL_ROOT_COMMIT requires both:
1. valid root-transition evidence;
2. valid authority evidence for the current membership/incarnation configuration.

Neither alone is sufficient.

## Code/repository study
Canonical repository: snowdenxrp/aldea-ia / main.
Search of the canonical code for authority-epoch/recovery/CommitRecord terms did not establish a verified runtime implementation of this multi-device authority model. No implementation claim is made.

The code-study requirement remains: before architecture implementation, trace actual persistence, recovery, fencing, identity/incarnation, membership and external-effect boundaries. Documentation names are not evidence of runtime guarantees.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

## DO-NOT-REPEAT
- multiple signatures != independent quorum
- higher local epoch != canonical authority
- offline branch != canonical commit
- Merkle consistency != authority selection
- membership list != secure membership transition
- replacement != clone and clone != legitimate replacement
- majority without explicit membership/reconfiguration semantics is insufficient
- do not silently merge conflicting roots
- do not resolve forks by timestamp/arrival order
- no V21
- no unsupported formal/CI/fault-injection claims

## EXACT NEXT ACTION — AB104.204
Attack quorum reconfiguration and recovery:
1. membership add/remove;
2. overlapping quorums and transition epochs;
3. partition during reconfiguration;
4. compromised member removal;
5. device replacement and key rotation;
6. recovery when quorum is unavailable;
7. canonical-vs-offline branch reconciliation;
8. minimum authority evidence required to safely return from QUARANTINE.

Status: research-only.
