# NEXO - PROOF REUSE / CONTEXT MIGRATION / POLICY DRIFT / EFFECT CONTRACT DRIFT RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

When may an old proof be reused in a new context that appears semantically equivalent, and when must it be rechecked or rejected?

Scenario:
OLD PROOF
+ apparently equivalent new model
+ policy change
+ external-effect contract change
+ resource replacement
+ partial invalidation
+ concurrent admission.

## External cross-check

TLA+ refinement is explicitly contextual: an implementation satisfies a higher-level specification under a particular refinement mapping. Lamport states that invariants transfer through a valid refinement mapping, but the mapping itself is part of what must be established. cite: turn0search36, turn0search40.

TLA+ proof obligations are context-bound: a theorem is an obligation from a context containing declarations, definitions, facts and assumptions. cite: turn0search38.

Kubernetes resourceVersion demonstrates the distinction between a resource's version and current usable context: stale writes can be rejected with 409, historical watch versions can expire, and some reads may be served from older versions depending on requested semantics. cite: turn0search0, turn0search4.

SLSA dependency provenance treats resolved dependency information as part of the provenance chain, reinforcing that artifact identity alone is insufficient to describe the dependency context under which it was admitted. cite: turn0search2.

## Core result

Proof reuse is not a binary property of the proof artifact.

It is a relation:

ProofReuse(P_old, Context_old, Context_new, Claim)

and must be evaluated against the complete current claim context.

Therefore:

SAME_PROOF_BYTES != SAME_PROOF_CONTEXT

SAME_MODEL_VERSION != SAME_CONTEXT

SEMANTIC_EQUIVALENCE != CURRENT_AUTHORITY

PROOF_VALID != PROOF_REUSABLE

PROOF_REUSABLE != OPERATION_ADMISSIBLE.

## Four distinct questions

For an old proof P and new context C2:

1. Is P mathematically valid for C1?
2. Is C2 equivalent/refining C1 for the claim?
3. Does P discharge the obligations required in C2?
4. Is an operation currently authorized under C2?

A YES to one does not imply YES to the next.

## Context delta taxonomy

Every reuse attempt should classify changes:

D0 NONE
D1 REPRESENTATIONAL_ONLY
D2 PROVEN_CLAIM_EQUIVALENT
D3 REFINEMENT_COMPATIBLE
D4 OPERATIONAL_RECHECK_REQUIRED
D5 PROOF_INVALIDATED
D6 CONTINUITY_BROKEN
D7 EXTERNAL_CONTRACT_UNKNOWN
D8 RESOURCE_INCARNATION_CHANGED
D9 DEPENDENCY_CLOSURE_CHANGED
D10 BOUNDARY_CHANGED
D11 POLICY_CHANGED
D12 INVARIANT_CHANGED
D13 ASSUMPTION_CHANGED
D14 TOOLCHAIN/BACKEND_CHANGED
D15 RECOVERY/STOP_CONTEXT_CHANGED
D16 TOPOLOGY/SCOPE_CHANGED.

These are not ordered merely by severity; multiple deltas can coexist.

## Important distinction: semantic equivalence vs policy compatibility

Two models may be semantically equivalent with respect to invariant M but have different operational policy.

Example:

C1 permits retry after timeout.
C2 forbids retry after timeout.

The invariant may be identical.

A proof of the invariant can remain valid.

But an old admission decision cannot be reused.

Therefore:

SEMANTIC_EQUIVALENCE_FOR_M != POLICY_COMPATIBILITY.

## External effect contract drift

Suppose old provider contract states:

ACK = EFFECT_COMMIT.

New provider contract states:

ACK = REQUEST_ACCEPTED.

The local control model can be unchanged and the old proof can remain logically correct relative to the old contract.

But the external-effect claim is no longer discharged.

Therefore:

PROOF_VALID_FOR_OLD_CONTRACT
!=
PROOF_VALID_FOR_NEW_EXTERNAL_CLAIM.

This is a particularly dangerous form of drift because local source code may not change.

## Resource replacement

R1 -> R2.

Even if:
- same logical resource name;
- same artifact;
- same configuration;
- same provider;
- same bytes;

the resource incarnation is different.

Old proof context cannot automatically transfer.

Need:

RESOURCE_INCARNATION_COMPATIBILITY

and, where required:

EFFECT_IDENTITY_TRANSFER_CONTRACT.

Absent that, old bindings/evidence/fences are stale.

## Partial invalidation

A change need not invalidate every proof.

Example:
- P1 depends on provider A.
- P2 depends on provider B.
- B changes.

If closure is complete and disjointness is proven, P1 may remain current while P2 becomes invalid.

But if impact closure is incomplete:

IMPACT_UNKNOWN -> REVALIDATE/HOLD.

Therefore the unit of reuse is the obligation/claim closure, not the proof file.

## Candidate ProofReuseContext

