# V20 Audit — 2026-09-23

## V20-A01 — common ordering domain

V20 replaces unrelated commitSeq and revokeSeq counters with one monotonic clock. Commit, revoke, and reauthorization each consume a next clock value in the abstract model. This gives a common order domain for local authorization events.

## V20-A02 — important limitation

The global clock is an abstract serialization primitive. It does NOT prove a distributed implementation can assign a unique linearization point. The implementation contract must bind this variable to an actual transactional/consensus/CAS serialization mechanism.

## V20-A03 — effect context remains historical

The committed effect stores the authority epoch and linearization point observed at commit. Later revocation therefore cannot erase the fact that the effect was authorized under an earlier epoch.

## V20-A04 — revoke-before-commit is structurally blocked

After revocation advances authorityEpoch, an old (owner,generation,epoch) tuple fails CurrentAuth. This blocks the stale protected commit at its authorization guard.

## V20-A05 — reauthorization path still too weak

adminId membership plus admin.enabled is not sufficient evidence of authorization. We still need an explicit reauthorization capability, scope, expiration, anti-self-revocation/self-recovery rule, and preferably independent approval/separation-of-duty semantics.

## V20-A06 — clock semantic limitation

Revoke and ProtectedCommit are separate abstract actions. The model serializes them by step. That is acceptable as an abstract linearization model, but a refinement proof must establish that exactly one concrete operation owns each linearization slot.

## V20-A07 — external-world state remains outside the clock

The clock orders local authorization events; it does not establish remote effect completion, cancellation, rollback, or safety. PG-009 reconciliation remains required for REMOTE_UNKNOWN.

## Status

DESIGN DRAFT / SOURCE-AUDITED / STRUCTURALLY COHERENT ABSTRACT ORDER / NOT SANY-CHECKED / NOT TLC-CHECKED / NOT IMPLEMENTATION-VERIFIED
