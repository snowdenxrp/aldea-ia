# NEXO — AB104.577 — Downstream fencing after UNKNOWN/irreversible effects

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
AWS Durable Execution states that retries can repeat side effects and recommends at-least-once only for idempotent operations; non-idempotent external effects require stronger execution semantics. citeturn0search0
Temporal documents that an Activity can execute more than once after a worker failure and recommends stable idempotency keys; it also describes splitting multi-step Activities so a failed later step does not repeat earlier effects unnecessarily. citeturn0search1turn0search2
Azure's Saga guidance identifies irreversible/noncompensable transactions as a pivot boundary and says subsequent actions must be retryable/idempotent to reach a consistent final state. citeturn0search9

## Finding
UNKNOWN or irreversible upstream effects must create a dependency fence for downstream mutations.
A downstream action cannot become executable merely because its own local preconditions pass if it depends on an unresolved external effect.

## Dependency rule
For downstream effect D depending on upstream effect U:
- U = NOT_COMMITTED → D may be evaluated normally.
- U = COMMITTED and admissible → D may proceed if all current authority checks pass.
- U = UNKNOWN → D is BLOCKED unless an explicit policy defines a safe independent path.
- U = COMMITTED but unauthorized/invalid → D is BLOCKED until recovery/admissibility is resolved.
- U = diverged/partial → D requires reconciliation or an explicit forward-recovery policy.

## Why
Otherwise uncertainty propagates silently:
U UNKNOWN → D executes → E executes → later U COMMITTED is discovered.
This can create a causal chain whose downstream actions were based on a false assumption.

## Proposed dependency contract
Each external effect should record:
EffectID
ParentEffectIDs / causal dependencies
DependencyStateDigest
Required upstream outcome predicates
Required target/provider incarnation
Authority/fence snapshot
EffectContractDigest.

Before execution, Nexo should revalidate the dependency snapshot against authoritative current evidence. A previously valid dependency proof is not sufficient after its source becomes UNKNOWN, changes incarnation, or crosses an authority epoch.

## Critical distinction
BLOCKING a dependent effect is not the same as declaring the upstream effect FAILED.
The upstream remains UNKNOWN until reconciled.

## Adversarial cases
A. Payment UNKNOWN → shipment must not automatically execute.
B. Delete UNKNOWN → recreate must not automatically execute if deletion status determines safety.
C. Provision UNKNOWN → configuration mutation may target the wrong resource incarnation.
D. Compensation UNKNOWN → second compensation must not be issued without identity/reconciliation.
E. Two dependents race while U becomes UNKNOWN → both must observe the fence, not only the first.
F. Dependency becomes resolved after D was blocked → D needs a fresh authority/dependency evaluation, not automatic replay from stale approval.

## New invariants
1. UNKNOWN upstream state propagates BLOCKED to dependent mutations by default.
2. A stale dependency snapshot cannot authorize an external effect.
3. Resolving an upstream UNKNOWN does not automatically resurrect previously blocked effects; they require fresh admission.
4. Dependency fences are causal, not merely temporal.
5. Every downstream effect must retain enough provenance to explain which upstream facts permitted its execution.

## Architectural consequence
Nexo needs a causal dependency/effect graph at the external boundary, connected to the existing evidence graph and mission graph.
The graph must support invalidation/fencing when an upstream node becomes UNKNOWN, revoked, reincarnated, or contradictory.

## Closure
AB104.577 closes the narrow question: unresolved external effects must fence dependent mutations by default.
Still OPEN:
- concurrent dependency invalidation;
- partial effects with multiple dependents;
- cycles in the effect graph;
- recovery ordering;
- compensation dependencies;
- formal verification;
- implementation/fault injection.

## Next exact step
AB104.578 — research concurrent invalidation races: what happens when a dependency becomes UNKNOWN or revoked while a downstream effect is already being admitted/submitted, and what atomicity/fencing is required.