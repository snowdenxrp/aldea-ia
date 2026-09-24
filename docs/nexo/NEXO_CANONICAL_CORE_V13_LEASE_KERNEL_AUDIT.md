# V13 Lease Kernel Audit — 2026-09-23

V13 removes the V12 expiry contradiction by separating `LeaseValid` from `ExpiredLease`, and it adds a concrete protected transition consuming owner/generation/expiry.

## V13-A01 — expiry/takeover reachability corrected

`ExpiredLease(l)` is defined as HELD with `expiresAt <= now`, independently from `LeaseValid`. Expiry and takeover are therefore reachable at the boundary.

## V13-A02 — generation is advanced on acquisition/takeover

All successful acquire/takeover actions assign generation to the prior generation plus one; expiry preserves generation. This is stronger than the prior nonnegative-only property, although a temporal theorem still requires model checking.

## V13-A03 — stale-owner fencing now reaches a concrete transition

`ProtectedAction` requires current execution lease validity, exact owner and exact generation. A stale owner/generation therefore cannot satisfy its guard. This is still a model-level guard, not implementation linearizability.

## V13-A04 — remaining gap: recovery/reconciliation protected transitions

The kernel currently demonstrates fencing on execution only. Recovery and reconciliation owner/generation guards need concrete protected transitions in the integrated canonical model.

## V13-A05 — remaining gap: release authorization

V13 is a lease kernel, not the full release/effect/evidence model. It intentionally does not yet model release authorization consumption, evidence freshness, policy invalidation, or external-effect truth.

## V13-A06 — execution/recovery/reconciliation policy

Execution is not mutually excluded with recovery/reconciliation in this kernel. That must be resolved by the integrated operation-state machine; it is not silently assumed here.

## V13-A07 — no vacuous expiry invariant

The previous vacuous expiry property is absent. Expiry actions explicitly leave all non-lease state unchanged.

## Status

`DESIGN DRAFT / SOURCE-AUDITED / STRUCTURALLY COHERENT CANDIDATE / NOT SANY-CHECKED / NOT TLC-CHECKED`

Next gate: integrate this kernel into the canonical effect/evidence/release model, add recovery/reconciliation protected transitions, then attempt actual toolchain validation if a TLA+ checker becomes available.
