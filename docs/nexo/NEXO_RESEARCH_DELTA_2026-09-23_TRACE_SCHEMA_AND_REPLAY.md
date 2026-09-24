# Nexo Research Delta — trace schema and replay discipline

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Research findings
1. TLA+ Trace Validation maps recorded implementation states to specification states and is explicitly non-exhaustive; it is best treated as a complementary evidence layer. citeturn0search0
2. Current TLA+/Apalache tooling also provides machine-readable trace formats. Apalache's Informal Trace Format (ITF) represents metadata, variables, states and optional loops in JSON and is intended for tool integration. citeturn0search1
3. TLC can dump error traces in machine-readable formats including JSON, which makes counterexample preservation and automated test generation practical. citeturn0search16
4. The TLA+ tooling documentation shows that traces preserve action/state information useful for diagnosing the exact transition that produced a result. citeturn0search15

## Nexo conclusions
1. The eventual runtime trace schema should be canonical and versioned rather than ad-hoc log text.
2. A trace event should preserve at minimum: trace_id, sequence/causal position, timestamp/clock domain, operation_id, effect_id, target fingerprint, action/event type, authority epoch, relevant lease owner+generation, stop fence/epoch, evidence identity/version, policy/graph versions, and provenance where available.
3. Trace normalization must never erase an ambiguity. If two events cannot be causally ordered, the trace should encode that uncertainty rather than inventing an order.
4. Formal counterexamples should be convertible into the same scenario vocabulary used by runtime tests, allowing model-to-runtime replay without pretending that replay is exhaustive.
5. A future replay harness should report `MATCHED`, `MISMATCHED`, or `UNMAPPABLE`, with the exact mapping reason and preserved source trace.
6. This creates a disciplined evidence chain: `TLC/APALACHE COUNTEREXAMPLE → TEST SCENARIO → RUNTIME TRACE → TRACE VALIDATION → DISCREPANCY/CONFIRMATION`.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
