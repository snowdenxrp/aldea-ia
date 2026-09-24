# NEXO ASSURANCE PUBLICATION LINEARIZATION, SPLIT-BRAIN AND ROLLBACK RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## External cross-check
Linearizable distributed state provides a single-ordering illusion for concurrent operations; etcd documents that linearizable operations reflect current consensus, while serializable member-local reads may be stale. etcd also assigns increasing revisions that act as a logical clock, and transactions atomically guard updates with comparisons against current state. citeturn0search0turn0search2

## Core result
The assurance publication boundary cannot safely rely on a locally monotonic counter alone.

If two publishers can both independently advance:
`G -> G+1`
then local monotonicity does not establish global uniqueness/currentness.

Candidate rule:
`LOCAL_MONOTONICITY != GLOBAL_PUBLICATION_AUTHORITY`

## 1. Split-brain publication attack
Scenario:
- Publisher A has assurance generation G.
- Publisher B also has generation G.
- Partition occurs.
- A publishes G+1.
- B publishes G+1.
- each is locally monotonic.
- different consumers observe different G+1 records.

Therefore generation numbers alone do not establish a unique current assurance.

## 2. Required distinction
Separate:
- `generation`: ordering identifier;
- `publication authority`: right to make the current state authoritative;
- `currentness`: relation to the accepted authority state;
- `supersession`: proof that one state replaces another;
- `identity`: which publisher/resource incarnation created the record.

A generation number cannot substitute for publication authority.

## 3. Candidate linearization boundary
A strong current-assurance claim needs a serialization point for the authoritative publication transition.

Candidate:
`AssuranceAuthorityRegister`

Properties:
- one current authority epoch;
- one accepted publisher/term at a time;
- monotonic authority epoch;
- compare-and-swap or equivalent atomic admission;
- old publisher cannot publish as current after authority loss;
- recovery must not resurrect an older authority epoch;
- publication records bind to the authority epoch.

This is analogous to using a linearizable coordination primitive for the current-state transition, not merely a local counter. etcd's documented transactions and revisions illustrate the distinction between atomic guarded mutation and merely reading a local/stale view. citeturn0search0turn0search2

## 4. Fencing the publisher
Even if authority changes from A to B, A can remain alive after a partition.

Therefore the publisher itself requires fencing:
`Publisher A -> epoch E1`
`Publisher B -> epoch E2`

The publication boundary must reject records from E1 once E2 is authoritative.

Candidate invariant:
`OLD_PUBLISHER_MUST_NOT_PUBLISH_CURRENT_ASSURANCE`.

The final publication store must enforce this, rather than relying on A voluntarily stopping.

## 5. Generation vs authority epoch
Do not collapse:
`assurance_generation`
and
`authority_epoch`.

Example:
- A/E10 publishes G100.
- B/E11 takes over.
- B may legitimately publish G1 in its own local sequence while globally being newer than A/G100.

Therefore a global currentness relation needs something like:
`(authority_epoch, publication_sequence)`
not merely `generation`.

If a single global sequence is available from a linearizable authority register, it can serve as the ordering anchor. Otherwise the pair must be explicitly ordered by the authority protocol.

## 6. Rollback attack
Suppose authoritative state is:
`E11/G150`.

Storage rollback restores:
`E10/G149`.

If the restored publisher can publish this state as current, an older assurance becomes authoritative again.

Therefore:
`STORAGE_ROLLBACK != AUTHORITY_ROLLBACK`.

Authority state needs rollback protection or an external monotonic anchor.

## 7. Recovery attack
Recovery node loads an old snapshot and believes it is current.

Safe recovery must establish:
1. current authority epoch;
2. current publisher fence;
3. current trust/root context;
4. current policy generation;
5. current resource incarnations;
6. current assurance invalidation set;
7. current external reconciliation status.

Only then may it publish a new assurance generation.

Candidate rule:
`RECOVERED_STATE -> REVALIDATE -> NEW_PUBLICATION`
not
`RECOVERED_STATE -> RESUME_AS_CURRENT`.

## 8. Consumer split-brain
Even if the publisher is unique, consumers may cache different current assurances:
- C1 sees G+1;
- C2 sees G;
- C3 sees G+1 from old authority.

Consumers must therefore validate the authority epoch/currentness of the bundle rather than treating the largest locally observed generation as authoritative.

`MAX_SEEN_GENERATION != CURRENT_ASSURANCE`.

## 9. Late old publication
A delayed message from an old publisher may arrive after recovery.

It can be authentic and historically valid but must not supersede current state.

Candidate decision:
`VALID_SIGNATURE + OLD_AUTHORITY_EPOCH -> HISTORICAL_ONLY / REJECT_CURRENT_PUBLICATION`.

## 10. Two valid publishers
If two publishers possess valid credentials simultaneously, credentials alone cannot determine which one is current.

Currentness must be bound to an authoritative epoch/lease/fencing contract.

Therefore:
`VALID_PUBLISHER_CREDENTIAL != CURRENT_PUBLICATION_AUTHORITY`.

## 11. Authority register compromise
The authority register itself becomes a critical trust boundary.

If compromised, assurance currentness can no longer be strongly established through that register alone.

Therefore its compromise must trigger:
`AUTHORITY_ROOT_COMPROMISE`
→ `INVALIDATE_CURRENTNESS_CLAIMS`
→ `FENCE_PUBLISHERS`
→ `REESTABLISH_AUTHORITY`
→ `RECOMPUTE_ASSURANCE`.

