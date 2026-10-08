# P112 FINDING EVIDENCE / PROVENANCE CLASSIFICATION AUDIT V1 — 2026-10-07

## Scope
Trace the current production assistant squad findings from authoritative observation -> finding -> mission planning, and classify which fields are reconstructable, claim-critical durable provenance, or informational.

## Source evidence
Inspected current `src/assistants/squad.js` and `src/assistants/memory.js`.

The production squad returns reports shaped as:
- `assistant`
- `status`
- `observations`
- `findings`

The finding objects are deliberately small and, in the current production squad, generally contain:
- `severity`
- `code`
- sometimes `agent`
- sometimes `resource`
- sometimes `amount`
- sometimes `message`

No current squad finding inspected contains a structured `evidence` object.

## Class-by-class classification

### 1. Visual diagnostics
Codes:
- MESH_MISSING
- NOT_IN_SCENE
- HIDDEN
- OFFSCREEN

Authoritative inputs:
- renderProbe agent identity and visual predicates: mesh/exists, inScene, visible, onScreen.
- finding.agent identifies the affected simulation/render target.

Classification:
- `agent`: MUST-PERSIST or deterministically bind to the canonical target identity if the finding drives a protected repair.
- finding `code`: MUST-PERSIST/bind as the categorical claim that selected the repair branch; action can be re-derived, but the original claim class otherwise disappears.
- render predicate that triggered the code: MUST-PERSIST as evidence OR deterministically re-derive from the exact same render observation with equivalent identity/version/freshness. Current mission serializer preserves neither.
- `severity`: claim-relevant if policy uses it for admission/priority; otherwise NON-AUTHORITATIVE.
- `message`: explanatory; NON-AUTHORITATIVE unless future policy explicitly parses it.
- report-level `assistant=VisualAgent`: provenance metadata; MUST-PERSIST/bind if producer identity matters to trust/policy. Current mission projection drops it.

Important boundary:
The renderProbe observation is external-to-simulation evidence. It is not automatically reproducible from canonical simulation state alone.

### 2. Explorer diagnostics
Code: EXPLORER_STALLED

Authoritative inputs:
- agent id
- exploredAreas length
- explorationState.regionsVisited
- current world knownRegions is report-level observation context.

Classification:
- `agent`: MUST-PERSIST/bind.
- zero-exploration predicates: claim-critical evidence; MUST-PERSIST OR re-derived against the same canonical snapshot with explicit freshness.
- `knownRegions`: RE-DERIVABLE from canonical snapshot if it is not independently observed/external; report-level count alone is not the claim.
- `message`: explanatory, NON-AUTHORITATIVE.
- `assistant=ExplorerAgent`: producer provenance; MUST-PERSIST/bind when producer trust is relevant.

### 3. Behavior diagnostics
Code: BEHAVIOR_IDLE_SAMPLE

Authoritative inputs:
- complete agent set
- each agent currentActivity
- active count.

Classification:
- `activities` observation is claim-critical when the finding means all agents were passive at a particular sample.
- This is time/sample-sensitive; it cannot be safely treated as a timeless canonical fact.
- `agent/currentActivity` data can be RE-DERIVED from an isolated canonical snapshot only if the exact observation boundary is preserved.
- `message`: explanatory.
- `severity`: policy-relevant only if severity changes admission.
- `assistant=BehaviorAgent`: producer provenance.

### 4. Routine diagnostics
Code: ROUTINE_PHASE_MISSING

Authoritative inputs:
- agent id
- active routine sequence
- phase value.

Classification:
- `agent`: MUST-PERSIST/bind.
- sequence-present + phase-missing predicate: MUST-PERSIST OR re-derive against the same snapshot/version.
- `message`: explanatory.
- producer identity: provenance metadata.
- action derived from code/target is RE-DERIVABLE; admission claim is not.

### 5. Ecosystem diagnostics
Code: NEGATIVE_RESOURCE

Authoritative inputs:
- resource type
- resource amount.

Classification:
- `resource type`: MUST-PERSIST/bind.
- negative amount is claim-critical and must either be retained as evidence or revalidated against the canonical snapshot immediately before commit.
- `amount`: stronger than a summary count; it is the observation that actually establishes the predicate. If used to justify action, it is MUST-PERSIST/bind or final-gate revalidated.
- no `message` currently exists in this producer; therefore absence of prose does not mean absence of evidence.
- producer identity = EcosystemAgent provenance.

