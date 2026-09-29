# AB104.930R — Revocation/replacement after retrospective authorization
Date: 2026-09-29

## Question
A3 at T6 explicitly retroactively classifies EFFECT-2. At T7 A3 is revoked or replaced by A4. Does the prior retrospective assessment remain valid?

## Fresh evidence
W3C PROV models provenance as history involving entities, activities, agents, time, derivation and invalidation, and defines constraints for consistency of that history. It also models provenance statements/bundles as identifiable provenance objects, supporting separate provenance-of-provenance rather than collapsing later assessments into the underlying history. citeturn0search0turn0search24
RFC 2906 states that authorization information is time-bounded and may be revoked before expiry. That establishes the temporal/revocation property of authorization itself, but does not by itself specify retroactive semantics for previously executed effects. citeturn0search12

## Scenario
T3: O2 accepted under A2.
T4: A2 expires.
T5: EFFECT-2 occurs/gets confirmed.
T6: A3 is issued with explicit retroactive scope and reclassifies EFFECT-2.
T7: A3 is revoked or replaced by A4.

## Findings
1. Revocation of A3 does not erase the historical fact that A3 existed at T6 or that a retrospective assessment was made under A3.
2. Whether A3's assessment remains legally/policy-valid after revocation depends on the revocation contract: prospective-only revocation, retroactive invalidation, or another declared semantics.
3. A4 likewise cannot silently rewrite the historical A3 assessment. It may supersede it only through an explicit version/supersession relation.
4. Four layers must remain separate: EFFECT FACT, ORIGINAL AUTHORIZATION ASSESSMENT, RETROACTIVE CLASSIFICATION, CURRENT POLICY STATUS.
5. If A3 was valid at T6 and its revocation is prospective-only, the T6 assessment can remain a valid historical assessment while its current applicability changes.
6. If the contract explicitly makes revocation retroactive to T6, the system may change the status of the A3 assessment, but must retain the prior assessment and the revocation event as provenance; it must not pretend the assessment never existed.
7. If the revocation's temporal scope is ambiguous, the status of the A3 assessment after T7 is UNKNOWN/CONFLICTING, not automatically invalid.
8. A4 can produce a new assessment of EFFECT-2, but A4's newer issuance is not evidence that A3 was wrong.
9. A4 does not establish A2 authorization at T5 and does not prove non-execution.
10. A historical assessment may therefore have a status lifecycle independent from the effect lifecycle:
   EFFECT_CONFIRMED → ASSESSMENT_A3 → ASSESSMENT_REVIEWED/REVOKED/SUPERSEDED.
11. If A3 authorized a corrective operation rather than merely classifying EFFECT-2, that operation remains a separate operation/effect and must not be collapsed into the original effect.

## Required representation
Maintain immutable links:
- EFFECT-2 → occurrence/effect evidence
- A2 → original authorization assessment
- A3 → retroactive assessment
- REVOCATION-3 → A3 status change
- A4 → replacement/new assessment
- explicit temporal/supersession relations for every transition

## Critical distinctions
REVOCATION_OF_AUTHORITY != ERASURE_OF_HISTORY
REVOCATION_OF_A3 != PROOF_A3_NEVER_EXISTED
A4_NEW_AUTHORITY != A2_HISTORICAL_AUTHORITY
A4_NEW_ASSESSMENT != PROOF_A3_WAS_WRONG
CURRENT_POLICY_STATUS != HISTORICAL_ASSESSMENT
RETROACTIVE_RECLASSIFICATION != RETROACTIVE_ERASURE
UNKNOWN_REVOCATION_SCOPE != AUTOMATIC_INVALIDITY

## Classification
No new top-level interaction class. Primarily I9/I19/I21 + class11/class12; I24 if assessment/operation crosses lifecycle boundaries.

## Epistemic status
Research only. No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
