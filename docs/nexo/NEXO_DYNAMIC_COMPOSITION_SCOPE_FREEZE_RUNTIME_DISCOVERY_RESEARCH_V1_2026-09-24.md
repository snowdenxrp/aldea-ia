# NEXO — DYNAMIC COMPOSITION / SCOPE FREEZE / RUNTIME DISCOVERY — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Core result
A runtime-discovered effect, provider, resource, queue or dependency must NOT silently widen an already-authorized scope.

DISCOVERY != AUTHORITY
RUNTIME_DISCOVERY != ADMISSION
Scope widening is a protected transition.

## External cross-check
AWS Step Functions Distributed Map can create child workflow executions with separate histories; AWS also documents cases where child workflows may continue running after a parent Map Run crosses a failure threshold. Redrive can rerun unsuccessful child workflows and may create additional execution activity. citeturn0search0turn0search1turn0search5
Kubernetes admission guidance similarly treats side effects, dependency loops, dry-run behavior and failure policy as explicit admission concerns rather than something a webhook may silently introduce. citeturn0search6turn0search8

## 1. Static closure is not enough
At admission E1 has closure C1, scope S1 and authority A1. During execution E1 may discover E2, a new resource, provider, queue, child effect or dependency. The discovery may be disjoint, compatible, conflicting, order-sensitive, or safety-relevant.
Therefore the original closure may become incomplete.

## 2. Separate the transitions
DISCOVERY = observation that something exists.
SCOPE_CANDIDATE = proposed inclusion.
SCOPE_RECOMPUTATION = new closure calculation.
SCOPE_WIDENING = protected change of covered scope.
AUTHORITY_WIDENING = protected change of permission.
EXECUTION = actual effect.
None of these are interchangeable.

## 3. New object: DiscoveryRecord
Candidate fields: discovery_id, parent_effect_id, discovered_object, discovery_type, source, observation_context, provider/resource identity, resource incarnation, dependency evidence, effect-path evidence, freshness, closure impact, invalidation impact and status.
DiscoveryRecord is evidence, not authority.

## 4. New object: ScopeWideningRequest
Candidate fields: widening_id, current_scope_id, proposed_scope_delta, triggering_discovery, affected effects/resources, dependency delta, interaction classification, new uncertainty, new CCD, new containment boundary, current policy/invariant versions, authority, invalidation conditions and disposition.

## 5. Scope freeze
At protected admission Nexo creates a frozen execution context containing scope_id, effect identity, closure version, topology/dependency versions, policy/invariant versions, authority epoch, boundary generation, resource incarnations, fence set, allowed effect classes, allowed discovery classes and invalidation triggers.
ScopeFreeze is not permanent authority. It is the protected boundary within which execution may continue without re-admission.

## 6. Discovery classes
D0 informational only.
D1 already covered by current closure.
D2 equivalent representation already covered by the contract.
D3 new dependency.
D4 new effect path.
D5 new resource or incarnation.
D6 new provider/worker/queue.
D7 authority-relevant discovery.
D8 unknown or high-impact discovery.
D0-D2 may be handled without scope widening when equivalence is proven. D3-D8 require analysis; D7-D8 normally block protected execution until re-admission or an existing boundary contract covers them.

## 7. The dangerous downstream case
E1 is admitted, then produces E1 → queue Q → worker W → E2. If E2 was not inside the original closure, E1 cannot retroactively declare E2 part of its authority.
Correct sequence:
DISCOVERY → IMPACT → INVALIDATION IF REQUIRED → RECOMPUTE CLOSURE → RECOMPUTE CCD/CONTAINMENT → CURRENT AUTHORITY CHECK → PROTECTED SCOPE TRANSITION → RE-ADMISSION → EXECUTION.

## 8. Discovery can invalidate rather than widen
A discovery may reveal a stale resource, missing fence, untrusted provider, unsupported effect class, shared footprint, policy conflict or open-world path. Then the correct result is HOLD / QUARANTINE / INVALIDATE, not automatic expansion.

## 9. Complete vs current
SCOPE_COMPLETE != SCOPE_CURRENT.
A scope can be complete under an old topology and still be invalid after a resource replacement, policy change, provider change or new interaction.

