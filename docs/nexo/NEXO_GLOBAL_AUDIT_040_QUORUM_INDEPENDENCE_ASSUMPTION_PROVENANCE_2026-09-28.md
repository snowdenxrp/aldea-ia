# GLOBAL-AUDIT-040 — QUORUM, THRESHOLD AND INDEPENDENCE-ASSUMPTION PROVENANCE — 2026-09-28

## Objective
Attack quorum/threshold reasoning and determine whether claims of evidence independence themselves require provenance and verification.

## 1. Thresholds are conditional proofs
A threshold such as k-of-n has meaning only relative to an explicit failure model: maximum faulty/compromised participants, independence assumptions, identity binding, quorum intersection, freshness/order semantics and claim property.

Without those assumptions, `k-of-n` is only a count.

## 2. Independence is not a boolean fact
For claim C, independence should be represented as a structured contract:
`IndependenceDomain, SharedDependencies, FailureCorrelationAssumptions, SourceIncarnation, EvidenceGeneration, VerificationBasis`.

A simple `independent=true` field is vulnerable to authority amplification if the assertion itself is unverified.

## 3. Independence recursion
If provider P1 and P2 are claimed independent because a configuration file says so, but that configuration is controlled by the same authority being evaluated, the independence assertion is common-mode and cannot increase confidence without an independent verification basis.

Thus provenance of independence assumptions is claim-relevant evidence.

## 4. Quorum attack classes
- identity duplication: one source represented as multiple observers;
- shared upstream: many observers mirror one source;
- shared issuer: common compromised authority;
- shared configuration: same faulty policy/config artifact;
- shared network/proxy: correlated stale/fabricated observations;
- shared resource incarnation: observers report same stale object;
- correlated clock: timestamps agree but ordering is wrong;
- shared model/runtime: diverse agents repeat the same systematic error;
- quorum membership drift: participant set changes between observations;
- stale quorum: sufficient old votes outlive their validity interval;
- split-brain quorums: two partitions each satisfy a locally assumed threshold.

## 5. Quorum intersection
A threshold proof requires an explicit participant universe and intersection property. Dynamic membership, incarnation changes or authority epoch changes can invalidate a previously computed quorum. Historical quorum evidence must therefore bind membership generation/epoch and participant identity/incarnation.

## 6. Majority cannot repair semantic incompleteness
Even a correctly independent quorum cannot establish a claim if every participant lacks a required semantic property. For example, five independent observers confirming current authority cannot establish historical admission linkage if none observes the actual UsedAdmissionContext.

`INDEPENDENT_SUPPORT != COMPLETE_CLAIM_SUPPORT`.

## 7. Confidence non-amplification
Candidate invariant:
`UNVERIFIED_INDEPENDENCE_CANNOT_AMPLIFY_CONFIDENCE`.

If independence assumptions are unresolved and claim-critical, aggregation remains UNKNOWN rather than gaining epistemic strength from the number of observations.

## 8. Safe quorum contract
A quorum contribution is admissible only if:
- participant identity/incarnation is authenticated;
- membership epoch is known;
- evidence generation/freshness is valid;
- dependency/common-mode domains are characterized;
- failure threshold is explicit;
- intersection assumptions are satisfied;
- each participant supports the exact claim property;
- actual admission/effect binding is preserved.

## Conclusion
Quorum is not a universal truth amplifier. Its semantic value derives from the claim-specific failure model and independently evidenced assumptions. Independence itself can become part of the evidence dependency graph and TCB.

No formal proof/TLC/TLAPS/runtime fault injection.

Next: GLOBAL-AUDIT-041 — attack dynamic membership, quorum reconfiguration, authority epochs and stale quorum evidence.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; evidence reducer completeness UNKNOWN; independence proof UNKNOWN; quorum semantics completeness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
