# P112 DEDUP COLLISION SEMANTICS AUDIT V2 — 2026-10-07

## Scope
Follow-up to the V1 mission-claim compression audit. This audit does NOT assume every dedupe collision is a real current bug. It classifies the actual collision space produced by the current assistant squad and separates current equivalence from future/provenance risk.

## Exact planner behavior
`collectFindings()`:
1. flattens reports;
2. injects `source = report.assistant`;
3. sorts by severity descending.

`buildNexoMission()` then computes:
`action|target|finding.action.name`

and keeps only the first occurrence.

Therefore, when collisions occur, **severity ordering determines which finding survives**.

## Current production collision matrix

### Visual
Current visual findings use four different actions:
- MESH_MISSING → repair_visual_mesh
- NOT_IN_SCENE → repair_scene_link
- HIDDEN → repair_visual_visibility
- OFFSCREEN → inspect_camera_framing

Target is the agent id.

Result:
- Different visual cause codes for the same agent do NOT collide because their action differs.
- Multiple identical observations for the same agent/cause can collide.
- The render observation is still freshness-sensitive and external to canonical simulation state.

### Explorer
EXPLORER_STALLED → advance_exploration_probe, target=agent id.

Result:
- Different agents do not collide.
- Repeated EXPLORER_STALLED observations for the same agent collide.
- Since the predicate is “areas=0 AND regions=0”, repeated samples may be independent evidence rather than semantically identical observations. Current planner treats them as one claim.

### Routine
ROUTINE_PHASE_MISSING → repair_routine_phase, target=agent id.

Result:
- Different agents do not collide.
- Repeated observations for the same agent collide.
- The active sequence/phase state can change between observations, so collision is not automatically evidence-equivalent across time.

### Ecosystem
NEGATIVE_RESOURCE → repair_resource_state, target=resource type.

Result:
- Different resource types do not collide.
- Repeated negative-amount observations for the same resource type collide.
- This is particularly important because `amount` is directly causal evidence and is currently discarded by the mission step.

### Society
SOCIAL_DEPRIVATION → collect_social_window, target=null.

Result:
- There is only one current finding produced by this assistant per run.
- Across repeated reports/runs, all such findings collide globally.
- The underlying population and average can change, so cross-run observations are not automatically equivalent.

### Behavior
BEHAVIOR_IDLE_SAMPLE → collect_behavior_window, target=null.

Result:
- One current finding per run.
- Across repeated reports/runs, all idle-sample findings collide globally.
- This is explicitly a sample claim; therefore different observation windows cannot safely be collapsed merely because action/target match.

### Audit meta-finding
SPECIALIST_ERRORS → inspect_and_collect_evidence, target=null.

Result:
- One current meta-finding at most per audit report.
- Across repeated audit reports it collides globally.
- More importantly, it summarizes underlying specialist errors; replacing the underlying dependency set with one meta-finding is provenance compression.

## Severity winner effect

Because findings are sorted by severity before deduplication, a collision between:
- warning + error
- info + warning
- info + error

keeps the higher-severity finding.

This is not necessarily wrong if severity is the intended policy winner. But it means the planner is implicitly implementing a **severity-based claim selection policy** that is not represented as an explicit provenance rule.

The losing observation/evidence is not retained.

## Strong correction to V1

V1 correctly identified the structural risk, but current squad inspection shows that **ordinary current single-run findings mostly have non-colliding action/target mappings**:
- visual cause classes use distinct actions;
- explorer/routine target agent;
- ecosystem target resource;
- society/behavior global.

Therefore we must NOT claim that the current production squad already demonstrates widespread harmful claim merging.

The proven issue is narrower and stronger:

> **The planner has no observation identity/freshness semantics, so it cannot distinguish repeated samples that happen to map to the same action/target.**

This is especially material for:
- render observations,
- exploration stall observations,
- behavior samples,
- routine state observations,
- negative resource amount,
- social aggregate observations.

## Dedup equivalence rule emerging

Two findings are safely equivalent for protected-transition purposes only if all causal dimensions used by the admission claim are equivalent, including where relevant:
- claim code,
- target identity/incarnation,
- producer/provenance,
- causal observation inputs,
- freshness/sample boundary,
- aggregate/predicate dependency closure,
- action payload.

The current dedupe key proves none of those equivalences.

Therefore dedupe key equality is an implementation equality, not a semantic claim-equivalence proof.

## New important consequence

A future retry/replan can generate a new finding with the same action/target but a different observation basis. Treating it as the same claim can accidentally erase the distinction between:
- same claim re-observed,
- same action recommended for a new reason,
- same target but changed causal state.

The final validator therefore needs claim identity/provenance independently of planner action identity.

## Status
🟢 Current ordinary squad has limited same-run collision space; not every dedupe is harmful.
🟢 Repeated/sample-based findings can collide globally without freshness identity.
🟢 Severity ordering is an implicit winner-selection rule.
🟢 Causal `amount` for NEGATIVE_RESOURCE is lost after planning.
🟢 Global target=null findings are especially collision-prone across observations.
🔵 Exact semantic equivalence protocol remains OPEN.
🔵 Need determine whether existing report execution boundary already has a timestamp/run/sample identity that can bind these observations without inventing a new identity system.
🔴 No implementation.
🔴 No TLC rerun.
🔴 No JMM-HB/exactly-once/power-loss claim.

## Exact next
Trace the report execution/run boundary and determine whether an existing run/sample identifier plus canonical state revision/time can already distinguish repeated observations. Then map that existing identity into the minimum claim envelope and final validator.

## DO-NOT-REPEAT
Do not claim widespread current production dedupe corruption.
Do not treat same action/target as semantic equivalence.
Do not invent a new observation ID until existing run/sample identity is audited.
