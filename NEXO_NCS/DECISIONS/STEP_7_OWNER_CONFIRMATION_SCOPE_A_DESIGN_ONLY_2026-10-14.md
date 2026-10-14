# STEP 7 — Owner confirmation of initial scope A — 2026-10-14

Branch: `ncs-clean-architecture`

## Decision recorded

The owner replied “Si lo crees correcto continúa” to the recommendation to adopt scope A while explicitly prohibiting mission authorization and protected effects.

Interpretation: scope A is accepted as the initial work objective. This authorizes continued design and evidence work for A only. It does not authorize implementation before the target and boundaries are evidenced, and it does not authorize Constitution freeze/commissioning, keys, signatures, digests, a recognition ceremony, Constitution Authority Context, missions, or protected effects.

## Accepted claim

“Nexo can record and later report the identity/reference of a specifically reviewed constitutional candidate, while continuing to treat its legitimacy and currentness as unestablished.”

## Prohibitions

The local reference must not:
- mark the candidate canonical, current, or authorized;
- establish a Constitution Authority Context;
- authorize missions, `executeAction()`, protected mutations, external actions, or general execution;
- turn missing, unreadable, malformed, or fallback/default state into an accepted empty constitutional state;
- make the file, hash, device, caller, or persistence mechanism the constitutional authority.

## Minimum proof gate before implementation

1. Identify the exact target, representation and meaning of “reference”.
2. Bind any owner review to the exact readable content and scope without claiming authentication not yet established.
3. Distinguish candidate reference from legitimacy, canonical authority and currentness.
4. Specify and prove behavior for initialization, absence, corruption, malformed content, fallback/default recovery, stale data and revision conflict.
5. Identify the real write boundary and prove no causal route to missions/protected effects; classify commit, no-effect and unknown outcomes honestly.
6. Reuse `persistState(expectedRevision)` only for its demonstrated conditional snapshot persistence; do not invent another generic store or authority root.
7. Keep verifier provenance, currentness/revocation, recovery/succession, protected final sink and bypass closure OPEN where applicable.

## Stop conditions

The exact canonical Constitution remains unfrozen. No canonical current-Constitution owner or production protected final sink has been demonstrated. `executeAction()` remains a shared mutation path and is not an approved target. If the real write boundary and no-effect boundary cannot be established from source without a superficial patch, STOP and redesign the root architecture before implementation.

The previously accepted POCO honest-presentation premise remains bounded to a possible first recognition ceremony; it is not technical proof and no ceremony is claimed to have occurred.

**Status: scope intent accepted; technical readiness UNKNOWN. STEP 7 remains OPEN / STOP / UNKNOWN. No code/tests/keys/signatures/digest/Constitution freeze/ceremony/deployment/runtime authority changed; no protected effects authorized.**