Fields:
- reuse_id;
- proof_id;
- claim_id;
- old ProofContext fingerprint;
- new ProofContext fingerprint;
- context delta;
- semantic equivalence status;
- refinement status;
- dependency closure;
- assumption graph;
- hypergraph/interactions;
- policy/invariant versions;
- external contract identities;
- resource/provider incarnations;
- boundary generation;
- continuity context;
- invalidation generation;
- proof obligation set;
- required rechecks;
- currentness;
- decision;
- decision evidence.

## Candidate ProofReuseDecision

States:

REUSE_VERIFIED
- exact required context compatibility is established;
- no relevant invalidation;
- obligations unchanged or proven discharged;
- external contracts compatible;
- resource/boundary context compatible;
- refinement remains valid.

REUSE_WITH_RECHECK
- reuse is a candidate optimization only;
- specific obligations must be recomputed before claim promotion.

RECOMPUTE
- context changed materially but the proof may remain useful as historical evidence.

REJECT
- incompatibility, invalidation, broken continuity or insufficient proof context.

UNKNOWN
- required compatibility cannot be established.

Important:

REUSE_VERIFIED is still an assurance result, not an authority grant.

## Semantic equivalence classes

For claim M:

E0 EQUIVALENCE_PROVEN
E1 SAFETY_EQUIVALENCE_BOUNDED
E2 REFINEMENT_COMPATIBLE
E3 SYNTACTICALLY_DIFFERENT_BUT_SEMANTICALLY_COMPATIBLE
E4 UNKNOWN
E5 REFUTED.

E4/E5 cannot support silent proof reuse.

E3 requires an explicit semantic argument; byte difference is not itself failure.

## Proof compatibility must be claim-relative

A context can be equivalent for:

M1 = local resource capacity

but not equivalent for:

M2 = mission-wide temporal occupancy.

Therefore:

Equivalent(C1,C2,M1)
does not imply
Equivalent(C1,C2,M2).

The proof reuse engine must carry the claim identifier and obligation projection.

## Non-monotonic policy

Policy changes can strengthen or weaken constraints.

Neither direction automatically authorizes reuse.

If policy strengthens:
- old proof may remain mathematically valid;
- old admission may still be stale.

If policy weakens:
- old proof may cover only the narrower old domain;
- reuse for the broader domain requires proof of extension.

Therefore:

POLICY_CHANGE -> ADMISSION_REEVALUATION

and potentially:

POLICY_CHANGE -> PROOF_RECHECK.

## Invalidation race

Scenario:

1. P_old is current.
2. dependency D changes.
3. invalidation propagation begins.
4. stale proof cache still says current.
5. admission request arrives.
6. cache says reusable.
7. authoritative invalidation cutoff has not yet been observed by the cache.

Safe architecture requires the admission core to bind to authoritative currentness, not cache state.

Thus:

CACHE_CURRENTNESS != AUTHORITATIVE_CURRENTNESS.

This matches the general concurrency lesson from Kubernetes resourceVersion: stale context must be detectable at the authoritative update boundary rather than trusted because a local cache looks current. cite: turn0search0, turn0search4.

## Proof reuse and concurrent admission

A proof reuse decision itself can race with:
- policy update;
- dependency invalidation;
- resource replacement;
- boundary generation change;
- STOP;
- recovery;
- scope widening;
- external contract update.

Therefore the reuse result must be bound to the same protected context/generation used by admission.

Candidate sequence:

LOAD_PROOF
→ COMPUTE_CONTEXT_DELTA
→ BUILD_CURRENT_CLOSURE
→ CHECK_EQUIVALENCE/REFINEMENT
→ CHECK_INVALIDATION
→ CHECK_EXTERNAL_CONTRACT
→ CHECK_RESOURCE/BOUNDARY
→ CHECK_OBLIGATIONS
→ FREEZE_REUSE_CONTEXT
→ PROTECTED_ADMISSION.

## ABA problem

Context identifiers must prevent:

C1 -> C2 -> C1

from being mistaken for “unchanged.”

Byte-identical restoration is not sufficient.

Candidate continuity identity:

ContextIdentity =
semantic context
+ authority generation
+ invalidation generation
+ boundary generation
+ dependency closure version
+ resource/provider incarnations
+ topology/scope
+ continuity anchor.

Therefore:

C1_BYTES == C3_BYTES
does not imply
C1_CONTEXT == C3_CONTEXT.

## Rollback

Rollback is a new transition, not temporal reversal.

C2 -> rollback -> C3

can restore old code while still producing a new authority/context generation.

Old proof P1 from C1 cannot silently become current simply because C3 resembles C1.

Need either:
- explicit compatibility/refinement proof;
- proof recheck;
- recomputation.

## External contract identity

Candidate ExternalContractIdentity should include:
- provider identity;
- effect class;
- request semantics;
- ACK semantics;
- commit boundary;
- idempotency;
- retry/redrive;
- cancellation/fencing;
- history/status;
- retention/proof boundary;
- replacement semantics;
- autonomous continuation;
- failure assumptions;
- dependency/trust context.

A provider code hash alone is insufficient.

## Proof obligation delta

Let:

O_old = obligations discharged by P_old.
O_new = obligations required by C_new.

Reuse requires:

O_new subset/equivalent to discharged obligations

under a valid context/refinement relation.

If:

