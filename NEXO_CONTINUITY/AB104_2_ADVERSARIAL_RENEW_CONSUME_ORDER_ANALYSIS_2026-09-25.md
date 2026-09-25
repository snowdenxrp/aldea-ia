# AB104.2 — Adversarial Renewal / Consumption Order Analysis

Status: RESEARCH ONLY. This is a semantic audit of evidence-supported orderings, not a claim that all listed orders are legal protocol traces.

## Source basis
AB20 identifies renewal/expiry, policy/admit, delegation/admit, incarnation/admit and replay after invalidation as claim-relevant trace families. AB49 identifies L3 renewal, L4 replay/consumption, L5 invalidation and L7 renewal authority as separators. AB54/AB84 leave the complete successor law unresolved. AB100 keeps ReplayState separate from lease_valid while marking LEASE_CONSUME semantics UNKNOWN.

## Order matrix

| Ordering | What can be concluded from recovered evidence | Result |
|---|---|---|
| LEASE_EXPIRE -> LEASE_RENEW | Expiry is claim-relevant; whether an expired lease is renewable is unresolved | UNKNOWN |
| POLICY_CHANGE -> LEASE_RENEW -> ADMIT | Policy compatibility and renewal are claim-relevant; exact renewal/rebinding rule is unresolved | UNKNOWN |
| DELEGATION_CHANGE -> LEASE_RENEW -> ADMIT | Delegation compatibility is claim-relevant; renewal repair/retention law unresolved | UNKNOWN |
| RESOURCE_REINCARNATE -> LEASE_RENEW -> ADMIT | Incarnation compatibility is claim-relevant; renewal replacement/binding law unresolved | UNKNOWN |
| LEASE_RENEW -> ADMIT | Admission requires a valid complete bridge, but renewal's resulting bridge/post-state is unresolved | UNKNOWN |
| LEASE_CONSUME -> RETRY/REUSE | Consumption/replay is a canonical separator; complete consumption legality and retry inheritance are unresolved | UNKNOWN |
| AUTH_REVOKE -> LEASE_CONSUME -> ADMIT | Revocation and consumption are independently claim-relevant; complete ordering/post-state law is unresolved | UNKNOWN |
| LEASE_CONSUME -> ADMIT | Attempt-scoped replay identity is represented conservatively, but complete consume-to-admission semantics are unresolved | UNKNOWN |

## Key adversarial result
The ordering audit does NOT reveal a concrete P_AA collision because a concrete collision requires two legal concrete histories plus complete enough successor semantics to demonstrate differing future observations. The recovered record instead shows that the same candidate order can remain semantically undecidable because C2/C3/C6 are incomplete.

## Important negative finding
No evidence supports treating any of these unresolved cases as KNOWN_EMPTY. Likewise, no evidence supports selecting extension, replacement, bridge retention, bridge rebinding, or retry inheritance as the actual law.

## Model-design consequence
AB20's admission linearization alternatives remain a separate unresolved semantic choice: atomic authorization-at-admit, lease/fence interval validity, or explicit recheck. LEASE_RENEW cannot safely be interpreted as implementing one of these merely from its read-set.

## Gate status
LEASE_RENEW completeness: OPEN / UNKNOWN.
LEASE_CONSUME completeness: OPEN / UNKNOWN.
TERNARY_PAA_COLLISION: UNKNOWN.
286-triple expansion: BLOCKED.
SEMANTIC_FREEZE: NOT_DECLARED.
FORMAL_VERIFICATION: NOT_PERFORMED.
AB65_EXECUTION: NOT_VERIFIED.
