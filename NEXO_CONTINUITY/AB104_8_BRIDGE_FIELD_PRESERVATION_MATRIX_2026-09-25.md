# AB104.8 — LeaseBridge / AdmissionBindingClass field-preservation matrix — 2026-09-25

## Objective
Audit the proposed quotient/projection representation in AB50/AB51 against AB18's 13 candidate LeaseBridge dimensions plus actual admission linkage.

## Matrix

| Dimension | Present in AB18 bridge candidate | Explicitly retained in AB50 Q_AA | Safe elimination established? |
|---|---|---|---|
| SubjectBinding | YES | via AdmissionBindingClass / binding context | NO |
| OperationBinding | YES | via AdmissionBindingClass | NO |
| AttemptBinding | YES | actual admission/linkage + AdmissionBindingClass | NO |
| ResourceBinding | YES | Resource/AdmissionBindingClass | NO |
| ResourceIncarnationBinding | YES | ResourceIncarnation | NO |
| AuthorityContextBinding | YES | AuthorityContextAtAdmission | NO |
| PolicyCompatibilityBinding | YES | PolicyContext | NO |
| DelegationValidityBinding | YES | DelegationContext | NO |
| CapabilityScopeBinding | YES | AdmissionBindingClass / boundary-related binding | NO |
| BoundaryBinding | YES | BoundaryFacts | NO |
| FreshnessValidity | YES | Protocol/Order/Invalidation/lease support | NO |
| ReplayBinding | YES | ReplayAndConsumptionFacts | NO |
| TemporalValidity | YES | Order/linearization + protocol/lease facts | NO |
| ActualAdmissionLinkage | REQUIRED by AB18/AB90 | ActualAdmissionLink | NO |

## Findings

1. The AB50 projection already attempts to retain the semantic dimensions needed by the AB18 candidate rather than reducing the bridge to a scalar validity flag.
2. The field-by-field audit finds **no dimension with a completed safe-elimination proof**.
3. Several dimensions are represented indirectly rather than as identically named fields. Indirect representation is not evidence of redundancy; it requires a reconstruction and future-congruence proof.
4. Attempt identity and actual admission linkage are especially protected by AB90: a shared current bridge does not determine which attempt was actually admitted.
5. Replay and temporal validity remain semantically unresolved in parts of the LEASE transition system. Their presence in the projection does not close their transition laws.
6. Therefore the current evidence supports **retaining all dimensions in the semantic candidate**, while allowing future representational packing only after explicit congruence/reconstruction evidence.

## Important correction

AB104.7's phrase “scalar bridge-valid merge erases…” is a statement about a naive representation. A richer single data structure can potentially pack multiple semantic views without erasure. The unresolved issue is not object count; it is preservation of the complete relation and future behavior.

## Gate result

BRIDGE_FIELD_ERASURE_RISK = CONFIRMED_FOR_NAIVE_SCALAR_MERGE
SAFE_FIELD_ELIMINATION = NONE_ESTABLISHED
REPRESENTATION_PACKING = POSSIBLE_IN_PRINCIPLE
RECONSTRUCTION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
BRIDGE_MERGE = UNKNOWN
LEASE_RENEW = UNKNOWN
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
TERNARY_PAA_COLLISION = UNKNOWN
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED

## Next exact action

Use this matrix as the preservation contract for the next executable harness. The harness should compare candidate packed representations by reconstructing both logical views and checking future observations, while unresolved transition semantics yield UNKNOWN rather than being silently omitted.
