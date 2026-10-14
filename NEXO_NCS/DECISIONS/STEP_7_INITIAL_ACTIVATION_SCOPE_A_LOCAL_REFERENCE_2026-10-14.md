# STEP 7 — Proposed initial activation scope A: local constitutional reference — 2026-10-14

Branch: `ncs-clean-architecture`
Status: PROPOSAL FOR OWNER CONFIRMATION — NOT YET RATIFIED — OPEN / STOP / UNKNOWN

## Recommendation

Recommend scope A as the smallest initial claim: register a local reference to a specific constitutional candidate, without treating that record as legitimate/current constitutional authority and without enabling mission or protected effects.

This recommendation is not an owner decision until explicitly confirmed. It does not freeze a Constitution, recognize a root, choose a verifier or recovery reference, select keys, commission Nexo, or authorize implementation.

## Exact proposed claim

“Nexo can record and later report the identity/reference of a specifically reviewed constitutional candidate, while continuing to treat its legitimacy and currentness as unestablished.”

The reference operation must not:
- mark the candidate as canonical/current/authorized;
- create or establish a Constitution Authority Context;
- authorize missions, `executeAction()`, protected mutations, external actions, or general execution;
- turn a missing, unreadable, malformed, or fallback/default state into an accepted empty constitutional state;
- appoint the file, its hash, the device, the caller, or the persistence mechanism as constitutional authority.

## Proof obligations if the owner confirms this scope

1. Name the exact target and representation being recorded, and the precise meaning of “reference”.
2. Bind any owner review to the exact readable content and scope; do not claim cryptographic authentication not yet established.
3. Distinguish candidate reference from canonical authority and from currentness.
4. Define and prove behavior for first initialization, absence, corruption, malformed content, recovery/default fallback, stale data and revision conflict.
5. Show that the operation has no causal route to mission or protected effects; identify its actual write boundary and evidence of commit/no-effect/unknown.
6. Reuse existing `persistState(expectedRevision)` only for its documented conditional snapshot persistence where applicable; do not treat it as an authority root or invent a second generic store.
7. Keep verifier provenance, canonical currentness/revocation/recovery/succession, protected final sink and bypass closure OPEN for later applicable scopes.

## Current limits

- The owner previously accepted only the bounded assumption that the POCO screen faithfully presents content during the first recognition ceremony. That does not mean a ceremony occurred or that this scope is approved.
- No exact canonical Constitution artifact is frozen.
- No canonical current-Constitution owner or production protected final sink has been demonstrated.
- The observed `executeAction()` path is shared and is not an owner-approved STEP 7 target.

## Decision rule

Wait for explicit owner confirmation or revision before recording this as accepted scope or implementing anything. Silence does not mean approval.

**STEP 7 remains OPEN / STOP / UNKNOWN. No code/tests/keys/signatures/digest/Constitution freeze/ceremony/deployment/runtime authority changed; no protected effects authorized.**
