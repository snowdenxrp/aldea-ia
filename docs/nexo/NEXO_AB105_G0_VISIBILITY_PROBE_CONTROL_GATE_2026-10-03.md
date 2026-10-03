# NEXO AB105 G0 — visibility probe control gate — 2026-10-03

## Objective

Establish a control path that exercises the same owner-thread recorder lifecycle, ThreadLocal access, fixed-capacity record path, timestamp capture, and shutdown-time extraction as the visibility experiment, without retaining an aclCache reference.

## Experimental path

At W1:
- existing plain `aclCache = aclCacheSnapshot` remains unchanged.
- immediately afterward the probe records the already-produced `aclCacheSnapshot` reference.

At AUTH:
- existing plain `AclCache aclCacheSnapshot = aclCache` remains unchanged.
- immediately afterward the probe records that already-read reference.

## Control path

At W1:
- same probe call and same ThreadLocal state access.
- record a fixed sentinel object instead of the aclCache reference.

At AUTH:
- same probe call and same ThreadLocal state access.
- record the same fixed sentinel object instead of the aclCache reference.

The control therefore preserves recorder calls, ThreadLocal access, array writes, correlation capture and timestamp capture, while removing the experimental cache-reference retention.

## Required neutrality constraints

- No volatile/atomic publication from W1 to AUTH.
- No latch, barrier, Future, queue, synchronized diagnostic container, shared logger or shared PrintStream.
- No waiting for W1.
- No second aclCache read.
- No cache identity computation during W1/AUTH.
- No allocation during W1/AUTH.
- ThreadLocal state must be initialized before the measured window.
- Flush only on the owner thread after the measured window and shutdown.
- Extraction by the test occurs only after thread termination/join.

## Interpretation

The control is a performance/scheduling control, not a proof of JMM happens-before.

If experiment and control differ materially in ordering behavior, the difference must be treated as instrumentation sensitivity until independently explained.

If the control cannot preserve the same execution structure without introducing a synchronization edge, the visibility result remains UNKNOWN.

## Status

CONTROL_DESIGN = READY_FOR_IMPLEMENTATION_REVIEW
CONTROL_IMPLEMENTATION = NOT_YET_EXECUTED
REAL_BROKER_VISIBILITY_WITNESS = NOT_STARTED

AB105.116R remains frozen. No TLC rerun. No AB105.117R. PR #94 remains unmerged.
