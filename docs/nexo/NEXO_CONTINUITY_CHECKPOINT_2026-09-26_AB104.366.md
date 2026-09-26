# NEXO CONTINUITY — AB104.366

AB104.366 persisted. Research only; no implementation.

Finding: compensation retries need BOTH logical idempotency identity and semantic/target-state binding. RFC 9334 supports separating freshness from application-specific authorization and warns freshness cannot eliminate post-generation policy/state races. citeturn0search0

Candidate identity:
target_id + target_incarnation + compensation_operation_id + semantic_contract_digest

Candidate guard:
expected_target_state_digest + expected_state_version/CAS frontier + compensation_payload_digest

Rules:
- Same identity + same semantics + same incarnation => SAME_COMPENSATION_RETRY candidate.
- Same identity + changed semantics => CONFLICT.
- Missing incarnation/frontier => UNKNOWN/STOP.
- Changed target state => revalidate; never silently apply.
- operation_id, semantic digest, and target version are separate dimensions.

Constraints: no V21, no implementation, no formal verification claim, preserve AB50–AB58 residuals, no overwrite/delete.

Exact next action: AB104.367 — CAS/version preconditions for compensation and what remains UNKNOWN without an authoritative target frontier.

DO-NOT-REPEAT: never treat payload equality or operation_id alone as sufficient compensation identity.
