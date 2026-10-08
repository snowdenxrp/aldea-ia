# P112 POSTERIOR AB EXECUTION-OWNER EVIDENCE RECONCILIATION V1 — 2026-10-07

Research-only; no implementation.

## Why this pass was necessary
The current AB104.151-era code shows no production execution owner, but later AB104 material was explicitly requested as evidence because it may already answer the missing boundary. This pass searched the later corpus without changing the historical AB104.151 conclusion.

## Relevant later evidence

### AB104.152–153 lineage
Later continuity material explicitly repeats:
- the execution-owner boundary remained undefined;
- `persistPreparedIntent` is a hook, not an integrated durable transaction boundary;
- the canonical state/revision authority must own the checkpoint;
- recovery/reconciliation ownership must remain distinct from normal execution ownership.

This corroborates that the missing owner was not merely an accidentally omitted call site.

### AB104.227–230
The later operation-registry line introduces a stronger target-side boundary:
- operation identity, effect mutation, and committed result need sufficiently atomic ordering;
- loss/rollback of registry state after an effect cannot imply NOT_COMMITTED;
- receipt/target binding and reconstruction matter;
- durable commit/receipt is distinct from caller response.

This is directly relevant to the execution-owner question because it says the owner cannot merely invoke the handler; it must participate in an ordered operation/effect/commit protocol.

### AB104.214
Later audit material states that memory/effect-journal roles were mixed and that the prototype had tests around prepared → reconcile → completed, persistence-before-handler, and restart reconstruction, while still leaving an explicit source of truth for external effects pending. This is evidence that the lifecycle was being refined, not that a production execution owner already existed.

### AB104.543
Later 2PC/outbox research defines the local/external split as:
AUTHORITY_COMMIT → DURABLE_INTENT → PROVIDER_ADMISSION → EXTERNAL_ATTEMPT → RECONCILIATION.
It explicitly does not manufacture a single global commit point for external execution.

### AB104.585
Later scheduler research reinforces that a scheduler/preflight check is not the final TOCTOU boundary; stale queue entries must be discarded/re-admitted, and timeout at commit becomes UNKNOWN until authoritative reconciliation.

### AB104.990R–999R
The latest numbered/researched tail provides strong epistemic constraints:
- retry is a new attempt;
- handler idempotency is not universal downstream idempotency;
- downstream identity must be propagated/enforced explicitly;
- multi-call handlers contain multiple effect boundaries;
- rollback is a new effect, not historical erasure;
- recovery terminal status can coexist with unresolved evidence;
- UNKNOWN/NOT_CHECKED must preserve reason, scope and coverage.

## What this DOES and DOES NOT establish

GREEN:
1. The later AB corpus does contain information materially relevant to the missing execution-owner problem.
2. It corroborates that the owner is a protocol/topology boundary, not simply a missing function call.
3. It supplies a more precise lifecycle vocabulary: durable intent, provider admission, external attempt, committed receipt/result, reconciliation.
4. It confirms that normal execution ownership, recovery ownership, and reconciliation ownership remain distinct.

BLUE:
1. The later corpus does not, from the evidence inspected in this pass, identify an existing current repository production caller that already implements the complete owner lifecycle for the present Lúmina prototype.
2. Therefore we must not replace the current open owner gap with an invented implementation from the research architecture.
3. The exact minimal owner boundary remains to be derived by reconciling the later protocol with the current repository topology.

## Critical correction to the previous frontier
The previous hypothesis “maybe simulate.mjs is simply the missing owner” is now too narrow.

The evidence points toward:
**execution owner = lifecycle/protocol owner**
rather than merely:
**execution owner = script that calls executeLuminaNexoStep()**.

The owner must be able to establish the ordered boundary around durable intent, protected execution admission, effect attempt/result identity, terminal durable state and recovery/reconciliation.

## Exact next
Do NOT implement an owner yet.

Next research target:
reconcile the later AB104.227–585 operation/effect lifecycle against the current `runtime.js` + `effect-adapter.js` + `simulate.mjs` topology and identify the smallest boundary that can satisfy the already-established protocol without inventing a new global coordinator.

DO-NOT-REPEAT:
- no implementation;
- no TLC rerun;
- no AB104.185 primary;
- no AB105.117R;
- no assumption that simulate.mjs is the owner;
- no claim that later AB research is runtime proof.
