# NEXO AB105 G0 — archaeology pass 2: real-RPC generations and ordering gap

Date: 2026-10-02

## Results

### 1. `nexo-ab105-g0-runtime-exec-corrected`
This workflow is materially reusable. Its `TargetAuthorizer.authorize()` delegates to `super.authorize()` and observes the result. D1 is performed through a real `KafkaProducer` using `send(...).get()` after the Admin ACL deletion. There is no `TARGET.authorize()` direct call in the recovered workflow source.

Classification: 🟢 real broker/RPC D1 path; 🔵 authorization callback observation; 🔴 not yet an ordering witness because RequestChannel ENQUEUE/DEQUEUE are not instrumented.

### 2. `nexo-ab105-g0-multibroker-discriminator`
Also uses a real Producer D1 and target-broker authorization callback. It additionally waits for the target broker's local ACL count to reach zero and verifies broker leadership before D1. This is useful for separating controller completion/local target state from the request path.

Classification: 🟢 real D1; 🟢 target-local revocation observation; 🔵 multibroker discriminator; still lacks RequestChannel ENQUEUE/DEQUEUE evidence.

### 3. `nexo-ab105-g0-jmm-publication-discriminator`
Despite having a real Producer in the harness, the D1 measurement also contains a direct `TARGET.authorize(...)` call. Therefore it cannot be accepted as a clean real-RPC witness for D1.

Classification: 🔴 semantic shortcut for the specific D1 claim.

### 4. `nexo-ab105-g0-runtime-api-fix-v2`
Contains a direct `targetAuthorizer.authorize(...)` D1 call. It is therefore not the missing real-RPC ordering evidence.

Classification: 🔴 direct-authorize shortcut.

### 5. `nexo-ab105-g0-current-compile-gate`
The compile gate is useful infrastructure and contains authorization callback instrumentation, but its declared runtime evidence explicitly says `G0_RUNTIME=NOT_EXECUTED` and `EXACT_RACE=UNKNOWN`. It cannot supply runtime ordering evidence.

Classification: 🟢 compile/API surface evidence; 🔴 no runtime witness.

## Important synthesis
We now have a recovered, corrected real-RPC D1 harness that can be reused as the behavioral base. The missing scientific discriminator is narrower than the previous search suggested:

`D0 → W1 → ENQUEUE → DEQUEUE → R1`

The corrected runtime harness establishes the network request reaches broker authorization, but does not establish the queue publication/consumption ordering relative to W1. The existing ordering-witness workflow supplies the missing RequestChannel instrumentation, but has not yet produced a successful raw execution.

Therefore the cleanest path is not to invent another G0 runtime. It is to combine the already-corrected real-RPC harness semantics with the existing RequestChannel instrumentation, while preserving the exact D0/W1 distinction.

## Epistemic state
- Historical real-RPC D1 source path: 🟢 RECOVERED.
- Historical real-RPC execution result for `runtime-exec-corrected`: NOT YET RECOVERED FROM RAW RUN/ARTIFACT.
- RequestChannel ENQUEUE/DEQUEUE execution evidence: NOT RECOVERED.
- W1→R1 global HB: UNKNOWN / NOT IDENTIFIED.
- D0→W1: not interchangeable.
- Cache identity and authorize-snapshot diagnostics: already completed; do not repeat.
- AB105.116R: unchanged.
- AB105.117R: not created.
- TLC: not rerun.
