# GLOBAL-AUDIT-034 — EVIDENCE FRESHNESS, REVOCATION AND TEMPORAL RACES — 2026-09-28

## Objective
Attack evidence composition when evidence is valid at capture but becomes stale, revoked, superseded or ambiguous before final admission.

## Race classes
R1 capture -> authority revoke -> admit.
R2 capture -> epoch advance -> admit.
R3 capture -> policy change -> admit.
R4 capture -> delegation revoke -> admit.
R5 capture -> resource reincarnation -> admit.
R6 capture -> fence advance -> admit.
R7 capture -> lease expiry -> admit.
R8 capture -> lease renewal -> competing generations -> admit.
R9 capture -> dependency change -> cached recheck -> admit.
R10 capture -> invalidation event delayed -> admit.
R11 capture -> invalidation observed -> stale cache still served -> admit.
R12 capture -> external effect occurs -> local state restored -> admit/recovery.

## Findings
A witness being TRUE at capture time does not make it TRUE at admission time. Every claim-critical witness requires a temporal validity contract: source identity, generation/incarnation, capture point, validity interval or freshness rule, and final-gate revalidation requirement.

Generation numbers alone do not establish semantic freshness unless their authority domain and ordering are defined.

A timestamp alone does not establish freshness because clocks can differ, be stale, or be outside the claim's authoritative ordering.

An invalidation message arriving after admission cannot retroactively make the earlier admission safe or unsafe without a claim-defined linearization point. The model must distinguish event time, observation time and authoritative order.

If the final gate cannot establish whether a captured witness remained valid through the admission linearization point, the safe result is UNKNOWN/HOLD.

## Revocation rule
Revocation is not merely a boolean transition. It must identify the authority/object generation affected and its effective ordering relative to the admission.

## Freshness rule
Freshness is claim-relative. A value may be fresh enough for telemetry but not fresh enough for protected authorization.

## Recovery rule
Restored local evidence cannot override newer external evidence. If external effect status is UNKNOWN, recovery remains quarantined until reconciliation establishes the effect state and authority is revalidated.

## Critical result
Final-gate validation must be a semantic operation over current authoritative state plus claim-relevant history/provenance, not a boolean check that cached evidence still exists.

Candidate FinalGate(C,A):
- verify actual admission linkage;
- verify authority/policy/delegation/resource/fence generations;
- verify dependency/provenance completeness and freshness;
- verify protocol/lease/recheck lifecycle;
- verify authoritative order through linearization;
- reject or return UNKNOWN on unresolved races.

## Status
Evidence freshness/revocation races are semantically covered at the specification level, but no exhaustive finite execution has been performed.

Next: GLOBAL-AUDIT-035 — define the final-gate semantic contract and attack linearization/commit-boundary ambiguity.

P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; composition algebra universality UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
