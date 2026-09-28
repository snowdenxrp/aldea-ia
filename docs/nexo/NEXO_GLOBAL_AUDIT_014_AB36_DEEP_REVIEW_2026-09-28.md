# NEXO GLOBAL-AUDIT-014 — AB36 DEEP REVIEW — 2026-09-28

Status: additive research audit. No implementation, no V21, no semantic promotion.

## Evidence recovered
GLOBAL-AUDIT-008 establishes AB36A→AB36Z as a specialized research sequence between AB35 and AB37. It explicitly states that TLA drafts/bounded models are research artifacts and are not, by existence alone, TLC execution or formal verification. fileciteturn627file0

AB36A is directly recovered at commit 7c15924d622e608cc982dddcd9edea7c8156367e, parent AB35 d207b2a7d989a03bbbea31b7a42762f94b0b175d. The commit adds `NEXO_AB36_PAA_ABSTRACT_TLA_DRAFT_V1_2026-09-24.tla`. fileciteturn629file0

## AB36A semantic inspection
The first TLA draft defines:
- boundary Z1→Z3;
- ternary assessments TRUE_JUSTIFIED/FALSE/UNKNOWN;
- CONTEXT with subject/resource/incarnation/epoch/cap/policy/delegation;
- BRIDGE with subject/op/attempt/resource/incarnation/epoch/cap/policy/delegation/protocol/fresh/consumed;
- admission records and a sequential admission history;
- AuthValid, CompleteBinding, ProtocolValid and AdmissionAssessment predicates;
- Admit/Stutter/Next/Spec;
- a NoAuthorityAmplification invariant candidate. fileciteturn632file0

### Critical semantic observation
The draft's `AdmissionAssessment` can return TRUE_JUSTIFIED from the existence of a bridge satisfying a subset of relational/protocol fields. The predicate does not invoke `AuthValid`, and `CompleteBinding` is defined but not used by `AdmissionAssessment`. Therefore this first draft is a **modeling draft with an apparent semantic gap**, not evidence that P_AA is established. This is exactly the kind of issue later AB36 descendants needed to attack/fix.

The draft also keeps `auth`, incarnation, policy and delegation unchanged across `Admit`, so it does not model the temporal mutations needed for renewal, revocation, incarnation changes, or fence transitions. Consequently it cannot by itself establish future-observation congruence or lease/recheck closure.

`NoAuthorityAmplification` is only a candidate invariant expression. No evidence in the recovered artifact proves it was executed or checked by TLC/TLAPS/SANY.

## AB36 topology interpretation
The existence of AB36A–AB36Z should therefore be interpreted as an iterative formalization/attack/revision campaign, not twenty-six independent proofs. The audit must inspect descendants for whether they repair concrete gaps, add transition semantics, or merely restate properties.

## Drift result
AB36 is consistent with AB2–AB35's methodological direction: move from candidate semantics to an executable/formal model, expose hidden state and transition obligations, and attack the candidate. It does NOT close the central obligations.

## Hard status
- P_AA quotient congruence: UNKNOWN
- FutureObs_PAA sufficiency: UNKNOWN
- lease renewal/consumption completeness: UNKNOWN
- protocol completeness: UNKNOWN
- formal verification: NOT_ESTABLISHED
- AB36A itself: research draft, not proof

## Next exact action
GLOBAL-AUDIT-015: recover the exact AB36B–AB36Z artifact sequence by following the parent chain from AB36A and inspect each changed file. Classify every step as repair, extension, counterexample, model restriction, or redundant restatement. Do not infer from the letter labels alone.
