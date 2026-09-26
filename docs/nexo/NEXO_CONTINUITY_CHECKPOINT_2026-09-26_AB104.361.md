# NEXO CONTINUITY — AB104.361

AB104.361 persisted. Research only; no implementation.

## Finding
RATS separates policy ownership, appraisal policy and authorization, and requires policy itself to be securely obtained. Freshness is policy-defined and state can change after evidence generation. citeturn0search0

Policy rotation during an unresolved conflict must bind:
policy_id + predecessor_policy_id + policy_version + authority_epoch + scope + activation_frontier + supersession_digest + conflict_resolution_rules_digest + dependency_closure + freshness + status

Candidate states:
CURRENT | HISTORICAL_ONLY | PENDING_ACTIVATION | SUPERSEDED | REVOKED | SCOPE_MISMATCH | UNKNOWN | CONFLICT

Rules:
POLICY_SIGNATURE_VALID != POLICY_CURRENT
POLICY_CURRENT != RETROACTIVE
SUPERSEDED_POLICY != ERASED_HISTORY
NEW_POLICY != AUTOMATICALLY_VALID_FOR_OLD_CONFLICT

Conflict applicability must use an authenticated activation frontier. Straddling/unknown transition coverage => UNKNOWN/STOP. Historical resolution remains immutable evidence even after policy supersession/revocation.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.362 — study emergency policy revocation/replacement during unresolved conflicts and prevention of stale-policy execution and unsafe policy rollback.

## DO-NOT-REPEAT
Never use timestamp alone to decide which policy governed a conflict across a policy transition.
