# NEXO — Relevance Closure × Effect-Path Closure × Enforcement Boundary Research V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Unify three previously separate closure problems: security-relevant dependency closure, effect-path closure, and external enforcement-boundary closure. Determine the minimum claim scope that can safely be published when any one closure is incomplete.

## 2. Fundamental distinction
AUTHORITY_CLOSURE != EFFECT_PATH_CLOSURE != ENFORCEMENT_CLOSURE.
A complete authority dependency graph does not prove that every effect-capable continuation is contained.
A complete effect-path graph does not prove that the authority used to control it is current.
A verified enforcement boundary does not prove that the historical effect did not occur.

## 3. Three closures
RC = Relevance Closure: dependencies that can affect the truth of the protected claim.
EC = Effect-Path Closure: all effect-capable continuations, retries, callbacks, delegated effects, provider redrives, resource replacements, and hidden effect paths within the claim boundary.
FC = Enforcement Closure: the last effect-capable boundary at which Nexo can establish that stale/revoked/forbidden context is actually rejected or contained.

Candidate composite closure:
SafetyClosure(C) = RC(C) ∪ EC(C) ∪ FC(C) plus required evidence/authority dependencies.
This is a claim-scoped closure, not a universal graph.

## 4. Four failure combinations
RC complete / EC incomplete → authority may be sound but effect prevention claim is unresolved.
RC incomplete / EC complete → effect paths are known but trust/authority basis is incomplete.
RC complete / FC incomplete → Nexo knows the effect path but cannot prove the last boundary enforces the cutoff.
RC incomplete / EC incomplete / FC incomplete → only bounded containment or quarantine claims may remain.

## 5. Last-effect-capable boundary
Define LastEffectCapableBoundary for each effect class.
It is the furthest downstream component that can still cause the protected external effect.
Internal STOP or revocation is not sufficient if a downstream provider can continue execution.
Candidate invariant:
NO_INTERNAL_CONTROL_CLAIM_MAY_EXCEED_THE_VERIFIED_ENFORCEMENT_BOUNDARY.

## 6. Effect-path closure attack
Example:
Authority is current.
Relevance closure is complete.
Execution is admitted.
Provider P accepts effect.
Nexo receives timeout.
Provider has callback/retry/redrive path R.
R is not represented in EC.
Therefore the system cannot claim the effect path was fully contained.

Unknown continuation must remain UNKNOWN until a resource-side fence, provider contract, or reconciliation establishes the relevant property.

## 7. Enforcement closure attack
Example:
Nexo revokes authority.
Local executor stops.
External provider already holds a continuation token.
Provider's downstream worker remains effect-capable.
Local STOP evidence proves only local enforcement.
Therefore:
LOCAL_STOP_VERIFIED != EXTERNAL_EFFECT_PREVENTED.

Only an enforcement contract at the last effect-capable boundary can support the stronger claim.

## 8. Relevance closure attack
An effect path can introduce a new security-relevant dependency.
Example:
Provider failover selects a new KMS, identity service, policy service, or resource.
That new dependency changes the authority/effect context.
Therefore:
NEW_EFFECT_PATH_DEPENDENCY = NEW_RELEVANCE_CONTEXT_UNTIL_PROVEN_WITHIN_EXISTING_CLOSURE.

Effect-path expansion can invalidate authority assurance even if the original authority graph has not changed.

## 9. Cross-closure fixed point
Candidate iterative closure:
Start with claim C and its protected scope.
1. Compute relevance closure.
2. Expand all effect paths induced by that scope.
3. Identify enforcement boundaries.
4. Add dependencies introduced by those paths/boundaries.
5. Recompute relevance closure.
6. Repeat until stable or an unknown/open-world boundary is reached.

Candidate state:
CLOSURE_FIXED_POINT_VERIFIED
or
CLOSURE_FIXED_POINT_UNKNOWN

Do not publish a strong claim merely because one closure stabilized while another can still expand.

## 10. Cross-closure monotonicity
Adding a security-relevant dependency or effect path cannot increase the assurance claim without revalidation.
Adding an enforcement boundary may increase the supported claim only if its semantics are verified and compatible.
Removing a path or dependency requires protected evidence that the path is truly outside the claim boundary.

## 11. Scope vector
Introduce candidate ClaimScopeVector:
authority_scope
relevance_scope
effect_scope
enforcement_scope
evidence_scope
resource_scope
temporal_scope
dependency_scope.

Publication rule:
CLAIM_SCOPE_VECTOR <= VERIFIED_SCOPE_VECTOR component-wise, with explicit composition semantics.
A strong claim cannot borrow scope from a different dimension.

## 12. Partial fencing
If only some effect paths are fenced:
publish a weaker containment claim that explicitly excludes unfenced paths.
Never promote:
PARTIAL_FENCE → GLOBAL_EFFECT_PREVENTION.

Candidate:
CONTAINMENT_CLAIM_SCOPE <= VERIFIED_ENFORCEMENT_SCOPE.

