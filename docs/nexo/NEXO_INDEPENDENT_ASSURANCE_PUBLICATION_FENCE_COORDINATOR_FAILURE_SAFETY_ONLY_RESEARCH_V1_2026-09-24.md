NEXO - INDEPENDENT ASSURANCE PUBLICATION FENCE / COORDINATOR FAILURE / SAFETY-ONLY RESEARCH - 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

CORE RESULT
If the normal Assurance ownership/commit store is unavailable, an independently enforceable publication fence can preserve a bounded safety property: stale or unauthorized Assurance publication is rejected. It cannot recreate proof validity, currentness, authority, or external-world truth.

External cross-checks: Kubernetes uses authoritative resourceVersion checks to reject stale writes, while some reads/cache semantics can expose older versions. etcd transactions can atomically compare lease/revision/value conditions before committing. TLA+ refinement makes implementation-to-abstract correspondence an explicit proof obligation. These are analogies, not implementation requirements. cite: turn0search0, turn0search2, turn0search3, turn0search36.

KEY SEPARATIONS
ASSURANCE COORDINATOR UNAVAILABLE != WORLD SAFE
FENCE ENFORCED != CLAIM VERIFIED
PUBLICATION BLOCKED != PROOF VALID
FENCE != AUTHORITY ISSUER

SAFETY-ONLY STATE
NORMAL -> COORDINATION_DEGRADED -> ASSURANCE_PUBLICATION_BLOCKED -> SAFETY_ONLY -> RECONCILIATION_REQUIRED -> COORDINATION_REESTABLISHING -> REVALIDATION -> NORMAL

SAFETY_ONLY means new strong Assurance publication is blocked unless an independently enforceable boundary proves stale publication cannot cross the protected boundary. It intentionally sacrifices availability rather than inventing currentness.

INDEPENDENT ASSURANCE FENCE
Candidate fields: fence_id, protected_scope, protected_claims, publication classes, fence_generation, stale-token rejection, authority dependency, continuity anchor, ownership dependency, context compatibility, crash/restart semantics, partition semantics, update/rollback semantics, bypass closure, failure-domain closure, enforcement evidence, verification method, claim strength, invalidation triggers.

INDEPENDENCE IS CLAIM-SPECIFIC
PROCESS_SEPARATION != FENCE_INDEPENDENCE
HOST_SEPARATION != TRUST_INDEPENDENCE
DIFFERENT_SERVICE != FAILURE-DOMAIN-INDEPENDENCE
The fence must not share a failed dependency in a way that defeats the claim: ownership store, credentials, trust root, policy/config source, storage, runtime, update path, recovery path, or critical network/control plane.

MINIMUM SAFETY CONDITION
If current Assurance ownership is unknown and stale builders may still publish, then protected publication must be rejected. This can preserve a bounded non-publication safety property while liveness is lost.

FENCE MUST ENFORCE
A builder checking its own cached token is insufficient. The publication target or equivalent authoritative boundary must reject stale ownership/context. A lease coordinates ownership; a fence must make stale actions ineffective. cite: turn0search0, turn0search3.

FAILURE CASES
A coordinator unavailable + fence healthy: block new strong publication, preserve committed history, allow only explicitly safety-preserving actions.
B coordinator unavailable + fence unknown: quarantine affected scope.
C fence unavailable: strong publication unavailable unless another sufficient boundary exists.
D fence compromised: invalidate dependent assurance unless another independent boundary covers the claim.
E fence restored from old snapshot: historical state only; establish new continuity/current generation.
F coordinator returns with changed context: old prepared bundles require revalidation.

CLAIM DEGRADATION
Possible states: GLOBAL_ASSURANCE_CURRENT -> CLAIM_BOUNDARY_SAFE -> CLAIM_PUBLICATION_BLOCKED -> HISTORICAL_ASSURANCE_ONLY -> UNKNOWN.
A weaker claim may survive only if its own closure and enforcement boundary remain valid. PUBLICATION_BLOCKED must never silently become CLAIM_VERIFIED.

HISTORY VS CURRENTNESS
Existing committed Assurance can remain historical after coordinator loss. Currentness requires current context. INVALIDATED != NEVER_VALID.
Prefer FALSE_STALE/BLOCKED over FALSE_CURRENT/PUBLISHED. This is a safety preference, not itself a proof.

