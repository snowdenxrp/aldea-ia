# GLOBAL-AUDIT-031 — COMMON-MODE AND CLAIM-SCOPED TCB — 2026-09-28

## Objective
Attack the assumption that separate observers/processes/providers constitute independent evidence and derive a claim-scoped TCB boundary.

## Common-mode attack classes
1. Shared authority/policy source.
2. Shared clock/time source.
3. Shared identity/credential issuer.
4. Shared resource/provider/incarnation source.
5. Shared storage or event log.
6. Shared cache/invalidation mechanism.
7. Shared model/runtime or deterministic derivation.
8. Shared network path/proxy/gateway.
9. Shared configuration artifact/version.
10. Shared recovery/reconciliation authority.

## Findings
Two observations are independent only relative to a specified claim, threat model and failure domain. Different processes, languages, hosts, models or providers do not establish independence by themselves.

If Observation A and Observation B both depend on source S for a claim-critical property, a failure of S can invalidate both. Treating A and B as two independent witnesses would amplify confidence without additional evidence.

Therefore evidence aggregation must preserve a dependency graph, not merely an observer count.

## Claim-scoped TCB rule
For claim C, TCB(C) contains every component whose incorrect behavior can cause C to be accepted when it should be FALSE or UNKNOWN, including:
- authoritative state sources;
- identity/authority validation;
- policy/delegation validation;
- dependency capture;
- provenance generation;
- order/linearization source;
- invalidation/reconciliation mechanism;
- protocol reducer;
- final admission decision;
- any component able to suppress or forge claim-critical evidence.

Components outside TCB(C) may still affect availability or optimization, but their failure must not create an unjustified TRUE_JUSTIFIED result.

## Independence contract
For each purportedly independent witness define:
Domain, source identity, source incarnation, dependency set, common-mode domains, failure assumptions, freshness, consistency semantics, and claim property supported.

Independence is then a documented property under the threat model, not an architectural assumption.

## Adversarial consequence
If two witnesses share an unmodeled dependency, a joint TRUE result cannot be promoted merely because two witnesses agree. Missing common-mode provenance should produce UNKNOWN for claims that require independent support.

## Boundary result
The TCB is claim-specific and may be larger than the authoritative Z1 core because provenance/dependency capture can be necessary to prevent unsafe acceptance. Conversely, non-authoritative UI, analytics and optimization components need not be TCB if they cannot cause protected acceptance.

## New invariant
NO_CONFIDENCE_AMPLIFICATION_FROM_UNMODELED_COMMON_MODE:
If multiple supporting observations have an unresolved common-mode dependency relevant to claim C, aggregation cannot increase the epistemic status of C.

This is a semantic invariant candidate, not yet formally verified.

## Gate
Before bounded model execution, each evidence source used by P_AA must have a declared failure domain and dependency set. Unknown common-mode dependency remains UNKNOWN.

Next: GLOBAL-AUDIT-032 — attack evidence aggregation, confidence promotion and witness composition; test whether multiple partial witnesses can safely establish P_AA.

Status: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
