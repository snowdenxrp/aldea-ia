# NEXO AB104.361 — Policy rotation during active conflict V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS separates the Relying Party Owner, its appraisal policy, and the Relying Party's authorization decision. It also states that an updated policy must itself be securely obtained and that freshness is policy-defined; policy/state can change immediately after evidence generation. citeturn0search0 Trust-anchor stores must resist unauthorized modification, and certificate-path changes can alter what is currently acceptable. citeturn0search0

## Finding
A policy rotation occurring while an authority conflict is unresolved creates two separate questions:
1. which policy was authoritative when the conflict was detected/resolved;
2. whether the new policy is allowed to govern that historical conflict.

A new policy must not silently rewrite an already authenticated historical resolution. Conversely, an old policy must not authorize a new conflict merely because its signature remains valid.

Candidate policy-transition record:
policy_id + predecessor_policy_id + policy_version + authority_epoch + scope + activation_frontier + supersession_digest + conflict_resolution_rules_digest + dependency_closure + freshness + status

Candidate states:
CURRENT | HISTORICAL_ONLY | PENDING_ACTIVATION | SUPERSEDED | REVOKED | SCOPE_MISMATCH | UNKNOWN | CONFLICT

## Rule
Policy applicability is evaluated against the conflict's detection frontier and the policy's authenticated activation frontier.

- conflict before activation → old policy may govern, subject to its validity/scope;
- conflict after activation → new policy may govern;
- conflict straddling transition → do not infer applicability from timestamps alone; require an authenticated transition boundary;
- missing activation/supersession coverage → UNKNOWN/STOP;
- historical resolution remains immutable evidence even if its policy is later superseded/revoked.

Invariants:
POLICY_SIGNATURE_VALID != POLICY_CURRENT
POLICY_CURRENT != RETROACTIVE
SUPERSEDED_POLICY != ERASED_HISTORY
NEW_POLICY != AUTOMATICALLY_VALID_FOR_OLD_CONFLICT

## Nexo implication
Policy versions become recovery-frontier components, analogous to authority epoch, target incarnation and semantic version. A conflict-resolution certificate should bind the exact policy version and activation frontier used. This preserves historical reproducibility without allowing old policy to regain execution authority.

## Status
Exact transition protocol, clock/frontier mechanism, emergency policy replacement and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.362 — study emergency policy revocation/replacement during unresolved conflicts and how to prevent both stale-policy execution and unsafe policy rollback.
