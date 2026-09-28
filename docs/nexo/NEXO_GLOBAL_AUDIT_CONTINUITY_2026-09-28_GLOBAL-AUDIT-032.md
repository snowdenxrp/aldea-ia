# GLOBAL-AUDIT-032 CONTINUITY

Audit commit: d294afe2ede1bb3d30f25ea033cee497c48472e5
Previous continuity: 90948b2c48fc787e7a6464a2dfe43f87fe01d6e9

Completed evidence aggregation/witness composition attack.

Core result: individually valid evidence does not automatically compose. Witnesses must be jointly realizable under one claim-relative history, identity/incarnation context, ordering, dependency closure and threat model.

Counterexamples include cross-history authority/resource splicing, current-vs-historical validity, mixed-generation lease/policy, stale recheck, common-mode witnesses, protocol label without linearization, resource ID without incarnation, and provenance without complete dependency capture.

Candidate invariant: NO_CROSS_HISTORY_WITNESS_SPLICING. A TRUE_JUSTIFIED result cannot be constructed from witnesses not shown jointly realizable under the same claim-relative history/context.

Three-valued composition: TRUE+TRUE is not automatically TRUE; claim-critical UNKNOWN propagates to UNKNOWN; FALSE establishes the claim only when directly relevant. Evidence promotion remains UNKNOWN -> OBSERVED -> AUTHENTICATED -> CONTEXT_BOUND -> VALIDATED_FOR_PROPERTY -> VERIFIED_FOR_CLAIM.

R1-R5 remain semantic obligations, not mandatory physical variables.

No formal proof/model execution. No implementation/V21.
Next exact action: GLOBAL-AUDIT-033 — define semantic composition operator and attack associativity, commutativity, monotonicity and UNKNOWN propagation.
Carryover: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; formal verification NOT PERFORMED.
