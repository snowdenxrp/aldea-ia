# AB104.26 — Minimal UNKNOWN-preserving reconstruction — 2026-09-25

Status: RESEARCH ONLY.

## Fixture

Created:
`NEXO_CONTINUITY/AB104_26_MINIMAL_UNKNOWN_RECONSTRUCTION_2026-09-25.py`

The fixture constructs the AB100-style replay pair but deliberately does not treat either snapshot as a complete semantic state. It asks only what can be reconstructed after LEASE_CONSUME.

## Result

- H1/H2 preserve different replay evidence.
- LEASE_CONSUME successor relation = UNKNOWN.
- Future ADMIT observation after that event = UNKNOWN.
- No mutation, legality rule, idempotence rule, retry rule, renewal rule, or admission result was synthesized.
- Snapshot difference is therefore not promoted to a P_AA collision.

This matches the formal-methods crosscheck: actions define relations over old/new states, and history variables may preserve past behavior; neither permits inventing an unconstrained next state. citeturn0search12turn0search15

## Boundary

The fixture is intentionally conservative. It demonstrates that the current evidence can represent an epistemic branch but cannot close it.

## Status

LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
AB65_EXECUTION = NOT_VERIFIED

## Next exact action

Use this fixture to test whether any recovered event/order evidence can narrow the successor relation without adding a protocol oracle. If no evidence narrows it, preserve UNKNOWN and close this reconstruction branch.