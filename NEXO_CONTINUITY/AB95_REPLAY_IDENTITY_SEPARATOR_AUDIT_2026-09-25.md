# AB95 — REPLAY IDENTITY SEPARATOR AUDIT — 2026-09-25

Status: RESEARCH ONLY.

## Minimal pair

H1: lease/bridge currently identical; prior consumption state says token/lease instance L has not been consumed for attempt A.

H2: same current lease/bridge fields; prior history says the same L was already consumed for A.

All currently retained scalar validity fields may therefore be equal while replay history differs.

## Legal separator search

Canonical searches for replay/consumption/expiry admission transitions did not recover a dedicated complete P_AA transition law.

AB18 explicitly includes ReplayBinding in the candidate complete LeaseBridge and identifies replay as a countermodel dimension.

Therefore:
REPLAY_HISTORY_REMOVAL = NOT_JUSTIFIED
CONCRETE_LEGAL_REPLAY_SEPARATOR = NOT_ESTABLISHED
REPLAY_RECONSTRUCTION = UNKNOWN

The minimal pair demonstrates a potential separator, not a claimed legal protocol behavior.

## External methodological check

Lamport's auxiliary-variable work supports retaining history when required to establish refinement, while requiring the augmented specification to preserve the original behaviors; this supports treating replay history as a candidate semantic support dimension rather than silently deleting it. citeturn0search12turn0search13

## State

TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

## Next exact action

Search canonical history for any transition whose precondition reads replay/consumption identity. If recovered, instantiate H1/H2 against that transition; otherwise test whether replay can be reconstructed from event identity + order + admission linkage without assuming an unrecorded rule.
