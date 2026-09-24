# NEXO - MIXED-GENERATION ASSURANCE / ATOMIC REVALIDATION / CLAIM DEGRADATION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can concurrent partial invalidation and revalidation create an assurance bundle composed of individually valid pieces that never existed together as one coherent safety context?

## External cross-check

Kubernetes resourceVersion is scoped to a resource type and is used to express consistency requirements; clients can encounter stale data and expired historical versions. This supports the architectural distinction between individual currentness and a coherent current context. citeturn0search0

SLSA provenance explicitly binds provenance to build inputs, resolved dependencies, builder context and execution metadata; provenance is not just an artifact digest. Its model also treats dependency provenance as separately attestable per ingestion event. This supports modeling assurance context as a composed set of context-bound records rather than an unqualified proof blob. citeturn0search1turn0search2

## Core result

A collection of individually CURRENT assurance records can still be globally INVALID if they belong to different incompatible generations.

Therefore:

INDIVIDUAL_CURRENTNESS != BUNDLE_COHERENCE

and:

VALID_COMPONENTS != VALID_COMPOSITION.

## Canonical mixed-generation failure

Initial coherent context:

C10:
- Policy P10
- Dependency D10
- Boundary B10
- Resource R10
- Proof obligations O1,O2,O3

Then:

1. D changes to D11.
2. O2 becomes invalid.
3. Revalidation starts.
4. Before O2 finishes, policy changes P11.
5. O1 is revalidated against P11.
6. O3 remains cached from C10.
7. O2 is recomputed against C11.
8. A bundle is assembled:

O1@P11
O2@D11,P11
O3@C10

Every item can be individually authentic and valid for its own context.

But the bundle has no single coherent context.

This must not be promoted as one current mission assurance claim.

## New distinction

Four states are required:

1. RECORD_VALID
2. RECORD_CURRENT
3. BUNDLE_COHERENT
4. CLAIM_CURRENT

A record may be valid and current while the bundle is incoherent.

Therefore:

RECORD_CURRENT -> does not imply BUNDLE_COHERENT.

BUNDLE_COHERENT -> still does not imply CURRENT_AUTHORITY.

## Candidate AssuranceBundle

Fields:
- bundle_id;
- claim_id;
- bundle_context_id;
- proof_context_fingerprint;
- assurance_generation;
- invalidation_generation;
- policy_generation;
- dependency_generation;
- boundary_generation;
- topology/scope generation;
- resource/provider incarnation set;
- continuity context;
- obligation set;
- evidence set;
- proof-result references;
- assumption graph;
- interaction/hypergraph closure;
- environment/boundary closure;
- composition status;
- freshness/currentness;
- invalidation status;
- construction linearization reference;
- publication state;
- invalidation triggers.

The bundle must have a single coherent context identity or an explicit compositional relation proving compatibility among its components.

## Candidate AssuranceBundleConstruction

Construction should not simply merge current records.

Candidate protocol:

DISCOVER REQUIRED OBLIGATIONS
→ FREEZE TARGET CLAIM CONTEXT
→ SNAPSHOT AUTHORITATIVE GENERATIONS
→ COLLECT COMPONENT ASSURANCE
→ CHECK CONTEXT COMPATIBILITY
→ CHECK SHARED DEPENDENCIES
→ CHECK HIGHER-ORDER INTERACTIONS
→ CHECK ASSUMPTIONS
→ CHECK INVALIDATION CUTS
→ CHECK BOUNDARY/RESOURCE INCARNATIONS
→ COMPOSE
→ PROTECTED BUNDLE COMMIT
→ PUBLISH CLAIM.

The important operation is the final protected bundle commit.

## Why “latest component wins” is unsafe

Suppose:

O1@G12
O2@G13
O3@G12

Choosing the newest record for each obligation can produce:

O1@G13
O2@G13
O3@G13

only if the actual evidence and proof obligations were recomputed under a common G13 context.

Numeric generation labels cannot manufacture continuity.

Therefore:

MAX_GENERATION_COMPONENTWISE != CURRENT_COHERENT_BUNDLE.

## Context lattice

Candidate context relation:

EXACT_SAME
COMPATIBLE
REFINES
MIGRATES
PARTIALLY_COMPATIBLE
UNKNOWN
INCOMPATIBLE.

Composition may accept:
- EXACT_SAME;
- explicitly proven COMPATIBLE;
- explicitly proven REFINES/MIGRATES when the claim contract permits.

PARTIALLY_COMPATIBLE requires explicit claim decomposition.

UNKNOWN/INCOMPATIBLE cannot silently compose.

## Partial invalidation

A dependency change does not necessarily invalidate every obligation.

However, selective reuse is safe only if the dependency/obligation/claim closure proves the unaffected records are independent of the changed context.

