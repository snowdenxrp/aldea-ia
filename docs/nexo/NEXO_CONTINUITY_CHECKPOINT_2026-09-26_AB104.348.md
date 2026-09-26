# NEXO CONTINUITY — AB104.348

AB104.348 persisted. Research only; no implementation.

## Finding
Witness quorum policies can explicitly group witnesses rather than treating raw count as sufficient. citeturn0search5 Witnesses validate new checkpoints against retained prior state, while RFC 9162 distinguishes append-only consistency from global view consistency. citeturn0search1turn0search6

Nexo independence must be claim-specific and evaluated across relevant failure domains: operator, authority, acquisition, upstream, software, storage, physical/site, credentials, and restore dependencies.

Candidate outcomes: `INDEPENDENCE_SUFFICIENT | INDEPENDENCE_CORRELATED | COMMON_MODE | COVERAGE_INSUFFICIENT | UNKNOWN | CONFLICT`.

## Invariants
`WITNESS_COUNT != EFFECTIVE_INDEPENDENCE`
`MULTIPLE_KEYS != MULTIPLE_FAILURE_DOMAINS`
`INDEPENDENCE_FOR_CLAIM_A != INDEPENDENCE_FOR_CLAIM_B`

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.349 — encode claim-specific independence requirements without scalar security scores; study quorum rejection of correlated witness sets.

## DO-NOT-REPEAT
Never equate more signatures with more independent evidence.
