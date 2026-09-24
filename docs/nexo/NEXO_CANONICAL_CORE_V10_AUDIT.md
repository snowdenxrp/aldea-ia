# V10 Immediate Structural Audit — 2026-09-23

Direct inspection after generation of V10 found the following issues. V10 is not being promoted to a formal-check candidate yet.

## V10-A01 — Expired lease has no takeover path

The lease state includes `EXPIRED`, but `AcquireRecovery`, `AcquireReconciliation`, and `AcquireExecution` require `FREE`. Therefore expiry can strand the coordination domain permanently. A dedicated takeover transition or an acquisition guard accepting `EXPIRED` with `expiresAt <= now` is required.

## V10-A02 — Release authorization survives recovery expiry

`ExpireRecovery` changes the recovery lease to `EXPIRED` but does not invalidate `releaseAuth`. `Commit` correctly refuses because it requires a current HELD recovery lease and matching generation, so this is not an immediate authorization bypass. Nevertheless, retaining an apparently valid authorization after its required coordination lease expires creates stale-state ambiguity. Canonical semantics should explicitly invalidate authorization at recovery expiry, or define it as valid-but-unusable historical state.

## V10-A03 — Execution expiry leaves operation state unchanged

This is safe for the modeled guard because `StartExecution`/`MarkUnknown` require a HELD lease. However, the operation state does not record that execution ownership expired. Future recovery/reconciliation logic must explicitly handle this condition rather than infer it from lease state.

## V10-A04 — STOP is not an actuation fence

V10 revokes the execution lease on enforcement but has no independent `actuationFence` state. This preserves the distinction between local execution fencing and remote cancellation, but does not yet model an independent enforcement boundary.

## V10-A05 — Acquisition does not consistently check STOP/authority context

Execution acquisition currently lacks an explicit STOP guard in V10. Recovery/reconciliation acquisition also do not encode the complete safety-context policy. These guards must be scoped deliberately: containment/recovery work may be allowed during STOP, while execution/release must remain blocked.

## V10-A06 — Provenance remains boolean

Still insufficient for the canonical dependency/common-mode contract.

## Decision

Do not patch these issues into V10 piecemeal. V11 should define a generic finite coordination-lease transition relation with explicit `Acquire`, `Expire`, `Takeover`, owner/generation fencing, authorization invalidation, and operation-scoped STOP/actuation fence semantics.

Status: V10 DESIGN DRAFT / AUDITED / NOT SANY-CHECKED / NOT TLC-CHECKED.