Candidate impact relation:

Impact(D, O, C) ∈ {NONE, DIRECT, TRANSITIVE, UNKNOWN}.

NONE must mean complete closure proves no relevant dependency path.

UNKNOWN cannot be treated as NONE.

## Concurrent revalidation

Two revalidation workers may independently produce:

Worker A:
O1@G20, O2@G20

Worker B:
O3@G21

A naive merger could publish O1,O2,O3 as “current”.

Instead, bundle construction must verify a common compatible context or prove a compositional compatibility relation.

Candidate rule:

NO_MIXED_GENERATION_BUNDLE_WITHOUT_EXPLICIT_COMPATIBILITY_PROOF.

## Invalidation and bundle publication race

Race:

T1: bundle B prepared under G20
T2: dependency invalidation cutoff advances to G21
T3: B publication request arrives

If B was not linearized before T2, it must not publish as current.

If B linearized before T2, it is a historical/current-at-publication fact and the invalidation process must handle it as an admitted assurance state.

If ordering is unknown, strong publication is blocked.

Therefore:

BUNDLE_PUBLICATION_ORDER must be authoritative relative to invalidation.

## Candidate AssuranceGeneration

An assurance generation cannot be a single integer if different domains evolve independently.

Candidate:

AssuranceGeneration =
authority_epoch
+ invalidation_generation
+ policy_generation
+ dependency_generation
+ boundary_generation
+ topology_generation
+ resource/provider incarnation set
+ continuity anchor
+ proof context identity.

A vector is conceptually closer to the required semantics than a single global number, but even vector equality is not enough: continuity and semantic compatibility remain separate.

## Claim decomposition

Mixed contexts can sometimes be safe if the claim itself decomposes.

Example:

Claim C = C_local_A AND C_local_B

If C_local_A depends only on A and C_local_B only on B, selective currentness can be maintained.

But for:

C_mission = Aggregate(A,B)

the contexts must be jointly coherent at the aggregation boundary.

Therefore:

CLAIM_DECOMPOSABILITY is itself a proof obligation.

## Claim degradation

If a full mission claim cannot be reconstructed coherently, Nexo should not fabricate a binary failure.

Candidate claim lattice:

GLOBAL_MISSION_VERIFIED
BOUNDARY_VERIFIED
GROUP_VERIFIED
RESOURCE_VERIFIED
EFFECT_VERIFIED
CONTROL_VERIFIED
DEGRADED
UNKNOWN.

A degraded claim can preserve useful assurance without pretending that the stronger claim remains valid.

Critical monotonic rule:

CLAIM_DEGRADATION MUST NOT CREATE NEW AUTHORITY.

A weaker assurance claim is not a weaker permission automatically.

## Partial revalidation and obligation closure

Suppose:
- O1 unaffected;
- O2 invalid;
- O3 depends transitively on O2.

Then O3 is not independently current merely because its direct inputs did not change.

This reinforces:

OBLIGATION_CLOSURE != DIRECT_DEPENDENCY_LIST.

The dependency graph must be transitive and claim-specific.

## Higher-order mixed generation

The previous hypergraph research creates another hazard.

O1@G10 and O2@G11 may individually be current, while the interaction hyperedge:

{O1,O2,O3}

depends on a common context G11.

Therefore a bundle must validate not only individual obligations but also the currentness of the higher-order interaction structure.

Candidate:

HYPERGRAPH_CONTEXT_CURRENTNESS.

## Shared dependency change

If two claims share a dependency D:

C1 -> D
C2 -> D

a change in D may invalidate both, even if their proof artifacts differ.

Conversely, if C1 and C2 have disjoint complete dependency closures, selective invalidation may be safe.

Thus invalidation must operate on closure, not artifact identity.

## Assurance bundle and evidence

Evidence records must carry:
- context identity;
- dependency generation;
- boundary generation;
- resource incarnation;
- effect identity where relevant;
- observation generation;
- freshness;
- assumptions;
- claim binding.

An authentic evidence record from an old context is historical evidence, not automatically current evidence.

## Assurance bundle and proof cache

Proof cache architecture:

CACHE → CANDIDATE

not:

CACHE → CURRENTNESS

and never:

CACHE → AUTHORITY.

A cache hit should trigger context compatibility validation.

## Recovery

After crash:

RESTORE_HISTORICAL_ASSURANCE
→ CREATE_NEW_RECOVERY_CONTEXT
→ INVALIDATE_HISTORICAL_CURRENTNESS
→ RECONSTRUCT CURRENT GENERATIONS
→ REVALIDATE DEPENDENCIES
→ REVALIDATE BOUNDARIES
→ REVALIDATE RESOURCE/PROVIDER INCARNATIONS
→ RECONSTRUCT OBLIGATION CLOSURE
→ REBUILD COHERENT ASSURANCE BUNDLE
→ EXPLICIT RELEASE.

