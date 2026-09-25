# AB104.24 — Replay/renewal reconstructibility boundary — 2026-09-25

Status: RESEARCH ONLY.

## Result

The historical source chain was rechecked for a concrete LEASE_CONSUME or LEASE_RENEW action contract.

Recovered:
- AB25 defines the six-part action schema and explicitly identifies hidden lease replay history as P_AA-relevant.
- AB26 defines LeaseExpire and other explicit actions, but leaves renewal/replay semantics unresolved.
- AB49 names renewal and consumption/replay as HistorySupport primitives only.
- AB84-AB87 retain LEASE_RENEW C2/C3/C4/C6 as UNKNOWN.
- AB100 represents consumed_attempts as candidate replay state but deliberately refuses to execute LEASE_CONSUME because its semantics are UNKNOWN.

## Reconstructibility test

Candidate reconstruction source:
event identity + claim-relevant order + invalidation/history support.

For replay/consumption, the event identity could preserve the fact that a LEASE_CONSUME-like event occurred. However, the corpus does not establish:
1. whether that event is legal in a given pre-state;
2. its complete post-state;
3. whether it consumes an attempt, lease, bridge, or another protocol object;
4. whether it is idempotent;
5. whether retry/reuse/renewal reads the consumed fact;
6. whether the event changes admission linkage;
7. the exhaustive successor set.

Therefore event-history presence alone cannot reconstruct a unique P_AA-relevant successor state.

## Safe conclusion

REPLAY_HISTORY_REPRESENTABLE = CANDIDATE_ONLY
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
AB65_EXECUTION = NOT_VERIFIED

No oracle was added and no protocol semantics were synthesized.

## Next exact action

Search for any remaining canonical artifact that gives an explicit Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink contract for replay, retry, consumption, or renewal. If none appears, the evidence branch is closed and the next work should be a bounded UNKNOWN-preserving reconstruction experiment, not a guessed protocol implementation.
