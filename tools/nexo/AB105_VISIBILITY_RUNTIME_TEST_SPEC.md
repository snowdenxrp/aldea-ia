# AB105 G0 visibility runtime witness — implementation gate

Pinned Kafka: 99b940733a9f6bc409457dba7108f08421d81e42

## Required runtime shape
1. One broker and one controller, SASL_PLAINTEXT.
2. Ten create/allow/delete/deny cycles, matching the established ordering witness schedule.
3. Experiment and control use the identical harness and lifecycle.
4. W1 and AUTH capture only the already-read/installed AclCache reference.
5. Capture remains thread-confined until owner-thread shutdown cleanup.
6. No latch, barrier, Future, queue, volatile/atomic publication, synchronized diagnostic container, shared logger, or W1 wait/signal.
7. Evidence extraction occurs only after the owner threads terminate and the test-side join boundary completes.
8. Missing/truncated/ambiguous records are UNKNOWN.

## Interpretation
- Same cache identity at W1 and AUTH: no stale-read instance observed in that cycle; not a JMM guarantee.
- Different cache identity: D1 selected a different cache object than the W1-installed object; this alone does not prove stale or incorrect authorization.
- D1 DENIED plus differing identity: runtime observation only; correctness/security impact remains UNKNOWN.
- Control must preserve the same recorder call structure and lifecycle while substituting a fixed sentinel.

## Gate
Runtime witness is not considered complete until both experiment and matched control execute successfully and their raw records are retained.
