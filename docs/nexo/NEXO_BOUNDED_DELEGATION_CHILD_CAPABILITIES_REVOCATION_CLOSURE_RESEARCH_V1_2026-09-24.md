NEXO - BOUNDED DELEGATION / CHILD CAPABILITIES / REVOCATION CLOSURE / QUEUED WORK / RESOURCE REPLACEMENT / CRASH-RESTORE RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

QUESTION
Can a child capability outlive revocation of its parent without creating an authority escape, and what bounded delegation model closes every descendant path?

WEB CROSS-CHECKS
RFC 9700 recommends least privilege, audience restriction and sender-constrained access tokens; it also recommends refresh-token rotation or sender constraint for public clients. These are useful analogies for Nexo's need to bind delegated authority to scope, recipient and continuity. They are not a direct architectural prescription for Nexo. cite: turn0search0, turn0search24.
RFC 7009 specifies token revocation and explicitly notes that propagation delay can exist between servers, which supports distinguishing revocation intent from effective enforcement. It also allows revocation of related tokens/grants depending on policy. cite: turn0search1.
RFC 6749 requires resource servers to validate presented access tokens, and describes refresh-token rotation where the previous token is invalidated while the relationship is retained. This supports validating delegated credentials at their use boundary rather than trusting historical issuance alone. cite: turn0search2.

CORE RESULT
Unbounded child capability inheritance is incompatible with strong revocation unless every descendant effect path crosses a terminating enforcement boundary.
The minimum safe model is not 'parent revoked => magically all descendants revoked'.
It is:
DELEGATION = NEW AUTHORITY TRANSITION.
Each child carries a bounded lineage and exact authority envelope.
Revocation closes the entire descendant effect-path closure or the architecture explicitly limits the claim to a boundary that guarantees stale descendants cannot produce protected effects.

KEY SEPARATIONS
PARENT_AUTHORITY != CHILD_AUTHORITY.
CHILD_EXISTENCE != CHILD_CURRENT_AUTHORITY.
REVOCATION_REQUESTED != DESCENDANTS_REJECTED.
DESCENDANT_REVOKED != EXTERNAL_EFFECT_STOPPED.
CAPABILITY_INVALIDATED != HISTORICAL_EFFECT_ERASED.
RESOURCE_REPLACEMENT != CHILD_CAPABILITY_TRANSFER.

DELEGATION ATTACK
K0 parent capability.
K0 delegates K1.
K1 delegates K2.
K2 queues Q2.
Parent claim degrades.
K0 revoked.
K1 cache remains valid.
K2 remains queued.
Resource R1 is replaced by R2.
Old worker resumes after crash.
If any path still accepts K2, parent revocation has not actually closed the protected descendant path.

BOUNDED DELEGATION MODEL
Candidate delegation contract requires:
- maximum depth or an equivalent terminating boundary;
- explicit scope attenuation at every child;
- no privilege amplification;
- audience/target restriction;
- effect-class restriction;
- resource/incarnation restriction where relevant;
- temporal/lifetime restriction;
- parent lineage/reference;
- revocation generation;
- fence generation;
- continuity context;
- non-delegable authority classes;
- explicit delegation policy;
- audit/provenance;
- child revocation semantics.

ATTENUATION
Child scope must be a subset of the parent-authorized envelope unless a distinct protected transition explicitly grants additional authority.
Candidate:
ChildScope ⊆ ParentDelegableScope.
ChildEffectClasses ⊆ ParentDelegableEffectClasses.
ChildResources ⊆ ParentDelegableResources.
ChildLifetime <= ParentDelegableLifetime.
ChildDelegationDepth < ParentRemainingDepth.

NO PRIVILEGE AMPLIFICATION
A child cannot obtain a stronger claim than its parent possessed.
Parent RESOURCE_SAFE cannot delegate MISSION_SAFE.
Parent scope R1 cannot delegate R2.
Parent fence generation cannot authorize an incompatible newer resource incarnation.

DELEGATION AS EFFECT
Minting K1 is itself a protected authority transition.
It must have:
- current parent authority;
- current parent claim strength;
- current scope;
- current policy;
- current revocation generation;
- current fence;
- current resource incarnation;
- current delegation budget.
Therefore:
MINT_CHILD != LOCAL_MEMORY_WRITE.

