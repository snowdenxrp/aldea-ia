# NEXO CONTINUITY — AB104.355

AB104.355 persisted. Research only; no implementation.

## Finding
Trust-anchor recovery must preserve an authenticated authority frontier, not merely restore a set of keys. RFC 6024 requires replay detection because old management transactions can reintroduce compromised anchors; RFC 9334 warns that delayed/reordered epochs can make old evidence appear fresh. citeturn0search0turn0search1turn0search3

Candidate recovery tuple:
`store_id + store_incarnation + store_version/frontier + active_anchor_set_digest + authority_epoch + manager_config_digest + predecessor_transition_digest + revocation/supersession_coverage + semantic_version`

Anti-resurrection:
`RECOVERED_STORE < AUTHORITY_FRONTIER => ROLLBACK_REJECTED`

Missing authenticated frontier/transition => `UNKNOWN/STOP`.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.356 — study the bootstrap problem: authenticating a new trust-anchor frontier when the old store may itself be compromised or rolled back.

## DO-NOT-REPEAT
Do not treat restored key validity or an old signed management transaction as proof of current trust-store authority.