## 10. Runtime race
Admission at T1, discovery at T2, protected effect at T3, recomputation at T4 is unsafe if the discovered object could affect the effect at T3.
Candidate rule: if safety-relevant scope status is not CURRENT and COMPLETE, protected execution is BLOCKED unless an existing verified boundary explicitly proves the new path irrelevant.

## 11. Widening can invalidate old authority
S2 being larger than S1 does not mean authority A1 remains valid. Widening can introduce new conflicts, fences, dependencies, assumptions, resource incarnations and claim requirements.
Likewise, shrinking scope is not automatically safe; removed elements need a proof that they cannot affect the claim.

## 12. Dynamic delegation
A delegation path E1 → capability → worker → E2 expands effect-path closure. Delegation must be bounded by target scope, effect class, resources, expiry, authority epoch, fence generation, continuity context and delegation depth.
Unbounded delegation prevents finite closure unless a terminating enforcement boundary exists.

## 13. Dynamic provider/resource/queue discovery
A newly discovered provider does not inherit the old provider's contract automatically.
A newly discovered resource does not inherit the old resource's authorization automatically.
A newly discovered queue is part of effect-path closure when it can create, retry, compensate, redrive, cancel or otherwise produce a protected effect.

## 14. Child workflows and redrive
AWS Distributed Map shows why parent scope cannot automatically stand for child effect scope: child workflows can have separate histories, and parent failure does not necessarily mean all child activity has already ceased. citeturn0search0turn0search3
AWS redrive also treats unsuccessful work as a new execution activity with its own retry/redrive semantics. Therefore redrive must be a new protected transition, not a silent continuation of historical authority. citeturn0search1turn0search5

## 15. Crash, update and STOP
Restoring an old ScopeFreeze does not restore authority. Recovery must establish a new recovery context and current closure, topology, dependencies, fences, resource identities and policy/invariant versions.
Policy/artifact changes can invalidate a ScopeFreeze and require fencing, closure recomputation, compatibility evaluation and a new protected context.
STOP invalidates pending scope widening and release. Recovery may discover and analyze, but cannot self-authorize newly discovered effects.

## 16. Dynamic Scope Transition
Candidate protocol:
DISCOVER → RECORD → CLASSIFY → FREEZE CURRENT EXECUTION → INVALIDATE AFFECTED CLAIMS → COMPUTE NEW CLOSURE → COMPUTE NEW CCD → COMPUTE NEW CONTAINMENT → VALIDATE CURRENT CONTEXT → PROTECTED SCOPE TRANSITION → PROTECTED RE-ADMISSION → RESUME.
If safe widening cannot be established: HOLD / QUARANTINE.

## 17. New object: ScopeTransition
Candidate fields: transition_id, effect/composite identity, old_scope, new_scope, scope_delta, triggering discoveries, old/new context, closure versions, topology/dependency versions, policy/invariant versions, authority epoch, boundary generations, resource incarnations, fences, joint uncertainty, CCD, containment, invalidation set, linearization point, crash semantics and resume conditions.

## 18. New object: ScopeFreezeCertificate
Candidate claim: this execution is authorized only within scope S under context C.
Fields include scope, effect identity, context identity, authority epoch, closure version, boundary generation, resource incarnations, expiry, allowed discovery classes and invalidation triggers.
It is evidence of the protected context, not an independent authority grant.

## 19. Pre-authorized bounded expansion
Strict stop-and-re-admit is not the only possible safe design. Nexo may pre-authorize a bounded expansion envelope if membership, semantics, effect-path closure, authority and resource enforcement are all verifiable.
Therefore:
DYNAMIC INSTANTIATION != DYNAMIC AUTHORITY EXPANSION.

## 20. New object: ScopeEnvelope
Candidate fields: envelope_id, effect class, allowed object/resource/provider classes, interaction classes, maximum delegation depth, maximum dynamic cardinality, allowed topology changes, allowed incarnations, boundary set, dependency assumptions, claim strength, expiry and invalidation triggers.
Anything outside the envelope requires a new protected admission.

