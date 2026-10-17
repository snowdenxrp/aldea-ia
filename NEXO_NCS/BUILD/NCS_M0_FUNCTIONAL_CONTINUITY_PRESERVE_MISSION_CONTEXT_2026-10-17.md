# NCS — M0 Functional Continuity: Preserve Mission Context Across Restart

Date: 2026-10-17  
Branch: `ncs-clean-architecture`  
Implementation commit: `f7828d1e0f11f81e03106af9a50f914d99c87b1c`  
Status: implemented; STEP 4 and STEP 5 focused CI successful. Runtime test coverage should still be distinguished from the workflow checks listed below.

## Why this change

The existing durable mission record kept only step `id`, `action`, `target`, `status`, and `dependsOn`. That meant a reconstructed mission could lose admission-time details such as the reason/source, reversibility and verification requirements, and action context. In particular, `execute_lumina_action` context could disappear after reconstruction.

This is a bounded functional-continuity change based on the previously recorded P112 finding; it does not reopen that historical audit.

## Change

`recordNexoPlan()` now persists these optional step fields when present:
- `priority`, `reason`, `source`
- `reversible`, `requiresEvidence`, `requiresVerification`
- detached `context`

It also preserves plan-level `uncertainty`, `evidenceCount`, and `observedAgentCount`. Existing fields and reconstruction rules remain in place. Context is cloned when recorded so later mutation of the live mission does not mutate the saved memory snapshot.

## Regression added

`tests/nexo/restart-reconstruction.test.mjs` now verifies:
- the listed step metadata and context survive record → reconstruct;
- plan-level uncertainty/count fields survive reconstruction;
- mutating the original live mission context after recording does not mutate stored continuity data.

## Evidence and limits

- Source/test commit: [`f7828d1`](https://github.com/snowdenxrp/aldea-ia/commit/f7828d1e0f11f81e03106af9a50f914d99c87b1c)
- STEP 4 semantic validation CI: [run 39079693260](https://github.com/snowdenxrp/aldea-ia/actions/runs/39079693260) — success.
- STEP 5 outcome classification CI: [run 39079693214](https://github.com/snowdenxrp/aldea-ia/actions/runs/39079693214) — success.

The two workflow successes do not by themselves prove that every restart scenario or the entire repository test suite passed. The added regression is committed; a workflow explicitly executing `tests/nexo/restart-reconstruction.test.mjs` must be checked before claiming that exact test ran in CI.

This is mission continuity data, not authority evidence. It does not authenticate the plan source, prove that an action occurred, close the external effect boundary, or change STEP 7. STEP 7 remains OPEN / STOP / UNKNOWN; protected effects remain STOP.
