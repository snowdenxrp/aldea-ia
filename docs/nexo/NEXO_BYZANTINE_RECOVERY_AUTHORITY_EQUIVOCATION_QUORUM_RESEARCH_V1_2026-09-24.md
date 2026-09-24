# NEXO BYZANTINE RECOVERY AUTHORITY EQUIVOCATION QUORUM RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## External cross-check
Classical BFT consensus separates Byzantine agreement from ordinary crash-fault consensus. HotStuff is a leader-based BFT protocol for partial synchrony; generalized-quorum research shows that threshold counts are only one trust model and that quorum structure can encode richer trust assumptions. Raft, by contrast, is a crash-fault consensus model and its majority/intersection properties must not be transplanted into a Byzantine threat model without changing assumptions. citeturn1academia0turn1academia1turn0search1

## Core result
A valid credentialed recovery participant can equivocate. Therefore:

VALID_CREDENTIAL != HONEST_BEHAVIOR
SIGNATURE_VALID != UNIQUE_AUTHORITY
QUORUM_COUNT != BYZANTINE_SAFETY

A recovery authority contract must define a fault model, quorum/intersection rule, evidence of non-equivocation or detectable equivocation, and the consequences of exceeding the tolerated Byzantine bound.

## 1. Equivocation attack
Recovery member M is legitimately authorized.

M tells A:
"B approved E21"

M tells B:
"A approved E22"

M signs both statements.

A and B each see a locally valid certificate.

If either side treats a valid signature as sufficient authority, two conflicting recovery transitions can become current.

Therefore:
EQUIVOCATION_BY_VALID_MEMBER -> AUTHORITY_CONFLICT

## 2. Why ordinary majority is insufficient
In a crash-fault model, a majority can prevent two committed histories when the protocol's assumptions hold. Raft explicitly relies on overlapping majorities for membership-change safety. citeturn0search1

For Byzantine recovery, however, the quorum rule must account for malicious members and conflicting signatures. BFT protocols use stronger quorum/intersection assumptions; HotStuff is an example of a partially synchronous BFT design. citeturn1academia0

Nexo therefore must not define:
CURRENT = signatures >= majority

without first defining:
- membership;
- tolerated Byzantine count;
- quorum intersection;
- authentication;
- equivocation handling;
- trust/failure domains;
- transition semantics.

## 3. Candidate Byzantine recovery envelope
Recovery transition R is admissible only if:

1. issuer is within current recovery membership;
2. issuer identity/incarnation is current;
3. required quorum is satisfied;
4. quorum satisfies the claim's intersection rule;
5. signatures bind the exact transition;
6. signatures bind predecessor/current authority;
7. signatures bind recovery epoch;
8. signatures bind membership/configuration;
9. conflicting approvals are detectable;
10. any known equivocation invalidates or quarantines the affected transition according to the contract.

## 4. Equivocation evidence
Candidate object:
EquivocationRecord

Fields:
- member_id;
- member_incarnation;
- conflicting_statement_ids;
- authority_epoch;
- transition_scope;
- signatures;
- observation context;
- detection source;
- detection generation;
- invalidation effect;
- dependency/common-mode context.

Important distinction:
EQUIVOCATION_DETECTED != GLOBAL_HISTORY_KNOWN

A local detector can prove that a member signed conflicting statements if it possesses both signatures. It cannot automatically prove that no other conflicting statement exists elsewhere.

## 5. Quorum intersection must be claim-specific
A quorum is not merely a number.

Candidate:
RecoveryQuorumContract

Fields:
- membership;
- tolerated_fault model;
- required threshold/intersection;
- trust domains;
- failure domains;
- membership generation;
- transition generation;
- evidence requirements;
- equivocation policy;
- recovery scope.

This prevents a single hard-coded "2-of-3" from being reused under incompatible trust assumptions.

## 6. Byzantine member does not automatically invalidate everything
If M equivocates, the system should not blindly erase all historical evidence from M.

Separate:
- historical authenticity of a signature;
- authority validity of the signed transition;
- current authority;
- assurance impact;
- recovery eligibility.

A signature can remain valid evidence that M signed two statements while both statements become unusable for current authority.

## 7. Detectable equivocation as a safety resource
If the protocol makes conflicting signatures publicly verifiable, equivocation can become evidence for fencing/removal.

Candidate transition:
DETECTED_EQUIVOCATION
→ FREEZE_MEMBER
→ INVALIDATE_DEPENDENT_RECOVERY_CANDIDATES
→ RECOMPUTE_QUORUM
→ CHECK_INTERSECTION
→ CONTINUE ONLY IF CONTRACT STILL SATISFIED
otherwise
→ AUTHORITY_UNRESOLVED

## 8. Byzantine recovery during partition
Partition plus Byzantine behavior is especially dangerous:

A sees quorum Q_A.
B sees quorum Q_B.
A Byzantine member signs both.

The fact that each side has a local quorum does not prove that both quorums satisfy the global safety intersection required by the recovery contract.

Therefore:
LOCAL_QUORUM != GLOBAL_AUTHORITY

and:
LOCAL_CERTIFICATE != CURRENT_RECOVERY_AUTHORITY

unless the protected ordering/quorum contract establishes the required intersection.

## 9. Recovery epoch uniqueness
An epoch number must bind to:
- issuer;
- quorum/certificate;
- predecessor;
- membership generation;
- issuance context.

Two certificates both claiming E21 are not necessarily the same epoch.

Candidate identity:
RecoveryEpochIdentity = (epoch_number, authority_domain, certificate_fingerprint)

The number alone is not authority.

