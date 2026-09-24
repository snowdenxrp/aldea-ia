# NEXO — Ordering-Root Failure, Byzantine Membership and Succession Determinacy V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack the mechanism that decides which trust-anchor succession is authoritative when the ordering mechanism itself is unavailable, partitioned, Byzantine, stale, or dependent on the candidate succession.

## 2. Central finding
A root-generation number, quorum count, timestamp, or locally observed majority is not by itself an authoritative ordering relation.

Core rule:
`ORDERING EVIDENCE != AUTHORITATIVE ORDER`.

A succession decision needs a protected ordering basis whose own currentness and failure assumptions are explicitly bounded.

## 3. New object: ConstitutionalOrderingContext
Candidate fields:
- ordering_domain_id
- constitutional_epoch
- ordering_generation
- membership_generation
- trust_set_generation
- predecessor_anchor
- successor_candidate_set
- conflict_set
- partition_context
- quorum_contract
- failure_domain_closure
- dependency/common-mode closure
- equivocation records
- cutoff
- ordering decision
- succession scope
- invalidations
- publication status.

## 4. Ordering states
`ORDERING_HEALTHY`
`ORDERING_DEGRADED`
`ORDERING_UNAVAILABLE`
`ORDERING_CONFLICTED`
`SUCCESSION_CANDIDATES_PRESENT`
`SUCCESSION_ORDERED`
`PREDECESSOR_FENCED`
`SUCCESSOR_PUBLISHED`
`AUTHORITY_UNRESOLVED`
`QUARANTINED`.

## 5. The deepest circularity
Danger:
R1 is candidate successor.
The ordering service decides R1 is current.
But the ordering service's own authority is derived from R1.

Graph:
R1 → ordering authority → R1.

This is unsupported circular authority.

Candidate invariant:
`NO_AUTHORITY_SCC_WITHOUT_INDEPENDENT_CONSTITUTIONAL_ROOT`.

An SCC can coordinate if an external root bounds it, but it cannot manufacture authority from its own members.

## 6. Membership is not merely a set
A quorum calculation needs context:
- membership generation;
- roles;
- key generations;
- signer identity;
- signer behavior/equivocation;
- target transition;
- property;
- transaction/causal context;
- ordering domain;
- root generation;
- revocation;
- dependency closure;
- composition contract.

Therefore:
`QUORUM_COUNT != QUORUM_AUTHORITY`.

## 7. Byzantine membership
A valid member can:
- equivocate;
- sign incompatible successors;
- withhold;
- collude;
- share compromised dependencies;
- present different state to different observers.

Thus:
`VALID_MEMBER != HONEST_MEMBER`.

A quorum contract must specify its Byzantine assumptions and evidence requirements rather than treating signatures as behavior guarantees.

## 8. Quorum intersection is not enough
Two quorum sets may intersect in one member but that member may be Byzantine or the shared dependency may be compromised.

Therefore:
`QUORUM_INTERSECTION != FAILURE_DOMAIN_INDEPENDENCE`.

And:
`QUORUM_INTERSECTION != BYZANTINE_SAFETY`
without the explicit membership/trust/fault assumptions required by the contract.

## 9. Common-mode ordering failure
Apparently separate ordering nodes can share:
- same root;
- same KMS;
- same identity provider;
- same policy;
- same update artifact;
- same storage;
- same clock;
- same operator;
- same coordination backend.

Then multiple votes can fail together.

The existing dependency-closure framework must therefore apply to the ordering domain itself.

## 10. Ordering root versus trust root
Separate:
`TRUST_ANCHOR`
`ORDERING_ANCHOR`
`AUTHORITY_ANCHOR`
`ASSURANCE_ROOT`
`ENFORCEMENT_ROOT`.

They may be co-located in a design, but that is a trust coupling, not proof of independence.

## 11. Ordering-root compromise
If the ordering root is compromised:
- freeze conflicting succession;
- invalidate ordering claims dependent on it;
- identify successor candidates;
- establish a new protected ordering basis;
- recompute root/authority currentness;
- fence stale branches;
- reconcile.

Historical ordering statements remain historical evidence but cannot automatically establish current order.

## 12. Ordering-root partition
During partition:
Branch A says:
R1 is current.

Branch B says:
R2 is current.

Both may possess locally valid evidence.

Until a protected ordering transition resolves the conflict:
`CURRENT_SUCCESSOR = UNKNOWN`.

Do not infer global currentness from local observation.

## 13. Highest-generation attack
Suppose:
R1 generation 10
R2 generation 11

If generation advancement is not protected by the same authoritative ordering domain, generation 11 can be fabricated or advanced on a stale branch.

Therefore:
`HIGHER_GENERATION != CURRENT_AUTHORITY`.

Generation is evidence only under a contract that protects its advancement.

## 14. Timestamp attack
Wall-clock timestamps cannot establish authority order across partitions without a separately specified trusted-time/ordering contract.

Therefore:
`LATER_TIMESTAMP != LATER_AUTHORITY`.

This is consistent with the existing architecture rule that EVENT_TIME and OBSERVATION_TIME are evidence context, not authoritative serialization.

## 15. Local majority attack
A branch may observe 3 of 5 members while the other branch observes a different 3 of 5 due to membership/configuration inconsistency.

Without a current membership generation and protected membership transition:
`LOCAL_MAJORITY != GLOBAL_AUTHORITY`.

## 16. Membership transition race
M0:
A B C D E

