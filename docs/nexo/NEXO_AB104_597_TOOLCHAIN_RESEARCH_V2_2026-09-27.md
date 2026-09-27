# NEXO AB104.597 — Toolchain research update

Date: 2026-09-27

Official TLA+ evidence:
- TLA+ CLI tools require Java 11+ and the release artifact `tla2tools.jar` contains SANY and TLC.
- Official release page identifies v1.8.0 "Clarke" and publishes the tla2tools.jar SHA-1: 85b172970b0a1d283b9e45679b8ecf5b4de72ab2.
- The upstream v1.8.0 channel is a rolling pre-release; therefore a build-specific immutable artifact is preferable for reproducibility.

Candidate immutable pin found during research:
- Build: 2026.08.11.125311
- Artifact: tla2tools.jar
- SHA-256: ab323b79802aedc3203b3f9af37c6aca3ed43f4e0225b36f2aa77b26de46c05f
- This candidate was documented as an immutable mirror of the upstream build. It is NOT yet locally verified.

Execution attempt:
- Container download of the candidate artifact failed at DNS resolution (Temporary failure in name resolution).
- Therefore no local jar bytes, no local SHA-256 verification, and NO SANY/TLC execution.
- Existing Java evidence remains OpenJDK 21.0.11.

Important correction:
- AB104.597 pre-execution regex check reported the `Spec == Init /\/` pattern as false because the audit regex itself was not escaped for the TLA operator. This does NOT establish a model defect. The direct operator-count checks and prior byte audit remain the relevant evidence.

Next exact step:
AB104.598 — obtain the pinned jar through an actually reachable artifact route or available tool attachment, verify SHA-256 against the pinned digest, then execute SANY only. If acquisition remains blocked, preserve BLOCKED status; do not substitute an unpinned jar silently.