CLOSURE
Independent fence coverage must include every path capable of publication or mutation: worker, API, queue/broker, downstream worker, replicated store, alternate API, break-glass, recovery, migration/update. Unknown bypass means strong global publication is unavailable.

FENCE VS OBSERVATION
A monitor observing no publication is evidence. A mechanism rejecting stale publication is enforcement. Observation cannot substitute for enforcement.

FENCE VS PROOF
The fence can support a prevention claim such as NO_STALE_ASSURANCE_PUBLICATION under its contract. It cannot establish MISSION_INVARIANT_VERIFIED.

RECOVERY
COORDINATION_LOSS -> SAFETY_ONLY -> BLOCK PUBLICATION -> PRESERVE HISTORY -> ESTABLISH FENCE CONTINUITY -> RESTORE COORDINATOR -> REBUILD CURRENT CONTEXT -> RECONCILE PREPARED/COMMITTED BUNDLES -> REVALIDATE CLAIMS -> EXPLICIT RELEASE.
Recovery cannot self-authorize publication. Recovery-of-recovery repeats current fence/continuity checks.

UPDATE / ROLLBACK
Fence update, key rotation, trust-root change, rollback, or resource replacement can invalidate fence assurance. Byte-identical restoration does not restore historical publication authority. Fence continuity therefore needs its own context and invalidation lifecycle.

BREAK-GLASS
Break-glass is inside the protected closure. It cannot bypass the fence merely because a human approved it. If permitted, it needs a bounded effect class, current authority, scope, lifetime, fencing, audit and reconciliation.

CANDIDATE INVARIANTS INV-IAPF-01..30
01 coordinator loss does not create publication capability
02 coordinator loss does not prove world safety
03 fence enforcement is distinct from proof verification
04 fence enforcement is distinct from authority issuance
05 independence requires failure-domain closure
06 process separation is not independence
07 unknown fence state blocks strong publication
08 fence loss blocks strong publication absent another sufficient boundary
09 stale builders remain potentially active
10 stale prepared bundles cannot publish
11 stale checkpoints cannot restore publication rights
12 publication binds current ownership/context/invalidation/fence generations
13 cache is not enforcement
14 observation is not enforcement
15 historical assurance is not current assurance
16 blocked publication is not proof validity
17 safety-only may reduce liveness
18 safety-only cannot grant new authority
19 restored fence state requires continuity validation
20 rollback does not restore fence authority
21 fence compromise invalidates dependent claims
22 common-mode dependencies can invalidate independence
23 alternate publication paths must be covered
24 queues and downstream continuations are in closure
25 recovery-of-recovery revalidates fence state
26 fence has explicit crash/partition/update semantics
27 fence claim is claim-specific
28 weaker claim cannot silently imply stronger claim
29 no strong claim without sufficient boundary coverage
30 formal/runtime correctness remains unproven.

CANDIDATE THEOREM (NOT FORMALLY PROVEN)
If every protected Assurance publication path crosses an independently enforceable boundary that rejects stale/unauthorized contexts, and that boundary has current continuity, complete bypass/failure-domain closure, explicit crash/restore/update semantics and verified enforcement for claim C, then loss of the normal Assurance coordinator can preserve the bounded property that stale or unauthorized Assurance publication does not occur. Availability and stronger assurance claims may still be lost.

LIMIT
This theorem candidate does not establish that the underlying claim is true. It only establishes a bounded prevention property under the fence contract.

FORMALIZATION TARGET
Finite model: coordinator available/unavailable/compromised; builders A/B; prepared bundles; independent fence generation; stale tokens; alternate publication path; cache; queue; break-glass; crash/restart; recovery-of-recovery; resource replacement; fence update/rollback. Candidate safety: COORDINATOR_UNAVAILABLE => NO_STALE_BUNDLE_PUBLICATION. No TLC/SANY result claimed.

ARCHITECTURE CONSEQUENCE
A bounded SAFETY_ONLY state is justified in the Emergency/Assurance safety plane. It reduces what can happen when authoritative coordination is unavailable; it does not create new authority.

NEXT ATTACK
INDEPENDENT FENCE FAILURE + COMMON-MODE TRUST ROOT + FENCE UPDATE RACE + RESOURCE REPLACEMENT + BREAK-GLASS + RECOVERY. Question: can a fence remain genuinely independent across its own update, rollback, key rotation, trust-root change and resource replacement, or does every fence update itself require a second-order enforcement boundary?