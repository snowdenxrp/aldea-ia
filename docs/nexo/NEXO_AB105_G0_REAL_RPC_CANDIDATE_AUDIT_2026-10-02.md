# NEXO AB105 G0 — major archaeology finding 2026-10-02

## Finding
The branch `nexo-ab105-g0-propagation-window-discriminator` contains a materially different harness from the older direct-authorize G0 runtime generations.

Its D1 path creates a real `KafkaProducer` and calls `send(...).get()` after D0. The harness also overrides `StandardAuthorizer.authorize(...)` only to observe the authorization decision, rather than invoking `TARGET.authorize(...)` itself for D1.

This means the propagation-window discriminator is a genuine real-network request path at D1, subject to verification of its complete execution log and artifact. It is therefore the strongest recovered candidate so far for extracting the missing `R1` boundary.

## Reuse classification
- 🟢 Real producer D1 request path: strong reusable base.
- 🟢 Authorization callback observation inside the broker: strong reusable observation point.
- 🟢 D1 result captured from the broker authorization callback: useful.
- 🔵 Existing propagation-window semantics: separate question; must not be conflated with W1→ENQUEUE→DEQUEUE→R1.
- 🔴 Older direct `TARGET.authorize()` generations remain unsuitable for real-RPC ordering evidence.

## Next exact audit
Recover the execution record for the propagation-window discriminator: run/job, commit, raw logs, artifact, and whether the callback observation occurred before/after D1 producer completion. Then compare its instrumentable points against RequestChannel ENQUEUE/DEQUEUE.

## Epistemic state
- Real-RPC D1 candidate: RECOVERED IN SOURCE; execution evidence still needs direct recovery.
- W1→ENQUEUE→DEQUEUE→R1: UNKNOWN.
- AB105.116R unchanged.
- AB105.117R not created.
- TLC not rerun.
