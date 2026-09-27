# NEXO — AB104.589 — Ejecución del primer modelo TLA+/TLC

Date: 2026-09-27
Status: MODEL CREATED — TLC RUN BLOCKED BY ENVIRONMENT
Production implementation: NONE.

## Upstream tooling evidence
Official TLA+ documentation states that TLC is the explicit-state model checker and that the command-line tools require Java 11+. The documented invocation is `java -jar tla2tools.jar <Spec.tla>` or equivalent classpath execution. citeturn0search0turn2view0
The current upstream v1.8.0 release publishes `tla2tools.jar`; its release page identifies the artifact and checksum. citeturn1search0

## Repository artifacts created
- `docs/nexo/formal/NEXO_AB104_589_EFFECT_LIFECYCLE_BOUNDED.tla`
- `docs/nexo/formal/NEXO_AB104_589_EFFECT_LIFECYCLE_BOUNDED.cfg`

TLA file was corrected after an initial write exposed JavaScript escaping of TLA backslash operators. Corrected commit:
`41e85e78e569b42d26e3abb20760b828ea93c0d3`

Config creation commit:
`2078309b97d57078de7c39f257cdd147ff6cc922`

## Local environment test
Java is available:
`openjdk version "21.0.11"`

No local `tla2tools.jar` was present.

An attempted direct download from the documented upstream release URL failed before HTTP transfer because this environment cannot resolve `github.com`:
`curl: (6) Could not resolve host: github.com`

Therefore:
**TLC WAS NOT RUN.**
**No model-checking result is claimed.**
**No verification claim is made.**

## Intended run
`java -cp tla2tools.jar tla2sany.SANY docs/nexo/formal/NEXO_AB104_589_EFFECT_LIFECYCLE_BOUNDED.tla`

then

`java -cp tla2tools.jar tlc2.TLC -config docs/nexo/formal/NEXO_AB104_589_EFFECT_LIFECYCLE_BOUNDED.cfg docs/nexo/formal/NEXO_AB104_589_EFFECT_LIFECYCLE_BOUNDED.tla`

## Epistemic result
AB104.589 achieved the artifact boundary but NOT the execution boundary.

KNOWN:
- TLA+ model exists in canonical repo.
- TLC tooling/command is documented.
- Java 21 exists locally.
- No TLC binary was locally available.
- Network resolution prevented obtaining the upstream jar.

UNKNOWN:
- Whether this exact model parses under TLC.
- State count.
- Whether Safety has counterexamples.
- Any liveness result.

## Next exact step
AB104.590 — once TLC tooling is available, run SANY then TLC on this exact commit, preserve complete stdout/stderr, tool version, state count, and any counterexample trace. Do not modify the model before recording the first run result.