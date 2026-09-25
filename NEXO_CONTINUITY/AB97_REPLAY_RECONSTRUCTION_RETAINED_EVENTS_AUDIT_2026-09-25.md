# AB97 — REPLAY RECONSTRUCTION FROM RETAINED EVENTS AUDIT — 2026-09-25

Status: RESEARCH ONLY.

## Evidence recovered
AB18 explicitly includes ReplayBinding and TemporalValidity in the candidate complete LeaseBridge, and states that omission requires a concrete pair with different P_AA results before a component can be removed.

Canonical searches for ReplayBinding, replay/consumption, LEASE_CONSUME, and attempt replay returned no indexed files. This is a search/index limitation, not a proof of absence.

## Reconstruction test
Candidate retained dimensions:
- event identity
- claim-relevant order
- actual admission linkage
- lease/bridge identity

H1: lease L has no prior consumption event for attempt A.
H2: same current lease/bridge fields and same current scalar validity, but retained history contains a prior consumption of L for A.

If replay semantics are history-sensitive, H1/H2 differ at a future consume/admit operation. Reconstructing replay from the retained dimensions would therefore require a rule mapping those events and order to consumption identity.

No such complete mapping was recovered.

Lamport's refinement work supports the methodological point: history variables can preserve past information needed for refinement mappings, and auxiliary variables need not change the described behavior. citeturn0search12turn0search14

## Classification
REPLAY_HISTORY_REMOVAL = NOT_JUSTIFIED
CONCRETE_LEGAL_REPLAY_SEPARATOR = NOT_ESTABLISHED
REPLAY_RECONSTRUCTION = UNKNOWN
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN

No claim of protocol impossibility is made.

## Continuity
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

Next exact action: inspect AB18/AB49 chronology for any concrete consumption/replay event identity rule; if none, move to the next unresolved support dimension without deleting replay history.
