# AB104.10 — packed representation under explicit invalidation — 2026-09-25

Status: RESEARCH ONLY. No semantic freeze, formal verification, or 286-triple expansion.

## Objective
Test whether a richer packed representation can preserve LeaseBridge plus admission-indexed linkage when an explicit invalidation occurs before admissions.

## Evidence basis
AB26 defines PolicyChange and ResourceReincarnate with explicit Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink contracts. AB88 confirms event order is P_AA-relevant in bounded explicit families but does not establish a ternary residual.

## Conservative packed model
The packed record is conceptual only:
- Bridge[13 dimensions]
- AdmissionLinks[admission_id -> attempt_id + linked context]
- InvalidationHistory[ordered relevant invalidations]
- provenance/status for every component

No unresolved transition semantics are added.

## Attack A — PolicyChange before admissions
1. LeaseIssue establishes candidate B.
2. CreateAttempt A1 and A2 create distinct attempts.
3. PolicyChange changes current policy and recomputes affected compatibility.
4. Admit is evaluated independently for each actual linkage.

Reconstruction requires retaining the policy compatibility relation attached to the relevant bridge/context and the admission-indexed linkage. A scalar bridge-valid flag cannot reconstruct this. The packed representation can retain both relations.

Result: RECONSTRUCTION POSSIBLE AT REPRESENTATION LEVEL; FUTURE CONGRUENCE UNKNOWN.

## Attack B — ResourceReincarnate before admissions
1. LeaseIssue establishes B for incarnation I1.
2. CreateAttempt A1/A2 exist.
3. ResourceReincarnate changes the resource incarnation.
4. Old-incarnation bindings/leases become incompatible.
5. Admit must evaluate the actually linked context against the new incarnation.

Again, bridge identity alone is insufficient. A packed record retaining ResourceIncarnationBinding plus actual admission linkage can reconstruct the logical views conservatively.

Result: RECONSTRUCTION POSSIBLE AT REPRESENTATION LEVEL; FUTURE CONGRUENCE UNKNOWN.

## What this does NOT prove
- It does not prove Bridge and AdmissionBindingClass can be merged semantically.
- It does not prove quotient congruence.
- It does not produce a P_AA collision.
- It does not define LEASE_RENEW, RETRY, or LEASE_CONSUME.
- It does not establish that all future transitions preserve the packed representation.

## Gate update
BRIDGE_FIELD_ERASURE_RISK = CONFIRMED_FOR_NAIVE_SCALAR_MERGE
SAFE_FIELD_ELIMINATION = NONE_ESTABLISHED
REPRESENTATION_PACKING = POSSIBLE_IN_PRINCIPLE
RECONSTRUCTION = PARTIAL_BOUNDED
BRIDGE_MERGE = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
TERNARY_PAA_COLLISION = UNKNOWN
LEASE_RENEW = UNKNOWN
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
AB65_EXECUTION = NOT_VERIFIED

## Next exact action
Implement only a research harness for the packed record, with explicit provenance/status and deterministic logical-view reconstruction. The harness must return UNKNOWN when a future semantic law is absent and must never mutate historical AB50/AB51 artifacts.
