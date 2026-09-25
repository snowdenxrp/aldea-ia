# AB104.9 — bounded shared-lease / two-admission attack — 2026-09-25

## Objective
Test the smallest explicit family in which two distinct attempts/admissions share one candidate LeaseBridge, without assigning unresolved LEASE_RENEW, RETRY, or LEASE_CONSUME semantics.

## Construction
H1: LeaseIssue -> CreateAttempt(A1) -> Decide(D1) -> Admit(A1,B)
H2: LeaseIssue -> CreateAttempt(A2) -> Decide(D2) -> Admit(A2,B)

The histories share the same lease/bridge candidate B but have distinct attempt identities and actual admission links.

## Result
The shared bridge does not identify the actual admission. Therefore any representation that keeps only B (or bridge_valid) cannot reconstruct whether A1 or A2 was admitted.

However, this alone is not a P_AA collision: the two histories have different actual admission linkage by construction. It instead proves that AdmissionBindingClass contains information not recoverable from bridge identity alone.

A richer packed representation can preserve both B and the admission-indexed linkage set. Such packing is not yet proven congruent under future transitions.

## No illicit semantics
The test does not execute LEASE_RENEW, RETRY, or LEASE_CONSUME. It therefore avoids importing their unresolved post-state laws.

## Classification
BRIDGE_ONLY_RECONSTRUCTION = FALSE
ACTUAL_ADMISSION_LINKAGE_REQUIRED = VERIFIED_FROM_RECOVERED_CONTRACTS
SCALAR_BRIDGE_MERGE = UNSAFE
RICH_PACKED_MERGE = POSSIBLE_IN_PRINCIPLE
FUTURE_CONGRUENCE = UNKNOWN
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
FORMAL_VERIFICATION = NOT_PERFORMED

## Engineering invariant
A representation may share storage only if it retains an admission-indexed relation capable of reconstructing the actual linked context. bridge_valid alone is insufficient.

## Next
Attack the packed representation under one explicit invalidation (PolicyChange or ResourceReincarnate) occurring before the two admissions, using only recovered invalidation contracts. Compare whether the two logical views remain reconstructible without relying on unresolved lease consumption/renewal behavior.
