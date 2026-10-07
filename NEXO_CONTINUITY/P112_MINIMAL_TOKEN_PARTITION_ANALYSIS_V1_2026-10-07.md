# P112 — MINIMAL TOKEN PARTITION ANALYSIS V1 — 2026-10-07

## Candidate partition

The audit does not justify one global semantic revision. The smallest defensible direction is a hybrid:

1. Resource incarnation/version for resource-local quantity/quality writers.
2. Agent-state revision/dependency digest for inventory, needs, position and other agent-local admission inputs.
3. Relationship revision for relationship predicates.
4. Economy aggregate revision/digest for price and market-wide predicates.
5. Collective-project revision/incarnation for project membership/status/progress predicates.
6. Spatial/range predicate token for radius/territory membership.
7. Structure/land/production token where a build/farm predicate spans those writers.
8. Knowledge/culture/technology/research dependency token where those values influence admission.
9. Institution/commons token for institution membership/norms/commons balance.
10. Random-selection evidence binding when randomness affects the protected decision.

## Important qualification

These are candidate token classes, not an implementation prescription. A token is only valid if every authoritative mutation that can invalidate its claim updates or invalidates it, and the final protected gate compares the captured value against current authority state.

If a dependency crosses several domains, combining tokens is preferable to inventing a global revision unless the overlap graph proves a broader footprint is actually smaller/simpler.

## Write-skew consequence

A trade cannot safely validate only the two participant revisions because daily economy aggregation can change the price dependency. A resource action cannot validate only the resource if its eligibility also depends on agent/tool/territorial predicates. Cooperation cannot validate only participants because project membership/status and multi-agent structures are part of the predicate.

This matches the general serializability lesson that read/write dependencies and predicate effects can invalidate a previously observed result even when the final writes are disjoint. PostgreSQL documents this explicitly. 

## Status
GREEN: candidate partition derived from current writer coverage.
BLUE: exact ownership/update points and dependency-digest format remain OPEN.
No implementation.

## Exact next
Trace one representative class end-to-end (resource, trade, cooperate) and identify the exact authoritative mutation boundary for each candidate token, including every daily/shared writer that can invalidate it. Then compare whether composite tokens or a broader protected footprint is smaller.
