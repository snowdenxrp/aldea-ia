# NEXO CONTINUITY — AB104.350

AB104.350 persisted. Research only; no implementation.

## Finding
RATS separates Evidence, Verifier appraisal, and Relying Party policy; evidence must be associated with the correct target, and layered trust dependencies must be considered. citeturn0search0turn0search11 Current EAR work also binds appraisal results to contextual information so the frame of reference can be reconstructed. citeturn0search4

Nexo should treat independence-domain metadata as **evidence requiring provenance/appraisal**, not as self-authenticating truth.

Candidate states: `DECLARED | EVIDENCED | APPRAISED | CORROBORATED | UNKNOWN | CONFLICT`.

## Invariants
`AUTHENTIC_METADATA != TRUE_INDEPENDENCE`
`APPRAISED_DOMAIN != UNIVERSAL_FACT`
`MULTI_SIGNATURES != INDEPENDENT_CORROBORATION`

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.351 — study cross-attestation and circular trust dependencies.

## DO-NOT-REPEAT
Never accept an operator's signed declaration of independence as proof of actual failure-domain separation.
