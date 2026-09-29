# AB104.931R — Retroactive classification vs correction vs compensation
Date: 2026-09-29

## Question
A3 retroactively covers EFFECT-2 and additionally authorizes a corrective action. Can classification, correction, and compensation coexist without collapsing EFFECT-2's identity?

## Fresh evidence
W3C PROV treats generation, usage, invalidation and derivation as distinct provenance relations/events, with temporal constraints. It explicitly states that an asserted derivation does not follow merely from the existence of an alternating generation/use chain; derivation must be represented as an explicit provenance relation. citeturn0search0turn0search3

## Scenario
T5: EFFECT-2 occurs.
T6: A3 retroactively classifies EFFECT-2 and authorizes correction.
T7: correction operation C1 executes.
T8: C1 produces EFFECT-3 (compensation/correction effect).

## Findings
1. Retroactive classification changes an assessment of EFFECT-2; it does not create or alter EFFECT-2 itself.
2. A correction is a new operation with its own operation identity, authority decision, target binding and lifecycle.
3. A compensation is a new effect; it does not erase the historical EFFECT-2.
4. The relation “EFFECT-3 compensates EFFECT-2” must be explicit/contracted or supported by authoritative evidence. It cannot be inferred solely from same target, opposite payload, temporal proximity, or final state.
5. A valid compensation relation does not imply that EFFECT-2 was unauthorized, invalid, or absent.
6. A correction can be authorized by A3 even if A3's retroactive classification of EFFECT-2 is later disputed; those are separate assessments unless the contract explicitly couples them.
7. If C1 fails, EFFECT-2 remains a confirmed historical effect; correction failure is not effect erasure.
8. If C1 is UNKNOWN, the system must preserve EFFECT-3 as UNKNOWN rather than infer success/failure from EFFECT-2 or final state.
9. If multiple corrections/compensations target EFFECT-2, they form a graph of distinct effects and explicit relations, not a replacement chain where the latest node overwrites the original.
10. A3's retroactive clause may authorize the correction, but authorization of C1 does not prove A3's historical classification of EFFECT-2 was correct.
11. If the correction is itself irreversible, its effect identity and provenance must remain independently auditable.
12. If target incarnation/lineage is ambiguous, correction may be authorized yet target binding remains UNKNOWN.

## Required model
Preserve at least:
EFFECT-2 (historical fact)
A3_ASSESSMENT(EFFECT-2)
C1 (correction operation)
A3_AUTHORIZATION(C1)
EFFECT-3 (correction/compensation effect)
RELATES_TO / CORRECTS / COMPENSATES edge with explicit provenance

## Critical distinctions
RECLASSIFICATION != CORRECTION
CORRECTION_OPERATION != ORIGINAL_OPERATION
COMPENSATION_EFFECT != ORIGINAL_EFFECT
COMPENSATION != ERASURE
CORRECTION_AUTHORIZATION != ORIGINAL_EFFECT_AUTHORIZATION
CORRECTION_SUCCESS != ORIGINAL_EFFECT_INVALID
CORRECTION_FAILURE != ORIGINAL_EFFECT_ABSENT
FINAL_STATE != COMPLETE_HISTORY
RELATION_INFERENCE != RELATION_EVIDENCE

## Classification
No new top-level interaction class. Primarily I9/I19/I21 + class11/class12; I24 where correction crosses authority/lifecycle boundaries.

## Epistemic status
Research only. No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
