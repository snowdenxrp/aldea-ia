# NEXO AB104.355 — Trust-anchor rollback/recovery anti-resurrection V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 6024 explicitly requires trust-anchor management to detect replay because replayed old management transactions can reintroduce compromised trust anchors; it also calls for compromise/disaster recovery without simply reinitializing the trust store. citeturn0search0turn0search2 RFC 9334 requires trust-anchor stores to resist unauthorized modification and emphasizes that delayed/reordered epoch information can make past evidence appear fresh. citeturn0search1turn0search3 The 2026 Epoch Markers draft likewise identifies receiver state and explicit sequencing/rollback acceptance policy as necessary when epoch markers can be reordered. citeturn0search5

## Finding
A recoverable trust-anchor store needs more than the current set of keys. The minimum executable recovery state must preserve an authenticated **authority frontier** that prevents an older store/version from becoming current again.

Candidate recovery tuple:
`store_id + store_incarnation + store_version/frontier + active_anchor_set_digest + authority_epoch + manager_config_digest + predecessor_transition_digest + revocation/supersession_coverage + semantic_version`

Candidate recovery states:
`CURRENT_SAFE | STALE_STORE | TRANSITION_REQUIRED | REVOCATION_GAP | ROLLBACK_REJECTED | UNKNOWN | CONFLICT`

## Anti-resurrection rule
If recovered store state is older than the authenticated authority frontier, it cannot authorize execution merely because its anchors and signatures remain cryptographically valid.

`RECOVERED_STORE < AUTHORITY_FRONTIER => ROLLBACK_REJECTED`

If the frontier/transition history cannot be authenticated:
`CURRENT_AUTHORITY = UNKNOWN/STOP`

Recovery may establish a new store incarnation/authority epoch, but that transition itself must be authenticated by authority that remains valid independently of the rolled-back store.

## Key distinction
`VALID_SIGNATURE != CURRENT_TRUST_STORE`
`VALID_OLD_STORE != CURRENT_AUTHORITY`
`ROLLBACK_DETECTED != PROOF_OF_NONREVOCATION`

RFC 6024's replay requirement directly supports treating old trust-anchor management transactions as potentially dangerous recovery inputs rather than as authoritative current state. citeturn0search2

## Status
Exact persistent format, recovery bootstrap authority, multi-device/quorum rotation and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.356 — study the bootstrap problem: how a recovered system can authenticate a new trust-anchor frontier when the old trust store may itself be compromised or rolled back.
