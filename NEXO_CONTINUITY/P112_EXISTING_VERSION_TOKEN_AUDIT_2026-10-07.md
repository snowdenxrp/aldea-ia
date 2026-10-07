# P112 — EXISTING VERSION TOKEN AUDIT — 2026-10-07

## Findings

Current repository has some version-like fields, but they are not yet a complete protected-transition protocol.

- world.spatial.version and world.spatial.regionVersion exist, but audited spatial writers do not demonstrate a uniform increment/conditional-commit discipline. They cannot yet be promoted to authoritative spatial fence tokens.
- stateRevision exists elsewhere in the persistence path as a conflict/version token, but prior P112 evidence already shows it is not an authority fence and does not automatically cover in-memory concurrent mutation.
- Agent state has no demonstrated generic monotonic revision covering inventory, needs, knowledge, relationships, position and other admission inputs.
- Relationships have no revision token; recordInteraction mutates relationship state directly.
- Economy has no demonstrated aggregate revision. advanceEconomyDay derives prices from all alive-agent inventories, so participant-only versions cannot validate the aggregate price dependency.
- Collective projects have no demonstrated revision/incarnation token; project state and participant inventories are mutated together.
- Resource objects have no demonstrated per-resource revision/incarnation token in the current audited paths.
- Spatial predicates/ranges have no demonstrated authoritative token that changes whenever an observation-relevant entity crosses the predicate boundary.
- Random choice has no demonstrated admission-bound evidence binding seed/state/consumption to the selected intent.

## Minimum missing token families

1. Resource version/incarnation.
2. Agent-state revision with subdomains or dependency-set capture for inventory/needs/knowledge/relationship/position as appropriate.
3. Aggregate economy revision/dependency digest.
4. Relationship revision.
5. Collective-project revision/incarnation.
6. Spatial/range/predicate dependency token.
7. Structure/land/production dependency tokens where build/farm eligibility depends on them.
8. Random-selection evidence token.
9. Final-gate admission generation/operation identity binding all captured dependencies.

## Important conclusion

Do not add a single global revision merely to make the matrix pass. Several dependencies are semantic aggregates or predicates. A useful token must change on every mutation that can invalidate the corresponding claim, or the dependency must be represented explicitly and revalidated.

## Posterior AB observation

No new later AB104 primary artifact was found by the current repository search. Existing AB104.600–.602 remain retrospective cross-checks only; no historical AB was backfilled.

## Status

GREEN: concrete existing version-like fields identified.
GREEN: several required dependency domains currently lack demonstrated authoritative revisions.
BLUE: exact mutation coverage/increment ownership remains OPEN.
BLUE: minimal partition remains OPEN.
BLUE: final-gate implementation remains prohibited.

## Exact next

Audit mutation ownership for each candidate token: identify every current writer that would have to advance it, and find bypasses. Start with resource + agent inventory/needs + relationship + economy aggregate + spatial region/range.
