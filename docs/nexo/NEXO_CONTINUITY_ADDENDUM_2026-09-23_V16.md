# Nexo Continuity Addendum — V16 — 2026-09-23

## PG-009 / Lease + revocation + serialization

V16 follows the V15 decision that lease validity is time-based while explicit expiry is bookkeeping. It introduces an explicit `REVOKED` state that is not admitted by ordinary acquire/takeover. Re-entry from `REVOKED` requires a distinct reauthorization transition and increments generation.

The model also adds an `acquireSeq` serialization witness. This is deliberately not treated as implementation linearizability: a concrete system must provide an atomic conditional write/CAS, transactional serialization, consensus-backed primitive, or equivalent boundary.

### Findings

- REVOKED is not EXPIRED.
- `~LeaseValid` is insufficient as an acquisition predicate.
- Reauthorization must be governed separately from ordinary lease ownership, or revocation could be undone by the authority it was intended to stop.
- Reauthorization increments generation, invalidating previously captured owner+generation tuples.
- Abstract TLA+ atomic transitions do not prove distributed implementation linearizability.
- Revoke racing with a protected action remains unresolved until the canonical effect/action model defines the linearization order.
- Existing external-world uncertainty semantics remain unchanged: lease turnover/revocation does not prove cancellation, absence, rollback, or world safety.

### Artifacts

- `docs/nexo/formal/NEXO_CANONICAL_CORE_V16_REVOKED_SERIALIZATION.tla` — commit `ca22be2611705ec2fda6628395fae9e4e5162d21`
- `docs/nexo/NEXO_CANONICAL_CORE_V16_REVOKED_SERIALIZATION_AUDIT.md` — commit `b597ede4cc174462688777593755b27fe3a472fb`

### Status

V16 is a DESIGN DRAFT, SOURCE-AUDITED, NOT SANY-CHECKED, NOT TLC-CHECKED, and NOT IMPLEMENTATION-VERIFIED.

Next required work: integrate revocation/reauthorization with the concrete protected action and release/effect model; explicitly model revoke-vs-action races; then verify that stale generations cannot commit after reauthorization or ownership transfer.
