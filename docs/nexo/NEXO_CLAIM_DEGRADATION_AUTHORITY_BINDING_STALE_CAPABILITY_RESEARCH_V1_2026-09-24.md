NEXO - CLAIM DEGRADATION / AUTHORITY BINDING / STALE CLAIM CONSUMER / CAPABILITY FENCING RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

QUESTION
If a strong claim has already been consumed to authorize an operation and the claim later degrades, how can Nexo prevent a stale consumer from continuing to exercise the old stronger authority?

WEB CROSS-CHECKS
Kubernetes optimistic concurrency binds a write to a current resourceVersion; stale writes are rejected with 409. Kubernetes also documents a visibility window between an update and cache/watch propagation, showing why a consumer cache cannot itself be the authority boundary. cite: turn0search0, turn0search9.
etcd transactions atomically compare current values/revisions before applying updates, while watch delivery is asynchronous and not itself linearizable. This supports binding the final authorization action to an authoritative current-generation check rather than relying on notification propagation. cite: turn0search1, turn0search3.

CORE RESULT
A claim is not authority. But once a claim is used to mint a capability, the capability becomes an authority-bearing artifact and must carry the claim's currentness boundary.
Therefore:
CLAIM_CURRENT != AUTHORITY_CURRENT != CAPABILITY_CURRENT != EFFECT_ALLOWED.
Degrading a claim must invalidate or fence every capability/authorization artifact whose validity depends on the degraded claim.

THE STALE-CONSUMER ATTACK
1. Mission claim M=GLOBAL_SAFE at generation G10.
2. Authority consumer reads M=GLOBAL_SAFE.
3. Consumer receives capability K10.
4. Resource R3 becomes unfenced.
5. M degrades to RESOURCE_SAFE at G11.
6. Consumer cache still says GLOBAL_SAFE.
7. Consumer uses K10.
If K10 is accepted solely because it was valid when minted, the degradation is informational rather than enforceable.
That is unsafe.

KEY RULE
OLD_CLAIM + OLD_CAPABILITY != CURRENT_AUTHORITY.
A capability must be rejected when any claim-relevant generation/context on which it depends is no longer current.

CAPABILITY BINDING
Candidate CapabilityBinding:
- capability_id;
- operation/effect_id;
- attempt_id if applicable;
- claim_ids required;
- minimum claim strength;
- context_id;
- authority_epoch;
- assurance_generation;
- invalidation_generation;
- scope_generation;
- fence_generation;
- resource_incarnations;
- policy/invariant versions;
- dependency/boundary generations;
- expiry/revocation state;
- continuity anchor;
- issuance evidence;
- invalidation triggers.

IMPORTANT
Capability issuance is not merely copying a boolean such as SAFE=true.
It is a protected derivation from current authoritative context.

FINAL AUTHORIZATION GUARD
Candidate:
ALLOW(K,E) only if:
CAPABILITY_CURRENT(K)
AND REQUIRED_CLAIMS_CURRENT(K)
AND AUTHORITY_CURRENT(K)
AND CONTEXT_CURRENT(K)
AND SCOPE_CURRENT(K)
AND FENCE_CURRENT(K)
AND RESOURCE_INCARNATIONS_CURRENT(K)
AND NO_REQUIRED_INVALIDATION_AFTER_BINDING(K)
AND EFFECT_IDENTITY_COMPATIBLE(K,E).

If any required predicate is UNKNOWN, stale or invalid, strong authorization is denied/revalidated unless the effect contract explicitly proves a weaker safe behavior.

ISSUANCE VS USE
Two separate protected transitions:
CAPABILITY_ISSUE
CAPABILITY_USE.
A valid issuance does not guarantee future use remains valid.
This is the same semantic separation as:
PROOF_VALID != CURRENT_PERMISSION.

REVOCATION IS NOT NOTIFICATION
A revocation event delivered to a consumer is not itself enforcement.
Need one of:
A direct authoritative check at use time;
B resource-side generation/fence check;
C short-lived capability with protected revocation boundary;
D another mechanism proven equivalent for the claim.

BEST GENERAL PATTERN
Capability carries a monotonically advancing generation or equivalent context identity, and the enforcement boundary rejects capabilities older than the current protected generation.
This resembles Kubernetes stale-write rejection: the current server-side version, not the client's cached view, decides whether the operation can proceed. cite: turn0search0, turn0search9.

GENERATION VECTOR
A scalar generation is often insufficient.
Candidate capability currentness may depend on:
authority_epoch;
assurance_generation;
invalidation_generation;
scope_generation;
boundary_generation;
resource_incarnation;
policy_generation;
dependency_generation;
topology_generation;
continuity_context.
However, vector equality alone does not prove semantic coherence; the vector must be bound to a coherent context.