### 6. Society diagnostics
Code: SOCIAL_DEPRIVATION

Authoritative inputs:
- all agents' social needs
- computed average social value
- population membership at observation time.

Classification:
- population membership and social values are claim-critical aggregate inputs.
- The average alone is a derived aggregate; preserving only the scalar average loses the underlying dependency set.
- Therefore the protected claim must either bind the aggregate computation provenance/dependency set or final-gate revalidate the relevant agent population and social values.
- `message`: explanatory.
- producer identity = SocietyAgent provenance.
- `severity`: policy-dependent.

### 7. Audit-agent diagnostic
Code: SPECIALIST_ERRORS

This is a meta-finding derived from other findings.

Classification:
- It is NOT an independent observation domain.
- It should not become the sole authoritative justification for a protected transition.
- Its real dependency set is the specialist findings it summarizes.
- Therefore SPECIALIST_ERRORS is a derived/meta claim; the underlying specialist finding(s) must remain available if the meta-finding drives admission.

## Cross-cutting result

### RE-DERIVABLE
Often safe to re-derive from a preserved isolated canonical snapshot:
- action mapping from finding code;
- target mapping from agent/resource identity;
- simple predicates whose complete authoritative inputs are still present and whose observation boundary is preserved;
- report counts that are not themselves decision inputs.

Re-derivable does NOT mean provenance-free: a final validator must know what claim it is re-deriving.

### MUST-PERSIST / DURABLY BIND
For protected transitions, the minimum claim context includes:
- finding code / claim class;
- stable target identity and incarnation where relevant;
- producer/provenance identity when trust or policy depends on it;
- claim-critical observation/evidence that is not guaranteed reproducible from canonical state;
- aggregate/predicate/range dependency identity when the claim depends on it;
- observation freshness/sample boundary for time-sensitive diagnostics;
- concrete LUMINA_ACTION payload if that path becomes live.

### NON-AUTHORITATIVE
Unless explicitly promoted by policy:
- human-readable message;
- UI wording;
- report status when it merely summarizes findings;
- summary counts that do not determine eligibility;
- AuditAgent's meta-message without its underlying findings.

## Major advance

The provenance problem is now narrower than “persist all assistant reports.”

The safe rule is:

**Persist/bind the minimum causal claim inputs, not the entire report.**

A report can contain observational context that is useful for debugging but not required for admission. Conversely, a tiny finding such as NEGATIVE_RESOURCE can contain a single scalar (amount) that is itself claim-critical.

This means the future protected transition should not blindly copy `observations` wholesale. It should construct a claim-specific provenance envelope from the actual fields that influenced eligibility, target, branch, score, or protected precondition.

## New concrete risk

`SPECIALIST_ERRORS` demonstrates a second-order provenance trap: a derived finding can hide the dependency set of the findings it summarizes. Treating the meta-finding as an independent fact would under-capture dependencies.

## LUMINA_ACTION verification status

Repository search still finds no current production assistant producer emitting LUMINA_ACTION. The bridge remains implemented/tested, but its demonstrated producer is test-level. Do not treat the bridge as a live production path.

## Decision

🟢 Finding classes and their causal inputs can now be classified without persisting whole reports.
🟢 Target/code/action reconstruction is separable from claim reconstruction.
🟢 External/render and time/sample observations are not automatically re-derivable from canonical simulation state.
🟢 Aggregate/meta findings must retain or revalidate their underlying dependency closure.
🔵 Exact durable schema for the minimum claim envelope remains OPEN.
🔵 Producer trust semantics remain OPEN.
🔴 No implementation performed.
🔴 No TLC rerun.
🔴 No JMM-HB/exactly-once/power-loss claim.

## Exact next
Trace the actual `buildNexoMission/actionFor` mappings for each ordinary finding class and compare the minimum claim envelope against the isolated-snapshot final validator. Then inspect any non-assistant LUMINA_ACTION producer path separately.

## DO-NOT-REPEAT
Do not persist entire assistant reports by default.
Do not treat action reconstruction as claim reconstruction.
Do not treat AuditAgent meta-findings as independent evidence.
Do not infer external/render/time observations from canonical state without a provenance/freshness argument.
