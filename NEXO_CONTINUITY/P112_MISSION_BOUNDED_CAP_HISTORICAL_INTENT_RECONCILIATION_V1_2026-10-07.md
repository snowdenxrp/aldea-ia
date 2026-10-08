# P112 MISSION BOUND CAP HISTORICAL INTENT RECONCILIATION V1 — 2026-10-07

## Scope
Reconcile the current eight-step truncation finding with the original introduction of Nexo bounded mission orchestration. This prevents overclaiming an accidental bug where the historical source explicitly described the orchestration as bounded.

## Historical evidence recovered

Initial implementation commit:
`d85616354d4d2ff0da0bd71fbf6da78f1a59cfcc`
message: **Nexo: add bounded mission orchestration core**

The original source already contained:
`steps:steps.slice(0,8)`

The companion continuity checkpoint AB104.100 explicitly described the feature as a **bounded observe → prioritize → plan → advance cycle** and as a “bounded orchestration kernel,” not unrestricted autonomy.

Therefore the eight-step limit is not an accidental late insertion introduced by current code drift. It has been present since the first orchestration implementation.

## What this proves

🟢 The cap is historically intentional at the feature level: the design was explicitly bounded.

🟢 The cap is part of the original mission-construction contract, not merely a recent regression.

🔵 The repository does NOT yet show the stronger semantic contract for the number 8 itself:
- why 8 rather than another budget;
- whether omitted findings are expected to be retried/replanned;
- whether omission is safe because lower-priority claims can remain in the next observation cycle;
- whether the cap is intended as an execution budget, persistence budget, safety budget, or merely a bounded prototype constraint.

🔴 Therefore we must not call the eight-step cap an accidental bug or automatically classify every omitted step as corruption.

## Remaining semantic risk

Even when a cap is intentional, the protected-transition question remains:

If >8 candidate claims exist, what is the authoritative disposition of candidates 9+?

Current source evidence shows:
- they are not included in mission.steps;
- recordNexoPlan() persists only returned mission.steps;
- no explicit overflow field, continuation cursor, deferred-claim journal, or “not admitted” status was recovered;
- the mission objective/dependency graph is calculated over the full pre-cap array before the returned slice.

Thus the open issue is no longer “why is there a cap?” but:

> **What protocol semantics govern claims that are intentionally outside the bounded mission?**

Possible interpretations remain OPEN and must be evidenced, not invented:
1. not admitted this cycle and expected to reappear from fresh observation;
2. intentionally deferred with no durable obligation;
3. lower-priority work that can safely be forgotten;
4. budget-excluded claims that require explicit continuation/replan semantics.

## Important distinction

A bounded mission budget is compatible with safe architecture **if non-admitted claims are explicitly classified** and the protected claim model does not mistake omission for resolution.

The current code does not expose such an explicit classification.

## Status
🟢 Historical intent of bounded orchestration recovered.
🟢 Eight-step cap existed in initial implementation.
🟢 Previous claim “possibly accidental presentation cap” narrowed: it is not a late accidental insertion.
🔵 Semantic disposition of omitted claims OPEN.
🔵 Purpose of numeric budget=8 OPEN.
🔵 Need determine whether fresh observation/replanning is the intended continuation mechanism.
🔴 No implementation/TLC/JMM-HB/exactly-once/power-loss claim.

## Exact next
Trace the original bounded-mission execution/replan cycle and tests after AB104.100 to determine whether claims omitted by the eight-step budget are expected to reappear, be explicitly deferred, or be intentionally discarded. Preserve the distinction between “not admitted this cycle” and “resolved.”

## DO-NOT-REPEAT
Do not propose removing the cap.
Do not call it accidental.
Do not equate omitted with resolved.
Do not invent continuation semantics.
