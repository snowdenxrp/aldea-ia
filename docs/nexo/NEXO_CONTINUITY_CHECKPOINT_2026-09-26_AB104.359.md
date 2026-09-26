# NEXO CONTINUITY — AB104.359

AB104.359 persisted. Research only; no implementation.

## Finding
When independently authenticated recovery authorities disagree, preserve both evidence branches. RATS separates evidence, appraisal policy and relying-party authorization; freshness is policy-dependent and delayed/reordered epochs can create confusion. citeturn0search0turn0search3

Candidate states:
BRANCH_A_SUPPORTED | BRANCH_B_SUPPORTED | INCOMPARABLE | POLICY_RESOLVED | CONFLICT | UNKNOWN

Rules:
INCOMPARABLE != NEWER
AUTHENTIC_BRANCH != CURRENT_AUTHORITY
MAX_REVISION != VALID_RESOLUTION

No effect should depend on selecting one branch unless an already-trusted policy defines the authority ordering/quorum semantics and binds the resolution to both conflicting statements.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.360 — study authenticated conflict resolution and preventing the resolver itself from becoming a circular trust dependency.

## DO-NOT-REPEAT
Do not resolve conflicting authority frontiers by numeric maximum, timestamp, signature count, or arrival order alone.
