# V15 Lease Liveness Audit — 2026-09-23

## V15-A01 — liveness decision is now explicit

Mutual exclusion is based on `LeaseValid`, so an expired lease stops blocking a competing acquisition at the time boundary even before an explicit cleanup transition.

## V15-A02 — no external truth inference

Expiry only changes coordination eligibility. It does not assert effect absence, cancellation, rollback, or safety.

## V15-A03 — remaining vacuous property

`ExpiryDoesNotChangeOtherDomain` is currently a tautological expression and must not be retained as a claimed invariant. The action definitions already constrain unchanged variables; the canonical model should express this through transition correspondence or a non-vacuous state relation.

## V15-A04 — revoked-state admission is unresolved

The generic `~LeaseValid` guard would permit acquisition from `REVOKED` because REVOKED is not valid. Canonical semantics must distinguish ordinary expiry from explicit revocation. A revoked lease cannot be treated as merely expired; re-entry requires an explicit reauthorization/reset transition.

## V15-A05 — exact simultaneous acquisition

Both RecoveryAcquire and ReconciliationAcquire can be enabled in the same pre-state when both leases are invalid. TLA+ chooses one atomic Next action per step, so the model represents a serialization point. An implementation must supply an equivalent atomic/linearizable primitive; otherwise both may succeed in a race.

## Status

`DESIGN DRAFT / SOURCE-AUDITED / NOT SANY-CHECKED / NOT TLC-CHECKED`

V15 is not promoted as the canonical kernel until REVOKED semantics and the non-vacuous proof surface are corrected.
