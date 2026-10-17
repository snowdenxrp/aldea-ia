# NCS Step 7 Continuation Addendum — M0.25–M0.26 — 2026-10-16

Repo: snowdenxrp/aldea-ia
Branch: ncs-clean-architecture
Status: STEP 7 OPEN / STOP / UNKNOWN; Constitution DRAFT / NOT FROZEN / NOT COMMISSIONED; protected effects STOP.

Use the latest main handoff for prior M0.1–M0.22 evidence:
https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_STEP_7_NEXT_CHAT_HANDOFF_LATEST_2026-10-16.md
Then use M0.23/M0.24:
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/STEP_7_CANONICAL_CONSTITUTION_REVIEW_COMPLETENESS_GATE_M0_23_2026-10-16.md
- https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/STEP_7_CANONICAL_REVIEW_BINDING_CROSSCHECK_M0_24_2026-10-16.md

## New work
- M0.25 Runtime Mutation Timing and Effect-Class Map:
  https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/STEP_7_RUNTIME_MUTATION_TIMING_EFFECT_CLASS_MAP_M0_25_2026-10-16.md
  Commit: 69e6c39cfe50b2c6a0677f8f632a14cb0ec619b4
- M0.26 Runtime Call-Site and Canonical Owner Gate:
  https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/STEP_7_RUNTIME_CALLSITE_CANONICAL_OWNER_GATE_M0_26_2026-10-16.md
  Commit: 885dcbfdf5400d75a74f3305e16c0b1e6655c5d1

## Material finding
The inspected runtime effect adapter mutates the supplied simulation in its handler before evaluating the postcondition. Its `prepared` journal is in memory unless a caller supplies a durable persistence callback. The current runtime path does not invoke the protected Core transition or canonical `persistState(expectedRevision)`.

The bounded call-site search found runtime definitions and test callers, but no current production caller that invokes `executeLuminaNexoStep()` while owning canonical state/revision and providing a durable prepared-intent checkpoint. Existing P112/AB continuity audits describe the canonical scripts as planning/persisting plans, not executing those plans through the runtime effect adapter. This agrees with prior evidence and does not require repeating those audits.

Do not wire execution into the canonical scripts yet. Doing so would choose the deployment/execution model before Step 7 grounds the trust root, initial constitutional scope, and final effect boundary.

## Next exact action
Design-only: distinguish planning, local simulation mutation, canonical persisted-state acceptance, and any actual external/protected effect. Identify the intended deployment target and first constitutional scope, then name the state owner and final effect-capable sink for that target. If those facts are not specified, preserve UNKNOWN/STOP. Do not use a review acknowledgement to justify mission-executor activation.

No code/tests/CI/device/key/signature/Constitution/owner review/commissioning/protected effect changed or exercised in M0.25–M0.26.
