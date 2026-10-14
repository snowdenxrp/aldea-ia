# STEP 7 — Scope A minimum architecture decision frontier

Date: 2026-10-14  
Branch: `ncs-clean-architecture`  
Status: DESIGN ONLY / NO IMPLEMENTATION / OWNER SCOPE A INTENT ACCEPTED

## Purpose

Identify the smallest architecture choice that remains after the bounded source inspection found no suitable existing local Nexo persistence owner. This is not another broad source audit, not a Constitution decision, and not authorization to create a generic store.

## Established facts

1. Scope A is accepted as a work objective only: record/report the identity/reference of a specifically reviewed constitutional candidate while its legitimacy and currentness remain unestablished.
2. No suitable existing Nexo-local durable owner for that record was evidenced in the inspected paths.
3. The simulation snapshot `world-state.json` is the wrong semantic owner and has fallback-to-default behavior. Do not attach the reference to it.
4. In-memory mission/outcome data and the effect journal are not durable constitutional-reference owners.
5. The Core protected-transition skeleton does not implement this operation. The uncalled `effectBoundary.prepare` port is not an acceptable superficial insertion point.
6. No Android Core host is selected. Javet Node mode is a runtime-semantics research lead only; Android sandbox support is disabled, and Node Permission Model is not a security boundary against malicious/substituted Core code.
7. The constitutional candidate is still a mutable draft, not canonical or current. Git path/blob is only a repository locator.
8. The complete draft was retrieved and presented in the conversation as a draft-review candidate, but no owner confirmation of having reviewed it has yet been recorded. Do not invent a completed review event.

## Architecture options

### Option 0 — Repository-only review locator

Use repository metadata only to prepare and discuss a candidate review. Do not claim that Nexo running locally can persist/report the reference.

- **Advantages:** no new runtime write path; no new local authority semantics; no risk of coupling to mission/effect state.
- **Limits:** does not fulfill the eventual local runtime behavior in the accepted Scope A claim; remains preparation/documentation, not an implemented Nexo feature.
- **Permitted now:** yes, for review preparation and evidence tracking only.

### Option 1 — Dedicated non-authoritative local reference owner

After the runtime host and its security boundary are selected, introduce one narrowly scoped Nexo-owned component whose only semantic responsibility is to store/report a candidate-review reference. Its host-specific persistence must be explicit and must not be disguised as a generic store, simulation state, mission memory or effect journal.

Before implementation, the design must establish:
- the real caller/entry point and its authorization-independent, no-effect semantics;
- a host-specific persistence contract and atomicity/conflict behavior;
- explicit distinction among no record, malformed/corrupt record, stale/moved candidate, conflicting record, confirmed write, failed write and uncertain commit;
- a content/scope-bound review event that cannot be marked complete unless the exact complete presentation and the owner's narrow decision are evidenced;
- a read path that only reports reference metadata and cannot feed an authority gate or mission/effect planner as authorization;
- the actual call graph and tests/evidence showing that read/write cannot reach `executeAction()`, mission execution, protected mutation or external effects;
- threat-model coverage for tampering, rollback, substitution, restore/backup, app reinstall, concurrent writes and malicious/substituted runtime code;
- an explicit rule that storage integrity or successful persistence does not establish legitimacy, canonical status or currentness.

This option is the likely eventual shape if a safe host can be established, but **it is not selected for implementation now**. No component name, API, generic storage abstraction or commit primitive should be invented before the actual host and write boundary are demonstrated.

### Rejected option — Reuse simulation state or a mission/effect journal

Do not add the reference to `world-state.json`, simulation adapter state, `src/assistants/memory.js`, runtime outcome memory, effect journal, orchestrator or `executeAction()`. These have the wrong semantic ownership or do not provide the required durable/no-effect boundary. Reusing them would conflate review metadata with simulation/mission/effect state and would not close the missing host-security problem.

## Decision

**Do not implement Scope A yet.** The owner accepted Scope A as design intent, not a particular storage/host architecture. Option 0 remains the only permitted activity for the review locator until the host decision is justified. Option 1 is a candidate architecture shape, conditional on a demonstrated host security boundary and a concrete write/no-effect boundary. The simulation-state option is rejected.

The next technical work should be limited to a host threat-model decision: specify what adversary the local reference record must resist and what trust is placed in the Android OS/app/runtime. The existing Javet lead cannot be described as isolating malicious Core code. If the threat model requires that protection, either identify and prove an independent enforcement boundary or retain STOP; do not compensate with Node permission flags or more app-side patches.

After the host question is resolved, return to the actual source call graph once—not a broad repository sweep—to design the single minimal reference path and its negative tests. If no host satisfies the required boundary, report the incompatibility and leave the feature unimplemented.

## Explicitly not decided or authorized

- No Constitution ratification/freeze/canonicalization/digest/signature/key/recognition ceremony/commissioning.
- No Constitution Authority Context, mission authorization, protected effect or deployment.
- No choice of Android runtime/host.
- No new generic store, second commit primitive, simulation snapshot reuse or uncalled-port patch.
- No completed owner-review event unless the owner explicitly confirms the draft was reviewed.
- No tests claimed and no source code changed.

**STEP 7 remains OPEN / STOP / UNKNOWN. No protected effects authorized.**
