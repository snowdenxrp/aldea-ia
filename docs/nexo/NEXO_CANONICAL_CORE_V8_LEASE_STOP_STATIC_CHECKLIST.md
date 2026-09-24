# V8 Lease/STOP Static Consistency Checklist — 2026-09-23

## Results

- S01/S03 mutual exclusion: represented by `state = FREE` acquisition guards and opposite-lease exclusion; concurrent implementation atomicity remains unproven.
- S02/S04 stale-owner fencing: generation field exists, but V8 has no owner-bound mutation actions after takeover; extension must add explicit owner+generation parameters.
- S05 recovery/reconciliation mutual exclusion: represented in acquisition guards; atomicity remains an implementation obligation.
- S06/S07 STOP invalidation: `RequestStop` clears release authorization; commit also checks current STOP via `ReleaseEligible`.
- S08 authority revocation: invalidates evidence and release authorization; commit checks current epoch/validity through `ReleaseEligible`.
- S09/S10 evidence after lease expiry: V8 has no lease expiry yet, so behavior is specified externally rather than implemented.
- S11 stale evidence: logical time can move evidence to STALE; `ReleaseEligible` requires fresh valid evidence.
- S12 UNKNOWN during STOP: effect state is not rewritten by STOP, preserving UNKNOWN semantics.

## Remaining blockers for implementation

1. Owner+generation fencing must be explicit on every lease-protected action.
2. Lease expiry and takeover must be modeled.
3. STOP needs an explicit operation/effect fence state rather than only lease revocation.
4. Material graph/trust-root changes should be added after baseline.
5. Evidence provenance currently uses a boolean and must become a finite structured snapshot before claiming dependency independence.

No formal pass is claimed.