CHILD CAPABILITY IDENTITY
Candidate ChildCapabilityIdentity:
- child_id;
- parent_id;
- delegation_lineage_id;
- depth;
- parent_authority_epoch;
- child_authority_epoch;
- claim set;
- minimum claim strength;
- effect classes;
- target/resource scope;
- resource incarnations;
- fence generations;
- revocation generation;
- continuity context;
- issue linearization;
- expiry;
- revocation state;
- delegation rights.

REVOCATION CLOSURE
Candidate closure:
REVOCATION_CLOSURE(K0) = K0 + all descendants + all delegated authority artifacts + queued work + retries/redrives + provider continuations + cached copies + child controllers + resource bindings capable of producing protected effects.
If closure cannot be computed completely, the strong revocation claim is unavailable unless a terminating boundary makes the unresolved descendants unable to affect the protected claim.

REVOCATION STRATEGIES
R0 EXPLICIT TREE WALK: revoke descendants individually. Precise but potentially expensive.
R1 GENERATION REVOCATION: parent generation advances; descendants bound to old generation become stale. Scalable if every enforcement boundary checks the generation.
R2 CAPABILITY-TREE FENCE: resource/provider rejects any capability whose lineage root generation is stale.
R3 SHORT-LIVED CHILD: lifetime bounds residual authority. This reduces exposure but does not prove immediate revocation.
R4 TERMINATING BOUNDARY: internal descendant state may be unknown, but every protected effect must cross a boundary that rejects stale lineage.
R5 HYBRID: generation + bounded lifetime + resource-side fence + explicit descendant closure for critical effects.
R1/R2/R4 are the strongest architectural candidates when actual enforcement exists. No universal selection is made yet.

IMPORTANT
Expiration is not revocation.
Short lifetime bounds stale authority but does not necessarily make it immediately unusable.
RFC 7009 explicitly recognizes propagation delay after revocation, illustrating why 'revocation requested' and 'every consumer now rejects it' are separate properties. cite: turn0search1.

GENERATION ROOT
Candidate root_revocation_generation belongs to the protected delegation domain.
When parent authority changes:
G10 -> G11.
All descendants bound to G10 become non-current for future protected use unless a documented migration/continuation rule proves compatibility.
This avoids requiring an unbounded graph traversal if every use boundary enforces the root generation.

BUT GENERATION ALONE IS NOT ENOUGH
A child with generation G11 can still be wrong if:
- resource incarnation changed;
- target changed;
- effect class changed;
- policy/invariant changed;
- boundary changed;
- trust root changed;
- continuity broke;
- dependency closure changed.
Thus:
CURRENT_GENERATION != CURRENT_AUTHORITY.

RESOURCE REPLACEMENT
K1 targets R1@incarnation1.
R1 retires.
R2 appears with same logical name.
K1 cannot silently target R2.
Need explicit transfer/continuation transition:
RETIRE R1 -> ESTABLISH R2 INCARNATION -> VERIFY BOUNDARY -> CHECK EFFECT COMPATIBILITY -> REVALIDATE AUTHORITY -> NEW BINDING.

QUEUED CHILD WORK
A queue entry containing K1 is itself a delegated authority artifact.
Queue admission must bind the current generation/context.
At dequeue/execution, the worker/resource must revalidate currentness or use an enforceable stale-token rejection mechanism.
Queue visibility/emptiness is not enough.
QUEUE_EMPTY != REVOCATION_COMPLETE.

PROVIDER REDRIVE
Provider may retry K1 after Nexo has revoked it.
Provider-generated retries therefore belong to revocation closure.
If provider cannot bind retries to the current generation or accept revocation/fencing, strong revocation may be impossible for that effect class.

CHILD AFTER PARENT CRASH
Parent crashes after issuing K1 but before recording the child.
Recovery cannot assume K1 did not exist.
Possible world: K1 was accepted by downstream provider.
Therefore recovery must reconcile the external delegation boundary and reconstruct/revoke the relevant lineage.

PARENT CRASH AFTER CHILD USE
K1 was legitimately used before parent crash.
Crash does not erase history.
Recovery evaluates future K1 use against current lineage and revocation generation.

ROLLBACK / RESURRECTION
Rollback of a capability store can resurrect K1 or old root generation.
Continuity anchor must prevent old generation from becoming current again.
Otherwise:
G10 -> G11 -> rollback -> G10
creates ABA authority resurrection.