## 13. External world truth remains separate
Even complete enforcement closure cannot prove historical absence unless the external resource/provider supplies a contract capable of establishing that fact.
Therefore:
ENFORCEMENT_VERIFIED != WORLD_HISTORY_VERIFIED.
After an uncertain effect, reconciliation remains necessary.

## 14. Recovery interaction
Recovery must recompute all three closures before release:
relevance closure
effect-path closure
enforcement closure.
Restoring a snapshot does not restore current closure or authority.
Resource replacement creates a new incarnation and requires a new effect/enforcement context.

## 15. Dynamic widening
If execution discovers a new provider, callback, child effect, resource, or delegation outside the frozen closure:
freeze continuation
create a new context
recompute affected closures
obtain required enforcement boundary
revalidate assurance
then explicitly authorize continuation.

Candidate:
NO_LIVE_EFFECT_MAY_CROSS_A_NEW_EFFECT_PATH_BOUNDARY_WITHOUT_A_PROTECTED_CONTINUATION_AUTHORIZATION.

## 16. Open-world limit
For an open-world external provider, global effect-path completeness may be impossible.
Then Nexo must use one of:
closed provider contract
boundary-bounded claim
resource-side fence
explicit environment assumption
weaker claim
quarantine.

Unknown-world closure cannot silently become a global prevention claim.

## 17. Formal target
Define a single abstract SafetyClosure state containing typed sub-closures and their generations.
Transitions must preserve:
closure soundness
scope non-amplification
authority currentness
effect identity continuity
enforcement-boundary validity
unknown preservation
invalidations.

A future TLA+ model should prove that a published claim's scope never exceeds the verified intersection of its required closure dimensions. Lamport's refinement approach provides the appropriate conceptual structure: define the high-level safety property first, then prove the lower-level specification implements it through an explicit refinement mapping. citeturn0search13turn0search14

## 18. External cross-check
NIST SP 800-193 distinguishes protection, detection, and recovery roots and notes that when one device relies on another device for security functionality, that reliance creates a critical trust relationship. This supports explicitly modeling downstream enforcement and trust dependencies instead of treating internal authorization as sufficient. citeturn0search17turn0search5
NIST also describes roots of trust as firm foundations for security and treats them as inherently trusted components. That reinforces the need to keep the trust boundary explicit rather than allowing a derived closure result to become its own root. citeturn0search2

## 19. Candidate invariants
REC-01 RELEVANCE_CLOSURE != EFFECT_PATH_CLOSURE != ENFORCEMENT_CLOSURE
REC-02 STRONG_EFFECT_PREVENTION_REQUIRES_RELEVANT_CLOSURE_AND_EFFECT_PATH_CLOSURE_AND_ENFORCEMENT_CLOSURE
REC-03 INTERNAL_STOP_CANNOT_EXCEED_VERIFIED_ENFORCEMENT_BOUNDARY
REC-04 UNKNOWN_EFFECT_CONTINUATION_REMAINS_UNKNOWN
REC-05 NEW_EFFECT_PATH_DEPENDENCY_REQUIRES_CONTEXT_REVALIDATION
REC-06 PARTIAL_FENCE_CANNOT_BECOME_GLOBAL_PREVENTION_CLAIM
REC-07 ENFORCEMENT_VERIFIED_DOES_NOT_PROVE_WORLD_HISTORY
REC-08 RECOVERY_REQUIRES_RECOMPUTATION_OF_ALL_REQUIRED_CLOSURES
REC-09 LIVE_EFFECT_CANNOT_CROSS_NEW_EFFECT_PATH_BOUNDARY_WITHOUT_PROTECTED_CONTINUATION_AUTHORIZATION
REC-10 CLAIM_SCOPE_VECTOR_CANNOT_EXCEED_VERIFIED_SCOPE_VECTOR
REC-11 CLOSURE_EXPANSION_CANNOT_STRENGTHEN_CLAIM_WITHOUT_REVALIDATION
REC-12 CLOSURE_REDUCTION_REQUIRES_PROTECTED_JUSTIFICATION
REC-13 OPEN_WORLD_CLOSURE_CANNOT_SUPPORT_UNBOUNDED_GLOBAL_PREVENTION_CLAIMS
REC-14 CLOSURE_FIXED_POINT_MUST_INCLUDE_ALL_REQUIRED_CLOSURE_DIMENSIONS
REC-15 DERIVED_CLOSURE_RESULT_CANNOT_SELF-AUTHORIZE_THE_TRUST_BOUNDARY_IT CLAIMS_TO ESTABLISH

## 20. Open gaps
RG1. Formal semantics of SafetyClosure fixed point.
RG2. Efficient joint closure computation without state explosion.
RG3. Formal relation between effect-path closure and resource-side enforcement.
RG4. How to represent open-world provider boundaries in finite formal models.
RG5. How to compose partial enforcement scopes without accidental promotion.
RG6. How to preserve closure generations through recovery/root rotation/compaction.
RG7. How to prove implementation closure discovery refines the abstract closure.
RG8. How to construct adversarial tests that target cross-closure omissions.

## 21. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.