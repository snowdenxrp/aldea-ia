# AB68 — RESEARCH DELTA: PARTIAL TRANSITION SYSTEMS AND EPISTEMIC SUCCESSOR SEMANTICS

Date: 2026-09-25
Status: RESEARCH ONLY; no integrated Nexo implementation.

## Question
What formal families can represent incomplete transition knowledge without inventing concrete successors, and what does that imply for UNKNOWN/FutureObs_PAA?

## Evidence
- Partial Transition Systems (PTS), including modal transition systems, explicitly distinguish required/possible behavior and support 3-valued analysis/model checking. Wei, Gurfinkel and Chechik study consistency, precision and expressiveness of these formalisms. This is directly relevant to an unresolved transition relation. (Source: ScienceDirect, turn0search0.)
- Under partial observation, observer constructions commonly compute the set of concrete states consistent with an observation; recent timed-automata work describes such observers and over-approximation explicitly. (Source: ScienceDirect, turn0search10.)
- Epistemic planning commonly represents uncertainty using belief states, i.e. sets of alternative current world states; uncertainty can arise from incomplete initial knowledge and nondeterministic actions. This supports set-valued epistemic state as an established pattern, but does not require Nexo to adopt it. (Source: Oxford Academic, turn0search11.)
- Partially observable systems can require belief-space abstractions; these are often approximate and may have undecidable underlying problems. This is a warning against assuming a powerset construction is automatically cheap or complete. (Source: Springer, turn0search2.)
- LTL3 work provides a model-based account of multi-valued runtime semantics and mechanized soundness/completeness results, reinforcing that a third value needs explicit semantics rather than being an informal placeholder. (Source: arXiv, turn0academia33.)
- Partial-information epistemic model checking uses sets of states/histories indistinguishable under an observation and can reason over those sets rather than one guessed state. (Source: arXiv, turn0academia17.)

## Research result
There is now strong external evidence for a family of approaches in which incomplete knowledge is represented by:
1. a relation/model with possible and necessary transitions;
2. a belief/uncertainty set of concrete states;
3. a symbolic partial model;
4. a multi-valued semantic interpretation.

These are alternatives, not yet a decision for Nexo.

## Important distinction
An UNKNOWN transition in our protocol model is not necessarily the same thing as nondeterministic behavior of the real protocol.

- If the real protocol has multiple specified successors, the model can represent those concrete successors.
- If the protocol has one successor but our knowledge is incomplete, a belief/partial model represents epistemic uncertainty.
- If the transition relation itself has unspecified semantics, inventing a set of concrete successors is unsound unless the set is derived from explicit constraints.

Therefore the minimal safe representation may need two independent dimensions: transition status KNOWN versus UNKNOWN, and, when KNOWN, a concrete successor relation/set. A known empty successor set is distinct from UNKNOWN.

## Consequence for FutureObs_PAA
Future observation must not simply map an UNKNOWN transition to an ordinary state. A sound research operation should preserve whether:
- all known admissible successors agree on the observation;
- admissible successors disagree;
- no successor is known to exist;
- or the successor relation is itself unknown.

The exact aggregation semantics remain OPEN and must be derived from the protocol question, not imported blindly from PTS or LTL3.

## Consequence for quotient
A candidate lower-arity quotient must be checked against transitions/contexts, not only current observations. Partial models also introduce abstraction precision/consistency questions; therefore a quotient can be sound only relative to an explicitly defined abstraction and observation semantics.

## Decision
Do NOT implement a generic powerset/PTS layer yet. The research has established viable formal alternatives, but selecting one would be premature. First define the protocol-level distinction between epistemic UNKNOWN and genuine nondeterminism, then choose the smallest formalism that represents exactly the required semantics.

## Exact next research step
Study and formalize the distinction between unknown-about-transition, specified-nondeterministic-transition, and known-no-transition, then derive a small algebra for FutureObs_PAA aggregation. Test it with counterexamples before modifying AB61/AB65 code.

## DO-NOT-REPEAT
- Do not equate epistemic UNKNOWN with nondeterminism.
- Do not assume a powerset construction is the final representation.
- Do not implement a generic PTS merely because it is available in the literature.
- Do not collapse KNOWN-empty and UNKNOWN.
- Do not claim quotient congruence from snapshot equality.
