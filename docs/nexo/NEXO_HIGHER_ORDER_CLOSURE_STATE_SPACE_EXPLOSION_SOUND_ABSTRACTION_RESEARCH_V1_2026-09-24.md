# NEXO — HIGHER-ORDER CLOSURE / STATE-SPACE EXPLOSION / SOUND ABSTRACTION — 2026-09-24
Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
How can Nexo reduce combinatorial growth caused by higher-order interaction closure without silently underapproximating safety-relevant behavior?

## External cross-check
TLC checks the reachable graph of a configured finite model; completion therefore establishes properties only for that finite model and its constants/assumptions, not arbitrary system sizes or implementations. citeturn0search12turn0search25
Research on compositional TLA+ model checking explicitly attacks state explosion using interaction-preserving abstraction: internal behavior can be abstracted while preserving what another component can observe through the interaction boundary. This is closely aligned with Nexo's boundary/claim-specific architecture, but is not a Nexo correctness proof. citeturn0academia24
TLC symmetry reduction can substantially reduce exploration, but TLC does not verify that a declared symmetry is actually valid; an invalid symmetry declaration can hide errors. citeturn0search14

## Core result
The safe direction is: EXACT CLOSURE → CLAIM-SPECIFIC ABSTRACTION → CONSERVATIVE OVER-APPROXIMATION → COMPOSITIONAL PROOF → TARGETED MODEL CHECKING.
Hard rule: UNDERAPPROXIMATION OF SAFETY-RELEVANT BEHAVIOR IS NOT ACCEPTABLE FOR A STRONG SAFETY CLAIM.

## Key principles
1. Separate CONCRETE STATE, ABSTRACT STATE and UNKNOWN/OTHER. The third category prevents collapsed uncertainty from becoming false absence.
2. Abstraction is claim-relative: ABSTRACTION_VALID(P,M,C), not a universal property.
3. For safety, conservative over-approximation is safer than deleting possible behaviors. If the abstract behavior set contains the concrete behavior set and the abstraction/refinement contract is proven, an abstract safety proof can support the corresponding concrete claim.
4. Over-approximation can introduce impossible behaviors, causing false counterexamples, extra UNKNOWN, coordination or reduced liveness. The target is SOUND OVERAPPROXIMATION + MAXIMUM USEFUL PRECISION.
5. Introduce candidate AbstractionContract and AbstractionBoundary. The latter defines where internal detail may be hidden while preserving every claim-relevant interaction.
6. Interaction-preserving abstraction is especially useful: abstract internal state while preserving the interaction surface visible to other components. citeturn0academia24
7. Claim projection must preserve every distinction capable of changing the invariant, effect-path closure, applicable constraints, authority, fencing, resource incarnation, uncertainty, recovery, compensation or temporal ordering.
8. Unknown must propagate explicitly: UNKNOWN_EFFECT, UNKNOWN_INTERACTION, UNKNOWN_ORDER, UNKNOWN_DEPENDENCY, UNKNOWN_CAPACITY, UNKNOWN_INCARNATION, UNKNOWN_RECOVERY_PATH.
9. Candidate distinction: WORLD_UNKNOWN, MODEL_UNKNOWN and EVIDENCE_UNKNOWN. They are different epistemic sources but can all degrade a claim.
10. Candidate monotonic abstraction rule: MORE_CONSERVATIVE_ABSTRACTION => NEVER MORE AUTHORITY. Losing information may preserve, restrict, weaken, HOLD or QUARANTINE; it must not grant a potentially forbidden effect.

## Compositional reasoning
Components can be summarized with explicit assumptions and guarantees. Composition is valid only when assumptions are satisfied, shared interactions are represented, hidden circular dependencies are excluded or formally justified, and the global invariant follows from the composed guarantees. Compositional reasoning is a recognized approach to state-space explosion. citeturn0search2turn0search28
Candidate CompositionalProofContract: proof_id, claim, components, assumptions, guarantees, interaction boundaries, shared state, dependency graph, circularity status, environment assumptions, refinement relation, counterexample semantics, context/freshness and invalidation triggers.
Candidate AssumptionClosure prevents A assuming B and B assuming A from becoming an unsupported global proof.

## Nonlinear and temporal abstraction
Independent scalar intervals can be too weak for nonlinear invariants. For A*B <= 100, A∈[0,20] and B∈[0,20] permit a possible product of 400; correlation or a conservative rejection is required.
Temporal abstraction can also hide violations that exist only during overlap. Therefore FINAL_STATE_SAFE != TRACE_SAFE.
Recovery, compensation, retries and redrives cannot disappear from the abstraction when they can create safety-relevant effects.

## Symmetry
Symmetry can reduce exploration when components are genuinely interchangeable for the specification and properties. TLC documentation explicitly warns that it does not verify declared symmetry sets; invalid symmetry can cause errors to be missed. citeturn0search14
Candidate SymmetryAssumption must preserve transition relation, invariants, provider/resource semantics and identity-dependent behavior. DIGITAL_SYMMETRY != PHYSICAL_SYMMETRY.

## Bounded envelopes
ScopeEnvelope and AggregateSafetyContract can bound cardinality, delegation depth, queues, retries, resources, providers and child effects. The bounds are safety-critical and must be enforced, not merely documented.

## Candidate reduction hierarchy
L0 exact finite model
L1 symmetry reduction
L2 claim-state projection
L3 interaction-preserving abstraction
L4 compositional decomposition
L5 bounded-envelope abstraction
L6 conservative summary / assume-guarantee composition
L7 targeted refinement/model-checking of critical residuals.
Each level needs its own soundness contract.

