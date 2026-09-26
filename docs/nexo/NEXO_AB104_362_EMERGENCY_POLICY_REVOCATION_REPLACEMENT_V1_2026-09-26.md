# NEXO AB104.362 — Emergency policy revocation/replacement during unresolved conflict V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS states that appraisal policies themselves must be securely obtained/protected, and that a Relying Party may require attestation of the policy owner before accepting an updated policy. It also states that freshness is policy-defined and that policy/state may change immediately after evidence generation. citeturn0search1 RFC 6024 requires trust-anchor management to support compromise/disaster recovery and protect against replay/reintroduction of compromised trust anchors. citeturn0search2turn0search20

## Finding
Emergency policy replacement is a new authority transition, not a mutable edit to the old policy. The replacement must have an authenticated activation/revocation frontier and must explicitly state what happens to unresolved conflicts.

Candidate emergency transition:
policy_id + predecessor_policy_id + emergency_policy_id + reason_class + authority_epoch + activation_frontier + revocation_frontier + scope + supersession_digest + affected_conflict_set + recovery_authority + dependency_closure + status

Candidate states:
EMERGENCY_CURRENT | PREVIOUS_REVOKED | PREVIOUS_HISTORICAL_ONLY | ACTIVATION_PENDING | ROLLBACK_REJECTED | SCOPE_MISMATCH | DEPENDENCY_INCOMPLETE | UNKNOWN | CONFLICT

## Safe rule
1. Authenticate the emergency authority independently of the policy being revoked.
2. Bind the emergency policy to the exact predecessor policy/configuration and activation frontier.
3. Establish whether the emergency policy is prospective, retroactive, or explicitly limited; never infer retroactivity.
4. Preserve every historical resolution made under the predecessor.
5. Prevent the revoked policy from authorizing new effects after its revocation frontier.
6. Prevent rollback from restoring the revoked policy as current authority.
7. If activation/revocation coverage is incomplete, block policy-dependent effects: UNKNOWN/STOP.

## Key distinction
REVOCATION_OF_POLICY != ERASURE_OF_POLICY_HISTORY
EMERGENCY_POLICY != AUTOMATIC_RETROACTIVE_POLICY
VALID_OLD_POLICY != CURRENT_AUTHORITY
NEW_POLICY_SIGNATURE != SAFE_POLICY

RATS' freshness model reinforces that a previously valid result can become unacceptable as policy/state changes; therefore the execution boundary must evaluate current policy applicability, not merely historical signature validity. citeturn0search1

## Status
Exact emergency authority hierarchy, retroactivity rules, rollback barrier and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.363 — study the execution-boundary race: emergency policy revocation arriving between authorization and external effect, and how fencing/epoch validation must close that window.