CLAIM STRENGTH AS A REQUIRED INPUT
An operation requiring MISSION_SAFE cannot proceed with a RESOURCE_SAFE claim merely because the consumer has some valid assurance.
Minimum required claim strength must be encoded in the authorization contract.
Candidate:
RequiredClaimStrength(E) <= CurrentClaimStrength(context,E).
If not, DENY/HOLD.

DOWNGRADE IS NOT RETROACTIVE WORLD CHANGE
Degrading M from GLOBAL_SAFE to RESOURCE_SAFE does not imply that an already executed historical effect did not occur.
It changes future authority and claim validity.
Historical effects remain history/evidence and may require reconciliation.

ALREADY-ADMITTED EFFECT
If capability K10 was legitimately used before degradation linearized, that transition is historical.
After degradation linearizes:
- no new continuation under K10;
- retries using K10 denied;
- queued K10 work fenced if relevant;
- external effect reconciled if needed;
- current claim recomputed.

IN-FLIGHT EFFECT
An in-flight effect may have already crossed the protected admission boundary before degradation.
Degradation cannot retroactively erase it.
But any future protected continuation must satisfy current context.
Candidate state:
ADMITTED_UNDER_G10 -> INVALIDATED_FOR_CONTINUATION -> RECONCILIATION_REQUIRED.

QUEUE CLOSURE
Queued capabilities are part of revocation closure.
Revocation must cover:
- active workers;
- queued commands;
- delayed jobs;
- retry records;
- provider redrive;
- callbacks;
- delegated capabilities;
- caches;
- child effects.
If any path can still turn K10 into protected external effect, that path is part of capability revocation closure.

DELEGATION
If K10 can mint K11, revoking K10 is insufficient unless delegated descendants are also bounded/revoked/fenced.
Candidate rule:
REVOCATION_CLOSURE(K) includes all descendants capable of producing protected effects.
Unbounded delegation makes strong revocation claims unavailable unless a terminating enforcement boundary exists.

BREAK-GLASS
Break-glass cannot simply ignore claim degradation.
It requires a separate capability/effect class with:
- exact scope;
- current authority;
- current fence;
- bounded lifetime;
- minimum claim strength;
- explicit mission-risk policy;
- audit;
- reconciliation;
- post-action verification.

STALE CACHE
Cache can be a performance mechanism but cannot be the final authority when stale data can create a safety violation.
Kubernetes explicitly documents windows where a cache can lag an update, reinforcing this distinction. cite: turn0search9.

AUTHORITY-CACHE CONTRACT
Candidate cache states:
CANDIDATE_CURRENT
STALE
UNKNOWN
INVALIDATED.
Cache hit -> candidate input.
Authoritative currentness check -> final decision.

FAST PATH
A performance optimization can use cached assurance if it is cryptographically/context-bound and the final enforcement boundary rejects stale generations.
Without such enforcement, cached assurance is not enough for a safety-critical fast path.

CLAIM INVALIDATION PROPAGATION
CHANGE -> IMPACT -> CLAIM_INVALIDATION -> CAPABILITY_INVALIDATION -> QUEUE/DELEGATION CLOSURE -> ENFORCEMENT -> RECONCILIATION.
Missing propagation does not equal successful revocation.

CAPABILITY REVOCATION EPOCH
Candidate RevocationContext:
- revocation_generation;
- impacted claims;
- impacted capabilities;
- effect classes;
- scope closure;
- queue/delegation closure;
- resource fences;
- linearization;
- propagation status;
- enforcement verification;
- unresolved paths.

PARTIAL INVALIDATION
If claim A degrades but claim B is proven disjoint, capabilities requiring only B may remain valid.
If impact is UNKNOWN, capability currentness cannot be promoted to CURRENT.
This preserves selective liveness without allowing silent stale authority.

CONCURRENT ISSUE VS DEGRADE
Case 1: ISSUE linearizes before DEGRADE.
K is historically issued under G10; future use depends on current-generation rules.
Case 2: DEGRADE linearizes before ISSUE.
New K requiring G10 is denied.
Case 3: order unknown.
Need authoritative ordering or enforcement that rejects stale K.

CONCURRENT USE VS DEGRADE
Case A: USE linearizes first -> historical valid use, then future continuation revalidated.
Case B: DEGRADE first -> USE denied.
Case C: unknown -> no strong authorization without equivalent stale rejection.

CRASH
Crash after capability issuance but before consumer receives it: capability may exist; recovery must classify it against current revocation generation.
Crash after consumer receives capability but before use: currentness checked at use.
Crash after use admission but before external effect: durable intent/effect reconciliation applies.
Crash after external effect: claim degradation does not classify world outcome.

