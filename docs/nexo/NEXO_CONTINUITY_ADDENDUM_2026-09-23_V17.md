# Nexo Continuity Addendum — V17 — 2026-09-23

## V17 result

Integrated abstract revocation and protected-commit ordering as atomic transitions. Revoke-first prevents a later protected commit; commit-first establishes an effect before later revocation. This is an abstract ordering model, not implementation linearizability proof.

## Findings

1. `NoCommitAfterRevocation` was intentionally detected as tautological (`=> TRUE`) and is rejected as evidence.
2. Effect records need to capture the authorization epoch/context at commit; owner+generation alone is insufficient for proving historical authorization across revoke/regrant.
3. Reauthorization must advance a distinct authority epoch if epoch is part of the fencing contract.
4. Revocation is not cancellation and does not prove an external effect stopped. REMOTE_UNKNOWN remains subject to PG-009 reconciliation.
5. A concrete implementation still requires an atomic/linearizable boundary for revoke vs protected commit.

## Promotion status

V17 is rejected for promotion. Next model must bind `authority_epoch` to committed effects, advance it on reauthorization, replace the tautological property with a history-based non-vacuous property, and preserve the explicit revoke-vs-commit linearization rule.

Artifacts:
- V17 model: ff46ef9a9ece12dde1e844ee8a435afab2b9077c
- V17 audit: c89a78ce3da9a0ad03e6eebeb00218cf23c1cc10

Verification status: NOT SANY-VERIFIED / NOT TLC-VERIFIED / NOT IMPLEMENTATION-VERIFIED.
