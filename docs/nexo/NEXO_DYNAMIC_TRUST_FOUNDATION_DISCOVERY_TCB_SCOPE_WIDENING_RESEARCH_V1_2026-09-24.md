NEXO - DYNAMIC TRUST FOUNDATION DISCOVERY / TCB SCOPE WIDENING / LIVE CLAIM EXPANSION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

QUESTION
If a new dependency or Trust Foundation is discovered during a live operation, can it be incorporated into a live composite claim without creating an authority gap, or must trust/TCB expansion be treated as protected scope widening?

EXTERNAL CROSS-CHECKS
NIST SP 800-193 says roots/chains of trust must remain immutable or protected by mechanisms preserving their integrity, and mutable roots/chains must be updated through authenticated mechanisms while remaining operational or recoverable across catastrophic interruption. This supports treating trust-foundation change as a protected transition, not ordinary runtime discovery. cite: turn0search13, turn0search0.
NIST describes roots as highly reliable components performing specific critical security functions and notes that stronger assurance may require grounding security mechanisms in such roots. cite: turn0search1.
TLA+ refinement requires the concrete implementation to imply the higher-level specification under a refinement mapping. A newly discovered dependency therefore cannot simply be added to a proof/assurance context without showing that the resulting concrete state still refines the target claim. cite: turn0search14, turn0search15.

CORE RESULT
A safety-relevant trust/TCB expansion during a live operation is not merely INFORMATION.
DISCOVERY != AUTHORIZATION.
TCB_EXPANSION != FREE_RUNTIME_MUTATION.
New dependency must be already covered, proven irrelevant, routed through protected scope widening, or kept in HOLD/QUARANTINE/DEGRADED state.

DISCOVERY CLASSES
D0 OBSERVATIONAL_ONLY: cannot influence claim/effect.
D1 ALREADY_CLOSED: already included in frozen transitive closure.
D2 IRRELEVANT_FOR_CLAIM: complete analysis shows no claim impact.
D3 NEW_RELEVANT_DEPENDENCY: requires scope widening and revalidation.
D4 UNKNOWN_RELEVANCE: strong claim blocked/degraded.
D5 AUTHORITY_EXPANDING: introduces capability/provider/delegation/trust root/boundary/recovery path; protected admission required.
D6 COMPROMISED/UNTRUSTED: containment/replacement/revalidation required.

FROZEN CONTEXT
Protected admission binds to a frozen context C0 containing TCB closure, dependency closure, effect-path closure, boundary closure, trust foundations, resource incarnations, policy/invariant versions, topology, interaction graph, proof/assurance context and authority/fence generations.
NEW_DEPENDENCY is not automatically part of C0. It becomes context change C0 -> C1 and requires compatibility analysis.

AUTHORITY GAP ATTACK
A0 admitted under C0 -> provider discovers D -> D controls queue/capability -> A0 continues without revalidation.
Then EFFECT_PATH(C1) > EFFECT_PATH(C0) while AUTHORITY(C0) remains active. That is hidden authority expansion.
Forbidden: OLD_AUTHORITY + NEW_UNVALIDATED_PATH = VALID_EXECUTION.
Required: NEW_RELEVANT_PATH -> FENCE/HOLD -> RECOMPUTE CLOSURE -> REVALIDATE -> NEW PROTECTED ADMISSION.

DYNAMIC PLUGIN ATTACK
If admitted plugin P0 loads P1 and P1 can access an external provider, enqueue work, call privileged APIs, modify policy, request recovery, delegate capability or change resource target, P0 cannot silently inherit P1 authority unless P1 was already covered by the frozen envelope.
DYNAMIC_LOADABLE_CAPABILITY must be pre-authorized within a bounded capability domain, proven irrelevant, or treated as scope widening.

CAPABILITY ENVELOPE
Candidate bounded envelope defines allowed provider/effect classes, maximum delegation depth, resource and authority scope, trust roots, boundaries, temporal limits, recovery/update constraints and interaction constraints.
Dynamic behavior inside the envelope need not widen the claim if the envelope is sound and current. Behavior outside it is scope widening.

BOUNDARY-BASED DISCOVERY
With a verified enforcement boundary, Nexo may not need to enumerate every internal provider. The claim can remain bounded to boundary closure plus environment contract.
If discovery reveals a path bypassing that boundary, the existing claim is invalidated.

TCB EXPANSION VS REPLACEMENT
Changes can be ADD, REPLACE, REMOVE, MIGRATE, SPLIT, MERGE or UNKNOWN.
Replacement/removal still require coverage or compatibility proof. A disappearing dependency is not automatically disappearance of risk.

NO AUTO-CURRENT
New dependency is not current merely because it is authenticated, signed, recent, reachable, healthy, approved by a plugin or present in a service registry. Currentness is claim-specific and context-bound.

TrustExpansionTransition candidate fields: transition_id; affected_claims; previous/proposed_context_id; new dependency/foundation; discovery reason; authority/effect-path/TCB/boundary/interaction impacts; resource/incarnation impact; policy/invariant compatibility; proof/assurance impact; invalidation generation; fence set; uncertainty set; linearization; enforcement verification; reconciliation requirement; result ACCEPT/REVALIDATE/REJECT/QUARANTINE.

FrozenClaimContext candidate fields: context_id; claim_id; TCB/dependency/effect-path/boundary closures; trust foundations; authority/fence generations; resource incarnations; topology generation; policy/invariant versions; proof fingerprint; assurance bundle; interaction/hypergraph; environment assumptions; continuity anchor; invalidation generation; scope freeze status.

CapabilityEnvelope candidate fields: envelope_id; allowed capabilities; effect classes; provider classes; resource scope; delegation bound; trust roots; boundary set; temporal validity; recovery/update constraints; interaction constraints; failure-domain assumptions; continuity context; invalidation triggers.

