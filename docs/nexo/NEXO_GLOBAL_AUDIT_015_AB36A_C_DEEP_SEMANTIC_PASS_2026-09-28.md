# NEXO GLOBAL-AUDIT-015 — AB36A–C DEEP SEMANTIC PASS — 2026-09-28

## Scope
Directly inspected AB36A, AB36B, AB36C primary artifacts and their Git parent relationships.

## AB36A -> AB36B
AB36A static audit identified 13 concrete failures. Key ones: authority not used by AdmissionAssessment; CompleteBinding defined but unused; policy/delegation not explicit; protocol semantics collapsed; immutable historical linkage absent; EventDAG absent; principal temporal mutations absent; UNKNOWN under-specified; stuttering not future-observation aware; invariant insufficient; no tool validation.

AB36B is a genuine repair attempt. Its commit message is “repair PAA TLA draft with actual admission linkage and DAG kernel”. It adds explicit usedAuth/usedBridge, EventTypes, Event DAG relations, ActualAdmission/ActualAuthority/ActualBridge, BindingOK, ProtocolOK, IncarnationOK and conservative invariants.

However AB36B still has material gaps:
- authority identity is by subject rather than stable AuthId;
- EventDAG relations are declared but Next does not populate them;
- current incarnation is used for AssessmentOf, conflating current validity with historical admission semantics;
- policy/delegation/epoch validity remain incomplete;
- protocol branches are still placeholders;
- actual linkage remains vulnerable to arbitrary-valid-witness substitution;
- the model is not established as syntactically/tool validated.

## AB36C
AB36C is an audit/refinement gate, not a new proof model. It independently records 13 residual issues in AB36B and explicitly states no TLC verification. It requires stable AuthId, immutable AdmissionRecord + UsedContext, explicit policy/delegation/epoch/boundary validity, complete BridgeRec, EventDAG updates on relevant transitions, invalidation transitions, and later finite configuration only after semantic stabilization.

## Audit interpretation
AB36B should be classified 🔵 EXTENSION/REPAIR, not 🟢 resolved. AB36C is an audit gate exposing residual defects, not closure.

The most important continuity point is strengthened:
ACTUAL_LINKAGE != CURRENT_VALIDITY.
HISTORY_STRUCTURE_DECLARED != HISTORY_SEMANTICALLY_POPULATED.
PROTOCOL_FIELD_PRESENT != PROTOCOL_SEMANTICALLY_VALID.
MODEL_DRAFT != TOOL_VALIDATED != MODEL_CHECKED.

No evidence in AB36A–C establishes TLC execution, formal verification, quotient congruence, FutureObs_PAA sufficiency, lease completeness, or protocol completeness.

## Next exact action
GLOBAL-AUDIT-016: inspect AB36D–F primary artifacts and test whether the stable-AuthId / immutable linkage / EventDAG deficiencies were actually repaired, or merely specified as intended repairs.
