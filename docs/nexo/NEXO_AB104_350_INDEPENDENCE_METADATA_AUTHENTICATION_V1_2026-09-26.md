# NEXO AB104.350 — Authenticating independence-domain metadata

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS separates evidence from appraisal policy and requires evidence to be associated with the correct target; the verifier evaluates evidence under an appraisal policy and the relying party applies its own application-specific policy. citeturn0search0turn0search11 RATS also recognizes layered attesting environments, where trust in one layer depends on other layers and endorsements. citeturn0search0 Current EAR work binds appraisal results to contextual information so the relying party can reconstruct the frame of reference in which an appraisal was made. citeturn0search4

## Finding
Independence-domain metadata cannot be accepted merely because one operator declares it. Nexo should treat domain metadata as **evidence requiring provenance and appraisal**, not as self-authenticating truth.

Candidate `DomainAttestation`:
`subject_id + domain_type + domain_value + evidence_refs + issuer + authority + measurement_frontier + freshness + semantic_version + dependency_digest + appraisal_result`

The verifier/appraisal layer should distinguish:
`DECLARED | EVIDENCED | APPRAISED | CORROBORATED | UNKNOWN | CONFLICT`.

A single authority may authenticate that a statement was issued, but that does not prove the underlying domain separation. To establish stronger independence, domain claims should be corroborated by evidence from distinct roots/dependencies where the claim requires it. The RATS model supports this separation of evidence, appraisal policy, and relying-party decision; Nexo should preserve the same boundary.

## Critical boundary
`AUTHENTIC_METADATA != TRUE_INDEPENDENCE`
`APPRAISED_DOMAIN != UNIVERSAL_FACT`
`MULTI_SIGNATURES != INDEPENDENT_CORROBORATION`

If required domain evidence is unavailable, stale, or shares the same dependency that the claim is meant to survive, independence remains `UNKNOWN`/`CORRELATED`, not satisfied.

## Status
Exact domain evidence formats, provenance graph, and appraisal policy remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.351 — study cross-attestation: whether independent attesters/verifiers can corroborate failure-domain metadata without creating a circular trust dependency.
