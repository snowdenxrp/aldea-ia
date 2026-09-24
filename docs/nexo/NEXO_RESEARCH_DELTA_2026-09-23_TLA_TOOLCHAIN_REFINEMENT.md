# Nexo Research Delta — TLA+ Toolchain / Refinement — 2026-09-23

## Scope

Research only. No new architectural step is being promoted from this pass.

## Findings

1. The TLA+ ecosystem documentation confirms TLC is an explicit-state model checker for finite/configured models, while SANY is the parser/semantic analyzer. A clean SANY/TLC result would therefore establish properties of the specified model instance, not automatically prove arbitrary implementation correctness.
2. The command-line tools require Java 11+ and `tla2tools.jar`; this is an explicit prerequisite before claiming actual model checking.
3. TLA+ abstract atomic actions are not by themselves an implementation linearizability proof. Concrete acquisition/revocation/release operations still require an implementation refinement argument to an atomic primitive or equivalent serialization mechanism.
4. NIST SP 800-193 frames platform resiliency around protection, detection and recovery, and emphasizes roots of trust and secure recovery. This reinforces the existing Nexo separation between safety/recovery trust and ordinary execution authority.
5. The research does not justify adding another architecture layer now. It only strengthens existing verification boundaries and the requirement to distinguish model checking from implementation verification.

## Consequences for current work

- Do not claim V20 or earlier canonical cores are SANY/TLC verified.
- Before model checking, verify the actual toolchain and module syntax, then use finite CFGs and record exact command/output.
- Keep linearization as an explicit refinement obligation: abstract clock/order is not equivalent to concrete distributed atomicity.
- Preserve independent recovery/safety trust from normal execution authority.

## Sources

- TLA+ Wiki / tools documentation
- TLA+ tools repository USE.md
- NIST SP 800-193 Platform Firmware Resiliency Guidelines

## Status

`RESEARCHED / CONTRASTED / NOT AN ARCHITECTURE PROMOTION`
