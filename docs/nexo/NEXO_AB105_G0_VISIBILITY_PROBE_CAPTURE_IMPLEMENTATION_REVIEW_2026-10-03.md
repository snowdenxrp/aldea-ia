# AB105 G0 — Capture implementation review — 2026-10-03

## Review result

The measurement point is safe to instrument only if the recorder remains entirely thread-confined.

### W1
Location: StandardAuthorizerData.removeAcl(), immediately after:
`aclCache = aclCacheSnapshot;`

Record:
- cycle-independent event type W1;
- System.identityHashCode(aclCacheSnapshot);
- System.nanoTime() only as auxiliary temporal evidence.

### D1
Location: StandardAuthorizerData.findAclRule(), immediately after:
`AclCache aclCacheSnapshot = aclCache;`

Record:
- AUTH_CACHE_READ;
- System.identityHashCode(aclCacheSnapshot);
- System.nanoTime() only as auxiliary temporal evidence.

The D1 record therefore identifies the exact immutable cache object used for both checkSection calls.

## Important correction

Do not use identityHashCode as the sole proof of object equality if the implementation can avoid it. The stronger implementation is to retain the reference in the thread-confined recorder and compute identityHashCode only when flushing after the race. This avoids extra object-header work at the measured probe point.

However, retaining the reference extends the lifetime of the immutable cache object until thread shutdown. That is acceptable for a diagnostic probe only if bounded to the single measured event and documented as instrumentation overhead.

## Minimal recorder shape

One ThreadLocal recorder per executing Kafka thread, with a fixed single-event slot:
- event kind;
- Object reference;
- timestamp;
- optional correlation id.

No shared map of Thread -> recorder.

At W1 and AUTH_READ, only the current thread's recorder is mutated.

At owner-thread shutdown, that same thread serializes its own recorder.

## Gate status

PASS for conceptual race neutrality.
NOT YET IMPLEMENTED because the exact owner-thread flush hook still must be placed without changing the production shutdown path.

No workflow run.
No TLC.
AB105.116R unchanged.