ROLLBACK
Rollback of capability store can resurrect old capabilities.
Therefore capability revocation continuity must not rely solely on rollback-vulnerable state.
Restored old capability != current permission.
Continuity anchor must prevent ABA resurrection or force quarantine/revalidation.

RESOURCE-SIDE FENCE
Where possible, the ultimate resource boundary should reject stale capability generation itself.
Then even a stale authority consumer cannot turn cached claim state into a protected external effect.
This is the strongest architecture because revocation becomes enforced rather than merely propagated.

AUTHORITY BINDING OBJECT
Candidate AuthorityBinding:
- binding_id;
- operation/effect;
- required_claims;
- capability;
- authority context;
- assurance context;
- scope/fence generations;
- resource incarnations;
- currentness proof;
- issuance linearization;
- use linearization;
- invalidation triggers;
- revocation state.

CLAIM-CAPABILITY-AUTHORITY CHAIN
Claim answers: WHAT IS JUSTIFIED?
Assurance answers: UNDER WHICH PROOF/EVIDENCE CONTEXT?
Authority answers: WHO MAY ACT?
Capability answers: WHICH EXACT EFFECT IS GRANTED?
Fence answers: WHAT REJECTS STALE/UNAUTHORIZED EFFECTS?
Resource answers: WHAT ACTUALLY ACCEPTED/REJECTED IT?
World/evidence answers: WHAT HAPPENED?
No layer substitutes for another.

CANDIDATE INVARIANTS INV-CCA-01..40
01 claim is not authority.
02 capability is not permanent authority.
03 capability validity is context-bound.
04 capability use requires currentness, not historical issuance alone.
05 degraded claims invalidate dependent stronger capabilities.
06 revocation must reach every protected capability path.
07 queued capability-bearing work is part of revocation closure.
08 delegated descendants are part of revocation closure.
09 stale cache cannot grant stronger authority.
10 cache/watch propagation is not enforcement.
11 final authorization requires authoritative currentness or equivalent stale rejection.
12 capability binds to exact effect identity.
13 capability binds to resource incarnation where relevant.
14 capability binds to fence generation where relevant.
15 capability binds to invalidation generation where relevant.
16 capability binds to minimum required claim strength.
17 claim strength cannot silently degrade beneath operation requirements.
18 old capability cannot be used after a relevant cutoff.
19 legitimate historical use is not retroactively erased.
20 in-flight continuation must revalidate after degradation.
21 unknown issue/degrade order blocks strong use without fence.
22 unknown use/degrade order blocks strong use without fence.
23 rollback cannot resurrect current authority.
24 revocation generation requires continuity protection.
25 scalar generation may be insufficient for multi-context claims.
26 vector currentness does not replace semantic context coherence.
27 partial invalidation requires complete impact closure.
28 unknown impact is not disjoint impact.
29 resource-side rejection is stronger than notification-only revocation.
30 break-glass remains within claim/fence closure.
31 delegation must have bounded revocation semantics.
32 unbounded delegation blocks strong revocation claims.
33 capability issuance does not imply external effect success.
34 capability validity does not imply world truth.
35 external effect outcome remains separate from authority state.
36 recovery recomputes current capability validity.
37 checkpoint restoration does not restore authority.
38 stale global claims cannot remain usable through cache.
39 formal refinement is required before implementation assurance.
40 formal/runtime/deployment correctness remains unproven.

CANDIDATE THEOREM
Not formally proven: If every safety-relevant capability is bound to the exact claim/context/scope/fence/resource generations on which its authority depends, and every protected effect boundary rejects stale capabilities or performs an authoritative currentness check, then degradation of a claim cannot leave an older stronger capability capable of exercising that stronger authority.
If a protected capability path cannot be covered by revocation closure or stale rejection, the stronger claim must remain unavailable.

ARCHITECTURE CONSEQUENCE
The clean architecture now has a direct chain:
ASSURANCE CLAIM -> AUTHORITY BINDING -> CAPABILITY -> EFFECT BOUNDARY -> RESOURCE.
And the invalidation chain:
CHANGE -> CLAIM IMPACT -> CLAIM DEGRADATION -> CAPABILITY INVALIDATION -> DELEGATION/QUEUE CLOSURE -> FENCE -> RECONCILIATION.

DEEP RULE
THE AUTHORITY CONSUMER MUST NEVER BE ABLE TO TURN HISTORICAL ASSURANCE INTO CURRENT POWER WITHOUT PASSING THE CURRENT AUTHORITY/CLAIM/FENCE BOUNDARY.

NEXT ATTACK
CAPABILITY DELEGATION + CHILD CAPABILITIES + REVOCATION RACE + QUEUED WORK + RESOURCE REPLACEMENT + CRASH/RESTORE. Question: can a child capability outlive its parent claim without creating an authority escape, and what bounded delegation model closes every descendant path?