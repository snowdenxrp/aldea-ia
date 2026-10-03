# AB105 G0 — Processor shutdown capture audit — 2026-10-03

Pinned Kafka: 99b940733a9f6bc409457dba7108f08421d81e42

## Finding

Processor has an owner-thread shutdown path:

- Processor.beginShutdown(): atomic shouldRun -> false, then selector wakeup.
- Processor.close(): beginShutdown(), thread.join(), then cleanup.
- Processor.run(): finally executes closeAll() on the Processor owner thread.

Acceptor shutdown:
- Acceptor.beginShutdown() sets its own shouldRun false and calls beginShutdown() on every Processor.
- Acceptor.close() joins the Acceptor thread, then calls Processor.close() for each processor.
- SocketServer.stopProcessingRequests() calls beginShutdown() and close() on each acceptor.

Therefore the Processor itself has a deterministic owner-thread termination point followed by a join.

## Critical caveat

The shutdown is an external control action that necessarily ends the live request-processing loop. It is suitable for extracting thread-confined diagnostic state only AFTER the D1 measurement window has closed. It must not be invoked as part of W1 detection, authorization completion, or any synchronization used to decide D1.

A candidate harness can:
1. run the race without W1 signaling;
2. finish/record D1 result through the existing client-side completion path;
3. only then initiate broker shutdown;
4. join Processor/MetadataLoader owner threads;
5. extract their thread-confined diagnostic files/buffers.

This does not establish visibility. It only establishes a potentially non-causal post-window extraction path.

## Status

Post-window owner-thread extraction: VIABLE CANDIDATE.
W1 -> Processor read visibility: UNKNOWN.
Stale aclCache observation: UNKNOWN.
Incorrect authorization: UNKNOWN.
No experiment run.
AB105.116R unchanged.
