# NEXO RESOURCE-SIDE FENCE FAILURE, BYPASS, INCARNATION AND QUORUM-LOSS RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## Evidence boundary
Distributed locking literature and etcd documentation support the principle that coordinator-side ownership alone cannot prevent stale clients from acting; fencing must be enforced at the protected resource, and the resource must reject stale ownership generations. etcd documents that linearizable operations depend on Raft consensus, while non-linearizable local/serializable views may be stale. citeturn0search0turn0search16
This is an analogy for Nexo, not a proof of the Nexo architecture.

## Core result
An IndependentSafetyFence is NOT a primitive root of safety merely because it reports ACTIVE.

It is safe only relative to a protected external-effect contract whose last effect-capable boundary enforces the fence semantics.

Therefore:
FENCE_REPORTED_ACTIVE != FENCE_ENFORCED
FENCE_ENFORCED != ALL_EFFECT_PATHS_CLOSED
ALL_EFFECT_PATHS_CLOSED != HISTORICAL_NO_EFFECT
FENCE_ACTIVE != CURRENT_AUTHORITY

The fence itself must be treated as an effect-capable safety dependency.

## 1. The last effect-capable boundary
For a safety claim to say that an effect cannot occur, Nexo must identify the final boundary through which that effect could occur.

Candidate:
EffectBoundary = {resource, provider, incarnation, interface, path-set, enforcement mechanism}

If an alternate path can produce the same protected effect without passing through the fence, the fence does not establish complete containment.

Therefore:
FENCE_SCOPE <= VERIFIED_EFFECT_BOUNDARY

## 2. Fence state must be richer than boolean ACTIVE
Candidate state machine:
REQUESTED
→ ACTIVATING
→ ACTIVE_UNVERIFIED
→ ENFORCED
→ ENFORCEMENT_VERIFIED
→ INVALIDATED
→ REPLACED
→ UNKNOWN

ACTIVE_UNVERIFIED cannot support a strong containment claim.

ENFORCEMENT_VERIFIED is evidence that the specified boundary accepted and currently enforces the fence contract.

UNKNOWN must survive crash/restart and cannot be silently converted to INACTIVE or NO_EFFECT.

## 3. Fence identity
Candidate IndependentSafetyFence:
- fence_id
- target/effect scope
- provider identity
- provider incarnation
- resource identity
- resource incarnation
- fence generation
- predecessor fence
- authority context
- ordering position
- activation evidence
- enforcement evidence
- bypass closure
- dependency/common-mode fingerprint
- validity interval
- invalidation triggers
- recovery context.

A UUID alone is insufficient. The fence needs continuity semantics across resource replacement and recovery.

## 4. Resource incarnation is mandatory
Attack:
1. Fence F1 is installed on resource R incarnation I1.
2. R is replaced and becomes I2.
3. F1 remains known to Nexo.
4. Provider reports F1 active.
5. A stale command arrives against I2.

F1 cannot automatically fence I2.

Therefore:
RESOURCE_REPLACED -> NEW_RESOURCE_CONTEXT

And:
OLD_FENCE(I1) != CURRENT_FENCE(I2)

A new incarnation requires new enforcement verification.

## 5. Alternate-path bypass
Attack:
- primary API checks F1;
- provider has administrative API;
- retry queue bypasses primary API;
- callback worker writes directly;
- emergency channel mutates the resource;
- provider-side automation creates a continuation.

A fence is only as strong as the closure of all effect-capable paths relevant to the claim.

Candidate:
EffectPathClosure(FenceClaim)

Required:
- known effect-capable interfaces;
- callbacks;
- retries;
- queues;
- provider redrives;
- delegated credentials;
- administrative paths;
- recovery paths;
- update paths;
- replacement/reincarnation paths;
- break-glass paths.

If closure is incomplete:
strong global containment claim is forbidden.

## 6. Quorum loss makes the problem harder
During quorum loss Nexo may know:
FENCE_REQUESTED
but not know whether the provider actually enforced it.

Therefore:
NO_QUORUM + FENCE_UNKNOWN -> HOLD/QUARANTINE

It may still publish a weaker claim such as:
CONTROL_PLANE_REQUESTED_STOP

but not:
EXTERNAL_EFFECT_PREVENTED

unless the enforcement boundary independently confirms it.

## 7. Fence acknowledgements
Candidate ladder:
F0 REQUESTED
F1 RECEIVED
F2 AUTHENTICATED
F3 CONTEXT_BOUND
F4 ENFORCEMENT_ACCEPTED
F5 ENFORCEMENT_VERIFIED
F6 EFFECT-PATH-CLOSURE_VERIFIED

Only F5/F6 can support strong containment, and F6 is needed if the claim covers all relevant provider paths.

An acknowledgement from the same control process is not independent enforcement evidence.

## 8. Fence generation and stale requests
Every protected effect must carry the applicable fence generation or equivalent resource-side version.

The resource boundary must reject stale generations.

This follows the established fencing-token pattern: a stale client can remain alive after ownership changes, so the protected resource—not merely the coordinator—must reject old generations. citeturn0search16turn0search3

But Nexo needs an additional condition:
the generation must be bound to resource incarnation and effect identity.

Thus:
VALID_FENCE_GENERATION + WRONG_RESOURCE_INCARNATION -> DENY

VALID_FENCE_GENERATION + WRONG_EFFECT_IDENTITY -> DENY

## 9. Resource restart
Attack:
1. resource remembers fence generation 42;
2. resource restarts;
3. in-memory high-water mark resets;
4. stale generation 41 arrives;
5. resource accepts it.

This breaks fencing.

Therefore the fence high-water mark must survive resource restart, or the resource must enter a fail-closed state until its current fence state is restored and verified.

