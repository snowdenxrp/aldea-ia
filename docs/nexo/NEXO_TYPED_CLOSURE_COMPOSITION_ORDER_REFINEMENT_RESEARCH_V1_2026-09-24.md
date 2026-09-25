# NEXO — Typed Closure Composition Order, Fixed-Point and Refinement Research V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## Objective
Determine whether the existing closure families can be safely composed, whether their order matters, and what a formal refinement target should look like. The key question is whether a generic union of closures is sound or whether closure composition must be typed, ordered and claim-specific.

## External cross-check
Lamport's material explicitly treats composition of specifications and refinement mappings as proof obligations rather than assuming that independently correct pieces automatically compose. His refinement material states that a lower-level specification implements a higher-level specification through an explicit refinement mapping. citeturn0search27turn0search24
Lamport's TLA+ tools documentation distinguishes SANY as a syntax/semantic checker and TLC as an explicit-state model checker; this reinforces that future tool execution must be separated from architectural claims. citeturn0search11
NIST SP 800-53 emphasizes minimizing unnecessary complexity in trusted components and notes that fewer trusted components can simplify security analysis, while least privilege limits resources and authorizations to what is needed. This supports keeping closure composition explicit and avoiding unnecessary trust dependencies, but it does not establish Nexo-specific correctness. citeturn0search26turn0search10

## 1. Central finding
`RC ∪ ADC ∪ EC ∪ FC` is not automatically a sound closure.
The graphs have different edge meanings:
- RC: can this dependency change the truth of the claim?
- ADC: what supports the assurance of the claim?
- EC: what effect-capable paths can continue or produce effects?
- FC: where is stale/forbidden context actually rejected or contained?
- RecoveryRetention: what historical information may recovery still require?
- JointClaimClosure: what cross-claim relations must survive?
Therefore their composition must preserve edge types and claim-specific semantics.

## 2. Three composition relations
Candidate relations:
`SUBSUMES(A,B,P)` — A's closure semantically covers B for property P.
`REQUIRES(A,B,P)` — A cannot be established without B under P.
`CONSTRAINS(A,B,P)` — A restricts the admissible scope/state of B.
These are not interchangeable with set inclusion.

## 3. Unsafe generic union
Suppose RC identifies a dependency but ADC does not establish its trust support. Or EC identifies an effect path but FC cannot establish enforcement at its last effect-capable boundary.
A raw union would contain the nodes and falsely suggest the claim is closed.
`NODE_PRESENT != CLOSURE_SATISFIED`.

## 4. Candidate typed closure tuple
Define a claim context as:
`K = <RC, ADC, EC, FC, RR, JCC, Authority, Order, Trust, Resource, Time, Environment>`.
Each component has a separate semantic obligation.
A strong claim is publishable only if its required component predicates are satisfied under the same compatible context.

## 5. Compatibility before composition
Before composing closure components, check:
- same claim/property scope;
- same semantic interpretation context;
- compatible policy/invariant generations;
- compatible authority/order context;
- compatible trust-root generation;
- compatible resource incarnations;
- compatible temporal/causal bridge;
- no invalidation;
- no unsupported common-mode assumption;
- no open-world boundary contradiction.
`PAIRWISE_COMPATIBLE != JOINTLY_COMPATIBLE`.

## 6. Composition order matters
An example safe conceptual order is:
`CLAIM SCOPE → RELEVANCE → DEPENDENCY/ASSURANCE → EFFECT PATH → ENFORCEMENT → RECOVERY/RETENTION → JOINT CLAIM RELATIONS → FIXED-POINT RECHECK`.
This is not asserted to be the only valid order.
The key point is that later closures can introduce new dependencies that require earlier closures to be recomputed.

## 7. Fixed-point composition
Therefore closure composition is better modeled as iterative:
`K0 = initial claim context`
`K(n+1) = Compose(Kn) + RecomputeAffectedClosures(Kn)`
until:
`K(n+1) semantically equivalent to Kn`
or the system reaches bounded UNKNOWN/non-convergence.

## 8. Monotonicity requirement
For a suitable semantic ordering, adding a recognized dependency should not make a previously required dependency disappear.
Candidate:
`K1 ⪯ K2 => Closure(K1) ⪯ Closure(K2)`.
This remains a research condition; it must be formalized before being called an invariant.

## 9. Closure shrink is different
A closure can shrink when a dependency is proven irrelevant or a boundary is reduced, but that requires positive justification.
`NO_EDGE_OBSERVED != EDGE_PROVEN_IRRELEVANT`.
Administrative deletion, timeout, cache expiration or missing telemetry cannot by themselves establish closure shrinkage.

## 10. RC → ADC dependency
Relevance closure identifies dependencies that can affect the claim. Assurance dependency closure then needs to establish what supports the claim about those dependencies.
Therefore:
`RC_COMPLETE` does not imply `ADC_COMPLETE`.
But ADC for an effect-prevention claim cannot ignore RC-required dependencies without an explicit reason.

## 11. ADC → EC dependency
A dependency may be assurance-relevant without itself being an effect path. Conversely, an effect path can introduce a dependency that was absent from the previous assurance closure.
Therefore effect-path discovery can widen ADC/RC and force a fixed-point iteration.

## 12. EC → FC dependency
Knowing all effect paths is not equivalent to knowing that the last effect-capable boundary enforces the required cutoff.
`EC_COMPLETE != FC_COMPLETE`.
FC is a claim about enforcement, not merely graph discovery.

