# AB70 — FUTUREOBS ALGEBRA AND COUNTEREXAMPLES

Date: 2026-09-25
Status: RESEARCH ONLY; no implementation change.

## Research question
What is the smallest sound aggregation semantics for FutureObs_PAA when successor knowledge is complete, multiple, empty, or unresolved?

## External evidence
Runtime-verification literature gives a useful semantic pattern: a partial observation is definitive only when all compatible future extensions agree; otherwise the result is inconclusive. Bauer, Leucker and Schallhart define true/false/inconclusive semantics over partial traces. Later work gives a model-based account and mechanized soundness/completeness for LTL3. Sources: turn0search0 and turn0search39.
Modal transition systems distinguish required (must) from allowed (may) transitions, showing that partial transition knowledge can be represented without treating unknown behavior as a concrete transition. Source: turn0search6.
Recent agent-verification work also explicitly separates uncertain beliefs, nondeterministic choices, and probabilistic outcomes rather than collapsing them into one uncertainty state. Source: turn0search13.

## Derived research algebra

Let C be the set of protocol-consistent concrete successors supported by COMPLETE evidence.

1. C = empty:
   FUTURE_EMPTY_KNOWN.
   This is a definitive absence result only when successor enumeration is complete.

2. C = {s}:
   FUTURE_KNOWN(Obs(s)).
   One established successor gives one established future observation.

3. C = {s1,...,sn}, n > 1:
   compute O = {Obs(si)}.
   - |O| = 1 => FUTURE_KNOWN_AGREEMENT(o)
   - |O| > 1 => FUTURE_KNOWN_DIVERGENCE(O)

4. Relation incomplete/unknown:
   FUTURE_UNKNOWN.
   No concrete successor is invented.

This gives a crucial separation:
- multiplicity of known successors is not itself uncertainty;
- equal observations across known successors are not the same epistemic condition as UNKNOWN;
- UNKNOWN cannot be converted into a set of imaginable successors.

## Counterexamples

### CE1 — UNKNOWN -> empty is unsound
Evidence only says that action a has unresolved semantics.
A search returns no candidate successor.
If the model reports EMPTY, a legal but undiscovered continuation can be incorrectly eliminated.
Therefore search exhaustion is not proof of empty.

### CE2 — UNKNOWN -> known successor is unsound
Evidence does not establish whether a leads to s1 or s2.
Choosing s1 can make FutureObs appear definitive and can produce a false reconstruction result.

### CE3 — known nondeterminism -> UNKNOWN loses information
The protocol explicitly permits s1 and s2, and both have the same observation o.
Reporting UNKNOWN discards the fact that the observation is already invariant across all known successors.

### CE4 — same current observation does not establish future equivalence
States x and y have identical CurrentObs.
x has known successor observation o1; y has known successor observation o2.
A snapshot-only quotient merges x,y incorrectly.
Therefore future-context closure is required.

### CE5 — same future observation does not establish protocol equivalence
Two states have equal FutureObs but differ in an admission-relevant binding fact not included in the observation vocabulary.
They may still differ under a later legal context.
Therefore FutureObs is necessary evidence for a quotient test, not sufficient proof of congruence.

## Candidate minimal FutureObs result type

Research candidate only:

FutureObsResult =
- EMPTY_KNOWN
- KNOWN_AGREEMENT(observation)
- KNOWN_DIVERGENCE(set_of_observations)
- UNKNOWN

The candidate deliberately does NOT store fabricated UNKNOWN successors.

## Important limitation
This algebra assumes that C is the complete set of successors when a definitive result is claimed. The next research obligation is therefore not merely implementing this algebra; it is specifying what makes the successor relation complete for each P_AA continuation event.

## Implications
- AB61's current FutureObsSet status model is directionally useful but semantically incomplete until its source successor relation has an explicit completeness criterion.
- UNKNOWN must remain an epistemic result, not an unchanged concrete state.
- A known multiple-successor relation can produce a definitive observation if all successors agree.
- Quotient analysis must quantify over future legal contexts; current observation equality alone is insufficient.

## Decision
Do not patch AB61/AB65 yet. The semantic candidate is now sufficiently precise to be tested against the actual P_AA continuation semantics, but implementation should wait until completeness rules are recovered.

## Status
FUTUREOBS_SEMANTICS=PARTIAL_CANDIDATE
SUCCESSOR_COMPLETENESS=OPEN
TERNARY_PAA_COLLISION=UNKNOWN
QUOTIENT_CONGRUENCE=UNKNOWN
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION=NOT_PERFORMED
EXECUTION=NOT_VERIFIED

## DO-NOT-REPEAT
- Do not claim the candidate algebra is proven for P_AA.
- Do not infer completeness from enumeration bounds alone.
- Do not treat UNKNOWN as identity.
- Do not use equal CurrentObs or equal FutureObs as a quotient proof.
