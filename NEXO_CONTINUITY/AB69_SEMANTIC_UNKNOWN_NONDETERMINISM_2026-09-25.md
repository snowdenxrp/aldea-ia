# AB69 — SEMANTIC DISTINCTION: UNKNOWN vs NONDETERMINISM vs KNOWN-EMPTY

Date: 2026-09-25
Status: RESEARCH ONLY.

## Research question
Can the protocol safely use one generic UNKNOWN value for all unresolved transitions?

## External evidence
Partial-transition-system literature explicitly models a transition as present, absent, or unknown, where UNKNOWN means the real system may contain the transition or may not; this is distinct from an actually nondeterministic system. Partial transition systems also use may/must behavior and can return UNKNOWN when the abstraction is too imprecise. [Wei, Gurfinkel, Chechik, 2011; Wehrheim, 2008]
Epistemic planning separately treats uncertainty from incomplete knowledge and uncertainty caused by nondeterministic actions; belief states represent alternatives compatible with current knowledge. [Bertoli et al., 2011]
These sources support separating epistemic uncertainty from real nondeterministic behavior rather than conflating them. citeturn0search0turn0search1turn0search2

## Minimal semantic candidates

Let a transition query be Q = (s, a, s').

A. KNOWN_PRESENT
The evidence establishes that Q is a valid transition.

B. KNOWN_ABSENT
The evidence establishes that Q is not a valid transition.

C. UNKNOWN_RELATION
The evidence does not establish whether Q is present or absent.
This is epistemic uncertainty about the model/relation.

D. SPECIFIED_NONDETERMINISM
The model explicitly establishes multiple admissible successors for (s,a), e.g. {s1,s2}.
This is not an epistemic placeholder: the multiplicity itself is part of the protocol semantics.

E. KNOWN_EMPTY_SUCCESSOR_SET
The complete successor set for (s,a) is established as empty.
This is stronger than merely failing to find a successor.

## Important result
C and D must not be merged.

If C is represented as a set of all imaginable successors, the representation silently injects behaviors not supported by evidence.
If D is represented merely as UNKNOWN, the representation discards real protocol semantics that may be required to evaluate future observations.
If E is represented as UNKNOWN, the model loses a proven impossibility.
Therefore a sound abstraction needs at least a distinction between:
- epistemic status of the transition relation;
- protocol-defined successor multiplicity;
- proven absence.

## Candidate semantic object

Research candidate, NOT adopted:

TransitionKnowledge =
  relation_status: KNOWN | UNKNOWN
  known_successors: finite/set-valued relation when justified
  completeness: COMPLETE | PARTIAL
  evidence_id: provenance

Interpretation:
- KNOWN + COMPLETE + empty successors => KNOWN_EMPTY.
- KNOWN + COMPLETE + {s1,s2} => specified nondeterminism.
- UNKNOWN/PARTIAL => unresolved relation; no fabricated successor is permitted.

This candidate is intentionally smaller than a generic powerset state model. It preserves provenance and completeness without choosing a concrete successor for UNKNOWN.

## FutureObs_PAA consequence

Given a current abstract state x and candidate continuation a, define research-level result categories:

1. OBS_KNOWN_EMPTY:
   complete evidence establishes no legal successor.

2. OBS_KNOWN_UNIQUE(o):
   complete evidence establishes one successor and its observation o.

3. OBS_KNOWN_MULTIPLE(O):
   complete evidence establishes multiple successors and their observations O.

4. OBS_UNKNOWN:
   the admissible successor relation is incomplete/unknown.

Aggregation must then distinguish:
- multiple known successors with identical observation;
- multiple known successors with different observations;
- unknown successor relation.

A known set {s1,s2} with identical observation is not equivalent to UNKNOWN merely because current observation cannot distinguish them.

## Counterexample

Suppose:
s --a--> s1 and s --a--> s2 are both specified,
Obs(s1)=Obs(s2)=o.

Then FutureObs may legitimately establish OBS_KNOWN_MULTIPLE({o}), despite nondeterminism.

Now suppose the evidence only says:
s --a--> ?unknown.

It is unsound to replace that with {s1,s2}, because those successors were never established.

Conversely, if evidence proves no a-successor exists, replacing that with UNKNOWN weakens a proven fact and can incorrectly preserve a future continuation.

## New open requirement
The protocol must specify what evidence is sufficient to claim successor-relation completeness. Without that, KNOWN_EMPTY is itself unsafe to infer merely from search exhaustion.

## Decision
Do not modify AB61/AB65 yet.
The minimal semantic object above is a research candidate only. Next step is to derive the smallest FutureObs algebra from the actual P_AA protocol semantics and attack requirements, then test whether the candidate preserves all distinctions needed for collision/reconstruction analysis.

## Status
TERNARY_PAA_COLLISION=UNKNOWN
FUTUREOBS_SEMANTICS=OPEN
QUOTIENT_CONGRUENCE=UNKNOWN
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION=NOT_PERFORMED
EXECUTION=NOT_VERIFIED

## DO-NOT-REPEAT
- Do not treat search failure as KNOWN_EMPTY.
- Do not encode UNKNOWN as a concrete successor.
- Do not collapse specified nondeterminism into UNKNOWN.
- Do not call the candidate TransitionKnowledge a production architecture.
- Do not change AB61/AB65 before semantic testing.
