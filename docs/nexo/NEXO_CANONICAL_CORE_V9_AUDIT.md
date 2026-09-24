# V9 Structural Audit — 2026-09-23

V9 was generated from the semantic contract rather than patching V8. A source-level audit was performed immediately after creation.

## Positive corrections

- TLA+ conjunction/disjunction syntax is explicitly represented as `/\\` and `\\/`.
- All previously missing finite record domains are defined.
- `TypeOK` is self-contained over finite state domains.
- Operation, effect binding, authority, evidence and leases are represented as typed records.
- Lease-protected execution/reconciliation actions accept owner+generation parameters.
- Evidence observation is owner/generation bound.
- Release authorization binds exact operation/effect/target/fingerprint, authority epoch and recovery generation.
- Freshness uses finite logical time.
- `Spec == Init /\\ [][Next]_vars` is present.

## V9-A01 — Invalid state invariant after post-commit revocation

`NoCommitDuringInvalidAuthority` currently states:
`COMMITTED => authority.valid`.

But `RevokeAuthority` is currently allowed as a later transition and makes `authority.valid = FALSE` without changing `opState`. Thus a committed operation can reach a state violating the invariant. This is a genuine semantic conflict, not a tooling issue.

Decision: remove this as a state invariant in the next structural revision. The intended property is transition-scoped: a transition into COMMITTED must require current authority. Historical COMMITTED state must not be retroactively uncommitted merely because authority is later revoked.

## V9-A02 — RevokeAuthority is not yet operation-state scoped

The minimal model allows revocation from arbitrary states. That is useful for adversarial exploration but needs explicit semantics for post-commit history versus active execution/recovery. Future revision must distinguish active-operation fencing from historical commit durability.

## V9-A03 — Lease expiry/takeover still absent

Owner+generation is now explicit, but there is no expiry/takeover transition. S01-S04 therefore remain specification obligations rather than executable scenarios.

## V9-A04 — STOP fence is still represented primarily through execution lease revocation

The model does not yet contain a distinct operation/effect actuation fence. STOP blocks release and revokes execution, but external cancellation remains intentionally unmodeled.

## V9-A05 — Provenance remains boolean

`provenance = TRUE` is insufficient for dependency closure, observer identity, freshness provenance, trust root and common-mode analysis. It is retained only for the bounded kernel.

## V9-A06 — Reconciliation evidence can be produced without an explicit observed-world source

`Observe` writes APPLIED directly. This is a deliberate minimal abstraction but must later separate observation from verification and bind provenance/failure domains before being used as a safety claim.

## Status

V9 is a structurally improved bounded draft, but it is **NOT formally verified**. The next revision should correct A01 first, then add lease expiry/takeover and explicit STOP fencing without incrementally accumulating contradictory patches.
