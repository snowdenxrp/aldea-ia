# P112 — DYNAMIC DEPENDENCY CAPTURE vs WHOLE-SNAPSHOT CONFLICT DOMAIN V1 — 2026-10-07

## Scope
Decision audit: identify dependencies that make claim-specific composite tokens hard to prove complete, and compare them with treating the isolated snapshot + expectedRevision as the protected conflict domain. Research only.

## Findings
1. Static object-token capture is insufficient where admission depends on predicates, ranges, aggregates, helper-derived values, or access paths whose authoritative inputs are not fixed at the call site.
2. Dynamic authoritative-read capture is required whenever conservative static closure cannot be proven. A cache/helper hit remains a read; derived output must retain provenance.
3. Predicate/range dependencies are especially difficult to compress: exploration can depend on positions of multiple agents/resources, normalization, and selection predicates; target identity alone is not equivalent to the predicate.
4. Aggregate dependencies are difficult to compress: trade pricing can depend on inventories/aliveness of every agent scanned by the economy aggregate. A participant token cannot represent the complete invalidator set unless the aggregate itself has a complete generation updated by every contributing writer.
5. Randomized selection requires either binding the random evidence/result to the protected claim or treating the choice as nondeterministic evidence. A token over deterministic state alone does not reproduce a random-dependent admission.
6. External observations are another open class: future providers require identity/incarnation/revision/freshness. Without those, the validator cannot establish that the observation used for admission is still authoritative.
7. Policy/config/logic versions can invalidate an admitted claim even when world state is unchanged. They therefore belong to the claim dependency envelope when they influence eligibility or execution semantics.
8. Because several dependency classes are dynamically discovered and transitive, proving a small composite-token set requires a complete access-path + writer coverage proof. Current repository evidence does not provide that proof.
9. Whole-snapshot conditional commit has a broader conflict domain but a simpler completeness argument: any persisted snapshot change that advances the canonical revision conflicts with the candidate. This does not by itself solve semantic reconciliation or external/non-snapshot provenance.
10. Therefore composite tokens are justified only if they produce a demonstrably complete reduction of the conflict domain. Until that reduction is proven, isolated snapshot + expectedRevision is the more conservative protected conflict domain for repository state.

## Decision boundary
🟢 For persisted repository state, whole-snapshot conditional commit currently has the stronger demonstrated completeness property.
🔵 Composite tokens remain a possible optimization/reduction, not a proven semantic replacement.
🔵 External observations, RNG evidence, policy/config/logic versions and post-snapshot providers require explicit provenance if they affect the protected claim.
🔴 No implementation or performance claim; no runtime race/JMM-HB/exactly-once claim.

## Exact next
Audit which state changes actually advance the canonical stateRevision and whether every writer that can alter the protected snapshot participates in that revision discipline. Then separately classify non-snapshot dependencies (external observations, provider freshness, RNG evidence, policy/config/logic) that expectedRevision cannot cover.

## DO-NOT-REPEAT
No generic token inventory, no global revision implementation, no TLC rerun, no AB104.185 backfill, no AB105.117R.