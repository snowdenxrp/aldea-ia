# NEXO — ASSUME/GUARANTEE CYCLES / UNKNOWN PROPAGATION / PROOF TRUST CLOSURE — 2026-09-24
Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
How can Nexo prevent individually valid component contracts from composing into a false global safety proof through circular assumptions, hidden shared dependencies, or UNKNOWN values that become weaker at composition boundaries?

## External cross-check
Assume-guarantee reasoning decomposes verification into component obligations under environment assumptions. Published work notes that cyclic interconnections require stronger reasoning than acyclic composition; circular assume-guarantee methods exist specifically to handle mutual dependency, but soundness depends on the formal rule and semantics rather than informal mutual trust. citeturn0search2turn0search5turn0search11
TLA+ proof obligations are explicit logical obligations with a context and goal, and hierarchical proofs allow smaller obligations to be checked separately. citeturn0search1turn0academia26 Refinement is semantic: the lower-level specification must have behaviors permitted by the higher-level specification. citeturn0search4

## Core result
A set of individually valid contracts is not automatically a valid global proof.
LOCAL_VALID(A) ∧ LOCAL_VALID(B) != GLOBAL_VALID(A ⊗ B).
The missing ingredient is proof-context closure: global claim depends on contracts, assumptions, shared dependencies, environment, refinement and explicit UNKNOWN semantics.

## 1. Circular assumption trap
Unsafe informal pattern: A assumes B_safe; B assumes A_safe. Neither establishes a foundation.
A cycle can be valid only if the formal composition rule proves that the mutually dependent assumptions form a sound fixed point under specified semantics. Circular assume-guarantee reasoning is a distinct formal problem. citeturn0search5turn0search11
Therefore ASSUMPTION_CYCLE is neither automatically invalid nor automatically valid; it requires a circular-proof rule.

## 2. ProofContext
Candidate fields: proof_context_id, claim_id, specification/model version, component set, assumptions, guarantees, shared dependency closure, environment assumptions, abstraction context, continuity context, resource incarnations, policy/invariant versions, toolchain identity, proof obligations, backend results, freshness and invalidation triggers.
A proof result is meaningful only relative to its ProofContext.

## 3. AssumptionEdge
Candidate relation: A --assumes--> B.
Fields: source claim, assumption, target component/claim, required property, scope, version/context, dependency basis, evidence, validation status, circularity metadata and invalidation triggers.
The graph becomes part of proof provenance.

## 4. Assumption states
KNOWN_VALID, UNKNOWN, INVALID, STALE, CIRCULAR_UNRESOLVED, CIRCULAR_VERIFIED, ENVIRONMENTAL, BOUNDARY_ENFORCED.
Only states satisfying the applicable proof rule may support a global claim.

## 5. No silent weakening of UNKNOWN
Forbidden transformation: UNKNOWN → MAYBE_SAFE → SAFE without a proof rule.
UNKNOWN_DEPENDENCY != NO_DEPENDENCY.
UNKNOWN_INTERACTION != DISJOINT.
UNKNOWN_CAPACITY != AVAILABLE_CAPACITY.
UNKNOWN_ORDER != ANY_ORDER_SAFE.
Unknown may move to a stronger state only through explicit evidence/proof or a justified weakening of the claim.

## 6. Unknown joins and correlation
When components compose, uncertainty sets must be joined conservatively. If A has U_A and B has U_B, the joint uncertainty is not necessarily a simple intersection.
Candidate U_AB = JOIN(U_A,U_B,SharedContext,InteractionContract).
Shared variables and correlated uncertainty must remain represented; otherwise composition can accidentally remove dangerous worlds.

## 7. Hidden common-mode dependency
Separate proofs can still share the same policy source, trust root, storage, clock, provider, resource, recovery authority, queue or update root.
Therefore PROOF_SEPARATION != ASSURANCE_INDEPENDENCE.

## 8. Assumption closure
For global claim C, closure includes transitive assumptions, dependencies, environment assumptions, boundaries and tool/model assumptions.
If any mandatory element remains UNKNOWN, STALE, INVALID or CIRCULAR_UNRESOLVED, the strong claim cannot be promoted.

