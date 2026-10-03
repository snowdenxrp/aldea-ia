# NEXO AB105 G0 — visibility probe compile gate — 2026-10-03

## State
- Branch: `nexo-ab105-g0-visibility-probe`
- Base/anchor remains AB105.116R.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- PR #94: UNMERGED.
- Pinned Kafka: `99b940733a9f6bc409457dba7108f08421d81e42`.
- Implementation commit: `006b5b1049a211a1f971daed487d98c1c7df7133`.

## What was implemented for compile-only validation
- Workflow: `.github/workflows/nexo-ab105-g0-visibility-probe-compile.yml`.
- Recorder is embedded in `StandardAuthorizerData` to avoid adding a cross-module helper dependency.
- Recorder is ThreadLocal and preallocated before the measured path.
- W1 retains the exact `AclCache` object produced by the existing plain assignment.
- AUTH retains the exact `AclCache` object already obtained by the existing plain read.
- Correlation timestamps are recorded locally with `System.nanoTime()`; no timestamp is published between threads.
- MetadataLoader initializes the recorder on its owner/event-queue path before publisher callbacks and flushes only from the owner-thread shutdown event.
- Processor initializes at owner-thread run entry and flushes in its owner-thread finally block.
- External extraction is intended only after owner-thread termination/join.
- No latch, barrier, Future, shared collection, volatile/atomic diagnostic publication, shared logger, shared PrintStream, or W1 signal was introduced.
- No real broker test is executed by this workflow.

## Purpose of this gate
This commit validates that the isolated instrumentation can be compiled against the pinned Kafka source before any real-broker visibility experiment is attempted.

## Important epistemic boundary
Compilation is NOT evidence about cache visibility, stale reads, incorrect authorization, exploitability, generalization, or security impact.

## Next action
Inspect the compile result. If compilation fails, fix only the isolated harness/instrumentation and rerun compile-only. If compilation succeeds, perform a separate semantic/diff review before creating any real-broker execution workflow.

## DO-NOT-REPEAT
Do not modify AB105.116R, create AB105.117R, rerun TLC, merge PR #94, or claim a visibility result from the compile gate.
