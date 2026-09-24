# NEXO - PROOF VALIDITY VS OPERATIONAL ADMISSIBILITY / POLICY & EFFECT-CONTRACT DRIFT - 2026-09-24
Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
Can an old proof remain valid for a safety invariant while becoming unsafe to reuse operationally because policy, external-effect semantics, rollback context, provider behavior, or enforcement boundaries changed?

## External cross-check
TLA+ refinement is semantic: a lower-level specification implements a higher-level one when its behaviors are permitted by the higher-level specification under a refinement mapping; syntax or variable identity is not the semantic criterion. citeturn0search1turn0search36
SLSA treats resolved dependencies as part of provenance and notes that recursive dependency analysis is necessary for stronger supply-chain assurance; its completeness guarantees are bounded rather than universal. citeturn0search0turn0search5
TUF explicitly separates authenticity from freshness/currentness by defending against rollback, freeze and mix-and-match attacks. citeturn0search3

## Core distinction
Four propositions must remain separate:
1. INVARIANT_VALID
2. PROOF_VALID_FOR_CONTEXT
3. OPERATIONALLY_ADMISSIBLE
4. CURRENT_AUTHORITY

PROOF_VALID != OPERATION_ADMISSIBLE
SEMANTIC_EQUIVALENCE != POLICY_COMPATIBILITY
POLICY_COMPATIBILITY != CURRENT_AUTHORITY
CURRENT_AUTHORITY != EXTERNAL_EFFECT_SUCCESS

## Key result
A proof can remain mathematically valid for context C1 while no longer discharging the current operational obligation in C2. A policy change may leave the theorem intact but alter the admission predicate. Therefore the correct response is often RECHECK, not INVALID_PROOF.

Policy changes split into: unchanged invariant but changed admission; changed invariant and therefore new obligations; or changed transition semantics and therefore invalidated proof context.

## External effect contract drift
An old proof may assume ACK means EFFECT_COMMIT while a provider later changes ACK to mean only REQUEST_ACCEPTED. The original theorem may remain internally correct relative to the old contract while becoming unsafe for the real system.
Therefore EXTERNAL_CONTRACT_IDENTITY must be part of proof context whenever the claim depends on provider semantics.
Relevant dimensions: ACK semantics, retry/redrive, idempotency lifetime, cancellation, fencing, history/query semantics, resource replacement, queue/child behavior, retention/proof boundary, provider execution identity.

Candidate ExternalContractCompatibility classes:
C0 INCOMPATIBLE
C1 FENCE_COMPATIBLE
C2 SEMANTICALLY_COMPATIBLE
C3 CONTRACT_CONTINUOUS
C4 UNKNOWN
UNKNOWN cannot silently become compatible.

## Non-monotonic policy changes
If ALLOW(E under C1) becomes DENY(E under C2), old cached decisions cannot be treated as current merely because the proof remains valid.
This produces PROOF_VALID + ADMISSION_STALE.
A strengthening policy does not automatically prove proof reuse. A weakening policy certainly does not extend the old proof to a broader admission region without a valid containment/refinement relation.

## Rollback and migration
Rollback is not temporal reversal. TUF's rollback and freeze defenses show why authenticated older metadata cannot simply be treated as current. citeturn0search3
Restoring historical content should create a new current context followed by revalidation.
CONTENT_EQUAL(C3,C1) does not imply CONTEXT_EQUAL(C3,C1).
Migration can preserve selected claims without establishing identity: C1 --MIGRATED--> C2 is not C1 == C2.

## Derived reuse eligibility
Do not store a mutable proof.reusable=true flag.
Derive REUSE_ELIGIBLE(P,C,M) from current proof context, complete closure, current policy/invariant, compatible external contract, compatible boundary/fence and resource incarnation, valid assumptions, obligation coverage, no relevant invalidation, valid refinement mapping, and separately established current authority.
Cache hits never grant authority.

## Two validity axes
Formal/epistemic axis: UNKNOWN -> CHECKED -> VERIFIED_FOR_CONTEXT -> CURRENT.
Operational axis: NOT_ADMISSIBLE -> ELIGIBILITY_COMPUTED -> ADMISSION_LINEARIZED -> EFFECT_EXECUTABLE.
A proof can be VERIFIED_FOR_CONTEXT while an operation remains NOT_ADMISSIBLE.

