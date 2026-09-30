# AB105.090R — adversarial ternary FutureObs_PAA/EventDAG reconstruction

Date: 2026-09-30
Chain: AB105.089R -> AB105.090R

## Objective
Test whether the historical ternary FutureObs_PAA/EventDAG gap can be closed by showing that missing successors, epoch changes, duplicate/replay observations, or ambiguous ordering cannot produce distinct decision-relevant terminal reconstructions.

## Fresh primary evidence
RFC 5323 documents ANSI three-valued logic and explicitly distinguishes an undefined expression from the truth value UNKNOWN. UNKNOWN is therefore a defined logical result, not permission to substitute TRUE or FALSE. citeturn0search25
RFC 2360 describes protocol state machines as states plus events and transitions; the state-machine model is intended to make dynamic operation explicit rather than infer transitions from an incomplete sequence. citeturn0search1
NIST work on autonomous systems notes that open-world reasoning can require three-valued logic to represent ignorance rather than forcing an incomplete knowledge base into a binary state. citeturn0search24

## Adversarial matrix
CASE A — missing successor
Observed: state S and predecessor edge; required successor absent.
Possible reconstructions: terminal(S), pending(S), lost-successor(S).
These are decision-distinct.
Result: UNKNOWN/PENDING, never EMPTY_TERMINAL.

CASE B — epoch transition
Observed: predecessor in epoch E1; successor candidate exists in E2.
Without an explicit epoch-transition edge, both 'same operation continued' and 'new incarnation/operation' can remain possible.
Result: UNKNOWN unless the protocol supplies the transition binding.

CASE C — duplicate/replay
Two records have the same operation/event identity or replay semantics.
Counting both as distinct transitions can create a false terminal path or duplicate effect.
Result: deduplicate under protocol identity; if identity resolution is unavailable, reconstruction remains UNKNOWN.

CASE D — ambiguous ordering
Events A and B are both observed but no causal/order edge distinguishes A→B from B→A.
If the two orders produce different terminal states, the graph is not complete.
Result: CONFLICTING/UNKNOWN.
If all possible orders converge to the same decision-relevant state, the ambiguity is observationally irrelevant for that claim and may be marked BOUNDED_COMPLETE for that specific claim.

CASE E — ternary collision
Different ternary input states collapse to the same apparent terminal output under an incomplete transition table.
That collision cannot be treated as equivalence unless the protocol semantics prove the states are decision-equivalent.
Result: UNKNOWN when collision affects a decision-relevant distinction.

CASE F — missing semantic rule
The protocol's transition meaning is not available.
Observed event syntax cannot manufacture the missing transition semantics.
Result: TERNARY_PROTOCOL_RESIDUAL remains UNKNOWN_DUE_TO_MISSING_SEMANTICS.

## Important closure condition
The existence of multiple possible reconstructions does NOT by itself mean the claim is undecidable.
Closure is possible for a particular claim if every admissible reconstruction is decision-equivalent for that claim.

Therefore define:
RECONSTRUCTION_EQUIVALENCE_SCOPE = the exact claim/decision for which alternative graphs are compared.

Then:
ALL_ADMISSIBLE_GRAPHS_CONVERGE_FOR_CLAIM -> BOUNDED_COMPLETE
ADMISSIBLE_GRAPHS_DIVERGE_FOR_CLAIM -> UNKNOWN/STOP
GRAPH_SET_INCOMPLETE_OR_UNBOUNDED -> UNKNOWN

## Historical AB50–AB58 result
The current evidence does NOT establish convergence of all admissible FutureObs_PAA/EventDAG reconstructions.
Therefore the historical status remains:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Result
New semantic boundary found: EventDAG completeness is claim-relative, and ambiguity can be safely bounded only when all admissible reconstructions are proven equivalent for the exact decision-relevant claim.
This does not close the historical ternary gap because the required semantic transition table/equivalence proof is still missing.

## Status
EVENTDAG_RECONSTRUCTION = CLAIM-RELATIVE_COMPLETENESS_DEFINED
TERNARY_FUTUREOBS_PAA = OPEN
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.091R — stop broad EventDAG expansion and isolate the smallest missing ternary semantic artifact: determine whether a finite transition/equivalence table can be reconstructed from the historical AB50–AB58 evidence already present, without inventing missing semantics. If not, formally close the branch as UNKNOWN_DUE_TO_MISSING_SEMANTICS rather than continuing indefinitely.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.