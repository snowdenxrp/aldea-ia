# NEXO CONTINUITY — AB104.322

## Canonical state
AB104.322 research persisted. No implementation performed.

## Finding
Cryptographic validity does not imply freshness. RATS treats freshness as epoch/current-state policy and explicitly accounts for race conditions around transitions. citeturn0search2turn0search5

An old valid QC may remain historical evidence while no longer being sufficient for current execution after authority reconfiguration/revocation.

## Candidate distinction
`AUTHENTIC_QC != CURRENT_QC`
`CURRENT_QC != CURRENT_AUTHORIZATION`

Candidate binding: statement digest, validator configuration digest, authority epoch/view, transition/predecessor digest, commit/issuance frontier, freshness policy.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.323: study safe epoch/reconfiguration overlap and transition certificates, especially replay prevention and establishment of the new authority frontier.

## DO-NOT-REPEAT
Do not treat a still-valid signature as evidence that a certificate remains current authorization after an authority transition.