This is a known requirement of resource-side fencing: losing the durable high-water mark can allow stale operations after restart. citeturn0search3

Candidate restart states:
RESOURCE_RESTARTED
→ FENCE_STATE_RESTORED
→ FENCE_STATE_AUTHENTICATED
→ CURRENT_GENERATION_VERIFIED
→ ENFORCEMENT_READY

Otherwise:
RESOURCE_FENCE_UNKNOWN -> QUARANTINE.

## 10. Resource replacement
Replacement is stronger than restart.

Restart:
same resource incarnation may survive.

Replacement:
new incarnation must be established.

Candidate:
I1 -> RETIRED
I2 -> CREATED
I2_IDENTITY_AUTHENTICATED
I2_FENCE_CONTEXT_BOUND
I2_ENFORCEMENT_VERIFIED

No old fence automatically transfers.

## 11. Provider callback after fence
Attack:
- effect E1 issued under generation 7;
- fence advances to 8;
- callback from E1 arrives;
- callback tries to continue the effect.

The callback is a new effect path.

Therefore:
OLD_EFFECT_CALLBACK != AUTOMATICALLY_SAFE

It must carry:
effect identity,
attempt identity,
resource incarnation,
fence generation,
continuation authorization.

Otherwise:
DENY/HOLD.

This extends the prior live-effect and continuation research.

## 12. Fence does not erase history
Even a perfectly enforced fence proves only a bounded property about effects after the enforcement boundary.

It does not prove:
- no previous effect happened;
- no earlier side effect exists;
- no historical external state changed;
- no already-committed operation exists.

Therefore:
FENCE_ENFORCEMENT != HISTORICAL_ERASURE

Historical uncertainty remains subject to reconciliation.

## 13. Fence and compensation
A compensation operation is itself an effect.

Therefore:
FENCE_FOR_EFFECT_A
does not automatically authorize
COMPENSATION_FOR_A.

Compensation requires its own current effect binding and fence semantics.

A fence cannot become an implicit compensation authority.

## 14. Fence and quorum restoration
After quorum returns:
DO NOT simply clear the fence.

Candidate:
QUORUM_RETURNED
→ IDENTIFY_FENCE_CONTEXT
→ VERIFY_RESOURCE_INCARNATION
→ VERIFY_FENCE_GENERATION
→ CLOSE_ALTERNATE_PATHS
→ RECONCILE_EFFECTS
→ REVALIDATE_ASSURANCE
→ AUTHORIZE_RELEASE
→ EXPLICIT_FENCE_RELEASE

If any step is unknown:
HOLD/QUARANTINE.

## 15. Fence as a root?
Final result of this attack:

An IndependentSafetyFence should NOT be modeled as an unconditional safety root.

Better abstraction:
ProtectedEnforcementContract

It is a bounded external contract that may become a safety anchor only when:
1. exact resource identity is known;
2. resource incarnation is current;
3. fence generation is ordered;
4. stale generations are rejected;
5. enforcement is durable across restart;
6. relevant effect paths are closed;
7. bypass assumptions are explicit;
8. verification evidence is independent enough for the claim;
9. invalidation/replacement semantics are defined;
10. the claim scope does not exceed verified enforcement scope.

## New invariants
F-ENF-01: Reported fence state cannot substitute for enforcement verification.
F-ENF-02: Fence claims cannot exceed verified effect-boundary closure.
F-ENF-03: Resource incarnation changes invalidate prior fence continuity unless explicitly re-established.
F-ENF-04: Stale fence generations must be rejected at the effect-capable boundary.
F-ENF-05: Resource restart must not resurrect stale fence generations.
F-ENF-06: UNKNOWN fence enforcement remains UNKNOWN across recovery.
F-ENF-07: Alternate effect paths must be closed or excluded from the claim.
F-ENF-08: Callback/continuation effects require fresh effect authorization context.
F-ENF-09: Fence enforcement does not prove historical absence of effects.
F-ENF-10: Fence activation does not grant normal authority.
F-ENF-11: Fence release is itself a protected transition.
F-ENF-12: Quorum restoration does not automatically release a fence.
F-ENF-13: Compensation is a new protected effect and requires its own binding.
F-ENF-14: A fence is a safety anchor only within its verified external contract.

## Candidate objects
- ProtectedEnforcementContract
- EnforcementBoundary
- FenceGeneration
- FenceVerificationRecord
- ResourceIncarnation
- EffectPathClosure
- BypassClosure
- FenceContinuityContext
- FenceReleaseTransition
- EnforcementClaim

## Architecture consequence
The minimum protected architecture now has a stronger boundary:

SafetyOrderingDomain
→ orders protected authority transitions

ProtectedEnforcementContract
→ enforces the final externally effect-capable boundary

Neither replaces the other.

Ordering can say:
WHO IS AUTHORIZED?

Enforcement can say:
WHICH STALE/UNAUTHORIZED EFFECTS WILL THE RESOURCE REJECT?

External reconciliation determines:
WHAT ACTUALLY HAPPENED?

This preserves the three-domain separation:
C1 AUTHORITY
C2 COORDINATION
C3 WORLD TRUTH

## Open boundary
The remaining hard question is now whether the enforcement boundary itself can be compromised or bypassed while still producing an apparently valid enforcement proof.

Next attack:
TRUSTED FENCE COMPROMISE / ENFORCEMENT-BOUNDARY CORRUPTION / FALSE ENFORCEMENT EVIDENCE.

Questions:
- What if the fence verifier and resource share the same compromised trust root?
- What if the provider lies about enforcement?
- What if the resource accepts the token but a privileged path bypasses the token check?
- What if the enforcement store rolls back?
- What if the resource-side high-water mark is corrupted?
- What constitutes independent evidence that the fence is actually enforced?

No correctness guarantee is claimed.
