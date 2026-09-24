# NEXO — Semantic Equivalence vs Authorization Equivalence vs Effect Equivalence V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Determine when two representations that are semantically equivalent for one property may still be non-equivalent for authorization or external effect behavior.

## 2. Central finding
Equivalence is always claim-scoped.

`REPRESENTATION_EQUIVALENCE != SEMANTIC_EQUIVALENCE != AUTHORIZATION_EQUIVALENCE != EFFECT_EQUIVALENCE`.

A translation can preserve the truth of one property while changing another security-relevant property.

NIST SP 800-205 notes that successful interoperability requires agreement on both syntactic and semantic attribute values, and that different data types/classifications can require explicit interpretation or conversion. This supports treating semantic translation as a security-relevant contract rather than assuming representation compatibility. citeturn0search17

## 3. New object: EquivalenceContext
Candidate fields:
- equivalence_id
- source artifact/object
- target artifact/object
- property scope
- claim scope
- semantic domain
- protocol/schema/parser/canonicalization contexts
- policy/invariant generations
- authority context
- effect identity
- resource incarnation
- temporal validity
- causal bridge
- transformation/adapter
- loss set
- unknown set
- dependency closure
- enforcement closure
- invalidations
- proof/support graph
- publication status.

## 4. Four equivalence layers
E0 Representation: same encoded meaning under a defined representation contract.
E1 Semantic: preserves specified domain properties.
E2 Authorization: preserves authorization-relevant distinctions and resulting permission semantics.
E3 Effect: preserves externally relevant effect behavior under an explicit provider/effect contract.

E0 does not imply E1.
E1 does not imply E2.
E2 does not imply E3.

## 5. Counterexample: semantic equivalence without authorization equivalence
Suppose two policies both mean “allow operation X” in an abstract policy language.

One is bound to:
- tenant A;
- resource R1;
- authority epoch E5.

The other is bound to:
- tenant B;
- resource R2;
- epoch E6.

Their abstract rule text is equivalent, but their authorization meaning is not equivalent.

Therefore identity/scope/context must be part of authorization equivalence.

## 6. Counterexample: authorization equivalence without effect equivalence
Two authorizations both permit “delete object R”.

Provider A interprets delete as reversible soft-delete.
Provider B interprets delete as irreversible destruction.

Authorization meaning may be equivalent while external effect semantics differ.

Therefore effect equivalence requires an explicit effect/provider contract.

## 7. Counterexample: effect equivalence only under a bounded contract
Two APIs both report success for “transfer 10 units,” but one guarantees exactly-once settlement and the other permits asynchronous retries.

The visible response can be equivalent while retry/duplication semantics differ.

Effect equivalence must include:
- effect identity;
- attempt identity;
- idempotency;
- ordering;
- timeout;
- retry/redrive;
- provider continuation;
- resource incarnation;
- reconciliation semantics.

## 8. Unknown preservation
If source context contains UNKNOWN and target representation collapses it to a concrete value, the translation may amplify assurance.

Default rule:
`UNKNOWN(source) -> UNKNOWN(target)`
unless an explicit contract proves safe resolution.

## 9. Loss sets
Every transformation should expose a `LossSet` containing distinctions that are:
- removed;
- merged;
- approximated;
- made unavailable;
- represented only as unknown.

A target claim is publishable only if the lost distinctions are irrelevant to that exact claim or protected by a stronger boundary.

## 10. Non-amplification
Candidate property:
`CLAIM_SCOPE(target) <= PRESERVED_SECURITY_SCOPE(source)`.

Translation cannot:
- widen target resource scope;
- widen authority epoch;
- weaken policy constraints;
- erase revocation;
- convert unknown to known;
- expand effect boundary;
- claim stronger enforcement than source.

## 11. Composition of equivalences
If:
A ≈ B under property P
and B ≈ C under property P

then A ≈ C is not automatic if:
- contexts differ;
- temporal intervals do not overlap;
- a dependency changed;
- a transformation loses information;
- an invalidation occurred;
- effect contracts differ.

Candidate:
`TRANSITIVE_EQUIVALENCE_REQUIRES_COMPOSABLE_CONTEXT`.

## 12. Non-transitivity across properties
A≈B for semantic meaning does not imply:
A≈B for authorization.
Authorization equivalence does not imply effect equivalence.

Therefore equivalence claims must be typed by property.

## 13. Setwise composition
Three individually equivalent translations can become unsafe together.

Example:
T1 preserves resource identity.
T2 preserves authority epoch.
T3 preserves policy.
But their combined implementations share a hidden dependency that can substitute all three contexts.

Thus:
`PAIRWISE_EQUIVALENCE != SETWISE_EQUIVALENCE`.

## 14. Temporal equivalence
Two objects may be equivalent at T0 but not T1.

Equivalence requires:
- validity interval;
- generation;
- causal context;
- invalidation state;
- resource incarnation.

`HISTORICALLY_EQUIVALENT != CURRENTLY_EQUIVALENT`.

## 15. Resource incarnation
Same provider resource ID can refer to different incarnations.

Therefore:
`SAME_RESOURCE_ID != SAME_EFFECT_SEMANTICS`.

Effect equivalence must bind resource incarnation.

## 16. Authority continuity
Same policy bytes can exist under different authority epochs.

Therefore:
`SAME_POLICY_BYTES != SAME_AUTHORIZATION`.

Authorization equivalence requires current authority context.

## 17. External provider semantics
Provider contracts should classify effect semantics:
- E0 strongly reconcilable;
- E1 bounded but incomplete observability;
- E2 unreconcilable.

An equivalence claim that depends on provider behavior cannot exceed the provider contract.

