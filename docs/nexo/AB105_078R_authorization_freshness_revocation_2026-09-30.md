# AB105.078R — authorization freshness and revocation boundary

Date: 2026-09-30
Chain: AB105.077R -> AB105.078R

## Objective
Determine whether a previously evaluated authorization can be treated as durable across policy changes, credential/session changes, revocation, or execution delay.

## Fresh primary evidence
AWS documents that IAM is eventually consistent: changes can take time to become visible across endpoints. AWS therefore does not support treating a policy change as an instantaneous globally visible authorization boundary. Source: AWS IAM troubleshooting. [turn0search8]
AWS documents that permissions for temporary security credentials are evaluated each time they are used to make an AWS request. AWS also states that policy updates can take a few minutes to take effect. Source: AWS IAM disabling permissions for temporary credentials. [turn0search7]
AWS provides an explicit role-session revocation mechanism. Revoking older sessions adds a deny policy based on session issuance time; AWS documents an approximately 30-second future boundary to account for policy propagation. Cached CLI credentials may need to be refreshed. Source: AWS IAM revoke role sessions. [turn0search0]
AWS IAM Identity Center documents that existing application sessions may persist until refresh, typically within 30 minutes, while existing IAM role sessions can continue until configured expiry, up to 12 hours. [turn0search1] [turn0search10]

## Finding
A prior authorization decision is not inherently durable.
AUTHORIZATION_DECISION(T0, CONTEXT0) != CURRENT_AUTHORITY(T1) unless the system establishes a freshness/enforcement invariant spanning the interval.
REVOCATION_REQUESTED != REVOCATION_ENFORCED_EVERYWHERE.
AUTH_CACHE_HIT != CURRENT_AUTHORITY.

## Normative freshness contract
Every authorization decision intended to authorize a later effect must carry:
- DECISION_ID
- PRINCIPAL_IDENTITY
- ACTION
- RESOURCE
- REQUEST_CONTEXT_DIGEST
- DECISION_STATE
- DECIDED_AT
- POLICY_EVIDENCE_BOUNDARY
- CREDENTIAL/SESSION_ID where applicable
- AUTHORITY_EPOCH or REVOCATION_EPOCH
- FRESH_UNTIL or an explicit RECHECK_REQUIRED rule
- ENFORCEMENT_BOUNDARY
- COVERAGE_SCOPE
- UNKNOWN/partial state

### Decision states
ALLOW
EXPLICIT_DENY
IMPLICIT_DENY
UNKNOWN
STALE
REVOKED

STALE means the decision's freshness contract no longer covers the attempted effect.
REVOKED requires evidence that the relevant authority was revoked under the applicable enforcement boundary; merely issuing a revocation request is insufficient.

## Execution rule
1. Resolve current authority.
2. Verify the decision is within its freshness boundary.
3. Verify authority epoch/revocation state has not advanced.
4. Verify required policy/context inputs remain applicable.
5. Only then authorize the effect.
6. Bind the effect attempt to the authorization decision.
7. Preserve the result independently from the authorization evidence.

If any required freshness/enforcement condition is UNKNOWN, the generic safe state is UNKNOWN/STOP, not implicit ALLOW.

## Critical distinction
AWS demonstrates two different mechanisms: request-time policy evaluation for temporary credentials, and session lifetime for already-established role sessions. Therefore Nexo must not use one universal rule such as re-check once per session or authorization is valid until credential expiry.
Freshness is authority- and mechanism-specific.

## STOP / revocation implication
STOP_REQUESTED != STOP_ENFORCED
REVOCATION_ISSUED != REVOCATION_ENFORCED_EVERYWHERE
CURRENT_AUTH_CACHE != CURRENT_AUTHORITY
VALID_AT_T0 != VALID_AT_T1

A STOP/revocation controller therefore needs an enforcement acknowledgement or independently bounded enforcement evidence before claiming that authority is revoked everywhere relevant.

## Three-branch integration
Physical lifecycle remains independent.
Configuration/drift remains independent.
Causal provenance remains independent.
The new authorization edge is AUTHORITY_EVALUATION -> EFFECT_ATTEMPT, but it does not prove the physical/configuration effect occurred.
The effect ledger should bind DECISION_ID -> OPERATION_ID/operation_id -> EFFECT_EVIDENCE where available. Missing binding remains UNKNOWN.

## Adversarial cases checked
1. Policy changed immediately before effect -> prior decision may be stale.
2. Policy changed but propagation incomplete -> enforcement state may be UNKNOWN.
3. Role session still alive after portal/user change -> current session may retain authority.
4. Revocation issued but not propagated -> REVOCATION_ISSUED != ENFORCED.
5. Cached credentials -> credential presence does not prove current authority.
6. Decision valid at T0, effect at T1 -> validity requires freshness contract.
7. Re-authentication after revocation -> new session may be evaluated under a different authority state.
8. Long-running operation -> authorization to start does not automatically prove authorization for every later side effect.
9. Simulator says ALLOW -> does not establish live enforcement.
10. Missing policy input -> UNKNOWN, not implicit deny.
11. Same principal/resource/action at two times -> not the same authorization decision.
12. Session expiry configured -> expiry does not prove all other revocation mechanisms are satisfied.

No new physical, configuration, or causal generic edge was discovered.

## Status
AUTHORIZATION_EFFECTIVE_PERMISSION_GENERIC_BRANCH = OPEN
New sub-boundary: AUTHORIZATION_FRESHNESS_REVOCATION = NORMATIVELY_DEFINED_WITH_PROVIDER_DEPENDENT_ENFORCEMENT
The generic architecture can now represent freshness and revocation without assuming instantaneous enforcement.

## Next exact direction
AB105.079R — investigate long-running/in-flight effect authorization: whether authorization to start an operation remains sufficient while the operation is executing, and what evidence is required to distinguish AUTHORIZED_TO_START, AUTHORIZED_AT_EXECUTION, IN_FLIGHT_AFTER_REVOCATION, and EFFECT_COMPLETED.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.