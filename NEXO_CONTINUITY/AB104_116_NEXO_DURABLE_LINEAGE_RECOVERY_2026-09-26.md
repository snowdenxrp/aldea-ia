# AB104.116 — Nexo durable lineage + recovered execution — 2026-09-26

Previous: AB104.115.
Latest implementation: 2f2ae2060a13f043748a5093c1d32f8d2a2bf2b6.

Root issue found during continuation:
- Mission lineage existed on the mission object, but durable Nexo outcome records did not explicitly persist parentMissionId/replanReason.
- Corrected memory schema and runtime outcome recording.
- The correction uses explicit function parameters; no inferred metadata.

Added regression:
- Executes the replan after water is restored.
- Verifies real action completion and postcondition evidence.
- Verifies durable attempt contains the replan lineage.

Verification:
- New code has not yet received a fresh CI result in this checkpoint.
- Historical failures remain untouched.

Next exact action:
1. Verify fresh CI on the latest tree.
2. Inspect any failure before further changes.
3. If clean, continue audit of mission persistence/restart boundaries and ensure mission records themselves retain lineage.
