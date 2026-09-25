# AB104.69 — Direct historical contract recheck AB20/24/25/26/36P/39/49 — 2026-09-25

Status: RESEARCH ONLY. Additive checkpoint.

## Purpose
A deeper historical repass was performed using exact commit objects/diffs rather than default-branch lexical search.

## Findings
- AB20's lease transition is explicitly a candidate relation: IssueLease and ExpireLease are described, while exact renewal semantics remain open.
- AB24 requires every transition to specify precondition, changed/unchanged fields, cross-component invalidations, admission effect, and history support; it lists ExpireLease but does not define a complete LeaseRenew transition.
- AB25/AB26 formalize the six-part action contract and replay/history obligations. They do not add a complete renewal/consumption law.
- AB36P's CM-AA424/429 explicitly uses lease renewal without authority revalidation as a **countermodel** (“if renewal semantics do not explicitly revalidate...”), not as evidence that Nexo actually implements that behavior.
- AB39 J6 (LEASE_RENEW -> POLICY_CHANGE -> ADMIT) likewise identifies renewal/policy as a separator candidate and warns that 3-event projections can hide dependencies; it does not define renewal post-state or legality.
- AB49 names renewal semantics, replay/consumption, and renewal authority as required LEASE support dimensions, confirming these are obligations rather than completed laws.

## Important conclusion
The historical source itself confirms the distinction between:
1. a named/countermodelled transition dimension;
2. a candidate contract;
3. a complete canonical transition law.

No complete LEASE_RENEW or LEASE_CONSUME law was recovered by this deeper exact-commit repass.

## Status
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
TERNARY_PAA_COLLISION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
AB65_EXECUTION = NOT_VERIFIED
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED

## Boundary
No synthetic completion promoted. No 286-triple expansion. No historical artifact modified.

## Next
The remaining productive routes are (a) recover a genuinely new canonical transition artifact/run evidence, or (b) if no such evidence exists, perform one final UNKNOWN-preserving reconstruction audit and close this evidence frontier explicitly.
