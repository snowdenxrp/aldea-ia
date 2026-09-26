# NEXO CONTINUITY — AB104.360

AB104.360 persisted. Research only; no implementation.

## Finding
RATS cleanly separates evidence authentication, verifier appraisal, attestation results and relying-party authorization policy. A conflict resolver should therefore be downstream of an already trusted policy, not validate itself through the conflicting branches. citeturn0search0

Candidate resolution record:
resolution_id + conflict_id + policy_id + policy_version + policy_authority + input_branch_digests + required_quorum_rule + dependency_closure + decision_frontier + freshness + resolution_status

Candidate states:
RESOLUTION_AUTHORIZED | POLICY_STALE | POLICY_SCOPE_MISMATCH | DEPENDENCY_INCOMPLETE | QUORUM_UNSATISFIED | CONFLICT_PRESERVED | UNKNOWN | CONFLICT

Safe rule: resolution requires independently authenticated/current policy, exact binding of all input branches, pre-established quorum semantics, and closed policy dependencies. Otherwise preserve the conflict.

Invariants:
POLICY_AUTHENTICATED != POLICY_CURRENT
POLICY_CURRENT != POLICY_SUFFICIENT
QUORUM_SATISFIED != EXTERNAL_TRUTH
RESOLUTION_RESULT != ERASED_CONFLICT

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.361 — study policy rotation during active conflict: prevent stale-policy resolution and prevent new policy from retroactively changing historical resolution.

## DO-NOT-REPEAT
Never let the conflict resolver derive its own authority from the branches it is resolving.
