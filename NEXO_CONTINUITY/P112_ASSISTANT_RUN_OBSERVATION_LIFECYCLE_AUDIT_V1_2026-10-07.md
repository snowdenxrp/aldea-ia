# P112 ASSISTANT_RUN_OBSERVATION_LIFECYCLE_AUDIT_V1 — 2026-10-07

## Scope
Trace the concrete production assistant run from canonical state load through report generation, mission planning, memory persistence, and next-run inputs, focusing on whether omitted findings and observation identity survive.

## Recovered source facts

### A. No explicit run/sample/report identity
Repository search found no production `runId`, `reportId`, `sampleId`, or `executionId` attached to assistant findings/reports.

`generatedAt` exists on the mission, but it is mission creation time, not an observation identifier.

The assistant runner passes the current `simulation` into the squad without attaching a run/sample identity or canonical `stateRevision` to the findings.

### B. Canonical state revision is not attached to the observation
`scripts/assistants.mjs` loads the persisted state, runs assistants, constructs the mission, then later computes:

`nextRevision = persisted.stateRevision + 1`

and calls `persistState(... stateRevision: nextRevision)`.

Therefore the assistant observation is produced against the loaded revision, but the finding/report itself carries neither the prior canonical revision nor the eventual committed revision.

The eventual revision is an output of persistence, not an observation provenance field.

### C. The squad report is not persisted as a report
`runAssistantSquad()` returns specialist reports and an audit report.

`scripts/assistants.mjs` places this in the process-local `report.assistantSquad` and feeds its reports into `buildNexoMission()`.

There is no direct persistence of the full squad report into `.lumina-assistant-memory.json` or the canonical `nexoMemory` envelope.

### D. Learning memory deliberately stores compressed summaries, not raw observations
`learnFromReports()` receives only:
- debuggerReport
- testerReport
- analystReport

It does NOT receive `squadReport`.

For the reports it does receive, it stores:
- run timestamp/status/day/hour/agent count;
- finding count;
- test-failure count;
- bounded fingerprints in patterns;
- bounded lessons.

The run record does not store the findings themselves.

`fingerprintFinding()` is only severity + code + message.

Thus even the learning-memory path is not a durable raw-observation ledger.

### E. This creates a concrete lifecycle split

Production path:

canonical state
→ specialist reports
→ squad findings
→ planner dedup/cap
→ mission
→ persist mission inside canonical snapshot

while separately:

debugger/tester/analyst reports
→ compressed learning memory

The original squad findings that are not admitted into the mission therefore have no demonstrated durable home.

## Consequence for bounded-cap semantics

This materially narrows the previous OPEN question.

A candidate beyond the eight-step mission bound can only reappear later if the assistant pipeline independently observes the condition again.

Current persistence does NOT preserve the original squad finding as a durable deferred claim.

Therefore:

**NOT_ADMITTED_BY_BOUND ≠ FAILED**
and
**NOT_ADMITTED_BY_BOUND ≠ RESOLVED**.

It is best classified as **OBSERVATION_DROPPED_AFTER_PLANNING** unless/until a stronger deferred/continuation contract is recovered.

This label is analytical, not an implementation proposal.

## Observation identity consequence

Because no run/sample/report identity was found:
- two identical findings from different runs cannot currently be distinguished by an explicit observation ID;
- timestamp alone is insufficient as a causal observation identity;
- missionId identifies the resulting mission, not the pre-cap finding;
- stateRevision can distinguish canonical persistence revisions when attached, but current reports do not carry it.

This directly confirms the earlier deduplication concern: freshness/observation identity is not preserved at the finding→mission boundary.

## Important nuance

The assistant's `.lumina-assistant-memory.json` run history does prove that repeated assistant runs are counted and bounded, but it does not preserve the causal finding set or squad observations needed to reconstruct omitted claims.

This is not evidence that the bounded design is unsafe by itself. It is evidence that the current implementation does not provide a durable receipt for non-admitted claims.

## Status
🟢 Full production assistant lifecycle traced.
🟢 No explicit run/sample/report identity recovered.
🟢 Squad findings are not directly persisted.
🟢 Learning memory stores compressed run/fingerprint summaries and excludes squadReport from learnFromReports.
🟢 Canonical stateRevision is assigned after observation/planning and is not attached to findings.
🟢 Omitted bounded candidates therefore have no demonstrated durable continuation record.
🔵 Whether intentional design relies on fresh re-observation remains OPEN.
🔵 Whether timestamp/stateRevision should be sufficient identity remains OPEN; do not invent a new identity yet.
🔴 No implementation/TLC/JMM-HB/exactly-once/power-loss claim.

## Exact next
Trace the production report outputs and tests for any implicit observation boundary, deterministic re-observation behavior, or persisted report artifacts outside the inspected memory/canonical mission path. Also inspect whether mission objective/dependency calculations over the pre-cap set create any additional semantic mismatch with the admitted eight-step set.

## DO-NOT-REPEAT
Do not call omitted claims failed.
Do not call them resolved.
Do not invent runId/sampleId.
Do not persist whole reports merely because provenance is missing.
Do not treat timestamps as unique observation identity.