SCOPE WIDENING PROTOCOL
DISCOVER -> CLASSIFY -> DETERMINE CLAIM IMPACT -> FREEZE OLD EFFECT PATH -> BLOCK NEW PATH -> COMPUTE NEW CLOSURE -> CHECK TCB/FOUNDATION -> CHECK BOUNDARIES -> CHECK INTERACTIONS -> CHECK ASSUMPTIONS -> CHECK PROOF/ASSURANCE COMPATIBILITY -> ESTABLISH CURRENT AUTHORITY -> PROTECTED SCOPE-WIDENING LINEARIZATION -> VERIFY ENFORCEMENT -> REVALIDATE CLAIM -> EXPLICIT RELEASE.

LIVE EFFECTS
If the new dependency is irrelevant or already covered, the effect may continue under C0.
If it changes the effect path, continuation must be classified as FENCE, PAUSE, REVALIDATE, CONTINUE_UNDER_C0, CONTINUE_UNDER_NEW_CONTEXT or QUARANTINE.
If continuation under C0 is unsafe, the old effect must be fenced/reconciled.

AUTHORITY DOES NOT EXPAND RETROACTIVELY
New capability discovered during execution cannot retroactively validate previously unauthorized actions. New authority is not retroactive authorization.

TCB COMPOSITION AND MISSION CLAIMS
When a new foundation enters a mission closure, recompute mission invariant closure, aggregate budgets, temporal occupancy, effect interactions, uncertainty and common-mode dependencies, then rebuild the assurance bundle.

DYNAMIC FOUNDATION REMOVAL
Removal requires proof of irrelevance, replacement coverage, migration compatibility or claim invalidation/degradation.

DELEGATION
Delegation creates new effect paths. If delegation exceeds the bounded depth or has no terminating enforcement boundary, strong global claims become unavailable.

UPDATE AND RECOVERY
Update can introduce new dependencies without changing visible Nexo code, so update requires dependency-closure recomputation. Recovery can restore stale dependency metadata, so recovery must rebuild current closure before release.

PARTIAL INVALIDATION
A new dependency can affect Claim A but not Claim B only if impact closure proves separation. UNKNOWN impact is not NONE.

CANDIDATE INVARIANTS INV-TSE-01..40
01 discovery is not authorization.
02 discovery does not silently widen current authority.
03 new relevant dependency invalidates incompatible assurance.
04 unknown relevance cannot be treated as irrelevant.
05 frozen context remains authoritative for the already-admitted effect.
06 new capability cannot use old admission automatically.
07 scope widening is a protected transition.
08 dynamic plugins remain inside a bounded capability envelope or require widening.
09 dynamic delegation cannot silently increase authority.
10 delegation depth is safety-relevant.
11 unbounded delegation without terminating boundary blocks strong global claims.
12 new provider paths require effect-path closure.
13 new bypass paths invalidate affected claims.
14 authenticated dependency is not automatically current.
15 signed dependency is not automatically semantically compatible.
16 healthy dependency is not automatically safe.
17 new trust foundation requires TCB recomputation.
18 new common root triggers common-mode recomputation.
19 removal of dependency requires coverage proof.
20 replacement requires compatibility proof.
21 migration does not preserve authority automatically.
22 old authority cannot authorize newly discovered effects.
23 new authority cannot retroactively authorize old effects.
24 live effect continuation requires context compatibility.
25 live effect may need fencing after relevant discovery.
26 mission claim must recompute aggregate closure after relevant expansion.
27 proof cache cannot absorb dynamic closure changes automatically.
28 assurance bundle must bind to current closure.
29 scope certificate is not authority.
30 capability envelope is not proof of external world truth.
31 environment assumptions remain explicit.
32 dynamic discovery cannot bypass the enforcement boundary.
33 boundary bypass discovery invalidates dependent claims.
34 recovery recomputes current closure.
35 update recomputes current closure.
36 rollback does not restore historical closure as current.
37 unknown overlap causes conservative impact classification.
38 false-stale is preferred to false-current.
39 strong claims require sound closure.
40 formal/runtime/deployment correctness remains unproven.

CANDIDATE THEOREM
Not formally proven: If a protected claim is bound to a complete frozen closure, and every newly discovered claim-relevant dependency either was already inside that closure, is proven irrelevant, or must cross a protected scope-widening transition before gaining effect/authority, then discovery cannot silently increase the authority or effect-path of the live claim.
If closure completeness or relevance is unknown, the strong claim must be held/degraded/revalidated unless an independently enforced boundary makes the unknown path irrelevant to the claim.

ARCHITECTURE CONSEQUENCE
The clean architecture needs an explicit Trust/Scope Change function integrated with Dependency Closure, Invalidation, Scope Computation, Authority, Assurance, Fencing, Update and Recovery.
Canonical rule: DISCOVERY -> CLASSIFY -> IMPACT -> FREEZE/INVALIDATE -> REVALIDATE -> PROTECTED WIDENING -> VERIFY -> RELEASE.
No silent runtime trust expansion.

DEEP RULE
NEW TRUST IS NEW AUTHORITY CONTEXT UNTIL PROVEN OTHERWISE.

No implementation or formal verification is claimed.

NEXT ATTACK
DYNAMIC TRUST EXPANSION + LIVE EXTERNAL EFFECT + SCOPE WIDENING + CONCURRENT INVALIDATION + ASSURANCE COMMIT + CRASH/RECOVERY.
Question: if a live effect needs a newly discovered provider/dependency while invalidation or quarantine races with scope widening, what single ordering prevents the effect from crossing the old boundary under old authority while the new path is still unverified?