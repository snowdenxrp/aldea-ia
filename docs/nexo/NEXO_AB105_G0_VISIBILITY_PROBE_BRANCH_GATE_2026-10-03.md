# NEXO AB105 G0 — Visibility probe branch gate — 2026-10-03

Branch: nexo-ab105-g0-visibility-probe
Base: a3aaae3a7839b2ab079b90991231fd42f622e2f1

This branch is an isolated design/instrumentation workspace. No production workflow was changed and no run was triggered.

## Gate before code instrumentation
The exact authorization read is `AclCache aclCacheSnapshot = aclCache`. The probe must observe the value after that production read, not replace the field or synchronize around it.

Allowed:
- thread-local or thread-owned diagnostic capture after the production read;
- immutable cycle/request metadata already available locally;
- post-window reconciliation.

Forbidden:
- volatile/atomic replacement of `aclCache`;
- synchronization around W1 or AUTH;
- W1-to-AUTH latches, barriers, futures, queues, callbacks or shared diagnostic variables;
- shared PrintStream/System.err as causal transport;
- changing D1 from the real network path.

## Execution gate
Do not run until the complete diff has been reviewed for these properties. This commit contains no probe code; it only establishes the isolated branch and gate.

Frozen: AB105.116R unchanged; AB105.117R not created; TLC not rerun; PR #94 unmerged.
