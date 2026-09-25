# AB104.33 — Successor-completeness rule crosscheck — 2026-09-25

Status: RESEARCH ONLY.

## New finding

The TLA+ documentation explicitly distinguishes an action as a relation over current and next states, and model checking requires a complete next-state assignment. It also permits nondeterminism when the relation intentionally admits multiple successors. citeturn0search12turn0search0

## Direct implication for AB104

Our UNKNOWN-preserving fixture is correct to refuse a single synthesized successor. But the stronger formal rule is:

- If recovered evidence gives a complete relation with multiple legal successors, represent the complete successor set.
- If recovered evidence does not specify the successor relation completely, do not silently close it with a default mutation.
- History variables can preserve prior-event information, but they do not by themselves define the missing next-state relation. citeturn0search13

## Nexo status

This does not close LEASE_CONSUME or LEASE_RENEW. It gives us a sharper reconstruction criterion for any future canonical artifact.

LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
AB65_EXECUTION = NOT_VERIFIED

## Next

Audit any remaining canonical transition specification against this completeness criterion. Do not expand the attack space until a concrete relation is recovered.