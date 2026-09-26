# NEXO CONTINUITY CHECKPOINT — AB104.288

Date: 2026-09-26
Canonical repo: snowdenxrp/aldea-ia
Branch: main

## Completed
- AB104.288 researched: target-side fencing tokens, Chubby sequencers, lease expiry, stale/delayed requests, and effect-boundary limits.
- Research commit: e9847f6ab68b8854e2a38dd45d14a53b05006a9a

## Carry-forward findings
- Fencing works only when the protected resource validates the token at the actual effect boundary.
- Monotonic generation/sequencer values allow the receiver to reject stale owners.
- Lease expiry/grace periods reduce risk but are not equivalent to target-side authoritative fencing.
- Fencing prevents stale execution but does not prove that an accepted external mutation committed.
- Target incarnation/restore must be part of the evidence boundary; stale pre-restore authority must not silently regain execution rights.
- Candidate binding remains authority generation/fence + target identity/incarnation + operation identity/fingerprint; exact schema is NOT SELECTED.

## Constraints preserved
- Research/study only.
- No architecture implementation, formal verification, semantic freeze, V21 patching, overwrite/delete, or silent migration.
- Historical AB50→AB58 unresolved findings remain preserved.

## Next exact action
AB104.289 — investigate persistence of fencing/sequencer state across target restore/incarnation changes and mechanisms preventing stale pre-restore authority from becoming valid again.

## DO-NOT-REPEAT
- Token issuance != target authorization.
- Token acceptance != effect commit.
- Lease expiry != NOT_COMMITTED.