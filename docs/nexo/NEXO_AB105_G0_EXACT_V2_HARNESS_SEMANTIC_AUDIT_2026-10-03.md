# NEXO AB105 G0 — exact v2 harness semantic audit — 2026-10-03

## Confirmed from exact workflow source
The v2 workflow is race-neutral with respect to W1: it does not wait for or observe W1 before issuing D1.

However, a more precise statement is required: D1 is not merely an independently scheduled request. The Java test performs `admin.deleteAcls(...).all().get()` and only then calls `produce(producer)`. Therefore D1 publication is program-order after the client-side D0 completion future returns.

This creates a client-side ordering constraint:
D0_RETURN -> produce(producer) -> network request -> Processor -> ENQUEUE.

It still does NOT establish:
W1 -> D0_RETURN
or
W1 -> ENQUEUE.

The real witness therefore establishes temporal W1 < ENQUEUE in the observed executions, while the source-level JMM edge W1 -> ENQUEUE remains UNKNOWN.

## Important distinction
The older bootstrap harness used direct `TARGET.authorize(...)` for D1 and is not the basis for the v2 network witness.
The v2 harness uses KafkaProducer and the real broker RequestChannel path.

## Current epistemic state
OBSERVED:
- real broker/network D1 path
- W1 < ENQUEUE < DEQUEUE < AUTH temporally in the recorded 10/10 cycles
- D1 DENIED 10/10
- D0_RETURN can precede W1 (cycles 4/5)
- no W1-gating primitive in the v2 harness

UNKNOWN:
- W1 -> D0_RETURN JMM edge
- W1 -> ENQUEUE JMM edge
- W1 -> authorization-reader visibility
- stale read after W1
- incorrect authorization consequence
- exploitability/generalization/production impact

NOT ESTABLISHED:
- security vulnerability
- JMM violation

## Frozen
AB105.116R unchanged; AB105.117R not created; TLC not rerun; PR #94 unmerged.

## Next action
Audit the client completion/network publication path only for whether it can carry a happens-before edge from target-broker W1. Do not infer one from `.get()`, socket I/O, timestamps, or successful DENIED. No new witness run yet.
