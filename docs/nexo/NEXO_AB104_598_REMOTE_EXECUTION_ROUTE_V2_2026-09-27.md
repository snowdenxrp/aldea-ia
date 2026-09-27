# NEXO AB104.598 — Remote execution route established

Problem:
Local environment cannot resolve github.com, so the pinned TLA+ JAR cannot be downloaded locally.

Solution implemented:
- Added .github/workflows/nexo-ab104-598-sany.yml
- Commit: 830c2839f20de333f0a64ba6d5459122dd71bbee
- GitHub Actions runner downloads the immutable build-specific tla2tools.jar:
  https://github.com/zactionsz/tla-tools/releases/download/tla2tools-2026.08.11.125311/tla2tools.jar
- Verifies SHA-256:
  ab323b79802aedc3203b3f9af37c6aca3ed43f4e0225b36f2aa77b26de46c05f
- Uses Java 21.
- Runs SANY against exactly:
  docs/nexo/formal/NEXO_AB104_596_EFFECT_LIFECYCLE.tla
- Captures SANY output as workflow artifact.
- No unpinned tool substitution.

Current evidence:
- Workflow definition is committed.
- The available GitHub workflow-run connector only exposes PR-triggered runs, so it cannot currently establish that this push-triggered run completed.
- Therefore SANY status remains UNKNOWN until runner logs/artifact are retrieved.
- No verification claim.

Next:
AB104.599 — obtain the push-triggered run/job evidence through an available GitHub Actions endpoint/tool. If unavailable, preserve the workflow as the reproducible execution mechanism and do not mark SANY verified.