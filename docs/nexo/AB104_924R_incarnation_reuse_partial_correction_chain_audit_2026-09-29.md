# AB104.924R — Incarnation reuse inside a partial correction chain
Date: 2026-09-29

## Question
O1 belongs to an old incarnation R1/gen41. O2→O1 is confirmed by provider reference, but O2/O3 carry only a reused resource ID X, not the historical incarnation. What lineage and safety claims remain valid?

## Fresh evidence
W3C PROV distinguishes entities, activities, derivations, identity links and temporal information; provenance therefore supports explicit historical relationships rather than relying on a current identifier alone. Microsoft Event Sourcing keeps immutable events in the event stream and treats compensations as new events; the event stream remains the historical record even as current projections change. citeturn0search3turn0search24turn0search0

## Attack
R1/gen41/X → O1 → EFFECT-1
R1 ends
R2/gen42/X is created
O2 → EFFECT-2, provider originalReference=EFFECT-1
O2 metadata exposes only X, not R1/gen41
O3 → EFFECT-3, originalReference=EFFECT-2
Question: can O2/O3 be safely attached to R1, R2, or both?

## Findings
1. A provider-native reference from O2 to EFFECT-1 can establish an effect-level relationship even when the current resource ID is reused.
2. That relationship does not automatically prove that the current resource X in R2 is the same historical entity/incarnation as X in R1.
3. If EFFECT-1 has authoritative lineage to R1/gen41, O2 can remain linked to EFFECT-1 while its relation to current R2 remains UNKNOWN unless target/incarnation evidence exists.
4. O3→O2 can be confirmed independently; downstream lineage does not manufacture the missing O2→current-incarnation binding.
5. Therefore correction chains can be effect-complete but resource-incarnation-incomplete.
6. A current resource ID match is insufficient to transfer historical effects across incarnation boundaries.
7. If provider contract guarantees that EFFECT-2's originalReference to EFFECT-1 implies the same historical resource lineage, that contract can establish the missing relationship; otherwise the inference is not universal.
8. If R2 is later confirmed as the legitimate successor and the provider defines successor lineage explicitly, the chain may be connected through a successor relation, but successor identity is distinct from incarnation identity.
9. A correction of a historical effect can legitimately be executed by current authority if policy permits; executor generation and target-effect origin generation remain distinct.
10. If O2/O3 are confirmed effects but target incarnation is unresolved, preserve effects and unresolved binding separately. Do not erase either history.
11. If an irreversible effect is ambiguous across incarnations, safety claims concerning the current R2 must remain UNKNOWN until authoritative lineage resolves the target.
12. No new top-level interaction class. This is primarily I18 + I19/I21 + class11/class12, with I9 when correction authority crosses generations.

## Core distinctions
EFFECT_REFERENCE != CURRENT_RESOURCE_IDENTITY
RESOURCE_ID != RESOURCE_INCARNATION
EFFECT_LINEAGE != CURRENT_RESOURCE_LINEAGE
CORRECTION_CHAIN != RESOURCE_CHAIN
DOWNSTREAM_EFFECT_LINK != UPSTREAM_INCARNATION_PROOF
SUCCESSOR_RELATION != SAME_INCARNATION
CURRENT_AUTHORITY != HISTORICAL_EFFECT_ORIGIN
AUTHORIZED_CORRECTION != PROVEN_HISTORICAL_TARGET
CURRENT_ID_MATCH != HISTORICAL_IDENTITY_MATCH
EFFECT_COMPLETE != INCARNATION_COMPLETE
UNKNOWN_BINDING != UNKNOWN_EFFECT
RECONCILIATION != HISTORY_REWRITE

## Required evidence
- globally/stably scoped effect ID;
- provider semantics of originalReference;
- resource incarnation/generation or explicit successor lineage;
- target identity binding;
- authoritative historical event stream;
- temporal semantics;
- correction authority and target-binding rules;
- explicit representation of unresolved incarnation edges;
- reconciliation source and resolution transitions.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