## Context deltas
Candidate ContextDelta classes:
ADD_DEP, REMOVE_DEP, CHANGE_SEMANTICS, POLICY_CHANGE, INVARIANT_CHANGE, MODEL_CHANGE, ENVIRONMENT_CHANGE, BOUNDARY_CHANGE, RESOURCE_INCARNATION, TOPOLOGY_CHANGE, ASSUMPTION_CHANGE, TOOLCHAIN_CHANGE, RECOVERY_CHANGE, STOP_POLICY_CHANGE, EXTERNAL_CONTRACT_CHANGE, CONTINUITY_CHANGE.
Each delta should map to impacted claims/obligations instead of causing universal invalidation by default.

## Safety asymmetry
For safety it is preferable to tolerate FALSE_STALE rather than FALSE_CURRENT.
If impact is unknown, RECHECK/HOLD is safer than silently preserving current assurance.

## External contract can drift without local code changes
Provider timeout semantics, queue delivery, resource firmware, ACK meaning, idempotency retention, resource replacement or boundary generation can change while Nexo source remains identical.
Therefore local source-hash stability is not proof-context stability.

## Proposed architecture
ProofContext: what was proven.
ProofResult: what verification established.
ContextCompatibility: whether assurance can apply to another context.
ReuseEligibility: whether it may be reused now.
AuthorityContext: whether the actor may perform the transition now.
ExternalEffectContract: what external acknowledgements/effects mean.
World/Evidence/Reconciliation: what actually happened.
No single object should collapse these meanings.

## Candidate invariants INV-DRIFT-01..36
01 Proof validity is context-bound.
02 Proof validity does not imply operational admissibility.
03 Operational admissibility does not imply world success.
04 Current authority is independent from proof reuse.
05 Policy changes can invalidate admission without invalidating historical proof.
06 Invariant changes can invalidate proof obligations.
07 External contract changes invalidate dependent proof contexts.
08 Provider version equality does not prove contract equality.
09 Provider version difference does not prove claim-relevant semantic difference.
10 API compatibility does not imply effect-contract compatibility.
11 Rollback does not restore historical authority.
12 Restored content creates a new current context.
13 Byte equality does not imply context equality.
14 Migration does not imply identity preservation.
15 Reuse eligibility is derived, not an unrestricted mutable flag.
16 Proof cache keys require context identity.
17 Cache hits never grant authority.
18 Unknown context deltas block strong reuse.
19 False-current is more dangerous than false-stale.
20 Currentness is not proof age.
21 Policy strengthening does not automatically prove reuse.
22 Policy weakening requires new proof or a valid containment relation.
23 External ACK semantics are contract-bound.
24 Provider behavior belongs in proof context when claim-relevant.
25 Resource incarnation belongs in proof context when claim-relevant.
26 Boundary generation belongs in proof context when claim-relevant.
27 Recovery semantics belong in proof context when claim-relevant.
28 STOP semantics belong in proof context when claim-relevant.
29 Proof status does not establish world truth.
30 Historical proof remains historical after invalidation.
31 Revalidation must use current dependencies and assumptions.
32 Semantic compatibility is claim-specific.
33 Refinement/subsumption relations must be explicit.
34 No silent extension from old proof domain to broader new domain.
35 Contract drift propagates through dependent claims.
36 Strong claims cannot exceed current proof context and operational contract.

## Architectural conclusion
The clean architecture needs a strict four-way boundary: PROOF VALIDITY vs CONTEXT COMPATIBILITY vs OPERATIONAL ADMISSIBILITY vs CURRENT AUTHORITY.
External-contract identity is a first-class safety dependency.
Critical rule: A VALID PROOF IS NOT A CURRENT PERMISSION.
Second rule: A CURRENT PERMISSION IS NOT EVIDENCE THAT THE WORLD OBEYED.

## Open gaps
G-DRIFT-01 formal policy-impact relation.
G-DRIFT-02 formal external-contract compatibility.
G-DRIFT-03 formal strengthening/subsumption relation.
G-DRIFT-04 migration proof contract.
G-DRIFT-05 contract-drift detection.
G-DRIFT-06 proof-cache invalidation implementation.
G-DRIFT-07 semantic dependency closure completeness.
G-DRIFT-08 formal refinement across rollback.
G-DRIFT-09 actual SANY/TLC/TLAPS.
G-DRIFT-10 implementation refinement.
G-DRIFT-11 fault-injection validation.
G-DRIFT-12 provider-specific external contract proofs.

## Next attack
PROOF REUSE + POLICY/CONTRACT DRIFT + PARTIAL INVALIDATION + CONCURRENT ADMISSION.
Question: Can one part of a proof remain current while another dependency is invalidated, and can Nexo safely admit an operation during the propagation window without either over-invalidating the entire assurance system or allowing stale assurance to cross the protected effect boundary?