# Nexo Research Delta — TLC/Apalache complementary evidence

Date: 2026-09-23

## Scope
Research-only continuation. No V21 implementation or architectural redirection.

## Cross-check
TLC is an explicit-state model checker; its normal workflow explores reachable states of a configured finite model. citeturn0search11turn0search14 Apalache uses symbolic checking via SMT rather than enumerating states one by one; its documentation describes bounded model checking, randomized symbolic execution, and inductiveness checking as distinct analysis modes. citeturn0search2turn0search3 Apalache also supports safety, action invariants, temporal properties, trace invariants and inductive invariants, subject to its supported-feature and finiteness assumptions. citeturn0search1

## New conclusions
1. TLC and Apalache should be treated as complementary evidence generators, not interchangeable proof labels.
2. A future Nexo verification record should identify the checker and analysis mode explicitly: `TLC_EXPLICIT_STATE`, `APALACHE_BOUNDED`, `APALACHE_INDUCTIVE`, etc.
3. A bounded symbolic result must retain its bound; an inductive result has a different scope and should not be collapsed into the same evidence class.
4. Agreement between independent checking techniques can be useful corroboration, but it does not automatically establish implementation correctness or independence: both operate on the same formal specification unless a distinct model is supplied.
5. Apalache's parser/type-checking path can also be useful as an additional static gate, but successful parsing/type checking is not a model-checking result. Its documentation explicitly separates parsing from subsequent checking. citeturn0search12
6. Therefore the evidence vocabulary should preserve at least `TOOL`, `MODE`, `SCOPE/BOUND`, `SPEC_HASH`, `CFG_OR_COMMAND`, `RESULT`, and `TRACE_OR_CERTIFICATE_REFERENCE`.

## Important non-conclusion
This research does not justify replacing TLC with Apalache, adding a second checker immediately, or changing V21. It only closes a verification-design question for the future evidence chain.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
