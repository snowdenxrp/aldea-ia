# V14 Lease Protected Transitions Audit — 2026-09-23

V14 extends V13 by binding owner/generation fencing to concrete recovery, reconciliation and execution protected transitions.

## V14-A01 — conservative mutual-exclusion guard

Recovery/reconciliation acquisition currently checks the other lease state is not `HELD`, rather than checking `LeaseValid`. Therefore an expired-but-not-yet-transitioned lease can temporarily block acquisition by the other domain. This is conservative and does not create an authority bypass, but it couples progress to explicit expiry processing.

Canonical integration should choose explicitly between:
- state-based exclusion: expired lease blocks until expiry transition is recorded; or
- validity-based exclusion: only a currently valid lease blocks.

The choice must be documented because it affects liveness, not safety.

## V14-A02 — protected fencing now concrete for all three domains

RecoveryProtected, ReconciliationProtected and ExecutionProtected all require current lease validity, exact owner and exact generation, and mutate only their own protected counters. This makes stale-owner/generation rejection represented by actual transition guards rather than a vacuous predicate.

## V14-A03 — generation advancement is structurally explicit

Successful acquire actions, including takeover through the expired branch, increment generation. Expiry preserves generation. A temporal monotonicity proof still requires model checking.

## V14-A04 — expiry boundary is explicit

`ExpiredLease` uses `expiresAt <= now`, so exact-boundary expiry is modeled. `LeaseValid` uses `expiresAt > now`; the boundary belongs to expiration, not validity.

## V14-A05 — no external truth inference

Lease expiry and takeover mutate lease coordination state only. No effect, world, evidence or verification state is changed by the kernel.

## V14-A06 — remaining canonical gaps

The kernel still does not model release authorization consumption, evidence freshness/provenance, authority epochs, STOP/actuation fencing, external effect state, or concrete implementation linearizability/CAS.

## Status

`DESIGN DRAFT / SOURCE-AUDITED / STRUCTURALLY COHERENT LEASE KERNEL / NOT SANY-CHECKED / NOT TLC-CHECKED`
