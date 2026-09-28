# GLOBAL-AUDIT-031 CONTINUITY

Audit commit: 1453d4e2dc36b27059c9087968bd5b9a48a86f7b
Previous continuity: 342e4157994b72206ea1888727946d2cd6a7f0c0

Completed common-mode and claim-scoped TCB attack.

Findings:
- Different processes/hosts/models/providers do not establish independence.
- Shared authority, policy, clock, identity issuer, resource/provider, storage/event log, cache/invalidation, runtime, network, configuration or recovery authority can create common-mode failure.
- Evidence aggregation must preserve dependency/failure-domain structure, not observer count.
- TCB(C) is claim-specific and includes every component whose failure could cause unsafe TRUE_JUSTIFIED acceptance, including dependency/provenance capture, order/linearization, invalidation/reconciliation and final admission decision.
- Non-authoritative UI/analytics/optimization can remain outside TCB if they cannot cause protected acceptance.

Candidate invariant: NO_CONFIDENCE_AMPLIFICATION_FROM_UNMODELED_COMMON_MODE. If claim-relevant witnesses share unresolved common-mode dependency, agreement cannot raise epistemic status; unresolved dependency -> UNKNOWN.

No formal verification/model execution. No implementation/V21.
Next: GLOBAL-AUDIT-032 — evidence aggregation and witness-composition attacks.
Carryover: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; formal verification NOT PERFORMED.
