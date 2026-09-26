# NEXO CONTINUITY — AB104.346

AB104.346 persisted. Research only; no implementation.

## Finding
RFC 9162 provides Merkle inclusion/consistency proofs and auditing for append-only logs; witnesses can independently verify consistency and expose split views. citeturn0search0turn0search1turn0search5

For Nexo successor/reopen chains, witnesses strengthen **lineage continuity and omission detection**, but do not prove semantic truth or complete history. A witness that begins after the suspected gap cannot prove that no predecessor was omitted.

Candidate outcomes: `LINEAGE_CORROBORATED | EQUIVOCATION_DETECTED | WITNESS_CORRELATED | COVERAGE_INSUFFICIENT | UNKNOWN | CONFLICT`.

## Invariants
`WITNESS_CORROBORATION != SEMANTIC_TRUTH`
`CONSISTENCY_PROOF != COMPLETENESS_PROOF`
`WITNESS_AFTER_GAP != PROOF_NO_OMISSION`
`EQUIVOCATION_DETECTED => CONFLICT/STOP`

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.347 — study minimum witness/archive coverage for proving non-omission and correlated witnesses.

## DO-NOT-REPEAT
Never treat a witness signature as proof that the entire predecessor history is complete.
