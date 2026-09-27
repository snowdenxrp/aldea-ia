# NEXO AB104.593 — SANY gate preparation

Date: 2026-09-27
Status: PRE-RUN TOOLCHAIN GATE

Official TLA+ tooling documentation states that tla2tools.jar contains SANY and TLC, requires Java 11+, and supports command-line invocation. The official repository currently publishes 1.8.0 Clarke pre-release builds; release assets expose a checksum for tla2tools.jar. This is useful provenance, but AB104 requires a pinned artifact digest and exact captured output before verification.

Environment constraint: previous inspection found Java 21 but no local tla2tools.jar, and direct GitHub download failed due DNS/network resolution. Therefore no SANY execution has been performed.

Gate: SANY must successfully parse the corrected artifact before TLC. If SANY fails, repair and re-audit; no TLC claim is allowed.

The corrected design must be tested by the actual pinned SANY version; static reasoning is insufficient for syntax acceptance.

Evidence requirements:
1. exact tla2tools.jar bytes
2. SHA-256
3. Java version
4. corrected TLA source commit
5. corrected CFG commit
6. SANY command
7. complete stdout/stderr
8. exit code
9. proof that tool execution did not mutate the source

Conclusion: AB104.593 is a tooling/provenance gate, not a verification result.

Next exact step: acquire/pin tla2tools.jar reproducibly, then run SANY only. TLC remains blocked until SANY succeeds.