# GLOBAL-AUDIT-040 CONTINUITY

Audit commit: eb493f9f639e14f7928549b8514451ee797594a6
Previous continuity: 6d76fa81283d0460d4ac3e8ec5620594b3e7c3fa

Completed quorum/threshold and independence-provenance attack.

Thresholds are conditional on explicit failure model, participant identity/incarnation, membership generation, quorum intersection, freshness/order and claim property. `k-of-n` without these assumptions is only a count.

Independence is not a trusted boolean. Candidate structured contract: IndependenceDomain, SharedDependencies, FailureCorrelationAssumptions, SourceIncarnation, EvidenceGeneration, VerificationBasis.

Independence assumptions themselves can be common-mode: if a configuration controlled by the same authority asserts P1/P2 are independent, that assertion cannot amplify confidence without an independent verification basis.

Attack classes: identity duplication, shared upstream/issuer/config/proxy/resource, correlated clocks/models, membership drift, stale quorum, split-brain local quorums.

Independent support still does not equal complete claim support. Five independent observers of current authority cannot prove historical UsedAdmissionContext if none observes it.

Candidate invariant: `UNVERIFIED_INDEPENDENCE_CANNOT_AMPLIFY_CONFIDENCE`.

Safe quorum contribution requires authenticated participant identity/incarnation, known membership epoch, valid freshness/generation, characterized common-mode domains, explicit failure threshold, quorum intersection, exact claim support and preserved admission/effect binding.

No formal proof/TLC/TLAPS/runtime fault injection. No implementation/V21.
Next: GLOBAL-AUDIT-041 — dynamic membership, quorum reconfiguration, authority epochs and stale quorum evidence.
Carryover unchanged: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; evidence reducer completeness UNKNOWN; independence proof UNKNOWN; quorum semantics completeness UNKNOWN; formal verification NOT PERFORMED.
