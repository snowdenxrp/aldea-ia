# P112 MISSION CLAIM COMPRESSION / DEDUPLICATION AUDIT V1 — 2026-10-07

## Scope
Direct source audit of `src/nexo/orchestrator.js` against the newly classified finding provenance envelope.

## Major finding 1 — provenance is created, then compressed immediately
`collectFindings(reports)` copies every finding and injects `source: r.assistant`. Therefore producer provenance exists at the planner boundary.

`buildNexoMission()` then constructs a step carrying:
- action
- priority derived from severity
- reason derived from finding.message/code
- source
- target
- reversibility
- verification requirements
- dependency list
- for LUMINA_ACTION, concrete `context.action`

So the live mission still contains more provenance than previously visible from the durable serializer.

However, `recordNexoPlan()` later projects the step to only:
`id, action, target, status, dependsOn`.

Therefore the loss is a concrete **live-mission → durable-mission projection boundary**, not merely a vague “assistant report” loss.

## Major finding 2 — finding identity is not preserved and planner dedupes claims
The planner computes:
`key = action + "|" + target + "|" + finding.action.name`.

This means two distinct findings that map to the same action/target/action-name collapse into one mission step.

Examples of possible compression:
- repeated observations of the same target;
- multiple producer findings mapping to the same repair;
- distinct finding codes that map to the same action/target;
- multiple observations with different messages or evidence but identical action/target.

The key does NOT include:
- finding.code
- finding.source
- finding.message
- finding severity
- observation identity
- evidence
- freshness/sample boundary.

Therefore deduplication is not merely an execution optimization: it can erase claim provenance before any durable persistence occurs.

This is a stronger finding than the previous serializer-only gap.

## Major finding 3 — severity survives only indirectly
Severity is converted into `priority`. The original severity label is not preserved in the live step.

If future admission policy depends only on the numeric priority, that may be sufficient for that policy. But if severity semantics themselves matter for trust, escalation, or provenance, the original categorical claim is lost at the planner boundary.

Thus:
- priority = RE-DERIVABLE from severity only if severity itself remains available;
- original severity = MUST-PERSIST/bind if policy semantics depend on it;
- otherwise severity is NON-AUTHORITATIVE metadata.

## Major finding 4 — reason is explanatory unless it becomes causal
`reason` is populated from `finding.message ?? finding.code`.

Human-readable message is not automatically authoritative. The finding code is closer to the categorical claim, but even the code does not preserve the underlying observation that produced it.

Therefore the safe rule remains:
**code identifies the claim class; evidence/dependency inputs justify the claim.**

## Major finding 5 — planner-level summary fields are not evidence
The mission-level fields:
- `evidenceCount: reports.length`
- `observedAgentCount: simulation.agents.length`
- `uncertainty` derived from finding severity
- `memorySignals` containing array counts

are summaries. They should not be mistaken for the underlying claim evidence.

In particular, `evidenceCount` is literally report count, not evidence-item count.

## Major finding 6 — source provenance exists but is currently disposable
`collectFindings()` obtains `source` from the report assistant. The step preserves it live, but durable `recordNexoPlan()` discards it.

Therefore producer provenance is not absent from the architecture; it is **introduced correctly and then dropped**.

## Consequence for the final validator
The future protected-transition validator should not receive only:
`action + target + current snapshot`.

At minimum it must know which claim is being validated. Otherwise it cannot distinguish:
- “revalidate the same admitted claim”
from
- “invent a new justification for the same action.”

For ordinary deterministic repairs, the minimum claim identity likely includes:
`finding.code + target identity/incarnation + causal observation/evidence provenance`.

For aggregate/time/external observations, the envelope additionally needs the relevant dependency/freshness boundary.

For LUMINA_ACTION, the concrete action payload remains required if the path becomes live.

## Strong new insight
There are now TWO provenance compression boundaries:

1. **Finding → mission step**
   - deduplication can erase distinct claims before execution;
   - source/code/message/evidence are compressed into action/target/reason/priority.

2. **Live mission step → durable mission**
   - recordNexoPlan drops source/reason/context/verification metadata and other claim context.

So even repairing only durable mission serialization would not fully solve provenance loss. The planner itself can already discard claim distinctions.

## Status
🟢 Producer source provenance is present at planner input.
🟢 Live mission retains some provenance fields.
🟢 Concrete deduplication rule identified as a claim-compression boundary.
🟢 Two-stage provenance loss established.
🔵 Exact minimum claim identity still OPEN.
🔵 Need determine whether duplicate findings are semantically independent claims or intentionally equivalent observations; do not assume either.
🔴 No implementation.
🔴 No TLC rerun.
🔴 No JMM-HB/exactly-once/power-loss claim.

## Exact next
Audit the semantics of each deduplication collision class: determine when two findings with the same action/target are safely equivalent versus when they carry independent causal evidence. Then compare that result against the final-gate validator and durable reconstruction.

## DO-NOT-REPEAT
Do not treat action/target as a unique claim identity.
Do not treat planner deduplication as automatically safe.
Do not assume source provenance is missing at producer boundary; it is present and later discarded.
Do not fix only recordNexoPlan serialization without auditing planner compression first.
