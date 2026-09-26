# NEXO AB104.366 — Idempotent compensation + semantic fingerprints V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 9334 separates evidence freshness from the Relying Party's application-specific authorization decision and states that freshness cannot eliminate the race in which policy/state changes after evidence generation. citeturn0search0

## Finding
A compensation retry needs two distinct protections:
1. operation identity/idempotency: the same compensation operation is not accidentally executed twice;
2. semantic binding: the compensation still applies to the exact target state for which it was authorized.

A matching operation identifier alone is insufficient if its payload semantics changed. Conversely, a matching payload fingerprint alone does not prove that two requests are the same logical operation.

Candidate compensation identity:
(target_id, target_incarnation, compensation_operation_id, semantic_contract_digest)

Candidate semantic guard:
expected_target_state_digest + expected_state_version/CAS frontier + compensation_payload_digest

## Rule
- Same operation identity + same semantic contract + same target incarnation => candidate SAME_COMPENSATION_RETRY.
- Same operation identity + different semantic contract/payload => CONFLICT.
- Missing target incarnation or incomplete state frontier => UNKNOWN/STOP.
- Changed target state after authorization => compensation must be revalidated; do not silently apply.
- Successful retry must preserve one logical operation identity while retaining each attempt/receipt as evidence.

## Important separation
operation_id = logical identity
payload/semantic digest = what the operation means
target incarnation/version = which state it is allowed to affect

No one field substitutes for the others.

## Status
Exact canonical semantic-equivalence scheme remains UNSELECTED; no implementation or formal verification.

## Next
AB104.367 — research whether compare-and-swap/version preconditions are sufficient for compensation safety, and what remains UNKNOWN when the target cannot expose an authoritative version frontier.
