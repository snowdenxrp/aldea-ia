# AB105.089R — EventDAG reconstruction completeness boundary

Date: 2026-09-30
Chain: AB105.088R -> AB105.089R

## Objective
Define the minimum semantic conditions for calling a reconstructed execution graph COMPLETE, without converting missing successors, bounded prefixes, or ambiguous ordering into fabricated terminal states.

## Fresh primary evidence
RFC 9420 requires each Commit to be based on a specific epoch/state and requires an explicit rule for conflicting Commits for the same epoch; otherwise applying a Commit to a different starting state produces incorrect results. citeturn0search0
RFC 9000 separates packet-number spaces and requires duplicate suppression in the relevant context. It also reconstructs a full packet number from the highest successfully processed packet plus a bounded decoding window, rather than treating an observed truncated value as globally self-sufficient. citeturn0search1turn0search23

## Reconstruction completeness contract
A reconstructed EventDAG may be marked COMPLETE only when all decision-relevant conditions below are satisfied:

1. ROOT_IDENTITY
The reconstruction has an authenticated/validated root or an explicitly bounded root scope.

2. CONTEXT_BINDING
Every included event is bound to the same relevant execution context: instance/epoch/operation namespace as required by the protocol.

3. SUCCESSOR_COVERAGE
Every required successor relation is either observed or explicitly proven impossible/terminal by protocol semantics.

4. PREDECESSOR_COVERAGE
Every required predecessor relation needed for the claim is observed or bounded by a protocol-defined initial boundary.

5. ORDER_RESOLUTION
All decision-relevant ordering relations are established. Timestamp order alone is insufficient.

6. DUPLICATE_RESOLUTION
Retransmissions/replays/duplicate observations are resolved without counting them as independent executions.

7. FORK_RESOLUTION
Conflicting branches for the same epoch/context are resolved by an explicit protocol rule or remain unresolved.

8. TERMINALITY_PROOF
A terminal state is supported by protocol-defined terminal evidence; missing next event is never equivalent to terminal success.

9. COVERAGE_EXHAUSTION
The evidence source's relevant pagination/history/retention boundary is known and exhausted, or the claim is explicitly bounded to the observed interval.

10. RECONSTRUCTION_VERSION
The reconstruction algorithm/schema/version used to derive the graph is recorded so historical meaning cannot silently change.

## State classification
COMPLETE
All decision-relevant completeness conditions satisfied.

BOUNDED_COMPLETE
Complete only inside an explicitly declared temporal/contextual scope; no claim may escape that scope.

PARTIAL
Some required edges/events are missing, but the known subgraph remains usable for bounded observations.

UNKNOWN
Missing information can change the decision-relevant interpretation and cannot be safely bounded.

CONFLICTING
Multiple incompatible graph interpretations remain possible.

## Critical anti-collapse rules
MISSING_SUCCESSOR != EMPTY_TERMINAL
MISSING_EVENT != NO_EVENT
QUERY_EXHAUSTED != HISTORY_EXHAUSTED
PREFIX_RECONSTRUCTION != COMPLETE_HISTORY
TIMESTAMP_ORDER != CAUSAL_ORDER
RETRANSMISSION != NEW_OPERATION
DUPLICATE_RECORD != DUPLICATE_EFFECT
SAME_EPOCH != SAME_STATE
DIFFERENT_EPOCH != AUTOMATIC_FORK_RESOLUTION
TERMINAL_RECORD != ZERO_PRIOR_EFFECT

## AB50–AB58 application
The historical FutureObs_PAA/EventDAG result remains:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

AB105.089R does not retroactively close those states.
Instead, it provides the semantic boundary that explains why they remain open: completeness requires successor/predecessor coverage, ordering, duplicate/fork resolution, terminality proof, and known evidence boundaries.

## Result
A generic EventDAG reconstruction completeness contract is now defined.
No claim of formal verification or implementation is made.
The historical branch remains OPEN_PENDING_SEMANTIC_FREEZE/FORMAL_VERIFICATION.

## Status
EVENTDAG_RECONSTRUCTION_COMPLETENESS = NORMATIVELY_DEFINED
EVENTDAG_GENERIC_BRANCH = OPEN_FOR_HISTORICAL_GAP_ONLY
BOUNDED_RECONSTRUCTION = VALID
COMPLETE_RECONSTRUCTION = REQUIRES_CONTRACT_SATISFACTION
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.090R — adversarially apply this completeness contract to the historical ternary FutureObs_PAA cases: specifically test whether missing successor, epoch transition, replay/duplicate, and ambiguous ordering can produce distinct reconstructed terminal states. Do not claim closure unless all decision-relevant interpretations converge.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.