Checkpoint restoration cannot restore current assurance merely because the stored records were authentic when written.

## Candidate invariants INV-MGA-01..42

01 Individual record validity does not imply bundle validity.
02 Individual currentness does not imply bundle coherence.
03 Bundle coherence does not imply authority.
04 Mixed-generation records cannot compose without compatibility proof.
05 Componentwise maximum generation does not establish coherent currentness.
06 Numeric generation equality does not establish continuity.
07 Claim-relative semantic compatibility is required.
08 Partial invalidation requires complete impact closure.
09 UNKNOWN impact is not NONE.
10 Direct dependency absence does not prove transitive independence.
11 Higher-order interaction context must be current.
12 Shared dependencies invalidate all impacted claims.
13 Disjoint claims may retain currentness only with complete closure proof.
14 Bundle publication must be ordered against invalidation.
15 Prepared bundle is not published bundle.
16 Published bundle can later become stale without becoming historically false.
17 Claim degradation must not grant authority.
18 Weaker claims cannot silently imply stronger claims.
19 Proof cache never establishes currentness.
20 Evidence authenticity does not establish freshness.
21 Historical evidence cannot silently become current evidence.
22 Recovery cannot restore historical currentness.
23 Resource replacement invalidates dependent context unless transfer is proven.
24 Boundary generation changes invalidate dependent assurance.
25 Policy changes may invalidate operational admissibility without invalidating mathematical proof.
26 External contract changes can invalidate effect claims without local code changes.
27 Concurrent revalidation requires coherent bundle construction.
28 Multiple workers cannot merge incompatible contexts silently.
29 Claim decomposition is itself a proof obligation.
30 Aggregate claims require coherent aggregate context.
31 Higher-order hyperedges require context compatibility.
32 Assumption graphs must be coherent with the bundle context.
33 Environment/boundary assumptions must be current.
34 Refinement context must be current for implementation claims.
35 Continuity anchor prevents ABA-like bundle reuse.
36 Unknown compatibility blocks strong publication.
37 Invalidation cutoff must be authoritative relative to bundle publication.
38 Safe stale classification is preferable to false-current publication.
39 Bundle currentness is claim-specific.
40 Bundle construction is an assurance transition, not an authority transition.
41 Formal verification remains distinct from runtime enforcement.
42 Implementation refinement remains open.

## Candidate theorem

Not formally proven:

A composite assurance bundle may be promoted to CURRENT for claim C only if all required obligations belong to one coherent proof context, or each component context is linked by a claim-valid compatibility/refinement relation whose assumptions, dependency closure, interaction hypergraph, boundary/resource incarnations, temporal/causal conditions and invalidation status are all current.

If coherence or compatibility is UNKNOWN, the strong bundle claim must not be published.

## Architecture consequence

A dedicated:

ASSURANCE BUNDLE BUILDER

is now warranted inside the Assurance Plane.

It must be separate from:
- proof cache;
- invalidation plane;
- authority core.

The bundle builder consumes their outputs and produces a claim-bound, context-coherent assurance result.

Architecture:

DEPENDENCY CHANGE
→ IMPACT CLOSURE
→ INVALIDATION CUTOFF
→ OBLIGATION STATUS
→ REVALIDATION
→ ASSURANCE BUNDLE BUILD
→ CONTEXT COHERENCE CHECK
→ COMPOSITION
→ CLAIM PUBLICATION
→ AUTHORITY PLANE SEPARATE RE-ADMISSION.

## Formalization target

A future finite model should include:
- three obligations;
- two dependency generations;
- two concurrent revalidators;
- one shared dependency;
- one disjoint dependency;
- one higher-order hyperedge;
- bundle construction;
- invalidation cutoff;
- stale cache;
- mixed-generation bundle;
- claim decomposition;
- claim degradation;
- crash/recovery.

Required safety property:

NO_STRONG_CLAIM_PUBLICATION_FROM_MIXED_GENERATION_COMPONENTS_UNLESS_CONTEXT_COMPATIBILITY_AND_COMPOSITION_OBLIGATIONS_ARE_DISCHARGED.

Second:

INVALIDATION_CUTOFF_BEFORE_BUNDLE_PUBLICATION => OLD_BUNDLE_NOT_CURRENT.

Third:

BUNDLE_CURRENT => ALL_REQUIRED_OBLIGATIONS_CURRENT_OR_EXPLICITLY_COMPATIBLE_UNDER_THE_SAME_CLAIM_CONTEXT.

No formal execution result is claimed yet.