## 18. Adapter soundness
Candidate `SemanticTranslationContract`:
- source context;
- target context;
- transformation;
- loss set;
- unknown preservation;
- property preservation;
- non-amplification;
- dependency closure;
- effect contract;
- temporal validity;
- invalidation;
- verification method;
- current target authority revalidation.

Translation lifecycle:
`REQUESTED → SOURCE_VERIFIED → TRANSFORMATION_BOUND → LOSS_ANALYZED → TARGET_BOUND → PROPERTY_VERIFIED → AUTHORITY_REVALIDATED → PUBLISHABLE`.

## 19. Equivalence proof cannot justify its own assumptions
If the equivalence certificate is itself produced by an adapter whose correctness is justified by the equivalence certificate, the support graph is circular.

Unsupported SCC:
`DENY`.

## 20. Cross-protocol equivalence
A protocol-A object may serialize to the same bytes as protocol-B object.

That does not make them authorization-equivalent.

Require:
- protocol domain;
- artifact type;
- purpose;
- role;
- key usage;
- canonicalization;
- version;
- composition contract.

## 21. Semantic version compatibility
Version numbers do not define equivalence.

A newer version can:
- preserve;
- strengthen;
- weaken;
- reinterpret;
- remove;
- add security semantics.

Compatibility class must be claim-specific.

## 22. Effect identity
Two authorizations can be equivalent while referring to different effect identities.

Therefore:
`AUTHORIZATION_EQUIVALENCE != EFFECT_IDENTITY_EQUIVALENCE`.

An effect-equivalence claim must bind exact effect identity and resource incarnation.

## 23. Retry/redrive
A translated authorization may preserve the original effect but accidentally authorize a new attempt.

`EFFECT_IDENTITY_CONTINUITY != ATTEMPT_IDENTITY_CONTINUITY`.

Retry semantics must be explicitly bound.

## 24. Compensation
Two systems can agree on an authorization to compensate but disagree on whether compensation restores the original world state.

`COMPENSATION_AUTHORIZATION_EQUIVALENCE != WORLD_RESTORATION_EQUIVALENCE`.

Compensation remains an ordinary protected external effect.

## 25. Enforcement equivalence
Two implementations may expose identical authorization state but enforce it at different boundaries.

If one can be bypassed by provider callbacks and the other cannot:
`AUTHORIZATION_STATE_EQUIVALENCE != ENFORCEMENT_EQUIVALENCE`.

Effect-path and enforcement closure therefore belong in effect-equivalence claims.

## 26. Formal model implications
Future model should type equivalence claims by property and include:
- representation;
- semantic domain;
- authorization context;
- effect identity;
- attempt identity;
- resource incarnation;
- policy/invariant;
- dependency/effect/enforcement closure;
- temporal/causal context;
- loss/unknown;
- adapters;
- provider contract.

Candidate invariants:
EE-01 NO_UNTYPED_EQUIVALENCE_CLAIMS
EE-02 REPRESENTATION_EQUIVALENCE_DOES_NOT_IMPLY_AUTHORIZATION_EQUIVALENCE
EE-03 AUTHORIZATION_EQUIVALENCE_DOES_NOT_IMPLY_EFFECT_EQUIVALENCE
EE-04 UNKNOWN_IS_NOT_SILENTLY_COLLAPSED
EE-05 LOSS_RELEVANT_TO_CLAIM_BLOCKS_PROMOTION
EE-06 TRANSLATION_CANNOT_AMPLIFY_SCOPE
EE-07 EFFECT_EQUIVALENCE_REQUIRES_EFFECT_IDENTITY
EE-08 EFFECT_EQUIVALENCE_REQUIRES_RESOURCE_INCARNATION
EE-09 RETRY_IDENTITY_IS_DISTINCT_FROM_EFFECT_IDENTITY
EE-10 HISTORICAL_EQUIVALENCE_DOES_NOT_ESTABLISH_CURRENT_EQUIVALENCE
EE-11 CROSS_PROTOCOL_EQUIVALENCE_REQUIRES_EXPLICIT_DOMAIN_BINDING
EE-12 PAIRWISE_EQUIVALENCE_DOES_NOT_ESTABLISH_SETWISE_EQUIVALENCE
EE-13 EQUIVALENCE_PROOF_CANNOT_SELF-JUSTIFY
EE-14 PROVIDER_CONTRACT_BOUNDS_EFFECT_EQUIVALENCE
EE-15 ENFORCEMENT_CLOSURE_BOUNDS_EFFECT-PREVENTION CLAIMS.

Lamport's TLA+ material describes refinement as showing that a lower-level specification implements a higher-level one under a refinement mapping; this is directly relevant because an implementation cannot be considered equivalent merely because its state names or outputs resemble the abstract model. citeturn0search18turn0search5

## 27. New synthesis
The architecture now needs typed equivalence:

`RepresentationEquivalence`
`SemanticEquivalence`
`AuthorizationEquivalence`
`EffectEquivalence`
`EnforcementEquivalence`

Each has its own scope, dependencies, temporal context, and proof obligations.

The strongest useful rule:
`CLAIM_STRENGTH(target) <= VERIFIED_PRESERVED_SCOPE(source, transformation, context)`.

## 28. Open gaps
EE-G1 Formal algebra of typed equivalence.
EE-G2 Non-transitivity and composition rules.
EE-G3 Higher-order/setwise equivalence.
EE-G4 Effect/provider equivalence formalization.
EE-G5 Enforcement-equivalence contract.
EE-G6 Adapter proof/refinement.
EE-G7 Unknown/loss propagation.
EE-G8 Temporal equivalence/currentness.
EE-G9 Compaction of equivalence evidence.
EE-G10 SANY/TLC/TLAPS validation.

## 29. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.