## 10. Conflicting certificates
Suppose:
C_A approves E21/A.
C_B approves E21/B.

Both are individually valid signatures.

If neither dominates under the recovery ordering contract:
CURRENT = UNKNOWN

Do not choose by:
- timestamp;
- lexicographic ID;
- message arrival;
- larger signature count;
- local generation.

Conflict resolution must itself be an authorized protected transition.

## 11. Membership change under Byzantine recovery
Changing membership is itself an authority transition.

A direct:
M_old -> M_A

while another partition creates:
M_old -> M_B

can produce incompatible authority paths.

A safe design needs either:
- an overlapping transition contract analogous to joint consensus;
- or another externally protected mechanism that makes the transition unique.

This is an analogy to Raft's overlapping-majority membership change, not a prescription to implement Raft. citeturn0search1

## 12. Common-mode Byzantine failures
Even a mathematically sufficient quorum may be weaker than assumed if multiple members share a common compromise domain.

Candidate rule:
QUORUM_INTERSECTION != FAILURE_DOMAIN_INDEPENDENCE

If five members share one compromised administrator, treating them as five independent security domains is unsound for claims threatened by that administrator.

This extends the existing IndependenceVector and common-mode closure.

## 13. Generalized trust structure
The generalized-quorum literature is relevant because it explicitly models trust assumptions beyond a single threshold. This supports a Nexo design where recovery authority is defined by a trust structure rather than a universal integer threshold. citeturn1academia1

Candidate:
RecoveryTrustFormula

Examples:
- threshold;
- weighted threshold;
- organizational diversity;
- disjoint failure domains;
- AND/OR composition;
- mandatory witness plus quorum;
- human governance quorum plus machine quorum.

Any such formula must be bound to the current membership and context.

## 14. No universal BFT number
Nexo must not hard-code "3f+1" as a universal architecture rule.

That bound belongs to specific BFT models and assumptions. Nexo's recovery graph may include heterogeneous trust domains, external witnesses, human governance and resource-side enforcement.

The architecture should therefore store the actual fault model and quorum contract instead of hiding it behind a number.

## 15. Safety-only response when quorum is uncertain
If quorum validity cannot be established:
- freeze protected publication;
- fence affected recovery candidates;
- preserve evidence;
- record conflict;
- continue non-authoritative observation;
- await an authorized ordering/recovery mechanism.

Candidate state:
RECOVERY_QUORUM_UNKNOWN

This is distinct from:
RECOVERY_QUORUM_FAILED

because the latter may have a known violated threshold, while UNKNOWN means the system cannot establish the required facts.

## 16. Byzantine recovery state machine
NORMAL
→ AUTHORITY_DEGRADED
→ RECOVERY_CANDIDATE
→ QUORUM_EVALUATION
→ RECOVERY_TRANSITION
→ CURRENT

Failure branches:
QUORUM_EVALUATION → QUORUM_UNKNOWN
QUORUM_EVALUATION → QUORUM_INVALID
RECOVERY_TRANSITION → EQUIVOCATION_DETECTED
RECOVERY_TRANSITION → AUTHORITY_CONFLICT
all protected failure branches → AUTHORITY_UNRESOLVED / QUARANTINED

No path from locally valid certificate directly to CURRENT.

## New invariants
BR-01: Valid credentials do not imply non-Byzantine behavior.
BR-02: A valid signature does not establish unique current authority.
BR-03: Quorum size is meaningful only under an explicit fault and trust model.
BR-04: Recovery quorum contracts must bind membership and generation.
BR-05: Conflicting signed recovery statements must be detectable and handled explicitly.
BR-06: Equivocation detection invalidates or constrains affected authority according to the protected contract.
BR-07: Local quorum does not imply global authority under partition.
BR-08: Epoch numbers alone do not establish epoch authority.
BR-09: Common-mode compromise can invalidate assumed quorum independence.
BR-10: Membership changes are authority transitions.
BR-11: Recovery conflicts must fail closed when no protected ordering rule resolves them.
BR-12: Historical authenticity of a Byzantine signature is distinct from current authority validity.
BR-13: Unknown quorum state cannot be promoted to valid quorum by absence of contradictory evidence.
BR-14: RecoveryTrustFormula must be current-context bound.
BR-15: No universal quorum threshold may be treated as architecture-independent proof.

## Candidate objects
- RecoveryQuorumContract
- RecoveryTrustFormula
- EquivocationRecord
- RecoveryEpochIdentity
- RecoveryCertificate
- RecoveryMembershipGeneration
- RecoveryQuorumEvidence
- AuthorityConflictRecord
- ByzantineRecoveryContext
- RecoveryQuorumUnknownState

## Architecture consequence
AuthorityFoundation now requires an explicit Byzantine fault model if Byzantine participants are in scope.

Its contract must answer:
1. Which members can be Byzantine?
2. How many?
3. Which failure domains must be independent?
4. What quorum/intersection relation is required?
5. How is equivocation detected?
6. What happens when the bound is exceeded?
7. How are membership transitions ordered?
8. What external root can recover authority if the BFT domain itself is compromised?

If these are unspecified, Nexo cannot honestly claim Byzantine-safe recovery.

## Open boundary
Next attack:
BYZANTINE QUORUM + COMMON-MODE COMPROMISE + ROOT ROTATION + MEMBERSHIP CHANGE.

A quorum may satisfy its mathematical threshold while the trust domains share a compromised root, administrator, update source, or recovery authority.

Question:
Can a single protected recovery contract simultaneously encode quorum intersection, failure-domain independence, root continuity, membership transition safety and Byzantine equivocation without creating a circular trust assumption?

No correctness guarantee is claimed.