DELEGATION TRANSFER
Transfer of parent authority does not automatically transfer every child.
Candidate policy:
OLD_PARENT -> CHILD_STATE = HISTORICAL/REVALIDATE.
NEW_PARENT must explicitly reacquire/reattach children through a protected transition.
This avoids invisible authority inheritance across ownership changes.

BREAK-GLASS DELEGATION
Break-glass may create a temporary child capability only if:
- exact scope;
- bounded lifetime;
- no unbounded delegation unless separately approved/proven;
- current resource incarnation;
- current fence;
- explicit mission-risk policy;
- audit;
- post-action reconciliation;
- automatic invalidation at expiry/revocation.

CAPABILITY LINEAGE
Candidate lineage graph:
K0 -> K1 -> K2 -> ... -> Kn.
Every node has attenuation metadata.
Strong claim requires either complete lineage closure or a root-generation enforcement boundary at every effect-capable endpoint.

TERMINATING BOUNDARY
Most important scalability result:
Nexo does not necessarily need to enumerate every child if every protected effect must cross a boundary that checks the delegation root generation/lineage.
This converts an unbounded internal graph problem into a bounded enforcement-boundary problem.
But the boundary itself becomes TCB and must be included in failure-domain, update, recovery, bypass and continuity closure.

DELEGATION DEPTH
Depth can be:
D0 non-delegable;
D1 one child;
Dn finite maximum;
DB bounded by terminating boundary rather than numeric depth.
Numeric depth alone is not enough if a child can create an external effect through a path that escapes the enforcement boundary.

CHILD CAPABILITY + CLAIM DEGRADATION
If parent claim changes:
GLOBAL_SAFE -> RESOURCE_SAFE
child requiring GLOBAL_SAFE becomes invalid.
Child requiring only RESOURCE_SAFE may remain valid if its exact scope is still current.
This is selective invalidation, not global destruction.

CLAIM STRENGTH ATTENUATION
Candidate:
RequiredClaimStrength(child) <= ParentDelegableClaimStrength.
A child can be narrower but not stronger.
Promotion to a stronger claim requires a new independent assurance/authority transition.

COMMON-MODE DELEGATION
If parent and child authority rely on the same compromised trust root, creating two identities does not create independence.
Delegation graph therefore includes trust/dependency edges, not only parent-child edges.

FORMAL MODEL CANDIDATE
Objects:
CapabilityNode, DelegationLineage, RevocationGeneration, CapabilityScope, CapabilityUse, ResourceIncarnation, ProviderContinuation, QueueEntry, FenceState, ContinuityContext.
Relations:
DelegatesTo, Attenuates, RevokedBy, Targets, EnqueuedAs, RetriesAs, RedrivesAs, ContinuesAs, BoundToIncarnation, FencedBy, InvalidatedBy.
State:
capability_status, generation, depth, scope, target, incarnation, fence, revocation, continuity.

CORE SAFETY PROPERTY
Every protected effect produced using child K must satisfy:
CURRENT(K) AND ATTENUATED_FROM_VALID_PARENT(K) AND REVOCATION_CURRENT(K) AND TARGET_CURRENT(K) AND RESOURCE_INCARNATION_CURRENT(K) AND FENCE_CURRENT(K).

REVOCATION SAFETY PROPERTY
After protected parent revocation linearizes, no descendant capability that depends on the revoked authority may produce a new protected effect unless a new protected transition explicitly reauthorizes it.
This is a candidate property, not formally verified.

CRITICAL RACE CASES
A parent revocation vs child issuance.
If revocation wins -> child denied.
If child issuance wins -> child is historical issuance and must be evaluated against subsequent revocation before use.
Unknown order -> authoritative ordering or stale-child fence required.

B parent revocation vs child use.
If use wins -> historical effect.
If revocation wins -> use denied.
Unknown -> no strong authorization without equivalent enforcement.

C child queued vs resource replacement.
Old queue entry cannot transfer automatically to new incarnation.

D parent rollback vs child generation.
Old parent state cannot resurrect descendants.

E recovery vs child revocation.
Recovery must establish current root generation before publishing current child authority.

NEW OBJECT: DelegationEnvelope
Fields: envelope_id; root_capability; allowed child classes; maximum/terminating boundary; attenuation rules; delegation depth; target/resource scope; claim-strength ceiling; revocation root; fence set; continuity context; lifetime; invalidation triggers; update/recovery semantics; audit.

