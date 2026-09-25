# AB104.7 — AB18 ↔ AB90 bridge-field erasure audit — 2026-09-25

## Objective
Check whether the candidate LeaseBridge completeness definition from AB18 already rules out a naive merge with AdmissionBindingClass, before inventing any future transition semantics.

## Evidence
AB18's candidate complete LeaseBridge explicitly includes: SubjectBinding, OperationBinding, AttemptBinding, ResourceBinding, ResourceIncarnationBinding, AuthorityContextBinding, PolicyCompatibilityBinding, DelegationValidityBinding, CapabilityScopeBinding, BoundaryBinding, FreshnessValidity, ReplayBinding, TemporalValidity.

AB18 also states that AdmissionBindingClass concerns the actual admission binding and relational tuple, and that no current component has a safe deletion proof. Its quotient attacks CM-AA48..57 specifically warn against relation erasure, policy/delegation/incarnation/boundary changes, stale epochs, and lease freshness collapse.

AB90 independently constructs two attempts A1 != A2 sharing a candidate bridge and concludes that current bridge validity cannot by itself reconstruct the attempt-specific actual admission linkage. It therefore marks LeaseBridge/AdmissionBindingClass merge as NOT_JUSTIFIED.

## Audit result
The two artifacts are consistent and strengthen each other. A naive merge that retains only a scalar bridge-valid flag erases at least the AttemptBinding and actual-admission-linkage dimensions already identified by AB18. Depending on representation, it can also erase ReplayBinding, TemporalValidity, BoundaryBinding, and other relational components.

However, this does NOT prove that no richer merged data structure is possible. A merged representation could retain all relation-bearing fields and still expose two logical views. The remaining question is behavioral congruence and reconstructability, not object-name identity.

## Important distinction
LeaseBridge and AdmissionBindingClass differ at the semantic-role level, but that does not imply they must be two physical structs forever. The safe research requirement is: any representation-level merge must preserve every P_AA-relevant relation and support total reconstruction of both views across allowed successors, or return UNKNOWN without false equivalence.

## Status
LEASEBRIDGE_ADMISSION_BINDING_MERGE = NOT_JUSTIFIED
MERGE_SAFETY = UNKNOWN
BRIDGE_FIELD_ERASURE_RISK = CONFIRMED_FOR_NAIVE_SCALAR_MERGE
RECONSTRUCTION = BOUNDED_ONLY
QUOTIENT_CONGRUENCE = UNKNOWN
TERNARY_PAA_COLLISION = UNKNOWN
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED

## Exact next action
Audit AB50/AB51 representation candidates for which fields are retained or discarded, and construct a field-by-field preservation matrix against AB18's 13 bridge dimensions plus actual admission linkage. A field may be marked eliminable only when reconstruction and future-equivalence obligations are explicitly satisfied.
