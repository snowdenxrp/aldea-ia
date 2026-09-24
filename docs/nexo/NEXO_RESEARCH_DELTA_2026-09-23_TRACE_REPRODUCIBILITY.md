# Nexo Research Delta — trace reproducibility and counterexample preservation

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## External cross-check
TLA+ documentation confirms TLC can dump error traces in TLA and JSON formats, and the debugger can export traces in several machine-readable forms, including action traces. citeturn0search5turn0search3 The TLA+ debugging guidance also recommends eliminating randomness for reproducibility by recording options such as fingerprint and seed. citeturn0search9 Trace Validation maps recorded implementation states to specification states but is explicitly non-exhaustive. citeturn0search0

## New conclusions
1. A formal counterexample should be treated as a reproducible test artifact, not only as console output.
2. The artifact should bind the exact spec/config hashes, tool version/runtime, constants, relevant TLC options, random seed/fingerprint settings where applicable, property/invariant name, and complete trace.
3. If a counterexample is converted into a runtime regression test, the test must retain a link to its originating formal trace rather than becoming an anonymous test case.
4. Runtime traces should preserve enough identity/epoch/fence information to determine whether the same semantic scenario was reproduced.
5. A trace replay that differs from the formal trace may still be valid if it represents the same mapped abstract behavior; this must be established by the refinement/trace mapping, not by textual similarity.
6. The eventual evidence chain should therefore be content-addressed and linked: `MODEL + CONFIG + TRACE → SCENARIO → RUNTIME TRACE → VALIDATION RESULT`.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
