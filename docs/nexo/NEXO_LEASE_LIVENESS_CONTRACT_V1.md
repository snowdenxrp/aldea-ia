# Nexo Lease Liveness Contract V1 — 2026-09-23

## Decision

The canonical coordination semantics use **time-based validity** for mutual exclusion, not a requirement that an explicit `Expire` transition be processed first.

Definitions:
- `LeaseValid(L,t) := state(L)=HELD /\\ expiresAt(L)>t`
- `LeaseExpired(L,t) := state(L)=HELD /\\ expiresAt(L)<=t`

For recovery/reconciliation mutual exclusion:
`ValidRecovery(o,t) => not ValidReconciliation(o,t)` and vice versa.

An expired lease therefore ceases to block a competing acquisition at its expiry boundary, even if a bookkeeping `Expire` transition has not yet executed.

## Safety consequence

Time-based validity does **not** grant external-effect truth, authority, or release permission. It only determines current coordination ownership. Every protected transition still requires the exact owner/generation and a current validity check.

## Progress consequence

An implementation must obtain a sufficiently reliable time source for lease validity. If time cannot be trusted or freshness cannot be established, critical coordination must enter HOLD/RESTRICTED rather than silently treating the lease as valid or expired.

## Atomicity requirement

Acquire/takeover must linearize against competing acquisitions. A concrete implementation needs an atomic compare-and-swap, transactional conditional write, consensus-backed primitive, or equivalent serialization. TLA+ atomic actions do not prove implementation linearizability.

## Takeover rule

A takeover is permitted only when the prior lease is time-expired and the acquisition linearizes successfully. The new generation is strictly greater than the previous generation. Stale owner+generation pairs cannot perform protected transitions.

## Expire bookkeeping

An explicit `Expire` transition may still be used to materialize historical state, trigger cleanup, or release resources. It is not the source of lease invalidity; the expiry timestamp is.

## Recovery/reconciliation interaction

Both domains use the same time-validity rule, while their leases remain distinct. Holding one valid lease prevents acquisition of the other. Expiry removes that coordination exclusion but does not validate or invalidate existing external-effect evidence by itself.

## Status

`SPECIFIED / ARCHITECTURAL DECISION / NOT FORMALLY VERIFIED / NOT IMPLEMENTATION-VERIFIED`
