# NEXO AB104.322 — Certificate freshness across authority epochs

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Freshness is not equivalent to signature validity. RATS explicitly treats freshness as a policy question tied to the epoch/current state and notes race conditions during state or policy changes. Epoch-based freshness can require remembering transition windows and handling replay, delay, and reordering. citeturn0search2turn0search5

For Nexo, an old valid QC can remain useful as historical protocol evidence while becoming insufficient for current execution after authority reconfiguration, revocation, or epoch transition. The certificate must therefore bind the authority configuration/epoch under which it was produced and recovery must compare that against the current trusted authority frontier.

## Boundary
`AUTHENTIC_QC != CURRENT_QC`
`CURRENT_QC != CURRENT_AUTHORIZATION`

A valid historical certificate is not resurrected into executable authority merely because its signatures remain cryptographically valid.

## Candidate freshness tuple
`statement_digest + validator_config_digest + authority_epoch/view + predecessor/transition_digest + issuance/commit frontier + freshness policy`

If current epoch/config lineage cannot be established, classify the certificate as historical-only or UNKNOWN rather than current authorization.

## Candidate states
`CURRENTLY_FRESH | HISTORICAL_VALID | STALE_AUTHORITY | RECONFIG_UNKNOWN | CONFLICT`

No final freshness window or reconfiguration protocol selected.

## Next
AB104.323 — study epoch/reconfiguration overlap: determine safe handling of certificates spanning a transition and whether a transition certificate can establish the new authority frontier without creating a replay path.
