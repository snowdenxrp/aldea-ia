# AB105.077R — authorization decision provenance / effective-permission contract

Date: 2026-09-30
Chain: AB105.076R -> AB105.077R

## Objective
Select and investigate the next unresolved evidence dependency outside the three closed generic AWS branches.
Chosen dependency: authorization/effective-permission provenance, because Nexo's Claim/Decision model must distinguish what authority was requested, what policy/context was evaluated, what decision was produced, and whether that decision is still applicable at execution time.

## Fresh primary evidence
AWS IAM documents that authorization is evaluated from the request context against multiple applicable policy types. By default requests are implicitly denied; an applicable explicit Deny overrides Allow. Depending on context, evaluation can involve identity-based policies, resource-based policies, permissions boundaries, session policies, Organizations SCPs/RCPs, and other controls. The resulting effective permission is therefore not equivalent to any single policy document.
AWS also documents that cross-account authorization requires successful evaluation in both the trusted and trusting accounts.
AWS's IAM policy simulator can reproduce policy evaluation for supplied inputs, but AWS explicitly warns that simulation results can differ from the live environment and recommends checking against the live environment. The simulator returns binary allow/deny outcomes for tested action/resource pairs.

## Finding
Authorization must be represented as a decision over a concrete request context, not as a static property of an identity or policy.
A stored ALLOW is not sufficient evidence for a later real-world effect unless the evidence also preserves the authorization context and the applicability boundary.

## Normative contract
### AUTHORIZATION_REQUEST
Minimum identity:
- PRINCIPAL_IDENTITY
- ACCOUNT / TRUST_DOMAIN
- ACTION
- RESOURCE
- REQUEST_CONTEXT
- REQUEST_TIME
- AUTHORITY_EPOCH or equivalent freshness boundary, when the architecture supports revocation/epochs

### AUTHORIZATION_INPUT_SET
Record the policy/control classes actually considered:
- IDENTITY_POLICY
- RESOURCE_POLICY
- PERMISSIONS_BOUNDARY
- SESSION_POLICY
- ORGANIZATION_SCP
- ORGANIZATION_RCP
- TRUST_POLICY where applicable
- SERVICE-SPECIFIC_AUTHORIZATION_CONTEXT where applicable

For each input, preserve policy identity/version, retrieval/observation time, source, scope, relevant conditions/context, and completeness state.

### AUTHORIZATION_DECISION
The decision must distinguish:
- ALLOW
- EXPLICIT_DENY
- IMPLICIT_DENY
- UNKNOWN
- PARTIAL

UNKNOWN is required when the model cannot establish that all decision-relevant inputs/context were available.

### EFFECTIVE_AUTHORITY CLAIM
A claim such as PRINCIPAL P MAY PERFORM ACTION A ON RESOURCE R is PROVEN only for the request context and policy/control set represented by the evidence.
It must not be generalized into P ALWAYS MAY A ON R without an independently established invariant.

## Anti-collapse rules
1. POLICY_DOCUMENT != EFFECTIVE_AUTHORITY.
2. IDENTITY_ALLOW != FINAL_ALLOW.
3. ABSENCE_OF_EXPLICIT_DENY != PROVEN_ALLOW.
4. SIMULATION_RESULT != LIVE_AUTHORIZATION_RESULT.
5. HISTORICAL_ALLOW != CURRENT_AUTHORITY.
6. AUTHORIZATION_DECISION != EXECUTION_SUCCESS.
7. EXECUTION_SUCCESS != PROOF_THAT_THE_EXPECTED_POLICY_WAS_USED.
8. ACTOR_IDENTITY != AUTHORIZATION_DECISION.
9. RESOURCE_IDENTITY != AUTHORIZATION_SCOPE.
10. CROSS_ACCOUNT_ALLOW_IN_ONE_ACCOUNT != GLOBAL_ALLOW.
11. MISSING_POLICY_INPUT != IMPLICIT_DENY; it is UNKNOWN unless completeness is proven.
12. POLICY_VERSION_EQUALITY != DECISION_CONTEXT_EQUALITY.

## Nexo relevance
This directly supports the future Nexo authority layer:
Claim -> Decision Contract -> Authorization Evaluation -> Effect Contract

The architecture should preserve the distinction between authority that was granted, authority that was evaluated, authority that is currently valid, and effect that actually occurred.
This is especially important for STOP/revocation semantics: a previously valid authorization cannot by itself prove that a later execution remained authorized.

## Integration with the three closed branches
### Physical lifecycle
AUTHORIZATION_DECISION -> PHYSICAL_EFFECT is not automatic. A successful authorization decision permits an attempted operation; physical lifecycle evidence remains independently required.

### Configuration/drift
AUTHORIZATION_DECISION -> CONFIGURATION_EFFECT is not automatic. A configuration difference does not establish which authorization decision caused it.

### Causal provenance
Authorization is another evidence layer, not a replacement for actor/API provenance. ACTOR_PROVENANCE -> API_REQUEST -> AUTHORIZATION_DECISION -> EFFECT is a desired dependency graph, but each arrow requires its own evidence. No temporal ordering is sufficient.

## Status
AUTHORIZATION_EFFECTIVE_PERMISSION_GENERIC_BRANCH = OPEN
Reason: the generic contract is established, but the architecture still needs a concrete investigation of revocation/freshness and execution-time enforcement before this branch can close.

## Closure boundary
Do not expand into every IAM feature.

Next exact direction:
AB105.078R — authorization freshness/revocation boundary: determine from primary evidence whether a previously evaluated authorization can be treated as durable across policy changes, credential/session changes, revocation, or execution delay; model the resulting freshness boundary for Nexo.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.