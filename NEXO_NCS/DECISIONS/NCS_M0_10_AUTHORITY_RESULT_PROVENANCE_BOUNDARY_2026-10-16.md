# NCS M0.10 — Authority result shape vs. provenance boundary

**Date:** 2026-10-16  
**Status:** `BLOCKED / UNKNOWN` for legitimate owner-authority verification.  
**Scope:** Bounded inspection of `src/nexo/core/contracts.mjs`, `src/nexo/core/protected-transition.mjs`, `src/nexo/core/ownership.mjs`, and `tests/nexo/protected-transition.test.mjs` on branch `ncs-clean-architecture`.

## Finding

`createAuthorityResult(status, { reasons, evidence })` restricts `status` to `AUTHORIZED`, `STOP`, or `UNKNOWN`, then freezes the supplied reasons/evidence. It does not authenticate the producer, validate evidence provenance, bind the result to an owner-controlled authority reference, or establish the authority's validity/scope/revocation state.

`executeProtectedTransition()` checks that the returned object has a recognized `status`. When status is `AUTHORIZED`, it proceeds to snapshot isolation, candidate execution, semantic validation, and conditional commit. The transition's local checks therefore rely on the authority-gate port to provide a trustworthy decision; the result shape itself does not prove that trust.

The positive test setup in `tests/nexo/protected-transition.test.mjs` injects an `authorityGate.check` function that returns `createAuthorityResult(AUTHORITY.AUTHORIZED)`. This is a structural/composition test, not proof of legitimate owner authority.

## Preserved fail-closed behavior

When the authority result is `UNKNOWN`, `executeProtectedTransition()` returns the `UNKNOWN` outcome before snapshot isolation, candidate execution, semantic validation, or commit. The test verifies zero calls to those later ports for this injected unknown result.

When no authority gate is configured, `createCorePorts()` defaults it to a `NOT_IMPLEMENTED` failure; the test verifies that the later ports are not called. This demonstrates fail-closed behavior for the missing-port case, not for every possible misconfigured or dishonest authority-gate implementation.

## Decision

- Do not treat a syntactically valid `AUTHORIZED` result as proof of constitutional owner authority.
- Do not add a new authority ID, signature format, key registry, trust anchor, or ad hoc evidence schema as a speculative patch.
- Do not integrate this result into runtime, adapter, persistence, or protected-effect paths on the strength of current tests.
- Keep Step 7 at `OPEN / STOP / UNKNOWN`; no commissioning or protected effects.

## Evidence boundary

This was a bounded code-and-test review, not an exhaustive repository-wide search, cryptographic verification, production composition trace, or bypass-closure proof. It does not establish that an exploit exists; it identifies an unclosed trust assumption in the current contract boundary.

## Next bounded action

Inspect the existing ownership/authority design records and any already-defined owner-reference or verification contract before proposing an implementation. Reuse existing decisions and evidence; if no suitable contract exists, document that absence and stop for a root-level design decision rather than inventing a patch.
