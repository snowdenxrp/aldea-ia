# AB105 G0 visibility probe — owner-thread audit — 2026-10-03

Pinned Kafka: 99b940733a9f6bc409457dba7108f08421d81e42

## MetadataLoader

MetadataLoader owns a KafkaEventQueue and documents that it maintains its own thread for all publisher callbacks.

handleCommit enqueues work onto that event queue; publisher callbacks therefore execute on the MetadataLoader event-handler thread.

close() calls beginShutdown() then eventQueue.close(). KafkaEventQueue.close() joins the event-handler thread. The queue's cleanup event runs on that same owner thread before the thread exits.

Conclusion: a MetadataLoader-side thread-confined diagnostic record can potentially be retained until owner-thread shutdown, then extracted only after join. This does not require a W1->AUTH synchronization edge during D1.

## Processor

SocketServer Processor is a Runnable with its own KafkaThread. processCompletedReceives() calls requestChannel.sendRequest(req) on the Processor thread.

Processor.run() loops while shouldRun is true and, in finally, executes closeAll() on the same Processor thread.

Important limitation: Processor shutdown lifecycle is controlled by shouldRun and its owning SocketServer; this audit does not yet prove the test harness can deterministically stop and join exactly the relevant Processor after D1 without changing the race window.

## Scientific status

Potentially viable:
- MetadataLoader owner-thread capture: candidate.
- Processor owner-thread capture: candidate, but lifecycle/join path still needs audit.

Not established:
- visibility of W1 to Processor-side authorization;
- stale read;
- incorrect authorization;
- JMM happens-before W1->request publication.

No implementation and no experiment run.
AB105.116R unchanged.
