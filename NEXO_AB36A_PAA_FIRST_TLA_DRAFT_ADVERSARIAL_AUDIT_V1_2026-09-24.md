# NEXO AB36A — FIRST TLA+ DRAFT ADVERSARIAL AUDIT V1 — 2026-09-24

Status: RESEARCH ONLY. The AB36 draft is intentionally treated as untrusted. No TLC execution is claimed.

## 1. Draft artifact

File:
NEXO_AB36_PAA_ABSTRACT_TLA_DRAFT_V1_2026-09-24.tla

Commit:
7c15924d622e608cc982dddcd9edea7c8156367e

The module is a deliberately small abstract draft, not a verified specification.

## 2. Immediate semantic failures found by static audit

F1 — AUTHORITY IS NOT USED BY ADMISSION ASSESSMENT.
AdmissionAssessment currently checks bridge structure but does not require an actual linked valid authority context. This violates the central P_AA requirement and permits a bridge-only TRUE_JUSTIFIED result.

F2 — COMPLETE BINDING IS DEFINED BUT NOT USED.
CompleteBinding exists but is absent from AdmissionAssessment. Therefore the draft does not yet enforce the full relational binding kernel.

F3 — POLICY COMPATIBILITY IS NOT EXPLICITLY CHECKED.
The draft stores policy but does not require the admission bridge/context to be policy-compatible.

F4 — DELEGATION VALIDITY IS NOT EXPLICITLY CHECKED.
The draft stores delegation but does not establish that the actual authority context and bridge remain delegation-valid at admission.

F5 — RESOURCE INCARNATION IS CHECKED ONLY AS A BRIDGE FIELD.
The draft compares bridge incarnation with admission incarnation, but does not prove the bridge's incarnation equals the resource's current incarnation through an actual authority/lease semantics.

F6 — PROTOCOL SEMANTICS ARE COLLAPSED.
ProtocolValid currently checks generic freshness/consumption regardless of ATOMIC/LEASE/RECHECK. This is unsound because the three protocols have different refinement obligations.

F7 — HISTORICAL LINKAGE IS NOT MODELLED AS IMMUTABLE SEMANTIC EVIDENCE.
The admission sequence contains a bridge identifier, but there is no explicit historical authority reference or immutable used-context record.

F8 — EVENT DAG IS ABSENT.
AB35 selected an EventDAG candidate, but the first draft omits it. Therefore order/invalidation history cannot be represented.

F9 — RETRY, REVOCATION, EPOCH, POLICY, DELEGATION, REINCARNATION, DECISION, LEASE ISSUE/EXPIRY ARE ABSENT.
The draft therefore cannot test the principal countermodels.

F10 — UNKNOWN IS UNDER-SPECIFIED.
AdmissionAssessment returns UNKNOWN for missing bridge cases, but it does not distinguish UNKNOWN caused by missing linkage, missing order, missing authority, protocol uncertainty, or history loss. A typed reason is not mandatory yet, but dependency-sensitive UNKNOWN is not implemented.

F11 — STUTTER IS TOO STRONG/TOO WEAK FOR THE RESEARCH CONTRACT.
The draft uses UNCHANGED vars, but there is no auxiliary history variable whose change could invalidate stuttering at the claim level. Once history is added, stuttering must preserve future P_AA observations, not merely visible scalar variables.

F12 — THE CURRENT NoAuthorityAmplification INVARIANT IS NOT ENOUGH.
It checks only bridge membership, not authority consequence preservation, binding, protocol, or boundary semantics.

F13 — TYPE/SET CONSTRUCTION NEEDS TOOL VALIDATION.
The module has not been parsed or checked by TLC. Some expressions are intentionally provisional and must be validated by the actual TLA+ toolchain before semantic conclusions are drawn.

## 3. Most important result

The first TLA+ draft immediately exposed why we delayed formalization.

A syntactically plausible small model can silently collapse:
AUTHORITY + BINDING + PROTOCOL + HISTORY
into
BRIDGE PRESENT.

That would produce a false safety model.

Therefore the draft must not be model-checked in its current form as if it represented P_AA.

## 4. Corrected semantic target

Before running TLC, AdmissionAssessment must be structurally based on the actual linked context:

AuthorityValid(actualAuthority, admission)
AND CompleteBinding(actualAuthority, admission)
AND PolicyCompatible(actualAuthority, actualBridge, admission)
AND DelegationValid(actualAuthority, actualBridge, admission)
AND IncarnationCompatible(actualAuthority, actualBridge, admission)
AND AdmissionProtocolValid(actualBridge, admission, protocol)
AND boundary validity.

The actual used context must be obtained from immutable admission linkage, not selected existentially from any valid context.

## 5. Methodological conclusion

The first TLA+ draft is useful precisely because static adversarial review found semantic holes before model checking.

TLC can only check the model we give it. A model that omitted the required semantics could produce reassuring but irrelevant results.

Therefore:
MODEL-CHECKED != CLAIM-VALIDATED
and
NO_COUNTEREXAMPLE_IN_BAD_MODEL != PROOF_OF_P_AA.

## 6. AB36B frontier

1. Repair the abstract TLA model around actual admission linkage.
2. Add explicit authority/bridge/binding relations.
3. Add a minimal EventDAG/history variable.
4. Add protocol-specific AdmissionProtocolValid.
5. Add revocation, epoch, policy, delegation, incarnation, lease expiry, retry, decide/admit actions.
6. Add typed UNKNOWN reasons only to the degree needed for sound assessment.
7. Re-run static semantic audit.
8. Only then attempt actual TLC execution if the repository/toolchain supports it.
