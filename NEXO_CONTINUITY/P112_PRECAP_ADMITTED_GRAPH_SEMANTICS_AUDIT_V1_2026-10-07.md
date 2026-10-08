# P112 PRECAP_ADMITTED_GRAPH_SEMANTICS_AUDIT_V1 — 2026-10-07

## Scope
Audit whether the mission objective, dependency graph, status/blocking computation and execution/verification semantics operate over the same set of steps after the historical bounded cap.

## Source facts

### 1. The cap is applied only at the return boundary
Current `buildNexoMission()` constructs `steps` in full, computes:
- dependency IDs;
- dependency cycles;
- DO_NOT_REPEAT blocking;
- first executable step;
- whether all steps are blocked;

and only then returns `steps.slice(0,8)`.

Therefore admission state is calculated over the **pre-cap graph**, while execution/verification consume the **post-cap graph**.

### 2. Objective is computed from the pre-cap graph
`objective` is selected from `executable`, which is derived from the full `steps` array.

Then the returned mission contains only the first eight steps.

This creates a concrete mismatch class:
**objective may name an action that is not present in returned mission.steps.**

The test suite does not exercise >8 steps and therefore does not establish that this mismatch is intentional or harmless.

### 3. Dependency calculation is also pre-cap
`dependencyIds()`, cycle detection, and blocked-state calculation all run before slicing.

A dependency can therefore point to a step that is removed by the cap.

Current `beginNexoStep()` checks dependency IDs against the returned mission, so a dependency that was present in the pre-cap graph but omitted from the returned graph is no longer represented.

This is not proof of a current production failure because no existing test/production case with a dependency crossing the cap boundary was recovered.

It is a **semantic mismatch surface** requiring classification.

### 4. Verification scope is post-cap
`verifyNexoMission()` evaluates only `mission.steps`.

Thus verification can certify completion of the admitted eight-step graph without accounting for candidates omitted by the bound.

This is expected if the bound is an execution budget with explicit non-admission semantics, but the repository does not currently carry such a semantic marker.

### 5. Execution scope is post-cap
`planNexoExecution()` also reads only returned `mission.steps`.

Therefore the planner can:
- compute objective from candidate N;
- return only candidates 1–8;
- execute/verify only candidates 1–8.

The objective can consequently refer to a non-admitted candidate.

### 6. Historical intent does not resolve the graph mismatch
Historical evidence establishes that the eight-step bound is intentional as a bounded orchestration design.

It does NOT establish that objective/dependency/verification were intentionally defined over the pre-cap graph.

So we must preserve:
🟢 bounded budget is historical intent;
🔵 exact graph semantics at the cap boundary remain OPEN.

## Concrete adversarial shape

If the full sorted graph is:

1. A — executable
2. B — depends on A
...
8. H
9. I — executable

and A–H are returned, no issue exists for I except omission.

But if the first executable step selected from the full graph is #9 because #1–#8 are blocked/waiting, the returned mission can have:

`objective = I`

while:

`mission.steps`

contains no I.

That is a stronger inconsistency than simple candidate omission.

Similarly, if a retained step's dependency is outside the first eight, the pre-cap dependency graph says the retained step depends on that omitted step, while the post-cap mission contains no dependency node to satisfy it.

Current code's runtime dependency lookup then treats the missing dependency as unmet.

This could produce a durable mission that is internally waiting/blocked despite the pre-cap graph having a valid dependency relation.

## Status

🟢 Objective is computed from pre-cap graph.
🟢 Dependency/cycle/blocking calculations are computed from pre-cap graph.
🟢 Execution/verification consume post-cap graph.
🟢 Therefore the cap is a semantic boundary, not merely array truncation.
🔵 Whether objective/dependency behavior across that boundary is intentionally defined remains OPEN.
🔵 Cross-boundary dependency case is structurally reachable but not yet demonstrated in production.
🔵 “Budget 8” semantic contract still OPEN.
🔴 No implementation/TLC/JMM-HB/exactly-once/power-loss claim.

## DO-NOT-REPEAT

Do not remove the historical cap.
Do not call the cap accidental.
Do not claim a production failure without a concrete >8 dependency/blocked ordering witness.
Do not reinterpret omitted candidates as failed or resolved.
Do not implement a cap fix before the semantic contract is recovered.

## Exact next

Construct/recover a deterministic >8-step witness using the existing test harness only, without changing production code, to determine whether:
1. objective can point outside returned steps;
2. a retained step can depend on an omitted step;
3. verification can complete while pre-cap candidates remain;
4. existing tests/documentation already encode an intended budget semantics.
