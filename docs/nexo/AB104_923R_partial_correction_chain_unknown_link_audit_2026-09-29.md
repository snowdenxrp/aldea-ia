# AB104.923R — Partial correction chain with one UNKNOWN lineage link
Date: 2026-09-29

## Question
A provider supplies originalReference links forming O1 → O2 → O3, but one link is UNKNOWN or cannot be validated. What historical and safety claims remain valid?

## Fresh evidence
W3C PROV models derivation as an explicit relationship and distinguishes entities, activities, generation, usage and temporal information. Microsoft Event Sourcing preserves original events and treats compensating actions as new events, while AWS describes immutable event history and replay/state reconstruction. These models support preserving each observed node independently while keeping an unresolved causal edge unresolved.

## Attack
Provider history:
O1 → EFFECT-1
O2 → EFFECT-2, originalReference=EFFECT-1
O3 → EFFECT-3, originalReference points to O2

But one reference is missing, stale, ambiguous, or unverified.

Cases:
A) O2 is confirmed and its reference to O1 is authoritative; O3→O2 is UNKNOWN.
B) O2→O1 is UNKNOWN; O3→O2 is confirmed.
C) Both links exist but one target identity is ambiguous after incarnation reuse.
D) All three effects are independently confirmed but causal chain is incomplete.

## Findings
1. Each independently confirmed effect remains a historical fact even when a causal edge is UNKNOWN.
2. An unresolved edge must not be silently inferred from sequence, payload similarity, current state, or arrival order.
3. If O2→O1 is authoritative and O3→O2 is UNKNOWN, O1/O2 lineage can be established while O3's role remains unresolved.
4. If O2→O1 is UNKNOWN but O3→O2 is authoritative, O2/O3 relation can be established without proving O1 caused O2.
5. A downstream confirmed link cannot retroactively prove an upstream unknown link.
6. A correction chain is therefore a graph of nodes plus typed edges, not a single all-or-nothing chain state.
7. If a missing edge is required to establish that O3 is a valid correction, O3 can be CONFIRMED as an effect while its VALID_CORRECTION_OF relationship remains UNKNOWN.
8. If target/incarnation identity is ambiguous, the edge remains unresolved even when the textual reference matches.
9. If provider history later supplies authoritative lineage, UNKNOWN can transition to RESOLVED without rewriting prior observations.
10. If the provider asserts an impossible/cyclic correction chain, preserve the contradiction as a provenance/data-integrity issue; do not repair it by selecting an arbitrary parent.
11. If multiple valid parent candidates remain, represent a set of possible ancestors rather than selecting one by recency or count.
12. No new top-level interaction class. Existing I18/I19/I21 and class11/class12 cover lineage/order/reconciliation ambiguity; I15/I22 can participate for duplicate/retry semantics.

## Core distinctions
NODE_CONFIRMED != EDGE_CONFIRMED
EFFECT_CONFIRMED != CAUSAL_CHAIN_CONFIRMED
DOWNSTREAM_PROOF != UPSTREAM_PROOF
MISSING_EDGE != MISSING_NODE
REFERENCE_MATCH != TARGET_IDENTITY_PROOF
SEQUENCE != CAUSALITY
ARRIVAL_ORDER != CORRECTION_ORDER
POSSIBLE_ANCESTORS != SELECTED_ANCESTOR
UNKNOWN_EDGE != UNKNOWN_EFFECT
RECONCILIATION != HISTORY_REWRITE
GRAPH_PARTIALITY != FACT_ERASURE

## Required evidence
- stable effect/operation IDs;
- provider-native originalReference semantics;
- target + incarnation binding;
- authoritative temporal semantics;
- typed derivation/correction relationship;
- immutable source history;
- validation of reference target;
- explicit representation of UNKNOWN edges and multiple possible ancestors;
- contradiction detection for cycles/impossible lineage;
- reconciliation source and transition rules.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
