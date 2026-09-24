# V8 Lease/STOP Scenario Semantics V1 — 2026-09-23

This artifact converts the S01-S12 obligations into explicit precondition/postcondition contracts. It is a test specification, not a formal verification result.

| ID | Ordering | Required result |
|---|---|---|
| S01 | acquire recovery twice concurrently | exactly one HELD owner; second admission denied |
| S02 | owner A acquires, expires, B acquires, A acts | A action denied; B generation remains authoritative |
| S03 | acquire reconciliation twice concurrently | exactly one HELD owner |
| S04 | reconciliation A expires, B takes over, A reconciles | denied by owner+generation fence |
| S05 | recovery and reconciliation acquire concurrently | at most one domain HELD; loser denied |
| S06 | STOP before COMMIT | commit denied; authorization invalidated |
| S07 | authorize release, then STOP | commit denied even with previously valid authorization |
| S08 | authorize release, then authority revoke | commit denied; stale authority epoch cannot be reused |
| S09 | evidence verified, lease expires | evidence does not imply ownership; release requires current coordination conditions |
| S10 | lease takeover with still-fresh exact evidence | evidence may remain usable if all identity/version/freshness predicates remain valid; ownership must be new generation |
| S11 | takeover with stale evidence | release denied; re-observation/re-verification required |
| S12 | STOP while external effect UNKNOWN | local execution fenced; external state remains UNKNOWN until independent reconciliation |

## Cross-scenario invariants

L1. `generation` identifies lease ownership epoch, not truth of the external world.
L2. Lease expiry never establishes `NO_EFFECT`, `CANCELLED`, `REVERSED`, or `ABSENT`.
L3. STOP invalidates release authorization immediately at its linearization point.
L4. Authority revocation invalidates authorization and fences stale authority epochs.
L5. A stale owner cannot act even if its process is still alive.
L6. Evidence can survive lease expiry only as evidence; validity is recomputed against current context.
L7. Recovery and reconciliation ownership are coordination domains, not authority grants.
L8. `UNKNOWN` is a blocking epistemic state for release, not a synonym for false.

## Linearization obligations

The implementation must provide an atomic/serialized linearization point for:
- recovery acquire;
- reconciliation acquire;
- lease expiry/takeover;
- STOP enforcement;
- authority revoke;
- release authorization;
- commit.

The TLA+ model can represent these as atomic actions, but that does not prove a concrete implementation primitive is linearizable.

## Negative assertions

No scenario may infer:
- process exit => external cancellation;
- timeout => no external effect;
- lease expiry => effect absence;
- new owner => new authority;
- new operation ID => prior effect uncertainty erased;
- second observer => independent evidence without dependency separation.

Status: SPECIFIED, NOT IMPLEMENTED, NOT EXECUTED.
