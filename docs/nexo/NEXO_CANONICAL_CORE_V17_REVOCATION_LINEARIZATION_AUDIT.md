# V17 Audit — 2026-09-23

## V17-A01 — linearization point is explicit

The abstract model treats `Revoke` and `ProtectedCommit` as atomic transitions. If `Revoke` occurs first, `CurrentAuth` becomes false and a later protected commit cannot execute. If `ProtectedCommit` occurs first, the effect is committed before the later revocation. This gives the abstract system a total order between the two transitions.

## V17-A02 — this is not yet an end-to-end safety theorem

`NoCommitAfterRevocation` is currently tautological because its right-hand side is `TRUE`. It must not be presented as proof. A non-vacuous property must relate the effect history/count to the revocation/authorization epoch, or introduce an explicit commit epoch recorded with each effect.

## V17-A03 — authority epoch must bind the commit

The current ProtectedCommit checks owner+generation but does not capture `authorityEpoch` in the committed effect. Therefore the model cannot yet distinguish a legitimate commit made before revocation from an effect whose metadata is stale after a later reauthorization. The integrated effect record needs `authorityEpoch` (or equivalent authorization context) captured at commit.

## V17-A04 — reauthorization creates a new authorization epoch

The current draft increments generation but leaves authorityEpoch unchanged during reauthorization. This is a semantic hole if epoch is intended to fence authorization across revocation/regrant. Reauthorization must advance a distinct authority epoch, or the model must prove generation alone is the complete fencing domain.

## V17-A05 — STOP/revoke is not cancellation

Revocation blocks future protected commits in the abstract coordination model; it does not cancel an already committed external effect, nor prove that a remote operation stopped. PG-009 semantics therefore remain required: unknown remote effects must reconcile rather than be assumed cancelled.

## Status

`DESIGN DRAFT / SOURCE-AUDITED / REJECTED FOR PROMOTION / NOT SANY-CHECKED / NOT TLC-CHECKED`
