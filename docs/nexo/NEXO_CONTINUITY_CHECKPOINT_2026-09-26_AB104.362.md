# NEXO CONTINUITY — AB104.362

AB104.362 persisted. Research only; no implementation.

## Finding
RATS requires policy itself to be securely obtained/protected and allows policy-owner attestation before accepting updated policy. Freshness is policy-defined; state can change after evidence generation. RFC 6024 requires compromise/disaster recovery and replay protection for trust-anchor management. citeturn0search1turn0search2turn0search20

Emergency policy replacement is an authority transition, not an edit.

Candidate binding:
policy_id + predecessor_policy_id + emergency_policy_id + authority_epoch + activation_frontier + revocation_frontier + scope + supersession_digest + affected_conflict_set + recovery_authority + dependency_closure + status

Candidate states:
EMERGENCY_CURRENT | PREVIOUS_REVOKED | PREVIOUS_HISTORICAL_ONLY | ACTIVATION_PENDING | ROLLBACK_REJECTED | SCOPE_MISMATCH | DEPENDENCY_INCOMPLETE | UNKNOWN | CONFLICT

Rules:
REVOCATION_OF_POLICY != ERASURE_OF_POLICY_HISTORY
EMERGENCY_POLICY != AUTOMATIC_RETROACTIVE_POLICY
VALID_OLD_POLICY != CURRENT_AUTHORITY
NEW_POLICY_SIGNATURE != SAFE_POLICY

Incomplete activation/revocation coverage => UNKNOWN/STOP. Historical resolutions remain immutable evidence; rollback must not restore revoked policy as current authority.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.363 — study the execution-boundary race: emergency policy revocation between authorization and external effect, and required fencing/epoch validation.

## DO-NOT-REPEAT
Do not assume a newly signed emergency policy is automatically current, retroactive, or safe to execute.