## 9. Cycle classification
Candidate cycle classes: C0 no cycle; C1 cycle grounded by independently established invariant; C2 formally verified circular rule; C3 incomplete obligations; C4 cycle containing UNKNOWN/invalid dependency.
C0/C1/C2 may potentially support a strong claim only with explicit evidence. C3/C4 imply UNKNOWN/HOLD.

## 10. Fixed-point semantics
Candidate circular reasoning uses a formally defined monotone operator F and a least/greatest justified fixed point according to the contract semantics.
Nexo must never infer a fixed point by intuition. The fixed point must be backed by the formal rule and proof obligations.
Published research explicitly frames sound circular assume-guarantee rules using fixed-point semantics. citeturn0search11

## 11. Typed uncertainty
Blocking every UNKNOWN would preserve safety but can destroy useful operation. Nexo therefore needs typed uncertainty with actions such as resolve, weaken claim, restrict scope, add coordination, enforce boundary, isolate, quarantine or continue under a weaker claim.

## 12. Epistemic partial order
Candidate progression: UNKNOWN → BOUNDED → OBSERVED → AUTHENTICATED → CONTEXT_BOUND → VALIDATED → VERIFIED.
This is not necessarily a total order. For example, authenticated-but-stale and observed-wrong-incarnation are incomparable for many claims.
Therefore assurance should use a claim/context partial order, not a confidence scalar.

## 13. Claim promotion
Promotion requires current identity, context, dependency closure, valid assumptions, interaction closure, abstraction/refinement validity, adequate freshness, required invariants and satisfied environment assumptions.
CONFIDENCE_SCORE cannot replace this.

## 14. Proof multiplicity and caches
A global proof may depend on many obligations. If any mandatory obligation is unresolved, GLOBAL_VERIFIED is not true.
A proof cached under context C1 can become invalid at C2 after policy, dependency, topology, resource incarnation, abstraction, environment, continuity, model or toolchain changes.
Therefore PROOF_CACHE != CURRENT_PROOF.

## 15. Tool disagreement and independence
If two tools disagree, Nexo must classify semantic/model/assumption/backend differences rather than vote.
Different tools may still share the same model generator, parser, assumptions or formalization error.
Therefore TOOL_DIVERSITY != PROOF_INDEPENDENCE.

## 16. Human review and environment
HUMAN_APPROVAL != FORMAL_VERIFICATION unless the claim explicitly defines the human action as a bounded trusted assumption.
Environment assumptions bound claim strength. A declared but unenforced assumption cannot support a stronger claim than its enforcement status allows.

## 17. Breaking circularity
A circular dependency may be bounded by an independently enforced safety boundary or an independently established foundation invariant.
A depends on B and B depends on A differs from A assumes I and B assumes I when I has an independently established proof/boundary.

## 18. FoundationClaim
Candidate fields: foundation_id, property, scope, owner, proof context, independent dependencies, enforcement boundary, verification status, freshness, invalidation conditions and allowed dependent claims.
Foundation claims are assurance facts, not authority.
Foundation reuse still requires dependency closure and common-mode analysis.

## 19. Unknown weakening attack
Attack: WorldUnknown → abstraction hides world detail → component says omitted → composition interprets omitted as irrelevant → global proof treats absence as no-effect → release.
Structural rule: OMITTED_BEHAVIOR => UNKNOWN_OR_PROVEN_IRRELEVANT. Never OMITTED_BEHAVIOR => ABSENT.

## 20. Explicit claim degradation
If a strong claim cannot be established, Nexo may publish a weaker claim, such as LOCAL_BOUNDARY_FENCED instead of GLOBAL_NO_EFFECT.
Claim degradation is a legitimate assurance state, not an automatic system failure.

## 21. Claim lattice
Candidate strengths: LOCAL, RESOURCE, EFFECT, GROUP, BOUNDARY, MISSION, GLOBAL.
Promotion requires proof/refinement. Demotion is allowed when context or evidence degrades.
CLAIM_PROMOTION != CONFIDENCE_INCREASE.

## 22. Composition protocol
DEFINE CLAIM → FREEZE PROOF CONTEXT → COLLECT CONTRACTS → BUILD ASSUMPTION GRAPH → BUILD DEPENDENCY CLOSURE → DETECT CYCLES → CLASSIFY UNKNOWN → JOIN UNCERTAINTY → VALIDATE FOUNDATIONS/BOUNDARIES → CHECK REFINEMENT → DISCHARGE OBLIGATIONS → COMPOSE → VERIFY GLOBAL INVARIANT → PUBLISH CLAIM.
Any relevant context change invalidates the result.

