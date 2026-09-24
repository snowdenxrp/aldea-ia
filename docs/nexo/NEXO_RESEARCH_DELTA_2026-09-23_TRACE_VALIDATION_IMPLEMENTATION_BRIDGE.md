# Nexo Research Delta — trace validation as implementation bridge

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Research finding
TLA+ documentation describes Trace Validation as mapping recorded implementation states to TLA+ specification states. It can check whether selected real executions align with the specification and can also be used to drive implementation testing, but it is explicitly not exhaustive: it covers the executions supplied to it rather than all possible implementation behaviors. citeturn0search4

## New conclusion
This gives Nexo a useful verification boundary between formal refinement and runtime testing:

`ABSTRACT MODEL → CONCRETE MODEL → TRACE VALIDATION → RUNTIME EVIDENCE`

Trace validation must not be mislabeled as exhaustive implementation verification. Its value is complementary: TLC explores the configured finite model; trace validation checks selected real implementation executions against the formal specification.

## Nexo implications
1. Future runtime tests should emit a canonical trace vocabulary that can be mapped to the abstract state machine.
2. Critical events should preserve operation/effect identity, target fingerprint, authority epoch, lease owner/generation, stop epoch/fence, evidence identity/version and commit/revoke ordering where observable.
3. A runtime trace that cannot be mapped unambiguously is itself a valuable discrepancy finding, not something to normalize away.
4. Formal counterexamples can potentially be translated into implementation test scenarios, creating a feedback loop between model checking and runtime testing. The TLA+ trace-validation documentation explicitly notes this workflow. citeturn0search4
5. The eventual evidence package should distinguish `MODEL_EXHAUSTIVE_FOR_CONFIGURED_FINITE_INSTANCE` from `RUNTIME_TRACE_VALIDATED_SUBSET`.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
