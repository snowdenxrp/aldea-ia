# V16 Audit — 2026-09-23

V16 introduces explicit REVOKED semantics and a serialization witness for acquisition attempts.

## V16-A01 — revoked is no longer equivalent to expired

Acquire actions admit only FREE or EXPIRED. REVOKED requires an explicit reauthorization transition. This closes the V15 re-entry hole.

## V16-A02 — reauthorization is privileged

Reauthorization is modeled as its own transition and increments generation. In the integrated architecture, the authorization source for this transition must be separate from the ordinary lease holder; otherwise revocation could be undone by the same authority it revoked.

## V16-A03 — serialization witness is only a model placeholder

`acquireSeq` demonstrates that acquisition attempts have a serialized state transition in the TLA+ model, but it does not prove an implementation has linearizable compare-and-swap/transaction semantics. A concrete adapter must supply that guarantee.

## V16-A04 — important concurrency boundary

The model checks only current time validity for mutual exclusion. Two competing acquisitions are serialized by the abstract Next relation, but implementation-level race freedom remains an explicit refinement obligation.

## V16-A05 — revoke vs protected action is not yet integrated

V16 does not contain the protected action/effect model. Therefore it does not yet prove that a revoke racing with a protected action has a defined linearization order. The canonical integration must specify whether revoke-before-linearization blocks the action and whether action-before-linearization remains committed.

## V16-A06 — reauthorization must not resurrect stale authority

Reauthorization increments generation. Any previously captured owner+generation tuple must therefore fail future protected guards after reauthorization.

## Status

`DESIGN DRAFT / SOURCE-AUDITED / NOT SANY-CHECKED / NOT TLC-CHECKED / NOT IMPLEMENTATION-VERIFIED`
