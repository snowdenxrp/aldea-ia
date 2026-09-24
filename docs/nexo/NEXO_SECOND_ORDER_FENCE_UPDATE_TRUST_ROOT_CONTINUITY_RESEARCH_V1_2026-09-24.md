NEXO - SECOND-ORDER FENCE / FENCE UPDATE / TRUST-ROOT CONTINUITY RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

RESEARCH QUESTION
Can an independent Assurance fence remain genuinely independent across its own update, rollback, key rotation, trust-root change and protected-resource replacement, or does every fence update require another enforcement boundary?

EXTERNAL CROSS-CHECKS
NIST SP 800-193 separates protection, detection and recovery and discusses Roots of Trust for Update, Detection and Recovery. It also notes that security functionality delegated to another device creates a critical trust relationship. This supports treating the fence's update/recovery chain as part of its own trust boundary. cite: turn0search0, turn0search24.

TUF separates roles and metadata generations; Snapshot gives a consistent view of target metadata, Timestamp provides freshness/expiration, and Root metadata is used to replace compromised keys. TUF also documents rollback/freeze-style attacks and key compromise/rotation concerns. This is an update-continuity analogy, not a direct Nexo protocol requirement. cite: turn0search4, turn0search6, turn0search7.

TLA+ treats implementation correctness through refinement mappings: an implementation must satisfy the higher-level specification under the mapping. Therefore a fence update must preserve the abstract fence contract, not merely produce a validly signed new artifact. cite: turn0search25, turn0search26.

CORE RESULT
A fence is not trustworthy merely because its binary is signed.

Its assurance depends on:
FENCE_IDENTITY -> UPDATE_AUTHORITY -> ARTIFACT -> CONFIG -> DEPENDENCIES -> TRUST_ROOT -> RESOURCE_BINDING -> ENFORCEMENT -> CONTINUITY

Therefore:
FENCE_AUTHENTIC != FENCE_CURRENT
FENCE_CURRENT != FENCE_ENFORCING
FENCE_ENFORCING != FENCE_VERIFIED_FOR_CLAIM

SECOND-ORDER ENFORCEMENT BOUNDARY
A universal "fence for the fence" is not automatically required. Every safety-critical mutation of the fence must itself cross an enforcement boundary capable of preserving the fence's abstract safety contract.

Candidate concept: FenceContinuityBoundary.

Possible foundations:
- hardware/rooted boot boundary;
- independently protected update controller;
- immutable recovery path;
- external resource-side enforcement;
- threshold/multi-party update authority;
- another claim-specific mechanism.

Adding another software coordinator recursively creates another trust dependency. The chain must terminate in an explicitly declared trust foundation or bounded environmental assumption.

ROOT-OF-TRUST CONSEQUENCE
NIST's Root of Trust for Update/Detection/Recovery model supports:
UPDATE_AUTHENTICATION != UPDATE_SAFETY

A signature can establish artifact authenticity under a trust root. It does not alone establish semantic compatibility, current generation, correct configuration, dependency closure, safe resource binding, preserved fence behavior, absence of bypass, or current policy/invariant compatibility. cite: turn0search24.

FENCE UPDATE PROTOCOL CANDIDATE
UPDATE_REQUEST
-> IMPACT_CLOSURE
-> AUTHORITY_CUTOFF
-> OLD_FENCE_PROTECTION
-> NEW_ARTIFACT_AUTHENTICATION
-> CONFIG/DEPENDENCY_VALIDATION
-> FENCE_CONTRACT_COMPATIBILITY
-> RESOURCE/BINDING VALIDATION
-> ACTIVATION
-> ENFORCEMENT_VERIFICATION
-> CONTINUITY_COMMIT
-> CLAIM_REVALIDATION
-> EXPLICIT_RELEASE

ACTIVATED != ENFORCING
ENFORCING != VERIFIED
VERIFIED != CURRENT_FOR_ALL_CLAIMS

DUAL-FENCE TRANSITION
Candidate:
F_A CURRENT
-> protected transition
-> F_B PREPARED
-> verify B against A's protected contract
-> activate B
-> verify B enforcement
-> commit continuity
-> invalidate A for new use
-> retain A only as historical context
-> release.

