# NEXO CONTINUITY — AB104.351

AB104.351 persisted. Research only; no implementation.

## Finding
RATS permits layered/cross attestation and explicitly models trust relationships and trust anchors, but the trust graph still depends on configured appraisal policy and roots. citeturn0search0turn0search8 Current RATS Endorsements work keeps evidence, endorsements/reference values, and authoritative appraisal policy distinct. citeturn0search1turn0search11

Cross-attestation does not automatically create independence. If A authenticates B while B's independence claim ultimately depends on A, the graph is circular for that claim.

Candidate states: `ACYCLICALLY_CORROBORATED | CIRCULAR_DEPENDENCY | SHARED_ROOT | UNKNOWN | CONFLICT`.

## Invariants
`CROSS_ATTESTATION != AUTOMATIC_INDEPENDENCE`
`AUTHENTIC_SIGNATURE != ACYCLIC_SUPPORT`
`DEPENDENCY_CYCLE => INDEPENDENCE_UNKNOWN` unless policy explicitly trusts the shared root.
`SHARED_ROOT != INDEPENDENT_ROOTS`

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.352 — study authenticated dependency-graph closure and the completeness problem.

## DO-NOT-REPEAT
Never treat mutually signing/attesting witnesses as independent when their support graph ultimately depends on the same root.
