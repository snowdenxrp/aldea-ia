# AB105 G0 ordering correction audit — 2026-10-02

- AB105.116R unchanged.
- AB105.117R not created.
- TLC not rerun.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.

## Corrections
1. v2 topic/resource-name identifiers corrected: commit 5da2c81bc1ed2ef394be24b4e1093d6b1266c7ea.
2. D0 now records the unique ACL target after asserting exactly one matching ACL: commit fea19d3167c8993e5837cceb616b4535402f590e.
3. W1 now captures the internal StandardAcl before cache removal and logs its UUID plus ACL identity: commit d3dcd5b61724cfaa6440e9bdf6c6f82d17aab65d.
4. ENQUEUE/DEQUEUE/AUTH probes now carry Kafka correlationId: commit 4c8e4422c3ac1fc90b028c7850698ae0128feb04.

## Interpretation
D0 identity is bounded by a fresh single-target ACL and its exact AclBinding. W1 captures the broker's internal UUID/StandardAcl at removeAcl. These are still evidence correlation, not JMM happens-before. ENQUEUE->DEQUEUE is the RequestChannel publication/consumption boundary. W1->R1 remains UNKNOWN until a fresh real-broker run produces raw events and the memory-order argument is separately established.

## Do not execute yet
The v2 injector must be statically reviewed after these edits before runtime execution. No runtime evidence is promoted by this audit.
