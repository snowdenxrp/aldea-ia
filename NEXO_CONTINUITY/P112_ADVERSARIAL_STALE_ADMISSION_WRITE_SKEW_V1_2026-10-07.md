# P112 ADVERSARIAL STALE-ADMISSION WRITE-SKEW AUDIT V1 — 2026-10-07

Research-only. These are modeled interleavings derived from actual code paths, not runtime executions.

## Resource — two agents consume shared resource
R1 and R2 both admit against the same resource amount. Each may have disjoint agent WriteSets, but both admission predicates depend on shared resource availability. A concurrent resource mutation can invalidate both admissions.
Finding: agent-local revision cannot reject the conflict. A resource token works only if every resource writer, including daily world/ecosystem writers, updates it before final validation.

## Trade — aggregate price write skew
T1 admits using participant inventories and current price. T2 changes another agent inventory. advanceEconomyDay() later recomputes price from the aggregate inventory of all alive agents. Participant-only versions therefore miss a dependency that can change the trade's economic predicate.
Finding: economy aggregate/price must be represented in the protected dependency closure, or the protected footprint must encompass the aggregate writer.

## Cooperate — project predicate/write skew
C1 and C2 can both observe an active project/eligibility predicate and participant inventories. One contribution can change project progress/status and inventories while the other admission remains based on the old predicate.
Finding: participant revisions alone do not protect project eligibility. Project revision/incarnation plus participant/resource dependencies are required, or a broader project transaction boundary.

## Three implementation strategies — analytical comparison
A) Composite dependency tokens: smallest concurrency footprint when token ownership and invalidation are complete. Risk: hidden bypasses make a token appear valid when an untracked writer changed the dependency.
B) Protected transition serialization over the intersecting footprint: simpler proof boundary, but may serialize unrelated work if the footprint is broad.
C) Conditional snapshot/commit with stale rejection: preserves more concurrency, but requires complete ReadSet/DependencySet capture and authoritative validation at commit.

## Important distinction
PostgreSQL's Serializable model is only a conceptual cross-check: serializable systems detect read/write dependencies and predicate effects and may reject a transaction when concurrent execution cannot correspond to a serial order. This does not prove any Nexo implementation. The Nexo question is whether its protected boundary can capture the equivalent authoritative dependency closure. 

## Result
🟢 The three representative classes expose distinct write-skew surfaces: shared resource quantity, aggregate economy state, and project predicate state.
🟢 Composite tokens cannot be judged sufficient from their names; completeness of writer coverage is the decisive condition.
🔵 Exact minimal boundary remains OPEN.
🔵 Need actual writer→token ownership design before implementation.

## Exact next
Construct the writer→token coverage matrix for the three classes: enumerate every known mutator, assign the dependency it invalidates, and identify any mutator with no possible token update. Those uncovered mutators define the minimum broader protected footprint.

## DO-NOT-REPEAT
No implementation. No runtime concurrency claim. No TLC rerun. No AB104.185 primary artifact. No AB105.117R.