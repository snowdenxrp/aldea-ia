# NEXO AB105 G0 — Direct JMM race diagnostic design

Date: 2026-10-02 UTC
Pinned Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42
Canonical anchor: AB105.116R (unchanged)

## Purpose
Test the incremental StandardAuthorizerData.aclCache publication boundary without using an auxiliary completion flag or other post-remove synchronization to gate readers.

## Design
- Fresh StandardAuthorizer per trial.
- Install a WRITE ACL and verify baseline authorization.
- Start reader threads before the writer; readers continuously call authorize().
- Writer calls removeAcl() once.
- After removeAcl() returns, writer only performs timing/yield work and does not publish a completion signal to readers.
- Readers continue for a bounded interval and record ALLOWED/DENIED observations.
- Repeat with fresh authorizers at high trial count.

## Interpretation boundary
Timing cannot prove a formal happens-before relation or precisely timestamp a reader result against the writer's return across threads. Therefore this is a stress diagnostic, not a proof of JMM safety.

A reproducible ALLOWED observation after the writer's removal window would be evidence requiring escalation and source/runtime investigation. A zero stale result is only "not observed".

## Forbidden shortcuts
- No AtomicBoolean/volatile completion flag after removeAcl().
- No latch/barrier release after removeAcl().
- No TLC rerun.
- No AB105.117R.
- No modification of AB105.116R.

## Current state
DESIGN=PERSISTED
EXECUTION=PENDING
STALE_ALLOWED=UNKNOWN
PRODUCTION_JMM_BUG=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED
