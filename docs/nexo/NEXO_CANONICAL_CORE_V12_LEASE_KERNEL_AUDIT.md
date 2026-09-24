# V12 Lease Kernel Immediate Audit — 2026-09-23

V12 correctly binds lease actions to the actual state variables and adds explicit FREE/EXPIRED takeover paths. However, source inspection found a direct guard contradiction before any formal execution.

## V12-A01 — ExpireLease guard is impossible

RecoveryExpire, ReconciliationExpire, and ExecutionExpire require both `LeaseValid(...)`, whose definition includes `expiresAt > now`, and `expiresAt <= now`. Their conjunction is unsatisfiable.

Consequently none of the three expiry transitions can ever occur. The intended condition must be `state = HELD /\\ expiresAt <= now`, without `LeaseValid`.

## V12-A02 — NoReleaseAfterRecoveryLoss is not a transition invariant

The property requires every state with an invalid recovery lease to have `releaseValid = FALSE`. That is stronger than needed and can conflict with representing historical authorization metadata. The canonical contract should make release authorization unusable at the protected transition, while deciding explicitly whether its record is invalidated eagerly at expiry.

## V12-A03 — stale-generation property remains vacuous

`NoLeaseActionFromStaleGeneration == TRUE` proves nothing. The protected-action predicates are correctly parameterized, but no actual transition currently consumes them. The integrated kernel must attach those predicates to concrete protected transitions.

## V12-A04 — execution/reconciliation mutual exclusion is incomplete by design

Recovery and reconciliation are mutually exclusive, but execution is not excluded from either. That may be intentional, but it must be an explicit policy decision in the canonical effect model rather than an accidental omission.

## Decision

V12 is rejected for formal checking. Do not patch the contradiction in place. V13 should reconstruct expiry with a dedicated `Expired(lease)` predicate, separate coordination validity from expiration detection, and make takeover and stale-owner fencing executable through concrete protected transitions.

Status: V12 DESIGN DRAFT / SOURCE-AUDITED / REJECTED FOR FORMAL CHECKING / NOT SANY-CHECKED / NOT TLC-CHECKED.
