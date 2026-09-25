# AB104.32 — Transition/history separation checkpoint — 2026-09-25

Status: RESEARCH ONLY.

## New formal-methods crosscheck

Lamport defines an action as a relation between old and new states. His auxiliary-variable treatment also distinguishes history variables, which record past behavior, from the underlying next-state relation. This directly supports the AB104 separation between replay evidence and the missing LEASE_CONSUME/RENEW successor law. citeturn0search1turn0search2

## Consequence

The replay pair can be retained as historical evidence without asserting that `consumed_attempts` itself is the protocol state transition.

Therefore:
- history evidence = representable;
- successor relation = UNKNOWN until the protocol action relation is recovered;
- future P_AA observation = UNKNOWN when it depends on that missing relation;
- no P_AA collision follows from the existence of two history records alone.

## Current boundary

LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
AB65_EXECUTION = NOT_VERIFIED

## Next

Search the repository for an explicit action relation or executable specification that constrains LEASE_CONSUME/RENEW. If none is found, preserve the boundary and avoid further speculative expansion.