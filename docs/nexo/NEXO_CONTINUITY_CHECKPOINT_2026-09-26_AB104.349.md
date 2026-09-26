# NEXO CONTINUITY — AB104.349

AB104.349 persisted. Research only; no implementation.

## Finding
C2SP supports explicit witness groups and quorum composition, so policy can require coverage across distinct groups rather than relying on raw witness count. citeturn0search1 RFC 9162 separates append-only consistency from consistency of views across query sources. citeturn0search0turn0search2

Nexo should model independence as a **claim-specific predicate**, not a scalar security score. A claim declares required failure domains and coverage; admissibility is evaluated structurally.

Candidate requirement: `claim_id + required_domains + forbidden_shared_domains + minimum_coverage_interval + quorum_rule`.

Candidate outcomes: `SATISFIED | CORRELATED | INSUFFICIENT_COVERAGE | UNKNOWN | CONFLICT`.

## Invariants
`INDEPENDENCE_PREDICATE != SECURITY_SCORE`
`POLICY_SATISFIED != REAL_WORLD_INDEPENDENCE_PROVEN`
`WITNESS_QUORUM != CLAIM_TRUTH`

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.350 — authenticate independence-domain metadata without relying on one operator's self-attestation.

## DO-NOT-REPEAT
Do not turn witness independence into a numeric score or treat policy membership as proof of real-world independence.
