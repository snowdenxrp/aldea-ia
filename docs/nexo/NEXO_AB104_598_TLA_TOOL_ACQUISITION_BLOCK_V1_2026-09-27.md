# NEXO AB104.598 — pinned TLA+ artifact acquisition

Research:
- Official TLA+ documentation confirms tla2tools.jar contains SANY and TLC and requires Java 11+. citeturn0search1turn0search11
- Upstream v1.8.0 is a rolling pre-release; its published tla2tools.jar SHA-1 is 85b172970b0a1d283b9e45679b8ecf5b4de72ab2. citeturn0search3
- A build-specific immutable distribution documents build 2026.08.11.125311 with SHA-256 ab323b79802aedc3203b3f9af37c6aca3ed43f4e0225b36f2aa77b26de46c05f. This is a distribution/mirror, not the TLA+ Foundation trust root. citeturn0search0

Execution:
- Direct artifact acquisition was attempted from the build-specific route.
- Environment failed DNS resolution for github.com: curl exit status 6.
- Therefore the JAR bytes were NOT obtained and its SHA-256 was NOT locally verified.
- SANY was NOT run.
- TLC was NOT run.
- No verification claim is made.

Decision:
- Do not substitute an unpinned or unverifiable jar.
- Do not alter AB104.596 to make tooling appear successful.
- Preserve BLOCKED acquisition state.

Next exact step:
AB104.599 — inspect repository/tooling options for an already-available JAR or a connected artifact source. If none exists, formal execution remains BLOCKED until a verifiable artifact is supplied/reachable.