Dangerous race:
F_A protects publication; F_B is prepared; F_A is invalidated; B fails activation; old actor resumes with F_A; another path accepts F_A.
Safe result requires A remain enforcing until B is verified, an independent fallback boundary cover the gap, or the protected operation become unavailable.

Never:
OLD_FENCE_DISABLED -> NEW_FENCE_NOT_VERIFIED -> ASSUME_SAFE.

ROLLBACK
Rollback is not temporal reversal. A byte-identical old fence artifact may return under a new authority generation, continuity context, trust-root state, resource incarnation, policy or dependency graph.
SAME_ARTIFACT != SAME_FENCE_CONTEXT.
TUF's freshness/rollback protections are a useful analogy for why signed old state must not automatically become current state. cite: turn0search4, turn0search7.

KEY ROTATION
Key rotation is a protected state transition. Questions include current update authority, revoked old keys, historical evidence validation, trust-root rollback, stale verifiers and recovery keys.
Candidate:
TRUST_ROOT_GENERATION belongs in FenceContinuityContext.
VALID_SIGNATURE != CURRENT_UPDATE_AUTHORITY.

RESOURCE REPLACEMENT
Fence F protects R1; R1 is replaced by R2. Logical resource identity or identical artifact does not automatically preserve the binding.
Required:
R1 RETIRED/FENCED
-> R2 IDENTIFIED
-> R2 INCARNATION ESTABLISHED
-> FENCE BOUND TO R2
-> ENFORCEMENT VERIFIED
-> CLAIMS REVALIDATED
-> RELEASE.

BREAK-GLASS
Break-glass is part of fence closure. Maintenance cannot simply bypass the old fence to install the new one. Any bypass must be bounded, authorized, current, auditable, fenced, reconciled and included in failure-domain analysis.

OPEN-WORLD CLOSURE
Dynamic plugins/providers that can modify the fence or publication path are effect-path participants.
DYNAMIC_DISCOVERY -> SCOPE_WIDENING
must be a protected transition when the discovered component can affect the fence claim. No silent expansion.

CANDIDATE FenceContinuityContext
- fence_context_id
- parent_context_id
- fence_id
- artifact identity/generation
- config fingerprint
- dependency closure
- trust-root identity/generation
- update authority
- policy/invariant versions
- boundary generation
- resource incarnation set
- ownership/coordination context
- recovery context
- continuity anchor
- compatibility claim
- activation evidence
- enforcement evidence
- invalidation state
- rollback lineage

CANDIDATE FenceUpdateClaim
Accept only if:
1 old safety contract remains protected during transition;
2 new artifact authentic;
3 configuration compatible/current;
4 dependencies complete/current;
5 trust root current;
6 resource bindings current;
7 bypass closure covered;
8 enforcement verified;
9 continuity committed;
10 dependent assurance claims revalidated.

STATE MACHINE
CURRENT -> UPDATE_REQUESTED -> IMPACT_COMPUTED -> OLD_PROTECTED -> NEW_PREPARED -> NEW_AUTHENTICATED -> NEW_COMPATIBLE -> NEW_ACTIVATED -> NEW_ENFORCEMENT_VERIFIED -> CONTINUITY_COMMITTED -> OLD_RETIRED -> CURRENT_NEW.

Failure states:
UPDATE_BLOCKED
QUARANTINED
ROLLBACK_REQUIRES_REVALIDATION
CONTINUITY_UNKNOWN

CRASH WINDOWS
W1 before new artifact validation
W2 after validation before activation
W3 during activation
W4 after activation before enforcement verification
W5 after verification before continuity commit
W6 after continuity commit before old retirement
W7 after old retirement before dependent claim revalidation
W8 crash during rollback
W9 crash during key rotation
W10 crash during resource replacement

No window may permit NO_VERIFIED_FENCE -> STRONG_PROTECTED_PUBLICATION.

CANDIDATE TWO-BOUNDARY RULE
For a safety-critical fence transition, at least one must remain true throughout:
A old fence remains independently enforcing;
B new fence is independently enforcing and verified;
C an independent fallback boundary enforces the protected safety property;
D protected operation is unavailable.
Candidate invariant only; not formally proven.

RECURSIVE TRUST TERMINATION
A second-order fence does not solve infinite regress.
FENCE -> UPDATE PROTECTION -> ROOT OF TRUST -> FOUNDATION.
The recursion terminates only at an explicitly trusted foundation, hardware/physical enforcement, an independently verified bounded environment assumption, or a weakened claim.