## 23. Candidate invariants INV-PTRUST-01..40
01 Local-valid contracts do not imply global validity.
02 Every global claim has explicit proof context.
03 Every assumption is traceable.
04 Assumption closure is transitive.
05 Unknown dependency is not absent dependency.
06 Unknown interaction is not disjointness.
07 Unknown capacity is not availability.
08 Unknown order is not arbitrary-order safety.
09 Unknown cannot silently weaken during composition.
10 Joint uncertainty preserves relevant correlations.
11 Shared dependencies are represented.
12 Common-mode dependencies invalidate naive independence.
13 Proof separation does not imply evidence independence.
14 Circular assumptions require a sound circular rule or independent foundation.
15 Unresolved circularity blocks strong claims.
16 Fixed points must be justified formally.
17 Proof caches are context-bound.
18 Timestamp is not proof freshness.
19 Tool diversity is not proof independence.
20 Tool disagreement is not resolved by voting.
21 Human approval is not formal verification.
22 Environment assumptions bound claim strength.
23 Boundary assumptions must be enforced/verified for stronger claims.
24 Foundation claims have explicit dependency closure.
25 Foundation reuse does not erase common-mode coupling.
26 Omitted behavior becomes UNKNOWN unless proven irrelevant.
27 Abstraction cannot turn UNKNOWN into ABSENT.
28 Claim degradation is explicit.
29 Claim promotion requires proof obligations.
30 Proof obligations are individually traceable.
31 Partial proof cannot be promoted to complete proof.
32 Model context is part of proof identity.
33 Implementation refinement remains separate.
34 Resource incarnation is proof-context state where relevant.
35 Recovery invalidates incompatible proof context.
36 STOP can invalidate assumptions.
37 Policy/invariant change invalidates affected proofs.
38 Topology/dependency change invalidates affected proofs.
39 Proof result must declare assumptions and limitations.
40 Strong claims cannot exceed proof/assumption closure.

## 24. Architectural result
Nexo now needs a dedicated Assurance Plane distinct from Authority, Execution, Observation and Evidence storage.
The Assurance Plane answers: WHAT CAN NEXO JUSTIFIABLY CLAIM RIGHT NOW?
It does not itself grant authority.
Canonical separation: PROOF != AUTHORITY; EVIDENCE != PROOF; ASSUMPTION != FACT; CONFIDENCE != VERIFICATION; VERIFICATION != WORLD TRUTH.

## Open gaps
G-PTRUST-01 formal ProofContext semantics.
G-PTRUST-02 assumption-graph closure.
G-PTRUST-03 circular fixed-point rules.
G-PTRUST-04 joint uncertainty algebra.
G-PTRUST-05 claim lattice/refinement.
G-PTRUST-06 foundation-claim independence.
G-PTRUST-07 proof-cache invalidation.
G-PTRUST-08 tool disagreement semantics.
G-PTRUST-09 formal independence/common-mode integration.
G-PTRUST-10 abstraction-to-proof refinement.
G-PTRUST-11 automated proof-context fingerprinting.
G-PTRUST-12 actual SANY/TLC/TLAPS execution.
G-PTRUST-13 implementation refinement.
G-PTRUST-14 fault-injection validation.
G-PTRUST-15 long-duration invalidation testing.

## Conclusion
NO GLOBAL CLAIM WITHOUT CLOSED PROOF CONTEXT.
NO UNKNOWN MAY BECOME SAFE BY BEING OMITTED AT A COMPOSITION BOUNDARY.
A circular dependency is not automatically invalid, but it is never automatically trustworthy. It requires a formally justified fixed point or an independently established foundation/boundary.
This is a research/design result, not a verified theorem.

## Next attack
PROOF CONTEXT FINGERPRINTING + INVALIDATION + REPRODUCIBILITY + MULTI-VERSION FORMAL MODELS.
Question: how does Nexo know that a proof made yesterday is still the proof of today's system when the model, policy, dependency graph, abstraction, toolchain, resource incarnation or environment assumptions have changed?