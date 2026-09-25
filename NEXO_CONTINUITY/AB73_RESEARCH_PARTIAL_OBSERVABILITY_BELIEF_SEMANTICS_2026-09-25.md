# AB73 — Partial observability and belief-state successor semantics
Date: 2026-09-25

## Status
RESEARCH_PERSISTED = TRUE
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION_CHANGE = NONE

## Question
Whether AB61's treatment of an UNKNOWN semantic event as "state unchanged + UNKNOWN" is sufficient for successor completeness, or whether unresolved semantics require an explicit set of compatible successor states/models.

## External evidence
1. Kori & Watanabe, "From Coalgebraic Determinization to Belief Construction for Partial Observability" (2026): belief construction transforms partially observable systems into belief-state semantics; the belief state represents the possible hidden states compatible with observations. The paper states that the semantics of a partially observable system coincides with the corresponding belief coalgebra under its construction.
2. Atkinson & Carbin, "Programming and Reasoning with Partial Observability" (2021): a belief state explicitly captures possible states the environment could be in; programs can update/query that belief state, and verification can reason over possible belief states.
3. Burigana et al., "A Semantic Approach to Decidability in Epistemic Planning" (2023): epistemic planning can combine nondeterminism and partial observability; semantics, rather than syntax alone, determine the knowledge behavior.
4. The previously collected runtime-verification literature establishes that UNKNOWN is a knowledge state distinct from FALSE/EMPTY and that partial observations may leave multiple compatible executions.

## Consequence for NEXO semantics
A useful candidate abstraction is:
  K(O,H) = set of concrete states/models compatible with observation O and history H.

For an event e:
  MaySucc(K,e) = union of successors over all compatible concrete states/models.
  MustSucc(K,e) = successors entailed across all compatible concrete states/models, subject to a separately justified semantic definition.

Important distinction:
- nondeterminism = several known legal successors;
- partial knowledge = the compatible successor domain itself is incompletely known;
- UNKNOWN must not be encoded as EMPTY_KNOWN;
- a single "unchanged state + UNKNOWN" branch can preserve uncertainty as a verdict but can still omit concrete successor possibilities unless the semantics explicitly proves that no state mutation is compatible with the evidence.

## Minimal counterexample target
Let s be an observed state and e an unresolved event.
Two concrete completions M1 and M2 are compatible with all current evidence.
M1: e -> s1
M2: e -> s2
Obs(s1) != Obs(s2).

Then the current evidence does not justify selecting s1, s2, or "no state change". The correct epistemic successor domain must retain both compatible possibilities (or an equivalent symbolic representation). An UNKNOWN verdict may remain, but successor generation must not silently collapse the compatible domain.

## Relation to quotient safety
If lower observations define s1 ~L s2, quotienting is safe only when future behavior is congruent/stable under the relevant successor relation. This motivates an explicit successor-congruence gate before declaring the lower-arity quotient canonical.

## Research conclusion
The external literature supports introducing an explicit knowledge/belief layer before claiming successor completeness. It does NOT yet prove the exact NEXO ternary semantics, nor does it prove that intersection/union formulas above are the final definitions. Those remain candidate semantics requiring derivation from the NEXO protocol vocabulary and counterexample tests.

## Required next steps
1. Recover the exact NEXO observation vocabulary and protocol event semantics from AB54/AB61.
2. Construct the minimal two-completion counterexample above in the harness.
3. Define an explicit epistemic successor domain with KNOWN/MAY/MUST/UNKNOWN distinctions.
4. Test whether AB61's eight attacks change under that semantics.
5. Prove or falsify quotient congruence before any 286-triple expansion.
6. Preserve UNKNOWN/PENDING whenever the concrete compatible domain cannot be fully characterized.

## DO-NOT-REPEAT
Do not treat this research artifact as semantic closure, formal verification, or an implementation patch. Do not expand to 286 triples until the successor completeness gate is closed.
