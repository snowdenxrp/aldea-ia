# NEXO — AB104.576 — Irreversible / non-compensatable external effects

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
AWS Durable Execution explicitly distinguishes retry semantics by side-effect class: at-least-once is suitable for idempotent operations, while external one-shot effects such as payment or non-idempotent POST require at-most-once/no-retry handling. citeturn0search11
AWS Saga guidance treats compensation as a separate transaction and notes that compensation itself adds complexity; distributed systems cannot assume a global rollback. citeturn0search0turn0search4
Azure documents resource-group deletion as irreversible, demonstrating that some external operations have no ordinary rollback. citeturn0search7
Google Cloud defines idempotency around repeated application having the same final effect and notes that non-idempotent actions require additional retry care. citeturn0search6

## Finding
For an irreversible external effect, Nexo cannot use rollback as a universal recovery primitive.
If an effect is committed and cannot be undone:
- preserve the immutable historical fact;
- contain further effects;
- reconcile actual external state;
- re-evaluate current authority/policy;
- create a separate recovery/compensation mission if one exists;
- otherwise remain in a declared unresolved/contained state.

## Critical distinction
COMPENSATION != ROLLBACK
A compensation may produce a desirable future state without restoring the exact prior state.
Therefore Nexo must never record that an irreversible effect was rolled back unless the provider proves the exact inverse semantics.

## UNKNOWN case
1. Freeze duplicate execution.
2. Preserve the original EffectID and all evidence.
3. Query authoritative provider state using the same incarnation/identity.
4. If COMMITTED → historical effect becomes immutable.
5. If NOT_COMMITTED → a new attempt may require fresh authority.
6. If still UNKNOWN → remain UNKNOWN/CONTAINED; do not resolve by guessing.
7. If target/provider incarnation changed → old UNKNOWN does not authorize action on the new incarnation.

## New safety boundary
For non-compensatable effects, the recovery objective is not restore previous state; it is: preserve truth → prevent amplification → establish current state → determine admissible next action.

## New invariant
NO_SAFE_COMPENSATION does not imply IGNORE or RETRY. It implies a containment/reconciliation state.

## Proposed state dimensions
EffectOutcome: COMMITTED | NOT_COMMITTED | UNKNOWN
Reversibility: REVERSIBLE | COMPENSATABLE | NON_COMPENSATABLE | UNKNOWN
Containment: OPEN | FROZEN | CONTAINED | RELEASED
CurrentAuthority: VALID | INVALID | UNKNOWN
WorldState: VERIFIED | DIVERGED | UNKNOWN
Recovery: NONE | RECONCILE | COMPENSATE | FORWARD_RECOVER | HUMAN_REVIEW | BLOCKED
These are research/design candidates, not finalized schema.

## Adversarial cases
A. Unauthorized irreversible commit → preserve fact; block further dependent actions; determine compensating/forward recovery.
B. UNKNOWN irreversible effect + repeated retry → duplication risk; remain frozen until authoritative evidence.
C. Irreversible effect followed by resource reincarnation → historical effect remains bound to old incarnation.
D. Compensation itself is irreversible → compensation needs its own EffectID, target incarnation, fence, and reconciliation.
E. Provider reports success but world state is not verified → provider outcome must not be conflated with world-state truth.
F. Compensation impossible → transition to contained divergence, not fabricated rollback.

## Closure
AB104.576 closes the narrow question: irreversible external effects require a containment/reconciliation model rather than assuming rollback.
Still OPEN:
- compensation safety and authorization;
- human-review boundary;
- dependent-effect fencing;
- partial-world-state verification;
- multi-effect causal graphs;
- formal verification;
- implementation/fault injection.

## Next exact step
AB104.577 — research dependent effects after an UNKNOWN/irreversible effect: determine how Nexo must fence downstream actions so uncertainty cannot silently propagate into additional external mutations.