## 13. FC → evidence/ADC dependency
Evidence that an enforcement boundary rejected stale context must itself have a support graph, currentness and independence appropriate to the claim.
Therefore FC verification can widen ADC.
This closes another feedback loop.

## 14. RecoveryRetention feedback
Recovery may introduce historical requirements that were not relevant during normal execution.
Recovery requirements can therefore widen retention and evidence closure without changing the original mission claim.
`RECOVERY_REQUIRED_HISTORY` becomes part of joint closure when recognized as a contractual obligation.

## 15. Joint claims feed back into all closures
A composite claim may introduce a cross-claim relation that changes required dependency, effect, enforcement or historical scope.
Therefore `JointClaimClosure` must not be treated as a terminal append-only stage.
It can trigger recomputation upstream.

## 16. Candidate closure pipeline
Candidate research pipeline:
`PUBLISHABLE_CLAIM_REQUEST`
`→ establish semantic claim identity`
`→ compute initial RC`
`→ compute ADC`
`→ compute EC`
`→ compute FC`
`→ compute RecoveryRetention`
`→ compute JointClaimClosure`
`→ check context compatibility/common-mode`
`→ derive required retained distinctions`
`→ build abstraction`
`→ recompute affected closures over the abstraction`
`→ repeat until fixed point or bounded UNKNOWN`
`→ publish only within verified scope`.

## 17. Refinement target
A future formal model should not try to prove only that each closure is internally sensible.
It should prove a correspondence from implementation state to an abstract `SafetyClosureContext`.
Candidate refinement mapping:
`ImplementationState → AbstractClaimContext`.
The mapping must preserve:
- claim scope;
- closure membership relevant to the property;
- authority/order context;
- effect/enforcement boundary;
- retained distinctions;
- invalidation/currentness;
- allowed claim strength.
Lamport's refinement framework directly supports this style of proof obligation. citeturn0search24turn0search25

## 18. Claim publication theorem target
Candidate target, not yet proved:
`PublishedClaim(P) => RequiredClosure(P) is verified, context-compatible, current, non-circular, and its published scope is no larger than the verified closure intersection appropriate to P`.
The exact composition operator cannot be universally stated as simple intersection or union; it is property-specific.

## 19. Important non-equivalence
`RC ∩ ADC ∩ EC ∩ FC` is not automatically the right formula either.
Some claims need union of dependency sets but intersection of verified capabilities; others require sequential constraints or explicit composition contracts.
Therefore the architecture needs a typed `ClosureCompositionContract` rather than one universal mathematical operator.

## 20. Candidate ClosureCompositionContract
Fields:
- claim/property;
- component closure types;
- composition operator;
- semantic context;
- required compatibility conditions;
- dependency/common-mode closure;
- temporal/causal bridge;
- authority/order binding;
- resource/incarnation binding;
- invalidation rules;
- scope transformation;
- output claim strength;
- verification method;
- failure/UNKNOWN semantics.

## 21. Candidate invariants
CC-01 CLOSURE_COMPONENTS_ARE_TYPED
CC-02 GENERIC_SET_UNION_CANNOT_CREATE_CLOSURE_SATISFACTION
CC-03 CLOSURE_COMPOSITION_IS_CLAIM_SPECIFIC
CC-04 COMPONENT_CONTEXTS_MUST_BE_COMPATIBLE_BEFORE_COMPOSITION
CC-05 PAIRWISE_COMPATIBILITY_DOES_NOT_IMPLY_JOINT_COMPATIBILITY
CC-06 LATER_CLOSURE_DISCOVERY_CAN_FORCE_EARLIER_RECOMPUTATION
CC-07 RC_COMPLETENESS_DOES_NOT_IMPLY_ADC_COMPLETENESS
CC-08 ADC_COMPLETENESS_DOES_NOT_IMPLY_EC_COMPLETENESS
CC-09 EC_COMPLETENESS_DOES_NOT_IMPLY_FC_COMPLETENESS
CC-10 FC_ASSURANCE_CAN_WIDEN_ADC
CC-11 RECOVERY_RETENTION_CAN_WIDEN_JOINT_CLOSURE
CC-12 COMPOSITE_CLAIMS_CAN_WIDEN_ALL_AFFECTED_CLOSURES
CC-13 CLOSURE_SHRINK_REQUIRES_PROTECTED_NEGATIVE_JUSTIFICATION
CC-14 NONCONVERGENCE_CANNOT_BE_PUBLISHED_AS_GLOBAL_CLOSURE
CC-15 REFINEMENT_MAPPING_MUST_PRESERVE_CLAIM-RELEVANT_CLOSURE_SEMANTICS
CC-16 PUBLISHED_SCOPE_CANNOT_EXCEED_VERIFIED_COMPOSITION_SCOPE
CC-17 CLOSURE_COMPOSITION_CANNOT_AMPLIFY_AUTHORITY
CC-18 CLOSURE_CERTIFICATES_CANNOT_SELF-JUSTIFY_THEIR_OWN_REQUIRED_SUPPORT.

## 22. Open gaps
CC-G1 Formal typed closure algebra.
CC-G2 Conditions for associative composition.
CC-G3 Conditions for commutative composition.
CC-G4 Conditions for monotone composition.
CC-G5 Minimal fixed-point construction.
CC-G6 Formal scope operator per closure type.
CC-G7 Formal treatment of negative dependency evidence.
CC-G8 Full TLA+ abstraction/refinement model.
CC-G9 SANY/TLC/TLAPS execution.
CC-G10 Implementation refinement and fault-injection validation.

## Verification boundary
No formal execution performed. No implementation correctness claim. No runtime or deployment correctness claim.