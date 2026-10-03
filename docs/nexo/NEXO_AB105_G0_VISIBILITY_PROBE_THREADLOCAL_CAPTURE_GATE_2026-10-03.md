# AB105 G0 — Thread-confined capture implementation gate — 2026-10-03

Pinned Kafka: 99b940733a9f6bc409457dba7108f08421d81e42.

## Exact probe points

W1:
- in StandardAuthorizerData.removeAcl()
- immediately after the plain assignment `aclCache = aclCacheSnapshot`
- record `System.identityHashCode(aclCacheSnapshot)` in a ThreadLocal recorder.

D1:
- in findAclRule()
- immediately after `AclCache aclCacheSnapshot = aclCache`
- record `System.identityHashCode(aclCacheSnapshot)` in the Processor-thread ThreadLocal recorder.

This captures the actual object selected by authorization, not merely a later field read.

## Race neutrality requirements

Forbidden during the D1 window:
- W1 signal/latch/volatile publication;
- shared recorder;
- synchronized recorder;
- shared PrintStream/logging;
- queue/Future/barrier;
- waiting for W1;
- reading ThreadLocal from another thread.

The recorder must be thread-confined and must not publish its state until after the client-side D1 result has completed.

## Extraction

Owner threads flush their own recorder only during their existing shutdown/termination path, after D1 has completed. The test reads the resulting diagnostics only after broker shutdown joins.

## Baseline requirement

Because even thread-local bookkeeping can alter instruction count and scheduling, a control run without identity capture is required before interpreting any identity mismatch. The capture run must also preserve the same 10-cycle structure and no W1-triggered coordination.

## Interpretation

W1 identity == D1 identity: no instance of reading a different cache object observed.

W1 identity != D1 identity: D1 selected a different cache object than the one installed by the observed W1. This is evidence of a distinct snapshot, not automatically proof of a stale/incorrect authorization.

Any result remains bounded to the exact harness/topology/runtime.

## Gate

Do not execute until the final diff is reviewed for:
1. no shared state;
2. no W1-to-D1 synchronization;
3. owner-thread-only flush;
4. shutdown strictly after D1 result;
5. baseline/control retained.

AB105.116R unchanged. No TLC. No AB105.117R.