CANDIDATE TrustFoundation
- foundation_id
- protected properties
- immutable/externally anchored components
- root identities
- update authority
- recovery authority
- physical/hardware dependencies
- failure domains
- assumptions
- continuity anchor
- compromise response
- evidence
- claim scope

TRUST FOUNDATION != TRUST EVERYTHING.
It is only the foundation for explicitly enumerated properties.

COMPROMISE RESPONSE
If the fence trust root is compromised:
DETECT -> CUTOFF -> REVOKE/QUARANTINE -> ACTIVATE INDEPENDENT FALLBACK -> PRESERVE HISTORY -> ESTABLISH NEW TRUST ROOT -> REBUILD FENCE -> VERIFY ENFORCEMENT -> REVALIDATE CLAIMS.
If no independent fallback exists, strong claims may become unavailable.

CANDIDATE INVARIANTS INV-SFENCE-01..40
01 signed fence artifact is not automatically current
02 authenticated update is not automatically safe update
03 activated fence is not necessarily enforcing
04 enforcing fence is not automatically verified for every claim
05 fence update is itself a protected transition
06 old fence remains protected until new enforcement is verified or fallback exists
07 no unsafe gap between fence generations
08 rollback does not restore old authority/context
09 key rotation is a protected transition
10 trust-root generation is part of fence continuity
11 old keys cannot regain authority solely through rollback
12 resource replacement creates a new incarnation
13 fence binding must include resource incarnation
14 break-glass is inside fence closure
15 maintenance/update paths are inside effect-path closure
16 dynamic provider discovery cannot silently widen fence authority
17 fence dependencies must be closed for the claim
18 common-mode dependencies reduce independence
19 trust-root compromise invalidates dependent claims
20 restored fence snapshot is historical until continuity is re-established
21 crash during activation yields UNKNOWN unless protected by another boundary
22 crash after enforcement before continuity requires revalidation
23 crash after continuity before claim republish does not erase history
24 old fence may remain historical after retirement
25 historical fence state does not grant current enforcement
26 fallback boundary must be independently enforceable
27 fallback must cover the same claim-relevant paths
28 second-order protection cannot silently become a general authority issuer
29 recursion terminates at declared trust foundation/assumption
30 trust foundation scope is claim-specific
31 trust foundation compromise invalidates dependent claims
32 resource-side fence and Assurance publication fence remain distinct
33 fence update cannot assume external world quiescence
34 update compatibility is claim-specific
35 semantic compatibility is not byte equality
36 byte equality is not context continuity
37 proof reuse after fence update requires revalidation
38 external contract drift can invalidate fence assurance
39 no strong claim across an unverified fence transition
40 formal/runtime correctness remains unproven

CANDIDATE THEOREM
Not formally proven:
If a protected fence transition preserves at least one independently enforceable boundary for every claim-relevant protected path throughout the transition, and the new fence's artifact, configuration, dependencies, trust root, resource bindings, continuity and enforcement are verified before the old boundary is retired, then the transition can preserve the fence's bounded safety contract without requiring a universal third-order coordinator.
If no such boundary exists during a transition, strong protection is unavailable for that interval.

ARCHITECTURE CONSEQUENCE
Clean architecture trust stack:
TRUST FOUNDATION
-> FENCE CONTINUITY / UPDATE PROTECTION
-> ASSURANCE PUBLICATION FENCE
-> ASSURANCE COMMIT
-> CLAIM PUBLICATION
-> AUTHORITY
-> EFFECT BOUNDARY
-> WORLD

This does not mean every layer must be a separate service. It means safety dependencies and failure boundaries must be explicit.

Deep architectural rule:
EVERY SAFETY-CRITICAL SELF-MODIFICATION MUST PRESERVE AN ENFORCEABLE SAFETY BOUNDARY OR ENTER A SAFE NON-ACTION STATE.

NEXT ATTACK
TRUST FOUNDATION COMPROMISE + FENCE UPDATE + KEY ROTATION + RECOVERY KEY + ROLLBACK + MULTIPLE TRUST ROOTS + COMMON-MODE FAILURE.
Question: can the trust foundation itself be updated or recovered without temporarily depending on the component being updated, and what is the minimum irreducible TCB required for Nexo's strongest safety claims?

No implementation or formal verification is claimed.