O_new contains an obligation absent from O_old,

the old proof cannot silently discharge it.

If an old obligation is removed, the old proof may remain historical evidence but currentness must be recomputed.

## Candidate theorem

Not formally proven:

Proof P_old is reusable for claim M in C_new only if:
1. P_old is verified for C_old;
2. C_new is compatible with C_old for M under an explicit semantic/refinement relation;
3. all claim-relevant dependency, effect-path, boundary, resource/incarnation and environment closures remain compatible;
4. required obligations in C_new are covered;
5. assumptions remain valid and non-circular;
6. no relevant invalidation remains unresolved;
7. external effect contracts remain compatible;
8. continuity is preserved or a valid migration/refinement establishes the new continuity;
9. the reuse decision is bound to the authoritative current context;
10. current authority is separately established.

This theorem is a design candidate, not formally proven.

## Candidate invariants INV-PRU-01..42

01 Proof validity is context-bound.
02 Proof bytes do not define current proof context.
03 Semantic equivalence is claim-relative.
04 Refinement compatibility is distinct from equality.
05 Policy compatibility is distinct from semantic equivalence.
06 External contract compatibility is distinct from model equivalence.
07 Resource incarnation is part of relevant context.
08 Provider incarnation may be part of relevant context.
09 Boundary generation is part of relevant context.
10 Continuity identity prevents ABA reuse.
11 Rollback does not restore historical authority.
12 Partial invalidation requires complete impact closure.
13 Unknown impact prevents strong reuse.
14 Cache currentness does not establish authoritative currentness.
15 Reuse decisions must bind to current invalidation generation.
16 Reuse decisions must bind to current authority context.
17 A changed obligation cannot be discharged by an unrelated old proof.
18 Removing an obligation does not prove the remaining context is current.
19 Strengthened policy does not automatically preserve admission.
20 Weakened policy does not automatically expand proof domain.
21 External ACK semantics changes invalidate dependent claims.
22 Resource replacement invalidates old target bindings unless transfer is proven.
23 Provider retry semantics changes invalidate dependent continuation claims.
24 Scope/topology changes can invalidate abstraction completeness.
25 STOP/recovery changes can invalidate operational admissibility.
26 Toolchain/backend changes may require proof recheck.
27 Assumption changes require assumption revalidation.
28 Dependency closure changes require impact analysis.
29 Boundary closure changes require impact analysis.
30 Proof reuse never grants authority.
31 Proof cache hit never grants authority.
32 Historical proof remains historical after invalidation.
33 Current proof is claim/context-specific.
34 Equivalent content can have different continuity context.
35 Different content can be semantically equivalent for a claim.
36 Unknown semantic equivalence cannot justify silent reuse.
37 Concurrent invalidation and admission require authoritative ordering.
38 Recovery must reconstruct current proof context rather than restore historical currentness.
39 Composed proof reuse must preserve higher-order interactions.
40 Joint uncertainty must remain represented where claim-relevant.
41 Safe non-reuse is preferable to false-current reuse.
42 Implementation refinement remains a separate verification gate.

## Architecture consequence

The Assurance Plane needs a protected lifecycle:

PROOF_GENERATION
→ CONTEXT_BINDING
→ VERIFICATION
→ CURRENTNESS
→ INVALIDATION
→ REUSE_ANALYSIS
→ RECHECK/RECOMPUTE
→ REPUBLISH

and the Authority Plane separately performs:

CURRENT_AUTHORITY
→ ADMISSION
→ EFFECT EXECUTION.

The proof system never directly flips authority.

## Formalization target

Future finite model:

- C1 old context;
- C2 changed policy;
- C3 rollback-equivalent content;
- R1 -> R2 resource replacement;
- P1 -> P2 external contract drift;
- partial dependency invalidation;
- stale proof cache;
- concurrent admission;
- ABA context identity;
- reuse/recheck/reject decisions.

Required safety property:

NO_ADMISSION_MAY_RELY_ON_PROOF_REUSE_UNLESS_REUSE_CONTEXT_IS_AUTHORITATIVELY_CURRENT_AND_ALL_REQUIRED_COMPATIBILITY_OBLIGATIONS_ARE_DISCHARGED.

A second property:

CONTEXT_ROLLBACK_MUST_NOT_RESTORE_HISTORICAL_PROOF_CURRENTNESS_OR_AUTHORITY_WITHOUT_EXPLICIT_REVALIDATION.

TLA+ refinement theory supports the distinction between a proof about one specification and a refinement relationship to another; the mapping itself is part of the correctness argument. cite: turn0search36, turn0search40.

## Next attack

The next round should attack the boundary between:

PROOF REUSE
+
PARTIAL INVALIDATION
+
MULTI-CLAIM SHARED DEPENDENCIES
+
CONCURRENT REVALIDATION
+
CLAIM DEGRADATION.

Question:

Can one dependency change invalidate only a subset of obligations while another concurrent change partially restores them, producing a mixed-generation assurance bundle that appears internally consistent but never existed as one coherent safety context?

This targets mixed-generation proof bundles, atomic assurance recomputation and claim-lattice degradation.