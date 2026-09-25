# AB104.67 — SECOND HISTORICAL REPASS / MISSED-LAYER AUDIT — 2026-09-25

Status: CANONICAL RESEARCH AUDIT / ADDITIVE.

A second pass over the full AB55→AB104 lineage found an important historical layer not included in AB104.66: AB104.20, AB104.23, AB104.24, AB84, AB85, AB86, AB87, AB95, AB97 and AB98.

## Findings

1. AB84-AB86 directly audit LEASE_RENEW and recover AB20, AB24, AB36P and AB39 evidence. They confirm that renewal must account for authority revalidation, policy/delegation/incarnation compatibility, bridge retention/rebinding, replay/consumption, ordering and successor enumeration, but none supplies the complete renewal law.

2. AB85 recovers AB20 and AB24: policy change can invalidate a bridge; lease validity is joint, not a single lease_valid bit; admission requires the actual bound context; no complete renewal pre/post law exists.

3. AB86 recovers AB36P and AB39: renewal-after-revocation is an explicit countermodel; renewal without authority revalidation is unsafe as a semantic assumption; J6 LEASE_RENEW -> POLICY_CHANGE -> ADMIT is a documented attack; these are attack specifications, not protocol laws.

4. AB104.20, .23 and .24 independently establish the same boundary for both LEASE_RENEW and LEASE_CONSUME. They explicitly list unresolved legality, post-state, frame/invalidation, admission mapping and exhaustive successor domains.

5. AB95/.97/.98 strengthen replay history as a candidate support dimension. Replay removal is not justified, but no concrete legal replay separator or complete reconstruction rule is established.

6. AB55 remains the only concrete research mutation found for LEASE_CONSUME (lease_valid=False), and AB104.65 correctly prevents promotion of that mutation because AB54 did not establish it.

7. Separate V13/V14/V15 coordination-lease kernel semantics must not be imported into P_AA Nexo semantics.

## Important new conclusion

The earlier AB104.66 conclusion was correct but incomplete: there is substantially more historical evidence showing that the missing renewal/consumption laws were deliberately identified and repeatedly audited, not merely overlooked.

The repass found NO recovered artifact that closes C2/C3/C4/C6 for LEASE_RENEW or LEASE_CONSUME.

Current status remains:
- LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
- LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
- REPLAY_HISTORY_REMOVAL = NOT_JUSTIFIED
- REPLAY_RECONSTRUCTION = UNKNOWN
- TERNARY_PAA_COLLISION = UNKNOWN
- QUOTIENT_CONGRUENCE = UNKNOWN
- AB65_EXECUTION = NOT_VERIFIED

## DO-NOT-REPEAT

Do not repeat broad renewal/replay searches already covered by AB84-AB98.
Do not promote attack countermodels into protocol rules.
Do not import V13/V14/V15 coordination-lease semantics.
Do not equate AB55 lease_valid=False with canonical consumption semantics.

## Next productive frontier

Inspect historical artifacts immediately around AB104.20-.24 and explicit AB104.2-.19 executable scaffolding only for any evidence that was promoted later. If no promotion exists, move to the bounded UNKNOWN-preserving reconstruction experiment rather than another broad lexical search.