The architecture must not silently promote the register to an unquestionable root.

## 12. No circular publication proof
A publisher cannot prove that it is current solely by presenting an assurance that says it is current.

Candidate rule:
`CURRENT_CLAIM_USED_AS_CURRENT_AUTHORITY_PROOF -> DENY`.

Currentness must be established by a separate protected authority mechanism or an explicitly defined consensus/linearization contract.

## 13. Publication state machine
Candidate states:
`UNAUTHORIZED`
→ `CANDIDATE`
→ `ADMITTED(EPOCH)`
→ `COMPOSED(G)`
→ `PUBLISHED(G,EPOCH)`
→ `SUPERSEDED(G')`
→ `REVOKED`
→ `HISTORICAL`

Forbidden transitions include:
- HISTORICAL -> PUBLISHED without a new authority admission;
- REVOKED -> CURRENT;
- old epoch -> current without authority re-establishment;
- candidate evidence -> published assurance without composition validation.

## 14. Atomic publication
The publication transition should atomically bind at least:
- authority epoch;
- publisher identity;
- assurance generation;
- claim;
- evidence-set digest;
- dependency closure digest;
- trust context;
- resource incarnation set;
- invalidation/supersession metadata.

A partially updated record must never be observable as a current assurance.

## 15. Compare-and-swap admission
A conceptual publication operation:
`IF current_authority_epoch == E AND publisher_fence == F AND current_generation == G THEN publish G+1 ELSE reject`.

The comparison and publication must share the same atomicity boundary.

A read followed later by a write is insufficient under concurrent takeover.

## 16. Quorum does not automatically solve publication
Multiple publishers voting locally does not establish a safe current state unless their voting protocol itself has a defined consistency/fault model.

Therefore:
`N_PUBLISHERS != N_CURRENT_AUTHORITIES`.

If a consensus protocol is selected, its safety assumptions become part of the assurance dependency closure.

## 17. Partition semantics
During a partition, the safest behavior for a publisher unable to establish current authority is:
`NO_NEW_CURRENT_ASSURANCE`.

It may continue producing:
- candidate evidence;
- historical observations;
- locally labeled provisional bundles.

But those must not be promoted to authoritative currentness without revalidation.

This is an intentional availability tradeoff for a safety-critical claim.

## 18. Monotonicity dimensions
Nexo now needs to distinguish:
- evidence monotonicity;
- fence monotonicity;
- authority monotonicity;
- assurance generation monotonicity;
- trust-root monotonicity;
- resource-incarnation monotonicity;
- invalidation monotonicity.

One monotonic dimension cannot substitute for another.

## 19. Candidate AuthorityAnchor
Object:
`AssuranceAuthorityAnchor`

Properties:
- globally ordered authority epoch;
- publisher fence token;
- durable high-water mark;
- rollback detection;
- authority transition record;
- trust-root context;
- recovery generation;
- invalidation generation.

It is not itself world truth; it anchors the authority of the assurance publication layer.

## 20. Candidate PublicationCertificate
A publication certificate can bind:
`Claim + EvidenceDigest + DependencyClosure + Context + AuthorityEpoch + PublicationSequence`.

Its validity means:
"this exact assurance bundle was admitted under this authority context."

It must not mean:
"the external world definitely satisfies the claim."

## 21. New invariants
AP-01: Local generation monotonicity does not establish global currentness.
AP-02: Assurance generation and authority epoch are distinct dimensions.
AP-03: Current assurance requires an authoritative publication boundary.
AP-04: Old publishers must be fenced from publishing current assurance.
AP-05: Storage rollback must not restore current authority.
AP-06: Recovery must re-establish authority before current publication.
AP-07: Maximum observed generation does not imply current assurance.
AP-08: Authentic old evidence may remain historical but cannot silently become current.
AP-09: Valid publisher credentials do not establish current publisher authority.
AP-10: Publication admission and currentness must not depend circularly on the assurance being published.
AP-11: Current publication must bind authority epoch, publisher fence and evidence/dependency context atomically.
AP-12: Partitioned publishers cannot publish authoritative current assurance without an accepted authority transition.
AP-13: Publication rollback is distinct from evidence rollback and requires its own monotonicity protection.
AP-14: A compromised authority register invalidates dependent currentness claims.
AP-15: Assurance composition must never widen the authority granted to the publisher.

## Candidate objects
- AssuranceAuthorityRegister
- AssuranceAuthorityAnchor
- AuthorityEpoch
- PublisherFence
- PublicationCertificate
- AssurancePublicationRecord
- AuthorityTransitionRecord
- CurrentnessProof
- PublicationInvalidationRecord
- RecoveryAuthorityCheckpoint

## Architecture consequence
The assurance stack now has an explicit publication-authority layer:

`Evidence`
→ `AssuranceComposition`
→ `AuthorityAdmission`
→ `AtomicPublication`
→ `CurrentnessValidation`

The publication layer cannot use the assurance it is publishing as its own authority proof.

## Open boundary
Next attack:
`AUTHORITY REGISTER FAILURE / CONSENSUS LOSS / QUORUM PARTITION / RECOVERY CONFLICT`.

Question:
What is the minimum authority substrate required to prevent two valid publishers from becoming current simultaneously, while still allowing safe recovery after total loss of the previous publisher?

No correctness guarantee is claimed.
