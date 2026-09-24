# V19 Audit — 2026-09-23

V19 adds explicit sequence numbers to committed effects and revocation, plus an abstract independent Admins set for reauthorization.

## V19-A01 — historical ordering is now representable

A committed effect carries the authority epoch observed at commit. A later revoke advances the current epoch, so `effect.authorityEpoch < authorityEpoch` can represent commit-before-revoke without pretending revocation erased history.

## V19-A02 — revoke-before-commit is still authorization failure

A stale `(owner,generation,epoch)` tuple cannot satisfy `CurrentAuth` after revocation. This makes the pre-commit revoke case explicit at the guard boundary.

## V19-A03 — independent reauthorization path is modeled but not authorized semantically

An `Admins` domain exists, but the current predicate `admin \in Admins` is only membership. It does not yet model capability possession, separation-of-duty, approval quorum, or compromise resistance. This remains an architecture contract, not a proof.

## V19-A04 — commitSeq/revokeSeq are not yet a single total order

Separate per-operation counters do not establish a common linearization clock. The canonical model needs one serialization domain or a comparable ordering relation if cross-event order is required. Do not infer order by comparing unrelated counters.

## V19-A05 — Reauthorize adminEpoch check is tautological

`adminEpoch[o] = adminEpoch[o]` proves nothing and must not be treated as an authorization check. It is deliberately flagged for removal/replacement.

## V19-A06 — external effects remain separate

Local commit ordering still does not prove remote effect state. PG-009 UNKNOWN/reconciliation semantics remain mandatory.

## Status

`DESIGN DRAFT / SOURCE-AUDITED / NOT SANY-CHECKED / NOT TLC-CHECKED / NOT IMPLEMENTATION-VERIFIED`
