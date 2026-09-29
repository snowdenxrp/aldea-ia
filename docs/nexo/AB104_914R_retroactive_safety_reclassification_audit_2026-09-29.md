# AB104.914R — Retroactive safety reclassification without historical fact rewrite
Date: 2026-09-29

## Question
Can V2 legitimately change the safety classification of a historical fact while the fact and external effect remain unchanged?

## Fresh evidence
Microsoft Event Sourcing documents immutable events, append-only history, compensating events, event versioning and upcasting; changing application code does not rewrite historical events. W3C PROV models revisions as new entities and provenance as information about entities, activities and derivations; provenance itself must be trusted separately.

## Attack
T1: E1 occurs under V1. E1 is KNOWN. EFFECT-1 occurs and is independently evidenced.
T1 decision classifies EFFECT-1 as SAFETY-ACCEPTABLE under V1.
T2: V2 is valid and explicitly retroactive. V2 changes the safety classification rule but does not alter E1 or EFFECT-1.
Question: can V2 label the historical effect UNSAFE/REQUIRES_REVIEW without claiming that the original fact or effect did not occur?

## Findings
1. Yes, a later policy can legitimately produce a new classification of an unchanged historical fact if the policy explicitly grants retroactive scope.
2. The historical fact and external effect remain unchanged; only the classification/assessment changes.
3. The V2 assessment must be represented as a new derived assertion/revision, preserving V1's prior assessment and its governing policy version.
4. A retroactive safety downgrade is not evidence that the original effect was absent, invalidly executed, or different.
5. If V2 is only a current policy with no retroactive authority, applying it to T1 as though it governed T1 is a semantic error.
6. If V1 and V2 classifications conflict, both can remain historically valid as assessments under different policy versions; the system needs an explicit current-policy selection rule to determine which assessment governs present decisions.
7. A present safety decision may use V2 while still preserving that V1 previously classified the effect differently.
8. If V2 changes the definition of the underlying fact rather than merely its classification, the case returns to AB104.913R: semantic reinterpretation requires explicit bounded retroactive contract and provenance.
9. If the reclassification triggers a corrective external action, that action is a new operation with its own authority, identity, target binding and outcome; the reclassification itself is not the corrective effect.
10. No new top-level interaction class. This remains I19/I21 + class11/class12 with policy/version/provenance dimensions.

## Critical distinction
FACT != EFFECT != SAFETY_CLASSIFICATION

Also:
SAFETY_RECLASSIFICATION != HISTORICAL_ERASURE
POLICY_VERSION != HISTORICAL_FACT_VERSION
RETROACTIVE_CLASSIFICATION != RETROACTIVE_EXECUTION
NEW_ASSESSMENT != NEW_EFFECT
CURRENT_POLICY_AUTHORITY != HISTORICAL_EXECUTION_AUTHORITY
CLASSIFICATION_CHANGE != EFFECT_CHANGE
UNSAFE_CLASSIFICATION != PROOF_OF_UNSAFE_EXECUTION

## Required evidence/contract for legitimate retroactive reclassification
- explicit retroactive authority;
- bounded temporal/domain scope;
- policy/version identity;
- preserved original fact and effect evidence;
- provenance linking assessment to policy version;
- deterministic classification rule;
- explicit rule for which assessment governs present decisions;
- separate contract if reclassification triggers external remediation.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 unfrozen. FutureObs_PAA open. V21 forbidden.
