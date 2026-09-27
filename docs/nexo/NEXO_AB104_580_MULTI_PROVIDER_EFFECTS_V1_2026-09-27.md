# NEXO — AB104.580 — Multi-provider / multi-resource effects

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
Azure and AWS describe Saga as a sequence of local transactions across independent services, using continuation and/or compensation rather than assuming one global atomic transaction. citeturn0search0turn0search1
AWS notes that Saga lacks transaction isolation and that concurrent orchestration can produce stale data; semantic locking may be needed. citeturn0search7
Azure's compensating-transaction guidance notes that compensation is itself eventually consistent, can fail, and may require manual intervention. citeturn0search10

## Finding
A logical Nexo action spanning multiple providers does NOT inherit the strongest guarantee of its participants.
The end-to-end guarantee is constrained by the weakest relevant boundary.

Example:
P1 = idempotent + fenced
P2 = idempotent only
P3 = neither
Therefore the composite action cannot honestly claim atomic authorization or exactly-once execution across P1/P2/P3.

## Required decomposition
One logical mission/effect should be represented as:
RootEffect
→ EffectPart_1(provider/resource/incarnation/contract)
→ EffectPart_2(...)
→ EffectPart_N(...)
with explicit causal dependencies and individual outcomes.

Do not collapse all participants into one COMMITTED bit.

## Composite state
Each part independently records:
Outcome: COMMITTED | NOT_COMMITTED | UNKNOWN
Authority: VALID | INVALID | UNKNOWN
Incarnation
Fence/epoch
Contract digest
Provider evidence
World-state evidence.

The root additionally records a derived composite state, but the derivation must preserve every unresolved participant.

## Critical rule
Root COMMITTED cannot mean every external effect committed unless every required part has authoritative evidence.
Instead distinguish:
ALL_REQUIRED_PARTS_COMMITTED
PARTIAL_COMMIT
UNKNOWN_PARTS
CONFLICTING_EVIDENCE
BLOCKED.

## Recovery
After partial commit, recovery must be forward/compensating per participant. There is no universal rollback across independent providers.
Compensation order must follow causal/resource constraints, not blindly reverse list order.
Each compensation is itself a new external effect with its own identity, authority, incarnation and reconciliation.

## Adversarial case
P1 commits.
P2 times out UNKNOWN.
P3 rejects because its fence expired.
Correct root state is PARTIAL_COMMIT + UNKNOWN_PART_2 + INVALID_PART_3.
It is NOT simply FAILED and NOT simply COMMITTED.

## New invariants
1. Composite effect status is derived, never substituted for participant truth.
2. The weakest participant constrains the end-to-end guarantee.
3. Partial commit is a first-class state.
4. Compensation is participant-specific and creates new evidence.
5. A participant becoming UNKNOWN fences only dependent work, not unrelated independent work.
6. A root cannot be declared complete while required participant outcomes remain UNKNOWN.

## Closure
AB104.580 closes the narrow question: multi-provider actions require a participant-level effect graph; no global atomicity should be claimed unless every relevant boundary actually provides it.
Still OPEN:
- cycles and dependency deadlocks;
- concurrent partial commits;
- compensation ordering under races;
- root completion semantics;
- human-review boundaries;
- formal verification;
- implementation/fault injection.

## Next exact step
AB104.581 — research cycles in the external effect/dependency graph and determine how Nexo prevents UNKNOWN/BLOCKED states from creating deadlock or unsafe cycle-breaking.