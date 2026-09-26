# NEXO AB104.347 — Minimum witness/archive coverage for non-omission

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 9162 defines Merkle consistency proofs for proving that a later tree extends an earlier tree, and notes that auditing can detect inconsistent log behavior. citeturn0search0turn0search4 The C2SP witness protocol has witnesses retain and verify a prior checkpoint before cosigning a new one; cosignatures can then provide independently verifiable evidence of consistency. citeturn0search1turn0search11

## Finding
For a Nexo retirement→reopen chain, a witness only contributes evidence against omission if its retained checkpoint **predates or covers the suspected predecessor boundary**. A witness beginning after that boundary cannot establish non-omission before it.

Minimum claim-specific coverage candidate:
`witness_set + covered_frontier_interval + predecessor_checkpoint + successor_checkpoint + consistency_proof + witness_dependency_domains + retention_horizon`

A quorum count alone is insufficient. Effective coverage requires that enough witnesses independently cover the relevant interval and do not share a common failure/authority/storage dependency that would defeat the claim. This follows the earlier AB104.320–321 distinction between cryptographic threshold and effective independent threshold.

Candidate outcomes:
`NON_OMISSION_CORROBORATED | COVERAGE_INSUFFICIENT | CORRELATED_WITNESSES | EQUIVOCATION | UNKNOWN | CONFLICT`.

## Invariants
`WITNESS_COUNT != COVERAGE`
`COVERAGE_AFTER_BOUNDARY != NON_OMISSION_PROOF`
`CRYPTOGRAPHIC_QUORUM != EFFECTIVE_INDEPENDENT_COVERAGE`
`EQUIVOCATION => CONFLICT/STOP`

## Status
Exact witness quorum, independence model and archival retention remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.348 — study common-mode analysis for witness/archive sets: derive the minimum independence domains needed for a claim instead of counting witnesses.
