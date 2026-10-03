# NEXO AB105 G0 — Post-window shutdown capture audit — 2026-10-03

## Result

Audited pinned Kafka `99b940733a9f6bc409457dba7108f08421d81e42` `KafkaEventQueue`.

`KafkaEventQueue.EventHandler.run()` executes `handleEvents()`, then `cleanupEvent.run()` when the event-handler thread exits.

`KafkaEventQueue.close()` performs `beginShutdown()` and then `eventHandlerThread.join()`.

Therefore a thread-owned diagnostic buffer can, in principle, be flushed by the owner thread during/after queue shutdown, with the test joining only after the measured D1 operation has completed.

## Important limitation

This is NOT yet proof that the complete MetadataLoader/Processor lifecycle can be instrumented safely. We still need to audit:
- exact MetadataLoader queue ownership and close path;
- exact Processor thread lifecycle/termination path;
- whether both relevant owners can flush their own buffers after D1;
- whether the test harness shutdown occurs only after the D1 result is fully returned;
- whether any proposed flush itself changes the measured W1→AUTH window.

## Scientific status

Post-window owner-thread capture is now a viable candidate mechanism.

It is not evidence of visibility and no run was performed.

AB105.116R unchanged.
AB105.117R not created.
TLC not rerun.
