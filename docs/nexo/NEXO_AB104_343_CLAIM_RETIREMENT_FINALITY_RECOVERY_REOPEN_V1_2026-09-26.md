# NEXO AB104.343 — Claim retirement/finality and reopening boundaries

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
Distributed recovery research permits garbage collection only when retained state is sufficient for every possible future recovery; recovery-line/reachability analysis is used to identify obsolete checkpoints. citeturn0search1turn0search2 The recoverable-state model forms a lattice, so “current” recovery state is meaningful only relative to the defined recovery space. citeturn0search4

## Finding
A Nexo claim cannot become GC-eligible merely because it is currently resolved. Retirement requires an authenticated **finality boundary** proving that no supported recovery/reconciliation path can reopen the claim, or that a retained summary completely preserves what any reopened path would need.

Candidate retirement record:
`claim_id + contract_version + final_state + finality_frontier + authority_epoch + target_incarnation + dependency_closure_digest + reopen_policy + successor/retirement_digest`

A later authority epoch, restore, reconciliation result, or newly discovered dependency may reopen the claim unless the retirement contract explicitly excludes that path. If reopening is possible but the underlying evidence has already been compacted, the claim becomes `UNKNOWN`, not permanently resolved.

## Candidate states
`OPEN | RESOLVED_NONFINAL | RETIRED_FINAL | REOPENED | UNKNOWN | CONFLICT`.

## Critical invariants
`RESOLVED != FINAL`
`FINAL != ERASED_HISTORY`
`RETIREMENT != CURRENT_AUTHORIZATION`
`POSSIBLE_REOPENING + MISSING_EVIDENCE => UNKNOWN`

## Status
Exact finality proof, reopen semantics, and implementation remain UNSELECTED. No formal verification performed.

## Next
AB104.344 — study retirement certificates and successor/reopen transitions: how a later event can invalidate a prior finality boundary without resurrecting deleted authority.
