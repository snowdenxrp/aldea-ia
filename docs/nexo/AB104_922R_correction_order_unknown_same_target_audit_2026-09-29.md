# AB104.922R — Correction relationship with unknown order on the same target
Date: 2026-09-29

## Question
O1 and O2 affect the same target; one is intended as a correction of the other, but the system cannot determine which effect occurred first. Can it infer the correction relationship from payload/state alone?

## Fresh evidence
W3C PROV represents derivation, generation, usage and temporal information as explicit provenance relationships; provenance constraints distinguish causal/temporal relationships rather than treating identical entities or final states as sufficient proof. Microsoft Event Sourcing preserves original events and represents corrections/compensations as new events, so a correction does not erase the original event.

## Attack
Same target T:
- O1 produces EFFECT-1.
- O2 is intended to correct EFFECT-1 and produces EFFECT-2.
- Due to lost/out-of-order observations, local history cannot establish whether EFFECT-1 happened before EFFECT-2.
- Final target state is compatible with either ordering.

## Findings
1. Same target plus correction-like payload does not prove temporal order.
2. A correction relation is a causal claim and needs evidence/contractual semantics, not merely semantic similarity.
3. If provider supplies immutable effect IDs plus parent/original-reference and authoritative timestamps/order, the relationship may be resolved.
4. If only final state is available, multiple histories can map to the same state; correction causality remains UNKNOWN.
5. If O2 is externally labeled as a correction of O1 by an authoritative provider, that relationship can be evidence even when local arrival order is reversed.
6. If O2 arrived before O1 locally, arrival order cannot be used to conclude O2 occurred first.
7. If both effects are independently confirmed but order is unknown, preserve both effects and represent a partial order/UNKNOWN temporal relation rather than inventing a total order.
8. If correction semantics require O1 to precede O2, and no evidence establishes that prerequisite, O2 may be CONFIRMED as an effect while its validity-as-correction remains UNKNOWN.
9. A successful O2 can coexist with an UNKNOWN relation to O1; effect existence and causal role are separate claims.
10. If O1 and O2 are mutually exclusive under the domain contract, unresolved ordering can block safety classification even though both effects are known.
11. If effects are commutative under a provider contract, order ambiguity may not affect semantic state, but it still does not prove which effect occurred first.
12. No new top-level interaction class. Existing I19/I21 + class11/class12 cover the causal/order ambiguity; I24/I15/I22 may participate depending on lifecycle/retry.

## Core distinctions
SAME_TARGET != SAME_HISTORY
CORRECTION_PAYLOAD != CORRECTION_CAUSALITY
ARRIVAL_ORDER != EFFECT_ORDER
EFFECT_ORDER != CAUSAL_ORDER
FINAL_STATE != UNIQUE_HISTORY
EFFECT_CONFIRMED != CORRECTION_RELATION_CONFIRMED
CORRECTION_ROLE != EFFECT_EXISTENCE
PARTIAL_ORDER != TOTAL_ORDER
COMMUTATIVITY != TEMPORAL_PROOF
PROVIDER_REFERENCE_CAN_ESTABLISH_LINEAGE
UNKNOWN_ORDER != UNKNOWN_EFFECT

## Required evidence
- provider-native effect IDs;
- explicit original/correction reference if available;
- authoritative effect-time/order semantics;
- target + incarnation identity;
- causal parent/derivation metadata;
- immutable historical record;
- domain definition of what makes O2 a valid correction;
- explicit handling of partial temporal order;
- reconciliation state preserving unresolved ordering.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
