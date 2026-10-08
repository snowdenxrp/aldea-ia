# P112 MISSION STEP CAP AND NONREPEAT SEMANTICS AUDIT V1 — 2026-10-07

## Scope
Large-scale follow-up after deduplication collision audit. This audit checks two additional claim-compression mechanisms in the exact current orchestrator: the hard mission step cap and DO_NOT_REPEAT matching.

## 1. Hard step cap — concrete current loss

Source `src/nexo/orchestrator.js` constructs the complete `steps` array, computes dependencies, blocking and the executable step, and only then returns:

`steps: steps.slice(0,8)`

This is not merely a UI summary. The returned `mission.steps` is the execution/reconstruction object consumed by:
- beginNexoStep()
- advanceNexoMission()
- verifyNexoMission()
- planNexoExecution()
- recordNexoPlan()

Therefore steps 9+ are absent from the actual mission object.

### Why >8 is reachable now
The current assistant squad can emit multiple findings per run:
- Visual: up to one finding per render-probe agent plus a locomotion sample.
- Explorer: up to one finding per agent.
- Routine: up to one finding per active agent.
- Ecosystem: one per negative resource.
- Behavior: one global sample.
- Society: one global aggregate.
- Audit: one meta-finding.

The planner also receives debugger/tester/analyst reports in assistants.mjs in addition to squad reports.

No source-level invariant was found limiting the pre-slice deduped `steps` to eight.

Thus the eight-step cap is structurally reachable with current production inputs.

## 2. More serious inconsistency caused by the cap

The planner computes `executable`, `blockedOnly`, dependencies and objective over the FULL `steps` array before slicing.

Consequences:
- `mission.objective` can name an action whose step is not present in returned `mission.steps`.
- A returned step's dependency can conceptually point to a step that was removed by the slice.
- A valid finding beyond position 8 can disappear entirely from execution and durable mission history.
- The omission is silent; no overflow marker/count/continuation cursor is returned.
- recordNexoPlan() persists only the already-truncated mission.steps, so restart cannot reconstruct omitted steps.

This is a direct provenance/claim compression boundary, stronger than the prior dedupe concern because the claim can vanish even when no dedup collision occurred.

## 3. Interaction with severity ordering

collectFindings() sorts findings by severity before step construction. Therefore the eight-step cap preferentially retains higher-severity findings when the number of distinct keys exceeds eight.

That can be a useful policy, but it is implicit and undocumented as a complete scheduling policy. Lower-severity distinct claims can be omitted even though they were not duplicates.

Because dependencies and executable selection are calculated before truncation, the resulting mission can be internally inconsistent with the pre-cap planning graph.

## 4. DO_NOT_REPEAT semantics

`repeatBlocked(step,memory)` matches:

- same action AND
- either stored target is null OR stored target equals current target.

Stored entries are created by `recordNexoOutcome(..., doNotRepeat=true)` as only:
`{action,target,reason,at}`

No claim code, finding identity, producer, observation/sample identity, target incarnation, dependency digest, or mission identity is stored in the DO_NOT_REPEAT marker.

### Important status distinction
Repository search did not find a current production caller explicitly passing `doNotRepeat:true`. Therefore this is NOT claimed as a currently exercised production corruption path.

It is nevertheless a latent semantic hazard in the existing API:
- a global target=null marker blocks every future instance of that action;
- a target-specific marker blocks future claims for that target regardless of whether the causal observation is new;
- eviction is bounded to 100, so semantics are history-window based.

This is another place where action/target identity is being used as a substitute for claim identity.

## 5. Interaction with deduplication

There are now three distinct planner/history compression mechanisms:

A. Finding → mission step:
`action|target|action.name` deduplication.

B. Mission construction:
`steps.slice(0,8)` hard truncation.

C. Outcome memory:
DO_NOT_REPEAT stores only action/target and can block future steps using that coarse identity.

These must not be conflated.

## Status
🟢 Hard eight-step cap is directly present in current source.
🟢 >8 distinct mission steps are structurally reachable from current assistant outputs; no source invariant proving <=8 was found.
🟢 Cap occurs after dependency/executable computation, creating possible objective/graph inconsistency.
🟢 Omitted steps are not persisted by recordNexoPlan().
🔵 DO_NOT_REPEAT coarse semantic hazard confirmed in source, but no current production caller with doNotRepeat=true was found.
🔵 Need decide whether eight is an intentional execution budget or an accidental persistence/execution truncation; no explicit contract found yet.
🔵 Need audit tests/docs for intended maximum and whether any continuation/replan mechanism exists for omitted steps.
🔴 No implementation.
🔴 No TLC rerun.
🔴 No JMM-HB/exactly-once/power-loss claim.

## Exact next
Audit all tests/docs/callers around the eight-step cap and determine whether it is:
1. an intentional bounded execution budget with a durable continuation mechanism,
2. a UI/reporting cap that was accidentally applied to execution state, or
3. an undocumented loss boundary.

Then trace whether a mission can be replanned from omitted findings without losing their original claim provenance.

## DO-NOT-REPEAT
Do not remove or change the cap yet.
Do not assume eight is a bug until its intended contract is recovered.
Do not claim DO_NOT_REPEAT is currently corrupting production behavior; current evidence only proves the latent coarse matching semantics.
