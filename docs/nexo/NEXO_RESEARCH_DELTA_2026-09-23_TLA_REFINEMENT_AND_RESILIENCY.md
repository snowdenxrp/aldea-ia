# Nexo Research Delta — TLA+ refinement and resiliency cross-check

Date: 2026-09-23

## Scope
Research-only continuation within the existing durability/formal-verification direction. No new architectural stage was promoted.

## External cross-checks
- TLA+ documentation confirms TLC is an explicit-state model checker for configured TLA+ specifications, particularly finite models. Results apply to the configured model and properties, not automatically to arbitrary implementations.
- TLA+ tooling documentation confirms SANY is the semantic-analysis/parsing stage and TLC is the model-checking stage. A future verification claim must record the actual tool version, Java/runtime, spec, configuration, command and output.
- TLC configuration requires an explicit SPECIFICATION entry; invariants/properties are selected in the model configuration.
- NIST SP 800-193 frames platform resiliency around Protection, Detection and Recovery and emphasizes a strong security foundation/roots of trust. This supports the existing separation between normal execution authority and safety/recovery trust.

## Engineering conclusions
1. Do not treat a TLA+ atomic action as proof of concrete implementation linearizability. The implementation still needs an atomic primitive or equivalent serialization boundary.
2. The canonical model should be finite and executable before adding more invariants; otherwise failures can be syntactic/structural rather than meaningful semantic counterexamples.
3. Verification evidence must be reproducible: exact toolchain, configuration, model constants, invariants/properties and output must be recorded.
4. Safety/recovery trust should remain structurally separated from normal execution authority; this is consistent with the resilience architecture cross-check.
5. No architectural redirection is justified by this pass. These findings reinforce the already agreed verification path.

## Status
`RESEARCHED / CONTRASTED / SAVED / NO NEW ARCHITECTURAL STEP`