NEW OBJECT: RevocationClosure
Fields: closure_id; root capability; impacted descendants; queue/provider/delegation paths; effect classes; resource scope; generation; boundary set; unresolved paths; propagation status; enforcement verification; continuity context.

NEW OBJECT: CapabilityLineageContext
Fields: lineage_id; root_id; parent_id; child_id; generation; authority epochs; claim context; scope; target/incarnation; fence; policy/invariant; dependency closure; continuity; issue/use references.

CANDIDATE INVARIANTS INV-DEL-01..45
01 delegation is a protected authority transition.
02 child authority is never stronger than parent delegation envelope.
03 child scope is attenuated or separately reauthorized.
04 child claim strength cannot exceed parent claim strength.
05 child target scope cannot exceed parent target scope.
06 child resource incarnation cannot silently change.
07 child lifetime cannot exceed parent delegable lifetime unless separately authorized.
08 child delegation depth is bounded or covered by a terminating boundary.
09 parent revocation closes descendant authority.
10 revocation request is not descendant enforcement.
11 descendant stale use is rejected at the effect boundary.
12 queued child work is part of revocation closure.
13 provider retry/redrive is part of revocation closure.
14 cached child capabilities are part of revocation closure.
15 delegated grandchildren are part of revocation closure.
16 unknown descendant path is not assumed absent.
17 unbounded delegation without terminating boundary blocks strong revocation claims.
18 generation checks must be enforced at every protected effect boundary or equivalent closure must be complete.
19 generation equality does not replace semantic context compatibility.
20 resource incarnation binds child authority.
21 fence generation binds child authority where relevant.
22 continuity binds child authority across recovery/rollback.
23 rollback cannot resurrect revoked descendants.
24 parent transfer does not silently transfer children.
25 recovery cannot publish historical child authority as current.
26 child issuance race with revocation requires authoritative ordering.
27 child use race with revocation requires authoritative ordering or stale rejection.
28 expiration is not equivalent to immediate revocation.
29 break-glass delegation remains bounded.
30 child capability is not world-effect evidence.
31 child capability use is not proof of external success.
32 resource-side fence is stronger than propagation-only revocation.
33 shared trust roots do not create independence.
34 common-mode dependencies belong in delegation closure.
35 partial invalidation can preserve disjoint child authority.
36 unknown impact blocks stronger child authority.
37 capability cache is not authority.
38 queue emptiness is not revocation proof.
39 provider ACK is not revocation proof.
40 stale descendants cannot cross a current fence.
41 decommissioned identities cannot be silently reused.
42 capability lineage must prevent ABA resurrection.
43 mission claims remain separate from local delegation claims.
44 formal refinement is required before implementation assurance.
45 formal/runtime/deployment correctness remains unproven.

CANDIDATE THEOREM
Not formally proven: If child capabilities are attenuated from a current parent envelope, bound to a revocation generation and exact target/context, and every protected effect path terminates at a boundary enforcing that generation (or complete descendant closure is otherwise enforced), then parent revocation cannot leave a descendant capable of producing a new protected effect under the revoked authority.
If either attenuation, descendant closure or terminating enforcement is incomplete/unknown, strong revocation cannot be claimed.

ARCHITECTURE CONSEQUENCE
The clean architecture should not model delegation as simple capability copying.
Canonical flow:
CURRENT AUTHORITY -> DELEGATION CHECK -> ATTENUATION -> CHILD CAPABILITY COMMIT -> CHILD USE CHECK -> EFFECT FENCE.
Revocation:
PARENT CHANGE -> REVOCATION GENERATION -> DESCENDANT CLOSURE / ROOT-GENERATION FENCE -> QUEUE/PROVIDER CLOSURE -> EFFECT REJECTION -> RECONCILIATION.

DEEP RULE
DELEGATION IS SAFE ONLY IF AUTHORITY CAN BE ATTENUATED FASTER THAN EFFECT PATHS CAN ESCAPE.

NEXT ATTACK
DELEGATION + CROSS-DOMAIN AUTHORITY TRANSFER + MULTIPLE PARENTS + SHARED CHILD + CONCURRENT REVOCATION + CLAIM DEGRADATION. Question: what happens when one child capability is legitimately derived from two or more parents with different scopes, epochs, claims and revocation states?