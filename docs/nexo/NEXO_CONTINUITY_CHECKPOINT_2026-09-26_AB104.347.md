# NEXO CONTINUITY — AB104.347

AB104.347 persisted. Research only; no implementation.

## Finding
Merkle consistency proofs establish append-only extension between covered checkpoints. citeturn0search0turn0search4 Witnesses retain prior checkpoints and verify consistency before cosigning newer checkpoints. citeturn0search1turn0search11

For Nexo, a witness can support non-omission only when its retained checkpoint covers the suspected predecessor boundary. A witness that starts after the boundary cannot prove absence of an earlier omitted link.

Quorum count is not enough: effective coverage depends on interval coverage and independence domains. Candidate outcomes: `NON_OMISSION_CORROBORATED | COVERAGE_INSUFFICIENT | CORRELATED_WITNESSES | EQUIVOCATION | UNKNOWN | CONFLICT`.

## Invariants
`WITNESS_COUNT != COVERAGE`
`COVERAGE_AFTER_BOUNDARY != NON_OMISSION_PROOF`
`CRYPTOGRAPHIC_QUORUM != EFFECTIVE_INDEPENDENT_COVERAGE`
`EQUIVOCATION => CONFLICT/STOP`

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.348 — study common-mode analysis for witness/archive sets and derive independence domains rather than witness count.

## DO-NOT-REPEAT
Never claim non-omission from witnesses whose retained history begins after the disputed boundary.
