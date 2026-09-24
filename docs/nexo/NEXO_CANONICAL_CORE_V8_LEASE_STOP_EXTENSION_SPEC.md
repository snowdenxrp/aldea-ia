# V8 Lease/STOP Extension Specification — 2026-09-23

This document defines the next extension without claiming implementation or formal verification.

## Lease lifecycle

`FREE -> HELD(generation) -> EXPIRED -> HELD(new_generation)`

Rules:
- acquire is atomic and increments generation exactly once;
- expiry changes ownership eligibility, not external-world truth;
- stale owner generation cannot mutate reconciliation/recovery state;
- recovery and reconciliation leases are mutually exclusive;
- execution lease is fenced by STOP and authority revocation.

## STOP/effect race obligations

For every operation/effect:
- STOP before execution admission blocks admission;
- STOP during execution revokes the execution fence and invalidates release authorization;
- STOP during EXTERNAL_UNKNOWN does not imply cancellation or NO_EFFECT;
- STOP after verified external APPLIED prevents release until a new explicit recovery/reconciliation path establishes the required post-stop state;
- stale release authorization cannot commit after STOP;
- authority revocation has the same fencing dominance over stale owners.

## Required counterexamples

S01 double recovery acquire
S02 stale recovery owner after takeover
S03 double reconciliation acquire
S04 stale reconciliation owner after takeover
S05 recovery/reconciliation simultaneous acquisition
S06 STOP before commit
S07 STOP after authorization before commit
S08 authority revoke after authorization
S09 lease expiry after evidence verification
S10 lease takeover with fresh evidence
S11 lease takeover with stale evidence
S12 STOP while external effect UNKNOWN

## Design boundary

This extension must not be merged into the canonical kernel until the V8 baseline has an actual SANY/TLC result or an explicitly documented toolchain blocker. Static design is not formal verification.
