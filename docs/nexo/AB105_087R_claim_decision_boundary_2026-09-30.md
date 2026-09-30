# AB105.087R — Claim/Decision boundary and assurance inheritance

Date: 2026-09-30
Chain: AB105.086R -> AB105.087R

## Objective
Return from the closed evidence-layer cluster to the Nexo core semantic boundary: determine whether Claim, Appraisal Result, and Decision must remain distinct, and how unresolved assurance propagates into consequential decisions.

## Fresh primary evidence
RFC 9334 explicitly separates Evidence, Verifier appraisal, Attestation Results, and the Relying Party's own appraisal policy. The Relying Party uses the resulting information for application-specific decisions such as authorization; therefore an appraisal result is an input to a decision, not the decision itself. citeturn3search0
RFC 9334 also notes that freshness is evaluated by policy and that the state can change immediately after evidence/result generation, so freshness cannot become a permanent truth property. citeturn3search0
NIST defines authorization as a decision to permit or deny access and describes assessments as evidence-based evaluations used to support decision making. NIST's RMF separates risk determination, risk response, and the authorization decision. citeturn3search3turn1search25turn1search3

## Semantic separation
1. CLAIM
A statement about a subject, with scope, provenance, freshness, coverage, and dependency context.

2. APPRAISAL_RESULT
A derived evaluation of one or more Claims under an explicit appraisal policy.

3. DECISION
A policy-governed choice about an intended action or state transition, using appraisal results plus authority, mission, consequence, and operational constraints.

4. EFFECT
An observed or attempted external/state-changing result. It is not proof of the prior decision's correctness.

Canonical flow:
OBSERVATIONS -> CLAIMS -> APPRAISAL -> DECISION -> EFFECT

Reverse inference is forbidden:
EFFECT != DECISION_PROOF
DECISION != CLAIM
APPRAISAL != AUTHORITY
CLAIM != TRUTH

## Assurance inheritance
A Decision Contract must declare the minimum assurance required for each decision-relevant input.

Required fields:
- DECISION_ID
- SUBJECT
- INTENDED_ACTION
- TARGET_SCOPE
- CONSEQUENCE_CLASS
- AUTHORITY_REQUIREMENT
- REQUIRED_CLAIM_TYPES
- REQUIRED_FRESHNESS
- REQUIRED_COVERAGE
- REQUIRED_DEPENDENCY_ASSURANCE
- REQUIRED_CONSISTENCY_STATE
- POLICY_ID/VERSION
- VALID_UNTIL_OR_RECHECK_RULE
- FAIL_STATE

Decision-relevant uncertainty must not be silently discarded.

Rules:
- insufficient freshness -> UNKNOWN/RECHECK or STOP, according to policy;
- unresolved material conflict -> UNKNOWN/STOP unless policy explicitly defines a safe resolution;
- insufficient dependency assurance -> UNKNOWN/STOP for decisions whose declared assurance requires it;
- insufficient coverage -> UNKNOWN/STOP when the missing scope can invalidate the decision;
- insufficient authority -> STOP regardless of otherwise favorable evidence.

An informational or low-consequence decision may accept bounded uncertainty only when the policy explicitly declares that lower assurance. That is not an upgrade of the evidence; it is a lower-assurance decision path.

## Adversarial cases
A. Claim says 'safe'; appraisal is fresh but authority is revoked -> decision must not inherit 'safe' as permission.
B. Two compatible claims share one trust root -> compatibility does not become independent corroboration.
C. Appraisal is valid at T0 and action executes at T1 after freshness/authority boundary -> recheck or fencing required.
D. Decision succeeds but external effect is unobserved -> EFFECT = UNKNOWN, not EFFECT_PROVEN.
E. Effect occurs but decision record is missing -> effect remains evidence of an occurrence, not proof of authorization.
F. Policy version changes after appraisal -> previous appraisal remains historical; decision requiring the new policy must reappraise.
G. Scope mismatch -> a valid claim for one subject/resource/scope cannot be silently generalized to another.
H. Partial dependency graph -> preserve partial/unknown status; do not convert it into a complete assurance statement.

## Result
The core semantic boundary is confirmed and tightened:
CLAIM != APPRAISAL_RESULT != DECISION != EFFECT.

No new evidence primitive is required.
The missing requirement is a formal Decision Contract that declares assurance requirements and prevents favorable evidence from bypassing authority, freshness, scope, or dependency checks.

## Status
CLAIM_SEMANTIC_BOUNDARY = CLOSED_AT_GENERIC_LAYER
APPRAISAL_DECISION_SEPARATION = CLOSED_AT_GENERIC_LAYER
DECISION_ASSURANCE_REQUIREMENTS = NORMATIVELY_DEFINED
EFFECT_DECISION_NON-EQUIVALENCE = CLOSED_AT_GENERIC_LAYER
FORMAL_DECISION_CONTRACT_IMPLEMENTATION = NOT_PERFORMED

## Anti-expansion rule
Do not reopen the closed evidence taxonomy. Future work should test this Decision Contract against the historical EventDAG/reconstruction and authority/fencing gaps.

## Next exact direction
AB105.088R — adversarial Decision Contract pass: test Claim→Appraisal→Decision→Effect against stale decisions, authority epoch changes, duplicate operations, replay, missing successors, partial reconstruction, and STOP/fencing. Use the historical AB50–AB58 EventDAG gap as a preserved adversarial case; do not claim it closed.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.