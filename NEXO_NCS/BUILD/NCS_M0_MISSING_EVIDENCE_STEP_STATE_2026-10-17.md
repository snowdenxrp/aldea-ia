# NCS M0 — Keep mission step blocked when completion lacks verified evidence

Date: 2026-10-17
Branch: `ncs-clean-architecture`

## Concrete defect

`advanceNexoMission()` rejected a requested `completed` outcome when evidence was missing or structurally unacceptable, but only changed the mission-level status to `blocked`. The target step remained `executing` and lacked a step-level block reason. That left the mission internally contradictory and made the specific failure hard to preserve or explain.

## Correction

- The target step now transitions to `blocked`.
- Both step and mission carry `MISSING_VERIFIED_EVIDENCE`.
- The mission objective becomes `replan_from_constraints`.
- The regression confirms `planNexoExecution()` emits no actions from the blocked mission.

This does **not** establish evidence provenance or truth. The current `evidenceAcceptable()` contract checks only a self-reported `verified === true` and a nonblank `kind`; it is not a trusted verifier or authority proof.

## Evidence

- Source commit: [`ec20889`](https://github.com/snowdenxrp/aldea-ia/commit/ec20889da48e57c895b8273d57d2c68ec5027471)
- Regression test commit: [`f27147f`](https://github.com/snowdenxrp/aldea-ia/commit/f27147f0a273d28ad8168a9f29e9c0ab06e24713)
- Focused mission admission/continuity CI: [run 39081098250](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098250) — success
- M0 Core CI: [run 39081098279](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098279) — success
- STEP 4 semantic validation CI: [run 39081098274](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098274) — success
- STEP 5 outcome classification CI: [run 39081098277](https://github.com/snowdenxrp/aldea-ia/actions/runs/39081098277) — success

## M0 meaning and boundary

M0 is the minimum functional Nexo Core, not an endless sequence of defensive patches and not a proxy for finishing constitutional authority. Continue building observation → reasoning/planning → memory/continuity → outcome/learning capabilities with honest uncertainty and testable behavior. Fix contract defects when demonstrated, but do not inflate progress with cosmetic increments.

The Proxy-trap trust boundary remains unresolved. STEP 7 remains `OPEN / STOP / UNKNOWN`; protected effects remain STOP. This increment does not wire the legacy runtime to protected transitions or authorize any effects.