M1:
A B C F G

A quorum certificate created under M0 and another under M1 cannot be compared solely by count.

Membership transition must itself be an ordered protected transition.

## 17. Byzantine membership transition
A compromised authority can attempt:
M0 → M1
while another branch uses:
M0 → M2.

The resulting quorum evidence must retain membership provenance and branch context.

Compaction must preserve this conflict if currentness depends on it.

## 18. Succession determinacy
We need to distinguish:
1. Candidate eligibility.
2. Evidence that candidate is eligible.
3. Ordering of candidate transition.
4. Fencing of predecessor.
5. Publication of current successor.
6. Enforcement of predecessor cutoff.

Only after the required sequence can current authority be published.

## 19. Determinacy is a claim
Not every failure environment admits a unique current successor.

Candidate status:
`SUCCESSION_DETERMINATE`
or
`SUCCESSION_UNRESOLVED`.

The second is not an implementation failure; it can be the correct safety result under insufficient ordering information.

## 20. Bounded safety under ordering loss
When ordering is unavailable, the system can still enter a bounded safety envelope:
- freeze new constitutional transitions;
- stop authority amplification;
- maintain existing external fences where independently enforceable;
- preserve provenance;
- allow only pre-authorized safety actions;
- quarantine ambiguous branches.

This is safety-only mode, not normal authority.

## 21. Ordering recovery
Recovery sequence:
FREEZE
→ IDENTIFY ORDERING CONTEXTS
→ IDENTIFY CANDIDATE SUCCESSORS
→ BUILD JOINT ADC
→ DETECT COMMON-MODE
→ DETECT EQUIVOCATION
→ ESTABLISH MEMBERSHIP GENERATION
→ ESTABLISH AUTHORITATIVE ORDER
→ FENCE STALE BRANCHES
→ INVALIDATE STALE ASSURANCE
→ RECONCILE EFFECTS
→ RECOMPUTE CURRENTNESS
→ PUBLISH SUCCESSOR
→ EXPLICIT RELEASE.

## 22. No self-selected recovery branch
A recovery worker observing two branches cannot simply choose the branch whose provenance says it is current.

The recovery authority itself must be bounded by the constitutional ordering contract.

## 23. Ordering evidence and historical attribution
A signed ordering statement can remain valid historical evidence:
`at time T, actor X asserted order O`.

It does not automatically prove:
`O is the current authoritative order`.

This preserves the historical-attribution/current-authority distinction already established.

## 24. Ordering composition
If multiple ordering sources exist, composition must be explicit:
- same transition;
- same scope;
- same generation;
- same membership;
- compatible causal context;
- compatible root;
- failure-domain analysis;
- explicit operator.

No implicit union of ordering votes.

## 25. Ordering scope
An ordering decision for transition T1 cannot silently order unrelated transition T2.

Candidate:
`OrderingScope = (domain, transitions, objects, property, generation, context)`.

Cross-scope projection requires explicit compatibility/non-amplification proof.

## 26. Ordering and effect path closure
A succession decision can be logically ordered while stale branches still have effect-capable continuations.

Therefore:
`SUCCESSION_ORDERED != OLD_EFFECT_PATH_CONTAINED`.

Root succession must trigger required effect-path closure and enforcement verification.

## 27. Ordering and provenance compaction
A compacted ordering certificate must retain enough information to establish:
- who participated;
- under which membership;
- which root;
- which ordering domain;
- what conflict existed;
- what was cut off;
- why the surviving order was selected.

Otherwise the certificate is only an assertion.

## 28. Formal model implications
Future model must include:
- ordering domain;
- membership generations;
- Byzantine members;
- equivocation;
- common-mode dependencies;
- partition;
- candidate roots;
- competing successor transitions;
- membership transition;
- protected ordering;
- fencing;
- compaction.

Candidate invariants:
`NoSelfOrderingAuthority`
`UnorderedSuccessorsImplyAuthorityUnresolved`
`GenerationCannotCreateAuthorityWithoutProtectedAdvancement`
`QuorumCountCannotAloneCreateAuthority`
`MembershipGenerationBindsQuorumEvidence`
`OrderingScopeCannotWidenAuthority`
`OrderingLossCannotAmplifyAuthority`
`StaleOrderingCannotPublishCurrentSuccessor`.

TLC is designed to exhaustively explore finite instantiations and check invariants; Lamport's material also emphasizes that model checking operates on the modeled state space, so omitted failure modes remain outside what has been checked. citeturn0search24turn0search0

## 29. New synthesis
The architecture now requires an explicit distinction:

`TRUST VALIDITY`
`ORDERING VALIDITY`
`CURRENT AUTHORITY`

None can be inferred solely from another.

The critical protected question becomes:

"Which transition, under which constitutional context, establishes the unique current ordering for this exact succession scope?"

If no protected answer exists:
`AUTHORITY_UNRESOLVED`.

## 30. Open gaps
OR-G1 Formal ordering-root succession.
OR-G2 Byzantine ordering membership model.
OR-G3 Membership transition + root rotation composition.
OR-G4 Common-mode dependency closure for ordering.
OR-G5 Formal quorum contract semantics.
OR-G6 Split-brain ordering finite model.
OR-G7 Ordering scope/refinement mapping.
OR-G8 Safety-only behavior under permanent ordering loss.
OR-G9 Recovery authority under unresolved ordering.
OR-G10 SANY/TLC/TLAPS validation.

## 31. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.