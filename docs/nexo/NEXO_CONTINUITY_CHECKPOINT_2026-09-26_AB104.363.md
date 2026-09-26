# NEXO CONTINUITY — AB104.363

AB104.363 persisted. Research only; no implementation.

## Finding
RFC 9334 documents a freshness race: state/policy can change immediately after evidence or attestation results are generated; delayed/reordered epochs can make old evidence appear current. RFC 6024 requires replay detection because old trust-anchor transactions can reintroduce compromised anchors. citeturn0search0turn0search1turn0search2

Therefore:
AUTHORIZED_AT_CHECK != CURRENT_AUTHORITY_AT_EFFECT

Candidate effect-boundary binding:
target_id + target_incarnation + operation_id + semantic_payload_digest + policy_id + policy_epoch + authority_epoch + fence_token

Race:
T0 old policy authorizes
T1 old policy revoked/new policy active
T2 delayed operation reaches effect boundary

Required: stale authority rejected where the mutation boundary enforces the newer frontier. If current frontier cannot be established: UNKNOWN/STOP.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.364 — multi-target emergency revocation and classification of partial effects when targets have different knowledge of the current authority frontier.

## DO-NOT-REPEAT
Do not treat an earlier authorization, valid signature, or fresh-enough attestation as proof of authority at the later external-effect boundary.
