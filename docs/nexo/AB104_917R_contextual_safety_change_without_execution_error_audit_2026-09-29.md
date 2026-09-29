# AB104.917R — Contextual safety change without historical execution error
Date: 2026-09-29

## Question
What happens when V2 does not invalidate V1 authorization, but the external context changes so that an effect that was valid/safe at T1 is unsafe at T2, while the original execution remains historically valid?

## Fresh evidence
Microsoft Event Sourcing distinguishes immutable historical events from later compensating events and notes that external integrations can be handled separately from the event store. W3C PROV explicitly models time, activities, entities, revisions and derivations, allowing later assessments to be related to prior historical entities without replacing them. citeturn0search1turn0search0turn0search6

## Attack
T1:
- E1 occurs.
- V1 authorizes O1.
- EFFECT-1 commits.
- External context C1 makes EFFECT-1 acceptable.

T2:
- Context changes to C2.
- V2 says EFFECT-1 is now unsafe if it remains in force.
- V2 does NOT claim E1/O1/EFFECT-1 was invalid at T1.

Cases:
A) Context change is reversible.
B) Context change creates permanent incompatibility.
C) V2 requires remediation.
D) Current resource identity changed/incarnation reused.
E) Remediation outcome is UNKNOWN.

## Findings
1. Historical validity and present safety are different claims. EFFECT-1 can be validly executed at T1 and unsafe to maintain at T2.
2. The context transition itself is a new historical fact; it does not rewrite E1 or EFFECT-1.
3. A current safety decision must be evaluated against the context/policy applicable at T2, not by rewriting the T1 execution.
4. If V2 requires remediation, remediation is a new operation with its own authority, operation identity, target binding, idempotency and outcome.
5. If the original effect is irreversible, "currently unsafe" does not imply "original execution was wrong" and does not guarantee physical reversal is possible.
6. If the effect is reversible, successful remediation still does not erase the original historical effect; it adds a corrective transition.
7. If target identity has changed through incarnation/reuse, remediation must bind to the historical effect/resource lineage, not only current resource ID.
8. If remediation outcome is UNKNOWN, the safety state remains unresolved; current context being unsafe does not prove that remediation happened.
9. If context change itself is observed only through a current projection, historical timing/causal completeness must be established before asserting exactly when the safety transition occurred.
10. No new top-level interaction class. The case composes I9/I18/I19/I21 and class11/class12 depending on authority, lineage and external-effect reconciliation.

## Core distinctions
HISTORICAL_EXECUTION_VALIDITY != CURRENT_SAFETY
CONTEXT_CHANGE != EXECUTION_ERROR
CURRENT_UNSAFE != HISTORICALLY_INVALID
REMEDIATION != ERASURE
CURRENT_CONTEXT != HISTORICAL_CONTEXT
CURRENT_RESOURCE_ID != HISTORICAL_EFFECT_TARGET
CURRENT_SAFETY_ASSESSMENT != HISTORICAL_EXECUTION_PROOF
UNSAFE_NOW != REMEDIATION_COMPLETED
REVERSIBLE_EFFECT != ERASED_HISTORY
CONTEXT_CHANGE_MUST_BE_TIME/CAUSALLY_BOUND

## Required evidence/contract
For a present safety transition:
- identity of the affected historical effect;
- evidence of context change and its effective time;
- policy/version governing T2 assessment;
- explicit rule connecting context to safety classification;
- remediation authority if action is required;
- exact historical target binding;
- outcome/reconciliation semantics for remediation;
- provenance linking context transition → new assessment → corrective activity.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
