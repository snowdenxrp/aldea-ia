# NEXO — AB104.583 — Fairness, starvation y prioridad durante recovery

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
Kubernetes API Priority and Fairness isolates priority levels and uses fair queuing so one flow does not starve others; its documentation also warns that recursive request paths can create priority inversion/deadlock. citeturn0search2
Distributed-systems research shows strict priority can starve lower-priority requests; aging can restore starvation-freedom but introduces a priority-order tradeoff. citeturn0search0

## Finding
Nexo cannot use strict priority as its only recovery scheduler. A permanently retrying/recovering branch could consume the control-plane budget and starve unrelated safe work.

## Required separation
1. SAFETY/ADMISSION: determines whether work is allowed.
2. ELIGIBILITY: determines whether current evidence permits scheduling.
3. ARBITRATION: chooses among eligible work.
4. EXECUTION: performs the already-admitted operation.

Fairness MUST NOT override safety/admission. An ineligible UNKNOWN effect cannot become executable merely because it has waited longer.

## Fairness scope
Fairness should apply among work items that are simultaneously:
- admissible;
- non-conflicting;
- within authority/fence validity;
- within resource/quota limits.

Independent safe branches should not be starved by an unresolved recovery branch.

## Anti-starvation mechanism
Candidate model:
- bounded per-class concurrency;
- fair queue among eligible flows;
- aging/wait-credit for continuously eligible work;
- retry/backoff budgets;
- recovery budget separate from normal-work budget;
- dependency-aware priority inheritance when high-priority work is blocked behind an eligible lower-priority prerequisite;
- explicit admission deadlines/expiry so stale work must revalidate rather than retain priority forever.

Aging must never revive stale authority.

## Priority inversion
If high-priority work depends on lower-priority work, the lower-priority prerequisite may receive temporary scheduling preference, but only while it remains independently admissible. This is a scheduling mechanism, not an authority escalation.

Kubernetes documents priority inversion/deadlock risk in recursive request paths, reinforcing that priority cannot be reasoned about only locally. citeturn0search2

## Recovery starvation
Recovery itself must be bounded. A stream of new failures cannot indefinitely preempt independent work, but unresolved safety-critical recovery may consume reserved capacity according to explicit policy.

Therefore define separate budgets:
- NORMAL_WORK_BUDGET
- RECOVERY_WORK_BUDGET
- RECONCILIATION_BUDGET
- COMPENSATION_BUDGET

Exhaustion changes scheduling state; it does NOT convert UNKNOWN into failure or success.

## Liveness distinction
No claim of finite completion time should be made merely from fair scheduling. Weak fairness can provide eventual service under assumptions, but distributed failures, unavailable providers and continually changing eligibility can prevent completion.

Nexo should therefore record the exact liveness assumption and observed progress separately from attempts/retries.

## New invariants
1. Safety/admission dominates fairness.
2. Fairness operates only on currently eligible work.
3. UNKNOWN cannot gain authority through aging or priority.
4. Independent eligible work remains schedulable despite blocked recovery branches.
5. Retry/recovery budgets are explicit and bounded.
6. Priority inheritance never changes authorization or fence state.
7. Stale admission expires and requires fresh evaluation.
8. Liveness claims require explicit environmental assumptions.

## Closure
AB104.583 establishes scoped fairness + anti-starvation controls without weakening epistemic or authority boundaries.

OPEN:
- atomic graph snapshots across multiple providers;
- concurrent scheduler/admission races;
- fairness under graph churn;
- formal liveness model;
- implementation/fault injection.

## Next exact step
AB104.584 — atomicity of graph snapshots across providers: determine what Nexo can and cannot claim when dependency state is distributed and no cross-provider transaction exists.