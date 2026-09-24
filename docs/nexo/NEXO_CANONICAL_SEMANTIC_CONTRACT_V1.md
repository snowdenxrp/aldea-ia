# NEXO Canonical Semantic Contract V1 — 2026-09-23

## Decision

A critical release decision is a derived predicate, not a persisted authority bit.

Conceptually:

ReleaseEligible(o,t) =
  LifecycleReady(o)
  AND ExactEffectBinding(o,t)
  AND CurrentAuthority(o)
  AND CurrentSafetyContext(o)
  AND FreshValidEvidence(o,t)
  AND NoBlockingDependency(o)
  AND NoStopFence(o)
  AND CurrentCoordinationFence(o)

Each conjunct is independently observable and invalidatable.

## Evidence semantics

Evidence has two dimensions that must not be collapsed:

- observation state: what an observer reported;
- verification state: whether the report satisfies the verification procedure.

OBSERVED is not VERIFIED.
VERIFIED is not permanent.
A material context change can invalidate previously verified evidence.

## Lease semantics

A lease is a coordination capability with fencing metadata.

Lease validity means current owner is recognized, generation/token is current, and lease has not expired/revoked.

Lease validity does not mean external effect happened, external effect did not happen, cancellation succeeded, or world state is safe.

## Authority semantics

Authority is independently versioned.

A valid historical authorization does not imply current authorization.
An epoch change can fence cached authorization without rewriting historical evidence.

## Invalidation semantics

Evidence must be re-evaluated when any material input changes, including authority epoch, policy/invariant version, dependency graph, relevant trust root, target identity/fingerprint, effect binding, freshness deadline, or provenance validity.

The implementation must define materiality explicitly rather than treating every version change as equivalent.

## Concurrency semantics

Protected coordination operations require an atomic linearization point or an equivalent serialization mechanism.

At minimum:
- lease acquisition;
- lease takeover/expiry;
- authority revoke;
- STOP;
- release authorization;
- commit.

The canonical model must show which order wins when two operations race.

## External-effect semantics

After a request crosses an external boundary, timeout or lost acknowledgement produces epistemic UNKNOWN unless independent evidence establishes the outcome.

Retries require an explicit idempotency/replay policy and exact effect identity.

## Assurance semantics

Independence is scoped to a safety claim and its dependency closure.
Different processes, models or services are not automatically independent if they share relevant failure domains, roots, state, data, semantics or authority.

## Non-goals

This contract does not claim physical safety certification, implementation equivalence, distributed-system linearizability of arbitrary external systems, formal verification before SANY/TLC execution, or security merely from schema validity/signatures.

## Status

DESIGNED/SPECIFIED only.
Implementation: pending.
Runtime tests: NOT RUN.
SANY/TLC: NOT RUN.
