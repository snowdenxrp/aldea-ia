# NEXO AB104.363 — Execution-boundary emergency-policy race V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 9334 explicitly notes a race: Attester state or appraisal policies can change immediately after Evidence/Attestation Results are generated. It therefore treats freshness as an architectural property and notes that an old epoch can be delayed/reordered. citeturn0search0turn0search1 RFC 6024 requires replay detection for trust-anchor management because replay can reintroduce compromised anchors. citeturn0search2turn0search4

## Finding
A pre-effect authorization check is not sufficient when policy revocation can occur between authorization and the external effect. Nexo must conceptually separate:
AUTHORIZED_AT_CHECK
→ EFFECT_ATTEMPT
→ EFFECT_COMMIT
and bind the effect attempt to the current authority frontier.

Candidate execution admission tuple:
(target_id, target_incarnation, operation_id, semantic_payload_digest, policy_id, policy_epoch, authority_epoch, fence_token)

At the actual effect boundary, the target/effect mediator must reject a stale authority/policy epoch or fence. A valid earlier authorization remains historical evidence, not proof of current authority.

## Critical race
T0: operation authorized under P_old / epoch E
T1: P_old revoked; P_new activated
T2: delayed operation reaches effect boundary

Required result: stale operation is rejected if the boundary enforces the newer authority frontier. If the target cannot establish which frontier is current, outcome is UNKNOWN/STOP rather than assuming either commit or non-commit.

## Important limitation
Fencing closes stale-authority execution only when the actual mutation boundary enforces the fence/version. RFC 9334 itself does not specify Nexo's fencing mechanism; exact protocol remains UNSELECTED. citeturn0search0

## Status
No implementation. No formal verification. Emergency-policy hierarchy and exact fencing protocol remain OPEN.

## Next
AB104.364 — research multi-target emergency revocation: how to classify partial effects when one target rejects the old epoch while another cannot establish the current frontier.
