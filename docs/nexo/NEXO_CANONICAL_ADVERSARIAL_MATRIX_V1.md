# NEXO Canonical Adversarial Matrix V1 — 2026-09-23

Purpose: define executable/model-checkable adversarial obligations before claiming the canonical core is correct.

| ID | Race / fault | Required result |
|---|---|---|
| A01 | two recovery acquisitions | at most one linearizes; other is denied |
| A02 | stale recovery owner after takeover | denied by generation/owner fence |
| A03 | two reconciliation acquisitions | at most one linearizes |
| A04 | recovery vs reconciliation acquisition | mutual exclusion; no dual ownership |
| A05 | reconciliation lease expires | ownership lost; durable evidence not automatically erased |
| A06 | fresh evidence after takeover | new owner must revalidate current context before release |
| A07 | stale evidence after takeover | release denied |
| A08 | authority revoke after evidence VALID | release authorization invalidated |
| A09 | policy version changes after evidence VALID | material claim requires revalidation |
| A10 | dependency graph changes after evidence VALID | material claim requires revalidation |
| A11 | trust root compromised after evidence VALID | affected assurance invalidated/restricted |
| A12 | dependency becomes UNKNOWN | critical release blocked/held |
| A13 | evidence effect A presented for effect B | denied |
| A14 | target fingerprint mismatch | denied |
| A15 | network timeout after external request | external state UNKNOWN; no automatic NO_EFFECT |
| A16 | STOP before release linearizes | release cannot commit |
| A17 | release before STOP linearizes | stop still fences subsequent execution; external reconciliation remains required |
| A18 | authority revoke during recovery | stale recovery owner cannot release |
| A19 | restart from checkpoint | state restoration does not restore authority |
| A20 | new operation ID after unresolved old effect | cannot erase prior uncertainty |
| A21 | same trust root across observers | no false independence |
| A22 | same manipulated data source across observers | no false corroboration |
| A23 | compromised snapshot used as independent recovery source | independence claim restricted |
| A24 | valid artifact signature + incompatible policy/config | admission denied/quarantined |
| A25 | lease expiry + valid evidence | ownership changes, evidence semantics preserved |
| A26 | evidence verification races authority revoke | one ordering point; no release under revoked epoch |
| A27 | evidence verification races dependency compromise | post-compromise release blocked/revalidated |
| A28 | reconciliation observation without verification | cannot produce release-eligible evidence |
| A29 | stale owner commits after takeover | denied |
| A30 | duplicate commit attempt | requires explicit state/idempotency guard; never infer impossibility from a boolean alone |

## Required properties

1. **No authority from evidence:** evidence validation never creates authority.
2. **No truth from ownership:** lease ownership never establishes external effect state.
3. **No release from observation alone:** OBSERVED is insufficient.
4. **Exact identity:** operation/effect/target/fingerprint must match.
5. **Version validity:** authority/policy/invariant/dependency versions must be current for the claim.
6. **Temporal validity:** freshness must be evaluated at decision time.
7. **Fence validity:** owner + generation + lease validity must be current at every protected transition.
8. **Revocation dominance:** authority revocation invalidates stale release paths.
9. **STOP dominance:** once STOP linearizes before a release transition, that release cannot commit.
10. **Unknown is not absence:** communication ambiguity cannot become NO_EFFECT.
11. **Recovery does not restore authority:** checkpoint/restart cannot bypass current admission.
12. **Independence is claim-scoped:** shared failure domains, roots, state, semantics or data constrain assurance.

## Current status

This matrix is a test specification, not test results.

SANY/TLC: NOT RUN.
Runtime tests: NOT RUN.
No property is claimed PASS until executed against the canonical model/implementation.
