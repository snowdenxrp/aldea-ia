# NCS M0 — Open Loops as a read-only continuity projection

Date: 2026-10-23  
Branch: `ncs-clean-architecture`  
Status: **INITIAL QUERY IMPLEMENTED — EXACT-SHA CI VERIFIED; READ-ONLY PROJECTION ONLY**

## Decision

Do not create a separate Open Loops store, queue, scheduler, task registry, or new lifecycle identity. The master vision names Open Loops as a capability; the current implementation already has canonical operational-continuity records and several read-only queries. The correct first slice is a deterministic read-only projection over one validated continuity snapshot, only after its exact scope is covered by tests.

This is an 🔵 **EXTENSION** of the current application query surface, not proof that a full Open Loops engine exists.

## Existing implementation to reuse

- `loadNexoContinuityStatus(path)` exposes counts, including prepared and observed-unsettled effect journal entries, but not the individual records.
- `loadNexoMissionStatus(path, missionId)` reconstructs one mission and exposes a bounded summary of its steps.
- `loadNexoMissionPlan(path, missionId)` derives dependency/planning states for one mission and explicitly returns `authorization: NOT_EVALUATED` and `dispatchAttempted: false`.
- `NEXO_OPERATIONAL_CONTINUITY` snapshot schema already separates `missions`, `attempts`, `executions`, and `effectJournal`. Keep their semantics separate.
- The stable application API is deliberately narrow and the CLI import graph is tested. Any new query must remain read-only and must not import the compatibility runtime or Lúmina/simulation.

No closed mission-lineage, serialization, idempotency, or restart audit is being repeated. Historical P112 findings remain relevant only as constraints: a projection must not fabricate provenance that persistence did not retain.

## Proposed first-slice contract

Implemented API: `loadNexoOpenLoops(continuityPath)`, exported from the stable application index. The initial contract is now exercised by `tests/nexo/open-loops-query.test.mjs`.

### Input and read semantics

1. Require a non-empty path; return a stable blocked code for invalid input.
2. Load and validate canonical continuity exactly once. All records in a result must refer to the returned `storeRevision`.
3. Never initialize a missing store, mutate continuity, append Chronicle, repair state, dispatch a mission, or invoke an adapter.
4. Return a bounded summary projection, not raw records or mission target/context payloads.
5. Preserve the existing error distinction for missing/corrupt/resource-limited state; do not turn unavailable state into an empty successful result.

### Mission loops

- Enumerate only missions present in the canonical `snapshot.missions` collection.
- Reconstruct each mission from that same snapshot and preserve the existing completed-status discrepancy guard.
- Surface nonterminal mission state and incomplete/blocked/failed/non-plannable steps as observations, not as new obligations.
- A step is not considered closed merely because it is absent from the projection or because an execution record exists; completion semantics must come from the canonical reconstructed state and existing outcome rules.
- Do not infer missing mission provenance, user commitments, deadlines, priority, or causal attribution.

### Effect obligations

- Report only effect-journal records whose existing status semantics classify them as prepared or observed-but-unsettled, if their schema and current invariants support a safe summary.
- Do not conflate journal obligations with mission steps or duplicate them into another registry.
- An unresolved journal record means reconciliation work may remain; it is not permission to redispatch. The query must never emit a redispatch instruction.
- If record identity or linkage cannot be safely summarized, return an explicit UNKNOWN/blocked summary for that record class rather than inventing IDs or joins.

### Result invariants

Every successful result must include:
- `status: "loaded"`, `code: null`, and `storeRevision`;
- separate `missionLoops` and `effectObligations` collections or counts with names that do not merge their meanings;
- `authorization: "NOT_EVALUATED"`;
- `dispatchAttempted: false`;
- no raw target/context/secret payloads;
- deterministic ordering for the same snapshot;
- a clear limit if the output is capped. Never silently truncate and report a complete inventory.

A missing store or invalid snapshot is `blocked`, not an empty inventory. A valid snapshot with no outstanding items may return an empty successful projection.

## Acceptance tests required before implementation can be called complete

1. Empty valid snapshot returns empty collections and the exact store revision.
2. Planned mission and incomplete step are surfaced without implying dispatch permission.
3. Completed mission is not listed as open unless the existing canonical model explicitly identifies another unresolved item.
4. Blocked/failed/unknown step remains visible with a bounded reason code when available.
5. Prepared and reconciled-observed journal entries remain separate from settled-observed entries and mission steps.
6. Mission status discrepancy returns blocked/UNKNOWN instead of silently omitting a potentially inconsistent mission.
7. Missing/corrupt/resource-limited store returns blocked, never a false empty result.
8. File bytes and mtime remain unchanged; a missing store is not created.
9. Repeated calls on the same snapshot return deterministic results.
10. No dispatch, adapter, owner mutation, or Chronicle append is called.
11. Output excludes target, context, private payloads, and unbounded source fields.
12. Public export/CLI argument handling remains narrow; unsupported generic execution commands remain rejected.

## Open implementation questions — do not hide them

- Does the existing canonical journal schema provide stable, non-sensitive identity and mission linkage for every unresolved record? Verify in the actual snapshot contract before exposing per-record items.
- What is the required output bound? Prefer a bounded count/summary or explicit pagination only if a demonstrated user need requires it; do not introduce a cursor/ID scheme speculatively.
- Which mission statuses are terminal in the current canonical reconstruction contract? Reuse the existing semantics rather than defining a second status taxonomy.
- Does the current stable CLI need a dedicated `open-loops` command now, or should the first slice remain application-only until an actual caller requires CLI exposure? Do not widen CLI surface without an acceptance case.

## Implementation result and remaining gate

The first query slice is implemented and wired into the public application API (not yet into the CLI). It loads one validated snapshot, returns non-completed mission/step summaries separately from `prepared` and `reconciled_observed` effect-journal obligations, excludes `settled_observed`, and never returns target/context payloads. The output is capped at 1,000 projected items; exceeding the cap returns a blocked result rather than a silently truncated inventory. Invalid journal linkage returns `NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN`.

Regression coverage includes missing-store non-creation, empty/invalid path semantics, mission-loop projection, separate journal statuses, target privacy, no mutation (bytes and mtime), deterministic output, malformed unresolved-journal linkage, orphan mission/step references, and action mismatch against the canonical step.

A concrete linkage gap was found and corrected: non-empty `missionId`, `stepId`, and `action` fields did not prove that the unresolved journal row referred to a real canonical mission/step or that its action matched. `loadNexoOpenLoops` now resolves each unresolved row against the same validated snapshot and returns `NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN` if that relation is absent or discordant. This is referential validation for the projection, not authentication or authority.

Exact combined implementation+test SHA: `443014e2309a5ff8d487f1b3b56f842e286fb792`.
- [Deterministic persistence / `npm test` — run 39979056812 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39979056812), job `120501276361` SUCCESS.
- [STEP 4 — run 39979056795 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39979056795).
- [STEP 5 — run 39979057695 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39979057695).

The exact implementation+test SHA is verified by these three workflows. CLI exposure remains intentionally deferred until an actual caller/acceptance need is established. No new store, queue, scheduler, or task identity was introduced.

Canonical status remains M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
