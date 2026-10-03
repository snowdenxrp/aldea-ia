# NEXO AB105 G0 — Visibility probe capture decision — 2026-10-03

## Finding

The exact production read is:

`AclCache aclCacheSnapshot = aclCache;`

The desired observation is the object reference captured by AUTH, plus the object reference assigned by W1.

## Candidate capture methods

1. Shared volatile/atomic holder — REJECTED: creates a publication edge.
2. Shared synchronized collection/queue/Future/latch/barrier — REJECTED: creates synchronization and/or scheduling coupling.
3. Shared System.err/PrintStream — REJECTED: previous neutrality audit already identified this as unsafe for causal measurement.
4. ThreadLocal only — NEUTRAL during the race, but currently insufficient for extraction from the broker JVM after the relevant threads continue running.
5. Per-thread pre-opened diagnostic files — potentially neutral with respect to JMM publication between W1 and AUTH, but introduces I/O/scheduling overhead and therefore requires a separate neutrality/baseline assessment.
6. JFR/thread-local diagnostic infrastructure — potentially suitable, but must be audited for recording overhead and publication behavior before use.

## Decision

Do NOT implement yet.

The next task is to determine whether an existing broker-side diagnostic mechanism can retain thread-confined records and expose them only after the measured D1 window without introducing a W1→AUTH synchronization edge.

If none qualifies, the correct scientific result is that the visibility experiment is not safely measurable with this harness, and the claim remains UNKNOWN.

## Frozen

AB105.116R unchanged. AB105.117R not created. No TLC rerun. No workflow execution.
