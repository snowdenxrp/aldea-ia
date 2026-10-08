# NEXO STEP 3C — INTEGRATION GATE — 2026-10-08

## Scope

Before wiring the existing canonical `persistState(expectedRevision)` primitive behind `ConditionalCommit`, inspect the real primitive and its execution contract.

## Evidence carried forward

- MASTER/final distillation requires conditional canonical commit behind the Core ownership boundary.
- P112 already closed the question of whether a second generic persistence wrapper is needed: it is not.
- Existing `persistState` is the canonical conditional snapshot-commit primitive for cooperating writers.
- `STATE_REVISION_CONFLICT` is STALE_CANDIDATE, not proof of absent external effects or dependency validity.
- Final semantic validation remains mandatory before commit.
- UNKNOWN must remain UNKNOWN on commit uncertainty.
- No external effect is implemented by this step.

## Structural finding

The existing persistence primitive is asynchronous:

`persistState(...) -> Promise<payload>`

The first STEP 3B composition was synchronous:

`executeProtectedTransition(...) -> Outcome`

Therefore a synchronous adapter/bridge would either:

1. hide an unresolved Promise behind a false terminal result,
2. block or invent a second persistence mechanism, or
3. weaken the ownership/UNKNOWN contract.

All three are architecturally unacceptable.

## Decision

🔵 **STEP 3C requires the protected-transition composition to become asynchronous at its real persistence boundary.**

This is not a compatibility patch. It is the direct contract correction required to compose the already-established canonical persistence primitive without lying about commit completion.

The Core flow remains:

PROPOSAL → CLAIM → AUTHORITY → ISOLATION → CANDIDATE → FINAL VALIDATION → CONDITIONAL COMMIT → OUTCOME

Only the execution contract changes from synchronous return to an awaited terminal outcome.

## Required properties

1. `FinalSemanticValidator` remains mandatory and precedes commit.
2. `ConditionalCommit` is the only owner allowed to invoke canonical persistence.
3. `STATE_REVISION_CONFLICT` maps to `STALE_CANDIDATE`.
4. Any non-conflict persistence exception is conservatively `UNKNOWN` at the protected-transition boundary unless a stronger semantic classification is directly proven.
5. No sync wrapper, polling bridge, second persistence primitive, or speculative transaction layer.
6. The Core remains independent of the simulation-specific persistence schema; any adaptation belongs outside the Core port.
7. No claim is made here about power-loss durability, universal writer participation, external effects, exactly-once, or reconciliation.

## Stop condition

If making the transition asynchronous reveals a deeper ownership or state-shape contradiction, STOP and redesign before adding another layer.

## DO-NOT-REPEAT

- Do not create a second conditional persistence primitive.
- Do not rerun TLC.
- Do not create AB105.117R.
- Do not reopen closed AB104/AB105 research.
- Do not patch legacy orchestration into Nexo Core.