## Reduction gate
DEFINE CLAIM → DEFINE CONCRETE CLOSURE → DEFINE ABSTRACT VARIABLES → PROVE PRESERVED INTERACTION → PROVE/BOUND OMITTED BEHAVIOR → CHECK ASSUMPTION CLOSURE → CHECK TEMPORAL/RECOVERY PATHS → CHECK INCARNATION/CONTINUITY → FREEZE CONTEXT → MODEL CHECK / PROVE → PUBLISH CLAIM.
Failure at a mandatory stage means UNKNOWN / HOLD / QUARANTINE / weaker claim.

## Candidate soundness relation
Let C be concrete behaviors and A abstract behaviors. Candidate relation C ⊑ A means every concrete behavior relevant to the claim is represented by an abstract behavior preserving claim-observable interaction semantics. Then A ⊨ M can support C ⊨ M only if the abstraction/refinement contract and assumptions are actually proven. This is a design direction, not a Nexo theorem.

## Counterexample refinement
Abstract violations should be classified as REAL, SPURIOUS or UNRESOLVED. SPURIOUS requires evidence. Candidate loop: ABSTRACT → CHECK → CLASSIFY → if spurious, REFINE → RECHECK. This resembles CEGAR but is not yet a Nexo architectural commitment.

## Safety versus liveness
Conservative over-approximation can reduce liveness by treating unknown interaction as conflict. That is acceptable on the safety plane when necessary: safety preservation takes precedence over concurrency optimization. This is an architectural obligation, not a product ranking.

## Common-mode and invalidation
Separate component abstractions can omit the same shared dependency. Abstraction contracts therefore need shared dependency closure, failure-domain analysis and cross-component interaction boundaries.
Invalidate abstractions when dependencies, interaction arity, scope, topology, resource incarnation, provider semantics, policy/invariant, continuity, recovery, STOP, effect class, environment boundary or proof context changes.

## Candidate objects
AbstractionContract; AbstractionBoundary; CompositionalProofContract; SymmetryAssumption; AssumptionClosure; ComponentSummary; ModelUnknown; AbstractSafetyRegion.

## Candidate invariant family INV-ABS2-01..32
01 Abstraction is claim-specific.
02 Safety-relevant underapproximation is forbidden for strong claims.
03 Overapproximation may reduce liveness but must not grant extra authority.
04 Unknown must remain represented.
05 ModelUnknown differs from WorldUnknown.
06 EvidenceUnknown remains distinct.
07 Projection completeness is required.
08 Omitted state needs irrelevance proof or conservative representation.
09 Interaction boundaries must be preserved.
10 Provider boundaries cannot disappear silently.
11 Physical distinctions cannot be erased without equivalence proof.
12 Resource incarnation must survive abstraction where relevant.
13 Temporal safety cannot be replaced by final-state safety.
14 Recovery paths cannot be silently omitted.
15 Compensation paths cannot be silently omitted.
16 Retry/redrive paths cannot be silently omitted.
17 Dynamic membership must be bounded or represented.
18 ScopeEnvelope bounds must be enforced.
19 Aggregate budgets remain binding.
20 Nonlinear constraints require correlation-aware abstraction where necessary.
21 Symmetry assumptions require explicit validity conditions.
22 Digital symmetry does not imply physical symmetry.
23 Assumption closure must be non-circular or formally justified.
24 Compositional guarantees must cover shared interactions.
25 Abstraction context must be current.
26 STOP/recovery invalidates incompatible abstractions.
27 Resource replacement invalidates incompatible abstraction evidence.
28 Continuity changes invalidate incompatible proof context.
29 Abstract counterexamples need classification evidence.
30 Spurious-counterexample classification is itself a claim.
31 Formal model checking applies to the configured model/assumptions.
32 Implementation correctness remains a separate refinement obligation.

## Major architectural result
State-space reduction is now a safety-controlled abstraction layer, not merely a model-checking optimization.
Clean chain: CONCRETE SAFETY CLOSURE → CLAIM PROJECTION → INTERACTION-PRESERVING ABSTRACTION → COMPOSITIONAL CONTRACTS → CONSERVATIVE ABSTRACT MODEL → FORMAL CHECK → REFINEMENT EVIDENCE.

## Open gaps
G-ABS2-01 formal abstraction/refinement relation.
G-ABS2-02 soundness of interaction-preserving abstraction for Nexo claims.
G-ABS2-03 higher-order hyperedge abstraction.
G-ABS2-04 nonlinear relational abstract domains.
G-ABS2-05 temporal abstraction soundness.
G-ABS2-06 recovery/compensation abstraction.
G-ABS2-07 dynamic membership abstraction.
G-ABS2-08 assumption-closure non-circularity.
G-ABS2-09 symmetry validity automation.
G-ABS2-10 CEGAR/refinement workflow.
G-ABS2-11 model-size bounds.
G-ABS2-12 actual SANY/TLC.
G-ABS2-13 implementation refinement.
G-ABS2-14 fault-injection validation.
G-ABS2-15 long-duration proof-context invalidation testing.

## Conclusion
Never reduce the model by deleting a behavior whose irrelevance has not been proven. Instead, abstract by preserving claim-relevant interactions and conservatively representing unknown behavior.
This is a research/design principle, not a verified theorem.

## Next attack
ABSTRACTION REFINEMENT + ASSUME/GUARANTEE CYCLES + UNKNOWN PROPAGATION.
Question: how can Nexo prevent individually valid component abstractions from collectively creating a false global safety proof through circular assumptions, hidden shared dependencies, or UNKNOWN values that get weakened at each composition boundary?