## 21. New invariants INV-DSR-01..32
01 Runtime discovery does not grant authority.
02 Discovered scope cannot silently exceed frozen scope.
03 Safety-relevant discovery invalidates affected admission unless already covered.
04 Scope completeness and currentness are distinct.
05 Scope widening is a protected transition.
06 Scope shrinkage requires proof.
07 New dependency requires closure recomputation unless already covered.
08 New effect path requires effect-path closure.
09 New provider does not inherit contract automatically.
10 New resource does not inherit authorization automatically.
11 New resource incarnation invalidates old target binding.
12 New queue can be an effect path.
13 Child workflows belong to closure when they can create protected effects.
14 Redrive is a new protected transition.
15 Retry budgets must account for dynamic paths.
16 Delegation expands closure.
17 Unbounded delegation prevents finite closure absent a terminating boundary.
18 Scope widening can invalidate previous authority.
19 Composite CCD must be recomputed when relevant interaction changes.
20 Containment must be recomputed when effect-path closure changes.
21 Joint uncertainty must be recomputed when relevant paths change.
22 Discovery evidence is not authority.
23 Historical scope certificates are not current authority after recovery.
24 Update invalidates incompatible scope contexts.
25 STOP invalidates pending widening/release.
26 Recovery cannot self-authorize discovered effects.
27 Pre-authorized bounded expansion is possible only inside a verified ScopeEnvelope.
28 ScopeEnvelope cannot exceed original authority/claim boundary.
29 Envelope membership must be verifiable at execution time.
30 Envelope changes are safety-relevant updates.
31 Unknown high-impact discovery defaults to HOLD/QUARANTINE.
32 Strong claims cannot exceed current verified scope closure.

## 22. Formal direction
Candidate ScopeState: FROZEN, DISCOVERY_PENDING, IMPACT_UNKNOWN, INVALIDATION_PENDING, RECOMPUTING, WIDENING_PENDING, REVALIDATING, TRANSITION_LINEARIZED, RELEASED, QUARANTINED.
Candidate transition DISCOVER(d) moves FROZEN to DISCOVERY_PENDING. Classification can return to REVALIDATING when already covered, or to INVALIDATION_PENDING when outside the current closure.
Candidate safety: EXECUTE(e) requires e.scope to be a VERIFIED_CURRENT_SCOPE or the effect to be covered by a verified ScopeEnvelope.

## 23. Architectural consequence
The clean architecture now explicitly separates STATIC CLOSURE, DYNAMIC DISCOVERY, SCOPE FREEZE, BOUNDED EXPANSION, SCOPE TRANSITION and AUTHORITY TRANSITION.
The agentic anti-pattern 'the agent discovered something useful, therefore it can use it' is structurally rejected.

## Remaining gaps
G-DSR-01 ScopeEnvelope authority-leak proof.
G-DSR-02 bounded dynamic cardinality.
G-DSR-03 runtime membership verification.
G-DSR-04 dynamic provider equivalence.
G-DSR-05 dynamic resource-incarnation handling.
G-DSR-06 scope transition linearization.
G-DSR-07 concurrent discovery and STOP.
G-DSR-08 concurrent discovery and revocation.
G-DSR-09 discovery during external UNKNOWN.
G-DSR-10 discovery during compensation.
G-DSR-11 discovery during recovery.
G-DSR-12 discovery during update/rollback.
G-DSR-13 formal refinement.
G-DSR-14 actual TLC/SANY.
G-DSR-15 implementation/fault-injection validation.

## Conclusion
A dynamically discovered capability must never silently enlarge authority.
The clean rule is DISCOVERY != AUTHORITY != SCOPE != EXECUTION.
Protected execution may continue after discovery only when the behavior is already covered by the current verified closure or by a bounded pre-authorized ScopeEnvelope. Otherwise: BLOCK → INVALIDATE → RECOMPUTE → RE-ADMIT.

## Next attack
SCOPE ENVELOPE ESCAPE / BOUNDED DYNAMIC CARDINALITY / ADVERSARIAL DISCOVERY.
Question: can an apparently bounded ScopeEnvelope be exploited by creating many individually valid resources, providers or delegates whose aggregate footprint exceeds the original safety proof?
This attacks cardinality, resource exhaustion, hidden composition, delegation depth, queue fan-out and mission-level invariants.