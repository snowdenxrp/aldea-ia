# AB96 — REPLAY-READER RECOVERY AUDIT — 2026-09-25

Status: RESEARCH ONLY.

Canonical search for ReplayBinding / CM-AA52..57 returned no indexed commit hits. This is not evidence of absence.

AB18 remains the strongest recovered source: ReplayBinding is explicitly part of the candidate complete LeaseBridge, and replay is treated as a distinct adversarial dimension.

Bounded conclusion:
- A replay-history separator is conceptually identified by AB95.
- No complete legal P_AA transition that reads replay/consumption state was recovered.
- Therefore replay cannot be safely eliminated.
- But replay collision is NOT established.

External check: Lamport/Merz explain that history variables can preserve past information needed by refinement without changing the described behavior; this supports retaining replay history provisionally when reconstruction is unproven. citeturn0search12turn0search14

STATE:
REPLAY_HISTORY_REMOVAL = NOT_JUSTIFIED
CONCRETE_LEGAL_REPLAY_SEPARATOR = NOT_ESTABLISHED
REPLAY_RECONSTRUCTION = UNKNOWN
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

Next: recover adjacent historical artifacts around AB18/AB25 that may encode replay/consumption under different labels, then test whether the history can be reconstructed from event identity + order + admission linkage.
