# P112 — CANONICAL WRITER MINIMUM-BOUNDARY TRACE V1 — 2026-10-07

## Purpose
Trace the six stale-admission cases toward the smallest defensible dependency boundary. Research only; no implementation.

## Findings
1. Resource: the dependency is not merely the resource object. Admission can depend on agent inventory/needs/tool state, spatial/resource predicates, ecosystem/day effects, and random outcome. A resource-only token cannot be complete.
2. Resource: complete rejection requires a token/generation updated by every writer that can change the authoritative quantity or any claim-defining predicate. Existing evidence does not demonstrate that closure.
3. Trade: advanceEconomyDay() scans inventories of every alive agent and rewrites priceMemory; therefore participant revisions cannot be a complete price dependency.
4. Trade: the smallest defensible semantic boundary is at least participant inventory/money + economy aggregate/price generation + relationship/identity/lifecycle predicates actually used by admission. Complete writer coverage remains unproven.
5. Cooperate: project state is written by findOrCreateProject() and contributeToProject(), while participant inventory is written by multiple domains. Project-only protection cannot reject all stale admissions.
6. Cooperate: relationship/home/structure/spatial/alive predicates expand the footprint when they participate in eligibility; therefore the minimum is claim-specific union of authoritative predicates, not a fixed project token.
7. Exploration: moveAgent() is a direct position writer outside the tick-only mental model, while normalization can also mutate spatial state. A target/object revision alone cannot fence a range predicate.
8. Build/Farm: actions delegate into development/production/institutions and cross agent + world/structure domains. A structure-only token cannot cover resource, land, technology, or ecological invalidators.
9. Social/Knowledge: relationship, memory, knowledge, proximity and learning paths can mutate inputs used by admission. A single relationship token is insufficient when knowledge/proximity predicates participate.
10. Cross-case: no class currently yields a proven small complete composite token. The recurring minimum is a claim-specific protected footprint with complete invalidator coverage, or isolated snapshot + conditional commit plus final semantic revalidation.

## Important distinction
persistState(expectedRevision) is a strong whole-snapshot stale-write detector at the persistence boundary. It is not by itself proof that an already-selected intent remains semantically valid. The final gate must re-evaluate the claim-defining dependency closure against authoritative state, unless a proven equivalent token protocol makes that revalidation redundant.

## Status
🟢 Canonical-writer direction narrowed for all six classes using existing repository evidence.
🔵 Complete token ownership/generation remains OPEN.
🔵 Exact final-gate semantics remain OPEN.
🔵 Minimum footprint reduction versus whole-snapshot conditional commit remains OPEN.
🔴 No runtime race/JMM-HB/exactly-once claim.

## Exact next
Audit the admission→commit temporal window writer-by-writer and classify each relevant writer as:
- BLOCK: cannot run during protected transition;
- INVALIDATE: may run, but must advance dependency generation and force stale rejection;
- RECONCILE: post-commit write that must not retroactively alter the protected claim.

Then separately isolate post-commit learning/event writes.

## DO-NOT-REPEAT
No generic version-token inventory, no TLC rerun, no implementation, no AB104.185 backfill, no AB105.117R.